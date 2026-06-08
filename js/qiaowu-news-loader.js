(function (global) {
    "use strict";

    var MAX_MERGED_ROWS = 150;
    var WARM_SESSION_KEY = "yuxiaoqiao_qiaowu_warm_v2";
    var MAX_WARM_ROWS = 150;

    function readWarmSessionRows() {
        try {
            var raw = global.sessionStorage.getItem(WARM_SESSION_KEY);
            if (!raw) return null;
            var o = JSON.parse(raw);
            if (!o || !Array.isArray(o.rows)) return null;
            var out = [];
            for (var i = 0; i < o.rows.length; i++) {
                var r = normalizeQiaowuRow(o.rows[i]);
                if (r) out.push(r);
            }
            return out.length ? out : null;
        } catch (e) {
            return null;
        }
    }

    function writeWarmSessionRows(rows) {
        try {
            var slice = (rows || []).slice(0, MAX_WARM_ROWS);
            global.sessionStorage.setItem(WARM_SESSION_KEY, JSON.stringify({ t: Date.now(), rows: slice }));
        } catch (e) {}
    }

    function peekWarmRows() {
        return readWarmSessionRows() || [];
    }

    function isFileProtocol() {
        try {
            return global.location && global.location.protocol === "file:";
        } catch (e) {
            return false;
        }
    }

    function urlKey(u) {
        try {
            var x = new URL(String(u || "").trim());
            return x.href.toLowerCase();
        } catch (e) {
            return String(u || "").trim().toLowerCase();
        }
    }

    function mergeNewsPreferNew(freshRows, oldRows) {
        var seen = {};
        var out = [];
        function pushRow(r) {
            if (!r || !r.url) return;
            var k = urlKey(r.url);
            if (!k || seen[k]) return;
            seen[k] = true;
            out.push(r);
        }
        (freshRows || []).forEach(pushRow);
        (oldRows || []).forEach(pushRow);
        return out.slice(0, MAX_MERGED_ROWS);
    }

    function normalizeQiaowuRow(it) {
        if (!it || typeof it !== "object") return null;
        var url = String(it.url || it.link || it.href || "").trim();
        var title = String(it.title || it.headline || "").trim();
        if (!title || !url) return null;
        if (!/^https?:\/\//i.test(url) && !/^file:\/\//i.test(url)) {
            try {
                url = String(new URL(url, global.location && global.location.href ? global.location.href : undefined));
            } catch (e1) {
                return null;
            }
        }
        if (!/^https?:\/\//i.test(url) && !/^file:\/\//i.test(url)) return null;
        var i18n = it.i18n && typeof it.i18n === "object" ? it.i18n : null;
        var enBlock = i18n && (i18n["en-US"] || i18n.en) ? i18n["en-US"] || i18n.en : null;
        var title_en = String(
            it.title_en ||
                it.titleEn ||
                (enBlock && (enBlock.title || enBlock.headline)) ||
                ""
        ).trim();
        var summary_en = String(
            it.summary_en || it.summaryEn || (enBlock && (enBlock.summary || enBlock.excerpt)) || ""
        ).trim();
        var summary = String(it.summary || it.excerpt || "").trim();
        var source = String(it.source || it.media || "").trim();
        if (!summary && source) summary = source;
        var dynLocalId = String(it.dynLocalId || it.dyn_local_id || "").trim();
        var o = {
            title: title,
            title_en: title_en,
            summary: summary,
            summary_en: summary_en,
            time: String(it.time || it.date || it.publishedAt || "").trim(),
            url: url,
            source: source,
            content: String(it.content || it.full_text || it.fullText || "").trim(),
            excerpt: String(it.excerpt || "").trim()
        };
        if (dynLocalId) o.dynLocalId = dynLocalId;
        if (i18n) o.i18n = i18n;
        return o;
    }

    function hrefForDynamicListWithLocalDynId(localId) {
        var lid = encodeURIComponent(String(localId || "").trim());
        if (!lid) return "";
        try {
            var cur = String(global.location.href || "").split("#")[0];
            var path = global.location.pathname || "";
            var onDynamic = /(^|\/)dynamic\.html$/i.test(path);
            var listBase = onDynamic ? cur : String(new URL("pages/dynamic.html", cur));
            return listBase.split("#")[0] + "#" + lid;
        } catch (e) {
            return "";
        }
    }

    function rowsFromDynamicDataset() {
        var ds = global.APP_DATASETS && global.APP_DATASETS.dynamic;
        if (!Array.isArray(ds) || !ds.length) return [];
        var out = [];
        for (var i = 0; i < ds.length; i++) {
            var r = ds[i];
            if (!r || typeof r !== "object") continue;
            var title = String(r.title || "").trim();
            var lid = String(r.id !== undefined && r.id !== null ? r.id : "").trim();
            if (!title || !lid) continue;
            var url = hrefForDynamicListWithLocalDynId(lid);
            if (!url) continue;
            var row = normalizeQiaowuRow({
                title: title,
                time: String(r.date || "").trim(),
                url: url,
                summary: String(r.summary || "").trim(),
                source: String(r.source || "").trim(),
                content: String(r.content || "").trim(),
                dynLocalId: lid
            });
            if (row) out.push(row);
        }
        return out;
    }

    function mergeFileWithDynamicCsv(fileRows) {
        var dyn = rowsFromDynamicDataset();
        if (!(fileRows && fileRows.length) && !dyn.length) return [];
        var seen = Object.create(null);
        var out = [];
        function key(r) {
            return (String(r.title || "").trim() + "\t" + String(r.time || "").trim()).toLowerCase();
        }
        function pushAll(arr) {
            for (var i = 0; i < arr.length; i++) {
                var r = arr[i];
                if (!r) continue;
                var k = key(r);
                if (seen[k]) continue;
                seen[k] = true;
                out.push(r);
            }
        }
        pushAll(fileRows || []);
        pushAll(dyn);
        out.sort(function (a, b) {
            var ta = String(a.time || "").replace(/[^\d]/g, "").slice(0, 8);
            var tb = String(b.time || "").replace(/[^\d]/g, "").slice(0, 8);
            return Number(tb || 0) - Number(ta || 0);
        });
        return out.slice(0, MAX_MERGED_ROWS);
    }

    function getDataRuntime() {
        var base = global.ARK_DATA_CHAT_DEFAULTS || {};
        var da = global.DATA_ACQUISITION_ARK || {};
        var endpoint = String(da.endpoint || "").trim() || String(base.endpoint || "").trim();
        if (!endpoint || endpoint.indexOf("bots/") !== -1) {
            endpoint = String(base.endpoint || "").trim();
        }
        return {
            endpoint: endpoint,
            apiKey: String(da.apiKey || "").trim(),
            model: String(da.model || "").trim() || String(base.model || "").trim()
        };
    }

    function extractChatContent(data) {
        if (!data || typeof data !== "object") return "";
        var err = data.error;
        if (err) throw new Error(String(err.message || err.code || "API error"));
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

    function parseItemsFromModelText(text) {
        var s = String(text || "").trim();
        if (!s) return [];
        var fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (fence) s = fence[1].trim();
        var obj;
        try {
            obj = JSON.parse(s);
        } catch (e) {
            var m = s.match(/\{[\s\S]*\}/);
            if (!m) return [];
            try {
                obj = JSON.parse(m[0]);
            } catch (e2) {
                return [];
            }
        }
        var items = Array.isArray(obj) ? obj : obj && (obj.items || obj.news || obj.data);
        if (!Array.isArray(items)) return [];
        var out = [];
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (!it || typeof it !== "object") continue;
            var title = String(it.title || "").trim();
            var url = String(it.url || it.link || "").trim();
            if (!title || !url) continue;
            out.push({
                title: title,
                time: String(it.time || it.date || "").trim(),
                url: url,
                summary: String(it.summary || "").trim(),
                source: String(it.source || it.media || "").trim(),
                title_en: String(it.title_en || it.titleEn || "").trim(),
                summary_en: String(it.summary_en || it.summaryEn || it.source_en || "").trim(),
                content: ""
            });
        }
        return out;
    }

    function resolveQiaowuDateJsonHref() {
        if (global.YXQ_resolveDateAsset) {
            return global.YXQ_resolveDateAsset("qiaowu-news.json");
        }
        return "date/qiaowu-news.json";
    }

    async function fetchQiaowuRowsFromDateFile() {
        var href = resolveQiaowuDateJsonHref();
        try {
            var res = await fetch(href, { cache: "no-store" });
            if (!res.ok) return [];
            var data = await res.json();
            var items = Array.isArray(data) ? data : data && (data.items || data.news || data.data);
            if (!Array.isArray(items)) return [];
            var out = [];
            for (var j = 0; j < items.length; j++) {
                var row = normalizeQiaowuRow(items[j]);
                if (row) out.push(row);
            }
            return out;
        } catch (e) {
            return [];
        }
    }

    async function fetchQiaowuRowsFromDataApi() {
        var rt = getDataRuntime();
        if (!rt.apiKey || !rt.model) {
            throw new Error("未配置数据侧 API Key（date/volc-ark-apis.json 中 dataApiKey）");
        }
        var system =
            "你是玉林侨务数字平台资讯助理。只收录与华侨/侨务直接相关、且来源为国家层或广西壮族自治区政府体系的公开稿件。" +
            "不要输出其它省（自治区、直辖市）地方门户及其下属站点链接。只输出合法 JSON，不要 Markdown、不要代码块外壳以外的文字。";
        var user =
            "请生成「侨情动态」可用的资讯列表，字段见文末 JSON 模板。\n\n" +
            "**主题（从严）**：每条须与 **侨务** 直接相关（华侨/归侨侨眷、涉侨法规政策与服务、为侨联谊、护侨维权、引智引资与基层侨务等）；" +
            "与侨务无关的一般政务、经济社会简讯不要输出。\n\n" +
            "**来源范围**：`url` 仅限 **(1) 中央政府及部委/国家局 public.gov.cn 体系、国务院侨办/侨联（如 gqb.gov.cn、chinaql.org）、www.gov.cn**；" +
            "**(2) 广西壮族自治区各级政府网（含自治区 gxzf、南宁/玉林等市属及下属子域）**；" +
            "**(3) 中国侨网、中新网涉侨公开稿件**。" +
            "**禁止**收录江苏、广东、京沪闽等 **其它省级地方政府门户** 稿件；兄弟省份涉侨新闻也不要，除非稿源为国家层站点且链接落在中央站点。\n\n" +
            "**链接**：须真实可访的 http(s)；**禁止编造域名**；`summary` 请一句话点明与侨务的关联。\n\n" +
            "**时效与排序**：以网页登载/更新为准，优先近一年内稿件；按真实日期从新到旧排列 `items`；确实无日期时 `time` 可填空字符串。\n\n" +
            "**排除**：勿用无法打开的死链；勿将旧闻伪造成新日期。\n\n" +
            "严格只输出一个 JSON 对象（格式如下，不要其它文字）：\n" +
            '{"items":[{"title":"标题","title_en":"","time":"YYYY-MM-DD或空",' +
            '"url":"https://…","source":"网站或栏目名","summary_en":""}]}\n\n' +
            "要求：items **至少 35 条、尽量 40～55 条**；`title`、`source` 用简体中文；无英文时 `title_en`、`summary_en` 填空字符串。";

        var da = global.DATA_ACQUISITION_ARK || {};
        var body = {
            model: rt.model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            temperature: typeof da.temperature === "number" ? da.temperature : 0.35,
            max_tokens: Number(da.max_tokens) || 12288
        };
        var res = await fetch(rt.endpoint, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + rt.apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("Ark HTTP " + res.status);
        var data = await res.json();
        var text = extractChatContent(data);
        return parseItemsFromModelText(text)
            .map(function (r) {
                return normalizeQiaowuRow(r);
            })
            .filter(Boolean);
    }

    async function loadQiaowuNewsRows(first, second) {
        var opts =
            first !== undefined && first !== null && typeof first === "object" && !Array.isArray(first)
                ? first
                : second || {};
        var bypassCache = opts.bypassSessionCache === true;
        var forceLive = opts.forceLive === true;
        var onUpdate = typeof opts.onUpdate === "function" ? opts.onUpdate : null;

        var fileRows = await fetchQiaowuRowsFromDateFile();
        var localBase = mergeFileWithDynamicCsv(fileRows);
        var warmRows = readWarmSessionRows();
        var base = localBase.length ? localBase : warmRows || [];

        if (forceLive || bypassCache) {
            try {
                var only = await fetchQiaowuRowsFromDataApi();
                var mergedBypass = mergeNewsPreferNew(only || [], localBase);
                if (mergedBypass.length) {
                    writeWarmSessionRows(mergedBypass);
                    return mergedBypass;
                }
            } catch (e) {}
            var fb = localBase.length ? localBase : warmRows || [];
            if (fb.length) writeWarmSessionRows(fb);
            return fb;
        }

        if (base.length) {
            writeWarmSessionRows(base);
            if (onUpdate && !isFileProtocol()) {
                void (async function () {
                    try {
                        var fresh = await fetchQiaowuRowsFromDataApi();
                        if (fresh && fresh.length) {
                            var merged = mergeNewsPreferNew(fresh, base);
                            writeWarmSessionRows(merged);
                            onUpdate(merged);
                        }
                    } catch (e) {}
                })();
            }
            return base;
        }

        try {
            var live = await fetchQiaowuRowsFromDataApi();
            if (live && live.length) {
                var firstPass = mergeNewsPreferNew(live, localBase);
                writeWarmSessionRows(firstPass);
                return firstPass;
            }
        } catch (e) {}
        return localBase.length ? localBase : [];
    }

    async function refreshQiaowuFromDataApi() {
        var fileRows = await fetchQiaowuRowsFromDateFile();
        var localBase = mergeFileWithDynamicCsv(fileRows);
        try {
            var apiRows = await fetchQiaowuRowsFromDataApi();
            var merged = mergeNewsPreferNew(apiRows || [], localBase);
            writeWarmSessionRows(merged);
            return merged;
        } catch (e) {
            var fb = localBase.length ? localBase : readWarmSessionRows() || [];
            if (fb.length) writeWarmSessionRows(fb);
            return fb;
        }
    }

    global.QiaowuNewsLoader = {
        loadQiaowuNewsRows: loadQiaowuNewsRows,
        refreshQiaowuFromDataApi: refreshQiaowuFromDataApi,
        peekWarmRows: peekWarmRows
    };
})(typeof window !== "undefined" ? window : this);
