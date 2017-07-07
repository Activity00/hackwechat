# 利用中间人攻击获取微信信息
# 介绍

# 环境
1. nodejs
2. anyproxy
3. web.py

# 具体步骤：
  1. 安装完环境后通过anyproxy-ca在用户目录.anyproxy
  下生成证书文件，在需要的客户端手机上安装该证书
  2. 启动代理服务器 anyproxy -i --rule wechatrule.js
  加载本地规则wechatrule.js
  3. 打开微信客户端，查看某一公众号历史文章然后等待

# web接口说明

1. getMsgExt  获取文章阅读量和点赞量
2. getWxHis
3. getWxPost
4. getMsgJson 将匹配到的历史消息json发送到自己的服务器