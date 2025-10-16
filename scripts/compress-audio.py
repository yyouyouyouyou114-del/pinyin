#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
压缩音频文件以匹配目标大小范围
使用 pydub 降低比特率来减小文件大小

安装依赖：
  pip install pydub

使用方法：
  python scripts/compress-audio.py 上
"""

import os
import sys

try:
    from pydub import AudioSegment
except ImportError:
    print("❌ 缺少 pydub 库，请安装：pip install pydub")
    sys.exit(1)

# 获取命令行参数
if len(sys.argv) < 2:
    print("用法: python scripts/compress-audio.py <汉字>")
    sys.exit(1)

char = sys.argv[1]
input_path = os.path.join('public', 'audio', 'characters', f'{char}.mp3')
output_path = input_path  # 覆盖原文件

if not os.path.exists(input_path):
    print(f"❌ 文件不存在: {input_path}")
    sys.exit(1)

print(f"\n{'='*50}")
print(f"正在压缩: {char}.mp3")
print(f"{'='*50}")

# 读取原始文件
original_size = os.path.getsize(input_path)
print(f"原始大小: {original_size} bytes ({original_size/1024:.2f} KB)")

# 加载音频
audio = AudioSegment.from_mp3(input_path)

# 目标：6400-7000字节
# 尝试不同的比特率，从低到高
target_min = 6400
target_max = 7000

for bitrate in ['48k', '56k', '64k', '72k', '80k']:
    # 导出到临时文件
    temp_path = input_path + '.temp.mp3'
    audio.export(temp_path, format='mp3', bitrate=bitrate)
    
    temp_size = os.path.getsize(temp_path)
    print(f"尝试比特率 {bitrate}: {temp_size} bytes", end='')
    
    if target_min <= temp_size <= target_max:
        print(" ✅ 符合目标范围！")
        # 替换原文件
        os.replace(temp_path, output_path)
        print(f"\n✅ 压缩成功！")
        print(f"新文件大小: {temp_size} bytes ({temp_size/1024:.2f} KB)")
        print(f"减小: {original_size - temp_size} bytes ({(1 - temp_size/original_size)*100:.1f}%)")
        break
    else:
        print(f" (目标: {target_min}-{target_max})")
        # 如果这个文件更接近目标，保留它
        if temp_size < target_max:
            os.replace(temp_path, output_path)
            print(f"✅ 使用此版本（最接近目标）")
            print(f"新文件大小: {temp_size} bytes ({temp_size/1024:.2f} KB)")
            break
        else:
            os.remove(temp_path)
else:
    print("⚠️  未找到完全符合目标的比特率，已使用最接近的版本")

print(f"{'='*50}\n")

