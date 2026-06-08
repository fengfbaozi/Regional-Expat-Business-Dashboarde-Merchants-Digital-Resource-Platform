# 数据目录逻辑说明

## 1) 地图主数据（唯一业务事实源）
- `merchants.csv`
  - 地图点位、侨商列表、类型筛选、城市聚合、概况统计的唯一来源。
  - 首页与地图页统计口径统一：先加载侨商明细，再自动聚合出概况。
  - 运行时会补齐展示字段（如 `merchant_id / enterprise_id / enterprise_name / merchant_title`），不再做前端人数扩展。

## 2) 地图辅助数据
- `city-coords.json`：经纬度缓存（用于坐标补全和离线兜底）。
- `map_style_data.json`：百度地图夜色样式配置。
- `map_cities.csv`：城市坐标与城市元信息的离线补充源（供坐标缓存兜底）。

## 3) 首页与内容板块数据
- `dynamic.csv`：侨务动态
- `demand.csv`：侨务需求
- `core_services.csv`：核心服务
- `industry.csv`：产业卡片
  - 已扩展为“二级页详情事实源”，包含 `status/resource/market/supply_chain/opportunity` 字段，供 `pages/industry.html` 四卡详情联动渲染。
- `culture_stories.csv`：侨乡文化故事主数据（底部待定区与通用故事内容）。
- `culture_history.csv`：侨乡历史时间线（左侧慢速上滚卡片）。
- `culture_figures.csv`：侨胞故事 / 侨商风采人物数据（中间人物卡片）。
- `assistant_categories.csv`：出海助手问题分类与问答提示数据。
- `assistant_actions.csv`：出海助手底部快捷按钮数据。
- `assistant_qa.csv`：出海助手问答库（推荐提问与回答，当前 50+ 条）。
## 4) 离线兜底聚合文件
- `datasets.data.js`：离线/`file://` 访问时的备用数据集。

## 5) 当前联动规则（代码）
- 首页：`js/main.js`
  - 先读取并规范化 `merchants.csv`
  - 按地图范围白名单过滤（中国仅广西重点城市 + 东南亚相关国家）
  - 直接以 `merchants.csv` 的真实数据汇总概况并渲染地图

