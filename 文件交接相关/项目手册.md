# 玉林侨务数字平台 — 项目手册

---

## 第一章 项目结构分析

### 1.1 目录树

```
玉小侨demo/
├── index.html                              # 首页（单屏主视图，核心入口）
├── one-click-update.py                     # 一键更新脚本（Python）
├── openhtml.py                             # 本地打开工具
├── .gitignore
├── pages/                                   # 二级/三级页面目录
│   ├── core-services.html               # 核心服务总览页
│   ├── dynamic.html                       # 侨情动态列表页
│   ├── dynamic-detail.html                # 侨情动态详情页（跳转页）
│   ├── industry.html                      # 侨乡产业总览
│   ├── map.html                           # 地图页（侨商分布图）
│   ├── overview.html                      # 数据概况页
│   ├── industry/                        # 产业详情页（4个）
│   │   ├── ceramics.html              # 陶瓷产业
│   │   ├── mangweaving.html           # 芒编产业
│   │   ├── spice.html                # 香料产业
│   │   └── sweet-potato.html           # 番薯产业
│   └── services/                         # 12个子服务页
│       ├── overseas-service-assistant.html  # ⭐ 侨壮壮 AI 助手（已实现交互）
│       ├── contract-template.html         # 合同生成
│       ├── country-market-analysis.html   # 国别市场分析
│       ├── culture-showcase.html            # 文化展示
│       ├── multilingual-translation.html  # 多语翻译
│       ├── policy-interpretation.html       # 政策解读
│       ├── policy-subscription.html        # 政策订阅
│       ├── project-matchmaking.html        # 项目撮合
│       ├── quotation.html                  # 报价单生成
│       ├── resource-recommendation.html # 资源推荐
│       ├── risk-alert.html                # 风险预警
│       └── supply-chain-collab.html      # 产业链协同
├── js/                                      # 前端脚本（原生 JS，无构建）
│   ├── main.js                           # 首页主逻辑（地图、数据读取、渲染）
│   ├── ark-api-config.js                   # 方舟 API 配置加载器
│   ├── assistant-qiaozhuang-persona.js   # 侨壮壮角色人设（System Prompt）
│   ├── baidu-map-sdk-inject.js           # 百度地图 SDK 动态注入
│   ├── data-utils.js                       # CSV 解析、日期/天气工具、多语本地化
│   ├── home-ui-enhance.js                  # 首页 UI 增强（入场动画、交错序号）
│   ├── i18n-secondary-content.js            # 内嵌翻译表（地名、标签、静态文本）
│   ├── i18n.js                           # 国际化核心（语言切换、AI 翻译补充）
│   ├── map-mid-layer.js                    # 地图中间层（光点、连线、城市聚合）
│   ├── map-preload.js                      # 地图缓存（localStorage）
│   ├── map-shared.js                       # 地图共享工具（坐标、归一化）
│   ├── page-industry-detail.js              # 产业详情页渲染逻辑
│   ├── page-overseas-assistant.js        # 侨壮壮助手页完整交互逻辑
│   ├── page-sections.js                    # 产业/核心服务/动态页的统一渲染
│   ├── page-service-detail.js              # 服务详情页（含报价/合同工具）
│   ├── platform-data-api-config.js          # 平台数据 API 配置（可外部数据）
│   ├── qiaowu-news-loader.js             # 侨情动态加载器（本地 JSON + API）
│   └── dynamic-detail.js                  # 动态详情跳转
├── css/                                      # 样式（原生 CSS，无预处理器）
│   ├── style.css                           # 主样式（深蓝科技风 + 金色点缀）
│   └── home-ui-enhance.css                 # 首页视觉增强
├── date/                                    # ⭐ 数据层（唯一事实数据源）
│   ├── DATA_LOGIC.md                       # 数据逻辑说明
│   ├── datasets.data.js                    # 离线数据聚合文件（供 file:// 访问）
│   ├── merchants.csv                    # 侨商主数据（地图数据来源）
│   ├── demand.csv                        # 侨务需求
│   ├── core_services.csv                  # 核心服务目录
│   ├── industry.csv                      # 产业卡片数据
│   ├── industry_profiles.csv               # 产业详情（hero + block）
│   ├── culture_stories.csv                 # 侨乡文化故事
│   ├── culture_history.csv              # 文化历史时间线
│   ├── culture_figures.csv              # 侨商风采人物
│   ├── culture_ark.json                   # 文化 API 落地 JSON（增强数据）
│   ├── culture_overseas_people.json      # 海外侨胞人物
│   ├── industry_ark.json                 # 产业 API 落地 JSON
│   ├── qiaowu-news.json               # 侨情动态快照
│   ├── qiaowu-news-baseline.json      # 侨情基线数据
│   ├── assistant_categories.csv           # 助手问答分类
│   ├── assistant_qa.csv                  # 助手问答库
│   ├── city-coords.json               # 城市坐标缓存
│   ├── map_style_data.json            # 夜色地图样式配置
│   ├── map_cities.csv               # 城市坐标补充
│   ├── volc-ark-apis.json               # ⭐ API 密钥总配置（密钥集中管理）
│   ├── ark-api.local.example.json       # 本地 API 配置示例
│   ├── contract-templates.json          # 合同模板
│   ├── quotation-templates.json          # 报价模板
│   ├── last_update_timestamp.json      # 最后更新时间戳
│   └── dynamic.csv                     # 侨情动态 CSV
├── scripts/                                   # Python + PowerShell 维护脚本
│   ├── one-click-update.py                # 一键更新（根目录入口）
│   ├── ensure_deps.py                    # 依赖安装与检查
│   ├── deps_bootstrap.py               # 依赖引导（requests/Pillow/rembg）
│   ├── sync-data.ps1                    # CSV → datasets.data.js 同步脚本
│   ├── daily_data_update.py            # 日常数据 API 更新（产业/文化/文化）
│   ├── fetch_qiaowu_to_date.py         # 抓取侨情动态 → JSON
│   ├── fetch_culture_data_api.py       # 文化数据 API 抓取
│   ├── fetch_industry_data_api.py       # 产业数据 API 抓取
│   ├── translate_content_api.py         # 内容翻译（AI）
│   ├── post_update_translate_data.py   # 更新后翻译
│   ├── build_qiaozhuang_mascot.py    # 吉祥物处理
│   ├── convert_qiaozhuang_idle_video_to_loop_webm.py
│   ├── process_ui_assets.py              # UI 资源处理
│   ├── process_page_backgrounds.py      # 页面背景处理
│   ├── prebundle_check.py               # 打包前检查
│   ├── package_dist.py                  # 打包为演示包
│   ├── serve-static.bat               # 本地静态服务器启动
│   ├── start-local-server.ps1
│   ├── sync-city-coords.ps1
│   ├── ark_defaults.py
│   └── volc_keys.py
├── images/                                  # 静态图片/视频/图标资源
│   ├── brand/
│   ├── culture/
│   ├── demand/
│   ├── icons/
│   ├── industry/
│   └── placeholders/
├── reference/                               # 参考资料与功能演示包
│   ├── 合同生成功能演示包_中文文件名/
│   ├── 报价单功能演示包_中文文件名/
│   └── 桥壮壮图/
│   └── Cursor_玉林侨乡文化人物采集说明.md
├── docs/                                   # 现有说明文档
│   ├── API说明.md
│   ├── CONFIG_AND_DATA.md
│   ├── requirements.md
│   ├── 项目框架说明.md
│   └── 玉林侨乡文化人物数据核对清单.md
└── .venv/                                  # Python 虚拟环境（开发时）
```

