(async function () {
    const industryId = document.body.getAttribute("data-industry-id");
    const titleEl = document.getElementById("industryTitle");
    const descEl = document.getElementById("industryDesc");
    if (!industryId || !titleEl || !descEl || !window.AppDataUtils) return;

    const offline = window.location.protocol === "file:";
    const offlineRows = (window.APP_DATASETS && window.APP_DATASETS.industry) || [];
    const offlineProfiles = (window.APP_DATASETS && window.APP_DATASETS.industryProfiles) || [];

    async function rows() {
        if (offline) return offlineRows;
        try {
            return await window.AppDataUtils.loadCsv("../../date/industry.csv");
        } catch (e) {
            return offlineRows;
        }
    }

    async function profileRows() {
        if (offline) return offlineProfiles;
        try {
            return await window.AppDataUtils.loadCsv("../../date/industry_profiles.csv");
        } catch (e) {
            return offlineProfiles;
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

    function unwrapIndustryListPayload(raw) {
        if (Array.isArray(raw)) return raw;
        if (!raw || typeof raw !== "object") return null;
        const inner = raw.data ?? raw.result ?? raw.payload ?? raw.list ?? raw.items;
        return Array.isArray(inner) ? inner : null;
    }

    async function fetchIndustryListFromRemoteApi(cfg) {
        const url = String((cfg || {}).industryListUrl || "").trim();
        if (!url) return null;
        const sep = url.includes("?") ? "&" : "?";
        const init = Object.assign({ cache: "no-store" }, (cfg || {}).industryFetchInit || {});
        const resp = await fetch(url + sep + "cb=" + Date.now(), init);
        if (!resp.ok) throw new Error("industryListUrl HTTP " + resp.status);
        const raw = await resp.json();
        return unwrapIndustryListPayload(raw);
    }

    async function loadIndustryArkData() {
        await loadOptionalPlatformDataApiConfig();
        const platformCfg = window.PLATFORM_DATA_API || {};
        const tryRemote = Boolean(String(platformCfg.industryListUrl || "").trim());
        if (tryRemote) {
            try {
                const list = await fetchIndustryListFromRemoteApi(platformCfg);
                if (list && list.length) return list;
            } catch (e) {}
        }
        try {
            const response = await fetch("../../date/industry_ark.json?cb=" + Date.now(), { cache: "no-store" });
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {}
        return null;
    }

    function toAssetPath(path) {
        const raw = String(path || "").trim();
        const fallback = "../../images/placeholders/generic-placeholder.svg";
        if (!raw) return fallback;
        if (raw.startsWith("data:")) return raw;
        if (/^https?:\/\//i.test(raw) || raw.startsWith("//")) return fallback;
        return raw.replace(/^(\.\.\/)+/, "../../");
    }

    const items = await rows();
    let lastItem = items.find((x) => x.id === industryId);
    const joiner = window.I18n && window.I18n.t ? window.I18n.t("page.docTitle.joiner") : " · ";

    const profiles = lastItem
        ? (await profileRows()).filter((x) => x.industry_id === industryId)
        : [];
    const hero = profiles.find((p) => p.section === "hero");
    const blocks = profiles.filter((p) => p.section !== "hero");

    if (lastItem) {
        const arkData = await loadIndustryArkData();
        if (arkData && Array.isArray(arkData) && arkData.length > 0) {
            const arkItem = arkData.find(
                (x) =>
                    x.id === industryId ||
                    x.industry_id === industryId ||
                    (lastItem.name && x.name === lastItem.name)
            );
            if (arkItem) {
                lastItem.name = arkItem.name || lastItem.name;
                lastItem.summary = arkItem.summary || lastItem.summary;
                lastItem.status = arkItem.status || lastItem.status;
                lastItem.resource = arkItem.resource || lastItem.resource;
                lastItem.market = arkItem.market || lastItem.market;
                lastItem.supply_chain = arkItem.supply_chain || lastItem.supply_chain;
                lastItem.opportunity = arkItem.opportunity || lastItem.opportunity;
                lastItem.image = arkItem.image || lastItem.image;
            }
        }
    }

    const cardEl = descEl.closest(".section-card");

    function applyIndustryCardI18n(item, T) {
        const id = String(item.id || "");
        const o = Object.assign({}, item);
        if (!id) return o;
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
            const tv = T(pr[1]);
            if (tv !== pr[1]) o[pr[0]] = tv;
        });
        return o;
    }
    function industryDetailCardBundled(item, T) {
        const id = String(item.id || "");
        if (!id) return false;
        return [".name", ".summary", ".status", ".resource", ".market", ".supply_chain", ".opportunity"].every(function (
            suf
        ) {
            const k = "industry.card." + id + suf;
            return T(k) !== k;
        });
    }
    function industryProfileBundled(industryId, T) {
        const pid = String(industryId || "");
        if (!pid) return false;
        return ["hero", "history", "case"].every(function (sec) {
            const tk = "industry.profile." + pid + "." + sec + ".title";
            const ck = "industry.profile." + pid + "." + sec + ".content";
            return T(tk) !== tk && T(ck) !== ck;
        });
    }

    async function applyIndustryHeader() {
        const T = window.I18n && window.I18n.t ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        if (!lastItem) {
            titleEl.textContent = T("industryDetail.notFoundTitle");
            descEl.textContent = T("industryDetail.notFoundDesc");
            document.title = T("industryDetail.notFoundTitle") + joiner + T("home.title");
            return;
        }
        let display = { name: lastItem.name || "", summary: lastItem.summary || "" };
        if (window.I18n && window.I18n.getLocale() !== "zh-CN") {
            const fromKeys = applyIndustryCardI18n(lastItem, T);
            display = { name: fromKeys.name || "", summary: fromKeys.summary || "" };
            const needArk =
                typeof window.I18n.translateIndustryRows === "function" &&
                !industryDetailCardBundled(lastItem, T);
            if (needArk) {
                try {
                    const tr = await window.I18n.translateIndustryRows([lastItem]);
                    if (tr && tr[0]) {
                        display = {
                            name: tr[0].name || display.name,
                            summary: tr[0].summary || display.summary
                        };
                    }
                } catch (e) {}
            }
        }
        titleEl.textContent = display.name || T("industryDetail.nameFallback");
        if (descEl.isConnected) {
            descEl.textContent = display.summary || T("industryDetail.descFallback");
        }
        document.title =
            (display.name || T("industryDetail.nameFallback")) + joiner + (window.I18n ? window.I18n.t("home.title") : "");
    }

    async function renderIndustryDetailBody() {
        if (!lastItem || !cardEl) return;
        const item = lastItem;
        const T = window.I18n && window.I18n.t ? window.I18n.t.bind(window.I18n) : function (k) { return k; };
        const loc = window.I18n && window.I18n.getLocale ? window.I18n.getLocale() : "zh-CN";

        let displayItem = Object.assign({}, item);
        const pid = String(item.id || "");
        if (loc !== "zh-CN" && window.I18n) {
            displayItem = applyIndustryCardI18n(item, T);
            const needRowArk =
                typeof window.I18n.translateIndustryRows === "function" &&
                !industryDetailCardBundled(item, T);
            if (needRowArk) {
                try {
                    const tr = await window.I18n.translateIndustryRows([item]);
                    if (tr && tr[0]) displayItem = applyIndustryCardI18n(Object.assign({}, item, tr[0]), T);
                } catch (e) {}
            }
        }

        let heroTitle =
            (hero && hero.title && hero.title.trim()) ||
            displayItem.name ||
            T("industryDetail.introHeading");
        let heroContent =
            (hero && hero.content && hero.content.trim()) || displayItem.summary || "";

        if (loc !== "zh-CN" && pid && industryProfileBundled(pid, T)) {
            const htk = "industry.profile." + pid + ".hero.title";
            const hck = "industry.profile." + pid + ".hero.content";
            const htt = T(htk);
            const hcc = T(hck);
            if (htt !== htk) heroTitle = htt;
            if (hcc !== hck) heroContent = hcc;
        } else if (loc !== "zh-CN" && hero && window.I18n && typeof window.I18n.translateFields === "function") {
            try {
                const tr = await window.I18n.translateFields(
                    [{ title: hero.title || "", content: hero.content || "" }],
                    ["title", "content"]
                );
                if (tr && tr[0]) {
                    if (tr[0].title && String(tr[0].title).trim()) heroTitle = tr[0].title;
                    else if (!(hero.title && hero.title.trim()))
                        heroTitle = displayItem.name || T("industryDetail.introHeading");
                    if (tr[0].content && String(tr[0].content).trim()) heroContent = tr[0].content;
                    else if (!(hero.content && hero.content.trim())) heroContent = displayItem.summary || "";
                }
            } catch (e) {}
        }

        let blockParts = blocks.map((b) => ({
            b: b,
            metaLabel: b.section === "history" ? T("industryDetail.promoHistory") : T("industryDetail.promoStory"),
            bt: b.title || "",
            bc: b.content || ""
        }));

        if (loc !== "zh-CN" && pid && industryProfileBundled(pid, T)) {
            blockParts = blocks.map((b) => {
                const sec = String(b.section || "");
                const tk = "industry.profile." + pid + "." + sec + ".title";
                const ck = "industry.profile." + pid + "." + sec + ".content";
                let bt = b.title || "";
                let bc = b.content || "";
                const tt = T(tk);
                const tv = T(ck);
                if (tt !== tk) bt = tt;
                if (tv !== ck) bc = tv;
                return {
                    b: b,
                    metaLabel: b.section === "history" ? T("industryDetail.promoHistory") : T("industryDetail.promoStory"),
                    bt: bt,
                    bc: bc
                };
            });
        } else if (blocks.length && loc !== "zh-CN" && window.I18n && typeof window.I18n.translateFields === "function") {
            try {
                const tr = await window.I18n.translateFields(
                    blocks.map((b) => ({ title: b.title || "", content: b.content || "" })),
                    ["title", "content"]
                );
                if (tr && tr.length === blocks.length) {
                    blockParts = blocks.map((b, i) => ({
                        b: b,
                        metaLabel:
                            b.section === "history" ? T("industryDetail.promoHistory") : T("industryDetail.promoStory"),
                        bt:
                            tr[i] && tr[i].title && String(tr[i].title).trim()
                                ? tr[i].title
                                : b.title || "",
                        bc:
                            tr[i] && tr[i].content && String(tr[i].content).trim()
                                ? tr[i].content
                                : b.content || ""
                    }));
                }
            } catch (e) {}
        }

        const tagName = displayItem.name || T("industryDetail.nameFallback");

        cardEl.innerHTML = `
        <section class="promo-hero">
            <img src="${toAssetPath((hero && hero.image) || item.image)}" alt="${tagName}">
            <div>
                <h3>${heroTitle}</h3>
                <p>${heroContent}</p>
            </div>
        </section>
        <section class="promo-grid">
            ${blockParts
                .map(
                    ({ b, metaLabel, bt, bc }) => `
                <article class="promo-card">
                    <img src="${toAssetPath(b.image)}" alt="${bt || metaLabel}">
                    <div class="promo-meta">${metaLabel}</div>
                    <h4>${bt || ""}</h4>
                    <p>${bc || ""}</p>
                    <div class="promo-tag">${tagName}</div>
                </article>
            `
                )
                .join("")}
        </section>
    `;
    }

    await applyIndustryHeader();
    await renderIndustryDetailBody();

    if (window.I18n && window.I18n.EVENT_NAME) {
        window.addEventListener(window.I18n.EVENT_NAME, function () {
            applyIndustryHeader();
            renderIndustryDetailBody();
            if (typeof window.I18n.scheduleLayoutCalibration === "function") {
                window.I18n.scheduleLayoutCalibration();
            }
        });
    }
})();
