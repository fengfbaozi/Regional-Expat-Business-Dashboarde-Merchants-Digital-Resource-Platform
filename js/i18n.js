(function (global) {
    "use strict";

    if (!global.ARK_DATA_CHAT_DEFAULTS) {
        global.ARK_DATA_CHAT_DEFAULTS = {
            endpoint: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
            model: "ep-20260403160948-csjkb",
        };
    }
    if (!global.ARK_QIAOZHUANG_DEFAULTS) {
        global.ARK_QIAOZHUANG_DEFAULTS = {
            endpoint: "https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions",
            model: "bot-20260402185514-nhjkt",
        };
    }
    if (!global.ARK_TRANSLATION_RESPONSES_DEFAULTS) {
        global.ARK_TRANSLATION_RESPONSES_DEFAULTS = {
            endpoint: "https://ark.cn-beijing.volces.com/api/v3/responses",
            model: "ep-20260407105229-bnn89",
        };
    }

    var STORAGE_KEY = "yuxiaoqiao_locale";
    var EVENT_NAME = "yuxiaoqiao:locale";
    var API_CACHE_PREFIX = "yuxiaoqiao_i18n_api_v2_";
    var CONTENT_TR_PREFIX = "yuxiaoqiao_cnt_";

    function readContentTrCache(ck) {
        try {
            var hit = global.sessionStorage.getItem(ck);
            if (hit) return hit;
        } catch (e0) {}
        try {
            return global.localStorage.getItem(ck);
        } catch (e1) {}
        return null;
    }

    function writeContentTrCache(ck, jsonStr) {
        try {
            global.sessionStorage.setItem(ck, jsonStr);
        } catch (e0) {}
        try {
            global.localStorage.setItem(ck, jsonStr);
        } catch (e1) {}
    }

    var MAP_PLACE_EN = {
        万象: "Vientiane",
        万隆: "Bandung",
        亚庇: "Kota Kinabalu",
        仰光: "Yangon",
        南宁: "Nanning",
        古晋: "Kuching",
        合艾: "Hat Yai",
        吉隆坡: "Kuala Lumpur",
        宿务: "Cebu",
        岘港: "Da Nang",
        巴厘岛: "Bali",
        巴色: "Pakse",
        新加坡: "Singapore",
        新山: "Johor Bahru",
        普吉: "Phuket",
        暹粒: "Siem Reap",
        曼德勒: "Mandalay",
        曼谷: "Bangkok",
        棉兰: "Medan",
        槟城: "Penang",
        河内: "Hanoi",
        泗水: "Surabaya",
        海防: "Haiphong",
        清迈: "Chiang Mai",
        玉林: "Yulin",
        琅勃拉邦: "Luang Prabang",
        胡志明市: "Ho Chi Minh City",
        芭提雅: "Pattaya",
        芹苴: "Can Tho",
        西哈努克港: "Sihanoukville",
        达沃: "Davao",
        金边: "Phnom Penh",
        雅加达: "Jakarta",
        马六甲: "Malacca",
        马尼拉: "Manila",
        中国: "China",
        印度尼西亚: "Indonesia",
        泰国: "Thailand",
        越南: "Vietnam",
        马来西亚: "Malaysia",
        缅甸: "Myanmar",
        菲律宾: "Philippines",
        柬埔寨: "Cambodia",
        老挝: "Laos"
    };

    var MAP_MERCHANT_TYPE_EN = {
        餐饮: "Food & beverage",
        零售: "Retail",
        制造: "Manufacturing",
        服务: "Services",
        物流: "Logistics",
        贸易: "Trade",
        金融: "Finance",
        文旅: "Culture & tourism",
        农业: "Agriculture",
        电商: "E-commerce",
        投资: "Investment",
        教育: "Education",
        文创: "Creative & culture",
        能源: "Energy",
        其他: "Other"
    };

    var BUNDLES = {
        "zh-CN": {
            "lang.name": "中文",
            "lang.btn": "语言",
            "home.title": "玉林侨务数字平台",
            "home.brand": "玉林师范学院标识",
            "home.logoAlt": "校徽标识",
            "home.mapPlaque": "侨情地图",
            "home.mapLoading": "首页地图加载中，请稍候...",
            "home.mapLink": "进入地图板块",
            "home.industryStrip": "侨乡特色产业展示",
            "panel.news": "侨情动态",
            "panel.demand": "侨务需求",
            "panel.core": "核心服务",
            "panel.coreAll": "全部",
            "panel.coreEnter": "进入服务",
            "panel.coreBrowse": "查看全部",
            "dynamic.read": "原文浏览",
            "dynamic.unnamed": "未命名动态",
            "dynamic.bodyFallback": "点击「原文浏览」查看侨情列表与原文链接。",
            "dynamic.syncMeta": "列表渲染于 {time} · 数据来自火山「数据获取」接口",
            "dynamic.empty.hint":
                "暂无侨情。可将 date/qiaowu-news.json 填入列表后重载；或确认 date/volc-ark-apis.json 中 dataApiKey 有效并用 http(s) 访问本站以在线拉取。",
            "dynamic.loading": "侨情资讯加载中，请稍候…",
            "demand.empty": "暂无数据",
            "demand.status.pending": "待处理",
            "demand.status.progress": "推进中",
            "demand.status.done": "已完成",
            "demand.item.dem-001.title": "海外留学生创业支持",
            "demand.item.dem-001.summary": "申请创业政策辅导与场地资源对接。",
            "demand.item.dem-002.title": "侨资工厂选址咨询",
            "demand.item.dem-002.summary": "计划落地食品加工项目，需要园区与能耗评估建议。",
            "demand.item.dem-003.title": "跨境贸易法律咨询",
            "demand.item.dem-003.summary": "已完成合同条款合规审查与风险提示。",
            "demand.item.dem-004.title": "侨企品牌出海推广",
            "demand.item.dem-004.summary": "希望制定面向东南亚市场的品牌传播方案。",
            "demand.item.dem-005.title": "侨商投融资路演申请",
            "demand.item.dem-005.summary": "拟组织项目路演并对接产业基金与银行授信。",
            "demand.item.dem-006.title": "跨境合规审计支持",
            "demand.item.dem-006.summary": "希望开展目标国税务与合规预评估。",
            "demand.item.dem-007.title": "海外仓落地咨询",
            "demand.item.dem-007.summary": "计划在印尼建设区域中转仓并优化配送路径。",
            "demand.item.dem-008.title": "多语种品牌包装设计",
            "demand.item.dem-008.summary": "需适配马来语、印尼语和英语市场宣传。",
            "demand.item.dem-009.title": "侨企人才引进对接",
            "demand.item.dem-009.summary": "希望引进熟悉东盟市场运营的复合型人才。",
            "demand.item.dem-010.title": "国际商标注册辅导",
            "demand.item.dem-010.summary": "已完成新加坡与印尼两地商标注册流程咨询。",
            "demand.item.dem-011.title": "海外渠道拓展合作",
            "demand.item.dem-011.summary": "对接本地经销商并建立分销体系试点。",
            "demand.item.dem-012.title": "跨境电商平台入驻辅导",
            "demand.item.dem-012.summary": "需完成平台规则培训与店铺运营流程梳理。",
            "overview.empty": "暂无概况数据",
            "overview.merchants": "海外侨胞",
            "overview.enterprises": "侨务企业",
            "overview.orgs": "侨团组织",
            "overview.projects": "侨务项目",
            "overview.countries": "覆盖国家",
            "overview.active": "活跃侨情",
            "overview.unit.person": "人",
            "overview.unit.enterprise": "家",
            "overview.unit.org": "个",
            "overview.unit.project": "项",
            "overview.unit.country": "国",
            "overview.unit.case": "条",
            "map.empty": "暂无地图数据",
            "map.sdkFail": "首页地图 SDK 加载失败",
            "map.ready": "首页地图已可用",
            "map.done": "首页地图加载完成",
            "weather.night": "夜间 20°C",
            "weather.dayHot": "晴 30°C",
            "weather.dayCloud": "多云 25°C",
            "weather.dayCool": "阴 16°C",
            "weather.dayMild": "晴 22°C",
            "week.0": "周日",
            "week.1": "周一",
            "week.2": "周二",
            "week.3": "周三",
            "week.4": "周四",
            "week.5": "周五",
            "week.6": "周六",
            "float.langTitle": "语言",
            "nav.home": "返回首页",
            "nav.core": "返回核心服务",
            "nav.industry": "返回产业总览",
            "page.overview.title": "数据概况",
            "page.core.title": "核心服务总览",
            "page.industry.title": "侨乡特色产业展示",
            "page.dynamic.title": "侨情动态",
            "page.dynamic.lead": "",
            "page.dynamic.refresh": "刷新",
            "page.dynamic.refreshTitle":
                "重新请求火山「数据获取」，与当前 JSON 中的列表按链接去重合并后展示（不会把结果写回磁盘）",
            "page.map.back": "返回首页",
            "page.map.title": "地图板块",
            "i18n.prompt.lang.zh": "所有面向用户展示的句子使用简体中文。",
            "i18n.prompt.lang.en": "Use English for all user-visible titles and summaries (keep Yulin / ASEAN proper nouns where natural).",
            "map.filter.heading": "区域筛选",
            "map.filter.cityLb": "目标城市",
            "map.filter.cityPh": "请选择城市",
            "map.filter.typeLb": "侨商类别",
            "map.filter.typePh": "全部类型",
            "map.filter.countryLb": "国家/地区",
            "map.filter.countryPh": "全部国家/地区",
            "map.filter.keywordLb": "关键词检索",
            "map.filter.keywordPh": "姓名/城市/描述",
            "map.filter.reset": "重置选择",
            "map.filter.statsTpl": "可视城市：{cities} · 匹配侨商：{merchants} · 匹配侨企：{enterprises}",
            "map.loading": "地图资源加载中，请稍候...",
            "map.aria.canvas": "东南亚与南洋侨情地图",
            "map.strip.home": "首页",
            "map.strip.core": "核心服务",
            "map.strip.zoomIn": "放大",
            "map.strip.zoomOut": "缩小",
            "map.strip.resetView": "默认视角",
            "map.list.heading": "侨商名录",
            "map.selectedTpl": "当前城市：{city}",
            "map.selected.none": "请选择",
            "map.stats.merchants": "当地侨商总数：{n1}",
            "map.stats.enterprises": "侨企个数：{n2}",
            "map.toggle.left": "折叠筛选面板",
            "map.toggle.right": "折叠名单面板",
            "map.merchant.empty": "当前筛选下暂无侨商",
            "map.merchant.truncated": "还有 {n} 位侨商未显示，请缩小筛选范围查看更多",
            "core.card.enter": "进入页面",
            "industry.block.market": "市场与定位",
            "industry.block.chain": "产业链与能力",
            "industry.block.out": "出海机会",
            "industry.fallback.market": "暂无市场信息",
            "industry.fallback.chain": "暂无产业链信息",
            "industry.fallback.out": "暂无机会信息",
            "page.culture.docTitle": "侨乡文化展示",
            "culture.history.heading": "侨乡历史展现",
            "culture.history.altYear": "历史节点",
            "culture.figures.heading": "侨胞故事 / 侨商风采",
            "culture.figure.navPrev": "上一位",
            "culture.figure.navNext": "下一位",
            "culture.figure.dotAria": "切换到第 {n} 位人物",
            "culture.figure.fallbackName": "人物",
            "culture.figure.fallbackTitle": "侨乡人物",
            "culture.figure.fallbackTag": "故事",
            "culture.map.loading": "地图资源加载中，请稍候...",
            "culture.map.plaque": "玉林与东盟互联互通",
            "culture.map.aria": "玉林与东盟互联互通地图",
            "culture.map.linkCoverAria": "进入地图板块",
            "culture.map.sdkFail": "地图 SDK 加载失败",
            "culture.map.errShort": "地图加载失败",
            "culture.map.noData": "暂无地图数据",
            "culture.map.ready": "地图已进入可用状态",
            "culture.map.done": "地图加载完成",
            "culture.map.initFail": "地图初始化失败",
            "culture.placeholder.mapColumn": "内容占位（与相邻列同高）",
            "overview.cardVal": "当前值：{v}",
            "dynamic.newsEmpty":
                "暂无侨情。请检查 date/volc-ark-apis.json 中 dataApiKey，并用 http(s) 打开本站后重试，或在侨情页点击「刷新」。",
            "dynamic.viewOriginal": "查看原文",
            "dynamic.refresh.working": "正在请求火山「数据获取」接口，请稍候…",
            "dynamic.refresh.busy": "已有任务在执行",
            "dynamic.refresh.fail": "刷新失败：",
            "dynamic.refresh.done": "已更新，共 {n} 条",
            "dynamic.refresh.empty": "拉取完成，暂无条目",
            "dynamic.refresh.offline": "刷新失败：请检查网络或 date/volc-ark-apis.json 中数据侧 Key（dataApiKey）。",
            "src.yqzwx": "玉侨子午线",
            "src.gov.yulin": "玉林市政府网",
            "src.gxylnews": "玉林新闻网",
            "src.local": "本地资讯",
            "map.selectedCountTpl": "当前城市：{city}（{n}）",
            "map.allCities": "全部城市",
            "map.merchant.noMatch": "暂无匹配侨商，请调整筛选条件。",
            "map.merchant.translating": "正在翻译侨商名单…",
            "map.coord": "坐标：{lat}，{lng}",
            "map.contactPending": "联系方式待补充",
            "map.sdkFailLong": "地图 SDK 加载失败，请检查网络后重试",
            "map.error.bmap": "百度地图 SDK 未加载成功，请检查网络与 AK 白名单。",
            "map.error.akMissing":
                "未配置百度地图 AK：请在 date/volc-ark-apis.json 中填写 baiduMapAk，在开放平台申请「浏览器端」AK，并将当前访问来源加入 Referer 白名单。说明见 docs/API说明.md。",
            "map.error.noCsv": "暂无可渲染地图数据，请检查 merchants.csv。",
            "map.finishReady": "地图已进入可用状态",
            "map.finishDone": "地图加载完成",
            "map.cityQuick.merchants": "侨商人数",
            "map.cityQuick.enterprises": "侨企个数",
            "map.cityQuick.types": "业态类型",
            "page.assistant.docTitle": "出海服务助手 · 侨壮壮",
            "page.assistant.h1": "出海服务助手 · 侨壮壮",
            "page.assistant.lead": "玉林侨务数字平台智能助手，基于公开信息为您解答侨务相关问题",
            "page.assistant.chatAria": "对话内容",
            "page.assistant.suggestHeading": "推荐提问",
            "page.assistant.suggestMarqueeAria": "推荐提问自动滚动",
            "page.assistant.categoryHeading": "常见问题分类",
            "page.assistant.composerAria": "向侨壮壮提问",
            "page.assistant.aiBadgeTitle": "智能助手",
            "page.assistant.inputPlaceholder": "你好！我是侨壮壮",
            "page.assistant.send": "发送",
            "page.assistant.collapseChat": "收起对话",
            "page.assistant.dhPanel": "数字人悬浮面板",
            "page.assistant.dhToggleCollapse": "收起数字人面板",
            "page.assistant.modalClose": "关闭",
            "page.assistant.modalTitle": "侨壮壮 · 提示",
            "page.assistant.cat.fallbackType": "问题类型",
            "page.assistant.cat.fallbackTag": "常见问题",
            "page.assistant.emptyPrompt": "先写一句你想问的话，侨壮壮马上来～",
            "page.assistant.offlineFile": "请用本地静态服务（http）打开本页，file 方式无法请求智能接口。",
            "serviceDetail.notFoundTitle": "未找到对应功能",
            "serviceDetail.notFoundDesc": "请返回核心服务总览页面重新选择。",
            "serviceDetail.descFallback": "功能说明待补充。",
            "serviceDetail.nameFallback": "核心服务",
            "industryDetail.notFoundTitle": "未找到对应产业",
            "industryDetail.notFoundDesc": "请返回产业总览页面重新选择。",
            "industryDetail.descFallback": "详情内容待补充。",
            "industryDetail.nameFallback": "产业详情",
            "industryDetail.introHeading": "产业介绍",
            "industryDetail.promoHistory": "发展脉络",
            "industryDetail.promoStory": "案例故事",
            "page.industry.ceramics.docTitle": "陶瓷产业",
            "page.industry.spice.docTitle": "香料产业",
            "page.industry.sweet-potato.docTitle": "番薯产业",
            "page.industry.mangweaving.docTitle": "芒编产业",
            "page.services.contract-template.docTitle": "合同模板",
            "page.services.culture-showcase.docTitle": "侨乡文化展示",
            "ui.loadingText": "加载中...",
            "ui.fallback.empty": "暂无数据",
            "page.dynamicDetail.docTitle": "侨情动态详情",
            "page.dynamicDetail.h1": "侨情动态详情",
            "dynamicDetail.loadingMeta": "加载中...",
            "dynamicDetail.loadingBody": "正在读取详情内容...",
            "dynamicDetail.backList": "侨情动态列表",
            "page.docTitle.joiner": " · ",
            "core.svc.svc-001.name": "侨乡文化展示",
            "core.svc.svc-001.desc": "展示侨乡历史、人文和特色资源。",
            "core.svc.svc-002.name": "报价单",
            "core.svc.svc-002.desc": "快速生成标准化报价单模板。",
            "core.svc.svc-003.name": "合同模板",
            "core.svc.svc-003.desc": "按场景匹配常用合同模板。",
            "core.svc.svc-004.name": "多语翻译",
            "core.svc.svc-004.desc": "覆盖中、英、日、韩、法、德、西、葡、意、俄、阿及东南亚、南亚等主流语种互译。",
            "service.translation.toolHeading": "文本翻译",
            "service.translation.sourceLang": "源语言",
            "service.translation.targetLang": "目标语言",
            "service.translation.inputLabel": "原文",
            "service.translation.outputLabel": "译文",
            "service.translation.runBtn": "翻译",
            "service.translation.copyBtn": "复制结果",
            "service.translation.clearBtn": "清空",
            "service.translation.loading": "正在翻译…",
            "service.translation.placeholder": "在此粘贴需要翻译的文本，支持多段内容。",
            "service.translation.emptyInput": "请先输入需要翻译的内容。",
            "service.translation.hint": "优先使用火山引擎翻译接口；若接口不可用将自动尝试大模型补译。请配置 date/volc-ark-apis.json 中的密钥以启用在线翻译。",
            "service.translation.error": "翻译失败，请检查网络、密钥配置或稍后再试。",
            "service.translation.copyOk": "已复制到剪贴板。",
            "core.svc.svc-005.name": "国别市场分析",
            "core.svc.svc-005.desc": "输出重点国家市场趋势与风险提示。",
            "core.svc.svc-006.name": "出海服务助手",
            "core.svc.svc-006.desc": "提供企业出海流程导航与指引。",
            "core.svc.svc-007.name": "侨商资源推荐",
            "core.svc.svc-007.desc": "按行业标签推荐侨商资源网络。",
            "core.svc.svc-008.name": "政策解读",
            "core.svc.svc-008.desc": "汇总侨务相关政策与办理要点。",
            "core.svc.svc-009.name": "项目撮合",
            "core.svc.svc-009.desc": "对接本地产业与海外侨商项目。",
            "core.svc.svc-010.name": "风险预警",
            "core.svc.svc-010.desc": "跟踪贸易、合规、汇率等风险变化。",
            "core.svc.svc-011.name": "产业链协同",
            "core.svc.svc-011.desc": "建立上下游企业协同供需匹配机制。",
            "core.svc.svc-012.name": "海外政策订阅",
            "core.svc.svc-012.desc": "按国别推送准入政策与监管变化。"
        },
        "en-US": {
            "lang.name": "English",
            "lang.btn": "Language",
            "home.title": "Yulin Overseas Chinese Digital Platform",
            "home.brand": "Yulin Normal University emblem",
            "home.logoAlt": "University emblem",
            "home.mapPlaque": "Overseas Chinese Map",
            "home.mapLoading": "Loading map…",
            "home.mapLink": "Open map section",
            "home.industryStrip": "Featured Industries",
            "panel.news": "News & Updates",
            "panel.demand": "Service Needs",
            "panel.core": "Core Services",
            "panel.coreAll": "All",
            "panel.coreEnter": "Enter",
            "panel.coreBrowse": "Browse all",
            "dynamic.read": "Read source",
            "dynamic.unnamed": "Untitled",
            "dynamic.bodyFallback": "Use “Read source” for the full list and original links.",
            "dynamic.syncMeta": "Rendered at {time} · Data from Volcengine data API",
            "dynamic.empty.hint":
                "No news yet. Verify dataApiKey in date/volc-ark-apis.json and open this site over http(s). This panel loads only from the Volcengine data API, or use Refresh on the News page.",
            "dynamic.loading": "Loading news…",
            "demand.empty": "No data",
            "demand.status.pending": "Pending",
            "demand.status.progress": "In progress",
            "demand.status.done": "Done",
            "demand.item.dem-001.title": "Support for overseas student entrepreneurs",
            "demand.item.dem-001.summary": "Coaching on startup policies and matching workspace resources.",
            "demand.item.dem-002.title": "Site selection for overseas-invested plants",
            "demand.item.dem-002.summary": "Food processing project landing—need park options and energy assessment.",
            "demand.item.dem-003.title": "Cross-border trade legal counsel",
            "demand.item.dem-003.summary": "Contract review for compliance and risk notes (completed).",
            "demand.item.dem-004.title": "Brand go-global for overseas Chinese firms",
            "demand.item.dem-004.summary": "Brand and communications plan for Southeast Asian markets.",
            "demand.item.dem-005.title": "Roadshow and financing application",
            "demand.item.dem-005.summary": "Organize project roadshows and connect with funds and bank credit lines.",
            "demand.item.dem-006.title": "Cross-border compliance audit support",
            "demand.item.dem-006.summary": "Pre-assessment of tax and compliance in target countries.",
            "demand.item.dem-007.title": "Overseas warehouse advisory",
            "demand.item.dem-007.summary": "Regional hub warehouse in Indonesia and delivery route optimization.",
            "demand.item.dem-008.title": "Multilingual brand packaging",
            "demand.item.dem-008.summary": "Adapt creatives for Malay, Indonesian, and English markets.",
            "demand.item.dem-009.title": "Talent matching for overseas Chinese enterprises",
            "demand.item.dem-009.summary": "Recruit talent familiar with ASEAN operations.",
            "demand.item.dem-010.title": "International trademark guidance",
            "demand.item.dem-010.summary": "Singapore and Indonesia trademark process advisory (completed).",
            "demand.item.dem-011.title": "Overseas channel partnerships",
            "demand.item.dem-011.summary": "Work with local distributors and pilot a distribution network.",
            "demand.item.dem-012.title": "Marketplace onboarding coaching",
            "demand.item.dem-012.summary": "Platform rules training and store operations checklist.",
            "core.empty": "No services",
            "overview.empty": "No overview data",
            "overview.merchants": "Overseas Chinese",
            "overview.enterprises": "Enterprises",
            "overview.orgs": "Associations",
            "overview.projects": "Projects",
            "overview.countries": "Countries",
            "overview.active": "Active cases",
            "overview.unit.person": "",
            "overview.unit.enterprise": "",
            "overview.unit.org": "",
            "overview.unit.project": "",
            "overview.unit.country": "",
            "overview.unit.case": "",
            "map.empty": "No map data",
            "map.sdkFail": "Map SDK failed to load",
            "map.ready": "Map is ready",
            "map.done": "Map loaded",
            "weather.night": "Night 20°C",
            "weather.dayHot": "Sunny 30°C",
            "weather.dayCloud": "Cloudy 25°C",
            "weather.dayCool": "Overcast 16°C",
            "weather.dayMild": "Sunny 22°C",
            "week.0": "Sun",
            "week.1": "Mon",
            "week.2": "Tue",
            "week.3": "Wed",
            "week.4": "Thu",
            "week.5": "Fri",
            "week.6": "Sat",
            "float.langTitle": "Language",
            "nav.home": "Back to home",
            "nav.core": "Core services",
            "nav.industry": "Industries",
            "page.overview.title": "Data overview",
            "page.core.title": "Core services hub",
            "page.industry.title": "Featured industries",
            "page.dynamic.title": "News & updates",
            "page.dynamic.lead": "",
            "page.dynamic.refresh": "Refresh",
            "page.dynamic.refreshTitle":
                "Re-fetch via the data API and merge with the JSON list by URL (does not write to disk)",
            "page.map.back": "Back to home",
            "page.map.title": "Map explorer",
            "i18n.prompt.lang.zh": "所有面向用户展示的句子使用简体中文。",
            "i18n.prompt.lang.en": "Use English for all user-visible titles and summaries (keep Yulin / ASEAN proper nouns where natural).",
            "map.filter.heading": "Filters",
            "map.filter.cityLb": "City",
            "map.filter.cityPh": "Select city",
            "map.filter.typeLb": "Merchant type",
            "map.filter.typePh": "All types",
            "map.filter.countryLb": "Country / region",
            "map.filter.countryPh": "All countries / regions",
            "map.filter.keywordLb": "Keyword",
            "map.filter.keywordPh": "Name / city / description",
            "map.filter.reset": "Reset",
            "map.filter.statsTpl": "Visible cities: {cities} · Merchants: {merchants} · Enterprises: {enterprises}",
            "map.loading": "Loading map…",
            "map.aria.canvas": "Southeast Asia overseas Chinese map",
            "map.strip.home": "Home",
            "map.strip.core": "Services",
            "map.strip.zoomIn": "Zoom in",
            "map.strip.zoomOut": "Zoom out",
            "map.strip.resetView": "Reset view",
            "map.list.heading": "Merchant list",
            "map.selectedTpl": "City: {city}",
            "map.selected.none": "Select",
            "map.stats.merchants": "Merchants: {n1}",
            "map.stats.enterprises": "Enterprises: {n2}",
            "map.toggle.left": "Collapse filter panel",
            "map.toggle.right": "Collapse list panel",
            "map.merchant.empty": "No merchants for current filters",
            "map.merchant.truncated": "{n} more merchants not shown — narrow your filters to see more",
            "core.card.enter": "Open",
            "industry.block.market": "Market",
            "industry.block.chain": "Supply chain",
            "industry.block.out": "Opportunities",
            "industry.fallback.market": "No market info",
            "industry.fallback.chain": "No supply-chain info",
            "industry.fallback.out": "No opportunity info",
            "page.culture.docTitle": "Hometown culture showcase",
            "culture.history.heading": "Hometown history",
            "culture.history.altYear": "Historical milestone",
            "culture.figures.heading": "Stories · Overseas Chinese entrepreneurs",
            "culture.figure.navPrev": "Previous",
            "culture.figure.navNext": "Next",
            "culture.figure.dotAria": "Go to profile {n}",
            "culture.figure.fallbackName": "Profile",
            "culture.figure.fallbackTitle": "Community member",
            "culture.figure.fallbackTag": "Story",
            "culture.map.loading": "Loading map resources…",
            "culture.map.plaque": "Yulin–ASEAN connectivity",
            "culture.map.aria": "Map of Yulin and ASEAN connectivity",
            "culture.map.linkCoverAria": "Open the full map section",
            "culture.map.sdkFail": "Map SDK failed to load",
            "culture.map.errShort": "Map failed to load",
            "culture.map.noData": "No map data",
            "culture.map.ready": "Map is available",
            "culture.map.done": "Map loaded",
            "culture.map.initFail": "Map initialization failed",
            "culture.placeholder.mapColumn": "Placeholder (same height as adjacent columns)",
            "overview.cardVal": "Value: {v}",
            "dynamic.newsEmpty":
                "No news yet. Check dataApiKey in date/volc-ark-apis.json, open the site over http(s), or tap Refresh on the News page.",
            "dynamic.viewOriginal": "Open source",
            "dynamic.refresh.working": "Calling Volcengine data API…",
            "dynamic.refresh.busy": "A task is already running",
            "dynamic.refresh.fail": "Refresh failed: ",
            "dynamic.refresh.done": "Updated: {n} items",
            "dynamic.refresh.empty": "Done: no items",
            "dynamic.refresh.offline": "Refresh failed: check network or data API key in date/volc-ark-apis.json.",
            "src.yqzwx": "Yuqiao Meridian",
            "src.gov.yulin": "Yulin Government",
            "src.gxylnews": "Yulin News",
            "src.local": "Local",
            "map.selectedCountTpl": "City: {city} ({n})",
            "map.allCities": "All cities",
            "map.merchant.noMatch": "No merchants match filters — try adjusting.",
            "map.merchant.translating": "Translating merchant list…",
            "map.coord": "Coords: {lat}, {lng}",
            "map.contactPending": "Contact TBD",
            "map.sdkFailLong": "Map SDK failed — check network and retry.",
            "map.error.bmap": "Baidu Map SDK did not load — check network and API key allowlist.",
            "map.error.akMissing":
                "Baidu Map AK missing: set baiduMapAk in date/volc-ark-apis.json, create a browser-side key at lbsyun.baidu.com, and add this origin to the key’s Referer allowlist. See docs/API说明.md.",
            "map.error.noCsv": "No map data — check merchants.csv.",
            "map.finishReady": "Map is usable",
            "map.finishDone": "Map finished loading",
            "map.cityQuick.merchants": "Merchants",
            "map.cityQuick.enterprises": "Enterprises",
            "map.cityQuick.types": "Categories",
            "page.assistant.docTitle": "Overseas Service Assistant · Qiao Zhuangzhuang",
            "page.assistant.h1": "Overseas Service Assistant · Qiao Zhuangzhuang",
            "page.assistant.lead":
                "Yulin overseas Chinese affairs assistant, answering common questions from public information sources",
            "page.assistant.chatAria": "Conversation",
            "page.assistant.suggestHeading": "Suggested questions",
            "page.assistant.suggestMarqueeAria": "Auto-scrolling suggested questions",
            "page.assistant.categoryHeading": "Browse by topic",
            "page.assistant.composerAria": "Ask Qiao Zhuangzhuang",
            "page.assistant.aiBadgeTitle": "AI assistant",
            "page.assistant.inputPlaceholder": "Hi! I'm Qiao Zhuangzhuang.",
            "page.assistant.send": "Send",
            "page.assistant.collapseChat": "Collapse chat",
            "page.assistant.dhPanel": "Digital human panel",
            "page.assistant.dhToggleCollapse": "Collapse digital human panel",
            "page.assistant.modalClose": "Close",
            "page.assistant.modalTitle": "Qiao Zhuangzhuang",
            "page.assistant.cat.fallbackType": "Topic",
            "page.assistant.cat.fallbackTag": "FAQ",
            "page.assistant.emptyPrompt": "Type a question first — Qiao Zhuangzhuang will reply shortly.",
            "page.assistant.offlineFile":
                "Open this page over http (local static server). The file:// protocol cannot call the assistant API.",
            "assistant.cat.as-cat-001.category": "Market access",
            "assistant.cat.as-cat-001.tag": "Compliance first",
            "assistant.cat.as-cat-001.question":
                "When Yulin enterprises expand into Southeast Asia, what public information should they review first?",
            "assistant.cat.as-cat-001.related":
                "Public channels for overseas-Chinese services; where to read ASEAN trade information; Yulin qiaowu service listings",
            "assistant.cat.as-cat-002.category": "Tax & structure",
            "assistant.cat.as-cat-002.tag": "Tax planning",
            "assistant.cat.as-cat-002.question":
                "For overseas Chinese investing in China, what do public sources suggest on tax and entity structure?",
            "assistant.cat.as-cat-002.related":
                "Rights of returned overseas Chinese in public regulations; cross-border compliance basics; where to read RCEP summaries",
            "assistant.cat.as-cat-003.category": "Supply chain",
            "assistant.cat.as-cat-003.tag": "Delivery efficiency",
            "assistant.cat.as-cat-003.question":
                "For Yulin products sold to ASEAN markets, what public logistics and fulfilment information exists?",
            "assistant.cat.as-cat-003.related":
                "Cross-border e-commerce customs flows; major ASEAN ports in public data; Yulin industry clusters in the news",
            "assistant.cat.as-cat-004.category": "Local operations",
            "assistant.cat.as-cat-004.tag": "Local growth",
            "assistant.cat.as-cat-004.question":
                "What public channels usually support outreach to overseas Yulin natives?",
            "assistant.cat.as-cat-004.related":
                "How to find federation contacts; public notices on qiaowu events; cultural materials on the hometown",
            "assistant.suggest.0": "Where can I find public channels for returned overseas Chinese to handle paperwork in Yulin?",
            "assistant.suggest.1": "Where is Guangxi overseas-Chinese policy information usually published?",
            "assistant.suggest.2": "What public points about the federation of returned overseas Chinese are useful for the public?",
            "assistant.suggest.3": "How can overseas Yulin natives publicly get in touch or find updates about their hometown?",
            "assistant.suggest.4": "How do I look up public information on Yulin overseas-Chinese service organizations?",
            "assistant.suggest.5": "How are ID matters or notarization for overseas Chinese usually described in public materials?",
            "assistant.suggest.6": "What directions can we introduce for Yulin hometown culture and publicity?",
            "assistant.suggest.7": "Which areas show up often in public reporting on Yulin–ASEAN industrial cooperation?",
            "assistant.suggest.8": "What public channels exist for legal aid or consultation on overseas-Chinese matters?",
            "assistant.suggest.9":
                "What public talking points exist on rights of returned overseas Chinese and their relatives nationwide?",
            "serviceDetail.notFoundTitle": "Service not found",
            "serviceDetail.notFoundDesc": "Go back to core services and pick again.",
            "serviceDetail.descFallback": "Description coming soon.",
            "serviceDetail.nameFallback": "Core service",
            "industryDetail.notFoundTitle": "Industry not found",
            "industryDetail.notFoundDesc": "Go back to industries and pick again.",
            "industryDetail.descFallback": "More detail coming soon.",
            "industryDetail.nameFallback": "Industry",
            "industryDetail.introHeading": "Industry overview",
            "industryDetail.promoHistory": "Development timeline",
            "industryDetail.promoStory": "Stories & cases",
            "page.industry.ceramics.docTitle": "Ceramics industry",
            "page.industry.spice.docTitle": "Spice industry",
            "page.industry.sweet-potato.docTitle": "Sweet potato industry",
            "page.industry.mangweaving.docTitle": "Straw weaving crafts",
            "page.services.contract-template.docTitle": "Contract templates",
            "page.services.culture-showcase.docTitle": "Hometown culture showcase",
            "ui.loadingText": "Loading...",
            "ui.fallback.empty": "No data",
            "page.dynamicDetail.docTitle": "News detail",
            "page.dynamicDetail.h1": "News detail",
            "dynamicDetail.loadingMeta": "Loading…",
            "dynamicDetail.loadingBody": "Loading content…",
            "dynamicDetail.backList": "News list",
            "page.docTitle.joiner": " · ",
            "core.svc.svc-001.name": "Hometown culture showcase",
            "core.svc.svc-001.desc": "History, heritage, and featured resources of the overseas Chinese hometown.",
            "core.svc.svc-002.name": "Quotation sheet",
            "core.svc.svc-002.desc": "Quickly generate a standard quotation template.",
            "core.svc.svc-003.name": "Contract templates",
            "core.svc.svc-003.desc": "Match common contract templates to your scenario.",
            "core.svc.svc-004.name": "Multilingual translation",
            "core.svc.svc-004.desc": "Chinese, English, Japanese, Korean, French, German, Spanish, Portuguese, Italian, Russian, Arabic, major Southeast & South Asian languages, and more.",
            "service.translation.toolHeading": "Text translation",
            "service.translation.sourceLang": "Source language",
            "service.translation.targetLang": "Target language",
            "service.translation.inputLabel": "Source text",
            "service.translation.outputLabel": "Translation",
            "service.translation.runBtn": "Translate",
            "service.translation.copyBtn": "Copy result",
            "service.translation.clearBtn": "Clear",
            "service.translation.loading": "Translating…",
            "service.translation.placeholder": "Paste text to translate. Multiple paragraphs are supported.",
            "service.translation.emptyInput": "Enter some text to translate first.",
            "service.translation.hint": "Uses the Volcengine translation API first; if unavailable, falls back to the chat model. Configure keys in date/volc-ark-apis.json for online translation.",
            "service.translation.error": "Translation failed. Check your network, API keys, or try again later.",
            "service.translation.copyOk": "Copied to clipboard.",
            "core.svc.svc-005.name": "Country market analysis",
            "core.svc.svc-005.desc": "Key country trends and risk notes from public sources.",
            "core.svc.svc-006.name": "Overseas service assistant",
            "core.svc.svc-006.desc": "Navigation and guidance for firms expanding overseas.",
            "core.svc.svc-007.name": "Overseas Chinese network",
            "core.svc.svc-007.desc": "Industry-tagged introductions to business resources.",
            "core.svc.svc-008.name": "Policy briefing",
            "core.svc.svc-008.desc": "Overseas Chinese policy summaries and practical points.",
            "core.svc.svc-009.name": "Project matchmaking",
            "core.svc.svc-009.desc": "Linking local industries with overseas Chinese projects.",
            "core.svc.svc-010.name": "Risk alerts",
            "core.svc.svc-010.desc": "Trade, compliance, FX, and related risk monitoring.",
            "core.svc.svc-011.name": "Supply chain collaboration",
            "core.svc.svc-011.desc": "Upstream–downstream demand and supply matching.",
            "core.svc.svc-012.name": "Overseas policy digest",
            "core.svc.svc-012.desc": "Country-specific entry rules and regulatory updates.",
            "industry.card.ind-001.name": "Spice industry",
            "industry.card.ind-001.summary":
                "Star anise, cassia, and spices—from growing and processing to export—key agricultural sector for ASEAN markets.",
            "industry.card.ind-002.name": "Ceramics industry",
            "industry.card.ind-002.summary":
                "Daily-use and cultural ceramics from the Beiliu cluster: manufacturing, brands, and export pathways.",
            "industry.card.ind-003.name": "Sweet potato industry",
            "industry.card.ind-003.summary":
                "From farming to processed and ready-to-eat products, upgrading traditional crops into standardised foods.",
            "industry.card.ind-004.name": "Straw weaving crafts",
            "industry.card.ind-004.summary":
                "Bobai heritage weaving meets modern home design—gifts, décor, and cultural products for export."
        },
        th: {
            "lang.name": "ไทย",
            "lang.btn": "ภาษา",
            "float.langTitle": "ภาษา",
            "home.title": "แพลตฟอร์มดิจิทัลด้านชาวจีนโพ้นทะเลหยู่หลิน",
            "home.mapPlaque": "แผนที่ชาวจีนโพ้นทะเล",
            "home.mapLink": "เข้าสู่ส่วนแผนที่",
            "home.mapLoading": "กำลังโหลดแผนที่…",
            "home.industryStrip": "อุตสาหกรรมเด่นบ้านเกิดชาวจีนโพ้นทะเล",
            "panel.news": "ข่าวสารชาวจีนโพ้นทะเล",
            "panel.demand": "ความต้องการบริการ",
            "panel.core": "บริการหลัก",
            "nav.home": "กลับหน้าหลัก",
            "nav.core": "กลับไปบริการหลัก",
            "page.map.title": "ส่วนแผนที่",
            "page.map.back": "กลับหน้าหลัก",
            "page.assistant.docTitle": "ผู้ช่วยบริการชาวจีนโพ้นทะเล · เฉียวจวงจวง",
            "page.assistant.h1": "ผู้ช่วยบริการชาวจีนโพ้นทะเล · เฉียวจวงจวง",
            "page.assistant.lead":
                "ผู้ช่วยด้านงานชาวจีนโพ้นทะเลของแพลตฟอร์มดิจิทัลหยู่หลิน ตอบคำถามจากข้อมูลที่เปิดเผยต่อสาธารณะ",
            "page.assistant.suggestHeading": "คำถามแนะนำ",
            "page.assistant.suggestMarqueeAria": "คำถามแนะนำเลื่อนอัตโนมัติ",
            "page.assistant.categoryHeading": "เลือกตามหัวข้อ",
            "page.assistant.inputPlaceholder": "สวัสดี! ฉันคือ เฉียวจวงจวง",
            "page.assistant.send": "ส่ง",
            "page.assistant.emptyPrompt": "พิมพ์คำถามก่อนนะ เฉียวจวงจวงจะตอบให้",
            "page.assistant.modalTitle": "เฉียวจวงจวง",
            "page.assistant.offlineFile":
                "โปรดเปิดหน้านี้ผ่าน HTTP (เซิร์ฟเวอร์ในเครื่อง) โหมด file:// เรียก API ไม่ได้",
            "assistant.cat.as-cat-001.category": "การเข้าสู่ตลาด",
            "assistant.cat.as-cat-001.tag": "เน้นความถูกต้องตามกฎ",
            "assistant.cat.as-cat-001.question":
                "ธุรกิจหยู่หลินขยายไปอาเซียน ควรตรวจสอบข้อมูลสาธารณะใดเป็นอย่างแรก?",
            "assistant.cat.as-cat-001.related":
                "ช่องทางบริการชาวจีนโพ้นทะเลที่เปิดเผย; ข้อมูลการค้า ASEAN อ่านได้ที่ไหน; รายชื่อบริการชาวจีนโพ้นทะเลหยู่หลินที่เปิดเผย",
            "assistant.cat.as-cat-002.category": "ภาษีและโครงสร้างนิติบุคคล",
            "assistant.cat.as-cat-002.tag": "วางแผนภาษี",
            "assistant.cat.as-cat-002.question":
                "ชาวจีนโพ้นทะเลลงทุนในจีน แหล่งข้อมูลเปิดเผยมักแนะเรื่องภาษีและรูปแบบนิติบุคคลอย่างไร?",
            "assistant.cat.as-cat-002.related":
                "สิทธิผู้พำนักกลับจากต่างประเทศตามระเบียบที่เปิดเผย; หลักการปฏิบัติตามกฎระหว่างประเทศเบื้องต้น; สรุป RCEP ฉบับเปิดเผยหาอ่านที่ไหน",
            "assistant.cat.as-cat-003.category": "ห่วงโซ่อุปทาน",
            "assistant.cat.as-cat-003.tag": "ประสิทธิภาพการส่งมอบ",
            "assistant.cat.as-cat-003.question":
                "สินค้าเด่นหยู่หลินที่จำหน่ายในตลาด ASEAN มีข้อมูลสาธารณะด้านโลจิสติกส์และการขนส่ง–จัดส่งครบวงจรอย่างไรบ้าง?",
            "assistant.cat.as-cat-003.related":
                "ขั้นตอนศุลกากรอีคอมเมิร์ซข้ามแดน; ท่าเรือสำคัญของ ASEAN ในข้อมูลเปิดเผย; กลุ่มอุตสาหกรรมหยู่หลินในข่าวที่เปิดเผย",
            "assistant.cat.as-cat-004.category": "การดำเนินงานในพื้นที่",
            "assistant.cat.as-cat-004.tag": "เติบโตในท้องถิ่น",
            "assistant.cat.as-cat-004.question":
                "ช่องทางสาธารณะใดที่มักใช้ติดต่อและบริการชาวหยู่หลินเชื้อสายในอาเซียนและต่างประเทศ?",
            "assistant.cat.as-cat-004.related":
                "วิธีค้นหาข้อมูลติดต่อสมาคมที่เปิดเผย; ประกาศกิจกรรมงานชาวจีนโพ้นทะเล; เอกสารวัฒนธรรมบ้านเกิดหยู่หลินที่เปิดเผย",
            "assistant.suggest.0":
                "ผู้พำนักกลับจากต่างประเทศในหยู่หลิน ติดต่อทำเอกสารทางการได้ทางช่องทางสาธารณะใดบ้าง?",
            "assistant.suggest.1": "ข้อมูลนโยบายชาวจีนโพ้นทะเลของเขตกว่างซีมักเผยแพร่ทางใด?",
            "assistant.suggest.2": "ความรู้เรื่ององค์กรเกี่ยวกับชาวจีนโพ้นทะเลที่นำเสนอต่อประชาชนได้ มีจุดใดจากข้อมูลเปิดเผยบ้าง?",
            "assistant.suggest.3":
                "ชาวหยู่หลินในอาเซียนและต่างประเทศจะติดต่อหรือรับข่าวบ้านเกิดผ่านช่องทางสาธารณะอย่างไร?",
            "assistant.suggest.4":
                "จะค้นหาข้อมูลองค์กรบริการชาวจีนโพ้นทะเลหยู่หลินที่เปิดเผยได้อย่างไร?",
            "assistant.suggest.5":
                "เรื่องบัตรประชาชนหรือรับรองเอกสารที่เกี่ยวกับชาวจีนโพ้นทะเล ในเอกสารเปิดเผยมักอธิบายอย่างไร?",
            "assistant.suggest.6": "แนะนำวัฒนธรรมบ้านเกิดหยู่หลินและการประชาสัมพันธ์ ทิศทางจากข้อมูลเปิดเผยมีอะไรบ้าง?",
            "assistant.suggest.7":
                "ความร่วมมืออุตสาหกรรมหยู่หลินกับ ASEAN ในรายงานข่าวเปิดเผยมักเน้นด้านใดบ้าง?",
            "assistant.suggest.8": "ช่องทางสาธารณะด้านความช่วยเหลือทางกฎหมายหรือคำปรึกษาเรื่องชาวจีนโพ้นทะเลมีอะไรบ้าง?",
            "assistant.suggest.9":
                "ในแง่สิทธิผู้พำนักกลับและญาติ ข้อมูลเปิดเผยระดับประเทศมักกล่าวถึงประเด็นใดบ้าง?",
            "i18n.prompt.out":
                "ใช้ภาษาไทยสำหรับข้อความที่ผู้ใช้เห็นทั้งหมด รักษาชื่อเฉพาะ เช่น Yulin / ASEAN ให้เป็นธรรมชาติ"
        },
        id: {
            "lang.name": "Bahasa Indonesia",
            "lang.btn": "Bahasa",
            "float.langTitle": "Bahasa",
            "home.title": "Platform Digital Urusan Tionghoa Perantauan Yulin",
            "home.mapPlaque": "Peta situasi Tionghoa perantauan",
            "home.mapLink": "Buka bagian peta",
            "home.mapLoading": "Memuat peta…",
            "home.industryStrip": "Industri unggulan kota asal Tionghoa perantauan",
            "panel.news": "Berita Tionghoa perantauan",
            "panel.demand": "Kebutuhan layanan",
            "panel.core": "Layanan inti",
            "nav.home": "Kembali ke beranda",
            "nav.core": "Kembali ke layanan inti",
            "page.map.title": "Bagian peta",
            "page.map.back": "Kembali ke beranda",
            "page.assistant.docTitle": "Asisten layanan Tionghoa perantauan · Qiao Zhuangzhuang",
            "page.assistant.h1": "Asisten layanan Tionghoa perantauan · Qiao Zhuangzhuang",
            "page.assistant.lead":
                "Asisten urusan Tionghoa perantauan platform digital Yulin, menjawab pertanyaan umum berdasarkan informasi publik.",
            "page.assistant.suggestHeading": "Pertanyaan disarankan",
            "page.assistant.suggestMarqueeAria": "Pertanyaan disarankan bergulir otomatis",
            "page.assistant.categoryHeading": "Telusuri menurut topik",
            "page.assistant.inputPlaceholder": "Hai! Saya Qiao Zhuangzhuang.",
            "page.assistant.send": "Kirim",
            "page.assistant.emptyPrompt": "Tulis pertanyaan dulu — Qiao Zhuangzhuang akan segera menjawab.",
            "page.assistant.modalTitle": "Qiao Zhuangzhuang",
            "page.assistant.offlineFile":
                "Buka halaman ini melalui http (server lokal). Protokol file:// tidak dapat memanggil API.",
            "assistant.cat.as-cat-001.category": "Akses pasar",
            "assistant.cat.as-cat-001.tag": "Kepatuhan dulu",
            "assistant.cat.as-cat-001.question":
                "Saat perusahaan Yulin memasuki Asia Tenggara, informasi publik apa yang perlu dicek lebih dulu?",
            "assistant.cat.as-cat-001.related":
                "Saluran layanan Tionghoa perantauan yang terbuka; di mana membaca informasi perdagangan ASEAN; daftar layanan qiaowu Yulin",
            "assistant.cat.as-cat-002.category": "Pajak & struktur",
            "assistant.cat.as-cat-002.tag": "Perencanaan pajak",
            "assistant.cat.as-cat-002.question":
                "Bagi Tionghoa perantauan yang berinvestasi di Tiongkok, apa yang umum disarankan sumber publik soal pajak dan bentuk badan usaha?",
            "assistant.cat.as-cat-002.related":
                "Hak warga Tionghoa kembali menurut peraturan terbuka; dasar kepatuhan lintas batas; ringkasan RCEP terbuka di mana",
            "assistant.cat.as-cat-003.category": "Rantai pasok",
            "assistant.cat.as-cat-003.tag": "Efisiensi pengiriman",
            "assistant.cat.as-cat-003.question":
                "Produk unggulan Yulin untuk pasar ASEAN — informasi logistik dan pemenuhan apa yang tersedia secara publik?",
            "assistant.cat.as-cat-003.related":
                "Alur bea cukai e‑commerce lintas batas; pelabuhan utama ASEAN dalam data publik; klaster industri Yulin dalam berita",
            "assistant.cat.as-cat-004.category": "Operasi lokal",
            "assistant.cat.as-cat-004.tag": "Pertumbuhan lokal",
            "assistant.cat.as-cat-004.question":
                "Saluran publik apa yang biasa dipakai untuk menghubungi dan melayani warga keturunan Yulin di luar negeri?",
            "assistant.cat.as-cat-004.related":
                "Cari kontak federasi yang terbuka; pengumuman acara qiaowu; materi budaya kampung halaman",
            "assistant.suggest.0":
                "Di mana mencari saluran publik bagi warga Tionghoa kembali untuk mengurus dokumen di Yulin?",
            "assistant.suggest.1": "Informasi kebijakan Tionghoa perantauan Guangxi biasanya dipublikasikan di mana?",
            "assistant.suggest.2":
                "Poin publik apa tentang federasi yang berguna dijelaskan kepada masyarakat?",
            "assistant.suggest.3":
                "Bagaimana warga keturunan Yulin di luar negeri menghubungi atau mendapat pembaruan kampung halaman secara publik?",
            "assistant.suggest.4":
                "Bagaimana mencari informasi publik tentang organisasi layanan Tionghoa perantauan di Yulin?",
            "assistant.suggest.5":
                "Bagaimana masalah KTP atau notarisasi untuk Tionghoa perantauan biasanya dijelaskan dalam materi publik?",
            "assistant.suggest.6":
                "Arah apa yang dapat diperkenalkan untuk budaya kampung halaman Yulin dan publikasi?",
            "assistant.suggest.7":
                "Bidang apa yang sering muncul dalam pelaporan publik tentang kerja sama industri Yulin–ASEAN?",
            "assistant.suggest.8":
                "Saluran publik apa untuk bantuan hukum atau konsultasi urusan Tionghoa perantauan?",
            "assistant.suggest.9":
                "Poin publik apa tentang hak warga Tionghoa kembali dan sanak keluarga di tingkat nasional?",
            "i18n.prompt.out":
                "Gunakan bahasa Indonesia untuk semua kalimat dan label yang terlihat pengguna. Pertahankan nama propri seperti Yulin dan ASEAN secara wajar."
        },
        vi: {
            "lang.name": "Tiếng Việt",
            "lang.btn": "Ngôn ngữ",
            "float.langTitle": "Ngôn ngữ",
            "home.title": "Nền tảng số công tác người Hoa Kiều Ngọc Lâm",
            "home.mapPlaque": "Bản đồ tình hình kiều bào",
            "home.mapLink": "Vào mục bản đồ",
            "home.mapLoading": "Đang tải bản đồ…",
            "home.industryStrip": "Ngành đặc sắc quê hương kiều bào",
            "panel.news": "Tin tức kiều vụ",
            "panel.demand": "Nhu cầu phục vụ",
            "panel.core": "Dịch vụ cốt lõi",
            "nav.home": "Về trang chủ",
            "nav.core": "Về dịch vụ cốt lõi",
            "page.map.title": "Mục bản đồ",
            "page.map.back": "Về trang chủ",
            "page.assistant.docTitle": "Trợ lý phục vụ kiều vụ · Kiều Tráng Tráng",
            "page.assistant.h1": "Trợ lý phục vụ kiều vụ · Kiều Tráng Tráng",
            "page.assistant.lead":
                "Trợ lý kiều vụ nền tảng số Ngọc Lâm, trả lời câu hỏi thường gặp dựa trên thông tin công khai.",
            "page.assistant.suggestHeading": "Gợi ý câu hỏi",
            "page.assistant.suggestMarqueeAria": "Gợi ý câu hỏi tự cuộn",
            "page.assistant.categoryHeading": "Duyệt theo chủ đề",
            "page.assistant.inputPlaceholder": "Xin chào! Tôi là Kiều Tráng Tráng.",
            "page.assistant.send": "Gửi",
            "page.assistant.emptyPrompt": "Hãy nhập câu hỏi trước — Kiều Tráng Tráng sẽ trả lời ngay.",
            "page.assistant.modalTitle": "Kiều Tráng Tráng",
            "page.assistant.offlineFile":
                "Vui lòng mở trang qua http (máy chủ tĩnh cục bộ). Giao thức file:// không gọi được API.",
            "assistant.cat.as-cat-001.category": "Tiếp cận thị trường",
            "assistant.cat.as-cat-001.tag": "Tuân thủ trước",
            "assistant.cat.as-cat-001.question":
                "Khi doanh nghiệp Ngọc Lâm mở rộng vào ASEAN, nên xem thông tin công khai nào trước?",
            "assistant.cat.as-cat-001.related":
                "Kênh phục vụ người Hoa kiều công khai; đọc thông tin thương mại ASEAN ở đâu; danh sách dịch vụ kiều vụ Ngọc Lâm",
            "assistant.cat.as-cat-002.category": "Thuế & cơ cấu",
            "assistant.cat.as-cat-002.tag": "Hoạch định thuế",
            "assistant.cat.as-cat-002.question":
                "Người Hoa kiều đầu tư vào Trung Quốc, tài liệu công khai thường gợi ý gì về thuế và mô hình pháp nhân?",
            "assistant.cat.as-cat-002.related":
                "Quyền lợi người hồi hương theo quy định công khai; điểm tuân thủ xuyên biên giới; tóm tắt RCEP công khai",
            "assistant.cat.as-cat-003.category": "Chuỗi cung ứng",
            "assistant.cat.as-cat-003.tag": "Hiệu quả giao hàng",
            "assistant.cat.as-cat-003.question":
                "Sản phẩm đặc sắc Ngọc Lâm bán vào ASEAN — có thông tin logistics và thực thi hợp đồng công khai nào?",
            "assistant.cat.as-cat-003.related":
                "Quy trình hải quan thương mại điện tử xuyên biên giới; cảng ASEAN trong dữ liệu công khai; cụm ngành Ngọc Lâm trên báo",
            "assistant.cat.as-cat-004.category": "Vận hành địa phương",
            "assistant.cat.as-cat-004.tag": "Tăng trưởng địa phương",
            "assistant.cat.as-cat-004.question":
                "Kênh công khai nào thường hỗ trợ liên lạc và phục vụ kiều bào gốc Ngọc Lâm ở nước ngoài?",
            "assistant.cat.as-cat-004.related":
                "Tìm liên hệ liên hiệp công khai; thông báo hoạt động kiều vụ; tài liệu văn hóa quê hương",
            "assistant.suggest.0":
                "Ở đâu có kênh công khai để người hồi hương làm thủ tục giấy tờ tại Ngọc Lâm?",
            "assistant.suggest.1": "Thông tin chính sách kiều vụ Quảng Tây thường đăng tải ở đâu?",
            "assistant.suggest.2":
                "Những điểm công khai nào về liên hiệp người Hoa hồi hương là hữu ích cho nhân dân?",
            "assistant.suggest.3":
                "Kiều bào gốc Ngọc Lâm ở nước ngoài liên hệ hoặc cập nhật tin quê hương qua kênh công khai thế nào?",
            "assistant.suggest.4":
                "Làm sao tra thông tin công khai về tổ chức dịch vụ kiều vụ tại Ngọc Lâm?",
            "assistant.suggest.5":
                "Vấn đề CMND hoặc công chứng cho người Hoa kiều trong tài liệu công khai thường diễn đạt ra sao?",
            "assistant.suggest.6":
                "Có thể giới thiệu hướng nào về văn hóa quê hương Ngọc Lâm và tuyên truyền?",
            "assistant.suggest.7":
                "Lĩnh vực nào thường xuất hiện trong báo cáo công khai hợp tác ngành Ngọc Lâm–ASEAN?",
            "assistant.suggest.8":
                "Kênh công khai nào cho trợ giúp pháp lý hoặc tư vấn kiều vụ?",
            "assistant.suggest.9":
                "Điểm công khai nào về quyền người hồi hương và thân nhân trong quy định quốc gia?",
            "i18n.prompt.out":
                "Dùng tiếng Việt cho toàn bộ câu chữ và nhãn hiển thị cho người dùng. Giữ tên riêng như Ngọc Lâm (Yulin) và ASEAN một cách tự nhiên."
        },
        ms: {
            "lang.name": "Bahasa Melayu",
            "lang.btn": "Bahasa",
            "float.langTitle": "Bahasa",
            "home.title": "Platform Digital Hal Ehwal Cina Perantauan Yulin",
            "home.mapPlaque": "Peta situasi Cina perantauan",
            "home.mapLink": "Buka bahagian peta",
            "home.mapLoading": "Memuatkan peta…",
            "home.industryStrip": "Industri terpilah kampung halaman Cina perantauan",
            "panel.news": "Berita hal ehwal Cina perantauan",
            "panel.demand": "Keperluan perkhidmatan",
            "panel.core": "Perkhidmatan teras",
            "nav.home": "Kembali ke laman utama",
            "nav.core": "Kembali ke perkhidmatan teras",
            "page.map.title": "Bahagian peta",
            "page.map.back": "Kembali ke laman utama",
            "page.assistant.docTitle": "Pembantu perkhidmatan Cina perantauan · Qiao Zhuangzhuang",
            "page.assistant.h1": "Pembantu perkhidmatan Cina perantauan · Qiao Zhuangzhuang",
            "page.assistant.lead":
                "Pembantu hal ehwal Cina perantauan platform digital Yulin, menjawab soalan biasa berdasarkan maklumat awam.",
            "page.assistant.suggestHeading": "Soalan disyorkan",
            "page.assistant.suggestMarqueeAria": "Soalan disyorkan bergulir secara automatik",
            "page.assistant.categoryHeading": "Layari mengikut topik",
            "page.assistant.inputPlaceholder": "Hai! Saya Qiao Zhuangzhuang.",
            "page.assistant.send": "Hantar",
            "page.assistant.emptyPrompt": "Taip soalan dahulu — Qiao Zhuangzhuang akan membalas.",
            "page.assistant.modalTitle": "Qiao Zhuangzhuang",
            "page.assistant.offlineFile":
                "Sila buka halaman ini melalui http (pelayan setempat). Protokol file:// tidak boleh memanggil API.",
            "assistant.cat.as-cat-001.category": "Akses pasaran",
            "assistant.cat.as-cat-001.tag": "Pematuhan dahulu",
            "assistant.cat.as-cat-001.question":
                "Apabila perniagaan Yulin kembangkan ke ASEAN, maklumat awam apa perlu disemak dahulu?",
            "assistant.cat.as-cat-001.related":
                "Saluran perkhidmatan Cina perantauan terbuka; di mana baca maklumat dagang ASEAN; senarai perkhidmatan qiaowu Yulin",
            "assistant.cat.as-cat-002.category": "Cukai & struktur",
            "assistant.cat.as-cat-002.tag": "Perancangan cukai",
            "assistant.cat.as-cat-002.question":
                "Bagi Cina perantauan melabur di China, apa yang biasa disarankan sumber awam tentang cukai dan entiti?",
            "assistant.cat.as-cat-002.related":
                "Hak orang Cina pulang menurut peraturan terbuka; asas pematuhan rentas sempadan; ringkasan RCEP",
            "assistant.cat.as-cat-003.category": "Rantaian bekalan",
            "assistant.cat.as-cat-003.tag": "Kecekapan penghantaran",
            "assistant.cat.as-cat-003.question":
                "Produk terpilih Yulin ke ASEAN — maklumat logistik dan pemenuhan apa yang terbuka secara awam?",
            "assistant.cat.as-cat-003.related":
                "Aliran kastam e-dagang rentas sempadan; pelabuhan utama ASEAN dalam data awam; kluster industri Yulin",
            "assistant.cat.as-cat-004.category": "Operasi tempatan",
            "assistant.cat.as-cat-004.tag": "Pertumbuhan tempatan",
            "assistant.cat.as-cat-004.question":
                "Saluran awam biasa untuk menghubungi dan berkhidmat kepada keturunan Yulin di luar negara?",
            "assistant.cat.as-cat-004.related":
                "Cari hubungan persekutuan terbuka; notis acara qiaowu; bahan budaya kampung halaman",
            "assistant.suggest.0":
                "Di mana mencari saluran awam untuk orang Cina pulang urus dokumen di Yulin?",
            "assistant.suggest.1": "Maklumat dasar Cina perantauan Guangxi biasanya diterbitkan di mana?",
            "assistant.suggest.2": "Apa perkara awam tentang persekutuan yang berguna untuk orang awam?",
            "assistant.suggest.3":
                "Bagaimana keturunan Yulin di luar negara berhubung atau dapat kemas kini kampung halaman secara awam?",
            "assistant.suggest.4":
                "Bagaimana mencari maklumat awam organisasi perkhidmatan Cina perantauan di Yulin?",
            "assistant.suggest.5":
                "Bagaimana hal ID atau notarisasi untuk Cina perantauan biasanya diterangkan dalam bahan awam?",
            "assistant.suggest.6":
                "Arah apa untuk memperkenalkan budaya kampung halaman Yulin dan publisiti?",
            "assistant.suggest.7":
                "Bidang apa sering muncul dalam laporan awam kerjasama industri Yulin–ASEAN?",
            "assistant.suggest.8":
                "Saluran awam apa untuk bantuan guaman atau perundingan hal Cina perantauan?",
            "assistant.suggest.9":
                "Perkara awam tentang hak orang Cina pulang dan sanak di peringkat negara?",
            "i18n.prompt.out":
                "Gunakan bahasa Melayu untuk semua ayat dan label yang kelihatan kepada pengguna. Kekalkan nama khas seperti Yulin dan ASEAN secara wajar."
        },
        fil: {
            "lang.name": "Filipino",
            "lang.btn": "Wika",
            "float.langTitle": "Wika",
            "home.title": "Digital na Plataporma para sa mga Gawaing Tsino sa Ibay-dagat ng Yulin",
            "home.mapPlaque": "Mapa ng kalagayan ng mga Tsino sa ibang bansa",
            "home.mapLink": "Pumasok sa seksyon ng mapa",
            "home.mapLoading": "Nilo-load ang mapa…",
            "home.industryStrip": "Itinatampok na industriya ng bayan ng mga kababayang Tsino",
            "panel.news": "Balita sa gawaing Tsino sa ibang bansa",
            "panel.demand": "Mga pangangailangan sa serbisyo",
            "panel.core": "Pangunahing serbisyo",
            "nav.home": "Bumalik sa home",
            "nav.core": "Bumalik sa pangunahing serbisyo",
            "page.map.title": "Seksyon ng mapa",
            "page.map.back": "Bumalik sa home",
            "page.assistant.docTitle": "Katuwang sa gawaing Tsino sa ibang dagat · Qiao Zhuangzhuang",
            "page.assistant.h1": "Katuwang sa gawaing Tsino sa ibang dagat · Qiao Zhuangzhuang",
            "page.assistant.lead":
                "Katuwang sa gawaing Tsino sa Ibay-dagat ng digital na platapormang Yulin; sumasagot batay sa pampublikong impormasyon.",
            "page.assistant.suggestHeading": "Iminumungkahing tanong",
            "page.assistant.suggestMarqueeAria": "Awtomatikong nag-scroll na iminumungkahing tanong",
            "page.assistant.categoryHeading": "Mag-browse ayon sa paksa",
            "page.assistant.inputPlaceholder": "Kamusta! Ako si Qiao Zhuangzhuang.",
            "page.assistant.send": "Ipadala",
            "page.assistant.emptyPrompt": "Mag-type muna ng tanong — sasagot si Qiao Zhuangzhuang.",
            "page.assistant.modalTitle": "Qiao Zhuangzhuang",
            "page.assistant.offlineFile":
                "Buksan ang pahina sa http (lokal na server). Hindi makaka-call ang API sa file://.",
            "assistant.cat.as-cat-001.category": "Pagpasok sa merkado",
            "assistant.cat.as-cat-001.tag": "Unahin ang pagsunod",
            "assistant.cat.as-cat-001.question":
                "Kapag lumalawak ang negosyong Yulin sa ASEAN, anong pampublikong impormasyon ang dapat unang suriin?",
            "assistant.cat.as-cat-001.related":
                "Pampublikong serbisyo para sa Tsino sa ibang bansa; saan magbasa ng impormasyon sa kalakalan ng ASEAN; listahan ng serbisyong qiaowu ng Yulin",
            "assistant.cat.as-cat-002.category": "Buwis at istruktura",
            "assistant.cat.as-cat-002.tag": "Plano sa buwis",
            "assistant.cat.as-cat-002.question":
                "Para sa mga Tsino sa ibang bansa na namumuhunan sa China, ano ang karaniwang iminumungkas sa pampublikong pinagmulan tungkol sa buwis at entidad?",
            "assistant.cat.as-cat-002.related":
                "Karapatan ng bumalik na Tsino ayon sa alituntuning bukas; batayan sa pagsunod sa hangganan; buod ng RCEP",
            "assistant.cat.as-cat-003.category": "Kadena ng suplay",
            "assistant.cat.as-cat-003.tag": "Kahusayan sa paghahatid",
            "assistant.cat.as-cat-003.question":
                "Mga tampok na produkto ng Yulin sa ASEAN — anong pampublikong impormasyon sa logistik at fulfillment?",
            "assistant.cat.as-cat-003.related":
                "Daloy ng customs sa cross-border e-commerce; pangunahing daungan sa ASEAN sa pampublikong datos; industriya ng Yulin sa balita",
            "assistant.cat.as-cat-004.category": "Operasyon sa lokal",
            "assistant.cat.as-cat-004.tag": "Lokal na paglago",
            "assistant.cat.as-cat-004.question":
                "Anong pampublikong channel ang karaniwang ginagamit para makipag-ugnayan sa mga kababayang Yulin sa ibang bansa?",
            "assistant.cat.as-cat-004.related":
                "Hanapin ang pampublikong contact ng federation; abiso sa kaganapang qiaowu; materyal na pangkultura sa bayan",
            "assistant.suggest.0":
                "Saan makakahanap ng pampublikong channel ang bumalik na Tsino para magpasa ng papeles sa Yulin?",
            "assistant.suggest.1": "Saan karaniwang inilalathala ang patakarang Tsino sa ibang bansa ng Guangxi?",
            "assistant.suggest.2":
                "Anong pampublikong punto tungkol sa federation ang kapaki-pakinabang para sa mamamayan?",
            "assistant.suggest.3":
                "Paano makikipag-ugnayan o makakakuha ng balita ang mga kababayang Yulin sa ibang bansa sa pampublikong paraan?",
            "assistant.suggest.4":
                "Paano maghanap ng pampublikong impormasyon sa mga ahensya ng serbisyong Tsino sa ibang bansa sa Yulin?",
            "assistant.suggest.5":
                "Paano karaniwang nailalarawan ang ID o notaryo para sa Tsino sa ibang bansa sa pampublikong materyales?",
            "assistant.suggest.6":
                "Anong direksyon ang maihahandog tungkol sa kultura ng bayan ng Yulin at publisidad?",
            "assistant.suggest.7":
                "Anong larangan ang madalas sa pampublikong ulat sa ugnayang industriya ng Yulin–ASEAN?",
            "assistant.suggest.8":
                "Anong pampublikong channel para sa tulong legal o konsultasyon sa gawaing Tsino sa ibang bansa?",
            "assistant.suggest.9":
                "Anong pampublikong puntos sa karapatan ng bumalik na Tsino at kanilang kamag-anak sa buong bansa?",
            "i18n.prompt.out":
                "Gamitin ang Filipino para sa lahat ng pangungusap at label na nakikita ng user. Panatilihing natural ang mga pantanging pangalan tulad ng Yulin at ASEAN."
        }
    };

    var SEA_SURPLUS_STRINGS = {
        th: {
            "core.empty": "ยังไม่มีบริการหลัก",
            "demand.empty": "ยังไม่มีข้อมูล",
            "demand.status.pending": "รอดำเนินการ",
            "demand.status.progress": "กำลังดำเนินการ",
            "demand.status.done": "เสร็จสิ้นแล้ว",
            "demand.item.dem-001.title": "สนับสนุนการเริ่มธุรกิจของนักศึกษาต่างชาติ",
            "demand.item.dem-001.summary": "ขอรับคำแนะนโยบายการเริ่มต้นธุรกิจและการจับคู่ทรัพยากรสถานที่.",
            "demand.item.dem-002.title": "ที่ปรึกษาเลือกที่ตั้งโรงงานเงินทุนจากชาวจีนโพ้นทะเล",
            "demand.item.dem-002.summary": "วางแผนโครงการแปรรูปอาหาร ต้องการข้อเสนอนิคมอุตสาหกรรมและประเมินพลังงาน.",
            "demand.item.dem-003.title": "ที่ปรึกษากฎหมายการค้าข้ามพรมแดน",
            "demand.item.dem-003.summary": "ตรวจสัญญาเพื่อความสอดคล้องและบันทึกความเสี่ยงเสร็จแล้ว.",
            "demand.item.dem-004.title": "ประชาสัมพันธ์แบรนด์สู่ต่างประเทศของวิสาหกิจชาวจีนโพ้นทะเล",
            "demand.item.dem-004.summary": "ต้องการวางแผนการสื่อสารแบรนด์สำหรับตลาดอาเซียน.",
            "demand.item.dem-005.title": "ขอจัดโรดโชว์และแหล่งเงินทุน",
            "demand.item.dem-005.summary": "วางแผนจัดนำเสนอโครงการและเชื่อมกับกองทุนและสินเชื่อธนาคาร.",
            "demand.item.dem-006.title": "สนับสนุนการตรวจสอบความสอดคล้องข้ามพรมแดน",
            "demand.item.dem-006.summary": "ต้องการประเมินภาษีและการปฏิบัติตามกฎหมายล่วงหน้าในประเทศเป้าหมาย.",
            "demand.item.dem-007.title": "ที่ปรึกษาคลังสินค้าต่างประเทศ",
            "demand.item.dem-007.summary": "วางแผนคลังกลางในช่วงอินโดนีเซียและปรับปรุงเส้นทางจัดส่ง.",
            "demand.item.dem-008.title": "บรรจุภัณฑ์แบรนด์หลายภาษา",
            "demand.item.dem-008.summary": "ปรับงานสร้างสรรค์ให้เหมาะกับมลายู อินโดนีเซีย และตลาดภาษาอังกฤษ.",
            "demand.item.dem-009.title": "จับคู่บุคลากรสำหรับวิสาหกิจชาวจีนโพ้นทะเล",
            "demand.item.dem-009.summary": "ต้องการดึงคนที่คุ้นเคยการดำเนินงานในตลาดอาเซียน.",
            "demand.item.dem-010.title": "แนะแนวจดทะเบียนเครื่องหมายการค้าระหว่างประเทศ",
            "demand.item.dem-010.summary": "ให้คำปรึกษาขั้นตอนจดเครื่องหมายในสิงคโปร์และอินโดนีเซียเสร็จแล้ว.",
            "demand.item.dem-011.title": "ความร่วมมือขยายช่องทางต่างประเทศ",
            "demand.item.dem-011.summary": "เชื่อมตัวแทนจำหน่ายในพื้นที่และนำร่องเครือข่ายจัดจำหน่าย.",
            "demand.item.dem-012.title": "ฝึกเข้าร่วมแพลตฟอร์มอีคอมเมิร์ซข้ามพรมแดน",
            "demand.item.dem-012.summary": "ต้องการอบรมกฎแพลตฟอร์มและจัดระบบการดำเนินร้าน.",
            "dynamic.unnamed": "ไม่มีชื่อเรื่อง",
            "dynamic.bodyFallback":
                "แตะ「เปิดต้นฉบับ」เพื่อดูรายการข่าวและลิงก์ต้นฉบับ",
            "dynamic.syncMeta": "แสดงผลเมื่อ {time} · ข้อมูลจาก API ฝั่งข้อมูล Volcengine",
            "dynamic.empty.hint":
                "ยังไม่มีข่าว ตรวจสอบ dataApiKey ใน date/volc-ark-apis.json และเปิดเว็บผ่าน http(s) หรือแตะ「รีเฟรช」ในหน้าข่าว",
            "dynamic.newsEmpty":
                "ยังไม่มีข่าว ตรวจสอบ dataApiKey แล้วลองใหม่หรือรีเฟรชในหน้าข่าว",
            "dynamic.refresh.working": "กำลังเรียก API ฝั่งข้อมูล…",
            "dynamic.refresh.busy": "มีงานกำลังทำอยู่",
            "dynamic.refresh.fail": "รีเฟรชล้มเหลว: ",
            "dynamic.refresh.done": "ดึงข้อมูลเสร็จ รวม {n} รายการ",
            "dynamic.refresh.empty": "ดึงเสร็จ ไม่มีรายการใหม่",
            "dynamic.refresh.offline":
                "รีเฟรชล้มเหลว: ตรวจสอบเครือข่ายหรือ dataApiKey ใน date/volc-ark-apis.json",
            "map.empty": "ยังไม่มีข้อมูลแผนที่",
            "map.sdkFail": "โหลด SDK แผนที่หน้าแรกล้มเหลว",
            "map.ready": "แผนที่หน้าแรกพร้อมใช้งาน",
            "map.done": "โหลดแผนที่หน้าแรกเสร็จ",
            "map.selectedTpl": "เมืองปัจจุบัน: {city}",
            "map.selected.none": "โปรดเลือก",
            "map.stats.merchants": "จำนวนนักธุรกิจในพื้นที่: {n1}",
            "map.stats.enterprises": "จำนวนวิสาหกิจ: {n2}",
            "map.merchant.empty": "ไม่มีนักธุรกิจตามตัวกรองปัจจุบัน",
            "map.selectedCountTpl": "เมืองปัจจุบัน: {city}（{n}）",
            "map.allCities": "ทุกเมือง",
            "map.merchant.noMatch": "ไม่พบนักธุรกิจ โปรดปรับตัวกรอง",
            "map.merchant.translating": "กำลังแปลรายชื่อนักธุรกิจ…",
            "map.coord": "พิกัด: {lat}，{lng}",
            "map.contactPending": "รอเพิ่มข้อมูลติดต่อ",
            "map.sdkFailLong": "โหลด SDK แผนที่ไม่สำเร็จ ตรวจสอบเครือข่ายแล้วลองอีกครั้ง",
            "map.error.bmap":
                "โหลด Baidu Map SDK ไม่สำเร็จ ตรวจสอบเครือข่ายและ allowlist ของ AK",
            "map.error.akMissing":
                "ยังไม่มี Baidu Map AK — ตั้ง baiduMapAk ใน date/volc-ark-apis.json（ดู docs/API说明.md）",
            "map.error.noCsv": "ไม่มีข้อมูลแผนที่ ตรวจสอบ merchants.csv",
            "map.finishReady": "แผนที่เข้าสู่สถานะพร้อมใช้",
            "map.finishDone": "โหลดแผนที่เสร็จสิ้น",
            "map.cityQuick.merchants": "จำนวนนักธุรกิจ",
            "map.cityQuick.enterprises": "จำนวนวิสาหกิจ",
            "map.cityQuick.types": "ประเภทธุรกิจ",
            "weather.night": "กลางคืน 20°C",
            "weather.dayHot": "แดดจัด 30°C",
            "weather.dayCloud": "มีเมฆ 25°C",
            "weather.dayCool": "ครึ้ม 16°C",
            "weather.dayMild": "แจ่มใส 22°C",
            "week.0": "อา.",
            "week.1": "จ.",
            "week.2": "อ.",
            "week.3": "พ.",
            "week.4": "พฤ.",
            "week.5": "ศ.",
            "week.6": "ส.",
            "src.yqzwx": "เส้นเมอริเดียนหยูเฉียว",
            "src.gov.yulin": "เว็บราชการมณฑลหยู่หลิน",
            "src.gxylnews": "ข่าวหยู่หลิน",
            "src.local": "ข้อมูลในเครื่อง",
        },
        id: {
            "core.empty": "Belum ada layanan inti",
            "demand.empty": "Belum ada data",
            "demand.status.pending": "Menunggu",
            "demand.status.progress": "Diproses",
            "demand.status.done": "Selesai",
            "demand.item.dem-001.title": "Dukungan kewirausahaan mahasiswa dari luar negeri",
            "demand.item.dem-001.summary": "Mengajukan bimbingan kebijakan startup dan penghubungan sumber daya lahan.",
            "demand.item.dem-002.title": "Konsultasi pemilihan lokasi pabrik investasi Tionghoa perantauan",
            "demand.item.dem-002.summary": "Merencanakan proyek pengolahan pangan; perlu saran kawasan industri dan penilaian energi.",
            "demand.item.dem-003.title": "Konsultasi hukum perdagangan lintas batas",
            "demand.item.dem-003.summary": "Pemeriksaan kontrak untuk kepatuhan dan catatan risiko telah selesai.",
            "demand.item.dem-004.title": "Promosi merek ke luar negeri bagi perusahaan Tionghoa perantauan",
            "demand.item.dem-004.summary": "Ingin menyusun rencana komunikasi merek untuk pasar Asia Tenggara.",
            "demand.item.dem-005.title": "Pengajuan roadshow pembiayaan pelaku usaha Tionghoa perantauan",
            "demand.item.dem-005.summary": "Merencanakan roadshow proyek dan menghubungkan dana industri serta fasilitas kredit bank.",
            "demand.item.dem-006.title": "Dukungan audit kepatuhan lintas batas",
            "demand.item.dem-006.summary": "Ingin melakukan penilaian awal pajak dan kepatuhan di negara tujuan.",
            "demand.item.dem-007.title": "Konsultasi pembangunan gudang luar negeri",
            "demand.item.dem-007.summary": "Merencanakan gudang regional di Indonesia dan mengoptimalkan rute pengiriman.",
            "demand.item.dem-008.title": "Desain kemasan merek multibahasa",
            "demand.item.dem-008.summary": "Perlu menyesuaikan materi untuk pasar Melayu, Indonesia, dan Inggris.",
            "demand.item.dem-009.title": "Pencocokan talenta bagi perusahaan Tionghoa perantauan",
            "demand.item.dem-009.summary": "Ingin merekrut talenta yang menguasai operasi pasar ASEAN.",
            "demand.item.dem-010.title": "Bimbingan pendaftaran merek dagang internasional",
            "demand.item.dem-010.summary": "Konsultasi proses merek di Singapura dan Indonesia telah selesai.",
            "demand.item.dem-011.title": "Kerja sama perluasan saluran luar negeri",
            "demand.item.dem-011.summary": "Menghubungkan distributor lokal dan merintis jaringan distribusi percobaan.",
            "demand.item.dem-012.title": "Pelatihan masuk platform e‑commerce lintas batas",
            "demand.item.dem-012.summary": "Perlu pelaturan aturan platform dan alur operasi toko.",
            "dynamic.unnamed": "Tanpa judul",
            "dynamic.bodyFallback":
                "Gunakan «Baca sumber» untuk daftar berita dan tautan asli.",
            "dynamic.syncMeta": "Dirender pada {time} · Data dari API data Volcengine",
            "dynamic.empty.hint":
                "Belum ada berita. Periksa dataApiKey di date/volc-ark-apis.json dan buka situs lewat http(s), atau «Segarkan» di halaman berita.",
            "dynamic.newsEmpty":
                "Belum ada berita. Periksa dataApiKey lalu coba lagi atau segarkan di halaman berita.",
            "dynamic.refresh.working": "Memanggil API data Volcengine…",
            "dynamic.refresh.busy": "Tugas lain sedang berjalan",
            "dynamic.refresh.fail": "Segarkan gagal: ",
            "dynamic.refresh.done": "Selesai mengambil {n} entri",
            "dynamic.refresh.empty": "Selesai, tidak ada entri baru",
            "dynamic.refresh.offline":
                "Segarkan gagal: periksa jaringan atau dataApiKey di date/volc-ark-apis.json.",
            "map.empty": "Belum ada data peta",
            "map.sdkFail": "Gagal memuat SDK peta beranda",
            "map.ready": "Peta beranda siap",
            "map.done": "Peta beranda selesai dimuat",
            "map.selectedTpl": "Kota saat ini: {city}",
            "map.selected.none": "Pilih",
            "map.stats.merchants": "Jumlah pedagang di wilayah: {n1}",
            "map.stats.enterprises": "Jumlah perusahaan: {n2}",
            "map.merchant.empty": "Tidak ada pedagang untuk filter ini",
            "map.selectedCountTpl": "Kota saat ini: {city} ({n})",
            "map.allCities": "Semua kota",
            "map.merchant.noMatch": "Tidak cocok — sesuaikan filter.",
            "map.merchant.translating": "Menerjemahkan daftar pedagang…",
            "map.coord": "Koordinat: {lat}, {lng}",
            "map.contactPending": "Kontak akan dilengkapi",
            "map.sdkFailLong": "Gagal memuat SDK peta — periksa jaringan lalu coba lagi.",
            "map.error.bmap":
                "SDK Baidu Map tidak dimuat — periksa jaringan dan daftar putih kunci AK.",
            "map.error.akMissing":
                "AK Baidu Map belum diisi — isi baiduMapAk di date/volc-ark-apis.json; lihat docs/API说明.md.",
            "map.error.noCsv": "Tidak ada data peta — periksa merchants.csv.",
            "map.finishReady": "Peta dapat digunakan",
            "map.finishDone": "Pemuatan peta selesai",
            "map.cityQuick.merchants": "Pedagang",
            "map.cityQuick.enterprises": "Perusahaan",
            "map.cityQuick.types": "Kategori",
            "weather.night": "Malam 20°C",
            "weather.dayHot": "Cerah 30°C",
            "weather.dayCloud": "Berawan 25°C",
            "weather.dayCool": "Mendung 16°C",
            "weather.dayMild": "Cerah 22°C",
            "week.0": "Min",
            "week.1": "Sen",
            "week.2": "Sel",
            "week.3": "Rab",
            "week.4": "Kam",
            "week.5": "Jum",
            "week.6": "Sab",
            "src.yqzwx": "Meridian Yuqiao",
            "src.gov.yulin": "Situs pemerintah Yulin",
            "src.gxylnews": "Berita Yulin",
            "src.local": "Berita lokal",
        },
        vi: {
            "core.empty": "Chưa có dịch vụ cốt lõi",
            "demand.empty": "Chưa có dữ liệu",
            "demand.status.pending": "Chờ xử lý",
            "demand.status.progress": "Đang xử lý",
            "demand.status.done": "Hoàn thành",
            "demand.item.dem-001.title": "Hỗ trợ khởi nghiệp cho lưu học sinh ở nước ngoài",
            "demand.item.dem-001.summary": "Đăng ký tư vấn chính sách khởi nghiệp và ghép nối mặt bằng.",
            "demand.item.dem-002.title": "Tư vấn chọn địa điểm nhà máy vốn kiều",
            "demand.item.dem-002.summary": "Dự án chế biến thực phẩm cần gợi ý khu công nghiệp và đánh giá năng lượng.",
            "demand.item.dem-003.title": "Tư vấn pháp lý thương mại xuyên biên giới",
            "demand.item.dem-003.summary": "Đã rà soát điều khoản hợp đồng và rủi ro tuân thủ.",
            "demand.item.dem-004.title": "Truyền thông thương hiệu ra nước ngoài cho doanh nghiệp kiều",
            "demand.item.dem-004.summary": "Muốn xây dựng phương án truyền thông cho thị trường Đông Nam Á.",
            "demand.item.dem-005.title": "Đăng ký roadshow và huy động vốn",
            "demand.item.dem-005.summary": "Dự kiến tổ chức giới thiệu dự án và kết nối quỹ ngành, tín dụng ngân hàng.",
            "demand.item.dem-006.title": "Hỗ trợ kiểm toán tuân thủ xuyên biên giới",
            "demand.item.dem-006.summary": "Muốn đánh giá sơ bộ thuế và tuân thủ tại nước đích.",
            "demand.item.dem-007.title": "Tư vấn kho nước ngoài",
            "demand.item.dem-007.summary": "Kế hoạch kho trung chuyển tại Indonesia và tối ưu tuyến giao hàng.",
            "demand.item.dem-008.title": "Thiết kế bao bì thương hiệu đa ngữ",
            "demand.item.dem-008.summary": "Cần thích nghi tài liệu cho thị trường tiếng Mã Lai, Indonesia và Anh.",
            "demand.item.dem-009.title": "Ghép nối nhân tài cho doanh nghiệp kiều",
            "demand.item.dem-009.summary": "Muốn thu hút nhân sự quen vận hành thị trường ASEAN.",
            "demand.item.dem-010.title": "Hướng dẫn đăng ký nhãn hiệu quốc tế",
            "demand.item.dem-010.summary": "Đã tư vấn quy trình tại Singapore và Indonesia.",
            "demand.item.dem-011.title": "Hợp tác mở rộng kênh nước ngoài",
            "demand.item.dem-011.summary": "Kết nối nhà phân phối địa phương, thí điểm mạng lưới phân phối.",
            "demand.item.dem-012.title": "Hướng dẫn gian hàng nền tảng thương mại điện tử xuyên biên giới",
            "demand.item.dem-012.summary": "Cần đào tạo quy tắc nền tảng và quy trình vận hành cửa hàng.",
            "dynamic.unnamed": "Chưa đặt tên",
            "dynamic.bodyFallback":
                "Dùng «Đọc nguồn» để xem danh sách và liên kết gốc.",
            "dynamic.syncMeta": "Hiển thị lúc {time} · Dữ liệu từ API dữ liệu Volcengine",
            "dynamic.empty.hint":
                "Chưa có tin. Kiểm tra dataApiKey trong date/volc-ark-apis.json, mở trang bằng http(s), hoặc «Làm mới» ở trang tin.",
            "dynamic.newsEmpty":
                "Chưa có tin. Kiểm tra dataApiKey rồi thử lại hoặc làm mới ở trang tin.",
            "dynamic.refresh.working": "Đang gọi API dữ liệu Volcengine…",
            "dynamic.refresh.busy": "Đang có tác vụ khác",
            "dynamic.refresh.fail": "Làm mới thất bại: ",
            "dynamic.refresh.done": "Đã lấy {n} mục",
            "dynamic.refresh.empty": "Hoàn tất, không có mục mới",
            "dynamic.refresh.offline":
                "Làm mới thất bại: kiểm tra mạng hoặc dataApiKey trong date/volc-ark-apis.json.",
            "map.empty": "Chưa có dữ liệu bản đồ",
            "map.sdkFail": "Tải SDK bản đồ trang chủ thất bại",
            "map.ready": "Bản đồ trang chủ sẵn sàng",
            "map.done": "Đã tải xong bản đồ trang chủ",
            "map.selectedTpl": "Thành phố hiện tại: {city}",
            "map.selected.none": "Chọn",
            "map.stats.merchants": "Số thương nhân địa phương: {n1}",
            "map.stats.enterprises": "Số doanh nghiệp: {n2}",
            "map.merchant.empty": "Không có thương nhân với bộ lọc hiện tại",
            "map.selectedCountTpl": "Thành phố hiện tại: {city} ({n})",
            "map.allCities": "Tất cả thành phố",
            "map.merchant.noMatch": "Không khớp — hãy điều chỉnh bộ lọc.",
            "map.merchant.translating": "Đang dịch danh sách thương nhân…",
            "map.coord": "Tọa độ: {lat}, {lng}",
            "map.contactPending": "Liên hệ sẽ bổ sung",
            "map.sdkFailLong": "Tải SDK bản đồ thất bại — kiểm tra mạng rồi thử lại.",
            "map.error.bmap":
                "SDK Baidu Map chưa tải — kiểm tra mạng và danh sách trắng AK.",
            "map.error.akMissing":
                "Thiếu AK Baidu Map — điền baiduMapAk trong date/volc-ark-apis.json; xem docs/API说明.md.",
            "map.error.noCsv": "Không có dữ liệu bản đồ — kiểm tra merchants.csv.",
            "map.finishReady": "Bản đồ đã có thể dùng",
            "map.finishDone": "Tải bản đồ hoàn tất",
            "map.cityQuick.merchants": "Thương nhân",
            "map.cityQuick.enterprises": "Doanh nghiệp",
            "map.cityQuick.types": "Ngành",
            "weather.night": "Đêm 20°C",
            "weather.dayHot": "Nắng 30°C",
            "weather.dayCloud": "Nhiều mây 25°C",
            "weather.dayCool": "Âm u 16°C",
            "weather.dayMild": "Nắng nhẹ 22°C",
            "week.0": "CN",
            "week.1": "T2",
            "week.2": "T3",
            "week.3": "T4",
            "week.4": "T5",
            "week.5": "T6",
            "week.6": "T7",
            "src.yqzwx": "Kinh tuyến Du kiều",
            "src.gov.yulin": "Chính phủ Ngọc Lâm",
            "src.gxylnews": "Tin Ngọc Lâm",
            "src.local": "Tin địa phương",
        },
        ms: {
            "core.empty": "Tiada perkhidmatan teras",
            "demand.empty": "Tiada data",
            "demand.status.pending": "Menunggu",
            "demand.status.progress": "Sedang diproses",
            "demand.status.done": "Selesai",
            "demand.item.dem-001.title": "Sokongan keusahawanan pelajar luar negara",
            "demand.item.dem-001.summary": "Mohon bimbingan dasar startup dan pemadanan sumber ruang.",
            "demand.item.dem-002.title": "Perundingan tapak kilang pelaburan Cina perantauan",
            "demand.item.dem-002.summary": "Projek pemprosesan makanan memerlukan cadangan taman perindustrian dan penilaian tenaga.",
            "demand.item.dem-003.title": "Perundingan undang-undang perdagangan rentas sempadan",
            "demand.item.dem-003.summary": "Semakan kontrak untuk pematuhan dan risiko telah selesai.",
            "demand.item.dem-004.title": "Promosi jenama ke luar negara bagi perusahaan Cina perantauan",
            "demand.item.dem-004.summary": "Ingin merangka komunikasi jenama untuk pasaran ASEAN.",
            "demand.item.dem-005.title": "Permohonan roadshow pembiayaan usahawan Cina perantauan",
            "demand.item.dem-005.summary": "Merancang pembentangan projek dan menghubungkan dana industri serta kredit bank.",
            "demand.item.dem-006.title": "Sokongan audit pematuhan rentas sempadan",
            "demand.item.dem-006.summary": "Ingin penilaian awal cukai dan pematuhan di negara sasaran.",
            "demand.item.dem-007.title": "Perundingan gudang luar negara",
            "demand.item.dem-007.summary": "Merancang hab gudang serantau di Indonesia dan mengoptimumkan laluan penghantaran.",
            "demand.item.dem-008.title": "Reka bentuk pembungkusan jenama pelbagai bahasa",
            "demand.item.dem-008.summary": "Perlu menyesuaikan untuk pasaran Melayu, Indonesia dan Inggeris.",
            "demand.item.dem-009.title": "Padanan bakat bagi perusahaan Cina perantauan",
            "demand.item.dem-009.summary": "Ingin merekrut bakat yang biasa dengan operasi ASEAN.",
            "demand.item.dem-010.title": "Bimbingan pendaftaran tanda dagangan antarabangsa",
            "demand.item.dem-010.summary": "Perundingan proses di Singapura dan Indonesia telah selesai.",
            "demand.item.dem-011.title": "Kerjasama pengembangan saluran luar negara",
            "demand.item.dem-011.summary": "Berhubung dengan pengedar tempatan dan perintis rangkaian pengedaran.",
            "demand.item.dem-012.title": "Latihan kemasukan platform e-dagang rentas sempadan",
            "demand.item.dem-012.summary": "Perlu latihan peraturan platform dan aliran operasi kedai.",
            "dynamic.unnamed": "Tanpa tajuk",
            "dynamic.bodyFallback":
                "Gunakan «Baca sumber» untuk senarai dan pautan asal.",
            "dynamic.syncMeta": "Dipaparkan pada {time} · Data daripada API data Volcengine",
            "dynamic.empty.hint":
                "Tiada berita. Sahkan dataApiKey dalam date/volc-ark-apis.json dan buka laman melalui http(s), atau «Muat semula» di halaman berita.",
            "dynamic.newsEmpty":
                "Tiada berita. Sahkan dataApiKey lalu cuba semula atau muat semula di halaman berita.",
            "dynamic.refresh.working": "Memanggil API data Volcengine…",
            "dynamic.refresh.busy": "Tugasan lain sedang berjalan",
            "dynamic.refresh.fail": "Muat semula gagal: ",
            "dynamic.refresh.done": "Selesai, {n} entri",
            "dynamic.refresh.empty": "Selesai, tiada entri baharu",
            "dynamic.refresh.offline":
                "Muat semula gagal: periksa rangkaian atau dataApiKey dalam date/volc-ark-apis.json.",
            "map.empty": "Tiada data peta",
            "map.sdkFail": "SDK peta laman utama gagal dimuatkan",
            "map.ready": "Peta laman utama sedia",
            "map.done": "Peta laman utama siap dimuatkan",
            "map.selectedTpl": "Bandar semasa: {city}",
            "map.selected.none": "Pilih",
            "map.stats.merchants": "Bilangan pedagang setempat: {n1}",
            "map.stats.enterprises": "Bilangan perusahaan: {n2}",
            "map.merchant.empty": "Tiada pedagang untuk tapisan ini",
            "map.selectedCountTpl": "Bandar semasa: {city} ({n})",
            "map.allCities": "Semua bandar",
            "map.merchant.noMatch": "Tiada padanan — laraskan tapisan.",
            "map.merchant.translating": "Menterjemahkan senarai pedagang…",
            "map.coord": "Koordinat: {lat}, {lng}",
            "map.contactPending": "Hubungan akan disiapkan",
            "map.sdkFailLong": "SDK peta gagal — periksa rangkaian dan cuba lagi.",
            "map.error.bmap":
                "SDK Baidu Map tidak dimuat — periksa rangkaian dan senarai putih AK.",
            "map.error.akMissing":
                "AK Baidu Map tiada — isi baiduMapAk dalam date/volc-ark-apis.json; rujuk docs/API说明.md.",
            "map.error.noCsv": "Tiada data peta — periksa merchants.csv.",
            "map.finishReady": "Peta sedia digunakan",
            "map.finishDone": "Pemuatan peta selesai",
            "map.cityQuick.merchants": "Pedagang",
            "map.cityQuick.enterprises": "Perusahaan",
            "map.cityQuick.types": "Kategori",
            "weather.night": "Malam 20°C",
            "weather.dayHot": "Cerah 30°C",
            "weather.dayCloud": "Berawan 25°C",
            "weather.dayCool": "Mendung 16°C",
            "weather.dayMild": "Cerah 22°C",
            "week.0": "Ahd",
            "week.1": "Isn",
            "week.2": "Sel",
            "week.3": "Rab",
            "week.4": "Kha",
            "week.5": "Jum",
            "week.6": "Sab",
            "src.yqzwx": "Meridian Yuqiao",
            "src.gov.yulin": "Kerajaan Yulin",
            "src.gxylnews": "Berita Yulin",
            "src.local": "Setempat",
        },
        fil: {
            "core.empty": "Walang pangunahing serbisyo",
            "demand.empty": "Walang datos",
            "demand.status.pending": "Nakabinbin",
            "demand.status.progress": "Isinasagawa",
            "demand.status.done": "Tapos na",
            "demand.item.dem-001.title": "Suporta sa negosyo ng mga estudyante mula sa ibang bansa",
            "demand.item.dem-001.summary": "Humihiling ng gabay sa polisiya sa startup at pagtutugma ng lugar.",
            "demand.item.dem-002.title": "Konsultasyon sa pagpili ng pabrika ng pamumuhunan ng Tsino sa ibang bansa",
            "demand.item.dem-002.summary": "Plano sa food processing — kailangan ng opsyon sa industrial park at pagsusuri ng enerhiya.",
            "demand.item.dem-003.title": "Legal na konsultasyon sa cross-border trade",
            "demand.item.dem-003.summary": "Tapos na ang pagsusuri ng kontrata at babala sa panganib.",
            "demand.item.dem-004.title": "Promosyon ng brand papunta sa ibang bansa para sa enterprise ng kiều",
            "demand.item.dem-004.summary": "Nais gumawa ng plano sa komunikasyon ng brand para sa Timog-Silangang Asya.",
            "demand.item.dem-005.title": "Aplikasyon sa roadshow at pinansyal na ponde",
            "demand.item.dem-005.summary": "Mag-aayos ng roadshow ng proyek at koneksyon sa pondo at linya ng kredito sa bangko.",
            "demand.item.dem-006.title": "Suporta sa cross-border compliance audit",
            "demand.item.dem-006.summary": "Nais ng paunang pagsusuri ng buwis at pagsunod sa bansang target.",
            "demand.item.dem-007.title": "Konsultasyon sa bodega sa ibang bansa",
            "demand.item.dem-007.summary": "Plano ng regional hub warehouse sa Indonesia at mas mahusay na ruta ng padala.",
            "demand.item.dem-008.title": "Multilingual na disenyo ng packaging ng brand",
            "demand.item.dem-008.summary": "Dapat umangkop sa merkado ng Malay, Indonesian at Ingles.",
            "demand.item.dem-009.title": "Pagtutugma ng talento para sa enterprise ng kiều",
            "demand.item.dem-009.summary": "Nais kumuha ng pamilyar sa operasyon ng merkado ng ASEAN.",
            "demand.item.dem-010.title": "Gabay sa internasyonal na trademark",
            "demand.item.dem-010.summary": "Tapos na ang konsultasyon sa Singapore at Indonesia.",
            "demand.item.dem-011.title": "Pakikipagtulungan sa pagpapalawak ng channel sa ibang bansa",
            "demand.item.dem-011.summary": "Kumonekta sa lokal na distributor at pilot network sa pamamahagi.",
            "demand.item.dem-012.title": "Pag-tuturo sa pagpasok sa cross-border e-commerce platform",
            "demand.item.dem-012.summary": "Kailangan ng pagsasanay sa panuntunan ng platform at checklist ng operasyon ng tindahan.",
            "dynamic.unnamed": "Walang pamagat",
            "dynamic.bodyFallback":
                "Gamitin ang «Basahin ang pinagmulan» para sa listahan at mga link.",
            "dynamic.syncMeta": "Ipinakita noong {time} · Data mula sa Volcengine data API",
            "dynamic.empty.hint":
                "Walang balita. Suriin ang dataApiKey sa date/volc-ark-apis.json at buksan ang site sa http(s), o mag-refresh sa pahina ng balita.",
            "dynamic.newsEmpty":
                "Walang balita. Suriin ang dataApiKey saka subukan muli o mag-refresh sa pahina ng balita.",
            "dynamic.refresh.working": "Tinatawag ang Volcengine data API…",
            "dynamic.refresh.busy": "May isa pang gawain na tumatakbo",
            "dynamic.refresh.fail": "Bigo ang refresh: ",
            "dynamic.refresh.done": "Tapos, {n} item",
            "dynamic.refresh.empty": "Tapos, walang bagong item",
            "dynamic.refresh.offline":
                "Bigo ang refresh: suriin ang network o dataApiKey sa date/volc-ark-apis.json.",
            "map.empty": "Walang datos sa mapa",
            "map.sdkFail": "Hindi na-load ang SDK ng mapa sa home",
            "map.ready": "Handa na ang mapa sa home",
            "map.done": "Tapos na ang pag-load ng mapa sa home",
            "map.selectedTpl": "Kasalukuyang lungsod: {city}",
            "map.selected.none": "Pumili",
            "map.stats.merchants": "Mga negosyante sa lugar: {n1}",
            "map.stats.enterprises": "Mga kumpanya: {n2}",
            "map.merchant.empty": "Walang negosyante sa kasalukuyang filter",
            "map.selectedCountTpl": "Kasalukuyang lungsod: {city} ({n})",
            "map.allCities": "Lahat ng lungsod",
            "map.merchant.noMatch": "Walang tugma — ayusin ang filter.",
            "map.merchant.translating": "Isinasalin ang listahan ng mga negosyante…",
            "map.coord": "Mga koordinado: {lat}, {lng}",
            "map.contactPending": "Kontak ay susunod",
            "map.sdkFailLong": "Bigo ang SDK ng mapa — suriin ang network at subukan muli.",
            "map.error.bmap":
                "Hindi na-load ang Baidu Map SDK — suriin ang network at allowlist ng AK.",
            "map.error.akMissing":
                "Walang Baidu Map AK — ilagay ang baiduMapAk sa date/volc-ark-apis.json; tingnan ang docs/API说明.md.",
            "map.error.noCsv": "Walang datos sa mapa — suriin ang merchants.csv.",
            "map.finishReady": "Magagamit na ang mapa",
            "map.finishDone": "Tapos na ang pag-load ng mapa",
            "map.cityQuick.merchants": "Negosyante",
            "map.cityQuick.enterprises": "Kumpanya",
            "map.cityQuick.types": "Mga kategorya",
            "weather.night": "Gabi 20°C",
            "weather.dayHot": "Maaraw 30°C",
            "weather.dayCloud": "Maulap 25°C",
            "weather.dayCool": "Makulimlim 16°C",
            "weather.dayMild": "Maaraw 22°C",
            "week.0": "Lin",
            "week.1": "Lun",
            "week.2": "Mar",
            "week.3": "Miy",
            "week.4": "Huw",
            "week.5": "Biy",
            "week.6": "Sab",
            "src.yqzwx": "Meridian ng Yuqiao",
            "src.gov.yulin": "Pamahalaang Yulin",
            "src.gxylnews": "Balita ng Yulin",
            "src.local": "Lokal",
            "map.strip.home": "Unang pahina"
        }
    };

    var SEA_LOCALE_OVERRIDES = {
        th: {
            "home.brand": "ตรามหาวิทยาลัยปกติสอคุนหยู่หลิน",
            "home.logoAlt": "ตรามหาวิทยาลัย",
            "panel.coreAll": "ทั้งหมด",
            "panel.coreEnter": "เข้าบริการ",
            "panel.coreBrowse": "ดูทั้งหมด",
            "nav.industry": "กลับภาพรวมอุตสาหกรรม",
            "page.overview.title": "ภาพรวมข้อมูล",
            "page.core.title": "ภาพรวมบริการหลัก",
            "page.industry.title": "อุตสาหกรรมเด่นบ้านเกิดชาวจีนโพ้นทะเล",
            "page.dynamic.title": "ความเคลื่อนไหวชาวจีนโพ้นทะเล",
            "page.dynamic.lead": "",
            "page.dynamic.refresh": "รีเฟรช",
            "page.dynamic.refreshTitle": "ล้างแคชแล้วดึงรายการล่าสุดจาก API ฝั่งข้อมูล",
            "page.culture.docTitle": "นิทรรศการวัฒนธรรมบ้านเกิดชาวจีนโพ้นทะเล",
            "page.dynamicDetail.docTitle": "รายละเอียดข่าวชาวจีนโพ้นทะเล",
            "page.dynamicDetail.h1": "รายละเอียดข่าวชาวจีนโพ้นทะเล",
            "dynamicDetail.loadingMeta": "กำลังโหลด…",
            "dynamicDetail.loadingBody": "กำลังอ่านเนื้อหา…",
            "dynamicDetail.backList": "รายการข่าวชาวจีนโพ้นทะเล",
            "page.docTitle.joiner": " · ",
            "serviceDetail.notFoundTitle": "ไม่พบบริการนี้",
            "serviceDetail.notFoundDesc": "กลับไปที่ภาพรวมบริการหลักแล้วเลือกใหม่",
            "serviceDetail.descFallback": "รอคำอธิบายบริการ",
            "serviceDetail.nameFallback": "บริการหลัก",
            "industryDetail.notFoundTitle": "ไม่พบอุตสาหกรรมนี้",
            "industryDetail.notFoundDesc": "กลับไปที่ภาพรวมอุตสาหกรรมแล้วเลือกใหม่",
            "industryDetail.descFallback": "รอรายละเอียดเพิ่มเติม",
            "industryDetail.nameFallback": "รายละเอียดอุตสาหกรรม",
            "industryDetail.introHeading": "ภาพรวมอุตสาหกรรม",
            "industryDetail.promoHistory": "เส้นทางการพัฒนา",
            "industryDetail.promoStory": "เรื่องราวและกรณีศึกษา",
            "culture.history.heading": "ประวัติศาสตร์บ้านเกิดชาวจีนโพ้นทะเล",
            "culture.history.altYear": "ช่วงเวลา",
            "culture.figures.heading": "เรื่องราวชาวจีนโพ้นทะเล / ความโดดเด่นทางธุรกิจ",
            "culture.figure.navPrev": "ก่อนหน้า",
            "culture.figure.navNext": "ถัดไป",
            "culture.figure.dotAria": "ไปที่บุคคลที่ {n}",
            "culture.figure.fallbackName": "บุคคล",
            "culture.figure.fallbackTitle": "บุคคลบ้านเกิดชาวจีนโพ้นทะเล",
            "culture.figure.fallbackTag": "เรื่องเล่า",
            "culture.map.loading": "กำลังโหลดแผนที่…",
            "culture.map.plaque": "หยู่หลินเชื่อมโยงกับอาเซียน",
            "culture.map.aria": "แผนที่เชื่อมโยงหยู่หลินกับอาเซียน",
            "culture.map.linkCoverAria": "เข้าสู่ส่วนแผนที่",
            "culture.map.sdkFail": "โหลด SDK แผนที่ไม่สำเร็จ",
            "culture.map.errShort": "โหลดแผนที่ล้มเหลว",
            "culture.map.noData": "ยังไม่มีข้อมูลแผนที่",
            "culture.map.ready": "แผนที่พร้อมใช้งาน",
            "culture.map.done": "โหลดแผนที่เสร็จสิ้น",
            "culture.map.initFail": "เริ่มแผนที่ล้มเหลว",
            "culture.placeholder.mapColumn": "พื้นที่จัดวาง (สูงเท่าคอลัมน์ข้างเคียง)",
            "map.filter.heading": "กรองพื้นที่",
            "map.filter.cityLb": "เมืองเป้าหมาย",
            "map.filter.cityPh": "เลือกเมือง",
            "map.filter.typeLb": "ประเภทนักธุรกิจชาวจีนโพ้นทะเล",
            "map.filter.typePh": "ทุกประเภท",
            "map.filter.countryLb": "ประเทศ/ภูมิภาค",
            "map.filter.countryPh": "ทุกประเทศ/ภูมิภาค",
            "map.filter.keywordLb": "ค้นหาคำสำคัญ",
            "map.filter.keywordPh": "ชื่อ/เมือง/คำอธิบาย",
            "map.filter.reset": "ล้างตัวกรอง",
            "map.filter.statsTpl": "เมืองที่มองเห็น: {cities} · นักธุรกิจ: {merchants} · วิสาหกิจ: {enterprises}",
            "map.list.heading": "รายชื่อนักธุรกิจชาวจีนโพ้นทะเล",
            "map.toggle.left": "ยุบแผงกรอง",
            "map.toggle.right": "ยุบแผงรายชื่อ",
            "overview.cardVal": "ค่าปัจจุบัน: {v}",
            "core.card.enter": "เข้าหน้า",
            "industry.block.market": "ตลาดและตำแหน่ง",
            "industry.block.chain": "ห่วงโซ่อุปทานและความสามารถ",
            "industry.block.out": "โอกาสรุกตลาดต่างประเทศ",
            "industry.fallback.market": "ยังไม่มีข้อมูลตลาด",
            "industry.fallback.chain": "ยังไม่มีข้อมูลห่วงโซ่",
            "industry.fallback.out": "ยังไม่มีข้อมูลโอกาส",
            "core.svc.svc-001.name": "นิทรรศการวัฒนธรรมบ้านเกิดชาวจีนโพ้นทะเล",
            "core.svc.svc-001.desc": "แสดงประวัติ มรดก และทรัพยากรเด่นของบ้านเกิด",
            "core.svc.svc-002.name": "ใบเสนอราคา",
            "core.svc.svc-002.desc": "สร้างเทมเพลตใบเสนอราคามาตรฐานอย่างรวดเร็ว",
            "core.svc.svc-003.name": "เทมเพลตสัญญา",
            "core.svc.svc-003.desc": "จับคู่เทมเพลตสัญญาตามสถานการณ์",
            "core.svc.svc-004.name": "การแปลหลายภาษา",
            "core.svc.svc-004.desc": "รองรับจีน อังกฤษ และภาษาอาเซียน",
            "core.svc.svc-005.name": "วิเคราะห์ตลาดแต่ละประเทศ",
            "core.svc.svc-005.desc": "แนวโน้มและประเด็นความเสี่ยงจากแหล่งข้อมูลเปิด",
            "core.svc.svc-006.name": "ผู้ช่วยบริการชาวจีนโพ้นทะเล",
            "core.svc.svc-006.desc": "แนะแนวกระบวนการและขั้นตอนสำหรับธุรกิจในต่างประเทศ",
            "core.svc.svc-007.name": "แนะนำเครือข่ายนักธุรกิจชาวจีนโพ้นทะเล",
            "core.svc.svc-007.desc": "แนะนำทรัพยากรแยกตามอุตสาหกรรม",
            "core.svc.svc-008.name": "อธิบายนโยบาย",
            "core.svc.svc-008.desc": "สรุปนโยบายและจุดปฏิบัติเรื่องชาวจีนโพ้นทะเล",
            "core.svc.svc-009.name": "จับคู่โครงการ",
            "core.svc.svc-009.desc": "เชื่อมอุตสาหกรรมในพื้นที่กับโครงการชาวจีนโพ้นทะเล",
            "core.svc.svc-010.name": "เตือนความเสี่ยง",
            "core.svc.svc-010.desc": "ติดตามความเสี่ยงการค้า กฎระเบียบ อัตราแลกเปลี่ยน",
            "core.svc.svc-011.name": "ความร่วมมือห่วงโซ่อุปทาน",
            "core.svc.svc-011.desc": "จับคู่ความต้องการระหว่างอุปสงค์อุปทาน",
            "core.svc.svc-012.name": "ติดตามนโยบายต่างประเทศ",
            "core.svc.svc-012.desc": "อัปเดตกฎการเข้าตลาดและกำกับดูแลตามประเทศ",
            "industry.card.ind-001.name": "อุตสาหกรรมเครื่องเทศ",
            "industry.card.ind-001.summary":
                "โหงแฮะ อบเชย และเครื่องเทศ — ตั้งแต่การปลูกแปรรูปถึงส่งออก ภาคเกษตรสำคัญสำหรับตลาดอาเซียน",
            "industry.card.ind-002.name": "อุตสาหกรรมเซรามิกส์",
            "industry.card.ind-002.summary":
                "เซรามิกใช้ในชีวิตประจำวันและเชิงวัฒนธรรมจากคลัสเตอร์เป่ย์หลิว การผลิตแบรนด์และช่องทางส่งออก",
            "industry.card.ind-003.name": "อุตสาหกรรมมันหวาน",
            "industry.card.ind-003.summary":
                "ตั้งแต่ไร่ถึงผลิตภัณฑ์แปรรูปและพร้อมรับประทาน พัฒนาพืชดั้งเดิมเป็นมาตรฐานอาหาร",
            "industry.card.ind-004.name": "หัตถศิลป์สานฟาง",
            "industry.card.ind-004.summary":
                "มรดกการสานป๋อไป๋กับดีไซน์บ้านสมัยใหม่ ของขวัญ ของแต่งบ้าน และสินค้าวัฒนธรรมส่งออก",
            "page.assistant.chatAria": "บทสนทนา",
            "page.assistant.composerAria": "ถามเฉียวจวงจวง",
            "page.assistant.aiBadgeTitle": "ผู้ช่วย AI",
            "page.assistant.collapseChat": "พับการสนทนา",
            "page.assistant.modalClose": "ปิด",
            "page.assistant.dhPanel": "แผงตัวละครดิจิทัล",
            "page.assistant.dhToggleCollapse": "พับแผงตัวละคร",
            "page.assistant.cat.fallbackType": "หัวข้อ",
            "page.assistant.cat.fallbackTag": "คำถามทั่วไป",
            "dynamic.read": "เปิดต้นฉบับ",
            "dynamic.viewOriginal": "ดูต้นฉบับ",
            "dynamic.loading": "กำลังโหลดข่าว…",
            "overview.merchants": "ชาวจีนโพ้นทะเล",
            "overview.enterprises": "วิสาหกิจชาวจีนโพ้นทะเล",
            "overview.orgs": "องค์กร",
            "overview.projects": "โครงการ",
            "overview.countries": "ครอบคลุมประเทศ",
            "overview.active": "กรณีที่เกี่ยวข้อง",
            "overview.empty": "ไม่มีข้อมูลสรุป",
            "overview.unit.person": "คน",
            "overview.unit.enterprise": "แห่ง",
            "overview.unit.org": "แห่ง",
            "overview.unit.project": "โครงการ",
            "overview.unit.country": "ประเทศ",
            "overview.unit.case": "รายการ",
            "map.loading": "กำลังโหลดทรัพยากรแผนที่…",
            "map.strip.home": "หน้าหลัก",
            "map.strip.core": "บริการหลัก",
            "map.strip.zoomIn": "ขยาย",
            "map.strip.zoomOut": "ย่อ",
            "map.strip.resetView": "มุมมองค่าเริ่มต้น",
            "map.aria.canvas": "แผนที่ชาวจีนโพ้นทะเลในเอเชียตะวันออกเฉียงใต้",
            "i18n.prompt.lang.en":
                "ใช้ภาษาไทยสำหรับหัวข้อและข้อความสรุปที่ผู้ใช้เห็นทั้งหมด (รักษาชื่อเฉพาะ เช่น Yulin / ASEAN ให้เป็นธรรมชาติ)",
            "i18n.prompt.lang.zh": "所有面向用户展示的句子使用简体中文。"
        },
        id: {
            "home.brand": "Lambang Universitas Normal Yulin",
            "home.logoAlt": "Lambang universitas",
            "panel.coreAll": "Semua",
            "panel.coreEnter": "Masuk layanan",
            "panel.coreBrowse": "Lihat semua",
            "nav.industry": "Kembali ke ikhtisar industri",
            "page.overview.title": "Ikhtisar data",
            "page.core.title": "Ikhtisar layanan inti",
            "page.industry.title": "Industri unggulan kota asal Tionghoa perantauan",
            "page.dynamic.title": "Berita & dinamika Tionghoa perantauan",
            "page.dynamic.lead": "",
            "page.dynamic.refresh": "Segarkan",
            "page.dynamic.refreshTitle": "Hapus cache dan ambil daftar terbaru lewat API data",
            "page.culture.docTitle": "Pameran budaya kampung halaman Tionghoa perantauan",
            "page.dynamicDetail.docTitle": "Detail berita Tionghoa perantauan",
            "page.dynamicDetail.h1": "Detail berita Tionghoa perantauan",
            "dynamicDetail.loadingMeta": "Memuat…",
            "dynamicDetail.loadingBody": "Membaca konten…",
            "dynamicDetail.backList": "Daftar berita Tionghoa perantauan",
            "page.docTitle.joiner": " · ",
            "serviceDetail.notFoundTitle": "Layanan tidak ditemukan",
            "serviceDetail.notFoundDesc": "Kembali ke ikhtisar layanan inti dan pilih lagi.",
            "serviceDetail.descFallback": "Deskripsi akan menyusul.",
            "serviceDetail.nameFallback": "Layanan inti",
            "industryDetail.notFoundTitle": "Industri tidak ditemukan",
            "industryDetail.notFoundDesc": "Kembali ke ikhtisar industri dan pilih lagi.",
            "industryDetail.descFallback": "Rincian akan menyusul.",
            "industryDetail.nameFallback": "Detail industri",
            "industryDetail.introHeading": "Gambaran industri",
            "industryDetail.promoHistory": "Jalur perkembangan",
            "industryDetail.promoStory": "Cerita & studi kasus",
            "culture.history.heading": "Sejarah kampung halaman Tionghoa perantauan",
            "culture.history.altYear": "Masa",
            "culture.figures.heading": "Kisah Tionghoa perantauan / tokoh perdagangan",
            "culture.figure.navPrev": "Sebelumnya",
            "culture.figure.navNext": "Berikutnya",
            "culture.figure.dotAria": "Beralih ke tokoh ke-{n}",
            "culture.figure.fallbackName": "Tokoh",
            "culture.figure.fallbackTitle": "Tokoh kampung halaman",
            "culture.figure.fallbackTag": "Cerita",
            "culture.map.loading": "Memuat peta…",
            "culture.map.plaque": "Yulin terhubung dengan ASEAN",
            "culture.map.aria": "Peta konektivitas Yulin–ASEAN",
            "culture.map.linkCoverAria": "Buka bagian peta",
            "culture.map.sdkFail": "SDK peta gagal dimuat",
            "culture.map.errShort": "Peta gagal dimuat",
            "culture.map.noData": "Belum ada data peta",
            "culture.map.ready": "Peta siap digunakan",
            "culture.map.done": "Peta selesai dimuat",
            "culture.map.initFail": "Inisialisasi peta gagal",
            "culture.placeholder.mapColumn": "Placeholder (setinggi kolom tetangga)",
            "map.filter.heading": "Filter wilayah",
            "map.filter.cityLb": "Kota target",
            "map.filter.cityPh": "Pilih kota",
            "map.filter.typeLb": "Jenis pengusaha Tionghoa perantauan",
            "map.filter.typePh": "Semua jenis",
            "map.filter.countryLb": "Negara/wilayah",
            "map.filter.countryPh": "Semua negara/wilayah",
            "map.filter.keywordLb": "Kata kunci",
            "map.filter.keywordPh": "Nama/kota/deskripsi",
            "map.filter.reset": "Reset filter",
            "map.filter.statsTpl": "Kota terlihat: {cities} · Pedagang: {merchants} · Perusahaan: {enterprises}",
            "map.list.heading": "Direktori pengusaha Tionghoa perantauan",
            "map.toggle.left": "Lipat panel filter",
            "map.toggle.right": "Lipat panel daftar",
            "overview.cardVal": "Nilai kini: {v}",
            "core.card.enter": "Buka halaman",
            "industry.block.market": "Pasar & positioning",
            "industry.block.chain": "Rantai pasok & kemampuan",
            "industry.block.out": "Peluang ekspansi luar negeri",
            "industry.fallback.market": "Belum ada info pasar",
            "industry.fallback.chain": "Belum ada info rantai pasok",
            "industry.fallback.out": "Belum ada info peluang",
            "core.svc.svc-001.name": "Pameran budaya kampung halaman Tionghoa perantauan",
            "core.svc.svc-001.desc": "Sejarah, warisan, dan sumber unggulan kampung halaman.",
            "core.svc.svc-002.name": "Formulir penawaran",
            "core.svc.svc-002.desc": "Membuat template penawaran standar dengan cepat.",
            "core.svc.svc-003.name": "Template kontrak",
            "core.svc.svc-003.desc": "Menyesuaikan template kontrak umum dengan skenario Anda.",
            "core.svc.svc-004.name": "Terjemahan multibahasa",
            "core.svc.svc-004.desc": "Teks bahasa Tionghoa, Inggris, dan Asia Tenggara.",
            "core.svc.svc-005.name": "Analisis pasar per negara",
            "core.svc.svc-005.desc": "Tren negara prioritas dan catatan risiko dari sumber publik.",
            "core.svc.svc-006.name": "Asisten layanan Tionghoa perantauan",
            "core.svc.svc-006.desc": "Orientasi dan panduan bagi perusahaan yang meluaskan ke luar negeri.",
            "core.svc.svc-007.name": "Rekomendasi jaringan Tionghoa perantauan",
            "core.svc.svc-007.desc": "Perkenalan sumber daya ber-tag industri.",
            "core.svc.svc-008.name": "Ringkasan kebijakan",
            "core.svc.svc-008.desc": "Ringkasan kebijakan Tionghoa perantauan dan poin praktis.",
            "core.svc.svc-009.name": "Pencocokan proyek",
            "core.svc.svc-009.desc": "Menghubungkan industri lokal dengan proyek Tionghoa perantauan.",
            "core.svc.svc-010.name": "Peringatan risiko",
            "core.svc.svc-010.desc": "Memantau risiko perdagangan, kepatuhan, valuta asing, dll.",
            "core.svc.svc-011.name": "Kolaborasi rantai pasok",
            "core.svc.svc-011.desc": "Pencocokan permintaan dan pasokan hulu-hilir.",
            "core.svc.svc-012.name": "Langganan kebijakan luar negeri",
            "core.svc.svc-012.desc": "Aturan masuk pasar dan pembaruan regulator per negara.",
            "industry.card.ind-001.name": "Industri rempah-rempah",
            "industry.card.ind-001.summary":
                "Star anise, kayu manis, rempah — dari budidaya dan pengolahan hingga ekspor; sektor pertanian kunci untuk pasar ASEAN.",
            "industry.card.ind-002.name": "Industri keramik",
            "industry.card.ind-002.summary":
                "Keramik harian dan budaya dari klaster Beiliu: produksi, merek, dan jalur ekspor.",
            "industry.card.ind-003.name": "Industri ubi jalar",
            "industry.card.ind-003.summary":
                "Dari pertanian ke produk olahan dan siap saji; mengupgrade tanaman tradisional menjadi pangan standar.",
            "industry.card.ind-004.name": "Anyaman jerami tradisional",
            "industry.card.ind-004.summary":
                "Anyaman warisan Bobai dengan desain interior modern — souvenir, dekor, dan produk budaya ekspor.",
            "page.assistant.chatAria": "Percakapan",
            "page.assistant.composerAria": "Tanya Qiao Zhuangzhuang",
            "page.assistant.aiBadgeTitle": "Asisten AI",
            "page.assistant.collapseChat": "Sembunyikan percakapan",
            "page.assistant.modalClose": "Tutup",
            "page.assistant.dhPanel": "Panel avatar digital",
            "page.assistant.dhToggleCollapse": "Sembunyikan panel avatar",
            "page.assistant.cat.fallbackType": "Topik",
            "page.assistant.cat.fallbackTag": "FAQ",
            "dynamic.read": "Baca sumber",
            "dynamic.viewOriginal": "Lihat sumber asli",
            "dynamic.loading": "Memuat berita…",
            "overview.merchants": "Tionghoa perantauan",
            "overview.enterprises": "Perusahaan Tionghoa perantauan",
            "overview.orgs": "Organisasi",
            "overview.projects": "Proyek",
            "overview.countries": "Negara terjangkau",
            "overview.active": "Kasus aktif",
            "overview.empty": "Belum ada data ikhtisar",
            "overview.unit.person": "orang",
            "overview.unit.enterprise": "",
            "overview.unit.org": "",
            "overview.unit.project": "",
            "overview.unit.country": "",
            "overview.unit.case": "",
            "map.loading": "Memuat sumber peta…",
            "map.strip.home": "Beranda",
            "map.strip.core": "Layanan inti",
            "map.strip.zoomIn": "Perbesar",
            "map.strip.zoomOut": "Perkecil",
            "map.strip.resetView": "Sudut pandang default",
            "map.aria.canvas": "Peta Tionghoa perantauan Asia Tenggara",
            "i18n.prompt.lang.en":
                "Gunakan bahasa Indonesia untuk semua judul dan ringkasan yang terlihat pengguna (pertahankan nama khusus seperti Yulin dan ASEAN)",
            "i18n.prompt.lang.zh": "所有面向用户展示的句子使用简体中文。"
        },
        vi: {
            "home.brand": "Huy hiệu Đại học Sư phạm Ngọc Lâm",
            "home.logoAlt": "Huy hiệu trường",
            "panel.coreAll": "Tất cả",
            "panel.coreEnter": "Vào dịch vụ",
            "panel.coreBrowse": "Xem tất cả",
            "nav.industry": "Về tổng quan ngành",
            "page.overview.title": "Tổng quan dữ liệu",
            "page.core.title": "Trung tâm dịch vụ cốt lõi",
            "page.industry.title": "Ngành đặc sắc quê hương kiều bào",
            "page.dynamic.title": "Tin kiều vụ",
            "page.dynamic.lead": "",
            "page.dynamic.refresh": "Làm mới",
            "page.dynamic.refreshTitle": "Xóa cache và tải lại danh sách qua API dữ liệu",
            "page.culture.docTitle": "Trưng bày văn hóa quê hương kiều bào",
            "page.dynamicDetail.docTitle": "Chi tiết tin kiều vụ",
            "page.dynamicDetail.h1": "Chi tiết tin kiều vụ",
            "dynamicDetail.loadingMeta": "Đang tải…",
            "dynamicDetail.loadingBody": "Đang đọc nội dung…",
            "dynamicDetail.backList": "Danh sách tin kiều vụ",
            "page.docTitle.joiner": " · ",
            "serviceDetail.notFoundTitle": "Không tìm thấy dịch vụ",
            "serviceDetail.notFoundDesc": "Quay lại trang tổng quan dịch vụ cốt lõi để chọn lại.",
            "serviceDetail.descFallback": "Mô tả sẽ được bổ sung.",
            "serviceDetail.nameFallback": "Dịch vụ cốt lõi",
            "industryDetail.notFoundTitle": "Không tìm thấy ngành",
            "industryDetail.notFoundDesc": "Quay lại tổng quan ngành để chọn lại.",
            "industryDetail.descFallback": "Nội dung chi tiết sẽ được bổ sung.",
            "industryDetail.nameFallback": "Chi tiết ngành",
            "industryDetail.introHeading": "Tổng quan ngành",
            "industryDetail.promoHistory": "Dòng phát triển",
            "industryDetail.promoStory": "Câu chuyện & tình huống",
            "culture.history.heading": "Lịch sử quê hương kiều bào",
            "culture.history.altYear": "Mốc thời gian",
            "culture.figures.heading": "Câu chuyện kiều bào / gương thương gia",
            "culture.figure.navPrev": "Trước",
            "culture.figure.navNext": "Sau",
            "culture.figure.dotAria": "Chuyển tới nhân vật thứ {n}",
            "culture.figure.fallbackName": "Nhân vật",
            "culture.figure.fallbackTitle": "Nhân vật quê hương kiều",
            "culture.figure.fallbackTag": "Câu chuyện",
            "culture.map.loading": "Đang tải bản đồ…",
            "culture.map.plaque": "Ngọc Lâm kết nối với ASEAN",
            "culture.map.aria": "Bản đồ kết nối Ngọc Lâm và ASEAN",
            "culture.map.linkCoverAria": "Vào mục bản đồ",
            "culture.map.sdkFail": "Không tải được SDK bản đồ",
            "culture.map.errShort": "Tải bản đồ thất bại",
            "culture.map.noData": "Chưa có dữ liệu bản đồ",
            "culture.map.ready": "Bản đồ đã sẵn sàng",
            "culture.map.done": "Đã tải bản đồ xong",
            "culture.map.initFail": "Khởi tạo bản đồ thất bại",
            "culture.placeholder.mapColumn": "Giữ chỗ (cùng chiều cao cột bên cạnh)",
            "map.filter.heading": "Lọc khu vực",
            "map.filter.cityLb": "Thành phố",
            "map.filter.cityPh": "Chọn thành phố",
            "map.filter.typeLb": "Loại hình kiều thương",
            "map.filter.typePh": "Tất cả loại",
            "map.filter.countryLb": "Quốc gia/khu vực",
            "map.filter.countryPh": "Tất cả quốc gia/khu vực",
            "map.filter.keywordLb": "Từ khóa",
            "map.filter.keywordPh": "Tên/thành phố/mô tả",
            "map.filter.reset": "Đặt lại bộ lọc",
            "map.filter.statsTpl": "TP hiển thị: {cities} · Kiều thương: {merchants} · Doanh nghiệp: {enterprises}",
            "map.list.heading": "Danh bạ kiều thương",
            "map.toggle.left": "Thu gọn bảng lọc",
            "map.toggle.right": "Thu gọn bảng danh sách",
            "overview.cardVal": "Giá trị hiện tại: {v}",
            "core.card.enter": "Vào trang",
            "industry.block.market": "Thị trường & định vị",
            "industry.block.chain": "Chuỗi cung ứng & năng lực",
            "industry.block.out": "Cơ hội ra nước ngoài",
            "industry.fallback.market": "Chưa có thông tin thị trường",
            "industry.fallback.chain": "Chưa có thông tin chuỗi",
            "industry.fallback.out": "Chưa có thông tin cơ hội",
            "core.svc.svc-001.name": "Trưng bày văn hóa quê hương kiều bào",
            "core.svc.svc-001.desc": "Lịch sử, di sản và tài nguyên đặc sắc quê hương kiều.",
            "core.svc.svc-002.name": "Báo giá",
            "core.svc.svc-002.desc": "Tạo nhanh mẫu báo giá chuẩn.",
            "core.svc.svc-003.name": "Mẫu hợp đồng",
            "core.svc.svc-003.desc": "Gợi ý mẫu hợp đồng phù hợp tình huống.",
            "core.svc.svc-004.name": "Dịch đa ngữ",
            "core.svc.svc-004.desc": "Hỗ trợ Trung–Anh và ngôn ngữ Đông Nam Á.",
            "core.svc.svc-005.name": "Phân tích thị trường theo quốc gia",
            "core.svc.svc-005.desc": "Xu hướng và rủi ro từ nguồn công khai.",
            "core.svc.svc-006.name": "Trợ lý phục vụ kiều vụ",
            "core.svc.svc-006.desc": "Định hướng quy trình doanh nghiệp đi ra nước ngoài.",
            "core.svc.svc-007.name": "Gợi ý mạng lưới kiều thương",
            "core.svc.svc-007.desc": "Giới thiệu tài nguyên gắn thẻ ngành.",
            "core.svc.svc-008.name": "Giải đọc chính sách",
            "core.svc.svc-008.desc": "Tóm tắt chính sách kiều vụ và điểm thực tiễn.",
            "core.svc.svc-009.name": "Kết nối dự án",
            "core.svc.svc-009.desc": "Nối ngành địa phương với dự án kiều bào.",
            "core.svc.svc-010.name": "Cảnh báo rủi ro",
            "core.svc.svc-010.desc": "Theo dõi rủi ro thương mại, tuân thủ, tỷ giá…",
            "core.svc.svc-011.name": "Phối hợp chuỗi cung ứng",
            "core.svc.svc-011.desc": "Ghép cung–cầu upstream–downstream.",
            "core.svc.svc-012.name": "Theo dõi chính sách nước ngoài",
            "core.svc.svc-012.desc": "Quy tắc nhập thị trường và cập nhật quản lý theo nước.",
            "industry.card.ind-001.name": "Ngành gia vị",
            "industry.card.ind-001.summary":
                "Hồi, quế và gia vị — từ trồng, chế biến đến xuất khẩu; ngành nông nghiệp trọng điểm cho ASEAN.",
            "industry.card.ind-002.name": "Ngành gốm sứ",
            "industry.card.ind-002.summary":
                "Gốm sinh hoạt và văn hóa tứ cụm Bắc Lưu: sản xuất, thương hiệu, kênh xuất.",
            "industry.card.ind-003.name": "Ngành khoai lang",
            "industry.card.ind-003.summary":
                "Từ canh tác đến chế biến và thực phẩm tiện lợi; nâng cây trồng truyền thống thành thực phẩm chuẩn.",
            "industry.card.ind-004.name": "Nghề đan cói",
            "industry.card.ind-004.summary":
                "Nghề đan Bách Bài gặp thiết kế nội thất hiện đại — quà, trang trí, văn hóa phẩm xuất khẩu.",
            "page.assistant.chatAria": "Cuộc hội thoại",
            "page.assistant.composerAria": "Hỏi Kiều Tráng Tráng",
            "page.assistant.aiBadgeTitle": "Trợ lý AI",
            "page.assistant.collapseChat": "Thu gọn hội thoại",
            "page.assistant.modalClose": "Đóng",
            "page.assistant.dhPanel": "Bảng nhân vật số",
            "page.assistant.dhToggleCollapse": "Thu bảng nhân vật",
            "page.assistant.cat.fallbackType": "Chủ đề",
            "page.assistant.cat.fallbackTag": "Câu hỏi thường gặp",
            "dynamic.read": "Đọc nguồn",
            "dynamic.viewOriginal": "Xem bản gốc",
            "dynamic.loading": "Đang tải tin…",
            "overview.merchants": "Người Hoa kiều",
            "overview.enterprises": "Doanh nghiệp kiều vụ",
            "overview.orgs": "Tổ chức",
            "overview.projects": "Dự án",
            "overview.countries": "Quốc gia phủ sóng",
            "overview.active": "Hoạt động liên quan",
            "overview.empty": "Chưa có dữ liệu tổng quan",
            "overview.unit.person": "người",
            "overview.unit.enterprise": "",
            "overview.unit.org": "",
            "overview.unit.project": "",
            "overview.unit.country": "",
            "overview.unit.case": "",
            "map.loading": "Đang tải tài nguyên bản đồ…",
            "map.strip.home": "Trang chủ",
            "map.strip.core": "Dịch vụ cốt lõi",
            "map.strip.zoomIn": "Phóng to",
            "map.strip.zoomOut": "Thu nhỏ",
            "map.strip.resetView": "Góc nhìn mặc định",
            "map.aria.canvas": "Bản đồ kiều bào Đông Nam Á",
            "i18n.prompt.lang.en":
                "Dùng tiếng Việt cho mọi tiêu đề và tóm tắt hiển thị cho người dùng (giữ tên riêng như Yulin và ASEAN cho tự nhiên)",
            "i18n.prompt.lang.zh": "所有面向用户展示的句子使用简体中文。"
        },
        ms: {
            "home.brand": "Lambang Universiti Normal Yulin",
            "home.logoAlt": "Lambang universiti",
            "panel.coreAll": "Semua",
            "panel.coreEnter": "Masuk perkhidmatan",
            "panel.coreBrowse": "Lihat semua",
            "nav.industry": "Kembali ke gambaran industri",
            "page.overview.title": "Gambaran data",
            "page.core.title": "Hab perkhidmatan teras",
            "page.industry.title": "Industri terpilah kampung halaman Cina perantauan",
            "page.dynamic.title": "Berita hal ehwal Cina perantauan",
            "page.dynamic.lead": "",
            "page.dynamic.refresh": "Muat semula",
            "page.dynamic.refreshTitle": "Kosongkan cache dan ambil senarai terkini melalui API data",
            "page.culture.docTitle": "Pameran budaya kampung halaman Cina perantauan",
            "page.dynamicDetail.docTitle": "Butiran berita Cina perantauan",
            "page.dynamicDetail.h1": "Butiran berita Cina perantauan",
            "dynamicDetail.loadingMeta": "Memuatkan…",
            "dynamicDetail.loadingBody": "Membaca kandungan…",
            "dynamicDetail.backList": "Senarai berita Cina perantauan",
            "page.docTitle.joiner": " · ",
            "serviceDetail.notFoundTitle": "Perkhidmatan tidak dijumpai",
            "serviceDetail.notFoundDesc": "Kembali ke gambaran perkhidmatan teras dan pilih semula.",
            "serviceDetail.descFallback": "Penerangan akan menyusul.",
            "serviceDetail.nameFallback": "Perkhidmatan teras",
            "industryDetail.notFoundTitle": "Industri tidak dijumpai",
            "industryDetail.notFoundDesc": "Kembali ke gambaran industri dan pilih semula.",
            "industryDetail.descFallback": "Butiran akan menyusul.",
            "industryDetail.nameFallback": "Butiran industri",
            "industryDetail.introHeading": "Gambaran industri",
            "industryDetail.promoHistory": "Rentetan pembangunan",
            "industryDetail.promoStory": "Kisah & kes",
            "culture.history.heading": "Sejarah kampung halaman Cina perantauan",
            "culture.history.altYear": "Zaman",
            "culture.figures.heading": "Kisah Cina perantauan / saingan perniagaan",
            "culture.figure.navPrev": "Sebelum",
            "culture.figure.navNext": "Selepas",
            "culture.figure.dotAria": "Beralih ke tokoh ke-{n}",
            "culture.figure.fallbackName": "Tokoh",
            "culture.figure.fallbackTitle": "Tokoh kampung halaman",
            "culture.figure.fallbackTag": "Kisah",
            "culture.map.loading": "Memuatkan peta…",
            "culture.map.plaque": "Yulin terhubung dengan ASEAN",
            "culture.map.aria": "Peta kesambungan Yulin–ASEAN",
            "culture.map.linkCoverAria": "Buka bahagian peta",
            "culture.map.sdkFail": "SDK peta gagal dimuatkan",
            "culture.map.errShort": "Peta gagal dimuatkan",
            "culture.map.noData": "Tiada data peta",
            "culture.map.ready": "Peta sedia digunakan",
            "culture.map.done": "Peta siap dimuatkan",
            "culture.map.initFail": "Permulaan peta gagal",
            "culture.placeholder.mapColumn": "Ruang letak (tinggi sama dengan lajur bersebelahan)",
            "map.filter.heading": "Tapis wilayah",
            "map.filter.cityLb": "Bandar sasaran",
            "map.filter.cityPh": "Pilih bandar",
            "map.filter.typeLb": "Jenis peniaga Cina perantauan",
            "map.filter.typePh": "Semua jenis",
            "map.filter.countryLb": "Negara/wilayah",
            "map.filter.countryPh": "Semua negara/wilayah",
            "map.filter.keywordLb": "Kata kunci",
            "map.filter.keywordPh": "Nama/bandar/perihalan",
            "map.filter.reset": "Tetapkan semula",
            "map.filter.statsTpl": "Bandar kelihatan: {cities} · Pedagang: {merchants} · Perusahaan: {enterprises}",
            "map.list.heading": "Direktori peniaga Cina perantauan",
            "map.toggle.left": "Lipat panel tapisan",
            "map.toggle.right": "Lipat panel senarai",
            "overview.cardVal": "Nilai semasa: {v}",
            "core.card.enter": "Buka halaman",
            "industry.block.market": "Pasaran & kedudukan",
            "industry.block.chain": "Rantaian bekalan & keupayaan",
            "industry.block.out": "Peluang keluar negara",
            "industry.fallback.market": "Tiada maklumat pasaran",
            "industry.fallback.chain": "Tiada maklumat rantaian",
            "industry.fallback.out": "Tiada maklumat peluang",
            "core.svc.svc-001.name": "Pameran budaya kampung halaman Cina perantauan",
            "core.svc.svc-001.desc": "Sejarah, warisan dan sumber unggul kampung halaman.",
            "core.svc.svc-002.name": "Sebutharga",
            "core.svc.svc-002.desc": "Jana templat sebutharga standard dengan cepat.",
            "core.svc.svc-003.name": "Templat kontrak",
            "core.svc.svc-003.desc": "Padankan templat kontrak mengikut senario.",
            "core.svc.svc-004.name": "Terjemahan pelbagai bahasa",
            "core.svc.svc-004.desc": "Teks Cina, Inggeris dan bahasa Asia Tenggara.",
            "core.svc.svc-005.name": "Analisis pasaran mengikut negara",
            "core.svc.svc-005.desc": "Trend negara utama dan nota risiko daripada sumber awam.",
            "core.svc.svc-006.name": "Pembantu perkhidmatan Cina perantauan",
            "core.svc.svc-006.desc": "Navigasi dan panduan firma yang mengembangkan luar negara.",
            "core.svc.svc-007.name": "Cadangan rangkaian Cina perantauan",
            "core.svc.svc-007.desc": "Pengenalan sumber bertag industri.",
            "core.svc.svc-008.name": "Ringkasan dasar",
            "core.svc.svc-008.desc": "Ringkasan dasar hal ehwal Cina perantauan dan poin praktikal.",
            "core.svc.svc-009.name": "Padanan projek",
            "core.svc.svc-009.desc": "Menghubungkan industri tempatan dengan projek Cina perantauan.",
            "core.svc.svc-010.name": "Amaran risiko",
            "core.svc.svc-010.desc": "Memantau risiko dagang, pematuhan, FX dan berkaitan.",
            "core.svc.svc-011.name": "Kerjasama rantaian bekalan",
            "core.svc.svc-011.desc": "Padanan permintaan dan bekalan hulu-hilir.",
            "core.svc.svc-012.name": "Langganan dasar luar negara",
            "core.svc.svc-012.desc": "Peraturan kemasukan pasaran dan kemas kini regulatori mengikut negara.",
            "industry.card.ind-001.name": "Industri rempah",
            "industry.card.ind-001.summary":
                "Bunga lawang, kulit kayu manis dan rempah — dari tanaman dan pemprosesan hingga eksport; sektor agrikultur penting untuk ASEAN.",
            "industry.card.ind-002.name": "Industri seramik",
            "industry.card.ind-002.summary":
                "Seramik harian dan budaya dari kluster Beiliu: pembuatan, jenama dan laluan eksport.",
            "industry.card.ind-003.name": "Industri ubi keledek",
            "industry.card.ind-003.summary":
                "Dari ladang ke produk siap dan siap makan; menaik taraf tanaman tradisional kepada makanan distandardkan.",
            "industry.card.ind-004.name": "Kraftangan anyaman jerami",
            "industry.card.ind-004.summary":
                "Anyaman warisan Bobai dengan reka bentuk moden — cenderamata, hiasan dan produk budaya eksport.",
            "page.assistant.chatAria": "Perbualan",
            "page.assistant.composerAria": "Tanya Qiao Zhuangzhuang",
            "page.assistant.aiBadgeTitle": "Pembantu AI",
            "page.assistant.collapseChat": "Lipat perbualan",
            "page.assistant.modalClose": "Tutup",
            "page.assistant.dhPanel": "Panel avatar digital",
            "page.assistant.dhToggleCollapse": "Lipat panel avatar",
            "page.assistant.cat.fallbackType": "Topik",
            "page.assistant.cat.fallbackTag": "Soalan lazim",
            "dynamic.read": "Baca sumber",
            "dynamic.viewOriginal": "Lihat sumber asal",
            "dynamic.loading": "Memuatkan berita…",
            "overview.merchants": "Cina perantauan",
            "overview.enterprises": "Perusahaan Cina perantauan",
            "overview.orgs": "Organisasi",
            "overview.projects": "Projek",
            "overview.countries": "Negara liputan",
            "overview.active": "Kes aktif",
            "overview.empty": "Tiada data gambaran",
            "overview.unit.person": "orang",
            "overview.unit.enterprise": "",
            "overview.unit.org": "",
            "overview.unit.project": "",
            "overview.unit.country": "",
            "overview.unit.case": "",
            "map.loading": "Memuatkan sumber peta…",
            "map.strip.home": "Laman utama",
            "map.strip.core": "Perkhidmatan teras",
            "map.strip.zoomIn": "Zum masuk",
            "map.strip.zoomOut": "Zum keluar",
            "map.strip.resetView": "Sudut lalai",
            "map.aria.canvas": "Peta Cina perantauan Asia Tenggara",
            "i18n.prompt.lang.en":
                "Gunakan bahasa Melayu untuk semua tajuk dan ringkasan yang kelihatan kepada pengguna (kekalkan nama khas seperti Yulin dan ASEAN)",
            "i18n.prompt.lang.zh": "所有面向用户展示的句子使用简体中文。"
        },
        fil: {
            "home.brand": "Palatandaan ng Yulin Normal University",
            "home.logoAlt": "Palatandaan ng unibersidad",
            "panel.coreAll": "Lahat",
            "panel.coreEnter": "Pumasok sa serbisyo",
            "panel.coreBrowse": "Tingnan lahat",
            "nav.industry": "Bumalik sa pangkalahatang industri",
            "page.overview.title": "Buod ng datos",
            "page.core.title": "Pangkalahatang serbisyo",
            "page.industry.title": "Itinatampok na industriya ng bayan ng kababayang Tsino",
            "page.dynamic.title": "Balita sa gawaing Tsino sa ibang bansa",
            "page.dynamic.lead": "",
            "page.dynamic.refresh": "I-refresh",
            "page.dynamic.refreshTitle": "Burahin ang cache at kunin ang pinakabagong listahan sa pamamagitan ng data API",
            "page.culture.docTitle": "Palabas ng kultura ng bayan ng kababayang Tsino",
            "page.dynamicDetail.docTitle": "Detalye ng balita (gawaing Tsino sa ibang bansa)",
            "page.dynamicDetail.h1": "Detalye ng balita (gawaing Tsino sa ibang bansa)",
            "dynamicDetail.loadingMeta": "Nilo-load…",
            "dynamicDetail.loadingBody": "Binabasa ang nilalaman…",
            "dynamicDetail.backList": "Listahan ng balita",
            "page.docTitle.joiner": " · ",
            "serviceDetail.notFoundTitle": "Hindi nahanap ang serbisyo",
            "serviceDetail.notFoundDesc": "Bumalik sa pangkalahatang serbisyo at pumili muli.",
            "serviceDetail.descFallback": "Darating ang paglalarawan.",
            "serviceDetail.nameFallback": "Pangunahing serbisyo",
            "industryDetail.notFoundTitle": "Hindi nahanap ang industriya",
            "industryDetail.notFoundDesc": "Bumalik sa pangkalahatang industriya at pumili muli.",
            "industryDetail.descFallback": "Darating ang higit na detalye.",
            "industryDetail.nameFallback": "Detalye ng industriya",
            "industryDetail.introHeading": "Pangkalahatang tanawin ng industriya",
            "industryDetail.promoHistory": "Daloy ng pag-unlad",
            "industryDetail.promoStory": "Mga kuwento at kaso",
            "culture.history.heading": "Kasaysayan ng bayan ng kababayang Tsino",
            "culture.history.altYear": "Panahon",
            "culture.figures.heading": "Mga kuwento ng kababayang Tsino / mata sa negosyo",
            "culture.figure.navPrev": "Nakaraan",
            "culture.figure.navNext": "Susunod",
            "culture.figure.dotAria": "Lumipat sa personalidad #{n}",
            "culture.figure.fallbackName": "Personalidad",
            "culture.figure.fallbackTitle": "Personalidad ng bayan",
            "culture.figure.fallbackTag": "Kuwento",
            "culture.map.loading": "Nilo-load ang mapa…",
            "culture.map.plaque": "Ang Yulin at ang ASEAN ay magkaugnay",
            "culture.map.aria": "Mapa ng ugnayan ng Yulin at ASEAN",
            "culture.map.linkCoverAria": "Pumasok sa seksyon ng mapa",
            "culture.map.sdkFail": "Hindi na-load ang SDK ng mapa",
            "culture.map.errShort": "Bigo ang mapa",
            "culture.map.noData": "Walang datos sa mapa",
            "culture.map.ready": "Handa na ang mapa",
            "culture.map.done": "Tapos na ang pag-load ng mapa",
            "culture.map.initFail": "Bigo ang pagsisimula ng mapa",
            "culture.placeholder.mapColumn": "Placeholder (pantay ang taas sa katabing kolum)",
            "map.filter.heading": "Salain ayon sa rehiyon",
            "map.filter.cityLb": "Target na lungsod",
            "map.filter.cityPh": "Pumili ng lungsod",
            "map.filter.typeLb": "Uri ng negosyanteng Tsino sa ibang bansa",
            "map.filter.typePh": "Lahat ng uri",
            "map.filter.countryLb": "Bansa/rehiyon",
            "map.filter.countryPh": "Lahat ng bansa/rehiyon",
            "map.filter.keywordLb": "Keyword",
            "map.filter.keywordPh": "Pangalan/lungsod/paglalarawan",
            "map.filter.reset": "I-reset ang filter",
            "map.filter.statsTpl": "Mga lungsod: {cities} · Negosyante: {merchants} · Kumpanya: {enterprises}",
            "map.list.heading": "Direktoryo ng negosyanteng Tsino",
            "map.toggle.left": "I-collapse ang panel ng filter",
            "map.toggle.right": "I-collapse ang panel ng listahan",
            "overview.cardVal": "Kasalukuyang halaga: {v}",
            "core.card.enter": "Buksan ang pahina",
            "industry.block.market": "Merkado at posisyon",
            "industry.block.chain": "Supply chain at kakayahan",
            "industry.block.out": "Opportunidad sa pag-export",
            "industry.fallback.market": "Walang impormasyon sa merkado",
            "industry.fallback.chain": "Walang impormasyon sa supply chain",
            "industry.fallback.out": "Walang impormasyon sa oportunidad",
            "core.svc.svc-001.name": "Palabas ng kultura ng bayan ng kababayang Tsino",
            "core.svc.svc-001.desc": "Kasaysayan, pamana at tampok na mapagkukunan ng bayan.",
            "core.svc.svc-002.name": "Quotation sheet",
            "core.svc.svc-002.desc": "Bumuo nang mabilis ng padron na template ng quotation.",
            "core.svc.svc-003.name": "Mga template ng kontrata",
            "core.svc.svc-003.desc": "Itugma ang karaniwang template ng kontrata sa inyong sitwasyon.",
            "core.svc.svc-004.name": "Maraming wikang pagsasalin",
            "core.svc.svc-004.desc": "Suporta sa tekstong Tsino–Ingles at mga wika sa Timog–Silangang Asya.",
            "core.svc.svc-005.name": "Pagsusuri ng merkado ayon sa bansa",
            "core.svc.svc-005.desc": "Pangunahing uso ng bansa at tala sa panganib mula sa pampublikong pinagmulan.",
            "core.svc.svc-006.name": "Katuwang sa gawaing Tsino sa ibang dagat",
            "core.svc.svc-006.desc": "Nabigasyon at gabay para sa mga firmang pumapalapag sa ibang bansa.",
            "core.svc.svc-007.name": "Rekomendasyon sa network ng kababayang Tsino",
            "core.svc.svc-007.desc": "Mga pagpapakilala sa mapagkukunang may tag ng industriya.",
            "core.svc.svc-008.name": "Buod ng patakaran",
            "core.svc.svc-008.desc": "Buod ng patakaran sa gawaing Tsino sa ibang bansa at praktikal na punto.",
            "core.svc.svc-009.name": "Pagtutugma ng proyekto",
            "core.svc.svc-009.desc": "Pag-uugnay ng lokal na industriya sa mga proyekto ng kababayang Tsino.",
            "core.svc.svc-010.name": "Babala sa panganib",
            "core.svc.svc-010.desc": "Pagsubaybay sa panganib sa kalakalan, pagsunod, FX, atbp.",
            "core.svc.svc-011.name": "Pakikipagtulungan sa supply chain",
            "core.svc.svc-011.desc": "Pagtutugma ng demand at supply sa upstream–downstream.",
            "core.svc.svc-012.name": "Subscription sa patakaran sa ibang bansa",
            "core.svc.svc-012.desc": "Mga panuntunan sa pasok sa merkado at update sa regulasyon ayon sa bansa.",
            "industry.card.ind-001.name": "Industriya ng pampalasa",
            "industry.card.ind-001.summary":
                "Star anise, cinnamon at pampalasa — mula sa pagtatanim at pagproseso hanggang export; pangunahing agrikultura para sa merkado ng ASEAN.",
            "industry.card.ind-002.name": "Industriya ng seramiko",
            "industry.card.ind-002.summary":
                "Seramiko pang-araw-araw at pangkultura mula sa cluster ng Beiliu: paggawa, brand, at landas ng export.",
            "industry.card.ind-003.name": "Industriya ng kamote",
            "industry.card.ind-003.summary":
                "Mula sa bukid hanggang processed at handa nang kainin — pag-angat ng tradisyunal na pananim sa standardized na pagkain.",
            "industry.card.ind-004.name": "Mga likhang yantok",
            "industry.card.ind-004.summary":
                "Pamana ng pagyayabit sa Bobai at modernong disenyo ng bahay — regalo, dekorasyon, at produktong pangkultura para sa export.",
            "page.assistant.chatAria": "Pag-uusap",
            "page.assistant.composerAria": "Magtanong kay Qiao Zhuangzhuang",
            "page.assistant.aiBadgeTitle": "Katuwang na AI",
            "page.assistant.collapseChat": "I-collapse ang chat",
            "page.assistant.modalClose": "Isara",
            "page.assistant.dhPanel": "Panel ng digital human",
            "page.assistant.dhToggleCollapse": "I-collapse ang panel",
            "page.assistant.cat.fallbackType": "Paksa",
            "page.assistant.cat.fallbackTag": "FAQ",
            "dynamic.read": "Basahin ang pinagmulan",
            "dynamic.viewOriginal": "Tingnan ang orihinal",
            "dynamic.loading": "Nilo-load ang balita…",
            "overview.merchants": "Mga Tsino sa ibang bansa",
            "overview.enterprises": "Mga enterprise sa gawaing Tsino",
            "overview.orgs": "Mga organisasyon",
            "overview.projects": "Mga proyekto",
            "overview.countries": "Naaabot na bansa",
            "overview.active": "Aktibong kaso",
            "overview.empty": "Walang datos sa buod",
            "overview.unit.person": "tao",
            "overview.unit.enterprise": "",
            "overview.unit.org": "",
            "overview.unit.project": "",
            "overview.unit.country": "",
            "overview.unit.case": "",
            "map.loading": "Nilo-load ang mapa…",
            "map.strip.home": "Home",
            "map.strip.core": "Pangunahing serbisyo",
            "map.strip.zoomIn": "Palakihin",
            "map.strip.zoomOut": "Liitan",
            "map.strip.resetView": "Default na tanaw",
            "map.aria.canvas": "Mapa ng mga Tsino sa Timog-Silangang Asya",
            "i18n.prompt.lang.en":
                "Gamitin ang Filipino para sa lahat ng pamagat at buod na nakikita ng user (panatilihin ang pantanging pangalan tulad ng Yulin at ASEAN)",
            "i18n.prompt.lang.zh": "所有面向用户展示的句子使用简体中文。"
        }
    };

    (function applySeaLocaleOverrides() {
        var codes = ["th", "id", "vi", "ms", "fil"];
        codes.forEach(function (code) {
            var pack = SEA_LOCALE_OVERRIDES[code];
            var b = BUNDLES[code];
            if (!pack || !b) return;
            Object.keys(pack).forEach(function (k) {
                b[k] = pack[k];
            });
        });
    })();

    (function hydrateSeaBundlesFromZhCN() {
        var zh = BUNDLES["zh-CN"];
        if (!zh) return;
        ["th", "id", "vi", "ms", "fil"].forEach(function (code) {
            var b = BUNDLES[code];
            if (!b) return;
            Object.keys(zh).forEach(function (k) {
                if (!Object.prototype.hasOwnProperty.call(b, k)) {
                    b[k] = zh[k];
                }
            });
        });
    })();

    (function mergeSeaSurplusStrings() {
        var codes = ["th", "id", "vi", "ms", "fil"];
        codes.forEach(function (code) {
            var pack = SEA_SURPLUS_STRINGS[code];
            var b = BUNDLES[code];
            if (!pack || !b) return;
            Object.keys(pack).forEach(function (k) {
                b[k] = pack[k];
            });
        });
    })();

    (function mergeYxqSecondaryPageI18n() {
        var patch = global.__YXQ_I18N_SECONDARY__;
        if (!patch || typeof patch !== "object") return;
        if (patch["en-US"] && BUNDLES["en-US"]) {
            Object.assign(BUNDLES["en-US"], patch["en-US"]);
        }
        ["th", "id", "vi", "ms", "fil"].forEach(function (code) {
            var p = patch[code];
            var b = BUNDLES[code];
            if (p && b) Object.assign(b, p);
        });
    })();

    var SEA_MAP_PLACE_MERCHANT_BY_LANG = {
        th: {
            p: {
                万象: "เวียงจันทน์",
                万隆: "บันดุง",
                亚庇: "โกตาคินาบาลู",
                仰光: "ย่างกุ้ง",
                南宁: "หนานหนิง",
                古晋: "กูชิง",
                合艾: "หาดใหญ่",
                吉隆坡: "กัวลาลัมเปอร์",
                宿务: "เซบู",
                岘港: "ดานัง",
                巴厘岛: "บาหลี",
                巴色: "ปากเซ",
                新加坡: "สิงคโปร์",
                新山: "โจโฮร์บาห์รู",
                普吉: "ภูเก็ต",
                暹粒: "เสียมเรียบ",
                曼德勒: "มัณฑะเลย์",
                曼谷: "กรุงเทพมหานคร",
                棉兰: "เมดาน",
                槟城: "ปีนัง",
                河内: "ฮานอย",
                泗水: "สุราบายา",
                海防: "ไฮฟอง",
                清迈: "เชียงใหม่",
                玉林: "หยู่หลิน",
                琅勃拉邦: "หลวงพระบาง",
                胡志明市: "นครโฮจิมินห์",
                芭提雅: "พัทยา",
                芹苴: "กานเทอ",
                西哈努克港: "สีหนุวิลล์",
                达沃: "ดาเวา",
                金边: "พนมเปญ",
                雅加达: "จาการ์ตา",
                马六甲: "มะละกา",
                马尼拉: "มะนิลา",
                中国: "จีน",
                印度尼西亚: "อินโดนีเซีย",
                泰国: "ไทย",
                越南: "เวียดนาม",
                马来西亚: "มาเลเซีย",
                缅甸: "เมียนมา",
                菲律宾: "ฟิลิปปินส์",
                柬埔寨: "กัมพูชา",
                老挝: "ลาว"
            },
            m: {
                餐饮: "อาหารและเครื่องดื่ม",
                零售: "ค้าปลีก",
                制造: "การผลิต",
                服务: "บริการ",
                物流: "โลจิสติกส์",
                贸易: "การค้า",
                金融: "การเงิน",
                文旅: "วัฒนธรรมและการท่องเที่ยว",
                农业: "เกษตรกรรม",
                电商: "อีคอมเมิร์ซ",
                投资: "การลงทุน",
                其他: "อื่นๆ"
            }
        },
        id: {
            p: {
                万象: "Vientiane",
                万隆: "Bandung",
                亚庇: "Kota Kinabalu",
                仰光: "Yangon",
                南宁: "Nanning",
                古晋: "Kuching",
                合艾: "Hat Yai",
                吉隆坡: "Kuala Lumpur",
                宿务: "Cebu",
                岘港: "Da Nang",
                巴厘岛: "Bali",
                巴色: "Pakse",
                新加坡: "Singapura",
                新山: "Johor Bahru",
                普吉: "Phuket",
                暹粒: "Siem Reap",
                曼德勒: "Mandalay",
                曼谷: "Bangkok",
                棉兰: "Medan",
                槟城: "Pulau Pinang",
                河内: "Hanoi",
                泗水: "Surabaya",
                海防: "Haiphong",
                清迈: "Chiang Mai",
                玉林: "Yulin",
                琅勃拉邦: "Luang Prabang",
                胡志明市: "Kota Ho Chi Minh",
                芭提雅: "Pattaya",
                芹苴: "Can Tho",
                西哈努克港: "Sihanoukville",
                达沃: "Davao",
                金边: "Phnom Penh",
                雅加达: "Jakarta",
                马六甲: "Melaka",
                马尼拉: "Manila",
                中国: "Tiongkok",
                印度尼西亚: "Indonesia",
                泰国: "Thailand",
                越南: "Vietnam",
                马来西亚: "Malaysia",
                缅甸: "Myanmar",
                菲律宾: "Filipina",
                柬埔寨: "Kamboja",
                老挝: "Laos"
            },
            m: {
                餐饮: "Makanan & minuman",
                零售: "Ritel",
                制造: "Manufaktur",
                服务: "Jasa",
                物流: "Logistik",
                贸易: "Perdagangan",
                金融: "Keuangan",
                文旅: "Budaya & pariwisata",
                农业: "Pertanian",
                电商: "E-commerce",
                投资: "Investasi",
                其他: "Lainnya"
            }
        },
        vi: {
            p: {
                万象: "Viêng Chăn",
                万隆: "Bandung",
                亚庇: "Kota Kinabalu",
                仰光: "Yangon",
                南宁: "Nam Ninh",
                古晋: "Kuching",
                合艾: "Hat Yai",
                吉隆坡: "Kuala Lumpur",
                宿务: "Cebu",
                岘港: "Đà Nẵng",
                巴厘岛: "Bali",
                巴色: "Pakse",
                新加坡: "Singapore",
                新山: "Johor Bahru",
                普吉: "Phuket",
                暹粒: "Xiêm Riệp",
                曼德勒: "Mandalay",
                曼谷: "Bangkok",
                棉兰: "Medan",
                槟城: "Penang",
                河内: "Hà Nội",
                泗水: "Surabaya",
                海防: "Hải Phòng",
                清迈: "Chiang Mai",
                玉林: "Ngọc Lâm",
                琅勃拉邦: "Luang Prabang",
                胡志明市: "Thành phố Hồ Chí Minh",
                芭提雅: "Pattaya",
                芹苴: "Cần Thơ",
                西哈努克港: "Sihanoukville",
                达沃: "Davao",
                金边: "Phnôm Pênh",
                雅加达: "Jakarta",
                马六甲: "Malacca",
                马尼拉: "Manila",
                中国: "Trung Quốc",
                印度尼西亚: "Indonesia",
                泰国: "Thái Lan",
                越南: "Việt Nam",
                马来西亚: "Malaysia",
                缅甸: "Myanmar",
                菲律宾: "Philippines",
                柬埔寨: "Campuchia",
                老挝: "Lào"
            },
            m: {
                餐饮: "Ẩm thực",
                零售: "Bán lẻ",
                制造: "Sản xuất",
                服务: "Dịch vụ",
                物流: "Hậu cần",
                贸易: "Thương mại",
                金融: "Tài chính",
                文旅: "Văn hóa & du lịch",
                农业: "Nông nghiệp",
                电商: "Thương mại điện tử",
                投资: "Đầu tư",
                其他: "Khác"
            }
        },
        ms: {
            p: {
                万象: "Vientiane",
                万隆: "Bandung",
                亚庇: "Kota Kinabalu",
                仰光: "Yangon",
                南宁: "Nanning",
                古晋: "Kuching",
                合艾: "Hat Yai",
                吉隆坡: "Kuala Lumpur",
                宿务: "Cebu",
                岘港: "Da Nang",
                巴厘岛: "Bali",
                巴色: "Pakse",
                新加坡: "Singapura",
                新山: "Johor Bahru",
                普吉: "Phuket",
                暹粒: "Siem Reap",
                曼德勒: "Mandalay",
                曼谷: "Bangkok",
                棉兰: "Medan",
                槟城: "Pulau Pinang",
                河内: "Hanoi",
                泗水: "Surabaya",
                海防: "Haiphong",
                清迈: "Chiang Mai",
                玉林: "Yulin",
                琅勃拉邦: "Luang Prabang",
                胡志明市: "Ho Chi Minh",
                芭提雅: "Pattaya",
                芹苴: "Can Tho",
                西哈努克港: "Sihanoukville",
                达沃: "Davao",
                金边: "Phnom Penh",
                雅加达: "Jakarta",
                马六甲: "Melaka",
                马尼拉: "Manila",
                中国: "China",
                印度尼西亚: "Indonesia",
                泰国: "Thailand",
                越南: "Vietnam",
                马来西亚: "Malaysia",
                缅甸: "Myanmar",
                菲律宾: "Filipina",
                柬埔寨: "Kemboja",
                老挝: "Laos"
            },
            m: {
                餐饮: "Makanan & minuman",
                零售: "Peruncitan",
                制造: "Pembuatan",
                服务: "Perkhidmatan",
                物流: "Logistik",
                贸易: "Perdagangan",
                金融: "Kewangan",
                文旅: "Budaya & pelancongan",
                农业: "Pertanian",
                电商: "E-dagang",
                投资: "Pelaburan",
                其他: "Lain-lain"
            }
        },
        fil: {
            p: {
                万象: "Vientiane",
                万隆: "Bandung",
                亚庇: "Kota Kinabalu",
                仰光: "Yangon",
                南宁: "Nanning",
                古晋: "Kuching",
                合艾: "Hat Yai",
                吉隆坡: "Kuala Lumpur",
                宿务: "Cebu",
                岘港: "Da Nang",
                巴厘岛: "Bali",
                巴色: "Pakse",
                新加坡: "Singapore",
                新山: "Johor Bahru",
                普吉: "Phuket",
                暹粒: "Siem Reap",
                曼德勒: "Mandalay",
                曼谷: "Bangkok",
                棉兰: "Medan",
                槟城: "Penang",
                河内: "Hanoi",
                泗水: "Surabaya",
                海防: "Haiphong",
                清迈: "Chiang Mai",
                玉林: "Yulin",
                琅勃拉邦: "Luang Prabang",
                胡志明市: "Lungsod ng Ho Chi Minh",
                芭提雅: "Pattaya",
                芹苴: "Can Tho",
                西哈努克港: "Sihanoukville",
                达沃: "Davao",
                金边: "Phnom Penh",
                雅加达: "Jakarta",
                马六甲: "Malacca",
                马尼拉: "Maynila",
                中国: "Tsina",
                印度尼西亚: "Indonesia",
                泰国: "Thailand",
                越南: "Vietnam",
                马来西亚: "Malaysia",
                缅甸: "Myanmar",
                菲律宾: "Pilipinas",
                柬埔寨: "Cambodia",
                老挝: "Laos"
            },
            m: {
                餐饮: "Pagkain at inumin",
                零售: "Ritel",
                制造: "Paggawa",
                服务: "Serbisyo",
                物流: "Logistika",
                贸易: "Kalakalan",
                金融: "Pananalapi",
                文旅: "Kultura at turismo",
                农业: "Agrikultura",
                电商: "E-commerce",
                投资: "Pamumuhunan",
                其他: "Iba pa"
            }
        }
    };

    (function mergeSeaMapPlaceMerchantLabels() {
        var codes = ["th", "id", "vi", "ms", "fil"];
        codes.forEach(function (code) {
            var block = SEA_MAP_PLACE_MERCHANT_BY_LANG[code];
            var b = BUNDLES[code];
            if (!block || !b) return;
            if (block.p) {
                Object.keys(block.p).forEach(function (zh) {
                    b["map.place." + zh] = block.p[zh];
                });
            }
            if (block.m) {
                Object.keys(block.m).forEach(function (zh) {
                    b["map.merchantType." + zh] = block.m[zh];
                });
            }
        });
    })();

    var LOCALE_HTML_LANG = {
        "zh-CN": "zh-CN",
        "en-US": "en",
        th: "th",
        id: "id",
        vi: "vi",
        ms: "ms",
        fil: "fil"
    };

    var LOCALE_TARGET_NAME = {
        "en-US": "English",
        th: "Thai",
        id: "Indonesian",
        vi: "Vietnamese",
        ms: "Malay",
        fil: "Filipino"
    };

    var LOCALE_FLOAT_ABBR = {
        "zh-CN": "中文",
        "en-US": "EN",
        th: "TH",
        id: "ID",
        vi: "VI",
        ms: "MS",
        fil: "FIL"
    };

    var LOCALE_CHOICES = [
        { code: "zh-CN", label: "中文" },
        { code: "en-US", label: "English" },
        { code: "th", label: "ไทย" },
        { code: "id", label: "Bahasa Indonesia" },
        { code: "vi", label: "Tiếng Việt" },
        { code: "ms", label: "Bahasa Melayu" },
        { code: "fil", label: "Filipino" }
    ];

    var apiMerged = {};

    function getRawLocale() {
        try {
            return (global.localStorage.getItem(STORAGE_KEY) || "zh-CN").trim();
        } catch (e) {
            return "zh-CN";
        }
    }

    function normalizeLocale(code) {
        var c = String(code || "").trim();
        if (c === "en" || c === "en_US") return "en-US";
        if (c === "zh" || c === "zh_Hans") return "zh-CN";
        if (c === "th" || c === "th_TH") return "th";
        if (c === "id" || c === "id_ID" || c === "in") return "id";
        if (c === "vi" || c === "vi_VN") return "vi";
        if (c === "ms" || c === "ms_MY") return "ms";
        if (c === "fil" || c === "tl" || c === "fil_PH") return "fil";
        if (BUNDLES[c]) return c;
        return "zh-CN";
    }

    function htmlLangFromLocale(loc) {
        var L = normalizeLocale(loc);
        return LOCALE_HTML_LANG[L] || "en";
    }

    function targetLangNameForApi(loc) {
        var L = normalizeLocale(loc);
        return LOCALE_TARGET_NAME[L] || L;
    }

    function getLocale() {
        return normalizeLocale(getRawLocale());
    }

    function loadApiCache(locale) {
        try {
            var raw = global.sessionStorage.getItem(API_CACHE_PREFIX + locale);
            if (!raw) return {};
            var o = JSON.parse(raw);
            return o && typeof o === "object" ? o : {};
        } catch (e) {
            return {};
        }
    }

    function saveApiCache(locale, dict) {
        try {
            global.sessionStorage.setItem(API_CACHE_PREFIX + locale, JSON.stringify(dict || {}));
        } catch (e) {}
    }

    function localizePlaceName(zhName) {
        var n = String(zhName || "").trim();
        if (!n) return "";
        var loc = getLocale();
        if (loc === "zh-CN") return n;
        var pk = "map.place." + n;
        var locBundle = BUNDLES[loc] || {};
        if (Object.prototype.hasOwnProperty.call(locBundle, pk) && locBundle[pk] != null && String(locBundle[pk]).length) {
            return String(locBundle[pk]);
        }
        if (loc === "th" || loc === "id" || loc === "vi" || loc === "ms" || loc === "fil") {
            return n;
        }
        var enB = BUNDLES["en-US"] || {};
        if (Object.prototype.hasOwnProperty.call(enB, pk) && enB[pk] != null && String(enB[pk]).length) {
            return String(enB[pk]);
        }
        if (Object.prototype.hasOwnProperty.call(MAP_PLACE_EN, n)) return MAP_PLACE_EN[n];
        return n;
    }

    function localizeMerchantType(zhType) {
        var n = String(zhType || "").trim();
        if (!n) return "";
        var loc = getLocale();
        if (loc === "zh-CN") return n;
        var tk = "map.merchantType." + n;
        var locBundle = BUNDLES[loc] || {};
        if (Object.prototype.hasOwnProperty.call(locBundle, tk) && locBundle[tk] != null && String(locBundle[tk]).length) {
            return String(locBundle[tk]);
        }
        if (loc === "th" || loc === "id" || loc === "vi" || loc === "ms" || loc === "fil") {
            return n;
        }
        var enB = BUNDLES["en-US"] || {};
        if (Object.prototype.hasOwnProperty.call(enB, tk) && enB[tk] != null && String(enB[tk]).length) {
            return String(enB[tk]);
        }
        if (Object.prototype.hasOwnProperty.call(MAP_MERCHANT_TYPE_EN, n)) return MAP_MERCHANT_TYPE_EN[n];
        return n;
    }

    function t(key, vars) {
        var loc = getLocale();
        var k = String(key || "");
        if (!apiMerged[loc]) apiMerged[loc] = loadApiCache(loc);
        var fromApi = apiMerged[loc][k];
        var bundleLoc = BUNDLES[loc] || {};
        var bundleZh = BUNDLES["zh-CN"] || {};
        var bundleEn = BUNDLES["en-US"] || {};
        var hasCurated =
            Object.prototype.hasOwnProperty.call(bundleLoc, k) &&
            bundleLoc[k] != null &&
            String(bundleLoc[k]).length > 0;
        var s;
        if (hasCurated) {
            s = bundleLoc[k];
        } else {
            var apiStr = fromApi != null && String(fromApi).length ? String(fromApi) : "";
            if (apiStr) {
                s = apiStr;
            } else {
                var enVal = bundleEn[k];
                var zhVal = bundleZh[k];
                if (loc === "zh-CN") {
                    s = zhVal != null && String(zhVal).length ? zhVal : k;
                } else if (loc === "th" || loc === "id" || loc === "vi" || loc === "ms" || loc === "fil") {
                    if (zhVal != null && String(zhVal).length) s = zhVal;
                    else if (enVal != null && String(enVal).length) s = enVal;
                    else s = k;
                } else {
                    if (enVal != null && String(enVal).length) s = enVal;
                    else if (zhVal != null && String(zhVal).length) s = zhVal;
                    else s = k;
                }
            }
        }
        if (vars && typeof vars === "object") {
            Object.keys(vars).forEach(function (nk) {
                s = s.split("{" + nk + "}").join(String(vars[nk]));
            });
        }
        return s;
    }

    function applyLocaleBodyClasses(loc) {
        var L = normalizeLocale(loc);
        var de = global.document.documentElement;
        var body = global.document.body;
        if (de) {
            de.setAttribute("data-app-locale", L);
            de.lang = htmlLangFromLocale(L);
        }
        if (body) {
            body.classList.remove("app-locale-en", "app-locale-zh", "app-locale-non-zh");
            body.classList.add(L === "zh-CN" ? "app-locale-zh" : "app-locale-non-zh");
        }
    }

    function getPromptLanguageInstruction() {
        var L = getLocale();
        if (L === "zh-CN") return t("i18n.prompt.lang.zh");
        if (L === "en-US") return t("i18n.prompt.lang.en");
        var pk = "i18n.prompt.out";
        var bl = BUNDLES[L] || {};
        if (Object.prototype.hasOwnProperty.call(bl, pk) && bl[pk] != null && String(bl[pk]).length) {
            return String(bl[pk]);
        }
        return t("i18n.prompt.lang.en");
    }

    function simpleHash(str) {
        var s = String(str || "");
        var h = 2166136261;
        for (var i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(36);
    }

    var layoutCalTimer = null;

    function calibrateHomeHeaderLayout() {
        var doc = global.document;
        var w = global;
        var body = doc.body;
        if (!body || !body.classList.contains("page-home")) return;
        var header = doc.querySelector(".page-home .header");
        var h1 = doc.querySelector(".page-home .header h1");
        if (!header || !h1) return;
        try {
            h1.style.removeProperty("font-size");
        } catch (eRm) {}
        var hdrW = header.getBoundingClientRect().width;
        if (hdrW < 64) return;
        var logo = header.querySelector(".brand-logo");
        var logoW = logo ? logo.getBoundingClientRect().width : 96;
        var sideReserve = Math.min(hdrW * 0.23, Math.max(logoW + 16, 104));
        var maxLineW = Math.max(140, hdrW - sideReserve * 2);
        var nonZh = body.classList.contains("app-locale-non-zh");
        var minPx = nonZh ? 16 : 19;
        var iter = 0;
        var cs = w.getComputedStyle(h1);
        while (iter < 16) {
            var r = h1.getBoundingClientRect();
            var sw = h1.scrollWidth;
            var sh = h1.scrollHeight;
            var overW = sw > maxLineW + 4 || r.width > maxLineW + 8;
            var overH = sh > r.height * 1.42 && sh > 52;
            if (!overW && !overH) break;
            var fs = parseFloat(cs.fontSize) || 40;
            if (fs <= minPx) break;
            var next = Math.max(minPx, fs * 0.9);
            h1.style.fontSize = next + "px";
            cs = w.getComputedStyle(h1);
            iter += 1;
        }
        var meta = doc.getElementById("headerMeta");
        if (meta) {
            var needsTight = meta.scrollWidth > meta.clientWidth + 3;
            meta.classList.toggle("header-meta--tight", needsTight);
        }
    }

    function runLayoutCalibrationPass() {
        var doc = global.document;
        if (!doc) return;
        var w = global;
        try {
            if (typeof w.dispatchEvent === "function") {
                try {
                    w.dispatchEvent(new w.Event("resize"));
                } catch (eRe) {
                    try {
                        w.dispatchEvent(new CustomEvent("resize"));
                    } catch (eRe2) {}
                }
            }
        } catch (e0) {}
        var body = doc.body;
        if (body) {
            try {
                body.setAttribute("data-layout-rev", String(Date.now()));
            } catch (e1) {}
        }
        try {
            calibrateHomeHeaderLayout();
        } catch (eHm) {}
        var mapRefs = [w.__yuxiaoqiaoHomeMap, w.__yuxiaoqiaoMapPageMap];
        mapRefs.forEach(function (mapRef) {
            if (mapRef && typeof mapRef.checkResize === "function") {
                try {
                    mapRef.checkResize();
                } catch (e2) {}
            }
        });
        w.setTimeout(function () {
            mapRefs.forEach(function (mapRef) {
                if (mapRef && typeof mapRef.checkResize === "function") {
                    try {
                        mapRef.checkResize();
                    } catch (e3) {}
                }
            });
        }, 90);
        /* 助手推荐提问条：勿在此处重置 CSS animation。scheduleLayoutCalibration 会在 resize 等场景多次触发，
         * 反复 animation:none 会导致轮播卡顿/无法连续滚动；内容变更时由 page-overseas-assistant 内 renderSuggestions 重启。 */
        var grid = doc.getElementById("assistantCategoryGrid");
        if (grid) {
            try {
                var cards = grid.querySelectorAll(".assistant-category-card");
                cards.forEach(function (c) {
                    c.style.minHeight = "";
                });
                w.requestAnimationFrame(function () {
                    try {
                        var byTop = Object.create(null);
                        grid.querySelectorAll(".assistant-category-card").forEach(function (card) {
                            var t = Math.round(card.getBoundingClientRect().top);
                            if (!byTop[t]) byTop[t] = [];
                            byTop[t].push(card);
                        });
                        Object.keys(byTop).forEach(function (k) {
                            var group = byTop[k];
                            var maxH = 0;
                            group.forEach(function (c) {
                                maxH = Math.max(maxH, c.getBoundingClientRect().height);
                            });
                            if (maxH > 4) {
                                var px = Math.ceil(maxH) + "px";
                                group.forEach(function (c) {
                                    c.style.minHeight = px;
                                });
                            }
                        });
                    } catch (e5) {}
                });
            } catch (eGr) {}
        }
        var ta = doc.getElementById("assistantQuestionInput");
        if (ta) {
            try {
                ta.dispatchEvent(new Event("input", { bubbles: true }));
            } catch (e6) {}
        }
        try {
            w.dispatchEvent(
                new CustomEvent("yuxiaoqiao:layout-calibrated", {
                    detail: { locale: getLocale() }
                })
            );
        } catch (e7) {}
    }

    function scheduleLayoutCalibration() {
        if (!global.document) return;
        var w = global;
        if (typeof w.requestAnimationFrame === "function") {
            w.requestAnimationFrame(function () {
                w.requestAnimationFrame(function () {
                    runLayoutCalibrationPass();
                });
            });
        } else {
            w.setTimeout(runLayoutCalibrationPass, 0);
        }
        if (layoutCalTimer) {
            try {
                w.clearTimeout(layoutCalTimer);
            } catch (eCt) {}
        }
        layoutCalTimer = w.setTimeout(function () {
            layoutCalTimer = null;
            runLayoutCalibrationPass();
        }, 420);
    }

    function setLocale(code, opts) {
        var next = normalizeLocale(code);
        try {
            global.localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {}
        if (global.document && global.document.documentElement) {
            global.document.documentElement.lang = htmlLangFromLocale(next);
        }
        applyLocaleBodyClasses(next);
        apiMerged[next] = Object.assign(loadApiCache(next), apiMerged[next] || {});
        if (opts && opts.fromApi && opts.dict) {
            apiMerged[next] = Object.assign(apiMerged[next], opts.dict);
            saveApiCache(next, apiMerged[next]);
        }
        applyDom(global.document);
        var titleKey = global.document.body && global.document.body.getAttribute("data-i18n-title");
        if (titleKey) {
            try {
                global.document.title = t(titleKey);
            } catch (eTitle) {}
        }
        try {
            global.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { locale: next } }));
        } catch (e) {}
        updateSwitcherLabels();
        scheduleLayoutCalibration();
    }

    function applyDom(root) {
        var r = root && root.querySelectorAll ? root : global.document;
        if (!r || !r.querySelectorAll) return;
        r.querySelectorAll("[data-i18n]").forEach(function (el) {
            var key = el.getAttribute("data-i18n");
            if (!key) return;
            var attr = el.getAttribute("data-i18n-attr");
            var val = t(key);
            if (attr) el.setAttribute(attr, val);
            else el.textContent = val;
        });
        r.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            var pk = el.getAttribute("data-i18n-placeholder");
            if (pk && "placeholder" in el) el.placeholder = t(pk);
        });
        r.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
            var ak = el.getAttribute("data-i18n-aria-label");
            if (ak) el.setAttribute("aria-label", t(ak));
        });
        r.querySelectorAll("[data-i18n-tooltip]").forEach(function (el) {
            var tk = el.getAttribute("data-i18n-tooltip");
            if (tk) el.setAttribute("title", t(tk));
        });
    }

    function refreshFloatMenuSelection() {
        var menu = global.document.getElementById("i18nFloatMenu");
        if (!menu) return;
        var loc = getLocale();
        menu.querySelectorAll("[data-locale]").forEach(function (li) {
            var code = li.getAttribute("data-locale");
            if (code === loc) li.setAttribute("aria-selected", "true");
            else li.removeAttribute("aria-selected");
        });
    }

    function updateSwitcherLabels() {
        var loc = getLocale();
        var btn = global.document.getElementById("headerLangBtn");
        if (btn) {
            var cur = null;
            for (var ci = 0; ci < LOCALE_CHOICES.length; ci++) {
                if (LOCALE_CHOICES[ci].code === loc) {
                    cur = LOCALE_CHOICES[ci];
                    break;
                }
            }
            btn.textContent = cur ? cur.label : t("lang.name");
            btn.setAttribute("aria-label", t("lang.btn"));
        }
        var floatBtn = global.document.getElementById("i18nFloatLangBtn");
        if (floatBtn) {
            var cur2 = null;
            for (var cj = 0; cj < LOCALE_CHOICES.length; cj++) {
                if (LOCALE_CHOICES[cj].code === loc) {
                    cur2 = LOCALE_CHOICES[cj];
                    break;
                }
            }
            floatBtn.textContent =
                LOCALE_FLOAT_ABBR[loc] ||
                (cur2 && cur2.label ? String(cur2.label).slice(0, 4) : String(loc).slice(0, 4));
            floatBtn.title = t("float.langTitle");
            floatBtn.setAttribute("aria-label", t("lang.btn"));
        }
        var floatRoot = global.document.getElementById("i18nFloatRoot");
        if (floatRoot) floatRoot.setAttribute("aria-label", t("float.langTitle"));
        refreshFloatMenuSelection();
    }

    function bindHeaderMenu() {
        var wrap = global.document.getElementById("headerLangWrap");
        var btn = global.document.getElementById("headerLangBtn");
        var menu = global.document.getElementById("headerLangMenu");
        if (!wrap || !btn || !menu) return;
        if (wrap.dataset.i18nLangBound === "1") {
            updateSwitcherLabels();
            return;
        }
        wrap.dataset.i18nLangBound = "1";
        function close() {
            menu.hidden = true;
            btn.setAttribute("aria-expanded", "false");
        }
        function open() {
            menu.hidden = false;
            btn.setAttribute("aria-expanded", "true");
        }
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (menu.hidden) open();
            else close();
        });
        menu.addEventListener("click", function (e) {
            e.stopPropagation();
            var li = e.target && e.target.closest ? e.target.closest("[data-locale]") : null;
            if (!li) return;
            var code = li.getAttribute("data-locale");
            if (code) {
                setLocale(code);
                maybeFetchApiBundle(code);
            }
            close();
        });
        global.document.addEventListener("click", close);
        menu.innerHTML = "";
        LOCALE_CHOICES.forEach(function (opt) {
            var li = global.document.createElement("li");
            li.setAttribute("role", "option");
            li.setAttribute("data-locale", opt.code);
            li.textContent = opt.label;
            if (opt.code === getLocale()) li.setAttribute("aria-selected", "true");
            menu.appendChild(li);
        });
        updateSwitcherLabels();
    }

    function placeFloatSwitcherRoot(root) {
        var slot = global.document.getElementById("headerLangSlot");
        if (slot) {
            slot.appendChild(root);
            root.classList.add("i18n-float-root--inline");
        } else {
            global.document.body.appendChild(root);
            root.classList.remove("i18n-float-root--inline");
        }
    }

    function mountFloatingSwitcher() {
        var existing = global.document.getElementById("i18nFloatRoot");
        if (existing) {
            placeFloatSwitcherRoot(existing);
            refreshFloatMenuSelection();
            updateSwitcherLabels();
            return;
        }
        var root = global.document.createElement("div");
        root.id = "i18nFloatRoot";
        root.className = "i18n-float-root";
        root.setAttribute("role", "region");
        root.setAttribute("aria-label", "Language");
        root.innerHTML =
            '<button type="button" class="i18n-float-btn" id="i18nFloatLangBtn" aria-haspopup="listbox" aria-expanded="false" aria-controls="i18nFloatMenu"></button>' +
            '<ul class="i18n-float-menu" id="i18nFloatMenu" hidden role="listbox"></ul>';
        placeFloatSwitcherRoot(root);
        var btn = root.querySelector("#i18nFloatLangBtn");
        var menu = root.querySelector("#i18nFloatMenu");
        LOCALE_CHOICES.forEach(function (opt) {
            var li = global.document.createElement("li");
            li.setAttribute("role", "option");
            li.setAttribute("data-locale", opt.code);
            li.textContent = opt.label;
            menu.appendChild(li);
        });
        function closeFloat() {
            menu.hidden = true;
            btn.setAttribute("aria-expanded", "false");
        }
        function openFloat() {
            menu.hidden = false;
            btn.setAttribute("aria-expanded", "true");
        }
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (menu.hidden) openFloat();
            else closeFloat();
        });
        menu.addEventListener("click", function (e) {
            e.stopPropagation();
            var li = e.target && e.target.closest ? e.target.closest("[data-locale]") : null;
            if (!li) return;
            var code = li.getAttribute("data-locale");
            if (code) {
                setLocale(code);
                maybeFetchApiBundle(code);
            }
            closeFloat();
        });
        global.document.addEventListener("click", closeFloat);
        global.document.addEventListener("keydown", function (ev) {
            if (ev.key === "Escape") closeFloat();
        });
        updateSwitcherLabels();
        refreshFloatMenuSelection();
    }

    function getDataChatConfig() {
        var base = global.ARK_DATA_CHAT_DEFAULTS || {};
        var da = global.DATA_ACQUISITION_ARK || {};
        var endpoint = String(da.endpoint || "").trim() || String(base.endpoint || "").trim();
        if (!endpoint || endpoint.indexOf("bots/") !== -1) {
            endpoint = String(base.endpoint || "").trim();
        }
        return {
            endpoint: endpoint,
            apiKey: String(da.apiKey || "").trim(),
            model: String(da.model || "").trim() || String(base.model || "").trim(),
        };
    }

    function parseJsonFromText(text) {
        var s = String(text || "").trim();
        if (!s) return null;
        var fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (fence) s = fence[1].trim();
        try {
            return JSON.parse(s);
        } catch (e) {
            var m = s.match(/\{[\s\S]*\}/);
            if (!m) return null;
            try {
                return JSON.parse(m[0]);
            } catch (e2) {
                return null;
            }
        }
    }

    function extractArkContent(data) {
        if (!data || typeof data !== "object") return "";
        var err = data.error;
        if (err) throw new Error((err.message || err.code || "API error").toString());
        var ch = (data.choices && data.choices[0] && data.choices[0].message) || {};
        var c = ch.content;
        if (typeof c === "string") return c;
        if (Array.isArray(c)) {
            return c
                .map(function (b) {
                    return b && b.type === "text" ? b.text || "" : "";
                })
                .join("");
        }
        return String(c || "");
    }

    function getTranslationResponsesConfig() {
        var base = global.ARK_TRANSLATION_RESPONSES_DEFAULTS || {};
        var tr = global.TRANSLATION_ARK || {};
        var da = global.DATA_ACQUISITION_ARK || {};
        var endpoint = String(tr.endpoint || "").trim() || String(base.endpoint || "").trim();
        var model = String(tr.model || "").trim() || String(base.model || "").trim();
        var apiKey = String(tr.apiKey || "").trim() || String(da.apiKey || "").trim();
        var enabled = tr.enabled !== false;
        return { enabled: enabled, endpoint: endpoint, model: model, apiKey: apiKey };
    }

    function localeToTranslationLangForResponses(loc) {
        var L = normalizeLocale(loc);
        var m = {
            "zh-CN": "zh",
            "en-US": "en",
            th: "th",
            id: "id",
            vi: "vi",
            ms: "ms",
            fil: "fil",
        };
        return m[L] || "en";
    }

    function extractResponsesOutputText(data) {
        if (!data || typeof data !== "object") return "";
        var err = data.error;
        if (err) throw new Error(String(err.message || err.code || "API error"));
        if (typeof data.output_text === "string" && data.output_text.length) return data.output_text;
        var out = data.output;
        if (Array.isArray(out)) {
            var acc = [];
            for (var oi = 0; oi < out.length; oi++) {
                var block = out[oi];
                if (!block || typeof block !== "object") continue;
                var cont = block.content;
                if (Array.isArray(cont)) {
                    for (var ci = 0; ci < cont.length; ci++) {
                        var cpart = cont[ci];
                        if (!cpart || typeof cpart !== "object") continue;
                        var typ = cpart.type;
                        if ((typ === "output_text" || typ === "text") && cpart.text != null) {
                            acc.push(String(cpart.text));
                        }
                    }
                }
                if (typeof block.text === "string") acc.push(block.text);
            }
            if (acc.length) return acc.join("");
        }
        return extractArkContent(data);
    }

    function callArkResponsesTranslate(text, sourceLang, targetLang, tCfg) {
        var body = {
            model: tCfg.model,
            input: [
                {
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: String(text || ""),
                            translation_options: {
                                source_language: sourceLang,
                                target_language: targetLang,
                            },
                        },
                    ],
                },
            ],
        };
        return global
            .fetch(tCfg.endpoint, {
                method: "POST",
                headers: { Authorization: "Bearer " + tCfg.apiKey, "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            .then(function (r) {
                if (!r.ok) {
                    return r.text().then(function (tx) {
                        throw new Error("responses " + r.status + " " + String(tx || "").slice(0, 240));
                    });
                }
                return r.json();
            })
            .then(function (data) {
                return String(extractResponsesOutputText(data) || "").trim();
            });
    }

    function translateObjectsViaChatCompletions(rows, fieldNames, loc, cfg, ck) {
        var payload = rows.map(function (r, ix) {
            var o = { _i: ix };
            fieldNames.forEach(function (f) {
                o[f] = String((r && r[f]) || "");
            });
            return o;
        });
        var langName = targetLangNameForApi(loc);
        var body = {
            model: cfg.model,
            messages: [
                {
                    role: "system",
                    content:
                        "You translate fields for a bilingual UI. Output ONLY valid JSON: {\"items\":[...]} — same length as input items, each object must include _i (index) and the same field keys. Preserve numbers/dates/URLs unchanged. No markdown."
                },
                {
                    role: "user",
                    content:
                        "Target language: " +
                        langName +
                        ". Translate string values only for objects in items:\n" +
                        JSON.stringify({ items: payload })
                }
            ],
            temperature: 0.15,
            max_tokens: 8192
        };
        return global
            .fetch(cfg.endpoint, {
                method: "POST",
                headers: { Authorization: "Bearer " + cfg.apiKey, "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            .then(function (r) {
                if (!r.ok) throw new Error("translate " + r.status);
                return r.json();
            })
            .then(function (data) {
                var text = extractArkContent(data);
                var parsed = parseJsonFromText(text);
                var list = parsed && (parsed.items || parsed.results || parsed.data);
                if (!Array.isArray(list) || list.length !== rows.length) throw new Error("bad translate shape");
                list.sort(function (a, b) {
                    return Number(a._i) - Number(b._i);
                });
                writeContentTrCache(ck, JSON.stringify(list));
                return rows.map(function (r, i) {
                    var o = Object.assign({}, r);
                    var tr = list[i];
                    if (!tr) return o;
                    fieldNames.forEach(function (f) {
                        if (tr[f] != null && String(tr[f]).trim()) o[f] = tr[f];
                    });
                    return o;
                });
            });
    }

    function translateObjectsViaArk(rows, fieldNames, targetLocale) {
        var loc = normalizeLocale(targetLocale);
        if (loc === "zh-CN" || !rows || !rows.length) {
            return Promise.resolve(rows.map(function (r) { return Object.assign({}, r); }));
        }
        var cCfg = getDataChatConfig();
        var tCfg = getTranslationResponsesConfig();
        if (!cCfg.apiKey && !tCfg.apiKey) {
            return Promise.resolve(rows.map(function (r) { return Object.assign({}, r); }));
        }
        var sig = loc + "|" + rows.length + "|" + fieldNames.join(",") + "|";
        sig += rows
            .slice(0, 40)
            .map(function (r) {
                return fieldNames
                    .map(function (f) {
                        return String((r && r[f]) || "").slice(0, 160);
                    })
                    .join("\u001f");
            })
            .join("\u001e");
        var ck = CONTENT_TR_PREFIX + simpleHash(sig);
        try {
            var hit = readContentTrCache(ck);
            if (hit) {
                var cached = JSON.parse(hit);
                if (cached && cached.length === rows.length) {
                    return Promise.resolve(
                        rows.map(function (r, i) {
                            var o = Object.assign({}, r);
                            fieldNames.forEach(function (f) {
                                if (cached[i] && cached[i][f] != null && String(cached[i][f]).length) o[f] = cached[i][f];
                            });
                            return o;
                        })
                    );
                }
            }
        } catch (e0) {}
        var srcLang = "zh";
        var tgtLang = localeToTranslationLangForResponses(loc);
        var useResponses =
            tCfg.enabled && tCfg.endpoint && tCfg.model && tCfg.apiKey && tgtLang !== srcLang;
        var sep = "\u001e";
        if (useResponses) {
            return Promise.all(
                rows.map(function (r) {
                    var line = fieldNames
                        .map(function (f) {
                            return String((r && r[f]) || "");
                        })
                        .join(sep);
                    return callArkResponsesTranslate(line, srcLang, tgtLang, tCfg).then(function (out) {
                        var parts = String(out || "").split(sep);
                        var o = Object.assign({}, r);
                        fieldNames.forEach(function (f, fi) {
                            var p = parts[fi];
                            if (p != null && String(p).trim()) o[f] = p.trim();
                        });
                        return o;
                    });
                })
            )
                .then(function (outRows) {
                    var list = outRows.map(function (row, ix) {
                        var item = { _i: ix };
                        fieldNames.forEach(function (f) {
                            item[f] = row[f];
                        });
                        return item;
                    });
                    writeContentTrCache(ck, JSON.stringify(list));
                    return outRows;
                })
                .catch(function () {
                    if (!cCfg.model || !cCfg.apiKey || !cCfg.endpoint) {
                        return rows.map(function (r) { return Object.assign({}, r); });
                    }
                    return translateObjectsViaChatCompletions(rows, fieldNames, loc, cCfg, ck).catch(function () {
                        return rows.map(function (r) { return Object.assign({}, r); });
                    });
                });
        }
        if (!cCfg.model || !cCfg.endpoint) {
            return Promise.resolve(rows.map(function (r) { return Object.assign({}, r); }));
        }
        return translateObjectsViaChatCompletions(rows, fieldNames, loc, cCfg, ck).catch(function () {
            return rows.map(function (r) { return Object.assign({}, r); });
        });
    }

    function translateCoreRows(items) {
        return translateObjectsViaArk(items || [], ["name", "description"], getLocale());
    }

    function translateIndustryRows(items) {
        return translateObjectsViaArk(
            items || [],
            ["name", "summary", "status", "resource", "market", "supply_chain", "opportunity"],
            getLocale()
        );
    }

    function translateMerchantRows(items) {
        var loc = normalizeLocale(getLocale());
        var list = items || [];
        if (loc === "zh-CN" || !list.length) {
            return Promise.resolve(list.map(function (r) { return Object.assign({}, r); }));
        }
        var fields = ["merchant_name", "merchant_desc", "contact"];
        var chunkSize = 32;
        var chunks = [];
        for (var i = 0; i < list.length; i += chunkSize) {
            chunks.push(list.slice(i, i + chunkSize));
        }
        var concurrency = 3;
        var merged = [];
        function runAt(idx) {
            if (idx >= chunks.length) {
                return Promise.resolve(merged);
            }
            var batch = chunks.slice(idx, idx + concurrency);
            return Promise.all(
                batch.map(function (ch) {
                    return translateObjectsViaArk(ch, fields, loc);
                })
            ).then(function (parts) {
                parts.forEach(function (rows) {
                    merged = merged.concat(rows);
                });
                return runAt(idx + concurrency);
            });
        }
        return runAt(0);
    }

    function translatePlainTextViaChat(text, targetLangInstruction) {
        var cfg = getDataChatConfig();
        if (!cfg.apiKey || !cfg.endpoint || !cfg.model) {
            return Promise.resolve("");
        }
        var body = {
            model: cfg.model,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional translator. Output ONLY the translated text. No quotes, labels, or explanations. Preserve line breaks and numbering."
                },
                {
                    role: "user",
                    content:
                        "Translate the following into " +
                        String(targetLangInstruction || "English") +
                        ":\n\n" +
                        String(text || "")
                }
            ],
            temperature: 0.15,
            max_tokens: 8192
        };
        return global
            .fetch(cfg.endpoint, {
                method: "POST",
                headers: { Authorization: "Bearer " + cfg.apiKey, "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            .then(function (r) {
                if (!r.ok) throw new Error("chat tr " + r.status);
                return r.json();
            })
            .then(function (data) {
                return String(extractArkContent(data) || "").trim();
            });
    }

    function normalizeTranslationEngineCode(code) {
        var c = String(code || "")
            .trim()
            .toLowerCase()
            .replace(/_/g, "-");
        var map = {
            zh: "zh",
            "zh-cn": "zh",
            "zh-tw": "zh",
            "zh-hans": "zh",
            en: "en",
            "en-us": "en",
            "en-gb": "en",
            ja: "ja",
            ko: "ko",
            fr: "fr",
            de: "de",
            es: "es",
            pt: "pt",
            "pt-br": "pt",
            it: "it",
            ru: "ru",
            ar: "ar",
            th: "th",
            vi: "vi",
            id: "id",
            ms: "ms",
            fil: "fil",
            tl: "fil",
            my: "my",
            km: "km",
            lo: "lo",
            hi: "hi",
            tr: "tr",
            pl: "pl",
            nl: "nl",
            uk: "uk",
            el: "el",
            he: "he",
            sv: "sv",
            da: "da",
            fi: "fi",
            no: "nb",
            nb: "nb",
            nn: "nb",
            cs: "cs",
            ro: "ro",
            hu: "hu",
            bn: "bn",
            ur: "ur",
            fa: "fa"
        };
        if (map[c]) return map[c];
        if (c.length >= 2) return c.slice(0, 2);
        return c;
    }

    function translatePlainText(text, options) {
        options = options || {};
        var raw = String(text || "").trim();
        if (!raw) return Promise.resolve("");
        var src = normalizeTranslationEngineCode(options.source || "zh");
        var tgt = normalizeTranslationEngineCode(options.target || "en");
        var tgtLabel = String(options.targetName || options.targetDisplay || "").trim();
        if (!tgtLabel) tgtLabel = "English";
        if (src === tgt) return Promise.resolve(raw);
        var tCfg = getTranslationResponsesConfig();
        var useResp =
            tCfg.enabled !== false &&
            tCfg.endpoint &&
            tCfg.model &&
            tCfg.apiKey;
        function chatFallback() {
            return translatePlainTextViaChat(raw, tgtLabel).catch(function () {
                return "";
            });
        }
        if (!useResp) {
            return chatFallback();
        }
        return callArkResponsesTranslate(raw, src, tgt, tCfg)
            .then(function (out) {
                var s = String(out || "").trim();
                if (s) return s;
                return chatFallback();
            })
            .catch(function () {
                return chatFallback();
            });
    }

    function translateFields(rows, fieldNames) {
        return translateObjectsViaArk(rows || [], fieldNames || [], getLocale());
    }

    function maybeFetchApiBundle(targetLocale) {
        var normalize = normalizeLocale(targetLocale);
        if (normalize === "zh-CN") return;
        if (BUNDLES[normalize] && Object.keys(BUNDLES[normalize]).length > 40) return;
        var zh = BUNDLES["zh-CN"] || {};
        var keys = Object.keys(zh);
        var sample = {};
        keys.slice(0, 80).forEach(function (k) {
            sample[k] = zh[k];
        });
        var tCfg = getTranslationResponsesConfig();
        var tgt = localeToTranslationLangForResponses(normalize);
        var useResponses = !!(
            tCfg.enabled !== false &&
            tCfg.endpoint &&
            tCfg.model &&
            tCfg.apiKey &&
            tgt &&
            tgt !== "zh"
        );

        function mergeAndApply(dict) {
            if (!dict || typeof dict !== "object") return;
            apiMerged[normalize] = Object.assign(loadApiCache(normalize), dict);
            saveApiCache(normalize, apiMerged[normalize]);
            setLocale(normalize, { fromApi: true, dict: dict });
        }

        function fetchBundleViaChat() {
            var cfg = getDataChatConfig();
            if (!cfg.apiKey || !cfg.model) return Promise.resolve();
            var langName = targetLangNameForApi(normalize);
            var body = {
                model: cfg.model,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a UI translator. Output only valid JSON object, same keys as input, translated values. No markdown."
                    },
                    {
                        role: "user",
                        content:
                            "Translate the following UI strings to " +
                            langName +
                            ". Keep keys unchanged, translate string values only. JSON only:\n" +
                            JSON.stringify(sample)
                    }
                ],
                temperature: 0.2,
                max_tokens: 8192
            };
            return global
                .fetch(cfg.endpoint, {
                    method: "POST",
                    headers: { Authorization: "Bearer " + cfg.apiKey, "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })
                .then(function (r) {
                    if (!r.ok) throw new Error("i18n API " + r.status);
                    return r.json();
                })
                .then(function (data) {
                    var text = extractArkContent(data);
                    var dict = parseJsonFromText(text);
                    if (!dict || typeof dict !== "object") return;
                    mergeAndApply(dict);
                });
        }

        var jsonLine = JSON.stringify(sample);
        var responsesHint =
            "The following is JSON. Keep all keys exactly unchanged. Translate only Chinese in string values. Output valid JSON with the same keys:\n";

        if (useResponses) {
            return callArkResponsesTranslate(responsesHint + jsonLine, "zh", tgt, tCfg)
                .then(function (text) {
                    var dict = parseJsonFromText(text);
                    if (!dict || typeof dict !== "object") throw new Error("i18n responses parse");
                    mergeAndApply(dict);
                })
                .catch(function () {
                    return fetchBundleViaChat();
                })
                .catch(function () {});
        }
        return fetchBundleViaChat().catch(function () {});
    }

    function boot() {
        var loc = getLocale();
        if (global.document.documentElement) {
            global.document.documentElement.lang = htmlLangFromLocale(loc);
        }
        applyLocaleBodyClasses(loc);
        apiMerged[loc] = Object.assign(loadApiCache(loc), apiMerged[loc] || {});
        LOCALE_CHOICES.forEach(function (opt) {
            if (!apiMerged[opt.code]) apiMerged[opt.code] = loadApiCache(opt.code);
        });
        bindHeaderMenu();
        mountFloatingSwitcher();
        applyDom(global.document);
        var tKey = global.document.body && global.document.body.getAttribute("data-i18n-title");
        if (tKey) {
            try {
                global.document.title = t(tKey);
            } catch (eT) {}
        }
        updateSwitcherLabels();
        scheduleLayoutCalibration();
        if (!global.__yuxiaoqiaoResizeCalib) {
            global.__yuxiaoqiaoResizeCalib = true;
            var resizeCalibTimer = null;
            global.addEventListener(
                "resize",
                function () {
                    if (resizeCalibTimer) {
                        try {
                            global.clearTimeout(resizeCalibTimer);
                        } catch (eCr) {}
                    }
                    resizeCalibTimer = global.setTimeout(function () {
                        resizeCalibTimer = null;
                        scheduleLayoutCalibration();
                    }, 140);
                },
                { passive: true }
            );
        }
    }

    global.I18n = {
        STORAGE_KEY: STORAGE_KEY,
        EVENT_NAME: EVENT_NAME,
        LOCALE_CHOICES: LOCALE_CHOICES,
        BUNDLES: BUNDLES,
        getLocale: getLocale,
        setLocale: setLocale,
        t: t,
        applyDom: applyDom,
        boot: boot,
        scheduleLayoutCalibration: scheduleLayoutCalibration,
        runLayoutCalibrationPass: runLayoutCalibrationPass,
        maybeFetchApiBundle: maybeFetchApiBundle,
        normalizeLocale: normalizeLocale,
        htmlLangFromLocale: htmlLangFromLocale,
        targetLangNameForApi: targetLangNameForApi,
        getPromptLanguageInstruction: getPromptLanguageInstruction,
        translateCoreRows: translateCoreRows,
        translateIndustryRows: translateIndustryRows,
        translateMerchantRows: translateMerchantRows,
        translateFields: translateFields,
        translatePlainText: translatePlainText,
        localizePlaceName: localizePlaceName,
        localizeMerchantType: localizeMerchantType
    };
})(typeof window !== "undefined" ? window : this);
