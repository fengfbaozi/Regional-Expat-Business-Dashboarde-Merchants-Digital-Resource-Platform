/* =======================================================================
 * js/ark-api-config.js（重构版 —— 运行时解密 + 离线降级）
 *
 * 职责：
 *   1. 不再 fetch 任何明文 volc-ark-apis.json；
 *   2. 内置 AES(Base64) 密文锁 + 用户输入授权码；
 *   3. 解密成功 → 注入 6 个全局配置对象；
 *   4. 解密失败 / 用户取消 → 自动离线 Mock 模式（仍能渲染）。
 *
 * 下游契约（任何脚本都不应再读 volc-ark-apis.json）：
 *   window.__BAIDU_MAP_AK             string (可空)
 *   window.ARK_DATA_CHAT_DEFAULTS     { endpoint, model }
 *   window.ARK_QIAOZHUANG_DEFAULTS    { endpoint, model }
 *   window.ARK_TRANSLATION_RESPONSES_DEFAULTS { endpoint, model }
 *   window.DATA_ACQUISITION_ARK       { enabled, temperature, max_tokens, cacheTtlMs, apiKey }
 *   window.TRANSLATION_ARK            { enabled, endpoint, apiKey }
 *   window.ASSISTANT_ARK              { use_stream, apiKey, endpoint, model }
 *   window.YXQ_VOLC_KEYS              { dataApiKey, translationApiKey,
 *                                       qiaozhuangApiKey, baiduMapAk }
 *   window.YXQ_CONFIG_MODE            "online" | "offline-mock"
 * ======================================================================= */
