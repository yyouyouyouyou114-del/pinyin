# 🏎️ 汉字赛车总动员

> 一款专为3-5岁儿童设计的汉字学习游戏，通过赛车主题和游戏化学习方式，帮助孩子在快乐中掌握基础汉字。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-3178c6.svg)

## ✨ 核心特性

### 🎮 游戏化学习体验
- **25个精心设计的关卡**，每个关卡用不同颜色的赛车图标表示
- **250个常用汉字**，按笔画数分为5个大级（1-2画、3-4画、5-6画、7-8画、9-10画）
- **循序渐进的解锁机制**，通过当前关卡才能进入下一关

### 🎯 科学的学习流程
1. **学习模式**：大字展示 + 形象emoji + 拼音标注 + 标准读音
2. **考试模式**：听音识字，4选1选择题，每关10道题
3. **即时反馈**：答对立即表扬，答错温和提示
4. **成绩展示**：详细的成绩单和进度记录

### 🎉 丰富的激励系统
- **40+条表扬语音**：基础表扬、连击表扬、满分庆祝、鼓励语
- **连击系统**：连续答对3题及以上触发特殊表扬
- **满分庆祝**：100分通关显示烟花动画和最热烈的表扬
- **视觉反馈**：炫酷的动画效果和音效配合

### 🎨 精美的视觉设计
- **渐变色彩**：鲜艳明快的色彩搭配
- **流畅动画**：基于 Framer Motion 的丝滑过渡效果
- **响应式设计**：完美适配各种屏幕尺寸
- **儿童友好**：大按钮、圆角设计、高识别度图标

### 🔊 专业的音频管理
- **248个汉字标准读音**（清脆童声）
- **智能预加载**：提前加载即将学习的汉字音频
- **音频解锁机制**：兼容移动端音频播放限制
- **分层音效系统**：按钮音、正确音、错误音、表扬语音

## 🛠️ 技术栈

- **前端框架**：React 18.2 + TypeScript 5.2
- **构建工具**：Vite 5.0
- **状态管理**：Zustand 4.4
- **动画库**：Framer Motion 10.16
- **音频引擎**：Howler.js 2.2
- **样式方案**：Tailwind CSS 3.4
- **图标库**：Lucide React
- **PWA支持**：vite-plugin-pwa（可安装到桌面）

## 📦 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📂 项目结构

