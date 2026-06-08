(function (global) {
    "use strict";

    function loadJsonSync(url) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.send(null);
            if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 0 && xhr.responseText)) {
                return JSON.parse(xhr.responseText);
            }
        } catch (e) {}
        return null;
    }

    var scriptSrc =
        typeof document !== "undefined" && document.currentScript && document.currentScript.src
            ? document.currentScript.src
            : "";
    var scriptDir = "";
    try {
        scriptDir = scriptSrc ? new URL(".", scriptSrc).href : "";
    } catch (e0) {
        scriptDir = "";
    }
    global.YXQ_ARK_SCRIPT_BASE = scriptDir;
    global.YXQ_resolveDateAsset = function (fileName) {
        var n = String(fileName || "").replace(/^\/+/, "");
        if (!n) return "";
        if (!scriptDir) {
            return "date/" + n;
        }
        try {
            return new URL("../date/" + n, scriptDir).href;
        } catch (e1) {
            return "date/" + n;
        }
    };

    var jsonUrl = global.YXQ_resolveDateAsset("volc-ark-apis.json");
    var data = jsonUrl ? loadJsonSync(jsonUrl) : null;

    if (!data || typeof data !== "object") {
        data = {};
        if (typeof console !== "undefined" && console.warn) {
            console.warn(
                "[ark-api-config] 未能加载 date/volc-ark-apis.json。请使用本地 HTTP 打开站点，或检查路径。"
            );
        }
    }

    var dataApiKey = String(data.dataApiKey || "").trim();
    var translationApiKey = String(data.translationApiKey || "").trim();
    var qiaozhuangApiKey = String(data.qiaozhuangApiKey || "").trim();
    var baiduMapAk = String(data.baiduMapAk || data.baidu_map_ak || "").trim();
    global.__BAIDU_MAP_AK = baiduMapAk;

    global.ARK_DATA_CHAT_DEFAULTS = Object.assign({}, data.ARK_DATA_CHAT_DEFAULTS || {});
    global.ARK_QIAOZHUANG_DEFAULTS = Object.assign({}, data.ARK_QIAOZHUANG_DEFAULTS || {});
    global.ARK_TRANSLATION_RESPONSES_DEFAULTS = Object.assign({}, data.ARK_TRANSLATION_RESPONSES_DEFAULTS || {});

    global.TRANSLATION_ARK = Object.assign(
        { endpoint: "", apiKey: "", model: "", enabled: true },
        data.TRANSLATION_ARK || {},
        { apiKey: translationApiKey || dataApiKey }
    );

    global.DATA_ACQUISITION_ARK = Object.assign(
        {
            endpoint: "",
            apiKey: "",
            model: "",
            enabled: true,
            temperature: 0.35,
            max_tokens: 8192,
            cacheTtlMs: 600000,
        },
        data.DATA_ACQUISITION_ARK || {},
        { apiKey: dataApiKey }
    );

    global.ASSISTANT_ARK = Object.assign(
        { endpoint: "", apiKey: "", model: "", use_stream: true },
        data.ASSISTANT_ARK || {},
        { apiKey: qiaozhuangApiKey }
    );

    global.YXQ_VOLC_KEYS = {
        dataApiKey: dataApiKey,
        translationApiKey: translationApiKey || dataApiKey,
        qiaozhuangApiKey: qiaozhuangApiKey,
        baiduMapAk: baiduMapAk,
    };
})(typeof window !== "undefined" ? window : this);
