(function (global) {
    "use strict";

    var CACHE_VERSION = 2;
    var CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    var CACHE_PREFIX = "yuxiaoqiao_map_";
    var VERSION_KEY = CACHE_PREFIX + "ver";

    function isFresh() {
        try {
            var raw = global.localStorage.getItem(VERSION_KEY);
            if (!raw) return false;
            var meta = JSON.parse(raw);
            if (meta.v !== CACHE_VERSION) return false;
            if (Date.now() - meta.t > CACHE_TTL_MS) return false;
            return true;
        } catch (e) {
            return false;
        }
    }

    function getCache(key) {
        try {
            if (!isFresh()) return null;
            var raw = global.localStorage.getItem(CACHE_PREFIX + key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function setCache(key, data) {
        try {
            global.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
            stampFresh();
        } catch (e) {
            try {
                clearAll();
                global.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
                stampFresh();
            } catch (e2) {}
        }
    }

    function stampFresh() {
        try {
            global.localStorage.setItem(VERSION_KEY, JSON.stringify({ v: CACHE_VERSION, t: Date.now() }));
        } catch (e) {}
    }

    function clearAll() {
        try {
            var dead = [];
            for (var i = 0; i < global.localStorage.length; i++) {
                var k = global.localStorage.key(i);
                if (k && k.indexOf(CACHE_PREFIX) === 0) dead.push(k);
            }
            dead.forEach(function (k) { global.localStorage.removeItem(k); });
        } catch (e) {}
    }

    global.MapPreload = {
        isFresh: isFresh,
        getCache: getCache,
        setCache: setCache,
        stampFresh: stampFresh,
        clearAll: clearAll,
        VERSION: CACHE_VERSION
    };
})(window);