```
汉字赛车总动员/
├── public/                  # 静态资源
│   └── audio/              
│       └── characters/      # 248个汉字音频文件
│           ├── 一.mp3
│           ├── 二.mp3
│           └── ...
├── src/
│   ├── pages/              # 页面组件
│   │   ├── HomePage.tsx    # 首页 - 关卡选择
│   │   ├── LearningPage.tsx # 学习页面
│   │   ├── ExamPage.tsx    # 考试页面
│   │   └── ResultPage.tsx  # 结果页面
│   ├── store/
│   │   └── useAppStore.ts  # Zustand 状态管理
│   ├── utils/
│   │   ├── audioManager.ts # 音频管理器
│   │   └── helpers.ts      # 工具函数
│   ├── data/
│   │   ├── characters.json # 汉字数据库（250字）
│   │   ├── emoji-map.json  # 汉字emoji映射
│   │   └── praise-voices.json # 表扬语音配置
│   ├── types/
│   │   └── index.ts        # TypeScript 类型定义
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎯 功能详解

### 1. 首页 - 关卡大厅
- 展示25个关卡，每个关卡用独特的渐变色赛车表示
- 显示关卡解锁状态、最佳成绩、通过徽章
- 实时显示学习进度和已解锁关卡数
- 设置按钮（音量调节、进度重置等）

### 2. 学习页面 - 汉字学习
- **大字卡片展示**：超大字体 + emoji图标 + 拼音 + 笔画数
- **点击播放**：点击卡片播放标准读音
- **左右切换**：方便浏览本关的10个汉字
- **学习进度追踪**：显示已学习的汉字数量
- **开始考试按钮**：学完所有汉字后解锁

### 3. 考试页面 - 听音识字
- **题目播放**：自动播放汉字读音，可重复播放
- **4选1答题**：4张emoji+汉字卡片供选择
- **即时反馈**：
  - ✅ 答对：绿色边框 + 正确音效 + 表扬语音 + 10分
  - ❌ 答错：红色边框 + 提示音 + 显示正确答案 + 鼓励语
- **进度显示**：顶部进度条 + 题号 + 当前分数
- **连击系统**：连续答对3题以上显示"🔥 X连击！"

### 4. 结果页面 - 成绩单
- **大号分数显示**：醒目的分数展示（0-100分）
- **详细统计**：答对题数、正确率
- **等级评价**：
  - 100分：完美通关！🌟
  - 80-99分：通过考试！✅
  - 60-79分：再接再厉！💪
  - <60分：继续努力！
- **操作按钮**：下一关、重新挑战、返回主页
- **满分特效**：烟花动画 + 最热烈的庆祝语音

### 5. 进度管理系统
- **自动保存**：使用 localStorage 自动保存学习进度
- **关卡解锁**：通过当前关卡（≥60分）自动解锁下一关
- **最佳成绩**：记录每关的最高分数和通过次数
- **进度恢复**：重新打开应用自动恢复上次进度

## 🎵 音频系统说明

### 汉字读音
- **数量**：248个汉字音频文件
- **格式**：MP3
- **位置**：`public/audio/characters/`
- **命名规则**：`{汉字}.mp3`（如：`一.mp3`、`人.mp3`）

### 表扬语音
- **基础表扬**（20条）：单题答对时随机播放
- **连击表扬**（10条）：连续答对≥3题时播放
- **满分庆祝**（10条）：100分通关时播放
- **鼓励语**（5条）：答错时温和鼓励

### 音效
- `button`：按钮点击音
- `correct`：答对提示音（愉快的叮咚声）
- `wrong`：答错提示音（温和的提示音）

## 📊 汉字内容规划

| 大级 | 笔画范围 | 关卡数 | 总字数 | 示例汉字 |
|------|---------|--------|--------|----------|
| L1级 | 1-2画 | 3关 | 30字 | 一、人、口、手、上、下 |
| L2级 | 3-4画 | 4关 | 40字 | 山、水、火、木、日、月 |
| L3级 | 5-6画 | 5关 | 50字 | 田、目、耳、石、禾、米 |
| L4级 | 7-8画 | 6关 | 60字 | 花、草、树、林、果、瓜 |
| L5级 | 9-10画 | 7关 | 70字 | 家、校、园、桥、船、车 |

**总计**：25关，250个汉字

## 👨‍💻 开发指南

### 添加新汉字
1. 在 `src/data/characters.json` 中添加汉字数据
2. 准备对应的音频文件放入 `public/audio/characters/`
3. 在 `src/data/emoji-map.json` 中添加emoji映射（可选）

### 自定义表扬语音
1. 编辑 `src/data/praise-voices.json` 配置文件
2. 在 `src/utils/audioManager.ts` 中实现语音播放逻辑

### 调整难度设置
- **通过分数**：在 `src/store/useAppStore.ts` 中修改 `unlockNextStage` 函数
- **题目数量**：在 `src/store/useAppStore.ts` 中修改 `startExam` 函数
- **干扰项数量**：调整 `generateDistractors` 函数参数

## 🎨 自定义样式

项目使用 Tailwind CSS，主要配色在 `tailwind.config.js` 中定义：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#8B5CF6', // 主色调
        600: '#7C3AED',
      }
    }
  }
}
```

## 📱 移动端适配

- ✅ 响应式布局，适配各种屏幕尺寸
- ✅ Touch 事件支持
- ✅ 移动端音频解锁机制
- ✅ PWA 支持，可添加到主屏幕

## 🔧 常见问题

### Q: 音频无法播放？
A: 移动端需要用户交互才能播放音频，请点击任意按钮或卡片激活音频系统。

### Q: 如何重置学习进度？
A: 打开浏览器开发者工具（F12），在 Console 中输入：
```javascript
localStorage.clear()
```
然后刷新页面。

### Q: 如何添加更多汉字？
A: 编辑 `src/data/characters.json` 文件，按照现有格式添加新汉字数据。

### Q: 可以部署到服务器吗？
A: 可以！运行 `npm run build`，将 `dist` 目录部署到任何静态服务器即可。

## 📈 未来计划

- [ ] 背景音乐系统
- [ ] 答题倒计时功能
- [ ] 家长监控面板（学习报告、时长统计）
- [ ] 更多游戏模式（看图选字、汉字配对）
- [ ] 词语和短句学习
- [ ] 汉字书写练习
- [ ] 云端进度同步
- [ ] 多语言支持

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献步骤
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

## 👏 致谢

- 汉字数据来源：《义务教育语文课程常用字表》
- 图标库：[Lucide Icons](https://lucide.dev/)
- 动画库：[Framer Motion](https://www.framer.com/motion/)
- 音频引擎：[Howler.js](https://howlerjs.com/)

## 📮 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/hanzi-racing/issues)

---

<p align="center">
  用❤️制作，为孩子们的汉字学习之旅加油！🚀
</p>

