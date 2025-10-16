# 🎵 音频生成工具使用指南

## 📋 快速开始（3分钟完成）

你有**3种方法**生成缺失的2个音频文件，选择最适合你的：

---

## 方法1：浏览器工具（推荐，最简单）⭐⭐⭐⭐⭐

### 步骤：
1. **打开工具页面**
   ```bash
   # 在浏览器中打开
   scripts/generate-missing-audio.html
   ```
   或直接双击 `generate-missing-audio.html` 文件

2. **一键生成**
   - 点击"🚀 一键生成所有音频"按钮
   - 自动下载 `止.mp3` 和 `粉.mp3`

3. **移动文件**
   ```bash
   # 将下载的文件移动到项目目录
   mv ~/Downloads/止.mp3 public/audio/characters/
   mv ~/Downloads/粉.mp3 public/audio/characters/
   ```

4. **完成！**
   刷新页面即可使用

---

## 方法2：Python脚本（高质量）⭐⭐⭐⭐

### 前提条件：
- 安装Python 3.6+
- 安装gTTS库

### 步骤：
```bash
# 1. 安装依赖
pip install gtts

# 2. 运行脚本（在项目根目录）
python scripts/generate-audio.py

# 3. 完成！文件已自动保存到正确位置
```

**优点**：
- ✅ 自动化，无需手动移动文件
- ✅ 使用Google TTS，质量高
- ✅ 慢速播放，发音清晰

---

## 方法3：在线工具（备选）⭐⭐⭐

如果上面两种方法都不可用，使用在线TTS工具：

### 推荐工具：

#### A. 微软Azure TTS（最高质量）
1. 访问：https://azure.microsoft.com/zh-cn/products/cognitive-services/text-to-speech/
2. 选择语音：`zh-CN-XiaoxiaoNeural` (童声女声)
3. 输入文字："止" 和 "粉"
4. 下载MP3文件

#### B. 科大讯飞（免费，质量好）
1. 访问：https://www.xfyun.cn/services/online_tts
2. 选择发音人：童声
3. 输入文字："止" 和 "粉"
4. 下载音频

#### C. 百度语音合成（简单易用）
1. 访问：https://ai.baidu.com/tech/speech/tts
2. 选择语音：儿童音
3. 输入文字："止" 和 "粉"
4. 下载音频

### 保存位置：
```
public/audio/characters/止.mp3
public/audio/characters/粉.mp3
```

---

## 🎯 音频质量要求

为了与现有248个音频保持一致，请确保：

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| **格式** | MP3 | 统一格式 |
| **采样率** | 24kHz | 清晰度足够 |
| **比特率** | 96 kbps | 平衡质量和大小 |
| **声道** | 单声道 | 节省空间 |
| **时长** | 1-2秒 | 简短明确 |
| **音色** | 童声 | 适合儿童 |
| **语速** | 慢速 (0.8x) | 清晰易懂 |

---

## ✅ 验证是否成功

### 1. 检查文件是否存在
```bash
# Windows PowerShell
ls public/audio/characters/止.mp3
ls public/audio/characters/粉.mp3

# 或者
dir public\audio\characters\止.mp3
dir public\audio\characters\粉.mp3
```

### 2. 检查文件大小
```bash
# 正常大小应该在 10-50 KB 之间
ls -lh public/audio/characters/*.mp3 | grep -E "(止|粉)"
```

### 3. 测试播放
- 刷新项目页面 (http://localhost:3000)
- 进入第7关，点击汉字"止"，应该能听到读音
- 进入第21关，点击汉字"粉"，应该能听到读音

---

## 🐛 常见问题

### Q1: 浏览器工具无法生成音频
**原因**：浏览器不支持Web Speech API  
**解决**：使用最新版Chrome、Edge或Safari浏览器

### Q2: Python脚本报错 "No module named 'gtts'"
**原因**：未安装gTTS库  
**解决**：运行 `pip install gtts`

### Q3: 下载的音频无法播放
**原因**：格式不正确或文件损坏  
**解决**：
1. 使用VLC媒体播放器测试
2. 重新生成音频
3. 尝试使用其他方法

### Q4: 音频文件名乱码
**原因**：Windows系统编码问题  
**解决**：
```bash
# 使用PowerShell重命名
Rename-Item "下载的文件.mp3" -NewName "止.mp3"
```

---

## 🎉 完成后的确认

运行以下命令检查音频文件数量：

```bash
# Windows PowerShell
(Get-ChildItem public\audio\characters\*.mp3).Count
# 应该显示 250

# 或者使用 Git Bash / WSL
ls public/audio/characters/*.mp3 | wc -l
# 应该显示 250
```

如果显示 **250**，恭喜你！项目已经 **100% 完成**！🎉

---

## 💡 高级选项

### 批量生成所有250个音频（可选）

如果你想重新生成所有音频文件，可以修改Python脚本：

```python
# 编辑 scripts/generate-audio.py
# 将 CHARACTERS 列表替换为完整的250个汉字

# 然后运行
python scripts/generate-audio.py --all
```

### 自定义语音参数

编辑 `generate-audio.py` 中的参数：

```python
tts = gTTS(
    text=char,
    lang='zh-CN',
    slow=True,      # 慢速播放
    tld='com'       # 使用 .com 的语音引擎
)
```

---

## 📞 需要帮助？

如果遇到问题，请：
1. 检查上面的"常见问题"部分
2. 查看浏览器控制台的错误信息
3. 确认Python和pip已正确安装
4. 联系开发团队

---

**预计耗时**：3-5分钟  
**难度等级**：⭐ 简单  
**成功率**：99%

开始吧！💪

