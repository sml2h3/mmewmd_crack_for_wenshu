#!/usr/bin/env python
# coding=utf-8

"""

@author: sml2h3

@license: (C) Copyright 2018-2020

@contact: sml2h3@gmail.com

@software: mmewmd_crack_for_wenshu

@file: encrypt

@time: 2019-01-17
"""

import execjs
import requests
from lxml import etree

with open('./vl5x.js', 'r', encoding="utf-8") as fp:
    js = fp.read()
    ctx = execjs.compile(js)

headers = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "ccpassport=1ff98c661b8f424096c234ce889da9b0;_gscu_2116842793=47626758817stt18; _gscs_2116842793=47659453ttzz3o20|pv:14; _gscbrs_2116842793=1; wzwsconfirm=0e561c10c60c2f0d44410644eb3c2403; wzwstemplate=NQ==; wzwschallenge=-1;wzwsvtime=1547659451;",
    "Host": "wenshu.court.gov.cn",
    "Origin": "http://wenshu.court.gov.cn",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
}
url = "http://wenshu.court.gov.cn/List/List?sorttype=1&conditions=searchWord+2+AJLX++%E6%A1%88%E4%BB%B6%E7%B1%BB%E5%9E%8B:%E6%B0%91%E4%BA%8B%E6%A1%88%E4%BB%B6"

rsp = requests.get(url, headers=headers)
f80s = rsp.cookies['FSSBBIl1UgzbN7N80S']
f80t = rsp.cookies['FSSBBIl1UgzbN7N80T']
with open('encrypt.js', 'r', encoding="utf-8") as f:
    js1 = f.read()
    ctx1 = execjs.compile(js1)
with open('ywtu.js', 'r', encoding="utf-8") as f:
    js2 = f.read()
    ctx2 = execjs.compile(js2)
html = etree.HTML(rsp.text)
meta = html.xpath('//*[@id="9DhefwqGPrzGxEp9hPaoag"]/@content')[0]
ywtu = ctx2.call("getc", meta)
f80t_n = ctx1.call("getCookies", meta, f80t, ywtu)
headers = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "FSSBBIl1UgzbN7N80S={}; FSSBBIl1UgzbN7N80T={}; ccpassport=1ff98c661b8f424096c234ce889da9b0;_gscu_2116842793=47626758817stt18; _gscs_2116842793=47659453ttzz3o20|pv:14; _gscbrs_2116842793=1; wzwsconfirm=0e561c10c60c2f0d44410644eb3c2403; wzwstemplate=NQ==; wzwschallenge=-1;wzwsvtime=1547659451;".format(
        f80s, f80t_n),
    "Host": "wenshu.court.gov.cn",
    "Origin": "http://wenshu.court.gov.cn",
    "Referer": "http://wenshu.court.gov.cn/List/List?sorttype=1&conditions=searchWord+2+AJLX++%E6%A1%88%E4%BB%B6%E7%B1%BB%E5%9E%8B:%E6%B0%91%E4%BA%8B%E6%A1%88%E4%BB%B6",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
}
url = "http://wenshu.court.gov.cn/List/List?sorttype=1&conditions=searchWord+2+AJLX++%E6%A1%88%E4%BB%B6%E7%B1%BB%E5%9E%8B:%E6%B0%91%E4%BA%8B%E6%A1%88%E4%BB%B6"

rsp = requests.get(url, headers=headers)
vjkl5 = rsp.cookies['vjkl5']

url = "http://wenshu.court.gov.cn/List/ListContent"
f80t_n = ctx1.call("getCookies", meta, f80t, ywtu)
with open('./vl5x.js', 'r', encoding="utf-8") as fp:
    js = fp.read()
    ctx = execjs.compile(js)


def get_vl5x(vjkl5):
    """
    根据vjkl5获取参数vl5x
    """
    vl5x = (ctx.call('GetVl5x', vjkl5))
    return vl5x


vl5x = get_vl5x(vjkl5)
headers = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "FSSBBIl1UgzbN7N80S={}; FSSBBIl1UgzbN7N80T={}; vjkl5={}; ccpassport=1ff98c661b8f424096c234ce889da9b0;_gscu_2116842793=47626758817stt18; _gscs_2116842793=47659453ttzz3o20|pv:14; _gscbrs_2116842793=1; wzwsconfirm=0e561c10c60c2f0d44410644eb3c2403; wzwstemplate=NQ==; wzwschallenge=-1;wzwsvtime=1547659451;".format(
        f80s, f80t_n, vjkl5),
    "Host": "wenshu.court.gov.cn",
    "Origin": "http://wenshu.court.gov.cn",
    "Referer": "http://wenshu.court.gov.cn/List/List?sorttype=1&conditions=searchWord+2+AJLX++%E6%A1%88%E4%BB%B6%E7%B1%BB%E5%9E%8B:%E6%B0%91%E4%BA%8B%E6%A1%88%E4%BB%B6",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
}
data = {
    "Param": "案件类型:民事案件",
    "Index": "1",
    "Page": "10",
    "Order": "法院层级",
    "Direction": "asc",
    "vl5x": vl5x,
    "number": "wens",
    "guid": "8df4cd4f-0d91-23411994-4bd54ad7a846"
}
rsp = requests.post(url, headers=headers, data=data)
print(rsp.text)
