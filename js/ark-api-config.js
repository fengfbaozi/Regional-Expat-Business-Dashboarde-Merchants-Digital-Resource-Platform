/* =======================================================================
 * js/ark-api-config.js（v2.1 演示加密版 —— 运行时 AES 解密 + 离线降级 + localStorage 密码记忆）
 *
 * 职责：
 *   1. 不再 fetch 任何明文 JSON；前端只携带 Base64 AES 密文锁。
 *   2. 首次进入页面时弹窗请用户输入密码（演示密码：demo1234）。
 *   3. 用密码解密密文 → JSON.parse → 注入到 window.*；
 *      若解密后的字段仍含有占位符（YOUR_ / REPLACE_WITH / 空串），
 *      视为"未配置真实密钥"，相应接口自动按离线 Mock 模式降级，
 *      不会拿着无效 AK 去触发外部请求。
 *   4. 密码保存在 localStorage（ARK_DEMO_PASS_CACHE），
 *      只要该 Key 存在，后续进入页面不再弹窗。
 *      - 在浏览器控制台执行：clearArkAuth()  可清除缓存重新输入。
 *      - 或在开发者工具 → Application → Local Storage 手动删除。
 *
 * 下游契约（任何脚本都不应再读 volc-ark-apis.json）：
 *   window.__BAIDU_MAP_AK             string（真实AK或空串；空=离线）
 *   window.__BAIDU_MAP_STYLE_ID       string（个性化地图样式码，可空）
 *   window.ARK_DATA_CHAT_DEFAULTS     { endpoint, model }
 *   window.ARK_QIAOZHUANG_DEFAULTS    { endpoint, model }
 *   window.ARK_TRANSLATION_RESPONSES_DEFAULTS { endpoint, model }
 *   window.DATA_ACQUISITION_ARK       { enabled, temperature, max_tokens, cacheTtlMs, apiKey }
 *   window.TRANSLATION_ARK            { enabled, endpoint, apiKey }
 *   window.ASSISTANT_ARK              { use_stream, apiKey, endpoint, model }
 *   window.YXQ_VOLC_KEYS              { dataApiKey, translationApiKey,
 *                                       qiaozhuangApiKey, baiduMapAk,
 *                                       baiduMapStyleId }
 *   window.YXQ_CONFIG_MODE            "online" | "offline-mock"
 *   window.clearArkAuth()             清除密码缓存（下一次刷新重新输入）
 * ======================================================================= */
