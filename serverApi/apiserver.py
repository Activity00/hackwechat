#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 17/7/6 下午3:22
# @Author  : 武明辉
# @File    : apiserver.py

# 1. getMsgExt  获取文章阅读量和点赞量
# 2. getWxHis
# 3. getWxPost
# 4. getMsgJson 将匹配到的历史消息json发送到自己的服务器
import json
import sys
import urllib.parse
import web

import config

urls = (
    '/getMsgJson', 'getMsgJson',
    '/getWxHis', 'getWxHis',
    '/getMsgExt', 'getMsgExt',
    'getWxPost', 'getWxPost',
)


def start_api_server():
    sys.argv.append('0.0.0.0:%s' % config.API_PORT)
    app = web.application(urls, globals())
    app.run()


class getMsgJson(object):
    """
    得到微信文章json信息
    """
    def GET(self):
        pass

    def POST(self):
        # inputs = web.input()
        # sqlhelper.select(inputs.get('count', None), inputs)
        # json_result = json.dumps('aaa')
        # return json_result
        print('getMsgJson begin')
        data = web.data()
        print(urllib.parse.unquote(data))
        print('getMsgJson end')
        return 'wmh'


class getWxHis(object):
    def GET(self):
        # print(dict(web.input()))
        # print(type(web.input()))
        # return '武明辉'
        return ''


class getMsgExt(object):
    def GET(self):
        pass


class getWxPost(object):
    def GET(self):
        pass

if __name__ == '__main__':
    sys.argv.append('0.0.0.0:8000')
    app = web.application(urls, globals())
    app.run()
