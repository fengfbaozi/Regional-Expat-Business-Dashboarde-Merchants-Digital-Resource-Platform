document.addEventListener("DOMContentLoaded", async function () {
    const mapShared = window.MapShared || {};
    const dataOverviewPanel = document.querySelector(".data-overview-panel");
    const dynamicPanel = document.querySelector(".left-panel .dynamic");
    const demandPanel = document.querySelector(".left-panel .demand");
    let demandScrollTimer = null;
    const corePanel = document.querySelector(".right-panel .core-services");
    const industryBoard = document.querySelector(".industry-board");
    const homeMapEl = document.getElementById("homeBaiduMap");
    const homeMapPanel = document.getElementById("homeMapPanel");
    const homeMapLoadingMaskEl = document.getElementById("homeMapLoadingMask");
    function setHomeMapLoading(loading) {
        if (!homeMapLoadingMaskEl) return;
        homeMapLoadingMaskEl.classList.toggle("is-hidden", !loading);
    }


    const offline = window.location.protocol === "file:";
    const offlineData = window.APP_DATASETS || {};
    // 版本号变化时主动清理 localStorage 缓存，强制重新拉取最新数据
    try {
        if (window.MapPreload && typeof window.MapPreload.VERSION !== "undefined" && window.MapPreload.VERSION !== 1) {
            var _ver = JSON.parse(window.localStorage.getItem("yuxiaoqiao_map_ver") || "null");
            if (!_ver || _ver.v !== window.MapPreload.VERSION) {
                window.MapPreload.clearAll();
            }
        }
    } catch (_e) {}
    const DEFAULT_OVERVIEW_TEMPLATE = [
        { label: "海外侨胞" },
        { label: "侨务企业" },
        { label: "侨团组织" },
        { label: "侨务项目" },
        { label: "覆盖国家" },
        { label: "活跃侨情" }
    ];

    const dateText = document.getElementById("localDateText");
    const weatherText = document.getElementById("localWeatherText");

    function padTime2(n) {
        return String(n).padStart(2, "0");
    }

    function weatherForI18n() {
        if (!window.I18n) {
            return window.AppDataUtils ? window.AppDataUtils.localWeatherText() : "";
        }
        const now = new Date();
        const m = now.getMonth() + 1;
        const h = now.getHours();
        const T = window.I18n.t.bind(window.I18n);
        if (h >= 6 && h <= 18) {
            if (m >= 5 && m <= 9) return T("weather.dayHot");
            if (m >= 10 && m <= 11) return T("weather.dayCloud");
            if (m <= 2 || m === 12) return T("weather.dayCool");
            return T("weather.dayMild");
        }
        return T("weather.night");
    }

    function refreshHeaderClock() {
        if (dateText && window.I18n) {
            const now = new Date();
            const wk = window.I18n.t("week." + now.getDay());
            dateText.textContent =
                now.getFullYear() +
                "-" +
                padTime2(now.getMonth() + 1) +
                "-" +
                padTime2(now.getDate()) +
                " " +
                wk +
                " " +
                padTime2(now.getHours()) +
                ":" +
                padTime2(now.getMinutes()) +
                ":" +
                padTime2(now.getSeconds());
        } else if (dateText && window.AppDataUtils && typeof window.AppDataUtils.localDateTimeText === "function") {
            dateText.textContent = window.AppDataUtils.localDateTimeText();
        } else if (dateText && window.AppDataUtils) {
            dateText.textContent = window.AppDataUtils.localDateText();
        }
    }
    refreshHeaderClock();
    window.setInterval(refreshHeaderClock, 1000);
    if (weatherText) weatherText.textContent = weatherForI18n();

    function localizeOverviewRows(rows) {
        if (!window.I18n || window.I18n.getLocale() === "zh-CN") return rows;
        const map = {
            海外侨胞: window.I18n.t("overview.merchants"),
            侨务企业: window.I18n.t("overview.enterprises"),
            侨团组织: window.I18n.t("overview.orgs"),
            侨务项目: window.I18n.t("overview.projects"),
            覆盖国家: window.I18n.t("overview.countries"),
            活跃侨情: window.I18n.t("overview.active")
        };
        return rows.map(function (item) {
            const lb = String(item.label || "").trim();
            const nextLabel = map[lb] || item.label;
            return Object.assign({}, item, { label: nextLabel });
        });
    }


    function applyAutoCalibration() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const ratio = w / h;
        let mode = "normal";
        if (ratio >= 2.2) mode = "ultra-wide";
        else if (ratio >= 1.85) mode = "wide";
        else if (ratio <= 1.45) mode = "compact";
        document.body.setAttribute("data-calibration", mode);
    }
    applyAutoCalibration();
    window.addEventListener("resize", applyAutoCalibration);

    if (window.I18n) window.I18n.boot();

    const homeBmapWarmPromise =
        homeMapEl &&
        String(window.__BAIDU_MAP_AK || "").trim() &&
        typeof mapShared.ensureBMapReady === "function"
            ? mapShared.ensureBMapReady(12000)
            : null;

    async function loadCsvRows(path, offlineRows) {
        if (offline) return offlineRows || [];
        if (!path) return offlineRows || [];
        try {
            if (window.MapPreload && typeof window.MapPreload.getCache === "function") {
                const cachedRows = window.MapPreload.getCache("csv:" + path);
                if (Array.isArray(cachedRows) && cachedRows.length > 0) {
                    return cachedRows;
                }
            }
        } catch (e0) {}
        try {
            const rows = await window.AppDataUtils.loadCsv(path);
            if (Array.isArray(rows) && rows.length > 0) {
                try {
                    if (window.MapPreload && typeof window.MapPreload.setCache === "function") {
                        window.MapPreload.setCache("csv:" + path, rows);
                    }
                } catch (e1) {}
            }
            return rows;
        } catch (e) {
            return offlineRows || [];
        }
    }

    let dynamicCarouselRotateTimer = null;

    function clearDynamicCarouselRotateTimer() {
        if (dynamicCarouselRotateTimer != null) {
            window.clearInterval(dynamicCarouselRotateTimer);
            dynamicCarouselRotateTimer = null;
        }
    }

    function pickQiaowuDisplayTitle(row) {
        var loc = window.I18n && window.I18n.getLocale ? window.I18n.getLocale() : "zh-CN";
        if (window.AppDataUtils && typeof window.AppDataUtils.pickQiaowuLocalizedTitle === "function") {
            return window.AppDataUtils.pickQiaowuLocalizedTitle(row, loc);
        }
        if (window.I18n && loc === "en-US") {
            var en = String(row.title_en || "").trim();
            if (en) return en;
        }
        return String(row.title || "").trim();
    }

    function pickQiaowuDisplaySummary(row) {
        var loc = window.I18n && window.I18n.getLocale ? window.I18n.getLocale() : "zh-CN";
        if (window.AppDataUtils && typeof window.AppDataUtils.pickQiaowuLocalizedSummary === "function") {
            return window.AppDataUtils.pickQiaowuLocalizedSummary(row, loc);
        }
        if (window.I18n && loc === "en-US") {
            var en = String(row.summary_en || "").trim();
            if (en) return en;
        }
        return String(row.summary || "").trim();
    }

    function sourceLabelFromNewsUrl(url) {
        var key = "src.local";
        if (url) {
            try {
                const h = new URL(url).hostname;
                if (h.includes("yqzwx.com")) key = "src.yqzwx";
                else if (h.includes("yulin.gov.cn")) key = "src.gov.yulin";
                else if (h.includes("gxylnews.com")) key = "src.gxylnews";
            } catch (e) {}
        }
        if (window.I18n && typeof window.I18n.t === "function") return window.I18n.t(key);
        if (key === "src.yqzwx") return "玉侨子午线";
        if (key === "src.gov.yulin") return "玉林市政府网";
        if (key === "src.gxylnews") return "玉林新闻网";
        return "本地资讯";
    }

    function mapQiaowuJsonToDynamic(rows) {
        const stableId =
            window.AppDataUtils && typeof window.AppDataUtils.qiaowuStableId === "function"
                ? window.AppDataUtils.qiaowuStableId
                : function (u) {
                      return "qiaowu-" + String(u).length;
                  };
        return (rows || [])
            .map(function (row) {
                const url = String(row.url || "").trim();
                const title = pickQiaowuDisplayTitle(row);
                if (!title || !url) return null;
                const sum = pickQiaowuDisplaySummary(row);
                const ex = String(row.excerpt || "").trim();
                const full = String(row.content || row.full_text || "").trim();
                const shortForCarousel = full
                    ? full.length > 260
                        ? full.slice(0, 260) + "…"
                        : full
                    : [sum, ex].filter(Boolean).join(" ").trim() ||
                      sum ||
                      (title.length > 180 ? title.slice(0, 180) + "…" : title);
                const locTr = window.I18n && window.I18n.getLocale ? window.I18n.getLocale() : "zh-CN";
                const hasBundledTitle =
                    locTr !== "zh-CN" &&
                    (String(row.title_en || "").trim() ||
                        (row.i18n &&
                            row.i18n[locTr] &&
                            String((row.i18n[locTr].title || row.i18n[locTr].headline || "") || "").trim()));
                const skipTr = Boolean(window.I18n && hasBundledTitle);
                return {
                    id: stableId(url),
                    title: title,
                    summary: sum,
                    excerpt: ex,
                    fullContent: full,
                    bodyText: shortForCarousel,
                    date: String(row.time || row.date || "").trim(),
                    source: sum || sourceLabelFromNewsUrl(url),
                    content: full || shortForCarousel,
                    externalUrl: url,
                    _skipCarouselTranslate: skipTr
                };
            })
            .filter(Boolean);
    }

    function dynamicDateKey(dateStr) {
        const m = String(dateStr || "").match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return 0;
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
    }

    function sortQiaowuDynamicItems(items) {
        return (items || []).slice().sort(function (a, b) {
            return dynamicDateKey(b.date) - dynamicDateKey(a.date);
        });
    }

    const MAP_SCOPE_COUNTRIES = new Set(["泰国", "越南", "马来西亚", "新加坡", "印度尼西亚", "菲律宾", "柬埔寨", "老挝", "缅甸", "文莱", "东帝汶"]);
    const MAP_SCOPE_CHINA_CITIES = new Set(["玉林", "南宁", "柳州", "桂林", "北海"]);

    function normalizeMerchantRows(rows) {
        if (typeof mapShared.normalizeRows === "function") return mapShared.normalizeRows(rows || []);
        return (rows || [])
            .map((r) => ({
                city: String(r.city || "").trim(),
                country: String(r.country || "").trim(),
                lat: Number(r.lat),
                lng: Number(r.lng),
                merchant_type: String(r.merchant_type || "其他").trim() || "其他",
                merchant_name: String(r.merchant_name || "").trim(),
                merchant_desc: String(r.merchant_desc || "").trim(),
                contact: String(r.contact || "").trim()
            }))
            .filter((r) => r.city && r.country && Number.isFinite(r.lat) && Number.isFinite(r.lng) && r.merchant_name);
    }

    function filterMapScopedMerchants(rows) {
        const normalized = normalizeMerchantRows(rows);
        const allowedCountries = new Set(normalized.map((r) => r.country).filter(Boolean));
        MAP_SCOPE_COUNTRIES.forEach((c) => allowedCountries.add(c));
        allowedCountries.add("中国");
        return normalized.filter((row) => {
            if (!row.country || !allowedCountries.has(row.country)) return false;
            if (row.country === "中国") return MAP_SCOPE_CHINA_CITIES.has(row.city);
            return true;
        });
    }

    function normalizeOverviewLabel(label) {
        const s = String(label || "").trim();
        if (/海外侨胞|侨商/.test(s)) return "海外侨胞";
        if (/侨企|企业/.test(s) && !/组织/.test(s)) return "侨务企业";
        if (/侨团|组织/.test(s)) return "侨团组织";
        if (/项目/.test(s)) return "侨务项目";
        if (/国家/.test(s)) return "覆盖国家";
        if (/活跃|城市|节点/.test(s)) return "活跃侨情";
        return s || "概况";
    }

    function pickOverviewRows(baseRows, mapRows) {
        const rows = Array.isArray(baseRows) && baseRows.length ? baseRows : DEFAULT_OVERVIEW_TEMPLATE;
        const templateRows = rows.length
            ? rows.map(function (r) {
                  return {
                      label: normalizeOverviewLabel(r.label || r.name),
                      value: r.value
                  };
              })
            : [];
        return buildLinkedOverviewRows(templateRows, mapRows);
    }

    function buildLinkedOverviewRows(baseRows, mapRows) {
        const merchantCount = mapRows.length;
        const enterpriseKeyFn =
            typeof mapShared.getEnterpriseKey === "function"
                ? mapShared.getEnterpriseKey
                : function (m) {
                      return `${m.country}|${m.city}|${m.merchant_type}`;
                  };
        const enterpriseCount = new Set(mapRows.map((m) => enterpriseKeyFn(m))).size;
        const countryCount = new Set(mapRows.map((m) => m.country)).size;
        const cityCount = new Set(mapRows.map((m) => `${m.city}|${m.country}`)).size;
        const typeCount = new Set(mapRows.map((m) => m.merchant_type)).size;
        const orgCount = Math.max(6, Math.round(countryCount * 2.2));
        const projectCount = Math.max(12, Math.round(enterpriseCount * 0.35));

        const fallback = [
            { label: "海外侨胞", value: merchantCount },
            { label: "侨务企业", value: enterpriseCount },
            { label: "侨团组织", value: orgCount },
            { label: "侨务项目", value: projectCount },
            { label: "覆盖国家", value: countryCount },
            { label: "活跃侨情", value: cityCount }
        ];
        const source = Array.isArray(baseRows) && baseRows.length ? baseRows : fallback;

        return source.map((item) => {
            const label = String(item.label || "").trim();
            if (/侨胞|侨商|人数/.test(label)) return { ...item, value: merchantCount };
            if (/侨企|企业/.test(label)) return { ...item, value: enterpriseCount };
            if (/侨团|组织/.test(label)) return { ...item, value: orgCount };
            if (/项目/.test(label)) return { ...item, value: projectCount };
            if (/国家/.test(label)) return { ...item, value: countryCount };
            if (/活跃|城市|节点/.test(label)) return { ...item, value: cityCount };
            if (/类型|业态/.test(label)) return { ...item, value: typeCount };
            return { ...item, value: item.value };
        });
    }

    function renderOverview(items) {
        dataOverviewPanel.innerHTML = "";
        const T = window.I18n ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        if (!items.length) {
            dataOverviewPanel.textContent = window.I18n ? window.I18n.t("overview.empty") : "暂无概况数据";
            return;
        }
        const visualPresets = [
            { icon: "images/icons/overview-globe.svg", subtitle: "OVERSEAS CHINESE", unit: T("overview.unit.person") },
            { icon: "images/icons/overview-building.svg", subtitle: "OVERSEAS ENTERPRISES", unit: T("overview.unit.enterprise") },
            { icon: "images/icons/overview-shield.svg", subtitle: "ASSOCIATION GROUPS", unit: T("overview.unit.org") },
            { icon: "images/icons/overview-pin.svg", subtitle: "SERVICE PROJECTS", unit: T("overview.unit.project") },
            { icon: "images/icons/overview-map.svg", subtitle: "COVERED COUNTRIES", unit: T("overview.unit.country") },
            { icon: "images/icons/overview-trend.svg", subtitle: "ACTIVE CASES", unit: T("overview.unit.case") }
        ];

        function formatNumeric(rawValue) {
            const pureNum = Number(String(rawValue).replace(/,/g, ""));
            if (Number.isFinite(pureNum)) return pureNum.toLocaleString("en-US");
            return rawValue || "--";
        }

        items.forEach((item, index) => {
            const preset = visualPresets[index % visualPresets.length];
            const div = document.createElement("div");
            div.className = "data-item";
            div.innerHTML = `
                <span class="data-icon-stage" aria-hidden="true">
                    <span class="data-icon">
                        <img class="data-icon-img" src="${preset.icon}" width="56" height="56" alt="">
                    </span>
                </span>
                <span class="data-copy">
                    <span class="data-label">${item.label || ""}</span>
                    <span class="data-subtitle">${preset.subtitle}</span>
                    <span class="data-value">${formatNumeric(item.value)}<span class="data-unit">${preset.unit}</span></span>
                </span>
            `;
            dataOverviewPanel.appendChild(div);
        });
    }

    function renderDynamicLoadingSkeleton() {
        if (!dynamicPanel) return;
        clearDynamicCarouselRotateTimer();
        const T = window.I18n ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        dynamicPanel.innerHTML =
            '<div class="panel-head"><h2 data-i18n="panel.news">' +
            T("panel.news") +
            '</h2></div><p class="dynamic-loading-hint" data-i18n="dynamic.loading">' +
            T("dynamic.loading") +
            "</p>";
    }

    // —— 侨情动态轮播：共享持久状态，避免每次重渲染重建闭包 ——
    const carousel = {
        items: [],
        activeIndex: 0,
        intervalId: null,
        built: false,
        titleEl: null,
        summaryEl: null,
        metaEl: null,
        linkEl: null,
        dotEls: []
    };

    function stopCarouselTimer() {
        if (carousel.intervalId != null) {
            window.clearInterval(carousel.intervalId);
            carousel.intervalId = null;
        }
    }

    function startCarouselTimer() {
        stopCarouselTimer();
        carousel.intervalId = window.setInterval(function () {
            if (!carousel.items || !carousel.items.length) return;
            carousel.activeIndex = (carousel.activeIndex + 1) % carousel.items.length;
            renderCurrentCarouselItem(true);
        }, 3000);
    }

    function renderCurrentCarouselItem(withFade) {
        const item = carousel.items[carousel.activeIndex];
        if (!item) return;
        if (!carousel.titleEl || !carousel.summaryEl) return;

        const T = window.I18n ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        const rawTitle = String(item.title || T("dynamic.unnamed")).trim();
        const body = String(item.bodyText || item.summary || "").trim();
        let displayBody = body;
        if (!displayBody || displayBody === rawTitle) {
            displayBody = T("dynamic.bodyFallback");
        }
        const metaText = `${item.date || ""}${item.source ? " | " + item.source : ""}`;
        const sid = String(item.id || "").trim();

        function apply() {
            if (carousel.titleEl) carousel.titleEl.textContent = rawTitle || T("dynamic.unnamed");
            if (carousel.summaryEl) carousel.summaryEl.textContent = displayBody;
            if (carousel.metaEl) carousel.metaEl.textContent = metaText;
            if (carousel.linkEl) {
                carousel.linkEl.href = sid ? `pages/dynamic.html#${sid}` : "pages/dynamic.html";
                carousel.linkEl.removeAttribute("target");
            }
            carousel.dotEls.forEach(function (el, i) {
                if (el) el.classList.toggle("active", i === carousel.activeIndex);
            });
        }

        if (withFade && carousel.titleEl && carousel.summaryEl && carousel.metaEl) {
            [carousel.titleEl, carousel.summaryEl, carousel.metaEl].forEach(function (el) {
                el.classList.add("is-switching");
            });
            window.setTimeout(function () {
                apply();
                window.setTimeout(function () {
                    [carousel.titleEl, carousel.summaryEl, carousel.metaEl].forEach(function (el) {
                        el.classList.remove("is-switching");
                    });
                }, 30);
            }, 240);
        } else {
            apply();
        }
    }

    function renderDynamicCarousel(items) {
        if (!dynamicPanel) return;
        const T = window.I18n ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        const list = Array.isArray(items) ? items : [];

        if (!list.length) {
            stopCarouselTimer();
            carousel.built = false;
            carousel.items = [];
            carousel.activeIndex = 0;
            dynamicPanel.innerHTML =
                '<div class="panel-head"><h2 data-i18n="panel.news">' +
                T("panel.news") +
                '</h2></div><p class="dynamic-empty-hint" data-i18n="dynamic.empty.hint">' +
                T("dynamic.empty.hint") +
                "</p>";
            return;
        }

        carousel.items = list;

        // 只有两种情况重建结构：1) 尚未构建；2) 已有结构但圆点数量不匹配
        const existingCarousel = dynamicPanel.querySelector(".dynamic-carousel");
        const existingDots = existingCarousel ? existingCarousel.querySelectorAll(".dynamic-dot") : null;
        const needsBuild = !existingCarousel || !existingDots || existingDots.length !== list.length;

        if (needsBuild) {
            const now = new Date();
            const syncStr =
                String(now.getHours()).padStart(2, "0") +
                ":" +
                String(now.getMinutes()).padStart(2, "0") +
                ":" +
                String(now.getSeconds()).padStart(2, "0");
            dynamicPanel.innerHTML =
                '<div class="panel-head">' +
                    '<h2 data-i18n="panel.news">' + T("panel.news") + "</h2>" +
                    '<span class="dynamic-sync-meta" id="homeDynamicSyncMeta">' +
                        T("dynamic.syncMeta", { time: syncStr }) +
                    "</span>" +
                "</div>" +
                '<div class="dynamic-carousel">' +
                    '<div class="dynamic-content">' +
                        '<div class="dynamic-title"></div>' +
                        '<div class="dynamic-meta"></div>' +
                        '<div class="dynamic-summary"></div>' +
                    "</div>" +
                    '<div class="dynamic-actions">' +
                        '<a class="dynamic-link dynamic-link-read" href="#" data-i18n="dynamic.read">' +
                            T("dynamic.read") +
                        "</a>" +
                    "</div>" +
                    '<div class="dynamic-dots"></div>' +
                "</div>";

            carousel.titleEl = dynamicPanel.querySelector(".dynamic-title");
            carousel.summaryEl = dynamicPanel.querySelector(".dynamic-summary");
            carousel.metaEl = dynamicPanel.querySelector(".dynamic-meta");
            carousel.linkEl = dynamicPanel.querySelector(".dynamic-link-read");
            const dotsContainer = dynamicPanel.querySelector(".dynamic-dots");
            if (dotsContainer) {
                var dotsHtml = "";
                for (var i = 0; i < list.length; i++) {
                    dotsHtml += '<span class="dynamic-dot' + (i === 0 ? " active" : "") + '" data-index="' + i + '"></span>';
                }
                dotsContainer.innerHTML = dotsHtml;
                carousel.dotEls = Array.prototype.slice.call(dotsContainer.querySelectorAll(".dynamic-dot"));
                carousel.dotEls.forEach(function (dot) {
                    dot.addEventListener("click", function () {
                        var idx = Number(dot.getAttribute("data-index"));
                        if (!Number.isNaN(idx)) {
                            carousel.activeIndex = idx;
                            renderCurrentCarouselItem(true);
                            startCarouselTimer();
                        }
                    });
                });
            }

            carousel.built = true;
            renderCurrentCarouselItem(false);
            startCarouselTimer();
        } else {
            // 结构已存在且数量匹配 —— 只更新内容，不动 DOM 结构和定时器
            renderCurrentCarouselItem(carousel.activeIndex > 0);
        }
    }

    function localizeDemandRowsForHome(items) {
        if (!window.I18n || window.I18n.getLocale() === "zh-CN") return items;
        const T = window.I18n.t.bind(window.I18n);
        const statusKeys = {
            待处理: "demand.status.pending",
            推进中: "demand.status.progress",
            已完成: "demand.status.done"
        };
        return items.map(function (r) {
            const id = String(r.id || "")
                .replace(/^\uFEFF/, "")
                .trim();
            const o = Object.assign({}, r);
            const tk = "demand.item." + id + ".title";
            const sk = "demand.item." + id + ".summary";
            const tt = T(tk);
            const st = T(sk);
            if (tt !== tk) o.title = tt;
            if (st !== sk) o.summary = st;
            const statusZh = String(r.status || "").trim();
            const skey = statusKeys[statusZh];
            if (skey) {
                const stx = T(skey);
                if (stx !== skey) o.status = stx;
            }
            return o;
        });
    }

    // —— 侨务需求轮播：持久状态 + 经典循环轮播，不再重建整卡 DOM ——
    const demandState = {
        items: [],
        startIndex: 0,
        trackEl: null,
        animating: false,
        timer: null,
        hasStructure: false
    };

    function stopDemandTimer() {
        if (demandState.timer != null) {
            window.clearInterval(demandState.timer);
            demandState.timer = null;
        }
    }

    function startDemandTimer() {
        stopDemandTimer();
        if (!demandState.items.length || !demandState.trackEl) return;
        demandState.timer = window.setInterval(demandScrollStep, 2400);
    }

    function demandItemAt(offset) {
        if (!demandState.items.length) return null;
        const n = demandState.items.length;
        return demandState.items[(demandState.startIndex + offset) % n];
    }

    function createDemandCard(item) {
        const card = document.createElement("article");
        card.className = "demand-item";
        const img = document.createElement("img");
        img.src = item.image || "images/placeholders/generic-placeholder.svg";
        img.alt = item.title || "侨务需求";
        img.onerror = function () {
            img.onerror = null;
            img.src = "images/placeholders/generic-placeholder.svg";
        };
        const body = document.createElement("div");
        body.className = "demand-item-body";
        const title = document.createElement("div");
        title.className = "demand-item-title";
        title.textContent = item.title || "";
        const summary = document.createElement("div");
        summary.className = "demand-item-summary";
        summary.textContent = item.summary || "";
        const status = document.createElement("div");
        status.className = "demand-item-status";
        status.textContent = item.status || "";
        body.appendChild(title);
        body.appendChild(summary);
        body.appendChild(status);
        card.appendChild(img);
        card.appendChild(body);
        return card;
    }

    function updateDemandCardContent(card, item) {
        if (!card || !item) return;
        const img = card.querySelector("img");
        if (img) {
            const src = item.image || "images/placeholders/generic-placeholder.svg";
            if (img.src !== src) {
                img.src = src;
            }
        }
        const title = card.querySelector(".demand-item-title");
        if (title) title.textContent = item.title || "";
        const summary = card.querySelector(".demand-item-summary");
        if (summary) summary.textContent = item.summary || "";
        const status = card.querySelector(".demand-item-status");
        if (status) status.textContent = item.status || "";
    }

    function demandScrollStep() {
        if (!demandState.trackEl || demandState.animating) return;
        demandState.animating = true;
        // 启动向上平移动画，由 CSS transition 控制 0.48s
        demandState.trackEl.style.transition = "transform 0.48s ease";
        requestAnimationFrame(function () {
            demandState.trackEl.style.transform = "translateY(calc(-1 * var(--demand-step)))";
        });
        demandState.trackEl.addEventListener(
            "transitionend",
            function onEnd() {
                demandState.trackEl.removeEventListener("transitionend", onEnd);
                if (!demandState.trackEl) { demandState.animating = false; return; }
                // 动画结束：静默重置位置 + 把第一张卡片挪到末尾，尾部追一张新预读卡
                demandState.trackEl.style.transition = "none";
                demandState.trackEl.style.transform = "translateY(0)";
                const firstChild = demandState.trackEl.firstElementChild;
                if (firstChild) demandState.trackEl.removeChild(firstChild);
                demandState.startIndex = (demandState.startIndex + 1) % demandState.items.length;
                // 在尾部追加新预读卡（当前可见窗口第 4 张，即 startIndex + 3）
                const nextLookahead = demandItemAt(3);
                if (nextLookahead) demandState.trackEl.appendChild(createDemandCard(nextLookahead));
                demandState.animating = false;
            },
            { once: true }
        );
    }

    function buildDemandStructure(items) {
        const T = window.I18n ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        demandPanel.innerHTML =
            '<div class="panel-head"><h2 data-i18n="panel.demand">' + T("panel.demand") + '</h2></div>' +
            '<div class="demand-scroll-window">' +
                '<div class="demand-scroll-track"></div>' +
            '</div>';
        demandState.trackEl = demandPanel.querySelector(".demand-scroll-track");
        demandState.startIndex = 0;
        // 构建 4 张卡：3 张可见 + 1 张预读（在动画中从底部滑入）
        for (let i = 0; i < 4 && i < items.length; i++) {
            demandState.trackEl.appendChild(createDemandCard(demandItemAt(i)));
        }
        demandState.hasStructure = true;
    }

    function refreshDemandCardText() {
        if (!demandState.trackEl) return;
        const children = demandState.trackEl.children;
        for (let i = 0; i < children.length; i++) {
            updateDemandCardContent(children[i], demandItemAt(i));
        }
    }

    function renderDemand(items) {
        if (!demandPanel) return;
        const list = localizeDemandRowsForHome(items || []);
        const T = window.I18n ? window.I18n.t.bind(window.I18n) : function (k) { return k; };

        if (!list.length) {
            stopDemandTimer();
            demandState.items = [];
            demandState.hasStructure = false;
            demandPanel.innerHTML =
                "<h2 data-i18n=\"panel.demand\">" + T("panel.demand") + "</h2><p>" + T("demand.empty") + "</p>";
            return;
        }

        demandState.items = list;

        // 场景 1：面板结构不存在 —— 首次构建
        if (!demandState.hasStructure || !demandState.trackEl) {
            buildDemandStructure(list);
            startDemandTimer();
            return;
        }

        // 场景 2：结构已存在但轨道内卡片数 ≠ 4 —— 重建轨道
        if (demandState.trackEl.children.length !== 4) {
            while (demandState.trackEl.firstChild) {
                demandState.trackEl.removeChild(demandState.trackEl.firstChild);
            }
            demandState.trackEl.style.transition = "none";
            demandState.trackEl.style.transform = "translateY(0)";
            demandState.startIndex = 0;
            for (let i = 0; i < 4 && i < list.length; i++) {
                demandState.trackEl.appendChild(createDemandCard(demandItemAt(i)));
            }
            startDemandTimer();
            return;
        }

        // 场景 3：结构与卡片数都正确 —— 只更新现有卡片的文本/图片内容
        refreshDemandCardText();
        // 如果定时器停了（例如语言切换期间），重启
        if (demandState.timer == null) startDemandTimer();
    }

    function localizeCoreRowsForHome(items) {
        if (!window.I18n || window.I18n.getLocale() === "zh-CN") return items;
        const T = window.I18n.t.bind(window.I18n);
        return items.map(function (r) {
            const id = String(r.id || "")
                .replace(/^\uFEFF/, "")
                .trim();
            const nk = "core.svc." + id + ".name";
            const dk = "core.svc." + id + ".desc";
            const o = Object.assign({}, r);
            const tn = T(nk);
            const td = T(dk);
            if (tn !== nk) o.name = tn;
            if (td !== dk) o.description = td;
            return o;
        });
    }

    function renderCoreServices(items) {
        if (!corePanel) return;
        const T = window.I18n ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        if (!items.length) {
            corePanel.innerHTML =
                "<h2 data-i18n=\"panel.core\">" + T("panel.core") + "</h2><p>" + T("core.empty") + "</p>";
            return;
        }
        const wantedIds = ["svc-006", "svc-004", "svc-002", "svc-003"];
        const localized = localizeCoreRowsForHome(items);
        const primaryItems = wantedIds
            .map(function (id) { return localized.find(function (x) { return x.id === id; }); })
            .filter(Boolean);
        corePanel.innerHTML = `
            <div class="panel-head"><h2 data-i18n="panel.core">${T("panel.core")}</h2><a class="panel-more" href="pages/core-services.html" data-i18n="panel.coreAll">${T("panel.coreAll")}</a></div>
            <div class="core-service-grid">
                ${primaryItems
                    .map(
                        (i, idx) => `<article class="core-service-card" data-service-card="${idx}">
                            <div class="core-service-card-name">${i.name || ""}</div>
                            <div class="core-service-card-desc">${i.description || ""}</div>
                            <div class="core-service-expand">
                                <a class="core-service-enter" href="${i.page || "pages/core-services.html"}" data-i18n="panel.coreEnter">${T("panel.coreEnter")}</a>
                                <a class="core-service-enter secondary" href="pages/core-services.html" data-i18n="panel.coreBrowse">${T("panel.coreBrowse")}</a>
                            </div>
                        </article>`
                    )
                    .join("")}
            </div>
        `;
        corePanel.querySelectorAll("[data-service-card]").forEach((card) => {
            card.addEventListener("click", function (e) {
                const hitLink = e.target && e.target.closest ? e.target.closest(".core-service-enter") : null;
                if (hitLink) return;
                /* 首页：有精细悬停的设备用 CSS 悬停显隐按钮；仅触摸优先设备保留点击展开 */
                if (window.matchMedia && window.matchMedia("(hover: none)").matches) {
                    card.classList.toggle("is-expanded");
                }
            });
        });
    }

    function localizeIndustryNamesForHome(items) {
        if (!window.I18n || window.I18n.getLocale() === "zh-CN") return items;
        const T = window.I18n.t.bind(window.I18n);
        return items.map(function (r) {
            const id = String(r.id || "")
                .replace(/^\uFEFF/, "")
                .trim();
            const nk = "industry.card." + id + ".name";
            const o = Object.assign({}, r);
            const tn = T(nk);
            if (tn !== nk) o.name = tn;
            return o;
        });
    }

    function renderIndustry(items) {
        if (!industryBoard || !items.length) return;
        const grid = industryBoard.querySelector(".industry-grid");
        if (!grid) return;
        const shown = localizeIndustryNamesForHome(items).slice(0, 4);
        grid.innerHTML = shown
            .map(
                (i) => `
                <a class="industry-card" href="pages/industry.html">
                    <img src="${i.image || "images/placeholders/generic-placeholder.svg"}" alt="${i.name || "产业"}">
                    <span>${i.name || ""}</span>
                </a>
            `
            )
            .join("");
    }

    async function initHomeMap(rows) {
        const mapMidLayer = window.MapMidLayer || {};
        if (!homeMapEl) return;
        const mT = window.I18n ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        if (!String(window.__BAIDU_MAP_AK || "").trim()) {
            setHomeMapLoading(true);
            return;
        }
        let ready = !!(window.BMapGL && typeof BMapGL.Map === "function");
        if (!ready && homeBmapWarmPromise) {
            ready = await homeBmapWarmPromise;
        }
        if (!ready && typeof mapShared.ensureBMapReady === "function") {
            ready = await mapShared.ensureBMapReady(6000);
        }
        if (!ready || !window.BMapGL || typeof BMapGL.Map !== "function") {
            setHomeMapLoading(true);
            return;
        }
        if (!rows.length) {
            setHomeMapLoading(true);
            homeMapEl.innerHTML = `<div class="merchant-empty">${mT("map.empty")}</div>`;
            return;
        }
        const origin = { city: "玉林", country: "中国", lat: 22.636, lng: 110.186 };
        const MAP_STYLE_CONFIG_PATH = "date/map_style_data.json";
        const NIGHT_BASE_STYLE = [
            { featureType: "water", elementType: "all", stylers: { color: "#0b2b48" } },
            { featureType: "land", elementType: "all", stylers: { color: "#0a1e3a" } },
            { featureType: "boundary", elementType: "all", stylers: { color: "#ffc870" } },
            { featureType: "highway", elementType: "all", stylers: { color: "#375777" } },
            { featureType: "arterial", elementType: "all", stylers: { color: "#2f4c69" } },
            { featureType: "railway", elementType: "all", stylers: { visibility: "off" } },
            { featureType: "subway", elementType: "all", stylers: { visibility: "off" } },
            { featureType: "poi", elementType: "all", stylers: { visibility: "off" } },
            { featureType: "all", elementType: "labels.text.fill", stylers: { color: "#b8d6ee" } },
            { featureType: "all", elementType: "labels.text.stroke", stylers: { color: "#081a31" } }
        ];
        async function loadCustomMapStyle(path) {
            try {
                if (window.MapPreload && typeof window.MapPreload.getCache === "function") {
                    const cachedJson = window.MapPreload.getCache("style:home");
                    if (Array.isArray(cachedJson) && cachedJson.length > 0) {
                        return cachedJson;
                    }
                }
            } catch (e0) {}
            try {
                const resp = await fetch(path);
                if (!resp.ok) return null;
                const json = await resp.json();
                if (Array.isArray(json) && json.length > 0) {
                    try {
                        if (window.MapPreload && typeof window.MapPreload.setCache === "function") {
                            window.MapPreload.setCache("style:home", json);
                        }
                    } catch (e1) {}
                }
                return Array.isArray(json) ? json : null;
            } catch (e) {
                return null;
            }
        }
        const aggregateCities = typeof mapShared.aggregateCities === "function"
            ? mapShared.aggregateCities
            : function () { return []; };
        const coordCache = typeof mapShared.loadCityCoordCache === "function"
            ? await mapShared.loadCityCoordCache("date/city-coords.json", offlineData.mapCities || [])
            : new Map();
        const mergedRows = typeof mapShared.mergeRowsWithCoordCache === "function"
            ? mapShared.mergeRowsWithCoordCache(rows, coordCache)
            : rows;
        const filteredRows = filterMapScopedMerchants(mergedRows);
        if (!filteredRows.length) return;

        const cities = aggregateCities(filteredRows);

        let externalStyleJson = null;
        try {
            externalStyleJson = await loadCustomMapStyle(MAP_STYLE_CONFIG_PATH);
        } catch (eStyle) {}
        document.body.classList.add("map-native-night-home");
        if (homeMapPanel) {
            homeMapPanel.classList.add("is-map-warming");
        }

        const map = new BMapGL.Map("homeBaiduMap", { enableMapClick: false });
        try {
            window.__yuxiaoqiaoHomeMap = map;
        } catch (eMapRef) {}
        try {
            if (typeof map.setMapStyleV2 === "function") {
                map.setMapStyleV2({ styleJson: externalStyleJson || NIGHT_BASE_STYLE });
            }
        } catch (eStyleApply) {}

        let homeMapLoaded = false;
        let homeMapLoadingFallbackTimer = window.setTimeout(function () {
            if (homeMapLoaded) return;
            homeMapLoaded = true;
            if (homeMapPanel) homeMapPanel.classList.remove("is-map-warming");
            setHomeMapLoading(false);
        }, 12000);
        map.addEventListener("tilesloaded", function () {
            if (homeMapLoaded) return;
            homeMapLoaded = true;
            if (homeMapLoadingFallbackTimer) {
                window.clearTimeout(homeMapLoadingFallbackTimer);
                homeMapLoadingFallbackTimer = null;
            }
            try {
                if (typeof map.checkResize === "function") map.checkResize();
            } catch (e) {}
            if (homeMapPanel) homeMapPanel.classList.remove("is-map-warming");
            setHomeMapLoading(false);
        });

        const initCenter = mapShared.INITIAL_CENTER || { lng: 108.85, lat: 15.25 };
        const initZoom = mapShared.INITIAL_ZOOM || 4.92;
        let bounds = mapShared.VIEW_BOUNDS || { minLng: 94, maxLng: 126, minLat: -12, maxLat: 30 };
        const zoomRange = mapShared.ZOOM_RANGE || { min: 4.2, max: 7.2 };
        map.centerAndZoom(new BMapGL.Point(initCenter.lng, initCenter.lat), initZoom);
        if (typeof map.setMinZoom === "function") map.setMinZoom(zoomRange.min);
        if (typeof map.setMaxZoom === "function") map.setMaxZoom(zoomRange.max);
        if (typeof map.disableDragging === "function") map.disableDragging();
        if (typeof map.disableScrollWheelZoom === "function") map.disableScrollWheelZoom();
        if (typeof map.disableDoubleClickZoom === "function") map.disableDoubleClickZoom();
        if (typeof map.disableKeyboard === "function") map.disableKeyboard();
        if (typeof map.disablePinchToZoom === "function") map.disablePinchToZoom();

        const buildArcPoints = typeof mapShared.buildArcPoints === "function"
            ? mapShared.buildArcPoints
            : function (fromPoint, toPoint) { return [fromPoint, toPoint]; };

        const originPoint = new BMapGL.Point(origin.lng, origin.lat);

        const homePanelSeaAnchors =
            typeof BMapGL === "undefined" || typeof BMapGL.Point !== "function"
                ? []
                : [new BMapGL.Point(116.0, 19.8), new BMapGL.Point(100.2, 8.0)];
        const viewportPoints = cities
            .map((city) => new BMapGL.Point(city.lng, city.lat))
            .concat([originPoint])
            .concat(homePanelSeaAnchors);
        if (cities.length) {
            const lngs = cities.map((c) => c.lng).concat([origin.lng]);
            const lats = cities.map((c) => c.lat).concat([origin.lat]);
            bounds = {
                minLng: Math.max(90, Math.min(...lngs) - 2.2),
                maxLng: Math.min(130, Math.max(...lngs) + 2.2),
                minLat: Math.max(-15, Math.min(...lats) - 2.2),
                maxLat: Math.min(35, Math.max(...lats) + 2.2)
            };
        }
        if (viewportPoints.length > 1 && typeof map.setViewport === "function") {
            map.setViewport(viewportPoints, { margins: [35, 35, 35, 35] });
            if (typeof mapShared.clampMapView === "function") {
                mapShared.clampMapView(map, bounds, zoomRange);
            }
        }

        const showCities = cities.slice(0, 18);
        if (showCities.length && typeof mapMidLayer.create === "function") {
            mapMidLayer.create(map, {
                originPoint,
                buildArcPoints,
                beamLinkMode: "outward",
                cities: showCities.map((city) => ({
                    key: city.key,
                    point: new BMapGL.Point(city.lng, city.lat)
                }))
            });
        }
    }

    const HOME_DYNAMIC_CAROUSEL_MAX = 12;
    let qiaowuJsonRowsRaw = [];
    let dynamicCarouselRows = [];
    let homeContentEpoch = 0;

    function rebuildDynamicCarouselFromRaw() {
        dynamicCarouselRows = sortQiaowuDynamicItems(mapQiaowuJsonToDynamic(qiaowuJsonRowsRaw)).slice(
            0,
            HOME_DYNAMIC_CAROUSEL_MAX
        );
    }

    const [demandRows, coreRowsRaw, industryRows, merchantsRows] = await Promise.all([
        loadCsvRows("date/demand.csv", offlineData.demand || []),
        loadCsvRows("date/core_services.csv", offlineData.coreServices || []),
        loadCsvRows("date/industry.csv", offlineData.industry || []),
        loadCsvRows("date/merchants.csv", offlineData.merchants || [])
    ]);
    // 核心服务显式排序：只保留已开发的4个，按指定顺序，防止数据源/缓存乱序
    const coreServiceOrder = ["svc-006", "svc-004", "svc-002", "svc-003"];
    const coreRows = coreServiceOrder
        .map(function (id) { return coreRowsRaw.find(function (x) { return x.id === id; }); })
        .filter(Boolean);
    const mapScopedMerchants = filterMapScopedMerchants(merchantsRows);
    const overviewRows = pickOverviewRows(DEFAULT_OVERVIEW_TEMPLATE, mapScopedMerchants);

    async function refreshHomeLocale() {
        if (!window.I18n) return;
        homeContentEpoch++;
        refreshHeaderClock();
        if (weatherText) weatherText.textContent = weatherForI18n();
        renderOverview(localizeOverviewRows(overviewRows));
        rebuildDynamicCarouselFromRaw();
        renderDynamicCarousel(dynamicCarouselRows);
        renderDemand(demandRows);
        renderCoreServices(coreRows);
        renderIndustry(industryRows);
        document.title = window.I18n.t("home.title");
        window.I18n.applyDom(document);
        if (typeof window.I18n.scheduleLayoutCalibration === "function") {
            window.I18n.scheduleLayoutCalibration();
        }
    }
    if (window.I18n) {
        window.addEventListener(window.I18n.EVENT_NAME, function () {
            refreshHomeLocale();
        });
    }

    renderOverview(localizeOverviewRows(overviewRows));
    renderDynamicLoadingSkeleton();
    renderDemand(demandRows);
    renderCoreServices(coreRows);
    renderIndustry(industryRows);
    if (window.I18n) {
        document.title = window.I18n.t("home.title");
        window.I18n.applyDom(document);
    }

    function scheduleHomeHeavyWork() {
        if (window.QiaowuNewsLoader && typeof window.QiaowuNewsLoader.peekWarmRows === "function") {
            var peekHome = window.QiaowuNewsLoader.peekWarmRows();
            if (peekHome && peekHome.length) {
                qiaowuJsonRowsRaw = peekHome;
                rebuildDynamicCarouselFromRaw();
                renderDynamicCarousel(dynamicCarouselRows);
            }
        }
        void (async function () {
            try {
                if (!window.QiaowuNewsLoader) {
                    renderDynamicCarousel([]);
                    return;
                }
                if (offline) {
                    try {
                        qiaowuJsonRowsRaw = await window.QiaowuNewsLoader.loadQiaowuNewsRows();
                    } catch (e) {
                        qiaowuJsonRowsRaw = [];
                    }
                    rebuildDynamicCarouselFromRaw();
                    renderDynamicCarousel(dynamicCarouselRows);
                    return;
                }
                var epoch0 = homeContentEpoch;
                const rows = await window.QiaowuNewsLoader.loadQiaowuNewsRows({
                    onUpdate: function (merged) {
                        if (epoch0 !== homeContentEpoch) return;
                        qiaowuJsonRowsRaw = merged;
                        rebuildDynamicCarouselFromRaw();
                        renderDynamicCarousel(dynamicCarouselRows);
                    }
                });
                if (epoch0 !== homeContentEpoch) return;
                qiaowuJsonRowsRaw = rows;
                rebuildDynamicCarouselFromRaw();
                renderDynamicCarousel(dynamicCarouselRows);
            } catch (e) {
                renderDynamicCarousel([]);
            }
        })();
        void initHomeMap(mapScopedMerchants).catch(function () {});
        void preloadMapCache();
    }

    function preloadMapCache() {
        if (typeof window.MapPreload === "undefined") return;
        if (window.MapPreload.isFresh && window.MapPreload.isFresh()) return;
        window.MapPreload.stampFresh();

        if (window.AppDataUtils && typeof window.AppDataUtils.loadCsv === "function") {
            window.AppDataUtils.loadCsv("date/merchants.csv").then(function (rows) {
                if (Array.isArray(rows) && rows.length) {
                    window.MapPreload.setCache("merchants", rows);
                }
            }).catch(function () {});
        }

        fetch("date/city-coords.json", { cache: "no-store" }).then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (json) {
            if (json) window.MapPreload.setCache("coords", json);
        }).catch(function () {});

        fetch("date/merchants-i18n.json", { cache: "no-store" }).then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (json) {
            if (json && json.keys) window.MapPreload.setCache("i18n", json);
        }).catch(function () {});

        fetch("date/map_style_data.json", { cache: "no-store" }).then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (json) {
            if (json) window.MapPreload.setCache("style", json);
        }).catch(function () {});
    }

    if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(scheduleHomeHeavyWork);
    } else {
        window.setTimeout(scheduleHomeHeavyWork, 0);
    }

    if (homeMapPanel) {
        homeMapPanel.addEventListener("click", function () {
            window.location.href = "pages/map.html";
        });
    }

    const digitalHumanSlot = document.querySelector(".digital-human-slot");
    const digitalHuman = document.querySelector(".digital-human");
    const rightPanelForMascot = document.querySelector("body.page-home .right-panel");
    let mascotTrimmedOnce = false;
    let lastMascotWindowWidth = window.innerWidth;

    function getImageOpaqueBBox(img) {
        const tag = img && img.tagName ? String(img.tagName).toUpperCase() : "";
        const nw =
            tag === "VIDEO"
                ? (Number.isFinite(img.videoWidth) && img.videoWidth ? img.videoWidth : img.videoWidth)
                : img.naturalWidth;
        const nh =
            tag === "VIDEO"
                ? (Number.isFinite(img.videoHeight) && img.videoHeight ? img.videoHeight : img.videoHeight)
                : img.naturalHeight;
        if (!nw || !nh) return null;
        try {
            const canvas = document.createElement("canvas");
            canvas.width = nw;
            canvas.height = nh;
            const ctx = canvas.getContext("2d");
            if (!ctx) return null;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, nw, nh);
            const d = imageData.data;
            const alphaThreshold = 12;
            let minX = nw;
            let minY = nh;
            let maxX = 0;
            let maxY = 0;
            for (let y = 0; y < nh; y++) {
                const row = y * nw * 4;
                for (let x = 0; x < nw; x++) {
                    if (d[row + x * 4 + 3] > alphaThreshold) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX < minX) return null;
            return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
        } catch (e) {
            return null;
        }
    }

    function clearMascotTrim(slot, img, panel) {
        if (!slot || !img) return;
        slot.classList.remove("digital-human-slot--trimmed");
        slot.style.width = "";
        slot.style.height = "";
        slot.style.overflow = "";
        img.style.width = "";
        img.style.height = "";
        img.style.left = "";
        img.style.top = "";
        img.style.right = "";
        img.style.bottom = "";
    }

    function trimMascotTransparent(slot, img, panel) {
        if (!slot || !img || !panel) return;
        const bbox = getImageOpaqueBBox(img);
        if (!bbox) return;

        const tag = img && img.tagName ? String(img.tagName).toUpperCase() : "";
        const nw = tag === "VIDEO" ? img.videoWidth : img.naturalWidth;
        const nh = tag === "VIDEO" ? img.videoHeight : img.naturalHeight;
        const bw = bbox.maxX - bbox.minX + 1;
        const bh = bbox.maxY - bbox.minY + 1;
        if (bw < 8 || bh < 8) return;

        const hCss = img.getBoundingClientRect().height;
        if (!Number.isFinite(hCss) || hCss < 32) return;

        const scale = hCss / nh;
        const dispW = nw * scale;
        const slotW = bw * scale;
        const slotH = bh * scale;
        if (slotW < 24 || slotH < 24) return;

        slot.style.width = Math.round(slotW) + "px";
        slot.style.height = Math.round(slotH) + "px";
        slot.style.overflow = "hidden";

        img.style.width = Math.round(dispW) + "px";
        img.style.height = Math.round(hCss) + "px";
        img.style.left = Math.round(-bbox.minX * scale) + "px";
        img.style.top = Math.round(-bbox.minY * scale) + "px";
        img.style.right = "auto";
        img.style.bottom = "auto";

        slot.classList.add("digital-human-slot--trimmed");
    }

    function runMascotTrimAfterLayout(slot, img, panel) {
        if (!slot || !img || !panel) return;
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                trimMascotTransparent(slot, img, panel);
            });
        });
    }

    function remascotOnResize(slot, img, panel) {
        clearMascotTrim(slot, img, panel);
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                trimMascotTransparent(slot, img, panel);
            });
        });
    }

    if (digitalHuman && digitalHumanSlot && rightPanelForMascot && document.body.classList.contains("page-home")) {
        function onMascotReady() {
            if (mascotTrimmedOnce) return;
            mascotTrimmedOnce = true;
            runMascotTrimAfterLayout(digitalHumanSlot, digitalHuman, rightPanelForMascot);
        }
        const tag = digitalHuman && digitalHuman.tagName ? String(digitalHuman.tagName).toUpperCase() : "";
        if (tag === "VIDEO") {
            const v = digitalHuman;
            const tryStart = function () {
                try {
                    v.addEventListener(
                        "seeked",
                        function () {
                            onMascotReady();
                        },
                        { once: true }
                    );
                    v.currentTime = 0;
                } catch (e) {
                    onMascotReady();
                }
            };
            if (v.readyState >= 2) {
                tryStart();
            } else {
                v.addEventListener("loadeddata", tryStart, { once: true });
            }
        } else if (digitalHuman.complete && digitalHuman.naturalWidth) {
            onMascotReady();
        } else {
            digitalHuman.addEventListener("load", onMascotReady);
        }
        let resizeT = null;
        window.addEventListener(
            "resize",
            function () {
                const delta = Math.abs(window.innerWidth - lastMascotWindowWidth);
                if (delta < 80) return;
                lastMascotWindowWidth = window.innerWidth;
                if (resizeT) window.clearTimeout(resizeT);
                resizeT = window.setTimeout(function () {
                    remascotOnResize(digitalHumanSlot, digitalHuman, rightPanelForMascot);
                }, 200);
            },
            { passive: true }
        );
        digitalHuman.addEventListener("click", function () {
            window.location.href = "pages/services/overseas-service-assistant.html?from=home";
        });
    } else if (digitalHuman) {
        digitalHuman.addEventListener("click", function () {
            window.location.href = "pages/services/overseas-service-assistant.html?from=home";
        });
    }
});