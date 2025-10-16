#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成缺失的汉字音频文件
使用 Google Text-to-Speech (gTTS) 生成高质量中文语音

安装依赖：
  pip install gtts

使用方法：
  python scripts/generate-audio.py
"""

import os
from gtts import gTTS
import sys

# 支持：
# 1) 无参数 -> 生成默认列表
# 2) 传入参数 -> 生成指定的汉字，如：python scripts/generate-audio.py 上
ARGS = [a for a in sys.argv[1:] if a.strip()]
FORCE = any(a in ('--force','-f') for a in ARGS)
ARG_CHARS = [c for c in ARGS if not c.startswith('-')]

# 默认需要生成的汉字列表（可按需扩展）
DEFAULT_CHARACTERS = [
    {'char': '止', 'pinyin': 'zhǐ', 'emoji': '🛑'},
    {'char': '粉', 'pinyin': 'fěn', 'emoji': '💗'}
]

if ARG_CHARS:
    CHARACTERS = [{'char': ch, 'pinyin': '', 'emoji': ''} for ch in ARG_CHARS]
else:
    CHARACTERS = DEFAULT_CHARACTERS

# 输出目录
OUTPUT_DIR = os.path.join('public', 'audio', 'characters')

def generate_audio(char_info):
    """生成单个汉字的音频文件"""
    char = char_info['char']
    pinyin = char_info['pinyin']
    emoji = char_info['emoji']
    
    print(f"\n{'='*50}")
    print(f"正在生成: {emoji} {char} ({pinyin})")
    print(f"{'='*50}")
    
    try:
        # 使用 gTTS 生成音频（中文，正常速度，与原有音频保持一致）
        tts = gTTS(text=char, lang='zh-CN', slow=False)
        
        # 保存文件
        output_path = os.path.join(OUTPUT_DIR, f'{char}.mp3')
        tts.save(output_path)
        
        file_size = os.path.getsize(output_path)
        print(f"✅ 成功生成: {output_path}")
        print(f"   文件大小: {file_size} bytes ({file_size/1024:.2f} KB)")
        
        return True
        
    except Exception as e:
        print(f"❌ 生成失败: {str(e)}")
        return False

def check_directory():
    """检查输出目录是否存在"""
    if not os.path.exists(OUTPUT_DIR):
        try:
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            return True
        except Exception as e:
            print(f"❌ 无法创建目录 {OUTPUT_DIR}: {e}")
            return False
    return True

def check_existing_files():
    """检查已存在的文件"""
    existing = []
    for char_info in CHARACTERS:
        char = char_info['char']
        file_path = os.path.join(OUTPUT_DIR, f'{char}.mp3')
        if os.path.exists(file_path):
            existing.append(char)
    return existing

def main():
    """主函数"""
    print("\n" + "="*60)
    print("🎵 汉字音频生成工具")
    print("="*60)
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"需要生成: {len(CHARACTERS)} 个音频文件")
    print()
    
    # 检查目录
    if not check_directory():
        sys.exit(1)
    
    # 检查已存在的文件
    existing = check_existing_files()
    if existing and not FORCE:
        print(f"⚠️  以下文件已存在: {', '.join(existing)}")
        print("使用 --force 可覆盖现有文件。已取消操作。")
        return
    
    # 生成音频
    success_count = 0
    fail_count = 0
    
    for char_info in CHARACTERS:
        if generate_audio(char_info):
            success_count += 1
        else:
            fail_count += 1
    
    # 总结
    print("\n" + "="*60)
    print("📊 生成完成")
    print("="*60)
    print(f"✅ 成功: {success_count} 个")
    print(f"❌ 失败: {fail_count} 个")
    print()
    
    if success_count == len(CHARACTERS):
        print("🎉 全部文件生成成功！")
        print()
        print("📝 后续步骤:")
        print("  1. 检查生成的音频文件质量")
        print("  2. 刷新项目页面 (http://localhost:3000)")
        print("  3. 测试第7关和第21关的音频播放")
        print()
    else:
        print("⚠️  部分文件生成失败，请检查错误信息")
    
    # 列出所有音频文件
    print("📂 当前音频文件列表:")
    audio_files = sorted([f for f in os.listdir(OUTPUT_DIR) if f.endswith('.mp3')])
    print(f"   总共 {len(audio_files)} 个文件")
    
    if len(audio_files) == 250:
        print("   ✅ 已达到目标数量 (250个)")
    elif len(audio_files) == 248:
        print("   ⚠️  还缺少 2 个文件")
    else:
        print(f"   当前数量: {len(audio_files)}")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断操作")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 发生错误: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

