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

with open('encrypt.js', 'r') as f:
    js = f.read()

cookies = ""  # 传入FSSBBIl1UgzbN7N80T
ctx = execjs.compile(js)
r = ctx.call("makemmwded", cookies, '/List/ListContent')
print(r)
