#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from gtts import gTTS
import io

chars = ['一', '下', '不', '上']

print("检查gTTS生成的文件大小：\n")
for c in chars:
    tts = gTTS(text=c, lang='zh-CN', slow=False)
    bio = io.BytesIO()
    tts.write_to_fp(bio)
    size = len(bio.getvalue())
    print(f"{c}: {size} bytes")

