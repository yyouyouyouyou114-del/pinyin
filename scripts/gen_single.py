import sys
import os

try:
    from gtts import gTTS
except Exception as e:
    print('ERROR: gTTS not installed. Run: pip install gtts')
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print('Usage: python scripts/gen_single.py <汉字>')
        sys.exit(1)

    char = sys.argv[1]
    out_dir = os.path.join('public', 'audio', 'characters')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f'{char}.mp3')

    print('Generating:', char, '->', out_path)
    tts = gTTS(text=char, lang='zh-CN', slow=True)
    tts.save(out_path)
    size = os.path.getsize(out_path)
    print('Saved', out_path, 'size:', size, 'bytes')

if __name__ == '__main__':
    main()