(function (global) {
    "use strict";

    // ---- 1. 超长 Base64 密文锁（与 CryptoJS.AES.encrypt(plaintext, password) 的互认格式） ----
    const ENCRYPTED_CONFIG_STRING =
        "U2FsdGVkX19FPQ4JMYPzlaRHxo8qYxx5KclrUsyzSISAOdvv7swY+1mNwIzpUaIyusX/j5QBUp6M5WMGmbWyxNDslq9/a632R2MjDf/UX5SZJ0neH35xR4AIqljKdyE9/dCl67tpe8hlDI2JRriEf2lKgSX0YAu6xwetXs8RbJ2Di60VjXMQ5FE72skyuoGpOqlAdqy2f4MoiU3jGUvJrUKFNRRo4ZgDRb9N9kploFeixX/DzBvgmDZrZzTwvzdbeC+p65iDdG7OhwSYPaKy0OmrgfRDz8dwqKd41e7hohiBdITV+nK82kg7gMs3lYetX7VV6JRnOJIm3jam1SZwP1Lucpqlh4YNu2YSnEK23rf13k332Pbz8BryZ1ITfbr2x1mxtdhhVgnh34VQ2+twZ84pZPy6raqKu2uj+ZanBvAOQ/WA8HM/r8YHkOlvGpxNRDMmhDYK5vHo1ackZfNG1xZDwcr4mx+wqBSt5AKoTeJMhsD7bpbPEr+ZtBJuqQ3gUbdih+GmgJVegbsMDgitRdiKcAeOjC1Xhk0qlfmN2cWF5CNfOne5X0qjX7o12L3kNQLrB5suv1ODvG/KlRT/ocr2gzvYf87jwas3CMXO20tGSoqvvAQ/sF0+SVWhm6DEVFWPhqihNJ9nn0Y1HGmzLFn3dke1y7OartNJVUihumuSzCfGs4A/xk36dAyv86ytBlSfxQCq3GXVQn7eJhrNsDH16CsLBp+a5NU0YGt++Ni8F85QYJOVmbW/6xcOyitVdEPFBoV5cFTYgMgm1+tmqh11t+OXCmpiEys7CuaxuTT7xKGOlw3+Oln0j16JbTLxE8yJJTKaIHmIVdxA5pZewgEXnmDptWRckz0HBGh/odajbwfFhTt4JdPwySGIOTeE4BhonIBYhiEA/sD15lAUW/iWR5pI+SwxOkDpRUc8V2AvgrcI8fYwub4QWkC9IGyN280v0ebX+FYTmpDE9Z4JyF9Yhw2qhL7RGb8AnTfB+LV6VD4phZ6V5lZTmFJvpbFXQIuisoOGkXvEv6K6FIascSMoR6dppHT0xncPS5fCkIjXyCBQnO2rrsLf7gIcTnHAe9uFSxerNak7eUL8F+rSIAbgyhASUAkoAWp7PTjvw4l0bKnfhfbsoh0eGYKTLtHfUfWYRxMqsHdG/p7Lczfn+tdmLM2ozVG/3EtUynKf4cgF4VrHxjoJ/U6DSjn220ysoXu81A0wHIGskJDCqThOfsXtEUl6h2RDBXnfcz+81XH1tFw7TewhKT8jkHqNTntZIGPSvuXlZdZceQ/UGril+8y4ZYqKdyD6IIY0qTem01MPw49Zl4vBjhCmhU2IAE6x9zuumAYiQkGDg4/SkDpVwshXFgv6eUggoxwqey9V0nbWoLtDsb6JpNBXjIzs1dzL2sKkkXHCgZw6/CNV0MvQp00HT4nG4kT0a8BiQm1qC8m8GrcBR/OiS0H54DvhPJ+MPhdON7vdjF1OLnQM8w6OM4sWU1274kdL5i/TKFi2aNLXBr791uWA2p11eQgpmm7k";

    // ---- 2. 注入解密后的字段到全局 ----
    function installConfigFromObject(data) {
        if (!data || typeof data !== "object") data = {};

        const dataApiKey = String(data.dataApiKey || "").trim();
        const translationApiKey = String(data.translationApiKey || "").trim() || dataApiKey;
        const qiaozhuangApiKey = String(data.qiaozhuangApiKey || "").trim();
        const baiduMapAk = String(data.baiduMapAk || "").trim();

        global.__BAIDU_MAP_AK = baiduMapAk;

        global.ARK_DATA_CHAT_DEFAULTS = Object.assign({}, data.ARK_DATA_CHAT_DEFAULTS || {});
        global.ARK_QIAOZHUANG_DEFAULTS = Object.assign({}, data.ARK_QIAOZHUANG_DEFAULTS || {});
        global.ARK_TRANSLATION_RESPONSES_DEFAULTS = Object.assign({}, data.ARK_TRANSLATION_RESPONSES_DEFAULTS || {});

        global.TRANSLATION_ARK = Object.assign(
            { endpoint: "", apiKey: "", model: "", enabled: true },
            data.TRANSLATION_ARK || {},
            { apiKey: translationApiKey }
        );

        global.DATA_ACQUISITION_ARK = Object.assign(
            { endpoint: "", apiKey: "", model: "", enabled: true, temperature: 0.35, max_tokens: 8192, cacheTtlMs: 600000 },
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
            translationApiKey: translationApiKey,
            qiaozhuangApiKey: qiaozhuangApiKey,
            baiduMapAk: baiduMapAk
        };
    }

    // ---- 3. 空配置（离线 Mock 模式的降级对象）----
    function installEmptyOfflineConfig() {
        installConfigFromObject({});
        global.YXQ_CONFIG_MODE = "offline-mock";
        if (typeof console !== "undefined" && console.warn) {
            console.warn("[ark-api-config] 未获取访问授权码 → 进入离线 Mock 模式，所有接口 Key 为空；页面将只使用 date/* 的静态缓存渲染。");
        }
    }

    // ---- 4. 尝试解密（依赖 CryptoJS）----
    function tryDecrypt(userPassword) {
        if (typeof CryptoJS === "undefined") {
            return { ok: false, reason: "CryptoJS 未加载" };
        }
        try {
            const words = CryptoJS.AES.decrypt(ENCRYPTED_CONFIG_STRING, userPassword);
            const plain = words.toString(CryptoJS.enc.Utf8);
            if (!plain) return { ok: false, reason: "解密结果为空（密码错误？）" };
            const obj = JSON.parse(plain);
            return { ok: true, data: obj };
        } catch (err) {
            return { ok: false, reason: (err && err.message) || "解密/JSON 失败" };
        }
    }

    // ---- 5. 相对路径助手（保持与旧版一致：无论在哪一层 pages 下，都能定位到 date/）----
    function resolveDateAsset(fileName) {
        var scriptSrc =
            (typeof document !== "undefined" && document.currentScript && document.currentScript.src) || "";
        if (!scriptSrc) return "date/" + String(fileName || "");
        try {
            return new URL("../date/" + fileName, scriptSrc).href;
        } catch (e) {
            return "date/" + fileName;
        }
    }
    global.YXQ_resolveDateAsset = resolveDateAsset;

    // ---- 6. 主流程：prompt → 解密 → 成功/降级 ----
    function bootstrap() {
        let userPassword = null;
        try {
            if (typeof window !== "undefined" && typeof window.prompt === "function") {
                userPassword = window.prompt(
                    "请输入平台访问授权码（演示密码：demo1234；仅供测试，不含真实密钥）：\n\n" +
                    "• 正确输入 → 启用火山引擎接口、百度地图、侨壮壮对话等在线能力\n" +
                    "• 取消或留空 → 自动进入「离线模拟数据模式」，仅使用本地静态缓存渲染",
                    ""
                );
            }
        } catch (e) {
            userPassword = null;
        }

        if (userPassword === null || userPassword === "") {
            // 用户取消 / 未输入 → 直接降级
            installEmptyOfflineConfig();
            return;
        }

        const result = tryDecrypt(userPassword);
        if (result.ok && result.data) {
            installConfigFromObject(result.data);
            global.YXQ_CONFIG_MODE = "online";
            if (typeof console !== "undefined" && console.info) {
                console.info("[ark-api-config] 授权通过，已注入在线配置（" + Object.keys(result.data).length + " 个字段）。");
            }
        } else {
            // 解密失败：弹一次提示后降级，不抛错、不崩溃
            try {
                if (typeof window !== "undefined" && typeof window.alert === "function") {
                    window.alert("⚠️ 授权码不正确：" + (result.reason || "") +
                        "\n系统将自动进入「离线模拟数据模式」。");
                }
            } catch (e) {}
            installEmptyOfflineConfig();
        }
    }

    bootstrap();
})(typeof window !== "undefined" ? window : this);