### 1.2 模块划分

| 模块层级 | 职责 | 关键目录/文件 |
|--------|------|-------------|
| **入口层** | 用户首次访问的第一个页面 | `index.html` |
| **页面层** | 12+5 个功能页面 | `pages/*.html`、`pages/services/*.html`、`pages/industry/*.html` |
| **逻辑层** | 页面渲染、数据读取、交互 | `js/*.js`（13+ 个脚本文件） |
| **数据层** | 所有业务数据的事实源 | `date/*.csv` + `date/*.json` |
| **样式层** | 视觉呈现 | `css/*.css` |
| **资源层** | 图片、视频、图标 | `images/` |
| **维护层** | 数据更新、打包、翻译 | `scripts/*.py`、`scripts/*.ps1` |
| **配置层** | API Key 与 密钥 | `date/volc-ark-apis.json` |
| **参考层** | 功能演示包与参考素材 | `reference/` |

### 1.3 主要文件说明（按职责分类

#### HTML 页面

| 文件 | 角色 |
|------|------|
| `index.html` | 首页（核心入口，默认单屏布局，包含地图 + 动态 + 服务 + 产业四栏 |
| `pages/map.html` | 全屏地图页，含城市筛选、侨商名录 |
| `pages/industry.html` | 产业总览页（动态列表 |
| `pages/services/overseas-service-assistant.html` | ⭐ 侨壮壮 AI 助手页（唯一有真实交互的服务页 |
| `pages/dynamic.html` | 侨情动态列表（支持刷新、多语 |
| `pages/core-services.html` | 核心服务目录 |
| `pages/overview.html` | 数据概况（merchants 派生统计 |

#### JS 脚本（13+ 个文件，共约 ~4000 行

