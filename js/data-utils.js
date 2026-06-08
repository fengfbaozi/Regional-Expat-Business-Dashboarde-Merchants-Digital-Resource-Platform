(function () {
    function parseCsvText(text) {
        const lines = String(text || "").split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length < 2) return [];
        const headers = splitCsvLine(lines[0]).map((h, i) => {
            const key = h.trim();
            return i === 0 ? key.replace(/^\uFEFF/, "") : key;
        });
        return lines.slice(1).map((line) => {
            const cols = splitCsvLine(line);
            const row = {};
            headers.forEach((h, i) => {
                row[h] = (cols[i] || "").trim();
            });
            return row;
        });
    }

    function splitCsvLine(line) {
        const result = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i += 1) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === "," && !inQuotes) {
                result.push(current);
                current = "";
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    }

    function localWeatherText() {
        const now = new Date();
        const m = now.getMonth() + 1;
        const h = now.getHours();
        if (h >= 6 && h <= 18) {
            if (m >= 5 && m <= 9) return "晴 30°C";
            if (m >= 10 && m <= 11) return "多云 25°C";
            if (m <= 2 || m === 12) return "阴 16°C";
            return "晴 22°C";
        }
        return "夜间 20°C";
    }

    function pad2(n) {
        return String(n).padStart(2, "0");
    }

    function localDateText() {
        const now = new Date();
        const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const y = now.getFullYear();
        const m = pad2(now.getMonth() + 1);
        const d = pad2(now.getDate());
        const hm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
        return `${y}-${m}-${d} ${week[now.getDay()]} ${hm}`;
    }

    function localDateTimeText() {
        const now = new Date();
        const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const y = now.getFullYear();
        const mo = pad2(now.getMonth() + 1);
        const d = pad2(now.getDate());
        const hms = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
        return `${y}-${mo}-${d} ${week[now.getDay()]} ${hms}`;
    }

    async function loadCsv(path) {
        const res = await fetch(path);
        if (!res.ok) throw new Error("CSV load failed");
        return parseCsvText(await res.text());
    }

    function qiaowuStableId(url) {
        const s = String(url || "");
        let h = 2166136261;
        for (let i = 0; i < s.length; i += 1) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return "qiaowu-" + (h >>> 0).toString(36);
    }

    /** 与 i18n.js normalizeLocale 对齐（数据层选用，不依赖 I18n 已加载） */
    function normalizeLocaleForData(code) {
        const c = String(code || "").trim();
        if (c === "en" || c === "en_US") return "en-US";
        if (c === "zh" || c === "zh_Hans") return "zh-CN";
        if (c === "th" || c === "th_TH") return "th";
        if (c === "id" || c === "id_ID" || c === "in") return "id";
        if (c === "vi" || c === "vi_VN") return "vi";
        if (c === "ms" || c === "ms_MY") return "ms";
        if (c === "fil" || c === "tl" || c === "fil_PH") return "fil";
        if (c === "zh-CN" || c === "en-US" || c === "th" || c === "id" || c === "vi" || c === "ms" || c === "fil") {
            return c;
        }
        return "zh-CN";
    }

    function pickQiaowuLocalizedTitle(row, locale) {
        if (!row) return "";
        const L = normalizeLocaleForData(locale);
        if (L === "zh-CN") return String(row.title || "").trim();
        const i18n = row.i18n && typeof row.i18n === "object" ? row.i18n : null;
        const block = i18n && i18n[L];
        if (block && typeof block === "object") {
            const t = String(block.title || block.headline || "").trim();
            if (t) return t;
        }
        if (L === "en-US") {
            const en = String(row.title_en || "").trim();
            if (en) return en;
        }
        return String(row.title || "").trim();
    }

    function pickQiaowuLocalizedSummary(row, locale) {
        if (!row) return "";
        const L = normalizeLocaleForData(locale);
        if (L === "zh-CN") return String(row.summary || "").trim();
        const i18n = row.i18n && typeof row.i18n === "object" ? row.i18n : null;
        const block = i18n && i18n[L];
        if (block && typeof block === "object") {
            const t = String(block.summary || block.excerpt || "").trim();
            if (t) return t;
        }
        if (L === "en-US") {
            const en = String(row.summary_en || "").trim();
            if (en) return en;
        }
        return String(row.summary || "").trim();
    }

    window.AppDataUtils = {
        parseCsvText,
        loadCsv,
        localDateText,
        localDateTimeText,
        localWeatherText,
        qiaowuStableId,
        normalizeLocaleForData,
        pickQiaowuLocalizedTitle,
        pickQiaowuLocalizedSummary
    };
})();
