#!/usr/bin/env python
# coding=utf-8

"""

@author: sml2h3

@license: (C) Copyright 2018-2020

@contact: sml2h3@gmail.com

@software: mmewmd_crack_for_wenshu

@file: spider_demo

@time: 2019-01-21
"""
import requests
import time
import execjs
from lxml import etree
import random
from urllib import parse

with open('encrypt.js', 'r', encoding="utf-8") as f:
    js1 = f.read()
    ctx1 = execjs.compile(js1)
with open('ywtu.js', 'r', encoding="utf-8") as f:
    js2 = f.read()
    ctx2 = execjs.compile(js2)
with open('vl5x.js', 'r', encoding="utf-8") as fp:
    js = fp.read()
    ctx = execjs.compile(js)


class SpiderManager(object):

    def __init__(self, debug=False):
        self.f80t = ""
        self.f80t_n = ""
        self.meta = ""
        self.f80s = ""
        self.ywtu = ""
        self.vjkl5 = ""
        self.content = ""
        self.debug = debug
        self.conditions = ""
        self.url = "http://wenshu.court.gov.cn/List/List?sorttype=1&conditions={}"
        self.url_for_content = "http://wenshu.court.gov.cn/List/ListContent"
        self.headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Host": "wenshu.court.gov.cn",
            "Origin": "http://wenshu.court.gov.cn",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
        }
        self.cookies = {
            "ccpassport": "1ff98c661b8f424096c234ce889da9b0",
            "_gscu_2116842793": "47626758817stt18",
            "_gscs_2116842793": "47659453ttzz3o20|pv:14",
            "_gscbrs_2116842793": "1",
            "wzwsconfirm": "0e561c10c60c2f0d44410644eb3c2403",
            "wzwstemplate": "NQ==",
            "wzwschallenge": "-1",
            "wzwsvtime": ""
        }
        self.data = {
            "Param": "案件类型:民事案件",
            "Index": "",
            "Page": "10",
            "Order": "法院层级",
            "Direction": "asc",
            "vl5x": "",
            "number": "wens",
            "guid": ""
        }

    def setconditions(self, conditions: str):
        self.conditions = conditions

    def init(self):
        self.f80t = ""
        self.f80t_n = ""
        self.meta = ""
        self.f80s = ""
        self.ywtu = ""
        self.vjkl5 = ""
        if not self.conditions:
            if self.debug:
                print("条件不能为空")
                return False
        request_url = self.url.format(self.conditions)
        headers = self.headers
        cookies = self.cookies
        cookies['wzwsvtime'] = str(int(time.time()))
        # cookies = "; ".join(cookies)
        try:

            rsp = requests.get(request_url, headers=headers, cookies=cookies)
            rsp.close()
        except Exception as e:
            if self.debug:
                print(e)
                print("网络连接出错，稍等5秒后重新执行")
            time.sleep(5)
            return self.init()

        self.f80s = rsp.cookies['FSSBBIl1UgzbN7N80S']
        self.f80t = rsp.cookies['FSSBBIl1UgzbN7N80T']
        html = etree.HTML(rsp.text)
        self.meta = html.xpath('//*[@id="9DhefwqGPrzGxEp9hPaoag"]/@content')[0]
        self.ywtu = ctx2.call("getc", self.meta)
        return True

    def getvjkl5(self):
        request_url = self.url.format(self.conditions)
        headers = self.headers
        cookies = self.cookies
        cookies['wzwsvtime'] = str(int(time.time()))
        self.ywtu = ctx2.call("getc", self.meta)
        self.f80t_n = ctx1.call("getCookies", self.meta, self.f80t, self.ywtu)
        cookies['FSSBBIl1UgzbN7N80S'] = self.f80s
        cookies['FSSBBIl1UgzbN7N80T'] = self.f80t_n
        cookies['wzwsvtime'] = str(int(time.time()))
        try:
            rsp = requests.get(request_url, headers=headers, cookies=cookies)
            rsp.close()
        except Exception as e:
            if self.debug:
                print(e)
                print("获取vjkl5失败:网络连接出错")
            return False
        if rsp.status_code == 200 and "vjkl5" in rsp.cookies:
            self.vjkl5 = rsp.cookies['vjkl5']
            return True
        else:
            if self.debug:
                print("获取vjkl5失败,code：{}".format(rsp.status_code))
            return False

    def get_vl5x(self):
        """
        根据vjkl5获取参数vl5x
        """
        vl5x = (ctx.call('getKey', self.vjkl5))
        return vl5x

    def createGuid(self):
        return str(hex((int(((1 + random.random()) * 0x10000)) | 0)))[3:]

    def getguid(self):
        return '{}{}-{}-{}{}-{}{}{}' \
            .format(
            self.createGuid(), self.createGuid(),
            self.createGuid(), self.createGuid(),
            self.createGuid(), self.createGuid(),
            self.createGuid(), self.createGuid()
        )

    def getContent(self, page):
        url = self.url_for_content
        self.f80t_n = ctx1.call("getCookies", self.meta, self.f80t_n, self.ywtu)
        vl5x = self.get_vl5x()
        print(vl5x)
        data = self.data
        data['Index'] = str(page)
        data['vl5x'] = vl5x
        data['guid'] = self.getguid()
        cookies = self.cookies
        cookies['wzwsvtime'] = str(int(time.time()))
        cookies['FSSBBIl1UgzbN7N80S'] = self.f80s
        cookies['FSSBBIl1UgzbN7N80T'] = self.f80t_n
        cookies['vjkl5'] = self.vjkl5
        headers = self.headers
        headers['Referer'] = self.url.format(parse.quote(self.conditions))
        try:
            rsp = requests.post(url, headers=headers, cookies=cookies, data=data)
        except Exception as e:
            if self.debug:
                print(e)
                print("获取内容时网络请求出错")
            return False
        if rsp.status_code == 200 and "验证码" not in rsp.text:
            self.content = rsp.text
            return True
        else:
            if self.debug:
                print("获取内容出错,code:{},若code为200，可能出现了验证码".format(rsp.status_code))
            return False

    def getData(self):
        return self.content

if __name__ == '__main__':
    # 实例化并开启调试模式，会返回报错信息
    spider = SpiderManager(debug=True)
    # 设置采集条件
    spider.setconditions("searchWord+2+AJLX++案件类型:民事案件")
    # 初始化
    init_status = spider.init()
    print("初始化成功")
    status = spider.getvjkl5()
    if status:
        print("获取vjkl5成功")
        status = spider.getContent(page=1)
        if status:
            print(spider.getData())
        else:
            print("获取列表页内容失败")

    else:
        # 自己写，重新获得getvjkl5
        pass