| 文件 | 核心职责 |
|------|---------|
| `main.js` | 首页主逻辑：CSV 加载 → 归一化 → 地图渲染 → 动态轮播 → 需求滚动 → 服务卡片 → 产业卡片 |
| `page-overseas-assistant.js` | AI 助手页：输入框 → 流式响应 → 分类卡 → 推荐问题 → 数字人视频 |
| `qiaowu-news-loader.js` | 侨情动态加载器：本地 JSON 合并 CSV → 会话缓存 → API 抓取 → 去重 |
| `page-sections.js` | 统一渲染器：核心服务卡片/产业/动态列表多语本地化 |
| `page-service-detail.js` | 服务详情页：报价单/合同/文化展示等工具逻辑 + 多语 |
| `page-industry-detail.js` | 产业详情：CSV → JSON 补充 → 多语 → 渲染 |
| `i18n.js` | 语言切换、内嵌翻译、AI 翻译补充 |
| `i18n-secondary-content.js` | 大翻译表（地名、标签、静态文本 |
| `data-utils.js` | CSV 解析器（带引号处理、换行处理）→ 日期天气工具、多语本地化 |
| `map-shared.js` | 地图共享：城市聚合、坐标归一化、地图样式 |
| `map-mid-layer.js` | 地图光点、从玉林辐射连线动画 |
| `baidu-map-sdk-inject.js` | 动态注入百度地图 JS API |
| `ark-api-config.js` | 加载 `volc-ark-apis.json` → 挂载到 `window.__BAIDU_MAP_AK、`window.ASSISTANT_ARK` 等全局对象 |
| `platform-data-api-config.js` | 平台外部数据 API（可替换为真实后端 |
| `assistant-qiaozhuang-persona.js` | 侨壮壮角色人设（System Prompt |
| `map-preload.js` | 地图缓存管理 |
| `home-ui-enhance.js` | 首页入场动画 |
| `dynamic-detail.js` | 动态详情跳转逻辑 |

#### CSS 样式

| 文件 | 职责 |
|------|------|
| `style.css` | 主样式（深蓝科技风 |
| `home-ui-enhance.css` | 首页视觉增强动画 |

#### 数据文件（date/）

**CSV 类（业务数据核心）

| 文件 | 内容 | 渲染位置 |
|------|------|--------|
| `merchants.csv` | ⭐ 侨商数据（城市、国家、经纬度、类型、描述、联系方式） | 首页地图、数据概况、地图页 |
| `core_services.csv` | 核心服务目录 | 首页核心服务卡、核心服务页 |
| `industry.csv` | 产业卡片 | 首页产业条、产业总览页 |
| `demand.csv` | 侨务需求 | 首页需求滚动 |
| `dynamic.csv` | 侨情动态 | 首页动态列表页 |
| `industry_profiles.csv` | 产业详情内容 | 产业详情页 |
| `culture_stories.csv` | 文化故事 | 文化展示 |
| `culture_history.csv` | 文化时间线 | 文化展示 |
| `culture_figures.csv` | 侨商风采人物 | 文化展示 |
| `assistant_categories.csv` | 助手问答分类 | AI 助手页 |
| `assistant_qa.csv` | 助手问答库 | AI 助手推荐问题 |
| `map_cities.csv` | 城市坐标补充 | 地图兜底 |

**JSON 类（配置与增强）

| 文件 | 用途 |
|------|------|
| `volc-ark-apis.json` | ⭐🔑 API 密钥总配置（含百度 AK + 方舟 API Key） |
| `datasets.data.js` | 离线数据聚合（file:// 访问时用） |
| `qiaowu-news.json` | 侨情动态快照（首页动态列表 |
| `qiaowu-news-baseline.json` | 侨情基线（基线数据（本地备用） |
| `industry_ark.json` | 产业增强数据（API 落地 JSON） |
| `culture_ark.json` | 文化增强数据 |
| `culture_overseas_people.json` | 海外侨胞人物 JSON |
| `city-coords.json` | 城市坐标缓存 |
| `map_style_data.json` | 夜色地图样式配置 |
| `contract-templates.json` | 合同模板数据 |
| `quotation-templates.json` | 报价模板数据 |
| `last_update_timestamp.json` | 最后更新时间戳 |

#### Python 脚本（scripts/）

| 脚本 | 功能 |
|------|------|
| `one-click-update.py` | 一键更新入口（5 步） |
| `ensure_deps.py` | 依赖安装/检查 |
| `deps_bootstrap.py` | 依赖引导（requests/Pillow/rembg） |
| `daily_data_update.py` | 日常数据更新 |
| `fetch_qiaowu_to_date.py` | 抓取侨情动态 → `date/` |
| `fetch_culture_data_api.py` | 文化数据 API 抓取 |
| `fetch_industry_data_api.py` | 产业数据 API 抓取 |
| `translate_content_api.py` | 内容翻译 |
| `post_update_translate_data.py` | 更新后翻译处理 |
| `build_qiaozhuang_mascot.py` | 吉祥物处理 |
| `convert_qiaozhuang_idle_video_to_loop_webm.py` | 吉祥物视频转 WebM |
| `process_ui_assets.py` | UI 资源处理 |
| `process_page_backgrounds.py` | 背景处理 |
| `prebundle_check.py` | 打包前检查 |
| `package_dist.py` | 打包分发 |
| `ark_defaults.py` | 方舟默认配置 |
| `volc_keys.py` | 密钥管理 |

#### PowerShell 脚本（scripts/）

| 脚本 | 功能 |
|------|------|
| `sync-data.ps1` | CSV → `datasets.data.js` |
| `start-local-server.ps1` | 启动本地服务器 |
| `sync-city-coords.ps1` | 同步城市坐标 |
| `serve-static.bat` | Windows 批处理启动服务器 |

---

## 第二章 技术架构分析

### 2.1 技术栈全景

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户浏览器                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  HTML/CSS（静态页面 + 深蓝科技风视觉           │   │
│   │  (pages/*.html + css/*.css                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                              ↓                                           │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  原生 JavaScript（13+ 个脚本                    │   │
│   │  无构建步骤、无 Webpack/Vite/Rollup            │   │
│   │  通过 <script> 标签顺序加载                         │   │
│   └─────────────────────────────────────────────────────┘   │
│                              ↓                                           │
│   ┌──────────────────────┐   ┌──────────────────────┐    │
│   │  数据层：CSV/JSON   │   │  第三方服务        │    │
│   │  date/*.csv         │   │  百度地图 JS API    │    │
│   │  date/*.json        │   │  字节跳动火山方舟    │    │
│   └──────────────────────┘   └──────────────────────┘    │
│                              ↑                                                  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Python 维护脚本（离线数据流水线                   │   │
│   │  scripts/*.py + scripts/*.ps1                    │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 前端架构决策（无框架原生 JS

| 技术 | 版本/说明 | 实际作用 |
|------|---------|---------|
| **HTML5** | 原生、无模板引擎 | 页面结构骨架 |
| **原生 CSS** | 无 Sass/Less | 深蓝科技风 + 金色点缀 |
| **原生 JavaScript** | ES6+ 语法 | 全部交互逻辑、数据渲染 |
| **百度地图 JS API GL** | v1.0 WebGL 版 | 地图可视化、光点动画 |
| **字节跳动火山方舟** | API v3 版 | AI 对话（Chat Completions |
| **sessionStorage/localStorage** | Web 标准 | 地图缓存、侨情动态缓存 |
| **Fetch API** | 浏览器原生 | 数据文件读取 |
| **MutationObserver** | 浏览器原生 | DOM 变化监听 |

**前端架构特点：

1. **零依赖前端**：不使用任何构建工具、框架（Vue/React/Angular、Webpack、Vite 均未使用
2. **脚本按顺序加载**：通过 `<script>` 标签顺序加载
3. **数据分离**：数据完全写在 JS 代码中，通过 `date/` 目录
4. **全局对象通信**：脚本通过 `window.XXX` 全局对象共享状态
5. **单页/多页混合**：页面间通过超链接跳转

### 2.3 数据处理方案

| 组件 | 作用 | 技术 |
|------|------|------|
| **CSV 解析** | 数据文件读取与解析 | `js/data-utils.js` 自定义解析器 |
| **JSON 配置** | API 密钥/地图样式/增强数据 | 原生 `JSON.parse` |
| **离线聚合** | `file://` 兜底 | `date/datasets.data.js` |
| **会话缓存** | 地图数据 localStorage | `js/map-preload.js` |
| **动态缓存** | 侨情数据 sessionStorage | `js/qiaowu-news-loader.js` |

**CSV 解析器能力**（`data-utils.js`）：
- 支持带引号字段
- 支持引号内逗号
- 支持多语字段（title_en、summary_en

