# 设计脑暴（Brainstorm）—— Microsoft Fluent 风格重构

> 目标：将“乐高式知识体系”网页从 Neo-brutalism 重构为 **Microsoft Fluent Design (To C 高级感)**。追求专业、通透、高效且愉悦的视觉体验。

## 方案：Fluent Aura 现代生产力工作台

- **Design Movement**：Microsoft Fluent Design System / Modern SaaS
- **Core Principles**：
  - **Depth (深度)**：通过多层阴影和光效建立空间感，而不是粗边框。
  - **Material (材质)**：大量使用 **Acrylic (亚克力)** 和 **Mica (云母)** 效果，即毛玻璃背景与内容穿透感。
  - **Motion (动效)**：优雅的淡入淡出和物理感缩放，模拟 Windows 11 的平滑体验。
- **Color Philosophy**：
  - **Primary**：微软经典蓝 (`oklch(0.58 0.16 255)`) 作为点睛色。
  - **Background**：极简灰白调 (`oklch(0.98 0.01 250)`)，利用明暗对比区分层级。
  - **Accents**：柔和的渐变（蓝色到青色）用于关键视觉区域。
- **Layout Paradigm**：
  - **Floating Panels**：组件呈卡片状悬浮在背景上，而不是被边框锁死。
  - **Sidebar**：半透明侧边栏，支持折叠，图标精致。
- **Signature Elements**：
  - **Glassmorphism (玻璃拟态)**：全局 `backdrop-blur` 处理。
  - **Soft Elevation**：大半径柔和阴影取代 2D 硬阴影。
  - **Subtle Gradients**：顶部 Banner 采用类似 Windows 壁纸的流动感渐变。
- **Typography System**：
  - **Display**：**Plus Jakarta Sans** (中英文表现极佳，极具高级感)。
  - **Body**：**Plus Jakarta Sans** (Medium/Regular)。
- **Probability**：0.95 (完全对齐用户要求)。

---

## 视觉资产规划

1. **Top Banner**：生成一张具有 Windows 11 风格的流动丝绸/波浪纹理背景图（浅色调）。
2. **Icons**：改用 Lucide 的细线风格，匹配 Fluent 规范。
3. **Cards**：去除所有 2px 边框，改为 `border-white/20` 加深色/浅色阴影。

## 核心样式调整清单

- `border-radius`: 全局 `0.75rem` (12px)。
- `shadow`: 自定义 `0 8px 30px rgba(0,0,0,0.04)`。
- `font`: Plus Jakarta Sans。
