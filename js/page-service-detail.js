(async function () {
    // 修改返回按钮逻辑：回到上一次页面
    const backButtons = document.querySelectorAll('.section-back, .map-screen-back, .section-topbar-back');
    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '../core-services.html';
            }
        });
    });

    const serviceId = document.body.getAttribute("data-service-id");
    const titleEl = document.getElementById("serviceTitle");
    const descEl = document.getElementById("serviceDesc");
    if (!serviceId || !titleEl || !descEl || !window.AppDataUtils) return;

    const offline = window.location.protocol === "file:";
    const offlineRows = (window.APP_DATASETS && window.APP_DATASETS.coreServices) || [];
    const offlineCulture = (window.APP_DATASETS && window.APP_DATASETS.cultureStories) || [];

    async function rows() {
        if (offline) return offlineRows;
        try {
            return await window.AppDataUtils.loadCsv("../../date/core_services.csv");
        } catch (e) {
            return offlineRows;
        }
    }

    const items = await rows();
    let lastItem = items.find((x) => x.id === serviceId);
    const joiner = window.I18n && window.I18n.t ? window.I18n.t("page.docTitle.joiner") : " · ";

    async function applyServiceHeader() {
        const T = window.I18n && window.I18n.t ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        if (!lastItem) {
            titleEl.textContent = T("serviceDetail.notFoundTitle");
            descEl.textContent = T("serviceDetail.notFoundDesc");
            document.title = T("serviceDetail.notFoundTitle") + joiner + T("home.title");
            return;
        }
        let display = {
            name: lastItem.name || "",
            description: lastItem.description || ""
        };
        if (window.I18n && window.I18n.getLocale() !== "zh-CN") {
            const sid = String(lastItem.id || "");
            if (sid.indexOf("svc-") === 0) {
                const nk = "core.svc." + sid + ".name";
                const dk = "core.svc." + sid + ".desc";
                const tn = T(nk);
                const td = T(dk);
                if (tn !== nk) display.name = tn;
                if (td !== dk) display.description = td;
            }
        }
        titleEl.textContent = display.name || T("serviceDetail.nameFallback");
        descEl.textContent = display.description || T("serviceDetail.descFallback");
        document.title =
            (display.name || T("serviceDetail.nameFallback")) + joiner + (window.I18n ? window.I18n.t("home.title") : "");
    }

    await applyServiceHeader();
    if (window.I18n && window.I18n.EVENT_NAME) {
        window.addEventListener(window.I18n.EVENT_NAME, function () {
            applyServiceHeader();
            if (typeof window.I18n.scheduleLayoutCalibration === "function") {
                window.I18n.scheduleLayoutCalibration();
            }
        });
    }

    if (!lastItem) return;

    const item = lastItem;

    const cardEl = descEl.closest(".section-card");
    if (!cardEl) return;

    if (serviceId === "svc-001") {
        const Ti =
            window.I18n && typeof window.I18n.t === "function"
                ? window.I18n.t.bind(window.I18n)
                : function (key, vars) {
                      return key;
                  };
        function escapeCultureHtml(s) {
            return String(s || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }
        const CULTURE_IMG_FALLBACK = "../../images/placeholders/generic-placeholder.svg";
        function pickCultureImageSrc(row) {
            const o = row || {};
            const keys = ["image", "image_url", "imageUrl", "photo", "cover", "cover_url", "coverUrl"];
            for (let i = 0; i < keys.length; i++) {
                const v = o[keys[i]];
                if (v != null && String(v).trim()) return String(v).trim();
            }
            return "";
        }
        function toAssetPath(path) {
            const raw = String(path || "").trim();
            if (!raw) return CULTURE_IMG_FALLBACK;
            if (raw.startsWith("data:")) return raw;
            /* 离线打包：不加载项目外的 http(s) 图片，统一回退占位图 */
            if (/^https?:\/\//i.test(raw) || raw.startsWith("//")) return CULTURE_IMG_FALLBACK;
            return raw.replace(/^(\.\.\/)+/, "../../");
        }
        function localizeCultureHistoryRows(rows, T) {
            return rows.map(function (h) {
                const y = String(h.year || "").trim();
                const k = "culture.hist." + y + ".event";
                const t = T(k);
                const o = Object.assign({}, h);
                if (t !== k) o.event = t;
                return o;
            });
        }
        function localizeCultureFigureRows(rows, T) {
            return rows.map(function (f) {
                const id = String(f.id || "").trim();
                const o = Object.assign({}, f);
                if (id) {
                    ["name", "title", "tag", "story"].forEach(function (field) {
                        const kk = "culture.fig." + id + "." + field;
                        const tv = T(kk);
                        if (tv !== kk) o[field] = tv;
                    });
                }
                return o;
            });
        }
        function cultureBundleComplete(hist, figs, T) {
            for (let i = 0; i < hist.length; i++) {
                const y = String(hist[i].year || "").trim();
                const ek = "culture.hist." + y + ".event";
                if (T(ek) === ek) return false;
            }
            for (let j = 0; j < figs.length; j++) {
                const fid = String(figs[j].id || "").trim();
                if (!fid) return false;
                const fields = ["name", "title", "tag", "story"];
                for (let k = 0; k < fields.length; k++) {
                    const kk = "culture.fig." + fid + "." + fields[k];
                    if (T(kk) === kk) return false;
                }
            }
            return true;
        }

        function bindCultureImageFallbacks(root) {
            if (!root || typeof root.querySelectorAll !== "function") return;
            const selector = ".culture-history-card img.culture-media-img, .culture-figure-slide img.culture-media-img";
            root.querySelectorAll(selector).forEach((img) => {
                img.addEventListener("error", function onCultureImgErr(ev) {
                    const el = ev.currentTarget;
                    if (el.dataset.cultureImgFallback === "1") {
                        el.removeEventListener("error", onCultureImgErr);
                        return;
                    }
                    el.dataset.cultureImgFallback = "1";
                    el.src = CULTURE_IMG_FALLBACK;
                });
            });
        }

        async function cultureRows() {
            if (offline) return offlineCulture;
            try {
                return await window.AppDataUtils.loadCsv("../../date/culture_stories.csv");
            } catch (e) {
                return offlineCulture;
            }
        }
        async function timelineRows() {
            const fallback = [
                { year: "1912", event: "玉林侨胞通过商号与学堂捐资 助力地方教育启蒙与公益建设。", image: "images/placeholders/carousel-1.svg" },
                { year: "1937", event: "侨团组织持续汇款赈济 支持家乡抗战后勤与民生恢复。", image: "images/placeholders/carousel-2.svg" },
                { year: "1958", event: "归侨技术工匠参与地方轻工业建设 推动陶瓷与食品加工升级。", image: "images/placeholders/generic-placeholder.svg" },
                { year: "1998", event: "东盟经贸往来升温 玉林侨商开始布局跨境贸易与物流网络。", image: "images/placeholders/carousel-1.svg" },
                { year: "2015", event: "华侨社团联合举办文化周 侨批与非遗展陈进入常态化传播阶段。", image: "images/placeholders/carousel-2.svg" },
                { year: "2024", event: "侨务数字平台启动 建立侨商资源与文化传播协同机制。", image: "images/placeholders/generic-placeholder.svg" }
            ];
            if (offline) return fallback;
            try {
                const rows = await window.AppDataUtils.loadCsv("../../date/culture_history.csv");
                return Array.isArray(rows) && rows.length ? rows : fallback;
            } catch (e) {
                return fallback;
            }
        }
        async function figureRows() {
            const fallback = [
                { id: "fig-001", name: "林海潮", title: "归侨企业家", story: "推动玉林香料与东盟渠道对接 构建从产地到海外商超的稳定供货链。", tag: "侨商风采", image: "images/placeholders/carousel-1.svg" },
                { id: "fig-002", name: "陈若岚", title: "侨胞青年代表", story: "组织多语种志愿团队 为来玉侨企提供翻译与合规信息支持。", tag: "侨胞故事", image: "images/placeholders/carousel-2.svg" },
                { id: "fig-003", name: "梁志谦", title: "跨境物流协调人", story: "整合玉林至新马印冷链与干线资源 提升特色农产品履约时效。", tag: "侨商风采", image: "images/placeholders/generic-placeholder.svg" },
                { id: "fig-004", name: "黄佩琳", title: "文化传播策展人", story: "以侨批与非遗为主题策划巡展 促进青年群体理解侨乡历史脉络。", tag: "侨胞故事", image: "images/placeholders/carousel-1.svg" }
            ];
            if (offline) return fallback;
            try {
                const rows = await window.AppDataUtils.loadCsv("../../date/culture_figures.csv");
                return Array.isArray(rows) && rows.length ? rows : fallback;
            } catch (e) {
                return fallback;
            }
        }
        async function loadOptionalPlatformDataApiConfig() {
            if (window.PLATFORM_DATA_API) return;
            await new Promise((resolve) => {
                const sel = 'script[data-yxq-platform-api="1"]';
                if (document.querySelector(sel)) {
                    resolve();
                    return;
                }
                const s = document.createElement("script");
                s.src = "../../js/platform-data-api-config.js";
                s.async = true;
                s.dataset.yxqPlatformApi = "1";
                s.onload = () => resolve();
                s.onerror = () => resolve();
                document.head.appendChild(s);
            });
        }
        function unwrapCultureApiPayload(raw) {
            if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
            const candidates = [raw, raw.data, raw.result, raw.payload, raw.body];
            for (let i = 0; i < candidates.length; i++) {
                const o = candidates[i];
                if (o && typeof o === "object" && !Array.isArray(o)) {
                    if (Array.isArray(o.history) || Array.isArray(o.figures) || Array.isArray(o.stories)) {
                        return o;
                    }
                }
            }
            return null;
        }
        async function fetchCultureFromRemoteApi(cfg) {
            const c = cfg || {};
            const post = c.cultureQuery;
            const postUrl = post && String(post.url || "").trim();
            if (postUrl) {
                const method = String(post.method || "POST").toUpperCase();
                const headers = Object.assign({ "Content-Type": "application/json" }, post.headers || {});
                const bodyStr =
                    post.body !== undefined
                        ? typeof post.body === "string"
                            ? post.body
                            : JSON.stringify(post.body)
                        : "{}";
                const init = Object.assign(
                    {
                        method,
                        cache: "no-store",
                        headers,
                        body: bodyStr,
                    },
                    post.init || {}
                );
                const resp = await fetch(postUrl, init);
                if (!resp.ok) throw new Error("cultureQuery HTTP " + resp.status);
                const raw = await resp.json();
                return unwrapCultureApiPayload(raw);
            }
            const getUrl = String(c.cultureUrl || "").trim();
            if (!getUrl) return null;
            const sep = getUrl.includes("?") ? "&" : "?";
            const init = Object.assign({ cache: "no-store" }, c.cultureFetchInit || {});
            const resp = await fetch(getUrl + sep + "cb=" + Date.now(), init);
            if (!resp.ok) throw new Error("cultureUrl HTTP " + resp.status);
            const raw = await resp.json();
            return unwrapCultureApiPayload(raw);
        }
        async function loadCultureArkData() {
            await loadOptionalPlatformDataApiConfig();
            const platformCfg = window.PLATFORM_DATA_API || {};
            const tryRemote = Boolean(
                String(platformCfg.cultureUrl || "").trim() ||
                    (platformCfg.cultureQuery && String(platformCfg.cultureQuery.url || "").trim())
            );
            if (tryRemote) {
                try {
                    const remote = await fetchCultureFromRemoteApi(platformCfg);
                    if (remote) return remote;
                } catch (e) {}
            }
            try {
                const response = await fetch("../../date/culture_ark.json?cb=" + Date.now(), { cache: "no-store" });
                if (response.ok) {
                    const data = await response.json();
                    return data;
                }
            } catch (e) {}
            return null;
        }

        function mapOverseasPeopleItemToFigure(item) {
            const o = item || {};
            const ident = o.identity;
            const org = String(o.organization || "").trim();
            const ttl = String(o.title || "").trim();
            const titleLine = [org, ttl].filter(Boolean).join(" · ");
            const tagFallback = Array.isArray(ident) && ident.length ? ident[0] : "侨胞故事";
            const img =
                o.photo && String(o.photo.local || "").trim()
                    ? String(o.photo.local).trim()
                    : "images/placeholders/generic-placeholder.svg";
            return {
                id: String(o.id || "").trim() || "qiaobao_" + String(o.name || "").replace(/\s+/g, "_"),
                name: String(o.name || "").trim() || "—",
                title: titleLine || tagFallback,
                story: String(o.story || o.summary || "").trim() || "—",
                tag: tagFallback,
                image: img
            };
        }

        async function loadCultureOverseasPeopleFigures() {
            try {
                const response = await fetch("../../date/culture_overseas_people.json?cb=" + Date.now(), {
                    cache: "no-store"
                });
                if (!response.ok) return null;
                const data = await response.json();
                if (!data || !Array.isArray(data.items) || !data.items.length) return null;
                return data.items.map(mapOverseasPeopleItemToFigure);
            } catch (e) {
                return null;
            }
        }

        const rows = await cultureRows();
        const history = await timelineRows();
        const figures = await figureRows();
        const stories = rows.slice(0, 4);
        
        const arkData = await loadCultureArkData();
        if (arkData) {
            if (arkData.history && Array.isArray(arkData.history) && arkData.history.length > 0) {
                history.length = 0;
                history.push(...arkData.history);
            }
            if (arkData.figures && Array.isArray(arkData.figures) && arkData.figures.length > 0) {
                figures.length = 0;
                figures.push(...arkData.figures);
            }
            if (arkData.stories && Array.isArray(arkData.stories) && arkData.stories.length > 0) {
                stories.length = 0;
                stories.push(...arkData.stories);
            }
        }

        const overseasFigures = await loadCultureOverseasPeopleFigures();
        if (overseasFigures && overseasFigures.length) {
            figures.length = 0;
            figures.push(...overseasFigures);
        }

        const cultureHistorySource = history.map(function (h) {
            return Object.assign({}, h);
        });
        const cultureFiguresSource = figures.map(function (f) {
            return Object.assign({}, f);
        });
        const historyView = localizeCultureHistoryRows(history, Ti);
        const figuresView = localizeCultureFigureRows(figures, Ti);

        function patchCultureDomFromSources(hist, figs) {
            var n = hist.length;
            var cards = cardEl.querySelectorAll(".culture-history-card");
            for (var a = 0; a < cards.length; a++) {
                var hrow = hist[a % n];
                var p = cards[a].querySelector("p");
                if (p) p.textContent = String((hrow && hrow.event) || "");
            }
            var slides = cardEl.querySelectorAll(".culture-figure-slide");
            for (var b = 0; b < slides.length; b++) {
                var f = figs[b];
                if (!f) continue;
                var s = slides[b];
                var meta = s.querySelector(".culture-figure-meta");
                var h4 = s.querySelector("h4");
                var pp = s.querySelector("p");
                if (meta) {
                    meta.textContent =
                        (f.title || Ti("culture.figure.fallbackTitle")) +
                        " · " +
                        (f.tag || Ti("culture.figure.fallbackTag"));
                }
                if (h4) h4.textContent = f.name || "";
                if (pp) pp.textContent = f.story || "";
                var img = s.querySelector("img");
                if (img) img.setAttribute("alt", f.name || Ti("culture.figure.fallbackName"));
            }
        }

        async function enrichCultureContentForEn(histSrc, figsSrc) {
            if (!window.I18n || typeof window.I18n.getLocale !== "function" || window.I18n.getLocale() === "zh-CN") {
                return;
            }
            const Tb = window.I18n.t.bind(window.I18n);
            if (cultureBundleComplete(histSrc, figsSrc, Tb)) {
                patchCultureDomFromSources(localizeCultureHistoryRows(histSrc, Tb), localizeCultureFigureRows(figsSrc, Tb));
                return;
            }
            if (typeof window.I18n.translateFields !== "function") return;
            var chunk = 18;
            try {
                var hist = histSrc.map(function (h) {
                    return Object.assign({}, h);
                });
                var figs = figsSrc.map(function (f) {
                    return Object.assign({}, f);
                });
                for (var i = 0; i < hist.length; i += chunk) {
                    var sl = hist.slice(i, i + chunk);
                    var tr = await window.I18n.translateFields(sl, ["event"]);
                    for (var j = 0; j < tr.length; j++) hist[i + j] = tr[j];
                }
                for (var i2 = 0; i2 < figs.length; i2 += chunk) {
                    var sl2 = figs.slice(i2, i2 + chunk);
                    var tr2 = await window.I18n.translateFields(sl2, ["name", "title", "story", "tag"]);
                    for (var k = 0; k < tr2.length; k++) figs[i2 + k] = tr2[k];
                }
                patchCultureDomFromSources(hist, figs);
            } catch (e) {}
        }

        async function refreshCultureBodyI18n() {
            if (!cardEl.querySelector(".culture-layout") || !window.I18n) return;
            window.I18n.applyDom(cardEl);
            if (window.I18n.getLocale() === "zh-CN") {
                patchCultureDomFromSources(cultureHistorySource, cultureFiguresSource);
            } else {
                const Tb = Ti;
                if (cultureBundleComplete(cultureHistorySource, cultureFiguresSource, Tb)) {
                    patchCultureDomFromSources(
                        localizeCultureHistoryRows(cultureHistorySource, Tb),
                        localizeCultureFigureRows(cultureFiguresSource, Tb)
                    );
                } else {
                    await enrichCultureContentForEn(cultureHistorySource, cultureFiguresSource);
                }
            }
        }

        function initCultureFigureCarousel() {
            const carouselEl = document.getElementById("cultureFigureCarousel");
            if (!carouselEl) return;
            const slideEls = Array.from(carouselEl.querySelectorAll(".culture-figure-slide"));
            const dotsWrap = carouselEl.querySelector(".culture-figure-dots");
            const prevBtn = carouselEl.querySelector(".culture-figure-nav.prev");
            const nextBtn = carouselEl.querySelector(".culture-figure-nav.next");
            if (!slideEls.length || !dotsWrap) return;
            let idx = 0;
            let timer = null;

            dotsWrap.innerHTML = slideEls
                .map(
                    (_, i) =>
                        `<button type="button" class="culture-figure-dot${i === 0 ? " is-active" : ""}" data-index="${i}" aria-label="${escapeCultureHtml(Ti("culture.figure.dotAria", { n: i + 1 }))}"></button>`
                )
                .join("");
            const dotEls = Array.from(dotsWrap.querySelectorAll(".culture-figure-dot"));

            function render(nextIdx) {
                idx = (nextIdx + slideEls.length) % slideEls.length;
                slideEls.forEach((el, i) => el.classList.toggle("is-active", i === idx));
                dotEls.forEach((el, i) => el.classList.toggle("is-active", i === idx));
            }

            function restart() {
                if (timer) window.clearInterval(timer);
                timer = window.setInterval(function () {
                    render(idx + 1);
                }, 5200);
            }

            if (prevBtn) {
                prevBtn.addEventListener("click", function () {
                    render(idx - 1);
                    restart();
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", function () {
                    render(idx + 1);
                    restart();
                });
            }
            dotEls.forEach((el) => {
                el.addEventListener("click", function () {
                    const nextIdx = Number(el.getAttribute("data-index"));
                    if (Number.isFinite(nextIdx)) {
                        render(nextIdx);
                        restart();
                    }
                });
            });
            render(0);
            restart();
        }

        cardEl.innerHTML = `
            <section class="culture-layout">
                <div class="culture-top">
                    <section class="culture-panel culture-history">
                        <h3 data-i18n="culture.history.heading">${escapeCultureHtml(Ti("culture.history.heading"))}</h3>
                        <div class="culture-history-scroll">
                            <div class="culture-history-track">
                                ${historyView.concat(historyView)
                                    .map(
                                        (h) => `
                                    <article class="culture-history-card">
                                        <div class="culture-history-left">
                                            <span class="culture-year">${escapeCultureHtml(h.year || "--")}</span>
                                            <p>${escapeCultureHtml(h.event || "")}</p>
                                        </div>
                                        <img class="culture-media-img" src="${toAssetPath(pickCultureImageSrc(h))}" alt="${escapeCultureHtml(h.year || Ti("culture.history.altYear"))}" data-img-context="${escapeCultureHtml(Ti("culture.history.heading"))} · ${escapeCultureHtml(String(h.year || "--"))}">
                                    </article>
                                `
                                    )
                                    .join("")}
                            </div>
                        </div>
                    </section>
                    <section class="culture-panel culture-figures">
                        <h3 data-i18n="culture.figures.heading">${escapeCultureHtml(Ti("culture.figures.heading"))}</h3>
                        <div class="culture-figure-carousel" id="cultureFigureCarousel">
                            <button type="button" class="culture-figure-nav prev" aria-label="${escapeCultureHtml(Ti("culture.figure.navPrev"))}" data-i18n-aria-label="culture.figure.navPrev">‹</button>
                            <button type="button" class="culture-figure-nav next" aria-label="${escapeCultureHtml(Ti("culture.figure.navNext"))}" data-i18n-aria-label="culture.figure.navNext">›</button>
                            ${figuresView
                                .map(
                                    (f) => `
                                <article class="culture-figure-slide">
                                    <img class="culture-media-img" src="${toAssetPath(pickCultureImageSrc(f))}" alt="${escapeCultureHtml(f.name || Ti("culture.figure.fallbackName"))}" data-img-context="${escapeCultureHtml(Ti("culture.figures.heading"))} · ${escapeCultureHtml(String(f.name || ""))}">
                                    <div class="culture-figure-meta">${escapeCultureHtml(f.title || Ti("culture.figure.fallbackTitle"))} · ${escapeCultureHtml(f.tag || Ti("culture.figure.fallbackTag"))}</div>
                                    <h4>${escapeCultureHtml(f.name || "")}</h4>
                                    <p>${escapeCultureHtml(f.story || "")}</p>
                                </article>
                            `
                                )
                                .join("")}
                            <div class="culture-figure-dots"></div>
                        </div>
                    </section>
                    <section class="culture-panel culture-map-placeholder" aria-label="${escapeCultureHtml(Ti("culture.placeholder.mapColumn"))}">
                        <div class="culture-map-placeholder-inner" aria-hidden="true"></div>
                    </section>
                </div>
            </section>
        `;
        bindCultureImageFallbacks(cardEl);
        initCultureFigureCarousel();
        if (window.I18n && typeof window.I18n.applyDom === "function") {
            window.I18n.applyDom(cardEl);
        }
        if (window.I18n && typeof window.I18n.getLocale === "function" && window.I18n.getLocale() !== "zh-CN") {
            if (typeof window.requestIdleCallback === "function") {
                window.requestIdleCallback(
                    function () {
                        void enrichCultureContentForEn(cultureHistorySource, cultureFiguresSource);
                    },
                    { timeout: 6000 }
                );
            } else {
                window.setTimeout(function () {
                    void enrichCultureContentForEn(cultureHistorySource, cultureFiguresSource);
                }, 400);
            }
        }
        if (window.I18n && window.I18n.EVENT_NAME) {
            window.addEventListener(window.I18n.EVENT_NAME, function () {
                void refreshCultureBodyI18n();
                if (typeof window.I18n.scheduleLayoutCalibration === "function") {
                    window.I18n.scheduleLayoutCalibration();
                }
            });
        }
        return;
    }

    function appendTool(title, html, onMount) {
        const wrap = document.createElement("section");
        wrap.className = "detail-tool";
        wrap.innerHTML = `<h3>${title}</h3>${html}`;
        cardEl.appendChild(wrap);
        if (typeof onMount === "function") onMount(wrap);
    }

    if (serviceId === "svc-002") {
        const qRoot = document.getElementById("quotationGenerator");
        if (!qRoot) return;

        const quotationFallback = {
            meta: {
                title: "广西侨商商业活动报价模板",
                currency: "CNY",
                defaultTaxRate: 6,
                cities: ["南宁", "玉林", "北海", "防城港", "崇左"]
            },
            templates: [
                {
                    id: "investment_matchmaking",
                    name: "侨商投资对接会",
                    description: "适用于侨商招商推介、项目对接、项目路演与园区考察前后配套会务。",
                    remarks: [
                        "本报价适用于广西侨商投资对接与项目推介活动。",
                        "最终价格以确认后的执行内容为准。"
                    ],
                    items: [
                        { name: "会务策划与执行统筹", unit: "场", price: 6800, calcMode: "fixed", qty: 1 },
                        { name: "会场布置与签到导视", unit: "套", price: 5200, calcMode: "fixed", qty: 1 },
                        { name: "茶歇与基础接待", unit: "人", price: 68, calcMode: "per_person", minQty: 20 },
                        { name: "摄影摄像记录", unit: "天", price: 2800, calcMode: "per_day" }
                    ]
                }
            ]
        };

        function resolveQuotationDataUrl() {
            if (typeof window.YXQ_resolveDateAsset === "function") {
                return window.YXQ_resolveDateAsset("quotation-templates.json");
            }
            return "../../date/quotation-templates.json";
        }

        function escapeQuoteHtml(str) {
            return String(str ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function formatQuoteMoney(num) {
            return (
                "¥" +
                Number(num || 0).toLocaleString("zh-CN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
            );
        }

        function formatQuoteDate(date) {
            const d = date || new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return y + "-" + m + "-" + day;
        }

        qRoot.className = "quotation-generator";
        qRoot.innerHTML = `
            <div class="quotation-input-section quotation-layout-grid">
                <div class="quotation-left">
                    <div class="contract-type-bar quotation-scene-bar">
                        <h3>报价场景</h3>
                        <select id="quoteActivityType" aria-label="报价场景"></select>
                    </div>
                    <div id="quoteSceneDesc" class="quotation-scene-desc" role="note"></div>
                    <div class="contract-section quotation-form-section">
                        <h4>基本信息</h4>
                        <div class="quotation-form-two-col">
                            <div class="quotation-form-col-left">
                                <div class="detail-row"><label for="quoteCustomerName">客户名称</label><input id="quoteCustomerName" type="text" placeholder="选填" autocomplete="organization"></div>
                                <div class="detail-row"><label for="quoteCity">活动城市</label><select id="quoteCity" aria-label="活动城市"></select></div>
                                <div class="detail-row"><label for="quoteParticipants">参与人数</label><input id="quoteParticipants" type="number" min="1" step="1" value="20"></div>
                            </div>
                            <div class="quotation-form-col-right">
                                <div class="detail-row"><label for="quoteDays">活动天数</label><input id="quoteDays" type="number" min="1" step="1" value="1"></div>
                                <div class="detail-row"><label for="quoteTaxRate">税率（%）</label><input id="quoteTaxRate" type="number" min="0" step="0.1" value="6"></div>
                                <div class="detail-row"><label for="quoteNotes">补充说明</label><textarea id="quoteNotes" rows="3" placeholder="选填"></textarea></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="quotation-right">
                    <div class="contract-action-panel">
                        <h4>操作</h4>
                        <div class="button-group contract-button-right">
                            <button type="button" class="detail-btn" id="quoteGenerateBtn">生成报价</button>
                            <button type="button" class="detail-btn" id="quoteResetBtn">重置</button>
                        </div>
                        <div class="button-group contract-button-right">
                            <button type="button" class="detail-btn" id="quoteCopyBtn">复制内容</button>
                            <button type="button" class="detail-btn" id="quoteDownloadBtn">下载TXT</button>
                            <button type="button" class="detail-btn" id="quotePrintBtn">打印预览</button>
                        </div>
                    </div>
                    <div class="contract-preview quotation-preview-panel">
                        <h4>报价结果</h4>
                        <div id="quotePreview" class="quotation-preview-inner"></div>
                    </div>
                </div>
            </div>
        `;

        const el = {
            activityType: qRoot.querySelector("#quoteActivityType"),
            city: qRoot.querySelector("#quoteCity"),
            customerName: qRoot.querySelector("#quoteCustomerName"),
            participants: qRoot.querySelector("#quoteParticipants"),
            days: qRoot.querySelector("#quoteDays"),
            taxRate: qRoot.querySelector("#quoteTaxRate"),
            notes: qRoot.querySelector("#quoteNotes"),
            sceneDesc: qRoot.querySelector("#quoteSceneDesc"),
            quotePreview: qRoot.querySelector("#quotePreview"),
            generateBtn: qRoot.querySelector("#quoteGenerateBtn"),
            resetBtn: qRoot.querySelector("#quoteResetBtn"),
            copyBtn: qRoot.querySelector("#quoteCopyBtn"),
            downloadBtn: qRoot.querySelector("#quoteDownloadBtn"),
            printBtn: qRoot.querySelector("#quotePrintBtn")
        };

        const qState = {
            config: null,
            templates: [],
            currentTemplate: null,
            lastQuote: null
        };

        function getItemQty(item, participants, days) {
            switch (item.calcMode) {
                case "fixed":
                    return Number(item.qty || 1);
                case "per_day":
                    return Number(days || 1);
                case "per_person":
                    return Math.max(Number(participants || 1), Number(item.minQty || 0));
                case "per_person_day":
                    return Number(participants || 1) * Number(days || 1);
                default:
                    return Number(item.qty || 1);
            }
        }

        function buildQuoteData() {
            const customerName = el.customerName.value.trim() || "待填写客户";
            const city = el.city.value;
            const participants = Math.max(Number(el.participants.value || 1), 1);
            const days = Math.max(Number(el.days.value || 1), 1);
            const taxRate = Math.max(Number(el.taxRate.value || 0), 0);
            const notes = el.notes.value.trim();
            const template = qState.currentTemplate || qState.templates[0];
            const rows = (template.items || []).map(function (item, index) {
                const qty = getItemQty(item, participants, days);
                const amount = qty * Number(item.price || 0);
                return {
                    index: index + 1,
                    name: item.name,
                    unit: item.unit || "项",
                    price: Number(item.price || 0),
                    qty: qty,
                    amount: amount
                };
            });
            const subtotal = rows.reduce(function (sum, row) {
                return sum + row.amount;
            }, 0);
            const taxAmount = subtotal * (taxRate / 100);
            const total = subtotal + taxAmount;
            const now = new Date();
            return {
                quoteNo:
                    "Q-" +
                    now.getFullYear() +
                    String(now.getMonth() + 1).padStart(2, "0") +
                    String(now.getDate()).padStart(2, "0") +
                    "-" +
                    String(Date.now()).slice(-5),
                date: formatQuoteDate(now),
                customerName: customerName,
                city: city,
                participants: participants,
                days: days,
                taxRate: taxRate,
                template: template,
                rows: rows,
                subtotal: subtotal,
                taxAmount: taxAmount,
                total: total,
                notes: notes
            };
        }

        function renderQuoteHtml(quote) {
            const rowsHtml = quote.rows
                .map(function (row) {
                    return (
                        "<tr><td>" +
                        row.index +
                        "</td><td>" +
                        escapeQuoteHtml(row.name) +
                        "</td><td>" +
                        escapeQuoteHtml(row.unit) +
                        "</td><td>" +
                        row.qty +
                        "</td><td>" +
                        formatQuoteMoney(row.price) +
                        "</td><td>" +
                        formatQuoteMoney(row.amount) +
                        "</td></tr>"
                    );
                })
                .join("");
            const notesList = [
                "活动场景：" + quote.template.name,
                "执行城市：" + quote.city,
                "参与人数：" + quote.participants + " 人",
                "活动天数：" + quote.days + " 天",
                quote.notes ? "客户补充：" + quote.notes : null
            ].filter(Boolean);
            el.quotePreview.innerHTML =
                '<div class="quote-doc" id="quoteDoc">' +
                "<h2>报价单</h2>" +
                '<div class="doc-subtitle">广西侨商商业活动服务报价参考版</div>' +
                '<div class="doc-meta">' +
                '<div class="meta-card"><div class="meta-label">客户名称</div><div class="meta-value">' +
                escapeQuoteHtml(quote.customerName) +
                "</div></div>" +
                '<div class="meta-card"><div class="meta-label">报价编号</div><div class="meta-value">' +
                escapeQuoteHtml(quote.quoteNo) +
                "</div></div>" +
                '<div class="meta-card"><div class="meta-label">报价日期</div><div class="meta-value">' +
                escapeQuoteHtml(quote.date) +
                "</div></div>" +
                '<div class="meta-card"><div class="meta-label">服务类型</div><div class="meta-value">' +
                escapeQuoteHtml(quote.template.name) +
                "</div></div></div>" +
                '<div class="table-wrap"><table class="quote-table"><thead><tr>' +
                '<th class="quote-th-num">序号</th><th>服务内容</th><th class="quote-th-unit">单位</th>' +
                '<th class="quote-th-qty">数量</th><th class="quote-th-price">单价</th><th class="quote-th-amt">金额</th>' +
                "</tr></thead><tbody>" +
                rowsHtml +
                "</tbody></table></div>" +
                '<div class="summary-box">' +
                '<div class="summary-line"><span>未税金额</span><strong>' +
                formatQuoteMoney(quote.subtotal) +
                "</strong></div>" +
                '<div class="summary-line"><span>税额（' +
                quote.taxRate +
                "%）</span><strong>" +
                formatQuoteMoney(quote.taxAmount) +
                "</strong></div>" +
                '<div class="summary-line"><span>含税总价</span><strong>' +
                formatQuoteMoney(quote.total) +
                "</strong></div></div>" +
                '<div class="section-title">报价说明</div><ul class="notes-list">' +
                notesList.map(function (item) {
                    return "<li>" + escapeQuoteHtml(item) + "</li>";
                }).join("") +
                "</ul>" +
                '<div class="section-title">备注</div><ul class="remark-list">' +
                (quote.template.remarks || [])
                    .map(function (item) {
                        return "<li>" + escapeQuoteHtml(item) + "</li>";
                    })
                    .join("") +
                "</ul>" +
                '<div class="footer-tip">本参考版用于项目演示与功能验证，不构成正式报价承诺。</div></div>';
        }

        function buildQuotePlainText(quote) {
            const lines = [];
            lines.push("报价单");
            lines.push("广西侨商商业活动服务报价参考版");
            lines.push("");
            lines.push("客户名称：" + quote.customerName);
            lines.push("报价编号：" + quote.quoteNo);
            lines.push("报价日期：" + quote.date);
            lines.push("服务类型：" + quote.template.name);
            lines.push("活动城市：" + quote.city);
            lines.push("参与人数：" + quote.participants + " 人");
            lines.push("活动天数：" + quote.days + " 天");
            lines.push("");
            lines.push("明细：");
            quote.rows.forEach(function (row) {
                lines.push(
                    row.index +
                        ". " +
                        row.name +
                        " | 单位：" +
                        row.unit +
                        " | 数量：" +
                        row.qty +
                        " | 单价：" +
                        formatQuoteMoney(row.price) +
                        " | 金额：" +
                        formatQuoteMoney(row.amount)
                );
            });
            lines.push("");
            lines.push("未税金额：" + formatQuoteMoney(quote.subtotal));
            lines.push("税额（" + quote.taxRate + "%）：" + formatQuoteMoney(quote.taxAmount));
            lines.push("含税总价：" + formatQuoteMoney(quote.total));
            lines.push("");
            lines.push("备注：");
            (quote.template.remarks || []).forEach(function (item, index) {
                lines.push(index + 1 + ". " + item);
            });
            if (quote.notes) {
                lines.push("");
                lines.push("客户补充说明：" + quote.notes);
            }
            return lines.join("\n");
        }

        function renderTemplateOptions() {
            el.activityType.innerHTML = "";
            qState.templates.forEach(function (tpl, idx) {
                const opt = document.createElement("option");
                opt.value = tpl.id;
                opt.textContent = tpl.name;
                if (idx === 0) opt.selected = true;
                el.activityType.appendChild(opt);
            });
        }

        function renderCityOptions() {
            const cities = qState.config.cities || quotationFallback.meta.cities;
            el.city.innerHTML = "";
            cities.forEach(function (city, idx) {
                const opt = document.createElement("option");
                opt.value = city;
                opt.textContent = city;
                if (idx === 0) opt.selected = true;
                el.city.appendChild(opt);
            });
        }

        function handleTemplateChange() {
            const template =
                qState.templates.find(function (tpl) {
                    return tpl.id === el.activityType.value;
                }) || qState.templates[0];
            qState.currentTemplate = template;
            el.sceneDesc.textContent = template && template.description ? template.description : "请选择一个报价场景。";
        }

        function handleGenerate() {
            const quote = buildQuoteData();
            qState.lastQuote = quote;
            renderQuoteHtml(quote);
        }

        function handleReset() {
            el.customerName.value = "";
            el.participants.value = "20";
            el.days.value = "1";
            el.taxRate.value = String(qState.config && qState.config.defaultTaxRate != null ? qState.config.defaultTaxRate : 6);
            el.notes.value = "";
            el.activityType.selectedIndex = 0;
            el.city.selectedIndex = 0;
            handleTemplateChange();
            qState.lastQuote = null;
            el.quotePreview.innerHTML =
                '<div class="quotation-empty-state">点击「生成报价」后，将在此显示报价单预览。</div>';
        }

        async function copyQuote() {
            const quote = qState.lastQuote || buildQuoteData();
            const text = buildQuotePlainText(quote);
            try {
                await navigator.clipboard.writeText(text);
                window.alert("报价内容已复制。");
            } catch (err) {
                window.alert("复制失败，请手动复制。");
            }
        }

        function downloadQuote() {
            const quote = qState.lastQuote || buildQuoteData();
            const text = buildQuotePlainText(quote);
            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = quote.template.name + "_报价单_" + quote.date + ".txt";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }

        function getQuotePrintStyles() {
            return (
                "body{font-family:Microsoft YaHei,PingFang SC,sans-serif;padding:24px;color:#111;line-height:1.6}" +
                "h2{text-align:center;margin:0 0 8px;letter-spacing:2px}" +
                ".doc-subtitle{text-align:center;color:#444;margin-bottom:20px}" +
                ".doc-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}" +
                ".meta-card{border:1px solid #ccc;border-radius:8px;padding:10px 12px}" +
                ".meta-label{font-size:12px;color:#666;margin-bottom:4px}" +
                ".meta-value{font-weight:600}" +
                "table{width:100%;border-collapse:collapse;margin:16px 0}" +
                "th,td{border:1px solid #ddd;padding:8px;text-align:left}" +
                "th{background:#f5f5f5}" +
                ".summary-box{margin-top:16px;padding:12px;border:1px solid #eee;border-radius:8px}" +
                ".summary-line{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #ddd}" +
                ".section-title{margin:18px 0 8px;font-size:16px;font-weight:700}" +
                "ul{margin:0;padding-left:20px}" +
                ".footer-tip{margin-top:16px;padding-top:12px;border-top:1px solid #eee;color:#666;font-size:12px}"
            );
        }

        function printQuote() {
            const doc = el.quotePreview.querySelector(".quote-doc");
            if (!doc) {
                window.alert("请先生成报价。");
                return;
            }
            const w = window.open("", "_blank", "width=900,height=720");
            if (!w) return;
            w.document.write(
                "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>报价单</title><style>" +
                    getQuotePrintStyles() +
                    "</style></head><body>"
            );
            w.document.write(doc.outerHTML);
            w.document.write("</body></html>");
            w.document.close();
            w.focus();
            w.print();
        }

        async function loadQuotationData() {
            try {
                const res = await fetch(resolveQuotationDataUrl(), { cache: "no-store" });
                if (!res.ok) throw new Error("HTTP " + res.status);
                return await res.json();
            } catch (err) {
                console.warn("报价模板加载失败，使用兜底数据。", err);
                return quotationFallback;
            }
        }

        function setupQuotation(data) {
            qState.config = data.meta || quotationFallback.meta;
            qState.templates = data.templates || quotationFallback.templates;
            renderTemplateOptions();
            renderCityOptions();
            el.taxRate.value = String(qState.config.defaultTaxRate != null ? qState.config.defaultTaxRate : 6);
            el.activityType.addEventListener("change", handleTemplateChange);
            el.generateBtn.addEventListener("click", handleGenerate);
            el.resetBtn.addEventListener("click", handleReset);
            el.copyBtn.addEventListener("click", copyQuote);
            el.downloadBtn.addEventListener("click", downloadQuote);
            el.printBtn.addEventListener("click", printQuote);
            handleTemplateChange();
            el.quotePreview.innerHTML =
                '<div class="quotation-empty-state">点击「生成报价」后，将在此显示报价单预览。</div>';
        }

        void (async function initQuotation() {
            const data = await loadQuotationData();
            setupQuotation(data);
            if (window.I18n && window.I18n.EVENT_NAME) {
                window.addEventListener(window.I18n.EVENT_NAME, function () {
                    if (typeof window.I18n.scheduleLayoutCalibration === "function") {
                        window.I18n.scheduleLayoutCalibration();
                    }
                });
            }
        })();
        return;
    } else if (serviceId === "svc-004") {
        const Ti =
            window.I18n && typeof window.I18n.t === "function"
                ? window.I18n.t.bind(window.I18n)
                : function (key) {
                      return key;
                  };

        const TARGET_LANGUAGES = [
            { code: "en", name: "English", label: "English · 英语" },
            { code: "zh", name: "Chinese (Simplified)", label: "中文（简体）" },
            { code: "ja", name: "Japanese", label: "日本語 · Japanese" },
            { code: "ko", name: "Korean", label: "한국어 · Korean" },
            { code: "fr", name: "French", label: "Français · French" },
            { code: "de", name: "German", label: "Deutsch · German" },
            { code: "es", name: "Spanish", label: "Español · Spanish" },
            { code: "pt", name: "Portuguese", label: "Português · Portuguese" },
            { code: "it", name: "Italian", label: "Italiano · Italian" },
            { code: "ru", name: "Russian", label: "Русский · Russian" },
            { code: "ar", name: "Arabic", label: "العربية · Arabic" },
            { code: "th", name: "Thai", label: "ไทย · Thai" },
            { code: "vi", name: "Vietnamese", label: "Tiếng Việt · Vietnamese" },
            { code: "id", name: "Indonesian", label: "Bahasa Indonesia" },
            { code: "ms", name: "Malay", label: "Bahasa Melayu · Malay" },
            { code: "fil", name: "Filipino", label: "Filipino" },
            { code: "my", name: "Burmese", label: "မြန်မာ · Burmese" },
            { code: "km", name: "Khmer", label: "ខ្មែរ · Khmer" },
            { code: "lo", name: "Lao", label: "ລາວ · Lao" },
            { code: "hi", name: "Hindi", label: "हिन्दी · Hindi" },
            { code: "tr", name: "Turkish", label: "Türkçe · Turkish" },
            { code: "pl", name: "Polish", label: "Polski · Polish" },
            { code: "nl", name: "Dutch", label: "Nederlands · Dutch" },
            { code: "sv", name: "Swedish", label: "Svenska · Swedish" }
        ];

        const SOURCE_LANGUAGES = [
            { code: "zh", label: "中文（简体）" },
            { code: "en", label: "English" }
        ];

        function escapeTrHtml(s) {
            return String(s || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }

        function buildSourceOptions() {
            return SOURCE_LANGUAGES.map(function (o) {
                return '<option value="' + escapeTrHtml(o.code) + '">' + escapeTrHtml(o.label) + "</option>";
            }).join("");
        }

        function buildTargetOptions() {
            return TARGET_LANGUAGES.map(function (o) {
                return (
                    '<option value="' +
                    escapeTrHtml(o.code) +
                    '" data-tname="' +
                    escapeTrHtml(o.name) +
                    '">' +
                    escapeTrHtml(o.label) +
                    "</option>"
                );
            }).join("");
        }

        const toolHtml =
            '<div class="translation-tool" id="translationToolRoot">' +
            '<div class="translation-lang-row">' +
            '<div class="detail-row"><label for="trSource" data-i18n="service.translation.sourceLang">' +
            escapeTrHtml(Ti("service.translation.sourceLang")) +
            '</label><select id="trSource">' +
            buildSourceOptions() +
            "</select></div>" +
            '<div class="detail-row"><label for="trTarget" data-i18n="service.translation.targetLang">' +
            escapeTrHtml(Ti("service.translation.targetLang")) +
            '</label><select id="trTarget">' +
            buildTargetOptions() +
            "</select></div>" +
            "</div>" +
            '<div class="detail-row"><label for="trIn" data-i18n="service.translation.inputLabel">' +
            escapeTrHtml(Ti("service.translation.inputLabel")) +
            '</label><textarea id="trIn" rows="6" data-i18n-placeholder="service.translation.placeholder">' +
            escapeTrHtml("欢迎来到玉林侨务数字平台") +
            "</textarea></div>" +
            '<div class="translation-actions">' +
            '<button type="button" class="detail-btn" id="trRun" data-i18n="service.translation.runBtn">' +
            escapeTrHtml(Ti("service.translation.runBtn")) +
            '</button>' +
            '<button type="button" class="detail-btn detail-btn--ghost" id="trCopy" data-i18n="service.translation.copyBtn">' +
            escapeTrHtml(Ti("service.translation.copyBtn")) +
            '</button>' +
            '<button type="button" class="detail-btn detail-btn--ghost" id="trClear" data-i18n="service.translation.clearBtn">' +
            escapeTrHtml(Ti("service.translation.clearBtn")) +
            "</button></div>" +
            '<div class="detail-row"><label for="trOut" data-i18n="service.translation.outputLabel">' +
            escapeTrHtml(Ti("service.translation.outputLabel")) +
            '</label><textarea id="trOut" rows="7" readonly class="detail-output translation-output" aria-live="polite"></textarea></div>' +
            '<p class="translation-hint" data-i18n="service.translation.hint">' +
            escapeTrHtml(Ti("service.translation.hint")) +
            "</p></div>";

        appendTool(Ti("service.translation.toolHeading"), toolHtml, function (wrap) {
            const elIn = wrap.querySelector("#trIn");
            const elOut = wrap.querySelector("#trOut");
            const selSrc = wrap.querySelector("#trSource");
            const selTgt = wrap.querySelector("#trTarget");
            const btnRun = wrap.querySelector("#trRun");
            const btnCopy = wrap.querySelector("#trCopy");
            const btnClear = wrap.querySelector("#trClear");

            function selectedTargetName() {
                const opt = selTgt.selectedOptions && selTgt.selectedOptions[0];
                if (!opt) return "English";
                return opt.getAttribute("data-tname") || opt.textContent || "English";
            }

            function syncTargetDefault() {
                const s = selSrc.value;
                if (s === "zh") {
                    for (let i = 0; i < selTgt.options.length; i++) {
                        if (selTgt.options[i].value === "en") {
                            selTgt.selectedIndex = i;
                            return;
                        }
                    }
                } else {
                    for (let j = 0; j < selTgt.options.length; j++) {
                        if (selTgt.options[j].value === "zh") {
                            selTgt.selectedIndex = j;
                            return;
                        }
                    }
                }
            }

            selSrc.addEventListener("change", syncTargetDefault);

            async function runTranslate() {
                const raw = elIn && elIn.value ? elIn.value.trim() : "";
                if (!raw) {
                    elOut.value = Ti("service.translation.emptyInput");
                    return;
                }
                if (selSrc.value === selTgt.value) {
                    elOut.value = raw;
                    return;
                }
                elOut.value = Ti("service.translation.loading");
                btnRun.disabled = true;
                try {
                    if (window.I18n && typeof window.I18n.translatePlainText === "function") {
                        const result = await window.I18n.translatePlainText(raw, {
                            source: selSrc.value,
                            target: selTgt.value,
                            targetName: selectedTargetName()
                        });
                        if (result && String(result).trim()) {
                            elOut.value = String(result).trim();
                        } else {
                            elOut.value = Ti("service.translation.error");
                        }
                    } else {
                        elOut.value = Ti("service.translation.error");
                    }
                } catch (e) {
                    elOut.value = Ti("service.translation.error");
                } finally {
                    btnRun.disabled = false;
                }
            }

            btnRun.addEventListener("click", function () {
                void runTranslate();
            });
            btnClear.addEventListener("click", function () {
                elIn.value = "";
                elOut.value = "";
            });
            btnCopy.addEventListener("click", async function () {
                const t = elOut.value || "";
                if (!t) return;
                try {
                    await navigator.clipboard.writeText(t);
                    window.alert(Ti("service.translation.copyOk"));
                } catch (e) {
                    window.alert(Ti("service.translation.error"));
                }
            });

            if (window.I18n && typeof window.I18n.applyDom === "function") {
                window.I18n.applyDom(wrap);
            }
            syncTargetDefault();

            if (window.I18n && window.I18n.EVENT_NAME) {
                window.addEventListener(window.I18n.EVENT_NAME, function () {
                    if (window.I18n && typeof window.I18n.applyDom === "function") {
                        window.I18n.applyDom(wrap);
                    }
                    if (typeof window.I18n.scheduleLayoutCalibration === "function") {
                        window.I18n.scheduleLayoutCalibration();
                    }
                });
            }
        });
    } else if (serviceId === "svc-006") {
        appendTool(
            "出海助手问答（演示）",
            `
            <div class="detail-row"><label>问题</label><input id="aQ" value="我要先做哪一步出海准备？"></div>
            <button class="detail-btn" id="aAsk">获取建议</button>
            <div class="detail-output" id="aOut">这里会给出简要建议</div>
            `,
            (wrap) => {
                wrap.querySelector("#aAsk").addEventListener("click", function () {
                    const q = wrap.querySelector("#aQ").value.trim();
                    const answer =
                        q.includes("合同") ? "建议先使用合同模板，完成条款校验后再进入签约流程。"
                        : q.includes("市场") ? "建议先做国别市场分析，明确准入与渠道策略。"
                        : "建议先完成目标国别调研、资质核验和供应链路径评估，再进入商务洽谈。";
                    wrap.querySelector("#aOut").textContent = `问题：${q || "（空）"}\n建议：${answer}`;
                });
            }
        );
    } else if (serviceId === "svc-003") {
        const genRoot = document.getElementById("contractGenerator");
        if (!genRoot) return;

        const contractFallbackData = {
            templates: [
                {
                    id: "fallback_contract",
                    name: "通用演示合同",
                    category: "演示模板",
                    description: "当 JSON 加载失败时使用的兜底模板。",
                    fields: [
                        { key: "partyAName", label: "甲方名称", type: "text", defaultValue: "甲方示例" },
                        { key: "partyBName", label: "乙方名称", type: "text", defaultValue: "乙方示例" },
                        { key: "serviceContent", label: "合作内容", type: "textarea", defaultValue: "请填写合作内容。" },
                        { key: "signDate", label: "签署日期", type: "date", defaultValue: new Date().toISOString().slice(0, 10) }
                    ],
                    body: "通用演示合同\n\n甲方：{{partyAName}}\n乙方：{{partyBName}}\n\n合作内容：{{serviceContent}}\n\n签署日期：{{signDate}}\n\n本模板为兜底演示内容。"
                }
            ]
        };

        function resolveContractTemplatesUrl() {
            if (typeof window.YXQ_resolveDateAsset === "function") {
                return window.YXQ_resolveDateAsset("contract-templates.json");
            }
            return "../../date/contract-templates.json";
        }

        function escapeContractHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function fillContractTemplate(body, values) {
            return String(body || "").replace(/\{\{(.*?)\}\}/g, function (_, key) {
                const cleanKey = String(key).trim();
                const v = values[cleanKey];
                return v != null ? v : "";
            });
        }

        genRoot.className = "contract-generator";
        genRoot.innerHTML = `
            <div class="contract-input-section contract-layout-grid">
                <div class="contract-left">
                    <div class="contract-type-bar">
                        <h3>合同类型</h3>
                        <select id="contractTemplateSelect" aria-label="合同类型"></select>
                    </div>
                    <div id="contractTemplateMeta" class="contract-section contract-template-meta" hidden></div>
                    <div class="contract-section contract-fields-panel">
                        <h4>填写信息</h4>
                        <div id="contractDynamicForm" class="contract-fields-scroll"></div>
                    </div>
                </div>
                <div class="contract-right">
                    <div class="contract-action-panel">
                        <h4>操作</h4>
                        <div class="button-group contract-button-right">
                            <button type="button" class="detail-btn" id="generateContract">生成合同</button>
                            <button type="button" class="detail-btn" id="generatePDF">生成PDF</button>
                        </div>
                        <div class="button-group contract-button-right">
                            <button type="button" class="detail-btn" id="copyContractBtn">复制内容</button>
                            <button type="button" class="detail-btn" id="downloadContractTxt">下载TXT</button>
                            <button type="button" class="detail-btn" id="printContractBtn">打印预览</button>
                        </div>
                    </div>
                    <div class="contract-preview contract-preview-panel">
                        <h4>合同预览</h4>
                        <pre id="contractOutput" class="detail-output contract-preview-body"></pre>
                    </div>
                </div>
            </div>
        `;

        const templateSelect = genRoot.querySelector("#contractTemplateSelect");
        const templateMeta = genRoot.querySelector("#contractTemplateMeta");
        const dynamicForm = genRoot.querySelector("#contractDynamicForm");
        const previewEl = genRoot.querySelector("#contractOutput");
        const generateBtn = genRoot.querySelector("#generateContract");
        const pdfBtn = genRoot.querySelector("#generatePDF");
        const copyBtn = genRoot.querySelector("#copyContractBtn");
        const downloadBtn = genRoot.querySelector("#downloadContractTxt");
        const printBtn = genRoot.querySelector("#printContractBtn");

        const state = {
            templates: [],
            currentTemplate: null,
            values: {}
        };

        function renderTemplateMeta(template) {
            if (!templateMeta) return;
            var cat = escapeContractHtml(template.category || "未分类");
            var desc = escapeContractHtml(template.description || "—");
            templateMeta.innerHTML =
                '<p class="contract-meta-line"><span class="contract-meta-k">分类</span> ' +
                cat +
                '</p><p class="contract-meta-line contract-meta-desc"><span class="contract-meta-k">说明</span> ' +
                desc +
                "</p>";
            templateMeta.hidden = false;
        }

        function buildContractFieldRow(field) {
            const row = document.createElement("div");
            row.className = "detail-row";
            const lab = document.createElement("label");
            lab.textContent = field.label;
            row.appendChild(lab);
            let input;
            if (field.type === "textarea") {
                input = document.createElement("textarea");
            } else {
                input = document.createElement("input");
                input.type = field.type || "text";
            }
            input.name = field.key;
            input.value = state.values[field.key] != null ? state.values[field.key] : field.defaultValue != null ? field.defaultValue : "";
            if (field.placeholder) input.placeholder = field.placeholder;
            if (field.required) input.required = true;
            input.addEventListener("input", function () {
                state.values[field.key] = input.value;
                renderContractPreview();
            });
            row.appendChild(input);
            return row;
        }

        function renderContractForm(template) {
            if (!dynamicForm) return;
            dynamicForm.innerHTML = "";
            state.values = {};
            (template.fields || []).forEach(function (field) {
                state.values[field.key] =
                    field.defaultValue !== undefined && field.defaultValue !== null ? String(field.defaultValue) : "";
                dynamicForm.appendChild(buildContractFieldRow(field));
            });
        }

        function renderContractPreview() {
            if (!state.currentTemplate || !previewEl) return;
            previewEl.textContent = fillContractTemplate(state.currentTemplate.body, state.values);
        }

        function renderTemplateOptions() {
            if (!templateSelect) return;
            templateSelect.innerHTML = "";
            state.templates.forEach(function (template) {
                const option = document.createElement("option");
                option.value = template.id;
                option.textContent = template.name;
                templateSelect.appendChild(option);
            });
        }

        function setActiveContractTemplate(templateId) {
            const template =
                state.templates.find(function (item) {
                    return item.id === templateId;
                }) || state.templates[0];
            state.currentTemplate = template;
            if (templateSelect && template) templateSelect.value = template.id;
            renderTemplateMeta(template);
            renderContractForm(template);
            renderContractPreview();
        }

        async function loadContractTemplates() {
            try {
                const res = await fetch(resolveContractTemplatesUrl(), { cache: "no-store" });
                if (!res.ok) throw new Error("HTTP " + res.status);
                const data = await res.json();
                return Array.isArray(data.templates) && data.templates.length ? data : contractFallbackData;
            } catch (err) {
                console.warn("合同模板加载失败，已启用兜底模板：", err);
                return contractFallbackData;
            }
        }

        function downloadContractTextFile() {
            const content = previewEl ? previewEl.textContent || "" : "";
            const filename = (state.currentTemplate && state.currentTemplate.id ? state.currentTemplate.id : "contract") + "-" + Date.now() + ".txt";
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }

        function printContractPreview() {
            const content = escapeContractHtml(previewEl ? previewEl.textContent || "" : "").replace(/\n/g, "<br/>");
            const title = escapeContractHtml((state.currentTemplate && state.currentTemplate.name) || "合同预览");
            const win = window.open("", "_blank", "width=960,height=720");
            if (!win) return;
            win.document.write(
                "<!doctype html><html><head><meta charset=\"utf-8\"><title>" +
                    title +
                    "</title><style>body{font-family:Arial,\"Microsoft YaHei\",sans-serif;padding:32px;line-height:1.9;color:#111}h1{font-size:24px;margin-bottom:20px}hr{margin:24px 0}</style></head><body><h1>" +
                    title +
                    "</h1><hr /><div>" +
                    content +
                    "</div></body></html>"
            );
            win.document.close();
            win.focus();
            win.print();
        }

        async function copyContractContent() {
            const content = previewEl ? previewEl.textContent || "" : "";
            try {
                await navigator.clipboard.writeText(content);
                copyBtn.textContent = "已复制";
                window.setTimeout(function () {
                    copyBtn.textContent = "复制内容";
                }, 1200);
            } catch (e) {
                copyBtn.textContent = "复制失败";
                window.setTimeout(function () {
                    copyBtn.textContent = "复制内容";
                }, 1200);
            }
        }

        function generateContractPdf() {
            const contractContent = previewEl ? previewEl.textContent || "" : "";
            const contractTitle = (state.currentTemplate && state.currentTemplate.name) || "合同";
            let signDate = "";
            if (state.values && state.values.signDate) signDate = String(state.values.signDate);
            if (!signDate) signDate = new Date().toISOString().slice(0, 10);
            var PdfCtor =
                window.jspdf && window.jspdf.jsPDF
                    ? window.jspdf.jsPDF
                    : typeof window.jsPDF !== "undefined"
                      ? window.jsPDF
                      : null;
            if (!PdfCtor) {
                alert("PDF 组件未加载，请检查网络后重试。");
                return;
            }
            const jsPDF = PdfCtor;
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(contractTitle, 105, 20, { align: "center" });
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            const lines = contractContent.split("\n");
            var yPosition = 40;
            const lineHeight = 7;
            const maxWidth = 170;
            lines.forEach(function (line) {
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                const wrappedText = doc.splitTextToSize(line, maxWidth);
                wrappedText.forEach(function (wrappedLine) {
                    doc.text(wrappedLine, 20, yPosition);
                    yPosition += lineHeight;
                });
            });
            doc.save("合同_" + contractTitle + "_" + signDate.replace(/-/g, "") + ".pdf");
        }

        void (async function initContractGenerator() {
            const data = await loadContractTemplates();
            state.templates = data.templates || [];
            renderTemplateOptions();
            setActiveContractTemplate(state.templates[0] && state.templates[0].id);

            if (templateSelect) {
                templateSelect.addEventListener("change", function () {
                    setActiveContractTemplate(templateSelect.value);
                });
            }
            if (generateBtn) generateBtn.addEventListener("click", renderContractPreview);
            if (pdfBtn) pdfBtn.addEventListener("click", generateContractPdf);
            if (copyBtn) copyBtn.addEventListener("click", copyContractContent);
            if (downloadBtn) downloadBtn.addEventListener("click", downloadContractTextFile);
            if (printBtn) printBtn.addEventListener("click", printContractPreview);

            if (window.I18n && window.I18n.EVENT_NAME) {
                window.addEventListener(window.I18n.EVENT_NAME, function () {
                    if (typeof window.I18n.scheduleLayoutCalibration === "function") {
                        window.I18n.scheduleLayoutCalibration();
                    }
                });
            }
        })();
        return;
    } else {
        appendTool(
            "快速试用",
            `
            <div class="detail-row"><label>输入业务需求</label><textarea id="gText">请根据当前服务生成一条执行建议。</textarea></div>
            <button class="detail-btn" id="gRun">生成建议</button>
            <div class="detail-output" id="gOut">点击按钮生成</div>
            `,
            (wrap) => {
                wrap.querySelector("#gRun").addEventListener("click", function () {
                    const txt = wrap.querySelector("#gText").value.trim();
                    wrap.querySelector("#gOut").textContent = txt ? `已记录需求：${txt}\n建议：先标准化资料，再进入该服务流程。` : "请输入内容后再试。";
                });
            }
        );
    }
})();