### 2.4 可视化方案

| 组件 | 技术 | 说明 |
|------|------|------|
| **地图可视化** | 百度地图 GL（WebGL 版） | 以玉林为原点 → 向东南亚城市辐射光点、光点、城市聚合 |
| **夜色地图** | `js/map-shared.js` | 深蓝底、金色边界、`map_style_data.json` 样式 |
| **数据概览卡片 | 动态统计 | 从 merchants.csv → 自动派生统计数字 |
| **列表滚动** | CSS 动画 + JS 定时 | 需求卡片自动上滚 |
| **产业卡片** | CSS Grid + 悬停动画 |

### 2.5 第三方服务

| 服务 | 用途 | 配置位置 |
|------|------|---------|
| **百度地图 JS API GL** | 地图可视化、坐标、地图样式 | `date/volc-ark-apis.json` → `baiduMapAk` |
| **字节跳动火山方舟（Ark）** | AI 对话（侨壮壮助手） | `date/volc-ark-apis.json` → `qiaozhuangApiKey` |
| **字节跳动火山方舟（数据侧）** | 侨情动态生成/产业内容增强 | `dataApiKey` |
| **字节跳动火山方舟（翻译）** | 英文内容翻译补充 | `translationApiKey` |

### 2.6 构建与部署

**无构建步骤**：项目是纯静态站点

- **部署方式**：
  - 本地：`scripts/start-local-server.ps1`（Python http.server）
  - 或任意静态服务器（Nginx、Apache、GitHub Pages 均可）
  - `file://` 协议也可访问（用 `datasets.data.js` 兜底）

**发布流程**：`scripts/package_dist.py` → 生成演示包

---

## 第三章 数据流分析

### 3.1 数据流总览

```
                    ┌──────────────┐
                    │   原始   │
                    │ CSV/JSON │
                    └────┬─────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │merchants│   │industry │   │ 动态/文化│
    │.csv      │   │.csv      │   │ 动态/文化│
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │                │                │
         ▼                ▼                ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │ 归一化     │   │ CSV 解析     │   │ JSON 解析   │
    │ 城市聚合   │   │ + JSON 补充   │   │ + API 抓取  │
    │ 经纬度补全 │   │ 多语翻译   │   │ 会话缓存   │
    └────┬──────┘   └────┬──────┘   └────┬──────┘
         │                │                │
         └────────┬───────┘                │
                  │                           │
                  ▼                           ▼
           ┌────────────────────┐   ┌────────────────────┐
           │  渲染：            │   │  渲染：             │
           │  - 地图光点+连线   │   │  - 列表/卡片    │
           │  - 数据概况卡片     │   │  - 动态列表      │
           │  - 首页产业条      │   │  - 文化展示      │
           └────────────────────┘   └────────────────────┘
                  │                           │
                  └──────────┬──────────────┘
                              ▼
                    ┌──────────────────┐
                    │     用户         │
                    │  查看/交互        │
                    └──────────────────┘
```

### 3.2 核心数据：merchants.csv → 地图与概况的唯一事实源

**读取位置**：`date/merchants.csv`

**字段结构**（按实际 CSV 字段）：

| 字段 | 说明 | 用途 |
|------|------|------|
| city | 城市名 | 地图标注、统计 | |
| country | 国家名 | 地图范围筛选（东南亚优先 | |
| lat | 纬度 | 地图坐标 | |
| lng | 经度 | | |
| merchant_type | 侨商类型 | 分类显示 |
| merchant_name | 侨商名 | 列表显示 |
| merchant_desc | 描述 | 详情内容 |
| contact | 联系方式 | 列表详情 |

**数据派生统计**（首页自动计算：

- 国家数：按 country 去重
- 城市数：按 city+country 去重
- 侨企数：按 country+city+type 聚合
- 活跃节点数
- 数据概况项

### 3.3 数据流详细

**首页渲染链路（`main.js`）

```
1. DOMContentLoaded 事件触发
   ↓
2. 判断协议检测
   - file:// → 读取 datasets.data.js
   - http(s):// → fetch(date/*.csv
   ↓
3. 读取 merchants.csv → 归一化
   - 字段映射（city/country/lat/lng/type/name/desc/contact
   ↓
4. 范围筛选（中国仅玉林/南宁/柳州/桂林/北海
   东南亚 11 国
   ↓
5. 聚合统计（国家/城市/企业统计数
   ↓
6. 渲染
   ├── 数据概况卡（6 项统计
   ├── 地图（百度地图 GL → 光点+连线
   ├── 侨情动态（轮播 → 动态卡片
   ├── 核心服务（核心服务卡
   ├── 产业条（4 个产业
   └── 需求滚动（自动滚动

```

**地图页数据流**（`pages/map.html` + `js/page-map.js`）

```
merchants.csv → 归一化 → 左侧筛选
   ↓
城市聚合 → 右侧名录 → 地图光点 → 点击联动
   ↓
筛选（城市/类型/关键词） → 实时更新地图与名录
```

**产业页数据流**（`pages/industry.html` + `js/page-sections.js`）

```
industry.csv → 解析 → 卡片网格
   ↓
industry_ark.json（可选）→ 增强补充
   ↓
按语言（zh-CN / en-US）
   ↓
渲染产业卡片网格
```

**产业详情页数据流**（`pages/industry/*.html` + `js/page-industry-detail.js`）

```
industry.csv（基础数据
   ↓
industry_profiles.csv（hero + blocks
   ↓
industry_ark.json（增强数据（API 落地
   ↓
多语本地化 + AI 翻译（英文
   ↓
渲染详情页
```

**侨情动态数据流**（`pages/dynamic.html` + `js/qiaowu-news-loader.js` + `js/page-sections.js`）

```
读取优先级：

1. sessionStorage 缓存（最快）
2. qiaowu-news.json（本地 JSON
3. dynamic.csv（CSV 补充）
4. 方舟 API（动态生成（可选，需 dataApiKey）
   ↓
合并 → 去重（按 URL 去重
   ↓
按时间排序 → 渲染列表
   ↓
点击卡片 → 动态详情页（dynamic-detail.html）→ 跳转原 URL
```