(function (global) {
    "use strict";

    // ---- 1. 超长 Base64 密文锁（与 CryptoJS.AES.encrypt(plaintext, password) 互认） ----
    // 生成方式（v2.1）：
    //   $env:ARK_DEMO_PASS="你的密码"; node encrypt_tool.js
    //   把控制台输出的 Base64 完整粘到下面 ENCRYPTED_CONFIG_STRING。
    //   当前这份密文是示例配置，密码 demo1234 可解密并得到 YOUR_* 占位字段。
    const ENCRYPTED_CONFIG_STRING =
        "U2FsdGVkX1+z2ZCs52ARM70adiKh43ab5F0S2v8xQBM8PEC7xWE8eZdJZDSgicAiLftwGNxG8Ih0jeAbuAg6S9DFWWElW4bP1LFC7uM4+NxY3Os8Jdss07KJ3Vrl+MxL0RJuk6A6VR917leClf3LuUcgM0disFkhNHBqx7km2KJRRoh5QwE71K65bE6S3LYS2js6HROUBRwGDDfXm81ipN0EVpoxiNG70MUHuLbcLcH0RRLSMzjCBAcSbYx7dPQ6DUPo2MktuNW7uijVzTmqYUAYft4WC6KtDSs+RXN5RXnDKuxl3M+aaSnKF+2T0WRhdzrXhAnNA6jAenwWTtzCNnYsdQA9NyoAP22jg5XSrJxcow7yKAEQvQB32Du+pPliEVt89HG9HioNRyWpfCEI142QMfoBxgqr5kNPWYQs3nThGa9MpUzNBSKXVVw0Kvl2EXAU3GENU2u+xgNRnNvWSk5Uc9XvYil9u40gqi6dKgVtxxg/5ab99ndUYdD45vdVFyT2GISuEMoFZlZetmZ738Z+giNwTfnam0+TCRf8mM0D0D5xD4p2VF+VC2rtBcsAOReQ9927Aj5UjY506MqKxDY7rr7ds+Z8lH6j9BtGEltgcJrjMODartyloPJqIoaxa8VjECTb7TZ+rvRQ6/KDZaRw4h1rTkpCEAOu3WZXpKU1HSpBusf6qrWDQgERby9lavWbVncwCUhtICpbLAVBDNY9lJ4n10yZ7ojQJxGZCflaGnVdJt2C0cPMqN/s63DewzM1MKT9ol8GYkTWgoEwAhrijEDnP3yRkEnQvJ1dlfkrD/gUkcWGroyLvnj1K+nKrq7hI9nbUYGxzBXBF9Jha520hkO6lUCH7OrxOpwx1l81PO+DU7XclC6eNEg7pr5Z/7r70SPG6tOvO92rdu9el8c5Ttdd+PXZNOMMGJq8jt+dIFZaM1QmMBWWZusqyIEjUka9NUR/mC/v4IWQ1RMzNR1breBEFKeJQh1KtWZMpj4BXQRTta1eM09xEsqW4nJkYgjbmiYL8jbHyrb9qD9aoMN5tRuxGpz4bDipq5By06zcKPqXrpjdRx1K6E4Jd+dQdoqmNWG+SjiYeJ5PnJETBCBes4WCRaTeFwY5X35pbQbSgmg31NpZ8aevYiUcUW2ia2v10+R9ytdOyC+tQPlNFTh9TvDm8hczXtrl8+wFLRX08UX1xH56t11n82eqdX41LwrnlBUNIsJVtT9iBUKrYfY3NyLqqw2+nK7RGk+Ma6wgQ7eDAleAmOqSiLU3x6XxfRZ0okd15ac8C5Z1ifdoXIAEzTI4tA7GjsS9GNMvTn7P2jJcwh3OdfW9JWc46INB8OBA0QvJ0RET3BWq96VtUUlUzZCPUvNEW6kie+/ceVGd6RCoLAztmHyzlSnwbKbPpwownUUA0yVYXPmUY1xmatIRoEQMGoNECcjbPr0AF1GNgBKe5tD0gNV14XU1vzvTEl/6eCWsDoVA6Vc6mMwDoGPdzGHr5W3yFYhOLxEvAAmpFHT5VKLt7Np84eUkrCbV";

    // 本地缓存 Key；与页面同源，不会跨站泄露
    const LS_PASS_KEY = "ARK_DEMO_PASS_CACHE";
    // 调试开关：设为 true 会在 console 打印解密后的字段（不含密码），便于排查
    const DBG = false;

    // ---- 2. 把解密后的配置对象注入到 window.* ----
    function installConfigFromObject(data) {
        if (!data || typeof data !== "object") data = {};

        // "看起来还是占位符"的判断条件。
        // 为空 / 以 YOUR_ 开头 / 以 REPLACE_WITH 开头 → 视为未配置
        function looksLikePlaceholder(v) {
            if (v == null) return true;
            const s = String(v).trim();
            if (!s) return true;
            return /^(YOUR_|REPLACE_WITH)/i.test(s);
        }

        const dataApiKey = looksLikePlaceholder(data.dataApiKey)
            ? ""
            : String(data.dataApiKey).trim();
        const translationApiKey = looksLikePlaceholder(data.translationApiKey)
            ? (dataApiKey || "")              // 翻译未单独配置 → 复用 dataApiKey
            : String(data.translationApiKey).trim();
        const qiaozhuangApiKey = looksLikePlaceholder(data.qiaozhuangApiKey)
            ? ""
            : String(data.qiaozhuangApiKey).trim();
        const baiduMapAk = looksLikePlaceholder(data.baiduMapAk)
            ? ""
            : String(data.baiduMapAk).trim();
        const baiduMapStyleId = looksLikePlaceholder(data.baiduMapStyleId)
            ? ""
            : String(data.baiduMapStyleId).trim();

        // 注入地图 Key / StyleId（与 map-shared / page-map / main.js 对接）
        global.__BAIDU_MAP_AK = baiduMapAk;
        global.__BAIDU_MAP_STYLE_ID = baiduMapStyleId;

        global.ARK_DATA_CHAT_DEFAULTS = Object.assign({}, data.ARK_DATA_CHAT_DEFAULTS || {});
        global.ARK_QIAOZHUANG_DEFAULTS = Object.assign({}, data.ARK_QIAOZHUANG_DEFAULTS || {});
        global.ARK_TRANSLATION_RESPONSES_DEFAULTS = Object.assign({}, data.ARK_TRANSLATION_RESPONSES_DEFAULTS || {});

        global.TRANSLATION_ARK = Object.assign(
            { endpoint: "", apiKey: "", model: "", enabled: true },
            data.TRANSLATION_ARK || {},
            { apiKey: translationApiKey }
        );

        global.DATA_ACQUISITION_ARK = Object.assign(
            { endpoint: "", apiKey: "", model: "", enabled: true, temperature: 0.35, max_tokens: 12288, cacheTtlMs: 600000 },
            data.DATA_ACQUISITION_ARK || {},
            { apiKey: dataApiKey }
        );

        global.ASSISTANT_ARK = Object.assign(
            { endpoint: "", apiKey: "", model: "", use_stream: true },
            data.ASSISTANT_ARK || {},
            { apiKey: qiaozhuangApiKey }
        );

        // 聚合 Key（供下游统一读取）
        global.YXQ_VOLC_KEYS = {
            dataApiKey: dataApiKey,
            translationApiKey: translationApiKey,
            qiaozhuangApiKey: qiaozhuangApiKey,
            baiduMapAk: baiduMapAk,
            baiduMapStyleId: baiduMapStyleId
        };

        if (DBG) {
            // 仅在调试模式下打印；永远不会打印用户输入的密码
            try {
                console.info("[ark-api-config] 注入后的 Key 快照：", {
                    dataApiKey: dataApiKey ? "已设置" : "空/占位 → 离线",
                    qiaozhuangApiKey: qiaozhuangApiKey ? "已设置" : "空/占位 → 离线",
                    baiduMapAk: baiduMapAk ? "已设置" : "空/占位 → 离线",
                    baiduMapStyleId: baiduMapStyleId || "(未配置)",
                    mode: dataApiKey && baiduMapAk ? "online" : "offline-mock"
                });
            } catch (e) {}
        }
    }

    // ---- 3. 空配置（离线 Mock 模式的降级对象） ----
    function installEmptyOfflineConfig(reason) {
        installConfigFromObject({});
        global.YXQ_CONFIG_MODE = "offline-mock";
        if (typeof console !== "undefined" && console.warn) {
            console.warn("[ark-api-config] 进入离线 Mock 模式（" + (reason || "未授权/无密钥") + "）。" +
                " 首页卡片、地图页将只显示本地静态缓存数据。");
        }
    }

    // ---- 4. 尝试解密（依赖 CryptoJS）----
    function tryDecrypt(userPassword) {
        if (typeof CryptoJS === "undefined") {
            return { ok: false, reason: "CryptoJS 未加载 —— 请检查 index.html 中是否引入了 crypto-js.min.js" };
        }
        try {
            const words = CryptoJS.AES.decrypt(ENCRYPTED_CONFIG_STRING, userPassword);
            const plain = words.toString(CryptoJS.enc.Utf8);
            if (!plain) return { ok: false, reason: "解密结果为空（密码错误或密文被改写）" };
            const obj = JSON.parse(plain);
            return { ok: true, data: obj };
        } catch (err) {
            return { ok: false, reason: "解密/JSON 解析失败：" + ((err && err.message) || err) };
        }
    }

    // ---- 5. localStorage 读写 ----
    function readCachedPass() {
        try {
            if (!global.localStorage) return null;
            return global.localStorage.getItem(LS_PASS_KEY) || null;
        } catch (e) {
            return null;
        }
    }
    function writeCachedPass(pass) {
        try {
            if (!global.localStorage) return false;
            global.localStorage.setItem(LS_PASS_KEY, pass);
            return true;
        } catch (e) {
            return false;
        }
    }
    function clearCachedPass() {
        try {
            if (!global.localStorage) return false;
            global.localStorage.removeItem(LS_PASS_KEY);
            return true;
        } catch (e) {
            return false;
        }
    }
    // 对外暴露一个清除缓存方法
    global.clearArkAuth = function () {
        clearCachedPass();
        console.info("[ark-api-config] 密码缓存已清除。刷新页面后将重新提示输入。");
    };

    // ---- 6. 主流程：优先读缓存 → 缓存无效才弹窗 ----
    function bootstrap() {
        // step A：尝试用 localStorage 里缓存的密码解密
        const cached = readCachedPass();
        if (cached) {
            const res = tryDecrypt(cached);
            if (res.ok && res.data) {
                installConfigFromObject(res.data);
                global.YXQ_CONFIG_MODE = (global.YXQ_VOLC_KEYS.dataApiKey && global.YXQ_VOLC_KEYS.baiduMapAk)
                    ? "online"
                    : "offline-mock";
                return; // 一次成功 → 不再弹窗
            }
            // 缓存密码解密失败，可能是密文被更新或密码被改掉；清掉缓存后走弹窗路径
            clearCachedPass();
        }

        // step B：第一次进入 → prompt 请用户输入密码
        let userPassword = null;
        try {
            if (typeof window !== "undefined" && typeof window.prompt === "function") {
                userPassword = window.prompt(
                    "请输入平台访问授权码（演示密码：demo1234；仅供测试，解密出的是示例占位符）：\n\n" +
                    "• 正确输入你的密码 → 启用火山引擎接口、百度地图、侨壮壮对话等在线能力\n" +
                    "• 取消或留空 → 自动进入「离线模拟数据模式」，仅使用本地静态缓存渲染\n\n" +
                    "（本页面只会在第一次进入时弹窗，密码会保存在本浏览器；" +
                    " 如需清除，请在控制台执行 clearArkAuth() 后刷新）",
                    ""
                );
            }
        } catch (e) {
            userPassword = null;
        }

        if (userPassword === null || userPassword === "") {
            // 取消 / 未输入 → 直接降级
            installEmptyOfflineConfig("用户未输入授权码");
            return;
        }

        const result = tryDecrypt(userPassword);
        if (result.ok && result.data) {
            // 成功：把密码写入缓存，以后不再弹窗
            installConfigFromObject(result.data);
            global.YXQ_CONFIG_MODE = (global.YXQ_VOLC_KEYS.dataApiKey && global.YXQ_VOLC_KEYS.baiduMapAk)
                ? "online"
                : "offline-mock";
            writeCachedPass(userPassword);
        } else {
            // 解密失败：弹一次提示后降级，**不把错误密码缓存**
            try {
                if (typeof window !== "undefined" && typeof window.alert === "function") {
                    window.alert("⚠️ 授权码不正确：" + (result.reason || "") +
                        "\n系统将自动进入「离线模拟数据模式」。" +
                        "\n需要再次尝试的话，请在控制台执行 clearArkAuth() 后刷新页面。");
                }
            } catch (e) {}
            installEmptyOfflineConfig(result.reason);
        }
    }

    bootstrap();
})(typeof window !== "undefined" ? window : this);
