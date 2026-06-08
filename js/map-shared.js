window.MapShared = (function () {
    function baiduMapAk() {
        return String(window.__BAIDU_MAP_AK || "").trim();
    }
    const VIEW_BOUNDS = { minLng: 94, maxLng: 126, minLat: -12, maxLat: 30 };
    const ZOOM_RANGE = { min: 4, max: 7 };
    const INITIAL_CENTER = { lng: 108.85, lat: 15.25 };
    const INITIAL_ZOOM = 4.92;
    const USE_CUSTOM_STYLE = false;
    const SAFE_STYLE_JSON = [
        { featureType: "water", elementType: "all", stylers: { color: "#0b2b48" } },
        { featureType: "land", elementType: "all", stylers: { color: "#0a1e3a" } },
        { featureType: "railway", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "subway", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "highway", elementType: "all", stylers: { color: "#ffc870" } },
        { featureType: "arterial", elementType: "all", stylers: { color: "#d8a65f" } },
        { featureType: "poi", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "all", elementType: "labels.text.fill", stylers: { color: "#b7ddff" } },
        { featureType: "all", elementType: "labels.text.stroke", stylers: { color: "#0b213d" } }
    ];
    const STYLE_JSON = [
        { featureType: "water", elementType: "all", stylers: { color: "#0b2b48" } },
        { featureType: "land", elementType: "all", stylers: { color: "#0a1e3a" } },
        { featureType: "railway", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "subway", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "highway", elementType: "all", stylers: { color: "#ffc870" } },
        { featureType: "arterial", elementType: "all", stylers: { color: "#d8a65f" } },
        { featureType: "boundary", elementType: "all", stylers: { color: "#ffc870" } },
        { featureType: "poi", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "all", elementType: "labels.text.fill", stylers: { color: "#b7ddff" } },
        { featureType: "all", elementType: "labels.text.stroke", stylers: { color: "#0b213d" } }
    ];

    function toNum(v) {
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
    }

    function hashText(s) {
        const text = String(s || "");
        let h = 0;
        for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
        return h;
    }

    function extractSurname(name) {
        const raw = String(name || "").trim().replace(/(女士|先生)$/, "");
        if (!raw) return "佚";
        const multi = ["欧阳", "司马", "上官", "诸葛", "夏侯", "东方", "皇甫", "尉迟", "公孙", "慕容", "令狐", "宇文", "长孙", "南宫"];
        const hit = multi.find((s) => raw.startsWith(s));
        if (hit) return hit;
        return raw.slice(0, 1);
    }

    function ensureHonorific(name, index) {
        const raw = String(name || "").trim();
        const surname = extractSurname(raw);
        const title = hashText(raw + "|" + String(index || 0)) % 2 === 0 ? "女士" : "先生";
        return surname + title;
    }

    function toEnterpriseKey(row, index) {
        const explicit = String(row.enterprise_id || "").trim();
        if (explicit) return explicit;
        const city = String(row.city || "").trim();
        const country = String(row.country || "").trim();
        const type = String(row.merchant_type || "其他").trim() || "其他";
        const bucket = (Number(index) % 5) + 1;
        return `ent-${country}-${city}-${type}-${bucket}`;
    }

    function toEnterpriseName(row, enterpriseKey) {
        const explicit = String(row.enterprise_name || "").trim();
        if (explicit) return explicit;
        const city = String(row.city || "").trim();
        const type = String(row.merchant_type || "其他").trim() || "其他";
        const short = String(enterpriseKey || "").split("-").slice(-1)[0] || "1";
        return `${city}${type}侨企${short}`;
    }

    function normalizeRows(rows) {
        return (rows || [])
            .map((r, idx) => {
                const enterprise_id = toEnterpriseKey(r, idx);
                const rawName = String(r.merchant_name || "").trim();
                return {
                city: String(r.city || "").trim(),
                country: String(r.country || "").trim(),
                lat: toNum(r.lat),
                lng: toNum(r.lng),
                merchant_type: String(r.merchant_type || "其他").trim() || "其他",
                merchant_id: String(r.merchant_id || "").trim() || `m-${String(idx + 1).padStart(5, "0")}`,
                merchant_raw_name: rawName,
                merchant_name: ensureHonorific(r.merchant_name, idx),
                merchant_title: /女士$/.test(ensureHonorific(r.merchant_name, idx)) ? "女士" : "先生",
                merchant_desc: String(r.merchant_desc || "").trim(),
                contact: String(r.contact || "").trim(),
                enterprise_id: enterprise_id,
                enterprise_name: toEnterpriseName(r, enterprise_id)
            };
            })
            .filter((r) => r.city && r.country && Number.isFinite(r.lat) && Number.isFinite(r.lng) && r.merchant_name);
    }

    function getEnterpriseKey(row) {
        if (!row) return "";
        const id = String(row.enterprise_id || "").trim();
        if (id) return id;
        const name = String(row.enterprise_name || "").trim();
        if (name) return name;
        return `${String(row.country || "").trim()}|${String(row.city || "").trim()}|${String(row.merchant_type || "").trim()}`;
    }

    function aggregateCities(rows) {
        const cityMap = new Map();
        (rows || []).forEach((row) => {
            const key = `${row.city}|${row.country}`;
            if (!cityMap.has(key)) {
                cityMap.set(key, {
                    key,
                    city: row.city,
                    country: row.country,
                    lat: row.lat,
                    lng: row.lng,
                    merchants: [],
                    types: new Set()
                });
            }
            const city = cityMap.get(key);
            city.merchants.push(row);
            city.types.add(row.merchant_type);
        });
        return Array.from(cityMap.values()).sort((a, b) => a.city.localeCompare(b.city, "zh-Hans-CN"));
    }

    function createGlowDotIconFactory() {
        const cache = new Map();
        return function glowDotIcon(sizePx) {
            if (cache.has(sizePx)) return cache.get(sizePx);
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="g" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#fff4d8" stop-opacity="0.95"/>
                            <stop offset="38%" stop-color="#ffc470" stop-opacity="0.78"/>
                            <stop offset="70%" stop-color="#ffb84d" stop-opacity="0.42"/>
                            <stop offset="100%" stop-color="#ffb84d" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#g)"/>
                </svg>
            `;
            const s = Number(sizePx);
            const icon = new BMapGL.Icon(
                `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
                new BMapGL.Size(s, s),
                { anchor: new BMapGL.Size(Math.round(s / 2), Math.round(s / 2)) }
            );
            cache.set(sizePx, icon);
            return icon;
        };
    }

    function buildArcPoints(fromPoint, toPoint, steps = 14) {
        const dLng = toPoint.lng - fromPoint.lng;
        const dLat = toPoint.lat - fromPoint.lat;
        const distance = Math.sqrt(dLng * dLng + dLat * dLat);
        const lift = Math.min(4.5, Math.max(1, distance * 0.13));
        const result = [];
        for (let i = 0; i <= steps; i += 1) {
            const t = i / steps;
            const lng = fromPoint.lng + dLng * t;
            const baseLat = fromPoint.lat + dLat * t;
            const arcLat = baseLat + Math.sin(Math.PI * t) * lift;
            result.push(new BMapGL.Point(lng, arcLat));
        }
        return result;
    }

    function applyTechStyle(map, force) {
        if (!force && !USE_CUSTOM_STYLE) return;
        if (map && typeof map.setMapStyleV2 === "function") {
            try {
                map.setMapStyleV2({ styleJson: STYLE_JSON });
            } catch (e) {
                try {
                    map.setMapStyleV2({ styleJson: SAFE_STYLE_JSON });
                } catch (e2) {}
            }
        }
    }

    function buildCoordMapFromRows(rows) {
        const map = new Map();
        (rows || []).forEach((r) => {
            const city = String(r.city || r.city_name || "").trim();
            const country = String(r.country || "").trim();
            const lat = toNum(r.lat);
            const lng = toNum(r.lng ?? r.lon);
            if (!city || !country || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
            map.set(`${city}|${country}`, { lat, lng });
        });
        return map;
    }

    async function loadCityCoordCache(jsonPath, fallbackRows) {
        try {
            const resp = await fetch(jsonPath, { cache: "no-store" });
            if (resp.ok) {
                const data = await resp.json();
                const cities = Array.isArray(data?.cities) ? data.cities : [];
                return buildCoordMapFromRows(cities);
            }
        } catch (e) {}
        return buildCoordMapFromRows(fallbackRows || []);
    }

    function mergeRowsWithCoordCache(rows, coordMap) {
        return (rows || []).map((r) => {
            const city = String(r.city || "").trim();
            const country = String(r.country || "").trim();
            const key = `${city}|${country}`;
            const cache = coordMap?.get(key);
            const lat = toNum(r.lat);
            const lng = toNum(r.lng);
            if (Number.isFinite(lat) && Number.isFinite(lng)) return r;
            if (!cache) return r;
            return { ...r, lat: cache.lat, lng: cache.lng };
        });
    }

    function clampMapView(map, bounds, zoomRange) {
        const b = bounds || VIEW_BOUNDS;
        const z = zoomRange || ZOOM_RANGE;
        const c = map.getCenter();
        const lng = Math.min(b.maxLng, Math.max(b.minLng, c.lng));
        const lat = Math.min(b.maxLat, Math.max(b.minLat, c.lat));
        if (Math.abs(lng - c.lng) > 0.0001 || Math.abs(lat - c.lat) > 0.0001) {
            const maxStepLng = 0.9;
            const maxStepLat = 0.7;
            const deltaLng = lng - c.lng;
            const deltaLat = lat - c.lat;
            const stepLng = Math.abs(deltaLng) > maxStepLng ? Math.sign(deltaLng) * maxStepLng : deltaLng;
            const stepLat = Math.abs(deltaLat) > maxStepLat ? Math.sign(deltaLat) * maxStepLat : deltaLat;
            const reboundPoint = new BMapGL.Point(c.lng + stepLng, c.lat + stepLat);
            if (typeof map.panTo === "function") {
                try {
                    map.panTo(reboundPoint, { noAnimation: false });
                } catch (e) {
                    map.setCenter(reboundPoint);
                }
            } else {
                map.setCenter(reboundPoint);
            }
        }
        const currentZoom = map.getZoom();
        if (currentZoom < z.min) map.setZoom(z.min);
        if (currentZoom > z.max) map.setZoom(z.max);
    }

    function injectBMapFallbackScripts() {
        const root = document.head || document.documentElement;
        if (!document.querySelector('link[href*="api.map.baidu.com/res/webgl/10/bmap.css"]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "https://api.map.baidu.com/res/webgl/10/bmap.css";
            root.appendChild(link);
        }
        const akRetry = baiduMapAk();
        if (
            akRetry &&
            !document.querySelector('script[src*="api.map.baidu.com/getscript?type=webgl"]')
        ) {
            const script = document.createElement("script");
            script.async = true;
            script.src = `https://api.map.baidu.com/getscript?type=webgl&v=1.0&ak=${encodeURIComponent(
                akRetry
            )}`;
            root.appendChild(script);
        }
    }

    async function ensureBMapReady(maxWaitMs) {
        const waitMs = Number(maxWaitMs) > 0 ? Number(maxWaitMs) : 8000;
        const poll = 48;
        const fallbackAfter = 1100;
        let fallbackDone = false;
        const start = Date.now();
        while (Date.now() - start < waitMs) {
            if (window.BMapGL && typeof BMapGL.Map === "function") return true;
            const elapsed = Date.now() - start;
            if (!fallbackDone && elapsed >= fallbackAfter) {
                fallbackDone = true;
                injectBMapFallbackScripts();
            }
            await new Promise((r) => window.setTimeout(r, poll));
        }
        injectBMapFallbackScripts();
        const secondStart = Date.now();
        const rest = Math.min(waitMs, 6000);
        while (Date.now() - secondStart < rest) {
            if (window.BMapGL && typeof BMapGL.Map === "function") return true;
            await new Promise((r) => window.setTimeout(r, poll));
        }
        return !!(window.BMapGL && typeof BMapGL.Map === "function");
    }

    return {
        baiduMapAk,
        get AK() {
            return baiduMapAk();
        },
        VIEW_BOUNDS,
        ZOOM_RANGE,
        INITIAL_CENTER,
        INITIAL_ZOOM,
        STYLE_JSON,
        USE_CUSTOM_STYLE,
        toNum,
        normalizeRows,
        getEnterpriseKey,
        aggregateCities,
        buildCoordMapFromRows,
        loadCityCoordCache,
        mergeRowsWithCoordCache,
        createGlowDotIconFactory,
        buildArcPoints,
        applyTechStyle,
        clampMapView,
        ensureBMapReady
    };
})();