**侨壮壮助手数据流**（`pages/services/overseas-service-assistant.html` + `js/page-overseas-assistant.js`）

```
用户输入
   ↓
assistant_categories.csv → 分类卡片网格
   ↓
assistant_qa.csv → 推荐问题
   ↓
qiaozhuang-persona.js → System Prompt
   ↓
assistant_ark.json → API 调用
   ↓
流式响应（SSE）→ 实时输出
```

### 3.4 数据文件间关联

```
merchants.csv
    → 首页地图、数据概况、地图页
    → 经纬度缺失 → city-coords.json 补充

industry.csv
    → 首页产业条、产业总览、产业详情（基础）

industry_profiles.csv
    → 产业详情（hero、blocks

industry_ark.json
    → 产业详情（增强

core_services.csv
    → 首页核心服务卡、核心服务页

demand.csv → 首页需求滚动
dynamic.csv → 首页动态、动态列表

culture_stories.csv、culture_history.csv、culture_figures.csv
    → 文化展示

assistant_categories.csv、assistant_qa.csv
    → AI 助手推荐分类、推荐问题

qiaowu-news.json / qiaowu-news-baseline.json
    → 侨情动态快照

culture_ark.json / culture_overseas_people.json
    → 文化展示增强
```

### 3.5 数据更新流程（`one-click-update.py`）

```
Step 1: 依赖检查（ensure_deps.py）
    ↓
Step 2: CSV → datasets.data.js（sync-data.ps1）
    ↓
Step 3: 日常数据 API 更新（daily_data_update.py）
    ↓
Step 4: 侨情动态抓取（fetch_qiaowu_to_date.py）
    ↓
Step 5: 翻译（可选，YXQ_POST_I18N_ENABLE=1
    ↓
完成 → date/ 目录更新
```

---

## 第四章 功能模块分析

### 4.1 功能模块总览

| 功能 | 实现文件 | 实现逻辑 | 依赖资源 | 维护方式 |
|------|---------|---------|---------|---------|
| **首页地图可视化** | `index.html` + `main.js` + `map-shared.js` + `map-mid-layer.js` | 百度地图 GL → 光点从玉林辐射 → 城市聚合 → 光点动画 → 夜色地图 | `merchants.csv`、`city-coords.json`、`map_style_data.json` | 更新 CSV 改 merchants.csv |
| **数据概况统计** | `index.html` + `main.js` | merchants 数据 → 自动计算统计 → 6 项卡片 | `merchants.csv` | 自动派生 |
| **侨情动态轮播** | `index.html` + `main.js` + `qiaowu-news-loader.js` | JSON → 轮播 → 动态卡片 | `qiaowu-news.json`、`dynamic.csv` | 定期更新 |
| **核心服务卡** | `index.html`、`pages/core-services.html` + `page-sections.js` | CSV → 服务卡片网格 → 悬停展开 | `core_services.csv` | 编辑 CSV |
| **侨务需求滚动** | `index.html` + `main.js` | CSV → 卡片上滚动画 | `demand.csv` | 编辑 CSV |
| **产业条** | `index.html` + `main.js` | CSV → 4 个产业卡片 | `industry.csv` | 编辑 CSV |
| **全页地图** | `pages/map.html` + `page-map.js` | 全屏地图 → 筛选 → 联动名录 | `merchants.csv` | 编辑 CSV |
| **产业详情（4 个 | `pages/industry/*.html` + `page-industry-detail.js` + `page-sections.js` | CSV + JSON → 详情页渲染 | `industry.csv`、`industry_ark.json`、`industry_profiles.csv` | 编辑 CSV/JSON |
| **侨壮壮 AI 助手** | `pages/services/overseas-service-assistant.html` + `page-overseas-assistant.js` | 输入 → 流式响应 → 实时输出 | `assistant-qiaozhuang-persona.js`、`assistant_categories.csv`、`assistant_qa.csv` | 更新人设/问答 |
| **侨情动态列表** | `pages/dynamic.html` + `qiaowu-news-loader.js` + `page-sections.js` | 本地 JSON + CSV 合并 → 列表 → 刷新 | `qiaowu-news.json`、`dynamic.csv` | 更新 JSON/CSV |
| **多语切换** | `i18n.js` + `i18n-secondary-content.js` | zh-CN ↔ en-US 切换 → 重新渲染 | 内嵌翻译表 | 维护翻译表 |
| **报价单生成** | `pages/services/quotation.html` + `page-service-detail.js` | 模板数据 → 表单输入 → 生成报价 | `quotation-templates.json` | 编辑模板 JSON |
| **合同生成** | `pages/services/contract-template.html` + `page-service-detail.js` | 模板 → 合同 | `contract-templates.json` | 编辑模板 JSON |
| **文化展示** | `pages/services/culture-showcase.html` + `page-service-detail.js` | CSV → 时间线 + 人物轮播 | `culture_*.csv`、`culture_ark.json` | 编辑 CSV/JSON |

### 4.2 核心功能详细分析

#### 功能 1：首页地图（核心价值点）

**实现文件**：
- `index.html`（页面结构
- `js/main.js`（主逻辑）
- `js/map-shared.js`（共享工具）
- `js/map-mid-layer.js`（光点动画）
- `js/baidu-map-sdk-inject.js`（SDK 注入）

**实现逻辑**：

```
1. DOMContentLoaded → ak 注入 → 检测 AK 缺
2. 加载 merchants.csv → 归一化
   - city/country/lat/lng/merchant_type/merchant_name/merchant_desc/contact
3. 范围筛选：
   - 中国城市（玉林/南宁/柳州/桂林/北海
   - 东南亚 11 国
4. 城市聚合（按城市聚集统计
5. 初始化百度地图 GL：
   - 中心：108.85, 15.25
   - 缩放：4.92
   - 样式：夜色深蓝 + 金色边界
6. 渲染光点：从玉林辐射到各城市
   - 动画：光点浮动
   - 样式：金色光点
7. 加载地图底部快捷工具
```

