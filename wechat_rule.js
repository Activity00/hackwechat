// file: sample.js
//规则文件中，除了summary，都是由 co 驱动的，
// 函数需要满足yieldable。可以返回promise或使用generator函数

module.exports = {
  // 模块介绍
  summary: 'my customized wechat rule for AnyProxy',
  // 发送请求前拦截处理
  *beforeSendRequest(requestDetail) { /* ... */ },
  // 发送响应前处理
  *beforeSendResponse(requestDetail, responseDetail) {
      if(/mp\/getmasssendmsg/i.test(requestDetail.url)){//当链接地址为公众号历史消息页面时(第一种页面形式)
            if(responseDetail.response.body.toString() !== ""){
                try {//防止报错退出程序
                    var reg = /msgList = (.*?);/;//定义历史消息正则匹配规则
                    var ret = reg.exec(responseDetail.response.body.toString());//转换变量为string
                    HttpPost(ret[1],requestDetail.url,"getMsgJson");//这个函数是后文定义的，将匹配到的历史消息json发送到自己的服务器

                    var http = require('http');
                    http.get('http://127.0.0.1:8000/getWxHis', function(res) {//这个地址是自己服务器上的一个程序，目的是为了获取到下一个链接地址，将地址放在一个js脚本中，将页面自动跳转到下一页。后文将介绍getWxHis的原理。
                        res.on('data', function(chunk){
                           //callback(chunk+serverResData);//将返回的代码插入到历史消息页面中，并返回显示出来
                            // var newResponse = Object.assign({}, responseDetail.response);
                            var newResponse = chunk+responseDetail.response.body;
                            return {
                                response: newResponse
                            };
                        })
                    });
                }catch(e){//如果上面的正则没有匹配到，那么这个页面内容可能是公众号历史消息页面向下翻动的第二页，因为历史消息第一页是html格式的，第二页就是json格式的。
                     try {
                        var json = JSON.parse(responseDetail.response.body.toString());
                        if (json.general_msg_list != []) {
                        HttpPost(json.general_msg_list,requestDetail.url,"getMsgJson");//这个函数和上面的一样是后文定义的，将第二页历史消息的json发送到自己的服务器
                        }
                     }catch(e){
                       console.log(e);//错误捕捉
                     }
                    //callback(serverResData);//直接返回第二页json内容
                    return responseDetail
                }
            }
        }else if(/mp\/profile_ext\?action=home/i.test(requestDetail.url)){//当链接地址为公众号历史消息页面时(第二种页面形式)
            try {
                var reg = /var msgList = \'(.*?)\';/;//定义历史消息正则匹配规则（和第一种页面形式的正则不同）
                var ret = reg.exec(responseDetail.response.body.toString());//转换变量为string
                console.log('aaaaaaaaaa');
                HttpPost(ret[1],requestDetail.url,"getMsgJson");//这个函数是后文定义的，将匹配到的历史消息json发送到自己的服务器
                console.log('bbbbbbbbbbbb');

                var http = require('http');
                http.get('http://localhost:8000/getWxHis', function(res) {//这个地址是自己服务器上的一个程序，目的是为了获取到下一个链接地址，将地址放在一个js脚本中，将页面自动跳转到下一页。后文将介绍getWxHis的原理。
                    res.on('data', function(chunk){
                        //callback(chunk+responseDetail);//将返回的代码插入到历史消息页面中，并返回显示出来
                        var newResponse = chunk+responseDetail.response.body;
                            return {
                                response: newResponse
                            };
                    })
                });
            }catch(e){
                console.log('cccccccccc');
                return responseDetail;
            }
        }else if(/mp\/profile_ext\?action=getmsg/i.test(requestDetail.url)){//第二种页面表现形式的向下翻页后的json
            try {
                var json = JSON.parse(responseDetail.response.body.toString());
                if (json.general_msg_list != []) {
                    HttpPost(json.general_msg_list,requestDetail.url,"getMsgJson");//这个函数和上面的一样是后文定义的，将第二页历史消息的json发送到自己的服务器
                }
            }catch(e){
                console.log(e);
            }
            return responseDetail;
        }else if(/mp\/getappmsgext/i.test(requestDetail.url)){//当链接地址为公众号文章阅读量和点赞量时
            try {
                HttpPost(responseDetail.response.body,requestDetail.url,"getMsgExt");//函数是后文定义的，功能是将文章阅读量点赞量的json发送到服务器
            }catch(e){

            }
            return responseDetail;
        }else if(/s\?__biz/i.test(requestDetail.url) || /mp\/rumor/i.test(requestDetail.url)){//当链接地址为公众号文章时（rumor这个地址是公众号文章被辟谣了）
            try {
                var http = require('http');
                http.get('http://localhost:8000/getWxPost', function(res) {//这个地址是自己服务器上的另一个程序，目的是为了获取到下一个链接地址，将地址放在一个js脚本中，将页面自动跳转到下一页。后文将介绍getWxPost的原理。
                    res.on('data', function(chunk){
                        //callback(chunk+serverResData);
                        var newResponse = chunk+responseDetail.response.body;
                        return {
                            response: newResponse
                        };
                    })
                });
            }catch(e){
                return responseDetail;
            }
        }else{
            return responseDetail;
        }
    /* ..这里. */
    },
  // 是否处理https请求
  *beforeDealHttpsRequest(requestDetail) { /* ... */ return true},
  // 请求出错的事件
  *onError(requestDetail, error) { /* ... */ },
  // https连接服务器出错
  *onConnectError(requestDetail, error) { /* ... */ }
};


function HttpPost(str,url,path) {//将json发送到服务器，str为json内容，url为历史消息页面地址，path是接收程序的路径和文件名
    var http = require('http');
    var data = {
        str: encodeURIComponent(str),
        url: encodeURIComponent(url)
    };
    content = require('querystring').stringify(data);
    var options = {
        method: "POST",
        host: "localhost",//注意没有http://，这是服务器的域名。
        port: 8000,
        path: "/"+path,//接收程序的路径和文件名
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            "Content-Length": content.length
        }
    };
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });
    console.log('ffffff444')
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(content);
    req.end();
}