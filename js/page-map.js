document.addEventListener("DOMContentLoaded", async function () {
    if (!window.AppDataUtils) return;
    document.body.classList.add("map-native-night");
    const mapShared = window.MapShared || {};
    const mapMidLayer = window.MapMidLayer || {};

    // 地图缓存机制 - 检查是否已有缓存的地图实例
    if (!window.__yuxiaoqiaoMapCache) {
        window.__yuxiaoqiaoMapCache = {
            initialized: false,
            data: null,
            timestamp: 0
        };
    }
    const cache = window.__yuxiaoqiaoMapCache;
    
    function updateLoadingProgress(step, total, message) {
        // 遮罩已移除文本提示，保留接口兼容调用链
    }

    const origin = { city: "玉林", country: "中国", lat: 22.636, lng: 110.186 };
    const guangxiCities = new Set(["玉林", "南宁", "柳州", "桂林", "北海"]);
    const projectExtraCountries = new Set([
        "泰国", "越南", "马来西亚", "新加坡", "印度尼西亚", "菲律宾", "柬埔寨", "老挝", "缅甸", "文莱", "东帝汶"
    ]);
    const typeColors = {
        "餐饮": "#f3a950", "零售": "#64c7ff", "制造": "#8fd76a", "服务": "#c889ff",
        "物流": "#7fe4ff", "贸易": "#ffd67a", "金融": "#9bc8ff", "文旅": "#f8b4ff",
        "农业": "#9fd98f", "电商": "#88b9ff", "投资": "#ffb886", "其他": "#9db3c8"
    };
    const NIGHT_BASE_STYLE = [
        { featureType: "water", elementType: "all", stylers: { color: "#0b2b48" } },
        { featureType: "land", elementType: "all", stylers: { color: "#0a1e3a" } },
        { featureType: "boundary", elementType: "all", stylers: { color: "#ffc870" } },
        { featureType: "highway", elementType: "all", stylers: { color: "#375777" } },
        { featureType: "arterial", elementType: "all", stylers: { color: "#2f4c69" } },
        { featureType: "railway", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "subway", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "poi", elementType: "all", stylers: { visibility: "off" } },
        { featureType: "all", elementType: "labels.text.fill", stylers: { color: "#b8d6ee" } },
        { featureType: "all", elementType: "labels.text.stroke", stylers: { color: "#081a31" } }
    ];
    const MAP_STYLE_CONFIG_PATH = "../date/map_style_data.json";

    const mapEl = document.getElementById("baiduMap");
    const mapLoadingMaskEl = document.getElementById("mapLoadingMask");
    const cityFilterEl = document.getElementById("cityFilter");
    const typeFilterEl = document.getElementById("typeFilter");
    const countryFilterEl = document.getElementById("countryFilter");
    const keywordFilterEl = document.getElementById("keywordFilter");
    const resetBtnEl = document.getElementById("resetFilters");
    const filterStatsEl = document.getElementById("filterStats");
    const merchantListEl = document.getElementById("merchantList");
    const merchantStatsEl = document.getElementById("merchantStats");
    const selectedCityTextEl = document.getElementById("selectedCityText");
    const leftPanelEl = document.getElementById("leftPanel");
    const rightPanelEl = document.getElementById("rightPanel");
    const leftToggleEl = document.getElementById("leftToggle");
    const rightToggleEl = document.getElementById("rightToggle");
    const stripZoomInBtnEl = document.getElementById("stripZoomInBtn");
    const stripZoomOutBtnEl = document.getElementById("stripZoomOutBtn");
    const resetMapViewBtnEl = document.getElementById("resetMapViewBtn");
    if (!mapEl || !cityFilterEl || !typeFilterEl || !merchantListEl || !selectedCityTextEl) return;

    function mapT(key, vars) {
        return window.I18n && typeof window.I18n.t === "function" ? window.I18n.t(key, vars) : key;
    }

    function locPlace(zh) {
        return window.I18n && typeof window.I18n.localizePlaceName === "function"
            ? window.I18n.localizePlaceName(zh)
            : zh;
    }

    function locType(zh) {
        return window.I18n && typeof window.I18n.localizeMerchantType === "function"
            ? window.I18n.localizeMerchantType(zh)
            : zh;
    }

    const offline = window.location.protocol === "file:";
    const offlineData = window.APP_DATASETS || {};
    const mapBmapWarmPromise =
        String(window.__BAIDU_MAP_AK || "").trim() && typeof mapShared.ensureBMapReady === "function"
            ? mapShared.ensureBMapReady(12000)
            : null;
    const normalizeRows = typeof mapShared.normalizeRows === "function" ? mapShared.normalizeRows : (rows) => rows || [];
    const aggregateCities = typeof mapShared.aggregateCities === "function" ? mapShared.aggregateCities : (rows) => rows || [];
    const enterpriseKeyFn =
        typeof mapShared.getEnterpriseKey === "function"
            ? mapShared.getEnterpriseKey
            : (m) => `${m.country}|${m.city}|${m.merchant_type}`;
    const glowDotIcon = typeof mapShared.createGlowDotIconFactory === "function" ? mapShared.createGlowDotIconFactory() : (() => null);
    const buildArcPoints = typeof mapShared.buildArcPoints === "function" ? mapShared.buildArcPoints : ((from, to) => [from, to]);

    // 如果地图已缓存，直接复用
    if (cache.initialized && cache.container && cache.data) {
        // 复用缓存的地图容器
        const existingMapContainer = document.getElementById("baiduMap");
        if (existingMapContainer && cache.container) {
            existingMapContainer.innerHTML = "";
            existingMapContainer.appendChild(cache.container);
        }

        // 隐藏加载遮罩
        if (mapLoadingMaskEl) {
            mapLoadingMaskEl.classList.add("is-hidden");
        }

        // 恢复缓存的UI状态
        const { cityGroups, allRows, lastState } = cache.data;
        
        populateFilters(cityGroups, allRows);
        if (lastState) {
            cityFilterEl.value = lastState.activeCityKey || "";
            typeFilterEl.value = lastState.activeType || "";
            if (countryFilterEl) countryFilterEl.value = lastState.activeCountry || "";
            if (keywordFilterEl) keywordFilterEl.value = lastState.keyword || "";
        }

        // 简单的重新绑定基础UI
        function bindCollapse(panelEl, btnEl, collapsedClass, foldChar, expandChar) {
            if (!panelEl || !btnEl) return;
            btnEl.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                panelEl.classList.toggle(collapsedClass);
                btnEl.textContent = panelEl.classList.contains(collapsedClass) ? expandChar : foldChar;
            });
        }
        bindCollapse(leftPanelEl, leftToggleEl, "is-collapsed", "◀", "▶");
        bindCollapse(rightPanelEl, rightToggleEl, "is-collapsed", "▶", "◀");

        bindMerchantListDelegation(map);

        return;
    }

    let activeCityKey = "";
    let activeType = "";
    let activeCountry = "";
    let keyword = "";
    let markerOverlays = [];
    let midLayerInstance = null;
    let cityQuickLabel = null;
    const markerRefs = new Map();
    const mapBounds = mapShared.VIEW_BOUNDS || { minLng: 94, maxLng: 126, minLat: -12, maxLat: 30 };
    const zoomRange = { min: 4, max: 7 };
    let hasMapLoadCompleted = false;
    let lastVisibleCitiesForStats = [];
    const merchantTrMap = new Map();

    function rowForDisplay(m) {
        if (!m) return m;
        const id = String(m.merchant_id || "").trim();
        if (!id) return m;
        const ov = merchantTrMap.get(id);
        if (!ov) return m;
        return Object.assign({}, m, ov);
    }

    function setMapLoading(loading) {
        if (!mapLoadingMaskEl) return;
        mapLoadingMaskEl.classList.toggle("is-hidden", !loading);
    }

    function finishMapLoading(message) {
        if (hasMapLoadCompleted) return;
        hasMapLoadCompleted = true;
        setMapLoading(false);
    }

    function showMapError(message) {
        selectedCityTextEl.textContent = mapT("map.selectedTpl", { city: "—" });
        if (merchantStatsEl) {
            merchantStatsEl.innerHTML =
                `<span>${mapT("map.stats.merchants", { n1: 0 })}</span><span>${mapT(
                    "map.stats.enterprises",
                    { n2: 0 }
                )}</span>`;
        }
        merchantListEl.innerHTML = `<div class="merchant-empty">${message}</div>`;
    }

    async function loadMerchantRows() {
        if (offline) return offlineData.merchants || [];
        if (window.MapPreload && typeof window.MapPreload.getCache === "function") {
            var cached = window.MapPreload.getCache("merchants");
            if (Array.isArray(cached) && cached.length) return cached;
        }
        try {
            const rows = await window.AppDataUtils.loadCsv("../date/merchants.csv");
            if (Array.isArray(rows) && rows.length) {
                if (window.MapPreload && typeof window.MapPreload.setCache === "function") {
                    window.MapPreload.setCache("merchants", rows);
                }
                return rows;
            }
            return offlineData.merchants || [];
        } catch (e) {
            return offlineData.merchants || [];
        }
    }

    async function loadCustomMapStyle(path) {
        if (window.MapPreload && typeof window.MapPreload.getCache === "function") {
            var cached = window.MapPreload.getCache("style");
            if (Array.isArray(cached)) return cached;
        }
        try {
            const resp = await fetch(path, { cache: "no-store" });
            if (!resp.ok) return null;
            const json = await resp.json();
            if (Array.isArray(json)) {
                if (window.MapPreload && typeof window.MapPreload.setCache === "function") {
                    window.MapPreload.setCache("style", json);
                }
                return json;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    let _allMarkersBuilt = false;

    function buildAllCityMarkersOnce() {
        if (_allMarkersBuilt) return;
        cityGroups.forEach((city) => {
            const inGuangxi = city.country === "中国" && guangxiCities.has(city.city);
            const cityPoint = new BMapGL.Point(city.lng, city.lat);
            const normalIcon = glowDotIcon(inGuangxi ? 6 : 7);
            const hoverIcon = glowDotIcon(inGuangxi ? 8 : 9);
            const marker = new BMapGL.Marker(cityPoint, { icon: normalIcon });
            marker.setTitle(`${locPlace(city.city)} (${locPlace(city.country)})`);
            marker.addEventListener("mouseover", function () { marker.setIcon(hoverIcon); });
            marker.addEventListener("mouseout", function () {
                const ref = markerRefs.get(city.key);
                if (ref && city.key !== activeCityKey) marker.setIcon(ref.normalIcon);
            });
            marker.addEventListener("click", function () {
                activeCityKey = city.key;
                cityFilterEl.value = city.key;
                applyActiveSelectionVisual(city.key);
                showCityQuickCard(map, allRows, city.key, cityPoint);
                renderMerchantList(allRows, map);
                ensureRightPanelExpanded();
            });
            map.addOverlay(marker);
            markerOverlays.push(marker);
            markerRefs.set(city.key, { marker, point: cityPoint, normalIcon, hoverIcon, onMap: true });
        });
        _allMarkersBuilt = true;
    }

    function _toggleMarkerVisibility(ref, shouldShow) {
        if (shouldShow && !ref.onMap) {
            map.addOverlay(ref.marker);
            ref.onMap = true;
        } else if (!shouldShow && ref.onMap) {
            map.removeOverlay(ref.marker);
            ref.onMap = false;
        }
    }

    function clearMapOverlays(map) {
        markerOverlays.forEach((m) => map.removeOverlay(m));
        markerOverlays = [];
        if (cityQuickLabel) {
            map.removeOverlay(cityQuickLabel);
            cityQuickLabel = null;
        }
        markerRefs.clear();
        _allMarkersBuilt = false;
    }

    function removeQuickCardOnly() {
        if (cityQuickLabel) {
            map.removeOverlay(cityQuickLabel);
            cityQuickLabel = null;
        }
    }

    function ensureRightPanelExpanded() {
        if (!rightPanelEl) return;
        if (rightPanelEl.classList.contains("is-collapsed")) {
            rightPanelEl.classList.remove("is-collapsed");
            if (rightToggleEl) rightToggleEl.textContent = "▶";
        }
    }

    function populateFilters(cities, rows) {
        cityFilterEl.innerHTML =
            "<option value=\"\">" + mapT("map.filter.cityPh") + "</option>" +
            cities.map((c) => `<option value="${c.key}">${locPlace(c.city)}</option>`).join("");
        const types = Array.from(new Set(rows.map((r) => r.merchant_type))).sort();
        typeFilterEl.innerHTML =
            "<option value=\"\">" + mapT("map.filter.typePh") + "</option>" +
            types.map((typ) => `<option value="${typ}">${locType(typ)}</option>`).join("");
        if (countryFilterEl) {
            const countries = Array.from(new Set(rows.map((r) => r.country))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
            countryFilterEl.innerHTML =
                "<option value=\"\">" + mapT("map.filter.countryPh") + "</option>" +
                countries.map((c) => `<option value="${c}">${locPlace(c)}</option>`).join("");
        }
    }

    function localizeFilterFirstOptions() {
        if (!window.I18n) return;
        if (cityFilterEl.options[0] && cityFilterEl.options[0].value === "") {
            cityFilterEl.options[0].textContent = mapT("map.filter.cityPh");
        }
        if (typeFilterEl.options[0] && typeFilterEl.options[0].value === "") {
            typeFilterEl.options[0].textContent = mapT("map.filter.typePh");
        }
        if (countryFilterEl && countryFilterEl.options[0] && countryFilterEl.options[0].value === "") {
            countryFilterEl.options[0].textContent = mapT("map.filter.countryPh");
        }
    }

    function getCityRows(rows, cityKey) {
        if (!cityKey) return [];
        return rows.filter((m) => `${m.city}|${m.country}` === cityKey);
    }

    function removeCityQuickCard(map) {
        if (!cityQuickLabel) return;
        map.removeOverlay(cityQuickLabel);
        cityQuickLabel = null;
    }

    function showCityQuickCard(map, allRows, cityKey, cityPoint) {
        removeCityQuickCard(map);
        const cityRows = getCityRows(allRows, cityKey);
        if (!cityRows.length) return;
        const cityName = locPlace(cityRows[0].city);
        const enterpriseCount = new Set(cityRows.map((m) => enterpriseKeyFn(m))).size;
        const typeCount = new Set(cityRows.map((m) => m.merchant_type)).size;
        const html = `
            <div class="map-city-quick-card">
                <h4>${cityName}</h4>
                <div class="map-city-quick-grid">
                    <span>${mapT("map.cityQuick.merchants")}：<b>${cityRows.length}</b></span>
                    <span>${mapT("map.cityQuick.enterprises")}：<b>${enterpriseCount}</b></span>
                    <span>${mapT("map.cityQuick.types")}：<b>${typeCount}</b></span>
                </div>
            </div>
        `;
        cityQuickLabel = new BMapGL.Label(html, {
            position: cityPoint,
            offset: new BMapGL.Size(12, -62)
        });
        cityQuickLabel.setStyle({ border: "0", backgroundColor: "transparent", padding: "0" });
        map.addOverlay(cityQuickLabel);
    }

    function applyActiveSelectionVisual(cityKey) {
        markerRefs.forEach((ref, key) => {
            ref.marker.setIcon(key === cityKey ? ref.hoverIcon : ref.normalIcon);
        });
        if (midLayerInstance && typeof midLayerInstance.setActiveCity === "function") {
            midLayerInstance.setActiveCity(cityKey || "");
        }
    }

    function filterMerchants(rows) {
        const q = String(keyword || "").trim().toLowerCase();
        return rows.filter((m) => {
            const key = `${m.city}|${m.country}`;
            const passCity = !activeCityKey || key === activeCityKey;
            const passType = !activeType || m.merchant_type === activeType;
            const passCountry = !activeCountry || m.country === activeCountry;
            const d = rowForDisplay(m);
            const passKeyword =
                !q ||
                [
                    d.merchant_name,
                    m.merchant_name,
                    d.merchant_desc,
                    m.merchant_desc,
                    d.contact,
                    m.contact,
                    m.city,
                    m.country,
                    locPlace(m.city),
                    locPlace(m.country),
                    locType(m.merchant_type)
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(q);
            return passCity && passType && passCountry && passKeyword;
        });
    }

    function renderFilterStats(allRows, visibleCities) {
        if (!filterStatsEl) return;
        const filteredRows = filterMerchants(allRows);
        const enterprises = new Set(filteredRows.map((m) => enterpriseKeyFn(m))).size;
        filterStatsEl.textContent = mapT("map.filter.statsTpl", {
            cities: visibleCities.length,
            merchants: filteredRows.length,
            enterprises: enterprises
        });
    }

    function renderMerchantList(allRows, map) {
        const filtered = filterMerchants(allRows);
        const currentCity = activeCityKey ? locPlace(activeCityKey.split("|")[0]) : mapT("map.allCities");
        selectedCityTextEl.textContent = mapT("map.selectedCountTpl", { city: currentCity, n: filtered.length });
        if (merchantStatsEl) {
            const uniqueEnterprises = new Set(filtered.map((m) => enterpriseKeyFn(m))).size;
            merchantStatsEl.innerHTML =
                `<span>${mapT("map.stats.merchants", { n1: filtered.length })}</span><span>${mapT(
                    "map.stats.enterprises",
                    { n2: uniqueEnterprises }
                )}</span>`;
        }
        if (!filtered.length) {
            merchantListEl.innerHTML = '<div class="merchant-empty">' + mapT("map.merchant.noMatch") + "</div>";
            return;
        }
        const maxCards = Math.min(filtered.length, 500);
        const shown = filtered.slice(0, maxCards);
        const extraHint =
            filtered.length > maxCards
                ? `<div class="merchant-truncated-hint">${mapT("map.merchant.truncated", { n: filtered.length - maxCards })}</div>`
                : "";
        merchantListEl.innerHTML = shown.map((m) => {
            const d = rowForDisplay(m);
            const descPart = d.merchant_desc ? ` · ${d.merchant_desc}` : "";
            return `
            <article class="merchant-card" data-city-key="${m.city}|${m.country}">
                <div class="merchant-card-top">
                    <h3>${d.merchant_name}</h3>
                    <span class="merchant-type" style="border-color:${typeColors[m.merchant_type] || typeColors["其他"]};color:${typeColors[m.merchant_type] || typeColors["其他"]};">${locType(m.merchant_type)}</span>
                </div>
                <p>${locPlace(m.city)} · ${locPlace(m.country)}${descPart}</p>
                <div class="merchant-meta">
                    <span>${mapT("map.coord", { lat: m.lat.toFixed(2), lng: m.lng.toFixed(2) })}</span>
                    <span>${d.contact || m.contact || mapT("map.contactPending")}</span>
                </div>
            </article>
        `;
        }).join("") + extraHint;

        const activeCards = merchantListEl.querySelectorAll('.merchant-card[data-city-key="' + activeCityKey + '"]');
        activeCards.forEach((card) => card.classList.add("is-active"));
    }

    let _merchantDelegationBound = false;
    function bindMerchantListDelegation(map) {
        if (_merchantDelegationBound || !merchantListEl) return;
        merchantListEl.addEventListener("mouseover", function (e) {
            const card = e.target.closest(".merchant-card");
            if (!card) return;
            const key = card.getAttribute("data-city-key") || "";
            const ref = markerRefs.get(key);
            if (ref) ref.marker.setIcon(ref.hoverIcon);
        });
        merchantListEl.addEventListener("mouseout", function (e) {
            const card = e.target.closest(".merchant-card");
            if (!card) return;
            const key = card.getAttribute("data-city-key") || "";
            const ref = markerRefs.get(key);
            if (ref && key !== activeCityKey) ref.marker.setIcon(ref.normalIcon);
        });
        merchantListEl.addEventListener("click", function (e) {
            const card = e.target.closest(".merchant-card");
            if (!card) return;
            const key = card.getAttribute("data-city-key") || "";
            const ref = markerRefs.get(key);
            if (!ref) return;
            activeCityKey = key;
            cityFilterEl.value = key;
            applyActiveSelectionVisual(key);
            showCityQuickCard(map, allRows, key, ref.point);
            renderMerchantList(allRows, map);
            ensureRightPanelExpanded();
            map.panTo(ref.point);
        });
        _merchantDelegationBound = true;
    }

    function bindCollapse(panelEl, btnEl, collapsedClass, foldChar, expandChar) {
        if (!panelEl || !btnEl) return;
        btnEl.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            panelEl.classList.toggle(collapsedClass);
            btnEl.textContent = panelEl.classList.contains(collapsedClass) ? expandChar : foldChar;
        });
    }

    if (!String(window.__BAIDU_MAP_AK || "").trim()) {
        setMapLoading(true, mapT("map.sdkFailLong"));
        showMapError(mapT("map.error.akMissing"));
        return;
    }
    let bmapReady = !!(window.BMapGL && typeof BMapGL.Map === "function");
    if (!bmapReady && mapBmapWarmPromise) {
        bmapReady = await mapBmapWarmPromise;
    }
    if (!bmapReady && typeof mapShared.ensureBMapReady === "function") {
        bmapReady = await mapShared.ensureBMapReady(6000);
    }
    if (!bmapReady) {
        setMapLoading(true, mapT("map.sdkFailLong"));
        showMapError(mapT("map.error.bmap"));
        return;
    }

    updateLoadingProgress(1, 4, mapT("map.loading.data"));
    
    const [sourceRows, coordCache, merchantsSidecarKeys] = await Promise.all([
        loadMerchantRows(),
        (async function() {
            if (window.MapPreload && typeof window.MapPreload.getCache === "function") {
                var cachedCoords = window.MapPreload.getCache("coords");
                if (cachedCoords && cachedCoords.cities && window.MapShared && typeof window.MapShared.buildCoordMapFromRows === "function") {
                    return window.MapShared.buildCoordMapFromRows(cachedCoords.cities);
                }
            }
            if (typeof mapShared.loadCityCoordCache === "function") {
                var result = await mapShared.loadCityCoordCache("../date/city-coords.json", offlineData.mapCities || []);
                if (result && result.size > 0 && window.MapPreload && typeof window.MapPreload.setCache === "function") {
                    try {
                        var citiesArr = [];
                        result.forEach(function(v, k) {
                            var parts = String(k).split("|");
                            citiesArr.push({ city: parts[0] || "", country: parts[1] || "", lat: v.lat, lng: v.lng });
                        });
                        window.MapPreload.setCache("coords", { cities: citiesArr });
                    } catch (e) {}
                }
                return result;
            }
            return Promise.resolve(new Map());
        })(),
        (async function() {
            if (window.MapPreload && typeof window.MapPreload.getCache === "function") {
                var cachedI18n = window.MapPreload.getCache("i18n");
                if (cachedI18n && typeof cachedI18n.keys === "object") return cachedI18n.keys;
            }
            if (offline) return null;
            try {
                const resp = await fetch("../date/merchants-i18n.json", { cache: "no-store" });
                if (!resp.ok) return null;
                const j = await resp.json();
                var keys = (j && typeof j.keys === "object") ? j.keys : null;
                if (keys && window.MapPreload && typeof window.MapPreload.setCache === "function") {
                    window.MapPreload.setCache("i18n", j);
                }
                return keys;
            } catch (e) {
                return null;
            }
        })()
    ]);
    
    updateLoadingProgress(2, 4, mapT("map.loading.process"));
    
    const mergedRows = typeof mapShared.mergeRowsWithCoordCache === "function"
        ? mapShared.mergeRowsWithCoordCache(sourceRows, coordCache)
        : sourceRows;
    const allRawRows = normalizeRows(mergedRows);
    const allowedCountries = new Set(allRawRows.map((r) => String(r.country || "").trim()).filter(Boolean));
    projectExtraCountries.forEach((c) => allowedCountries.add(c));
    allowedCountries.add("中国");
    const scopedRows = allRawRows.filter((row) => {
        if (!row.country || !allowedCountries.has(row.country)) return false;
        if (row.country === "中国") return guangxiCities.has(row.city);
        return true;
    });
    const allRows = scopedRows;
    if (!allRows.length) {
        showMapError(mapT("map.error.noCsv"));
        return;
    }

    updateLoadingProgress(3, 4, mapT("map.loading.i18n"));
    if (merchantsSidecarKeys && typeof merchantsSidecarKeys === "object") {
        allRows.forEach(function (m) {
            const raw = String(m.merchant_raw_name || m.merchant_name || "").trim();
            const k = [String(m.city || "").trim(), String(m.country || "").trim(), raw].join("|");
            const pack = merchantsSidecarKeys[k];
            if (pack && typeof pack === "object") m._merchantsI18n = pack;
        });
    }

    updateLoadingProgress(4, 4, mapT("map.loading.map"));
    
    const [externalStyleJson] = await Promise.all([
        loadCustomMapStyle(MAP_STYLE_CONFIG_PATH)
    ]);

    async function syncMerchantTranslations() {
        merchantTrMap.clear();
        if (!window.I18n) {
            return;
        }
        const loc = window.I18n.getLocale();
        if (loc === "zh-CN") {
            return;
        }
        allRows.forEach(function (r) {
            const id = String(r.merchant_id || "").trim();
            if (!id) return;
            const pack = r._merchantsI18n && r._merchantsI18n[loc];
            if (pack && String(pack.merchant_name || "").trim()) {
                merchantTrMap.set(id, {
                    merchant_name: String(pack.merchant_name || "").trim(),
                    merchant_desc: String(pack.merchant_desc || "").trim() || r.merchant_desc,
                    contact: String(pack.contact || r.contact || "").trim()
                });
            }
        });
        const needApi = allRows.filter(function (r) {
            const id = String(r.merchant_id || "").trim();
            return id && !merchantTrMap.has(id);
        });
        if (typeof window.I18n.translateMerchantRows !== "function") {
            return;
        }
        if (!needApi.length) {
            return;
        }
        if (merchantListEl && allRows.length) {
            merchantListEl.innerHTML =
                '<div class="merchant-empty">' + mapT("map.merchant.translating") + "</div>";
        }
        try {
            const tr = await window.I18n.translateMerchantRows(needApi);
            tr.forEach(function (r) {
                const id = String(r.merchant_id || "").trim();
                if (!id) return;
                merchantTrMap.set(id, {
                    merchant_name: r.merchant_name,
                    merchant_desc: r.merchant_desc,
                    contact: r.contact
                });
            });
        } catch (e) {}
    }

    const cityGroups = aggregateCities(allRows);

    const mapContainer = document.querySelector(".baidu-map-container") || mapEl;
    if (mapContainer) mapContainer.classList.add("is-map-warming");

    const map = new BMapGL.Map("baiduMap", { enableMapClick: false });
    try {
        window.__yuxiaoqiaoMapPageMap = map;
    } catch (eMapRef) {}

    const applyNativeNightStyle = function () {
        try {
            if (typeof map.setMapStyleV2 === "function") {
                map.setMapStyleV2({ styleJson: externalStyleJson || NIGHT_BASE_STYLE });
            }
        } catch (e) {}
    };
    applyNativeNightStyle();

    map.centerAndZoom(new BMapGL.Point(origin.lng, origin.lat), 5);
    map.enableScrollWheelZoom(true);
    if (typeof map.disableDoubleClickZoom === "function") map.disableDoubleClickZoom();
    if (typeof map.disableKeyboard === "function") map.disableKeyboard();
    if (typeof map.disableTilt === "function") map.disableTilt();
    if (typeof map.disableRotate === "function") map.disableRotate();

    let loadingFallbackTimer = window.setTimeout(function () {
        if (mapContainer) mapContainer.classList.remove("is-map-warming");
        finishMapLoading(mapT("map.finishReady"));
    }, 12000);
    map.addEventListener("tilesloaded", function () {
        if (hasMapLoadCompleted) return;
        if (loadingFallbackTimer) {
            window.clearTimeout(loadingFallbackTimer);
            loadingFallbackTimer = null;
        }
        try {
            if (typeof map.checkResize === "function") map.checkResize();
        } catch (e) {}
        // 瓦片加载完立刻开始过渡动画：地图画布淡入 + 遮罩淡出，时间由 CSS transition 智能控制
        if (mapContainer) mapContainer.classList.remove("is-map-warming");
        finishMapLoading(mapT("map.finishDone"));
    });
    if (typeof map.setMinZoom === "function") map.setMinZoom(zoomRange.min);
    if (typeof map.setMaxZoom === "function") map.setMaxZoom(zoomRange.max);

    let resizeDelayTimer = null;
    function refreshMapSize() {
        if (resizeDelayTimer) window.clearTimeout(resizeDelayTimer);
        resizeDelayTimer = window.setTimeout(function () {
            if (typeof map.checkResize === "function") map.checkResize();
        }, 150);
    }
    window.addEventListener("resize", refreshMapSize);

    const originPoint = new BMapGL.Point(origin.lng, origin.lat);
    const originLabel = new BMapGL.Label(locPlace("玉林"), { position: originPoint, offset: new BMapGL.Size(10, -24) });
    originLabel.setStyle({
        color: "#f9e1b5",
        border: "0",
        backgroundColor: "transparent",
        fontSize: "13px",
        fontWeight: "700"
    });

    function clampCenterHard() {
        const center = map.getCenter();
        const targetLng = Math.min(mapBounds.maxLng, Math.max(mapBounds.minLng, center.lng));
        const targetLat = Math.min(mapBounds.maxLat, Math.max(mapBounds.minLat, center.lat));
        if (Math.abs(targetLng - center.lng) > 0.0008 || Math.abs(targetLat - center.lat) > 0.0008) {
            map.setCenter(new BMapGL.Point(targetLng, targetLat));
        }
        const z = Math.round(map.getZoom());
        if (z < zoomRange.min) map.setZoom(zoomRange.min);
        if (z > zoomRange.max) map.setZoom(zoomRange.max);
    }

    function renderMapByFilter() {
        if (!_allMarkersBuilt) {
            const originMarker = new BMapGL.Marker(originPoint, { icon: glowDotIcon(8) });
            map.addOverlay(originMarker);
            map.addOverlay(originLabel);
            markerOverlays.push(originMarker, originLabel);
            buildAllCityMarkersOnce();
        }

        const visibleCities = cityGroups
            .filter((city) => {
                const key = city.key;
                const passCity = !activeCityKey || key === activeCityKey;
                const passCountry = !activeCountry || city.country === activeCountry;
                const passType = !activeType || city.merchants.some((m) => m.merchant_type === activeType);
                const passKeyword = !keyword || filterMerchants(city.merchants).length > 0;
                return passCity && passCountry && passType && passKeyword;
            });

        const visibleKeySet = new Set(visibleCities.map((c) => c.key));
        markerRefs.forEach((ref, key) => {
            _toggleMarkerVisibility(ref, visibleKeySet.has(key));
        });

        lastVisibleCitiesForStats = visibleCities;
        renderFilterStats(allRows, visibleCities);
        applyActiveSelectionVisual(activeCityKey);
        clampCenterHard();
    }

    function resetMapView() {
        activeCityKey = "";
        activeType = "";
        activeCountry = "";
        keyword = "";
        cityFilterEl.value = "";
        typeFilterEl.value = "";
        if (countryFilterEl) countryFilterEl.value = "";
        if (keywordFilterEl) keywordFilterEl.value = "";
        applyActiveSelectionVisual("");
        removeCityQuickCard(map);
        renderMapByFilter();
        renderMerchantList(allRows, map);
        const points = cityGroups.map((c) => new BMapGL.Point(c.lng, c.lat)).concat([originPoint]);
        if (points.length > 1 && typeof map.setViewport === "function") {
            map.setViewport(points, { margins: [80, 110, 80, 110] });
        }
        clampCenterHard();
    }

    populateFilters(cityGroups, allRows);
    resetMapView();
    bindMerchantListDelegation(map);

    if (typeof mapMidLayer.create === "function") {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                midLayerInstance = mapMidLayer.create(map, {
            originPoint,
            activeCityKey,
            buildArcPoints,
            beamLinkMode: "city-linked",
            onArrive: function (cityKey) {
                const ref = markerRefs.get(cityKey);
                if (ref && cityKey !== activeCityKey) {
                    ref.marker.setIcon(ref.hoverIcon);
                    window.setTimeout(() => {
                        const currentRef = markerRefs.get(cityKey);
                        if (currentRef && cityKey !== activeCityKey) currentRef.marker.setIcon(currentRef.normalIcon);
                    }, 280);
                }
            },
            cities: cityGroups.map((city) => ({
                key: city.key,
                point: new BMapGL.Point(city.lng, city.lat)
            }))
        });
            });
        });
    }

    void syncMerchantTranslations().then(function () {
        renderMapByFilter();
        applyActiveSelectionVisual(activeCityKey);
        renderMerchantList(allRows, map);
        if (activeCityKey) {
            const matched = cityGroups.find((c) => c.key === activeCityKey);
            if (matched) {
                showCityQuickCard(map, allRows, activeCityKey, new BMapGL.Point(matched.lng, matched.lat));
            }
        }
    });

    map.addEventListener("dragend", clampCenterHard);
    map.addEventListener("zoomend", clampCenterHard);
    map.addEventListener("click", function (e) {
        if (e && e.overlay) return;
        if (!activeCityKey && !activeType && !activeCountry && !keyword) return;
        activeCityKey = "";
        activeType = "";
        activeCountry = "";
        keyword = "";
        cityFilterEl.value = "";
        typeFilterEl.value = "";
        if (countryFilterEl) countryFilterEl.value = "";
        if (keywordFilterEl) keywordFilterEl.value = "";
        applyActiveSelectionVisual("");
        removeCityQuickCard(map);
        renderMapByFilter();
        renderMerchantList(allRows, map);
    });

    cityFilterEl.addEventListener("change", function () {
        activeCityKey = cityFilterEl.value;
        if (activeCityKey) {
            const matched = cityGroups.find((c) => c.key === activeCityKey);
            if (matched) {
                showCityQuickCard(map, allRows, activeCityKey, new BMapGL.Point(matched.lng, matched.lat));
                ensureRightPanelExpanded();
            }
        } else {
            removeCityQuickCard(map);
        }
        applyActiveSelectionVisual(activeCityKey);
        renderMerchantList(allRows, map);
    });

    typeFilterEl.addEventListener("change", function () {
        activeType = typeFilterEl.value;
        renderMapByFilter();
        applyActiveSelectionVisual(activeCityKey);
        renderMerchantList(allRows, map);
    });

    if (countryFilterEl) {
        countryFilterEl.addEventListener("change", function () {
            activeCountry = countryFilterEl.value;
            renderMapByFilter();
            applyActiveSelectionVisual(activeCityKey);
            renderMerchantList(allRows, map);
        });
    }

    if (keywordFilterEl) {
        keywordFilterEl.addEventListener("input", function () {
            keyword = String(keywordFilterEl.value || "").trim();
            renderMapByFilter();
            applyActiveSelectionVisual(activeCityKey);
            renderMerchantList(allRows, map);
        });
    }

    if (resetBtnEl) resetBtnEl.addEventListener("click", resetMapView);

    function bindZoom(btnEl, delta) {
        if (!btnEl) return;
        btnEl.addEventListener("click", function () {
            const z = Math.round(map.getZoom());
            if (delta > 0 && z < zoomRange.max) map.setZoom(z + 1);
            if (delta < 0 && z > zoomRange.min) map.setZoom(z - 1);
        });
    }
    bindZoom(stripZoomInBtnEl, +1);
    bindZoom(stripZoomOutBtnEl, -1);
    if (resetMapViewBtnEl) resetMapViewBtnEl.addEventListener("click", resetMapView);

    bindCollapse(leftPanelEl, leftToggleEl, "is-collapsed", "◀", "▶");
    bindCollapse(rightPanelEl, rightToggleEl, "is-collapsed", "▶", "◀");

    // 保存地图容器到缓存
    cache.initialized = true;
    cache.container = map.getContainer();
    cache.data = {
        cityGroups: cityGroups,
        allRows: allRows,
        lastState: {
            activeCityKey: activeCityKey,
            activeType: activeType,
            activeCountry: activeCountry,
            keyword: keyword
        }
    };

    // 实时保存状态
    map.addEventListener("moveend", function() {
        cache.data.lastState = {
            activeCityKey: activeCityKey,
            activeType: activeType,
            activeCountry: activeCountry,
            keyword: keyword
        };
    });
    map.addEventListener("zoomend", function() {
        cache.data.lastState = {
            activeCityKey: activeCityKey,
            activeType: activeType,
            activeCountry: activeCountry,
            keyword: keyword
        };
    });
    cityFilterEl.addEventListener("change", function() {
        cache.data.lastState = {
            activeCityKey: activeCityKey,
            activeType: activeType,
            activeCountry: activeCountry,
            keyword: keyword
        };
    });
    typeFilterEl.addEventListener("change", function() {
        cache.data.lastState = {
            activeCityKey: activeCityKey,
            activeType: activeType,
            activeCountry: activeCountry,
            keyword: keyword
        };
    });
    if (countryFilterEl) {
        countryFilterEl.addEventListener("change", function() {
            cache.data.lastState = {
                activeCityKey: activeCityKey,
                activeType: activeType,
                activeCountry: activeCountry,
                keyword: keyword
            };
        });
    }
    if (keywordFilterEl) {
        keywordFilterEl.addEventListener("input", function() {
            cache.data.lastState = {
                activeCityKey: activeCityKey,
                activeType: activeType,
                activeCountry: activeCountry,
                keyword: keyword
            };
        });
    }

    if (window.I18n && window.I18n.EVENT_NAME) {
        window.addEventListener(window.I18n.EVENT_NAME, function () {
            if (!window.I18n) return;
            const selCity = cityFilterEl.value;
            const selType = typeFilterEl.value;
            const selCountry = countryFilterEl ? countryFilterEl.value : "";
            void syncMerchantTranslations().then(function () {
                if (!window.I18n) return;
                populateFilters(cityGroups, allRows);
                cityFilterEl.value = selCity;
                typeFilterEl.value = selType;
                if (countryFilterEl) countryFilterEl.value = selCountry;
                window.I18n.applyDom(document);
                localizeFilterFirstOptions();
                if (originLabel && typeof originLabel.setContent === "function") {
                    originLabel.setContent(locPlace("玉林"));
                }
                renderMapByFilter();
                applyActiveSelectionVisual(activeCityKey);
                renderMerchantList(allRows, map);
                if (activeCityKey) {
                    const matched = cityGroups.find((c) => c.key === activeCityKey);
                    if (matched) {
                        showCityQuickCard(map, allRows, activeCityKey, new BMapGL.Point(matched.lng, matched.lat));
                    }
                }
                if (typeof window.I18n.scheduleLayoutCalibration === "function") {
                    window.I18n.scheduleLayoutCalibration();
                }
            });
        });
    }
});
