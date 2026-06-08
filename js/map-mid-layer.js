(function () {
    const STYLE_ID = "map-mid-layer-style";

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
.map-mid-star-point {
    position: relative;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 248, 230, 0.98) 0%, rgba(255, 212, 143, 0.78) 42%, rgba(255, 200, 112, 0) 100%);
    box-shadow:
        0 0 5px rgba(255, 255, 255, 0.68),
        0 0 14px rgba(255, 212, 143, 0.84),
        0 0 28px rgba(255, 200, 112, 0.56),
        0 0 46px rgba(255, 184, 77, 0.3);
    animation: mapMidStarBreathe 6.4s infinite ease-in-out, mapMidStarTwinkle 7.8s infinite ease-in-out;
}
.map-mid-star-point.map-mid-star-sm {
    width: 4px;
    height: 4px;
    animation-duration: 5.1s, 6.2s;
    box-shadow:
        0 0 3px rgba(255, 255, 255, 0.45),
        0 0 8px rgba(255, 212, 143, 0.55),
        0 0 16px rgba(200, 230, 255, 0.28);
}
.map-mid-star-point.map-mid-star-lg {
    width: 6px;
    height: 6px;
    animation-duration: 7.2s, 9.1s;
    box-shadow:
        0 0 6px rgba(255, 255, 255, 0.65),
        0 0 14px rgba(255, 220, 160, 0.85),
        0 0 28px rgba(255, 200, 112, 0.5),
        0 0 44px rgba(120, 200, 255, 0.18);
}
.map-mid-star-point::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 2px;
    height: 2px;
    margin: -1px 0 0 -1px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
    animation: mapMidStarSpark 2.8s ease-in-out infinite;
    pointer-events: none;
}
@keyframes mapMidStarSpark {
    0%, 100% { opacity: 0.35; transform: scale(0.6); }
    50% { opacity: 1; transform: scale(1.15); }
}
.map-mid-origin-point {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 244, 216, 0.98) 0%, rgba(255, 200, 112, 0.9) 44%, rgba(255, 184, 77, 0.0) 100%);
    box-shadow:
        0 0 9px rgba(255, 212, 143, 0.86),
        0 0 20px rgba(255, 200, 112, 0.58),
        0 0 34px rgba(255, 184, 77, 0.34);
    animation: mapMidOriginBreathe 4.6s infinite ease-in-out;
}
.map-mid-origin-point::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 1px solid rgba(255, 212, 143, 0.5);
    transform: translate(-50%, -50%);
    animation: mapMidOriginHalo 4.2s infinite ease-out;
}
@keyframes mapMidStarBreathe {
    0% { transform: scale(0.9); opacity: 0.62; }
    45% { transform: scale(1.12); opacity: 0.82; }
    100% { transform: scale(0.9); opacity: 0.62; }
}
@keyframes mapMidStarTwinkle {
    0% { filter: brightness(0.94); }
    50% { filter: brightness(1.08); }
    100% { filter: brightness(0.94); }
}
@keyframes mapMidOriginBreathe {
    0% { transform: scale(0.92); opacity: 0.74; }
    50% { transform: scale(1.2); opacity: 0.98; }
    100% { transform: scale(0.92); opacity: 0.74; }
}
@keyframes mapMidOriginHalo {
    0% { width: 6px; height: 6px; opacity: 0.55; }
    70% { width: 34px; height: 34px; opacity: 0.1; }
    100% { width: 44px; height: 44px; opacity: 0; }
}
.map-mid-beam-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 252, 235, 1) 0%, rgba(255, 212, 143, 0.92) 55%, rgba(255, 212, 143, 0) 100%);
    box-shadow:
        0 0 6px rgba(255, 255, 255, 0.75),
        0 0 14px rgba(255, 235, 197, 0.95),
        0 0 26px rgba(255, 200, 112, 0.55),
        0 0 40px rgba(120, 195, 255, 0.2);
    animation: mapMidBeamPulse 2.4s ease-in-out infinite;
}
@keyframes mapMidBeamPulse {
    0%, 100% { filter: brightness(0.95); transform: scale(1); }
    50% { filter: brightness(1.2); transform: scale(1.08); }
}
`;
        document.head.appendChild(style);
    }

    function buildSoftBeamPoints(originPoint, cityPoint, buildArcPoints) {
        if (!originPoint || !cityPoint) return [];
        const dx = cityPoint.lng - originPoint.lng;
        const dy = cityPoint.lat - originPoint.lat;
        const ratio = 0.35 + Math.random() * 0.35;
        const target = new BMapGL.Point(
            originPoint.lng + dx * ratio,
            originPoint.lat + dy * ratio
        );
        if (typeof buildArcPoints === "function") return buildArcPoints(originPoint, target, 22);
        return [originPoint, target];
    }

    function buildCityLinkedBeamPoints(originPoint, cityPoint, buildArcPoints) {
        if (!originPoint || !cityPoint) return [];
        if (typeof buildArcPoints === "function") return buildArcPoints(originPoint, cityPoint, 22);
        return [originPoint, cityPoint];
    }

    function create(map, options) {
        ensureStyles();
        if (!map || !window.BMapGL) return null;

        const originPoint = options.originPoint;
        const cities = Array.isArray(options.cities) ? options.cities : [];
        const onArrive = typeof options.onArrive === "function" ? options.onArrive : null;
        const buildArcPoints = options.buildArcPoints;
        const beamLinkMode = options.beamLinkMode === "city-linked" ? "city-linked" : "outward";
        let activeCityKey = options.activeCityKey || "";

        const overlays = [];
        const states = [];
        let timer = 0;

        function addPulse(point, isOrigin) {
            const offset = isOrigin ? -3 : -2;
            const starSizes = ["map-mid-star-sm", "", "map-mid-star-lg"];
            const starExtra = isOrigin ? "" : starSizes[Math.floor(Math.random() * starSizes.length)];
            const starClass = isOrigin ? "map-mid-origin-point" : "map-mid-star-point" + (starExtra ? " " + starExtra : "");
            const html = isOrigin ? `<div class="map-mid-origin-point"></div>` : `<div class="${starClass}"></div>`;
            const label = new BMapGL.Label(
                html,
                { position: point, offset: new BMapGL.Size(offset, offset) }
            );
            label.setStyle({
                border: "0",
                backgroundColor: "transparent",
                padding: "0",
                lineHeight: "0"
            });
            map.addOverlay(label);
            overlays.push(label);
        }

        if (originPoint) addPulse(originPoint, true);
        cities.forEach((city) => {
            addPulse(city.point, false);
            const points = beamLinkMode === "city-linked"
                ? buildCityLinkedBeamPoints(originPoint, city.point, buildArcPoints)
                : buildSoftBeamPoints(originPoint, city.point, buildArcPoints);
            if (points.length < 2) return;
            const seed = points.slice(0, 2);
            const base = new BMapGL.Polyline(points, {
                strokeColor: "#ffe8b8",
                strokeWeight: 1.2,
                strokeOpacity: 0.12
            });
            const glow = new BMapGL.Polyline(seed, {
                strokeColor: "#fff8e8",
                strokeWeight: 3,
                strokeOpacity: 0.1
            });
            const core = new BMapGL.Polyline(seed, {
                strokeColor: "#ffd48f",
                strokeWeight: 1.2,
                strokeOpacity: 0.22
            });
            const dot = new BMapGL.Label(`<div class="map-mid-beam-dot"></div>`, {
                position: points[0],
                offset: new BMapGL.Size(-3, -3)
            });
            dot.setStyle({
                border: "0",
                backgroundColor: "transparent",
                padding: "0",
                lineHeight: "0"
            });
            map.addOverlay(base);
            map.addOverlay(glow);
            map.addOverlay(core);
            map.addOverlay(dot);
            overlays.push(base, glow, core, dot);
            states.push({
                cityKey: city.key,
                points,
                glow,
                core,
                dot,
                progress: -1,
                idle: Math.random() * 1.7 + 0.3,
                peakTriggered: false
            });
        });

        function updateActiveStyles(state) {
            if (activeCityKey && state.cityKey !== activeCityKey) {
                state.glow.setStrokeOpacity(0.04);
                state.core.setStrokeOpacity(0.09);
            }
        }

        function start() {
            if (!states.length) return;
            timer = window.setInterval(function () {
                states.forEach((state) => {
                    if (state.progress < 0) {
                        state.idle -= 0.1;
                        if (state.idle <= 0) state.progress = 0;
                        return;
                    }
                    state.progress += 0.05;
                    const headRate = Math.min(1, state.progress);
                    const tailRate = Math.max(0, headRate - 0.42);
                    const total = state.points.length - 1;
                    const headIdx = Math.max(1, Math.min(total, Math.round(headRate * total)));
                    const tailIdx = Math.max(0, Math.min(headIdx - 1, Math.round(tailRate * total)));
                    const segPath = state.points.slice(tailIdx, headIdx + 1);
                    if (segPath.length < 2) return;
                    state.glow.setPath(segPath);
                    state.core.setPath(segPath);
                    const fade = headRate < 0.86 ? 1 : Math.max(0, 1 - (headRate - 0.86) / 0.14);
                    state.glow.setStrokeOpacity(0.1 + 0.2 * fade);
                    state.core.setStrokeOpacity(0.18 + 0.48 * fade);
                    state.dot.setPosition(segPath[segPath.length - 1]);
                    updateActiveStyles(state);
                    if (!state.peakTriggered && headRate > 0.92) {
                        state.peakTriggered = true;
                        if (onArrive) onArrive(state.cityKey);
                    }
                    if (state.progress >= 1) {
                        state.progress = -1;
                        state.idle = Math.random() * 2.2 + 0.55;
                        state.peakTriggered = false;
                    }
                });
            }, 130);
        }

        function dispose() {
            if (timer) {
                window.clearInterval(timer);
                timer = 0;
            }
            overlays.forEach((o) => map.removeOverlay(o));
        }

        function setActiveCity(cityKey) {
            activeCityKey = cityKey || "";
        }

        start();
        return { dispose, setActiveCity };
    }

    window.MapMidLayer = { create };
})();