**依赖资源**：
- 百度地图 AK（`volc-ark-apis.json` → `baiduMapAk`
- `merchants.csv`（数据来源）
- `city-coords.json`（坐标缓存
- `map_style_data.json`（地图样式

**维护方式**：
- 更新 `merchants.csv` 添加/修改数据
- 坐标缺失经纬度自动补全
- 地图样式调整 `map_style_data.json`

#### 功能 2：侨壮壮 AI 助手

**实现文件**：
- `pages/services/overseas-service-assistant.html`
- `js/page-overseas-assistant.js`（~900 行）
- `js/assistant-qiaozhuang-persona.js`

**实现逻辑**：

```
1. 页面加载 → 读取 assistant_categories.csv → 4 大分类卡片
2. 推荐问题（example_questions 显示
3. 用户输入 → 调用 Ark API：
   - endpoint: bots/chat/completions
   - model: bot-20260402185514-nhjkt
   - API Key: qiaozhuangApiKey
   - System Prompt: 侨壮壮人设
4. 流式响应（SSE）
   - 逐字输出 → 动态显示
   - 实时打字机效果
5. 数字人视频（thinking ↔ idle 切换
6. 多语本地化
```

**依赖资源**：
- `assistant_categories.csv`（4 大分类
- `assistant_qa.csv`（问答库
- `assistant-qiaozhuang-persona.js`（人设
- `volc-ark-apis.json`（API Key

**维护方式**：
- 人设调整 → 编辑 `assistant-qiaozhuang-persona.js`
- 分类/问答库 → 编辑 CSV
- API Key → 编辑 `volc-ark-apis.json`

#### 功能 3：产业详情页

**实现文件**：
- `pages/industry/ceramics.html`（4 个产业页面
- `js/page-industry-detail.js`
- `js/page-sections.js`

**实现逻辑**：

```
1. 读取 industry.csv → 产业基础数据
2. 读取 industry_profiles.csv → hero 与 blocks
3. 读取 industry_ark.json → 增强数据补充（若存在
4. 语言处理：
   - zh-CN：直接显示中文
   - en-US：翻译表 → AI 翻译（若 translationApiKey）
5. 渲染详情页
```

**依赖资源**：
- `industry.csv`
- `industry_profiles.csv`
- `industry_ark.json`

**维护方式**：
- 产业数据 → 编辑 CSV/JSON
- 产业详情 → 编辑 industry_profiles.csv

#### 功能 4：侨情动态

**实现文件**：
- `pages/dynamic.html`
- `js/qiaowu-news-loader.js`
- `js/page-sections.js`

**实现逻辑**：

```
1. 优先读取 sessionStorage（快）
2. 否则读取 `qiaowu-news.json`（本地）
3. 否则读取 `dynamic.csv`（补充）
4. 否则调用 API 动态生成（需 dataApiKey → 若配置）
5. 合并去重 → 按时间排序 → 渲染列表
6. 刷新按钮 → 重新从 API 拉取
```

**依赖资源**：
- `qiaowu-news.json`
- `dynamic.csv`
- `qiaowu-news-baseline.json`

**维护方式**：
- 定期运行 `scripts/fetch_qiaowu_to_date.py` 脚本

#### 功能 5：多语切换

**实现文件**：
- `js/i18n.js`（核心
- `js/i18n-secondary-content.js`（翻译表

**实现逻辑**：

```
1. 初始化 → zh-CN（默认）
2. 用户点击切换语言
3. 翻译表覆盖：
   - 内嵌静态文本翻译
   - 动态数据翻译（title_en/summary_en 字段
4. 重新渲染所有文本
5. 英文内容 → AI 翻译（若 translationApiKey）
6. localStorage 缓存翻译结果
```

**依赖资源**：
- `i18n-secondary-content.js`（大量地名、标签翻译

**维护方式**：
- 维护 `i18n-secondary-content.js` 添加/修改翻译键值

### 4.3 辅助功能

- 数据概况、需求滚动、核心服务卡、产业条、地图页、核心服务目录、数据概况页、动态详情页、报价单生成、合同生成、文化展示、多语翻译、政策解读、政策订阅、项目撮合、资源推荐、风险预警、产业链协同、国别市场分析、多语翻译、文化展示、政策解读等

---

## 第五章 资源文件分析

### 5.1 图片资源（images/）

| 目录 | 用途 | 维护方式 |
|------|------|----------|
| `images/brand/` | ⭐ 吉祥物视频与图片（qiaozhuang-mascot-loop.webm 等 | 替换视频/图片 |
| `images/industry/` | 产业配图 | 4 产业 hero 图 | 替换 PNG |
| `images/demand/` | 侨务需求配图 | 替换 SVG |
| `images/icons/` | 图标（overview 图标 | 替换 SVG |
| `images/culture/` | 文化内容图 | 替换 PNG |
| `images/placeholders/` | 占位图 | 占位符图 |

**吉祥物资源说明**：
- qiaozhuang-mascot-loop.webm：待机循环视频
- qiaozhuang-mascot-thinking.webm：思考动画视频
- qiaozhuang-mascot.png：静态图片

### 5.2 JSON 数据文件

| 文件 | 数据结构 | 用途 |
|------|---------|------|
| `volc-ark-apis.json` | `{dataApiKey, translationApiKey, qiaozhuangApiKey, baiduMapAk, ARK_*_DEFAULTS, TRANSLATION_ARK, DATA_ACQUISITION_ARK, ASSISTANT_ARK}` | ⭐ 核心配置 |
| `datasets.data.js` | `window.APP_DATASETS = { merchants, demand, coreServices, industry, industryProfiles, cultureStories, ...}` | 离线数据聚合 |
| `qiaowu-news.json` | `[{title, title_en, time, url, source, summary, summary_en, content, excerpt, ...}]` | 侨情动态快照 |
| `industry_ark.json` | `[{id, name, summary, status, resource, market, supply_chain, opportunity, image}]` | 产业增强 |
| `culture_ark.json` | `{history, figures, stories}` | 文化增强 |
| `culture_overseas_people.json` | `{items: [...]}` | 海外侨胞 |
| `city-coords.json` | `{generatedAt, source, cities: [{city, country, lat, lng, source}]}` | 坐标缓存 |
| `map_style_data.json` | `[{featureType, elementType, stylers}` | 地图样式 |
| `contract-templates.json` | `{meta: {...}, templates: [...]}` | 合同数据 |
| `quotation-templates.json` | `{meta: {...}, templates: [...]}` | 报价数据 |
| `last_update_timestamp.json` | `{date, version, timestamp}` | 更新时间戳 |

