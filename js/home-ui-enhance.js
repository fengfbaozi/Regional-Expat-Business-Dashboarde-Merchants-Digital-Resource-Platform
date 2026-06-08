/**
 * 首页：进场 class、动态列表交错序号（不改变数据与接口）
 */
(function () {
    if (!document.body || !document.body.classList.contains("page-home")) {
        return;
    }

    var reduced =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function markLoaded() {
        if (!reduced) {
            document.body.classList.add("page-home--loaded");
        }
    }

    function hasAnyUnstaggered(root) {
        if (!root) return false;
        var sel = ".core-service-card, .demand-item, .industry-card";
        var nodes = root.querySelectorAll(sel);
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].getAttribute("data-home-staggered") !== "1") return true;
        }
        return false;
    }

    function staggerList(root) {
        if (reduced || !root) return;
        var sel = ".core-service-card, .demand-item, .industry-card";
        var nodes = root.querySelectorAll(sel);
        var changed = false;
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            if (el.getAttribute("data-home-staggered") === "1") continue;
            el.setAttribute("data-home-staggered", "1");
            el.style.setProperty("--home-i", String(i));
            changed = true;
        }
        return changed;
    }

    function boot() {
        requestAnimationFrame(function () {
            requestAnimationFrame(markLoaded);
        });
        var main = document.querySelector(".main-container");
        if (main) {
            staggerList(main);
            if (!reduced && window.MutationObserver) {
                var t = null;
                var lastRunTime = 0;
                var cooldownMs = 800;
                var mo = new MutationObserver(function () {
                    if (t) return;
                    var now = Date.now();
                    if (now - lastRunTime < cooldownMs) {
                        t = window.setTimeout(function () {
                            t = null;
                            lastRunTime = Date.now();
                            if (hasAnyUnstaggered(main)) {
                                staggerList(main);
                            }
                        }, cooldownMs);
                        return;
                    }
                    lastRunTime = now;
                    if (hasAnyUnstaggered(main)) {
                        staggerList(main);
                    }
                });
                mo.observe(main, { childList: true, subtree: true });
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
