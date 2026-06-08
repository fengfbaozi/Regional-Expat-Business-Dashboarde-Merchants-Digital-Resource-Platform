(async function () {
    const pageTypeSafe = document.body.getAttribute("data-page");
    if (!pageTypeSafe || !window.AppDataUtils) return;

    const offline = window.location.protocol === "file:";
    const offlineData = window.APP_DATASETS || {};

    function Ti(key, vars) {
        return window.I18n && typeof window.I18n.t === "function" ? window.I18n.t(key, vars) : key;
    }

    async function rows(path, fallback) {
        if (offline) return fallback || [];
        try {
            return await window.AppDataUtils.loadCsv(path);
        } catch (e) {
            return fallback || [];
        }
    }

    const root = document.getElementById("pageContent");
    if (!root) return;

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function card(title, desc, link) {
        const enter = Ti("core.card.enter");
        return (
            `<article class="section-card"><h3>${title || ""}</h3><p>${desc || ""}</p>` +
            (link ? `<a href="${link}">${enter}</a>` : "") +
            `</article>`
        );
    }

    function dynamicDateKey(dateStr) {
        const m = String(dateStr || "").match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return 0;
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
    }

    if (pageTypeSafe === "dynamic") {
        const refreshBtn = document.getElementById("dynamicRefreshBtn");
        const refreshHint = document.getElementById("dynamicRefreshHint");

        let lastDynamicRows = [];

        function pickDynamicRowTitle(row) {
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

        function pickDynamicRowSummary(row) {
            var loc = window.I18n && window.I18n.getLocale ? window.I18n.getLocale() : "zh-CN";
            if (window.AppDataUtils && typeof window.AppDataUtils.pickQiaowuLocalizedSummary === "function") {
                return window.AppDataUtils.pickQiaowuLocalizedSummary(row, loc);
            }
            if (window.I18n && loc === "en-US") {
                var en2 = String(row.summary_en || "").trim();
                if (en2) return en2;
            }
            return String(row.summary || "").trim();
        }

        function buildDynamicCardsHtml(newsRows) {
            const sorted = newsRows
                .slice()
                .sort(function (a, b) {
                    return dynamicDateKey(b.time) - dynamicDateKey(a.time);
                });
            if (!sorted.length) {
                return '<p class="section-card qiaowu-news-empty">' + escapeHtml(Ti("dynamic.newsEmpty")) + "</p>";
            }
            const viewLbl = escapeHtml(Ti("dynamic.viewOriginal"));
            return sorted
                .map(function (row) {
                    const url = String(row.url || "").trim();
                    const title = pickDynamicRowTitle(row);
                    if (!title || !url) return "";
                    const time = String(row.time || row.date || "").trim() || "—";
                    const srcFromRow = String(row.source || "").trim();
                    const apiSrc = srcFromRow || pickDynamicRowSummary(row);
                    let srcLabel = apiSrc || Ti("src.local");
                    if (!apiSrc) {
                        if (url.indexOf("yqzwx.com") >= 0) srcLabel = Ti("src.yqzwx");
                        else if (url.indexOf("yulin.gov.cn") >= 0) srcLabel = Ti("src.gov.yulin");
                        else if (url.indexOf("gxylnews.com") >= 0) srcLabel = Ti("src.gxylnews");
                    }
                    srcLabel = escapeHtml(String(srcLabel));
                    const sid =
                        typeof window.AppDataUtils.qiaowuStableId === "function"
                            ? window.AppDataUtils.qiaowuStableId(url)
                            : "qiaowu-" + String(url).length;
                    const dynLocal = String(row.dynLocalId || "").trim();
                    const dataDynAttr = dynLocal ? ' data-dyn-local="' + escapeHtml(dynLocal) + '"' : "";
                    const safeUrl = escapeHtml(url);
                    const titleEsc = escapeHtml(title);
                    return (
                        '<article class="section-card section-card-dynamic qiaowu-news-card" id="' +
                        escapeHtml(sid) +
                        '"' +
                        dataDynAttr +
                        ">" +
                        '<a class="qiaowu-news-card__hit" href="' +
                        safeUrl +
                        '" target="_blank" rel="noopener noreferrer" aria-label="' +
                        viewLbl +
                        "：" +
                        titleEsc.slice(0, 120) +
                        '"></a>' +
                        '<div class="qiaowu-news-card__inner">' +
                        '<h3 class="qiaowu-news-card__title">' +
                        titleEsc +
                        "</h3>" +
                        '<div class="qiaowu-news-card__meta">' +
                        '<span class="qiaowu-news-card__time">' +
                        escapeHtml(time) +
                        "</span>" +
                        '<span class="qiaowu-news-card__sep" aria-hidden="true">|</span>' +
                        '<span class="qiaowu-news-card__source">' +
                        srcLabel +
                        '</span></div><div class="qiaowu-news-card__hint">' +
                        viewLbl +
                        "</div></div></article>"
                    );
                })
                .filter(Boolean)
                .join("");
        }

        async function renderDynamicFromRows(rawRows) {
            var display = rawRows || [];
            lastDynamicRows = display;
            root.innerHTML = buildDynamicCardsHtml(display);
            const hash = decodeURIComponent((window.location.hash || "").replace(/^#/, ""));
            if (hash) {
                window.requestAnimationFrame(function () {
                    let el = document.getElementById(hash);
                    if (!el) {
                        try {
                            if (window.CSS && typeof window.CSS.escape === "function") {
                                el = document.querySelector(
                                    '[data-dyn-local="' + window.CSS.escape(hash) + '"]'
                                );
                            } else {
                                el = document.querySelector(
                                    '[data-dyn-local="' +
                                        hash.replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
                                        '"]'
                                );
                            }
                        } catch (e) {
                            el = null;
                        }
                    }
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                });
            }
        }

        async function loadAndRenderDynamicNews() {
            var newsRows = [];
            var warmPeek =
                window.QiaowuNewsLoader && typeof window.QiaowuNewsLoader.peekWarmRows === "function"
                    ? window.QiaowuNewsLoader.peekWarmRows()
                    : [];
            if (warmPeek && warmPeek.length) {
                lastDynamicRows = warmPeek;
                await renderDynamicFromRows(lastDynamicRows);
            } else if (!offline) {
                root.innerHTML =
                    '<p class="section-card qiaowu-news-empty qiaowu-news-loading">' +
                    escapeHtml(Ti("dynamic.loading")) +
                    "</p>";
            }
            if (window.QiaowuNewsLoader && typeof window.QiaowuNewsLoader.loadQiaowuNewsRows === "function") {
                try {
                    newsRows = await window.QiaowuNewsLoader.loadQiaowuNewsRows({
                        onUpdate: async function (merged) {
                            lastDynamicRows = merged || [];
                            await renderDynamicFromRows(lastDynamicRows);
                        }
                    });
                } catch (e) {
                    newsRows = [];
                }
            }
            lastDynamicRows = newsRows;
            await renderDynamicFromRows(lastDynamicRows);
            return lastDynamicRows.length;
        }

        async function onRefreshDynamic() {
            if (refreshBtn) {
                refreshBtn.disabled = true;
                refreshBtn.classList.add("is-loading");
            }
            if (refreshHint) refreshHint.textContent = Ti("dynamic.refresh.working");
            try {
                if (
                    window.QiaowuNewsLoader &&
                    typeof window.QiaowuNewsLoader.refreshQiaowuFromDataApi === "function"
                ) {
                    var fresh = await window.QiaowuNewsLoader.refreshQiaowuFromDataApi();
                    lastDynamicRows = fresh || [];
                    await renderDynamicFromRows(lastDynamicRows);
                    var cnt = lastDynamicRows.length;
                    if (refreshHint) {
                        refreshHint.textContent = cnt
                            ? Ti("dynamic.refresh.done", { n: cnt })
                            : Ti("dynamic.refresh.empty");
                    }
                } else {
                    await loadAndRenderDynamicNews();
                    if (refreshHint) refreshHint.textContent = Ti("dynamic.refresh.offline");
                }
            } catch (e) {
                if (refreshHint) refreshHint.textContent = Ti("dynamic.refresh.offline");
                try {
                    await loadAndRenderDynamicNews();
                } catch (e2) {}
            } finally {
                if (refreshBtn) {
                    refreshBtn.disabled = false;
                    refreshBtn.classList.remove("is-loading");
                }
                window.setTimeout(function () {
                    if (refreshHint) refreshHint.textContent = "";
                }, 5200);
            }
        }

        await loadAndRenderDynamicNews();
        if (refreshBtn) refreshBtn.addEventListener("click", onRefreshDynamic);
        if (window.I18n && window.I18n.EVENT_NAME) {
            window.addEventListener(window.I18n.EVENT_NAME, function () {
                void renderDynamicFromRows(lastDynamicRows);
            });
        }
    }

    if (pageTypeSafe === "core") {
        const rawCore = await rows("../date/core_services.csv", offlineData.coreServices);
        let lastCore = rawCore;
        function localizeCoreRows(rows) {
            if (!window.I18n || window.I18n.getLocale() === "zh-CN") {
                return rows.map(function (r) {
                    return Object.assign({}, r);
                });
            }
            const T = window.I18n.t.bind(window.I18n);
            return rows.map(function (r) {
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

        function coreServiceTier(id) {
            const fid = String(id || "")
                .replace(/^\uFEFF/, "")
                .trim();
            // 全开发服务：黄色 + 大卡（featured）
            if (
                fid === "svc-002" ||
                fid === "svc-003" ||
                fid === "svc-004" ||
                fid === "svc-006"
            ) {
                return "featured";
            }
            // 其他（含半开发的侨乡文化展示）：冷色调 + 小卡（compact）
            return "compact";
        }

        function coreServiceCard(i) {
            const href = i.page ? String(i.page).replace(/^pages\//, "") : "#";
            const tier = coreServiceTier(i.id);
            const tierClass =
                tier === "featured"
                    ? "core-hub-card--featured"
                    : tier === "standard"
                      ? "core-hub-card--standard"
                      : "core-hub-card--compact";
            const title = escapeHtml(i.name || "");
            const desc = escapeHtml(i.description || "");
            const enter = escapeHtml(Ti("core.card.enter"));
            const aria = escapeHtml(String(i.name || "").trim() + " — " + Ti("core.card.enter"));
            return (
                '<article class="section-card core-hub-card ' +
                tierClass +
                '">' +
                '<a class="core-hub-card__link" href="' +
                escapeHtml(href) +
                '" aria-label="' +
                aria +
                '">' +
                '<span class="core-hub-card__shine" aria-hidden="true"></span>' +
                '<div class="core-hub-card__body">' +
                '<div class="core-hub-card__top">' +
                '<h3 class="core-hub-card__title">' +
                title +
                "</h3>" +
                '<span class="core-hub-card__tier" data-tier="' +
                tier +
                '" aria-hidden="true"></span>' +
                "</div>" +
                '<p class="core-hub-card__desc">' +
                desc +
                "</p>" +
                '<span class="core-hub-card__cta"><span class="core-hub-card__ctaInner">' +
                enter +
                "</span></span>" +
                "</div></a></article>"
            );
        }

        function paintCore() {
            const items = localizeCoreRows(lastCore);
            const rank = { featured: 0, standard: 1, compact: 2 };
            const sorted = items.slice().sort(function (a, b) {
                const ra = rank[coreServiceTier(a.id)] != null ? rank[coreServiceTier(a.id)] : 3;
                const rb = rank[coreServiceTier(b.id)] != null ? rank[coreServiceTier(b.id)] : 3;
                if (ra !== rb) return ra - rb;
                return String(a.id || "").localeCompare(String(b.id || ""));
            });
            root.innerHTML = sorted.map((i) => coreServiceCard(i)).join("");
        }
        paintCore();
        if (window.I18n && window.I18n.EVENT_NAME) {
            window.addEventListener(window.I18n.EVENT_NAME, paintCore);
        }
    }

    if (pageTypeSafe === "overview") {
        const mapShared = window.MapShared || {};
        const normalize = typeof mapShared.normalizeRows === "function" ? mapShared.normalizeRows : (v) => v || [];
        const enterpriseKeyFn =
            typeof mapShared.getEnterpriseKey === "function"
                ? mapShared.getEnterpriseKey
                : (m) => `${m.country}|${m.city}|${m.merchant_type}`;
        const merchantsRows = await rows("../date/merchants.csv", offlineData.merchants || []);
        const normalizedRows = normalize(merchantsRows);
        const enterpriseCount = new Set(normalizedRows.map((m) => enterpriseKeyFn(m))).size;
        const countryCount = new Set(normalizedRows.map((m) => m.country)).size;
        const cityCount = new Set(normalizedRows.map((m) => `${m.city}|${m.country}`)).size;
        const orgCount = Math.max(6, Math.round(countryCount * 2.2));
        const projectCount = Math.max(12, Math.round(enterpriseCount * 0.35));
        const overviewSpec = [
            { key: "overview.merchants", value: normalizedRows.length },
            { key: "overview.enterprises", value: enterpriseCount },
            { key: "overview.orgs", value: orgCount },
            { key: "overview.projects", value: projectCount },
            { key: "overview.countries", value: countryCount },
            { key: "overview.active", value: cityCount }
        ];
        function paintOverview() {
            root.innerHTML = overviewSpec
                .map((item) => card(Ti(item.key), Ti("overview.cardVal", { v: item.value }), ""))
                .join("");
        }
        paintOverview();
        if (window.I18n && window.I18n.EVENT_NAME) {
            window.addEventListener(window.I18n.EVENT_NAME, paintOverview);
        }
    }

    if (pageTypeSafe === "industry") {
        const rawInd = await rows("../date/industry.csv", offlineData.industry);
        let lastInd = rawInd;
        function localizeIndustryCardFields(rows) {
            if (!window.I18n || window.I18n.getLocale() === "zh-CN") {
                return rows.map(function (r) {
                    return Object.assign({}, r);
                });
            }
            const T = window.I18n.t.bind(window.I18n);
            return rows.map(function (r) {
                const id = String(r.id || "")
                    .replace(/^\uFEFF/, "")
                    .trim();
                const o = Object.assign({}, r);
                const pairs = [
                    ["name", "industry.card." + id + ".name"],
                    ["summary", "industry.card." + id + ".summary"],
                    ["status", "industry.card." + id + ".status"],
                    ["resource", "industry.card." + id + ".resource"],
                    ["market", "industry.card." + id + ".market"],
                    ["supply_chain", "industry.card." + id + ".supply_chain"],
                    ["opportunity", "industry.card." + id + ".opportunity"]
                ];
                pairs.forEach(function (pr) {
                    const field = pr[0];
                    const kk = pr[1];
                    const tv = T(kk);
                    if (tv !== kk) o[field] = tv;
                });
                return o;
            });
        }
        function industryRowsFullyBundled(rows) {
            if (!window.I18n || typeof window.I18n.t !== "function") return false;
            const T = window.I18n.t.bind(window.I18n);
            return rows.every(function (r) {
                const id = String(r.id || "")
                    .replace(/^\uFEFF/, "")
                    .trim();
                if (!id) return false;
                const ks = [".name", ".summary", ".status", ".resource", ".market", ".supply_chain", ".opportunity"];
                return ks.every(function (suf) {
                    const kk = "industry.card." + id + suf;
                    return T(kk) !== kk;
                });
            });
        }
        function renderIndustryCards(items) {
            const T = Ti;
            root.classList.add("industry-detail-grid");
            root.innerHTML = items
                .map(
                    (i) =>
                        `<article class="section-card industry-detail-card">
                        <img src="../${i.image || "images/placeholders/generic-placeholder.svg"}" alt="${escapeHtml(i.name || "")}">
                        <h3>${escapeHtml(i.name || "")}</h3>
                        <p class="industry-lead">${escapeHtml(i.summary || "")}</p>
                        <div class="industry-meta">
                            ${i.status ? `<span>${escapeHtml(i.status)}</span>` : ""}
                            ${i.resource ? `<span>${escapeHtml(i.resource)}</span>` : ""}
                        </div>
                        <div class="industry-block">
                            <h4>${escapeHtml(T("industry.block.market"))}</h4>
                            <p>${escapeHtml(i.market || T("industry.fallback.market"))}</p>
                        </div>
                        <div class="industry-block">
                            <h4>${escapeHtml(T("industry.block.chain"))}</h4>
                            <p>${escapeHtml(i.supply_chain || T("industry.fallback.chain"))}</p>
                        </div>
                        <div class="industry-block">
                            <h4>${escapeHtml(T("industry.block.out"))}</h4>
                            <p>${escapeHtml(i.opportunity || T("industry.fallback.out"))}</p>
                        </div>
                    </article>`
                )
                .join("");
        }

        async function paintIndustry() {
            let items = lastInd.map(function (r) {
                return Object.assign({}, r);
            });
            items = localizeIndustryCardFields(items);
            renderIndustryCards(items);
            const needArk =
                window.I18n &&
                window.I18n.getLocale() !== "zh-CN" &&
                typeof window.I18n.translateIndustryRows === "function" &&
                !industryRowsFullyBundled(lastInd);
            if (needArk) {
                try {
                    const tr = await window.I18n.translateIndustryRows(lastInd);
                    if (tr && tr.length) {
                        items = localizeIndustryCardFields(tr);
                        renderIndustryCards(items);
                    }
                } catch (e) {}
            }
        }
        await paintIndustry();
        if (window.I18n && window.I18n.EVENT_NAME) {
            window.addEventListener(window.I18n.EVENT_NAME, paintIndustry);
        }
    }

    if (window.I18n && window.I18n.EVENT_NAME && typeof window.I18n.scheduleLayoutCalibration === "function") {
        window.addEventListener(window.I18n.EVENT_NAME, function () {
            window.setTimeout(function () {
                window.I18n.scheduleLayoutCalibration();
            }, 560);
        });
    }
})();