### 5.3 CSV 数据文件

| 文件 | 字段 | 字段名（按实际 CSV 头（逗号分隔

**merchants.csv**：
- city, country, lat, lng, merchant_type, merchant_name, merchant_desc, contact

**core_services.csv**：
- id, name, description, page, summary, status

**industry.csv**：
- id, name, summary, status, resource, market, supply_chain, opportunity, image

**demand.csv**：
- id, title, description, status, image

**dynamic.csv**：
- id, title, date, source, summary, url

**industry_profiles.csv**：
- industry_id, section, title, content, image

**culture_stories.csv**：
- id, title, content, image

**culture_history.csv**：
- year, event, image

**culture_figures.csv**：
- id, name, title, story, tag, image

**assistant_categories.csv**：
- id, category, question, answer_hint, tag, image, related_questions

**assistant_qa.csv**：
- id, category, question, answer

**map_cities.csv**：
- city, country, lat, lng

### 5.4 静态资源加载策略

1. **图片**：通过 `<img>` 标签直接引用
2. **视频**：通过 `<video>` 标签（autoplay loop muted playsinline
3. **字体**：使用系统字体
4. **图标**：SVG 内联或 `<img>` 引用

---

## 第六章 第三方服务分析

### 6.1 百度地图 JS API GL（WebGL）

**服务目的**：地图可视化、坐标计算、地图交互

**配置位置**：
- `date/volc-ark-apis.json` → `baiduMapAk`

**实际调用**：
- `js/baidu-map-sdk-inject.js` → 动态注入 `<script src="https://api.map.baidu.com/api?v=1.0&type=webgl&ak=..."`

**API 端点**：
- 主 API：`https://api.map.baidu.com/api?v=1.0&type=webgl`
- 样式资源：`https://api.map.baidu.com/res/webgl/10/bmap.css`
- 地图瓦片：`online0.map.bdimg.com`、`online1.map.bdimg.com`

**功能用途**：
- 初始化地图实例
- 夜色地图样式
- 地图范围限制（minZoom 4.2、maxZoom 7.2
- 光点（Overlay 绘制自定义光点
- 连线动画

**替换方法**：
- 如更换 AK → 替换 `volc-ark-apis.json` 中 `baiduMapAk` 字段
- 如更换地图服务 → 重写 `map-shared.js`、`map-mid-layer.js`、`main.js` 地图相关代码

**维护建议**：
- 每月检查地图配额（QPS 配额
- Referer 白名单配置（百度控制台

### 6.2 字节跳动火山方舟（Ark）大模型 API

**服务目的**：
1. **AI 对话（侨壮壮助手
2. 侨情动态生成（API 辅助
3. 内容翻译（英文

**配置位置**：
- `date/volc-ark-apis.json`

**配置结构**：
```json
{
  "dataApiKey": "...",
  "translationApiKey": "...",
  "qiaozhuangApiKey": "..."
}
```

**三个用途分离**：

| 用途 | endpoint | model | API Key 字段 | 脚本/文件 |
|------|----------|-------|-------------|-----------|
| 侨壮壮对话 | `bots/chat/completions` | `bot-20260402185514-nhjkt | qiaozhuangApiKey | page-overseas-assistant.js |
| 侨情内容生成 | `chat/completions` | `ep-20260403160948-csjkb` | dataApiKey | qiaowu-news-loader.js |
| 翻译 | `responses` | `ep-20260407105229-bnn89` | translationApiKey | i18n.js |

**调用方式**：
- HTTP POST `https://ark.cn-beijing.volces.com/api/v3/...`

**请求格式**：
```
Authorization: Bearer ${apiKey}
Content-Type: application/json

{
  "model": "...",
  "messages": [...],
  "stream": true/false
}
```

**替换方法**：
- 更换 API Key → 替换 `volc-ark-apis.json`
- 更换模型 → 编辑 `ark-api-config.js` 中 DEFAULT 模型 ID
- 更换服务商 → 修改 `ark-api-config.js` endpoint

**维护建议**：
- 定期检查 API 调用额度
- 监控响应时间
- 监控错误率
- 密钥轮换策略

### 6.3 服务失效影响

| 服务 | 失效影响 | 降级方案 |
|------|---------|---------|
| 百度地图 AK 失效 | 地图不显示、首页地图空白 | 显示错误信息 |
| 侨壮壮 API Key 失效 | AI 助手无法回答 | 显示"服务不可用提示 |
| 翻译 API Key 失效 | 英文翻译失败 | 显示原文（中文） |
| 数据 API Key 失效 | 动态内容不更新 | 使用本地 JSON 缓存 |

---

## 第七章 开发者资源交接声明

### 7.1 项目资产清单（可交付

| 类型 | 内容 | 位置 |
|------|------|------|
| **源代码** | 所有 HTML/JS/CSS | `index.html`、`pages/`、`js/`、`css/` |
| **数据文件** | 所有 CSV/JSON | `date/*.csv`、`date/*.json` |
| **配置文件** | API 配置 | `date/volc-ark-apis.json` |
| **维护脚本** | Python + PowerShell | `scripts/*.py`、`scripts/*.ps1` |
| **静态资源** | 图片、视频 | `images/` |
| **参考资料** | 功能演示包 | `reference/` |
| **前端页面** | 12+5 页面 | `pages/*.html` |

### 7.2 开发者个人资源（**不可交付，需替换

