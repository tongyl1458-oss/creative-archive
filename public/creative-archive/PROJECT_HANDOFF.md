# 刘怡彤创意作品集网站 — 完整项目交接文档

> **最后更新**: 2026-08-28
> **项目路径**: `d:\Trae\内容\creative-archive\`
> **沟通语言**: 中文

---

## 一、项目概述

个人创意作品集网站，属于创意导演/AI导演刘怡彤(LIUYITONG)。纯HTML/CSS/JavaScript，无构建工具，无后端，静态部署。

**技术栈**:
- 纯 HTML/CSS/JS，无框架无构建工具
- 3D CSS transforms（文件夹3D效果）
- Glassmorphism 设计（磨砂玻璃质感）
- CSS @keyframes 动画 + requestAnimationFrame
- IntersectionObserver 滚动触发动画
- 事件委托（document级addEventListener）
- HTML5 Audio/Video API

---

## 二、页面结构（6个HTML页面）

### 1. index.html — 首页 (74KB)
- **导航栏**: LIUYITONG / Creative / AI Director + Home | Archive | Films | Concepts | AI Lab | Visual
- **Hero区**: 4个档案卡片（01 影像作品 / 02 创意概念 / 03 智能实验室 / 04 视觉设计）
  - 卡片有磨砂玻璃质感，hover时 translateY(-35px) + translateZ(120px) + scale(1.05)
  - 每张卡片右上角有眼睛图标（30×30px，磨砂玻璃背景，黑色线条SVG，hover时弹性缩放1.12倍）
  - 卡片点击跳转: films→films.html, concepts→concepts.html, ai→ai-lab.html, visual→visual.html
- **ARCHIVE板块** (id="archive"): 个人档案自我介绍（回形针装饰、元数据表格、关键词标签、印章）
- **CONCEPTS区**: 3D文件夹场景（3个文件夹：城市重庆/AI科普/AI小狗玩偶），从水中浮出
- **Process板块**: 创作流程 IDEA→SCRIPT→STORYBOARD→VISUAL→FINAL FILM
- **Footer**
- **自定义鼠标**: 黑色圆点(6px) + 橙色(#FF8A3D)拖尾 + 36px半透明外环，hover时外环缩放

### 2. creative-archive.html — 备用首页 (74KB)
- 与 index.html 结构基本一致
- 导航链接使用内部锚点

### 3. films.html — 影像作品页 (68KB)
- 左侧信息面板 + 右侧胶片轮播 + 中央舞台
- 视频播放器弹窗
- 返回首页按钮（导航栏下方，药丸形磨砂玻璃）
- 自定义鼠标效果

### 4. concepts.html — 创意概念页 (68KB)
- 3D文件夹场景（3个文件夹：城市重庆、AI科普、AI小狗玩偶）
- 文件夹从水中浮出动画（translateY(320px)→translateY(-30~-40px)）
- 水波纹视频背景（pointer-events: none）
- 点击文件夹弹出Process Overlay（IDEA→SCRIPT→STORYBOARD→FINAL FILM）
- **此页面不可修改**（用户明确要求保持不变）
- 返回首页按钮

### 5. ai-lab.html — AI Lab页 (57KB)
- **Hero**: 标题 "AI LAB / 智能探索实验室"，slogan "从'随机生成'到'导演级可控'——探索AIGC的无限可能"
- **四个阶段模块**:
  1. 音乐初探: 黑胶唱片旋转动画 + 波形可视化 + 播放控制 (music/ai-song.mp3)
  2. 工作流搭建: 文生图+图生视频合并为一个工作流卡片，预留资料空隙
  3. 进阶可控: 分屏布局展示
  4. 在研大作: 发光进度卡片(60%完成)，任务卡片分已完成和进行中两行
- **幕后工作片段**: 3列瀑布流布局，视频自动播放，缩小素材面积
- **概念MV素材区**: 4列Grid布局(1/1等比单元格, object-fit: contain)，包含歌曲/场景/人物/道具素材
  - music/pink-static.mp3 (歌曲)
  - bts/mv-character.png (角色设定图)
  - bts/mv-scene-palace.png (天空宫殿场景)
  - bts/mv-scene-digital.png (数字幻境场景)
  - bts/mv-prop-bow.png (丘比特之弓道具)
- **Sticky标签筛选栏**: 全部/音乐/工作流/视频
- **配色**: 统一蓝色主色调 (#3B82F6, #60A5FA, #0EA5E9)，无绿色无橙色
- **返回首页按钮** + 移动端全面适配(断点760px/480px)
- 标注用"文图生视频"而非"文生视频"

### 6. visual.html — 视觉设计页 (15KB) ← **当前任务焦点**
- **Hero**: 标题 "VISUAL / 视觉设计"
- **圆形画廊**: 10张图片排列成圆形，围绕中心"设计作品"文字缓慢旋转
  - 中心: 磨砂玻璃圆形(140×140px)，显示"设计作品" + "DESIGN"
  - 装饰: 两条虚线/点线圆环
  - 图片: 130×170px，圆角14px，磨砂阴影
  - 旋转: requestAnimationFrame，每帧0.08度
  - hover: 图片向外跳出(放大1.25倍+外移45px)，旋转暂停，其他图片变暗(brightness 0.7)
  - 底部标签: 悬停时显示图片名称
- **10张图片来源**:
  - 4张海报: 小暑海报、人工智能、高考加油、儿童节
  - 3张PS作品(从PDF提取): 草莓创意、时空之门、书卷城市
  - 3张摄影作品(从PDF提取): 冰水酒杯、玫瑰餐盘、伏特加
- **响应式**: 760px/480px断点，缩小圆环和图片

---

## 三、统一导航栏（所有页面一致）

```
左侧: LIUYITONG (加粗) / Creative / AI Director (灰色)
右侧: Home | Archive | Films | Concepts | AI Lab | Visual
```
- 当前页面有active下划线
- hover有下划线动画
- 半透明磨砂玻璃背景 (rgba(240,240,243,0.75) + backdrop-filter blur(20px))

### 返回首页按钮（子页面统一）
- 位置: fixed top:88px left:48px（导航栏下方）
- 样式: 药丸形磨砂玻璃，左箭头图标 + "Home"文字
- 移动端: top:76px left:24px，隐藏文字只显示图标

---

## 四、文件目录结构

```
d:\Trae\内容\creative-archive\
├── index.html                    # 首页
├── creative-archive.html         # 备用首页
├── films.html                    # 影像作品
├── concepts.html                 # 创意概念 (不可修改)
├── ai-lab.html                   # AI Lab
├── visual.html                   # 视觉设计 (当前任务)
├── PROJECT_HANDOFF.md            # 本文档
├── images/
│   ├── folder-glass-clean.png    # 文件夹透明背景图
│   ├── portrait.jpg              # 人像
│   ├── ai-lab-stage3.jpg         # AI Lab进阶可控配图
│   ├── pdf-figures/              # concepts.html用图
│   │   ├── page1_img1~7.png      # 重庆项目配图
│   │   ├── ai-page1~2_img*.png   # AI科普项目配图
│   │   └── dog-page1~3_img*.png  # 小狗玩偶项目配图
│   └── visual-works/             # visual.html用图
│       ├── poster-xiaoshu.png    # 小暑海报 (600×848)
│       ├── poster-ai.png         # 人工智能海报 (600×848)
│       ├── poster-gaokao.png     # 高考海报 (600×848)
│       ├── poster-children.png   # 儿童节海报 (600×1066)
│       ├── ps-works-1.png         # PS作品:草莓 (600×776)
│       ├── ps-works-2.png        # PS作品:时空之门 (600×520)
│       ├── ps-works-3.png        # PS作品:书卷城市 (600×426)
│       ├── photography-works-1.png  # 摄影:冰水酒杯 (600×776)
│       ├── photography-works-2.png  # 摄影:玫瑰餐盘 (600×520)
│       └── photography-works-3.png  # 摄影:伏特加 (600×426)
├── bts/                          # 幕后素材
│   ├── img-chongqing-valley.png  # 重庆峡谷
│   ├── img-flood-city.png        # 洪水城市
│   ├── img-monster-store.png     # 怪物商店
│   ├── img-phoenix.png           # 凤凰
│   ├── mv-character.png          # MV角色设定图
│   ├── mv-scene-palace.png       # MV天空宫殿场景
│   ├── mv-scene-digital.png      # MV数字幻境场景
│   ├── mv-prop-bow.png           # MV丘比特之弓道具
│   ├── vid-city-road.mp4         # 城市道路视频
│   ├── vid-hotpot-pixel.mp4      # 火锅像素视频
│   ├── vid-satellite.mp4         # 卫星俯瞰视频
│   └── vid-tear.mp4              # 眼泪视频
├── music/
│   ├── ai-song.mp3               # AI Lab音乐
│   └── pink-static.mp3          # MV概念歌曲
├── videos/
│   ├── chongqing.mp4             # 重庆纪录片
│   ├── ai-kunpeng.mp4            # AI鲲鹏
│   ├── ai-luosifen-ad.mp4        # AI罗森芬广告
│   ├── ai-puppy.mp4              # AI小狗玩偶
│   ├── ai-science.mp4            # AI科普
│   ├── ai-chongqing-stardew.mp4  # AI重庆星露谷
│   ├── chongqing-cover.png       # 重庆封面
│   ├── luosifen-cover.png        # 罗森芬封面
│   └── water-ripple.mp4          # 水波纹背景
└── _shared/                      # 共享资源
```

---

## 五、用户信息

- 姓名: 刘怡彤 / LIUYITONG
- 角色: Creative / AI Director
- 邮箱: 113907111@qq.com
- 手机: 13945701729
- MBTI: ENTP
- 关键词: 创造力、想象力、执行力、学习能力

---

## 六、设计约束（用户硬性要求）

### 全局
- **配色**: 以蓝色为主色调 (#3B82F6)，不要绿色和橙色
- **背景色**: #F0F0F3
- **质感**: 磨砂玻璃 (backdrop-filter: blur + rgba背景)
- **自定义鼠标**: 黑色圆点(6px) + 橙色(#FF8A3D)拖尾 + 36px半透明外环
  - hover目标元素时: 外环缩放，箭头指向目标元素（文件夹/联系按钮/视频卡片）
  - 移动端/触摸设备降级
- **排版**: 紧凑排列，上下对齐左右对齐，只缩放不裁剪素材
- **视频标签**: 用"文图生视频"而非"文生视频"
- **入场动画**: 子页面用简洁fadeUp动画，不要和首页一样的复杂intro overlay

### 首页 Hero 区卡片
- 卡片右上角眼睛图标: 30×30px (平板26px/手机22px)，12px右上边距
- 黑色线条SVG(14px)，磨砂玻璃背景(blur(10px) saturate(1.4))
- hover时弹性缩放1.12倍，背景变实色
- pointer-events: none 不干扰卡片交互
- 卡片hover: translateY(-35px) + translateZ(120px) + scale(1.05) + dim-other暗化
- 使用 `.js-hover` 类代替 `:hover`，通过 document级 mousemove + getBoundingClientRect() 碰撞检测

### CONCEPTS 区（不可修改）
- 3D文件夹: 260×245px，folder-glass-clean.png透明背景
- 文字标签在文件夹内部底部，半透明白色背景+磨砂模糊
- 水波纹区域 pointer-events: none
- 文件夹子元素(folder-img, folder-label, folder-shadow) pointer-events: none
- 浮出动画: 从 translateY(320px) 浮出到 translateY(-30~-40px)
- hover: 18px上移+弹性easing+阴影反向位移+玻璃效果增强(blur 32px, saturate 1.8)
- 所有CSS hover规则必须同时包含 `:hover` 和 `.js-hover` 两个选择器

### AI Lab 页
- 配色: 统一蓝色(#3B82F6, #60A5FA, #0EA5E9)，无绿色无橙色
- 工作流: 文生图+图生视频合并为一个部分
- 在研大作: "进行中"任务单独放一行
- 幕后片段: 3列瀑布流，缩小素材面积
- MV素材区: 4列Grid(1/1等比, object-fit: contain, padding:10px, border-radius:8px)
- 返回首页按钮在导航栏下方
- Hero区 padding-top: 140px(桌面)/120-130px(移动) 避免导航栏遮挡
- 移动端断点: 760px(平板)/480px(小手机)

### Visual 页（当前任务）
- 10张图片圆形排列，围绕中心"设计作品"文字旋转
- 鼠标扫过有跳出效果（放大+外移+其他变暗+暂停旋转）
- 图片原始文字暂未去除（用户说先放到网页上，后续再处理）

---

## 七、当前任务状态

### 已完成
1. ✅ visual.html 圆形画廊布局已实现
2. ✅ 10张图片已放入 `images/visual-works/` 目录
3. ✅ 从PDF"赵琳琳作品集.pdf"提取了PS作品(3张)和摄影作品(3张)
4. ✅ 4张海报原图已复制到项目目录（未去文字）
5. ✅ 圆形旋转动画 + 鼠标hover跳出效果已实现
6. ✅ 响应式适配(760px/480px断点)
7. ✅ 所有页面导航栏已添加Visual链接
8. ✅ index.html卡片点击跳转visual.html已实现

### 待完成（用户明确要求但尚未执行）
1. **去掉图片中繁杂的文字** — 用户原话："首先把图片中繁杂的文字去掉"
   - 4张海报图片包含公司logo(金三惠)、电话(400-921-8830)、二维码、公司名称等
   - PS作品1有"Sweet strawberry"文字和"Lnyy"签名
   - 用户后来说"你先别去掉文字了，你把我发给你的图片先放到网页上"
   - 所以当前是先展示，去文字是后续任务
2. **可能需要微调圆形布局效果** — 用户确认布局后再决定

---

## 八、PDF文件信息

用户上传的PDF文件: `赵琳琳作品集.pdf`（26页）
- 页面1: 封面（个人作品集，赵琳琳，黑龙江大学）
- 页面2: 目录（营销策划/文案作品/影视作品/海报作品）
- 页面3-6: 营销策划
- 页面7-16: 文案作品
- 页面17-21: 影视作品
- 页面22: 海报作品目录（PS作品/摄影作品/海报作品）
- **页面23: PS作品**（提取了3张图片）
- **页面24: 摄影作品**（提取了3张图片）
- 页面25: 海报作品
- 页面26: 感谢页

PDF原文件位于: `c:\Users\gm20250728\.trae-cn\attachments\6a8eaa59a1f3beb2feaba2e0\18d591d6-..._赵琳琳作品集.pdf`

---

## 九、visual.html 技术实现细节

### 圆形排列算法
```javascript
// 10张图片，每张间隔36度
var total = 10;
var radius = 280; // 桌面280px, 平板130px, 手机110px
var rotation = 0; // 持续递增
var isPaused = false; // hover时暂停
var hoveredIndex = -1; // 当前hover的图片索引

