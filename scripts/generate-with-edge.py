#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用 Microsoft Edge TTS 生成音频
"""
import asyncio
import edge_tts
import os

async def generate_audio(text, output_file, voice="zh-CN-XiaoxiaoNeural"):
    """使用Edge TTS生成音频"""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)

async def main():
    char = "上"
    output_path = os.path.join('public', 'audio', 'characters', f'{char}.mp3')
    
    print(f"\n{'='*50}")
    print(f"使用 Edge TTS 生成: {char}")
    print(f"{'='*50}")
    
    # 可用的中文语音：
    voices = [
        "zh-CN-XiaoxiaoNeural",  # 晓晓 - 女声，温柔
        "zh-CN-YunxiNeural",     # 云希 - 男声
        "zh-CN-YunjianNeural",   # 云健 - 男声
        "zh-CN-XiaoyiNeural",    # 晓伊 - 女声，儿童
        "zh-CN-YunyangNeural",   # 云扬 - 男声，新闻播音
    ]
    
    # 尝试每个语音，找到最接近目标大小的
    best_file = None
    best_size = 0
    target_min, target_max = 6400, 7000
    
    for voice in voices:
        temp_file = output_path + f'.temp_{voice}.mp3'
        await generate_audio(char, temp_file, voice)
        size = os.path.getsize(temp_file)
        print(f"{voice}: {size} bytes", end='')
        
        if target_min <= size <= target_max:
            print(" ✅ 符合目标！")
            best_file = temp_file
            best_size = size
            break
        elif best_file is None or abs(size - 6700) < abs(best_size - 6700):
            print(f" (接近目标)")
            if best_file and os.path.exists(best_file):
                os.remove(best_file)
            best_file = temp_file
            best_size = size
        else:
            print()
            os.remove(temp_file)
    
    if best_file:
        os.replace(best_file, output_path)
        print(f"\n✅ 生成完成！")
        print(f"文件大小: {best_size} bytes ({best_size/1024:.2f} KB)")
        print(f"保存位置: {output_path}")
    
    # 清理临时文件
    for voice in voices:
        temp_file = output_path + f'.temp_{voice}.mp3'
        if os.path.exists(temp_file):
            os.remove(temp_file)

if __name__ == '__main__':
    asyncio.run(main())

