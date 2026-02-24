# 设计脑暴（Brainstorm）——乐高式知识体系网页

> 目标：把“乐高式知识体系”（L1原料→L2卡片→L3模块→L4主题）做成一个**可搜索、可串联、可复习、可输出**的个人知识库网页。

## 方案 A：Neo-Brutalism 信息控制台（概率 0.27）

- **Design Movement**：Neo-Brutalism / Developer Dashboard
- **Core Principles**：高对比、强边框、信息密度可控、交互反馈直接
- **Color Philosophy**：黑白为底 + 高饱和单一强调色（“标签=彩色积木”），让“结构感”压倒“装饰感”
- **Layout Paradigm**：左侧“知识导航舱”（主题/模块/标签），右侧“工作台”（列表+阅读），顶栏为全局搜索
- **Signature Elements**：粗描边卡片、标签积木颗粒（chip 带凸点纹理）、大字号章节标题
- **Interaction Philosophy**：筛选/切换有明显的“咔哒”感（弹跳、压缩、阴影位移），像扣上积木
- **Animation**：页面加载分段入场；hover 时卡片轻微位移+阴影跳变；切换卡片使用滑入/淡入
- **Typography System**：标题用 **Bebas Neue**（极具张力），正文用 **Literata**（耐读的衬线体）

## 方案 B：Swiss Editorial 知识书房（概率 0.19）

- **Design Movement**：Swiss / Editorial / Knowledge Garden
- **Core Principles**：极致排版、留白、阅读优先、结构索引清晰
- **Color Philosophy**：纸张白 + 墨黑 + 一点森林绿（“成长/复习”）
- **Layout Paradigm**：像一本可检索的百科：目录页（主题地图）→ 模块页（章节）→ 卡片页（条目）
- **Signature Elements**：章节编号系统、边注（meta）、目录点线
- **Interaction Philosophy**：像翻书：过渡克制、强调阅读连续性
- **Animation**：轻微淡入、滚动进度指示
- **Typography System**：标题 **DM Serif Display**，正文 **Source Serif 4**（更书卷气）

## 方案 C：Retro-UI + LEGO Pattern 氛围站（概率 0.11）

- **Design Movement**：Retro Web / Pixel-ish UI
- **Core Principles**：强主题氛围、趣味化、游戏化复习
- **Color Philosophy**：深色底 + 霓虹积木色
- **Layout Paradigm**：模块像关卡、卡片像道具；复习像打怪
- **Signature Elements**：像素阴影、噪点、网格背景
- **Interaction Philosophy**：可玩，但有变“花哨工具”的风险
- **Animation**：更夸张的翻转、弹跳
- **Typography System**：标题像素体（不利中文），中文可读性是风险点

---

## 选定方案（最终采用）：方案 A Neo-Brutalism 信息控制台

理由：
- 你要的是“把零散变系统，并形成持续维护+输出”，本质是一个**知识生产控制台**
- Neo-Brutalism 的强结构与强反馈，非常贴合“乐高积木的拼装感”
- 更利于后续扩展：导入 get笔记、复习计划、输出队列、教学路径等