function updatePositions() {
  if (!isPaused) rotation += 0.08; // 缓慢旋转
  items.forEach(function(item, i) {
    var angle = (i / total) * Math.PI * 2 + rotation;
    var r = (i === hoveredIndex) ? radius + 45 : radius; // hover时外移45px
    var scale = (i === hoveredIndex) ? 1.25 : 1; // hover时放大1.25倍
    var x = Math.cos(angle) * r;
    var y = Math.sin(angle) * r;
    var itemRot = -rotation * 180 / Math.PI; // 反向旋转保持图片正立
    item.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + itemRot + 'deg) scale(' + scale + ')';
  });
  requestAnimationFrame(updatePositions);
}
```

### 关键CSS
- `.orbit-wrap`: 720×720px容器，居中
- `.orbit-center`: 140×140px磨砂玻璃圆，z-index:5
- `.orbit-item`: 130×170px绝对定位，margin:-85px 0 0 -65px
- `.orbit-item img`: object-fit: cover，hover时scale(1.08)
- `.orbit-item.dimmed`: brightness(0.7) opacity(0.8)
- 装饰环: `.orbit-ring-1`(560px虚线) + `.orbit-ring-2`(680px点线)

---

## 十、concepts.html 关键技术细节

### 文件夹交互修复（重要）
1. **folder-1(AI科普)无法hover/click**: translateZ为负值导致浏览器hit-testing跳过。已改为正值(50px)
2. **hover动画不触发**: 3D transform导致`:hover`伪类失效。已添加JS mousemove + getBoundingClientRect()碰撞检测，手动添加`.js-hover`类
3. **点击不响应**: 添加透明div + document级事件处理 + 坐标碰撞检测兜底

### CSS hover规则模式
所有hover规则都使用双选择器:
```css
.archive-folder:hover, .archive-folder.js-hover { ... }
```

### Process Overlay
- z-index: 1000（高于nav的200）
- 步骤切换: IDEA → SCRIPT → STORYBOARD → FINAL FILM
- 关闭: ESC / 点击背景 / 关闭按钮
- 数据在JS `projects`数组中，每个project有`steps`数组

---

## 十一、本地测试

```bash
cd d:\Trae\内容\creative-archive
python -m http.server 9090
```
访问 http://localhost:9090/visual.html

---

## 十二、注意事项给接手AI

1. **沟通语言为中文**
2. concepts.html **不可修改**（用户明确要求）
3. 修改时保持与其他页面风格一致（磨砂玻璃、蓝色主色调、导航栏样式）
4. PowerShell脚本执行受限，避免使用复杂PS脚本，用基础命令或Python
5. 图片处理用 Python + Pillow (已安装)，不要尝试用Shell编辑图片
6. PDF处理用 PyMuPDF/fitz (已安装)
7. 添加新图片放在对应目录: `images/visual-works/`(visual页) 或 `images/pdf-figures/`(concepts页)
8. visual.html 当前图片**未去文字**，用户后续可能要求去除海报上的公司logo、电话、二维码等
9. 所有CSS hover规则在concepts.html中必须同时包含`:hover`和`.js-hover`两个选择器
10. folder-1的translateZ必须为正值，否则hover/click失效
11. 视频弹窗关闭时清除src防止后台加载
12. 用户重视排版工整、上下左右对齐、只缩放不裁剪
13. 用户要求严格参照参考图实现，不要自己加内容或"敬请期待"
14. 移动端适配很重要，需要测试760px和480px断点
15. 用户上传的附件在 `c:\Users\gm20250728\.trae-cn\attachments\6a8eaa59a1f3beb2feaba2e0\`（只读）
