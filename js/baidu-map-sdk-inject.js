(function () {
    var ak = String(window.__BAIDU_MAP_AK || "").trim();
    if (!ak) {
        console.warn(
            "[baidu-map] 未配置 AK：请在 date/volc-ark-apis.json 中填写 baiduMapAk，并在百度控制台配置 Referer 白名单。"
        );
        return;
    }
    var root = document.head || document.documentElement;
    var cssMarker = "link[data-bmap-css=\"1\"]";
    if (!document.querySelector(cssMarker)) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://api.map.baidu.com/res/webgl/10/bmap.css";
        link.setAttribute("data-bmap-css", "1");
        root.appendChild(link);
    }
    var existing = document.querySelector(
        'script[src*="api.map.baidu.com/api?v="][src*="type=webgl"],script[src*="api.map.baidu.com/getscript?type=webgl"]'
    );
    if (existing) return;
    var apiSrc = "https://api.map.baidu.com/api?v=1.0&type=webgl&ak=" + encodeURIComponent(ak);
    var s = document.createElement("script");
    s.src = apiSrc;
    s.async = false;
    s.defer = true;
    root.appendChild(s);
})();
