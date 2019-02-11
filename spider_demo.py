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
import re
import json


with open('encrypt.js', 'r', encoding="utf-8") as f:
    js1 = f.read()
    ctx1 = execjs.compile(js1)
with open('ywtu.js', 'r', encoding="utf-8") as f:
    js2 = f.read()
    ctx2 = execjs.compile(js2)
with open('vl5x.js', 'r', encoding="utf-8") as fp:
    js = fp.read()
    ctx = execjs.compile(js)
with open('get_docid.js', 'r', encoding="utf-8") as fp:
    js = fp.read()
    get_docid = execjs.compile(js)


class SpiderManager(object):

    def __init__(self, debug=False):
        self.f80t = ""
        self.f80t_n = ""
        self.meta = ""
        self.f80s = ""
        self.ywtu = ""
        self.vjkl5 = ""
        self.list = ""
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
            "Page": "20",
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
        try:
            self.meta = html.xpath('//*[@id="9DhefwqGPrzGxEp9hPaoag"]/@content')[0]
            self.ywtu = ctx2.call("getc", self.meta)
        except AttributeError as e:
            print(e)
            print(rsp.status_code)
            print(rsp.text)
            return False
        return True

    def getvjkl5(self):
        request_url = self.url.format(self.conditions)
        headers = self.headers
        cookies = self.cookies
        cookies['wzwsvtime'] = str(int(time.time()))
        # self.ywtu = ctx2.call("getc", self.meta)
        self.f80t_n = ctx1.call("getCookies", self.meta, self.f80t, self.ywtu)

        cookies['FSSBBIl1UgzbN7Nenable'] = "true"
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
                print(self.meta)
                print(self.ywtu)
                print(self.f80t)
                print(self.f80t_n)
                print("获取vjkl5失败,code：{}".format(rsp.status_code))
                if rsp.status_code == 200:
                    print(rsp.text)
                    print(rsp.cookies)
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

    def getList(self, page):
        url = self.url_for_content
        self.f80t_n = ctx1.call("getCookies", self.meta, self.f80t, self.ywtu)
        vl5x = self.get_vl5x()
        data = self.data
        data['Index'] = str(page)
        data['vl5x'] = vl5x
        data['guid'] = self.getguid()
        cookies = self.cookies
        cookies['wzwsvtime'] = str(int(time.time()))
        cookies['FSSBBIl1UgzbN7Nenable'] = "true"
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
                print("获取列表页时网络请求出错")
            return False
        if rsp.status_code == 200 and "验证码" not in rsp.text:
            self.list = rsp.text
            return True
        else:
            if self.debug:
                print("获取列表页出错,code:{},若code为200，可能出现了验证码".format(rsp.status_code))
            return False

    def getListData(self):
        return self.list

    def getDocIds(self):
        list_json = json.loads(json.loads(self.list))
        # print(list_json)
        # list_json = [{'RunEval': 'w61aS27CgzAQPQtRFsK2wqh6AcKUVcKOw5DDpcOIQhVJGhYNwpVDV1HDrl7CoMKEAnYCKcOBHcOKwpPDkETCtsOnw7PDpsONYGMpw4t9wrzDmR4jHX/CpMKrwpdUw4fCh8K3w6fCnU7DnsOXw7tXwr1ONlvDoXs+KQjDlsOiCSRAw4zCo0PDvkMiM3ldwrErwqHCthDDoB3DjELCoHpgDMOFBTsgAUwga8Kkwo7DvMKRMMKIASfCoAM8ITnCpMKECkDCoBEYChkEw6FqESXCh2PCqj/CozTDkcKLIMKkUGXCjxDDvsOpwpzCq1XDj8OpLMOpw5vCkjLCocKUL8K8YkFSw5Nnwr7DkMK9UgzClz/Dv04gwpFPZxrDpMOlK8KkKMO7aQVswqp7wqXDgcO1YC3DnFbDncKbwpjDqsOew6zDs1XCqALCtUnCkQHDgcKaw4MNw58Vw4h+wozDlsKGwp3CsHtqw5zCo3bCt8Ouw68MBlgNNX3CiD0zJw/DtjTChsK7w5F8cizChSvDh8Kld8ORw5oywozDscKVw43CjW3Dp8K1ExjCkz7CjsO9w6Mgw6MJIG7CnMK+w6M1wpvCg8Omw6rDu0LClsO5XsK+wp0mw5wPPMOiwrgPNsORwojDrhF3wofDvSNMTmNPw6VowptDCMOmAEoUw6bCt17Cj8OLL0vCvix3XcOzwpxswpzCh8O2w5nCukMacFtnRB7DsMOUw4JKIcKDLw==', 'Count': '39847561'}, {'裁判要旨段原文': '本院认为，山东省农业科学院中心实验室计量认证合格证书因未参加年检而过期，以及案涉樱桃园存在受气候因素影响而减产的事实，一、二审法院均已作出确认，山东省工业产品生产许可证办公室出具的《证明》以及中国农业新闻网的相关报道均无新的证明对象和证明内容，不构成“足以推翻', '案件类型': '2', '裁判日期': '2015-06-26', '案件名称': '山东富海实业股份有限公司、曲忠全与山东富海实业股份有限公司、曲忠全等环境污染责任纠纷再审复查与审判监督民事裁定书', '文书ID': 'FcKMwrkRA0EIw4Baw6JnCXnDuy/DicOnVCPDiR5cGB7Cj8KYbsKqdm3DtsOIwoTCssK8WcOkJsOMUBrCjcOSAW90AcKEanzDmlHCg3jCisKvwobClhJOTGJbwp5ZLMO1ZmXDlRoXw7FnwpvCtztKwoDDhTAZfcOYPxduwozDqSvDn8OhwqDDl3DCpsKGw43CuWc8w4gBwpwdw5vDr0nDh8KxwrJowooFw4jCm8KLecKTw7/ClGAswrrDncOuwrxLNADCsGR/', '审判程序': '再审审查与审判监督', '案号': '（2014）民申字第1782号', '法院名称': '最高人民法院'}, {'案件类型': '2', '裁判日期': '2014-06-23', '案件名称': '章瀚与厦门金原融资担保有限公司一般借款合同纠纷申请再审民事裁定书', '文书ID': 'DcOOw5sBADEEBcORwpbDhCPDuETDnMO+S8OabWDDjiRJVWnDq8KdKcKZFMORw7Bzw6IGw6HCvXfCscKawq0ywrMAw4Uaw7XCgSbCkTzCp8OAw4w7w6DCpngrUwvDncOkS8OuHVQmbMOZcWwFw4zDmMKJayTDok3DrxchYsKuR8Obwrx4wonDmnhRw6QXw6JnL3PChMOPCC4fKRo4TcOOwo1/dcOTQxJVFnlhMy3DkMOowoFFw6RLw7otw4gew6bDvEvDtQE=', '审判程序': '再审审查与审判监督', '案号': '（2014）民申字第966号', '法院名称': '最高人民法院'}, {'裁判要旨段原文': '本院认为：本案申请再审的焦点是库柏公司超额交付的金额为1471162元增值税发票是否构成税务损失。根据国家税务总局2006年10月17日修订的《增值税专用发票使用规定》第十四条第一款“一般纳税人取得专用发票后，发生销货退回、开票有误等情形但不符合作废条件的，或', '案件类型': '2', '裁判日期': '2014-12-17', '案件名称': '厦门聚亿电气设备有限公司与库柏电气（上海）有限公司一般买卖合同纠纷申请再审民事裁定书', '文书ID': 'HcONwrcRA0EMw4DDgMKWw6hNSHPDrMK/JMO9KELCthjChcKYZ8KVwoMKNWo5MMOtMMOOwr02GC5+woZvSsOVw7vCsFUBU8OIXMOeSsKlw4HCo8KOPMKrwrE9w7bCtcOyERE0wqkVLUXCocKewoULw4LCqMODRMKiAVrCjsOtJMKXw6LDrWLDuG5MwqDCjAHDuFw5w7dlAx7Co2JPw4QLw689ccOww7bDvsKyI3TCrsKCw6kQwrExfy3CnF4/PS3Cu8OjwrrDjMO6AQ==', '审判程序': '再审审查与审判监督', '案号': '（2014）民申字第454号', '法院名称': '最高人民法院'}, {'裁判要旨段原文': '本院认为：一、关于胡素娟、许春红是否为适格原告的问题。虽然《房地产买卖协议书》并非胡素娟、许春红亲笔所签，从协议签订到履行均由胡素娟之父胡国安代为办理，但是胡素娟、许春红对协议内容并无异议，在一、二审以及再审审查阶段均明确认可胡国安的代理行为，胡国安亦认可该事', '案件类型': '2', '裁判日期': '2014-08-28', '案件名称': '襄阳市房屋租赁修缮公司与胡素娟、许春红一般买卖合同纠纷申请再审民事裁定书', '文书ID': 'FcKMwrcNA0EMw4BWUsOWwqlUw5x/JMK/GxYEw4HCiQBTwpLCj8O3w4LClEvCtgXCisKwdgtZe8OXKcK1w7FNVRfCjFDChk3CjsOpHsKHFzsqTcOhwq7ChQRaIFTCm8OZwoLDosK6w6ljb8Ozwqc8OlDCnxMgXynCi8KJw5fClzF5woEDEMOmw5TCgnBMSXDCnRPCrRvDu8OgAMOZR8ObwrRIw6ErFcKzw7/CqzhRacK3wpsdw47Dg2o5AsOhw4tkw5c7wqsf', '审判程序': '再审审查与审判监督', '案号': '（2014）民申字第227号', '法院名称': '最高人民法院'}, {'裁判要旨段原文': '本院认为，虽然案涉房屋尚未完成竣工验收备案，不具备《昆山市商品房购销合同》中约定的交付条件。但是，根据缪永红于购房当日与东方广场公司签订的《租赁及委托经营管理合同》的约定，缪永红已经将其所购买的房屋出租给东方广场公司经营使用，并在支付装修费用后将收房、装修事项', '案件类型': '2', '裁判日期': '2014-10-23', '案件名称': '缪永红 昆山红枫房地产有限公司 昆山东方云顶广场有限公司与中信信托有限责任公司其他合同纠纷二审民事判决书5', '文书ID': 'DcKOwrcRw4BADMODVlIOwqVeYcO/wpHDrMKOBcKAYxNww4B5w7sAc8KHT8Ojwr7Cq2PCqgfDnMOiwpU1RMKuwovDoS7DssKsw6I1wrTCt0AswoElERLDrcOrwpwsLlXCjMKfZ8OWYhXDrcKSHMKTwpo9w4HCiMKKw5/Ds3jCrsO/w5BAU8KefMO5w75kwpEgw6nDlWhddxtTwrLDjcKbGQjDu8K7w67Chhk2wrnCuwjDh1DCtMK+Ox4lcTgGw41ZCHMnw7JfPXYPw7sA', '审判程序': '二审', '案号': '（2014）民一终字第122号', '法院名称': '最高人民法院'}, {'裁判要旨段原文': '本院审查认为，（一）关于处理本案当事人争议的合同依据问题。双方签订的《1.47亿元施工合同》表明，华兴公司承包了整个“天成国贸中心”的土建及安装工程；双方签订的《天成国贸中心工程施工补充协议》（以下简称《补充协议》）表明华兴公司承包“天成国贸中心”整个土建及安', '案件类型': '2', '裁判日期': '2014-03-27', '案件名称': '天成润华集团有限公司与中国核工业华兴建设有限公司建设工程施工合同纠纷申请再审审查民事裁定书', '文书ID': 'DcKOw4kJAEEIw4BaUsOHw7PDqcOZf0nCu8K/QCDDhMKGw5LDoATDhHvCiMORwprDjcKQRsOCG8OgfsKrViM9dsOgdMKpLWQlc8KDbcKYAVvChcKWwrDDpmd8Djs/U3LDu8OEwrbCjMKyw7FowqguUi89wo9bKMONeGvDu8K3JmtXw7gWwrPCgcKAwpTCicOWI14+wrzCmMKdwpDCksKrCMKrOh1HfcKvwp3Cq8KaRBJ5VVlRw745wrdAw5Ycd8Osw4rCo1cOw68D', '审判程序': '再审', '案号': '（2013）民申字第1929号', '法院名称': '最高人民法院'}, {'裁判要旨段原文': '本院认为，执行异议之诉的关键是审查购房者享有的实体权利是否足以阻却执行措施。\n其一，“二轻大厦”系繁荣公司与二轻联社共同开发建设，繁荣公司依约可取得“二轻大厦”中49％的权益。而阜承公司因受让繁荣公司在“二轻大厦”项目中所享有的49％权益分得“二轻大厦”第6', '案件类型': '2', '裁判日期': '2014-11-14', '案件名称': '方希源、蔡福英等民间借贷纠纷、案外人执行异议之诉民事判决书', '文书ID': 'DcOORxHDgDAMADBKHsOxenrDssKHw5QSw5ApwoLCn8KuHUAKQ3Baw6HDhsKOcsKnwoPCn8K5wo3Dgwssw5FyL0rCucKgworDrGYePkrCrVIIw4J6wqzDhWLCqcKvw7gxw5nCu33Cky/DosK4wogNwpHDrMOWwpPCqilBDsOnJ8KXV0jCrlzDh1zDu0UVDsOgw5EGw7UkA8KnUMKjwoDCtTLCl8OfbMOpw54QwrDDvkdDHsKiwrZVw6LDtcK+dhYcE8OCQVFqwroP', '审判程序': '二审', '案号': '（2014）民一终字第174号', '法院名称': '最高人民法院'}, {'裁判要旨段原文': '综上，四海公司的上诉理由缺乏事实和法律依据，本院不予支持。原审判决认定事实清楚，适用法律正确，依法应予维持。本院依照《中华人民共和国民事诉讼法》第一百七十条第一款第（一）项之规定，判决如下', '案件类型': '2', '裁判日期': '2014-12-20', '案件名称': '中国信达资产管理股份有限公司黑龙江省分公司与哈尔滨四海数控科技股份有限公司、刘安丽金融借款合同纠纷二审民事判决书', '文书ID': 'FcKMw4sRRDEIw4NaCl/DgzEEw6jCv8KkfXvDs8OIGlHDucK+w6TClgXDo8OeUMKcUcO3M0zCr2HCmQjCqsKcXUotdsOOAmnChCoTwpoSw6RtVnrDix/DlsOdw6rCjsO4a8O5wqp2wrxdGEXClMOuUsO9w61gw7kaw6EHwpnDscKGTsO/VWvCiB1zEE9cwphEdMOcN1jCuiwwHiU3fCbDuMKgP8KkYsKUw51rw4QWw4dnw7bDu3RWw57Dg8Ozw6PCglfDncOBw7sD', '审判程序': '二审', '案号': '（2014）民二终字第251号', '法院名称': '最高人民法院'}, {'裁判要旨段原文': '本院认为，本案再审争议的焦点问题为：（一）郑少春与中医院之间法律关系的性质与效力；（二）郑少春应否将案涉土地退还给中医院，应否以及如何支付土地占用费。\n（一）关于郑少春与中医院之间法律关系的性质与效力问题。《中华人民共和国城镇国有土地使用权出让转让暂行条例》', '案件类型': '2', '裁判日期': '2014-11-15', '案件名称': '莆田市中医院与福建省莆田市闽中田野汽车贸易有限公司、莆田市志强汽车贸易有限公司建设用地使用权纠纷审判监督民事判决书', '文书ID': 'DcOMRwHDgEAIADBLw6zDscKEA8O8S2ojIHjDtsOQTCpUw43CkyfDsw7Co0/Co8KTw4w1woN0wr15ZMODFlYHwoTCjUXCpkteBhYIFcO7Iw/ClGHCmHhGDhTDjy1DDVFyw4HDgsO9wqTCiDbCjcOGwpjDnsKEwrB2OcKiw4vCk8KGw57Cs8KgKsOEbcOUwoLDjkcsMMK8DsKqwrJkW8OjNGfCh8KKcFDCsMKlw40pWsKLwrRoFV05w7rCj8KsFEzDgMKyHw==', '审判程序': '再审', '案号': '（2014）民提字第125号', '法院名称': '最高人民法院'}, {'裁判要旨段原文': '综上，腾远公司的再审申请不符合《中华人民共和国民事诉讼法》第二百条第六项规定的情形。本院依照《中华人民共和国民事诉讼法》第二百零四条第一款之规定，裁定如下', '案件类型': '2', '裁判日期': '2015-04-29', '案件名称': '许昌市腾远房地产开发有限公司、郑州市第二建筑工程有限责任公司与许昌市腾远房地产开发有限公司、郑州市第二建筑工程有限责任公司建设工程施工合同纠纷申请再审民事裁定书', '文书ID': 'DcOOwrERBDEIBMOBwpRALAtvAhLDucKHw7TDp8K2MTXCuXJLwrTDuynDhcK8w6UJYsKswqw/wo1reFdzcMOdDcO6aMKnwq/CthbCpcOyZMKbw7nDj8OAWGXCtDHDkCwtXXUQwoDDs27DrhTDpFppUibDscKww4RQwqsHwprDqcOewp8Ra8OIW8KNO8KuwqHDssOQGsOrwp7DvMO1wpbCvcKewq5XW8ODdcOBw5HCkMKnJsOCwrDCs8Kff8OJcyptEWx+wosyw7JbdsO1Hw==', '审判程序': '再审审查与审判监督', '案号': '（2015）民申字第739号', '法院名称': '最高人民法院'}]

        if len(list_json) > 1:
            runeval = list_json[0]['RunEval']
            if runeval[0: 3] == "w63":
                print("经检测，此为脏数据，请更换IP后重试")
                return False
            docids = []
            for item in list_json[1:]:
                docid = item['文书ID']
                js = get_docid.call("GetJs", runeval)
                js_objs = js.split(";;")
                js1 = js_objs[0] + ';'
                js2 = re.findall(r"_\[_\]\[_\]\((.*?)\)\(\);", js_objs[1])[0]
                key = get_docid.call("EvalKey", js1, js2)
                key = re.findall(r"\"([0-9a-z]{32})\"", key)[0]
                docid = get_docid.call("DecryptDocID", key, docid)
                docids.append(docid)
            return docids
        else:
            return False

    def getContent(self, docid):
        url = "http://wenshu.court.gov.cn/CreateContentJS/CreateContentJS.aspx?DocID={}".format(docid)
        self.f80t_n = ctx1.call("getCookies", self.meta, self.f80t, self.ywtu)
        cookies = self.cookies
        cookies['wzwsvtime'] = str(int(time.time()))
        cookies['FSSBBIl1UgzbN7Nenable'] = "true"
        cookies['FSSBBIl1UgzbN7N80S'] = self.f80s
        cookies['FSSBBIl1UgzbN7N80T'] = self.f80t_n
        cookies['vjkl5'] = self.vjkl5
        headers = self.headers
        headers['Referer'] = self.url.format(parse.quote(self.conditions))
        try:
            rsp = requests.get(url, headers=headers, cookies=cookies)
        except Exception as e:
            if self.debug:
                print(e)
                print("获取内容时网络请求出错")
            return False
        if rsp.status_code == 200 and "验证码" not in rsp.text:
            print(rsp.text)
            return True
        else:
            if self.debug:
                print("获取内容出错,code:{},若code为200，可能出现了验证码".format(rsp.status_code))
            return False


if __name__ == '__main__':
    # # 实例化并开启调试模式，会返回报错信息
    # for i in range(10):
    spider = SpiderManager(debug=True)
    # 设置采集条件
    spider.setconditions("searchWord+2+AJLX++案件类型:民事案件")
    # 初始化
    init_status = spider.init()
    if init_status:
        print("初始化成功")
        status = spider.getvjkl5()
        if status:
            print("获取vjkl5成功")
            status = spider.getList(page=1)
            if status:
                print("获取列表页内容成功")
                print(spider.getListData())
                docids = spider.getDocIds()
                if docids:
                    for item in docids:
                        spider.getContent(item)
                else:
                    print("解密失败")
            else:
                print("获取列表页内容失败")

        else:
            # 自己写，重新获得getvjkl5
            pass

    else:
        print("初始化失败")
        # continue