| 资源类型 | 说明 | 交接后处理 |
|----------|------|----------|
| **百度地图 AK** | 开发者个人百度账号申请 | 接收方需用自己企业/个人账号重新申请 |
| **火山方舟 API Key** | 开发者个人火山方舟账号 | 接收方需用自己账号申请 |
| **第三方平台账户** | 百度、火山方舟控制台 | 开发者有权注销/更换 |
| **测试账号** | 如有 | 交付后失效 |
| **个人云服务** | 如有个人云存储 | 交付后停止维护 |

### 7.3 重要提示

**🔴 重要声明：

1. **API Key 属于开发者个人资源，交付后开发者有权注销、更换或停止维护
2. **第三方服务失效不属于代码缺陷**，项目代码本身不受影响
3. 接收方应在交付后 2 周内完成密钥替换
4. 数据内容为公开信息，建议不要将密钥写入代码公开仓库（建议放在服务器环境变量
5. **file:// 协议下无法调用外部 API 可能遇到浏览器跨域限制，建议使用本地 HTTP 服务器

### 7.4 快速替换密钥步骤

**替换百度地图 AK：

```
步骤 1：访问 https://lbsyun.baidu.com/ → 注册/登录
步骤 2：控制台 → 创建应用 → 获取 AK
步骤 3：编辑 date/volc-ark-apis.json → baiduMapAk = 新 AK
步骤 4：在百度控制台配置 Referer 白名单（如有域名/IP
步骤 白名单
```

**替换火山方舟 API Key**：

```
步骤 1：访问 https://www.volcengine.com/product/ark
步骤 2：开通方舟服务 → 创建 API Key
步骤 3：编辑 date/volc-ark-apis.json → 替换三个 Key：
   - dataApiKey
   - translationApiKey
   - qiaozhuangApiKey
步骤 4：如使用自有模型，替换 model 编辑 ark-api-config.js 的模型 ID
```

---

## 第八章 后续维护建议

### 8.1 常见问题与维护

| 问题 | 可能原因 | 解决方法 |
|------|---------|---------|
| 地图不显示 | AK 无效/过期/Referer 限制 | 检查 `volc-ark-apis.json 中 baiduMapAk、检查百度控制台 Referer 白名单 |
| AI 助手无响应 | API Key 失效/过期 | 检查 `qiaozhuangApiKey` 检查火山方舟控制台 |
| 英文翻译失败 | translationApiKey 失效 | 检查 `translationApiKey`、检查模型额度 |
| 动态内容不更新 | 本地 JSON 旧/未运行更新脚本 | 运行 `one-click-update.py` |
| file:// 访问数据不显示 | fetch 在 file:// 协议限制 | 启动本地服务器 `scripts/start-local-server.ps1 |
| 数据统计数不对 | merchants.csv 数据问题 | 检查 CSV 格式、逗号/引号/换行 |
| 产业详情不显示 | industry.csv 缺失 | 检查 CSV 是否正确解析 |
| 多语切换无翻译 | 翻译表缺失 | 编辑 `i18n-secondary-content.js` |

### 8.2 日常维护流程

**日常数据更新**：

```bash
cd 项目根目录
py -3 one-click-update.py
```

**手动启动本地服务器**：

```powershell
# PowerShell
scripts\start-local-server.ps1
# 或
py -3 -m http.server 8000
```

**添加侨情动态内容**：

```
编辑 date/qiaowu-news.json
或 date/dynamic.csv
```

**产业/文化内容更新**：

```
编辑 date/industry.csv、industry_ark.json
编辑 date/culture_*.csv、culture_ark.json
```

### 8.3 依赖与版本

| 依赖 | 版本 | 用途 |
|------|------|------|
| **Python** | 3.8+ | 运行维护脚本 |
| **requests** | >=2.28.0 | HTTP 请求（Python |
| **Pillow** | >=10.0.0 | 图片处理（Python |
| **rembg** | >=2.0.50 | 吉祥物抠图（可选 |
| **ffmpeg** | 系统命令 | 视频转 WebM（可选 |
| **浏览器** | Chrome/Edge/Firefox/Safari | 现代浏览器 |
| **百度地图** | JS API GL v1.0 | 地图 |

### 8.4 API 变更风险

| API | 风险等级 | 建议 |
|------|---------|------|
| 百度地图 | 中 | AK 过期、配额限制 | 定期检查配额 |
| 火山方舟 | 高 | API 升级、模型变更、价格调整 | 定期测试新版本 |
| 浏览器策略 | 中 | CORS 策略变化 | 测试主流浏览器 |

### 8.5 后续开发建议

1. **数据更新自动化**：设置定时任务运行 `one-click-update.py`
2. **日志监控**：添加错误日志
3. **密钥安全**：API Key 不要提交到公开仓库
4. **备份策略**：定期备份 `date/` 目录
5. **测试用例**：首页加载、地图显示、AI 助手响应、多语切换、产业详情

### 8.6 文件结构与扩展建议

**新增产业页**：
```
1. 在 `pages/industry/new-industry.html`（复制现有产业页
2. 在 `industry.csv` 添加新行
3. 在 `industry_profiles.csv` 添加详情
4. 在 `industry_ark.json` 添加增强数据
```

**新增服务**：
```
1. 在 `pages/services/new-service.html`
2. 在 `core_services.csv` 添加新服务
3. 实现页面逻辑（参考 page-service-detail.js 或自定义
```

**新增数据字段**：
```
1. 在对应 CSV 文件添加新字段
2. 在 `datasets.data.js` 同步添加（同步脚本自动生成
3. 运行 `sync-data.ps1
```

---

## 附录：文件行数估算

| 文件 | 估计行数 | 实际规模
|------|---------|--------
| index.html | ~130 | 页面
| JS 脚本（13 | ~4,000+ | 核心逻辑
| CSS | ~2,000+ | 样式
| HTML 页面（18+ | 中等
| 数据 CSV/JSON | 数据
| Python 脚本（17 | ~2,000+ | 维护脚本
| **总计** | **约 10,000+ 行代码 + 数据

---

**文档结束**

---

*本文档基于项目源代码分析：2026 年 6 月 8 日
