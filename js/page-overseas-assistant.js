(function () {
    (function initAssistantBackLink() {
        var params = new URLSearchParams(window.location.search || "");
        if (params.get("from") !== "home") return;
        var backEl = document.querySelector(".assistant-page-head .section-back");
        if (!backEl) return;
        backEl.setAttribute("href", "../../index.html");
        backEl.textContent = window.I18n && window.I18n.t ? window.I18n.t("nav.home") : "返回首页";
    })();

    var _qzDef = window.ARK_QIAOZHUANG_DEFAULTS || {};
    var DEFAULT_ARK_BOT_ENDPOINT =
        String(_qzDef.endpoint || "").trim() ||
        "https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions";
    var DEFAULT_ARK_BOT_MODEL =
        String(_qzDef.model || "").trim() || "bot-20260402185514-nhjkt";

    if (typeof window.ASSISTANT_ARK !== "object" || window.ASSISTANT_ARK == null) {
        window.ASSISTANT_ARK = {
            endpoint: DEFAULT_ARK_BOT_ENDPOINT,
            apiKey: "",
            model: DEFAULT_ARK_BOT_MODEL,
            use_stream: true
        };
    }

    function arkEndpoint() {
        var cfg = window.ASSISTANT_ARK || {};
        return String(cfg.endpoint || "").trim() || DEFAULT_ARK_BOT_ENDPOINT;
    }

    const inputEl = document.getElementById("assistantQuestionInput");
    const askBtnEl = document.getElementById("assistantAskBtn");
    const categoryGridEl = document.getElementById("assistantCategoryGrid");
    const suggestTrackEl = document.getElementById("assistantSuggestTrack");
    const suggestMarqueeEl = document.getElementById("assistantSuggestMarquee");
    const threadEl = document.getElementById("assistantChatThread");
    const threadInnerEl = document.getElementById("assistantChatThreadInner");
    const composerCardEl = document.getElementById("assistantComposerCard");
    const chatExitEl = document.getElementById("assistantChatExit");
    const answerModalEl = document.getElementById("assistantAnswerModal");
    const answerCloseEl = document.getElementById("assistantAnswerClose");
    const dhEl = document.querySelector(".assistant-right");
    const dhToggleEl = document.getElementById("assistantDhToggle");
    const idleDhVideoEl = document.querySelector(".assistant-digital-human--idle");
    const thinkingDhVideoEl = document.querySelector(".assistant-digital-human--thinking");
    if (!inputEl || !askBtnEl || !threadEl || !threadInnerEl || !suggestTrackEl) return;

    if (thinkingDhVideoEl) {
        try {
            thinkingDhVideoEl.pause();
            thinkingDhVideoEl.currentTime = 0;
        } catch (_) {}
    }

    function getAnswerOutputEl() {
        return document.getElementById("assistantAnswerOutput");
    }

    function setAnswerText(text) {
        const el = getAnswerOutputEl();
        if (el) el.textContent = text == null ? "" : String(text);
    }

    const offline = window.location.protocol === "file:";

    const ASSISTANT_CATEGORY_EN = {
        "as-cat-001": {
            category: "Market access",
            question: "When Yulin enterprises expand into Southeast Asia, what public information should they review first?",
            tag: "Compliance first",
            related_questions:
                "Public channels for overseas-Chinese services; where to read ASEAN trade information; Yulin qiaowu service listings"
        },
        "as-cat-002": {
            category: "Tax & structure",
            question: "For overseas Chinese investing in China, what do public sources suggest on tax and entity structure?",
            tag: "Tax planning",
            related_questions:
                "Rights of returned overseas Chinese in public regulations; cross-border compliance basics; where to read RCEP summaries"
        },
        "as-cat-003": {
            category: "Supply chain",
            question: "For Yulin products sold to ASEAN markets, what public logistics and fulfilment information exists?",
            tag: "Delivery efficiency",
            related_questions:
                "Cross-border e‑commerce customs flows; major ASEAN ports in public data; Yulin industry clusters in the news"
        },
        "as-cat-004": {
            category: "Local operations",
            question: "What public channels usually support outreach to overseas Yulin natives?",
            tag: "Local growth",
            related_questions:
                "How to find federation contacts; public notices on qiaowu events; cultural materials on the hometown"
        }
    };

    const fallbackCategories = [
        {
            id: "as-cat-001",
            category: "市场准入",
            question: "玉林企业向东南亚拓展，第一步通常要关注哪些公开信息？",
            answer_hint: "",
            tag: "合规优先",
            image: "images/assistant/assistant-cat-market.svg",
            related_questions: "涉侨办事一般找哪些公开渠道；东盟贸易公开政策从哪查；玉林涉侨服务机构公开信息"
        },
        {
            id: "as-cat-002",
            category: "税务与架构",
            question: "侨胞回国投资在税务和主体架构上，公开资料一般建议先了解什么？",
            answer_hint: "",
            tag: "税务规划",
            image: "images/assistant/assistant-cat-tax.svg",
            related_questions: "归侨侨眷权益相关公开规定；跨境投资常见合规要点；RCEP 公开解读从哪看"
        },
        {
            id: "as-cat-003",
            category: "供应链履约",
            question: "玉林特色产品对接东盟市场，物流与履约有哪些公开信息可查？",
            answer_hint: "",
            tag: "履约效率",
            image: "images/assistant/assistant-cat-logistics.svg",
            related_questions: "跨境电商公开通关流程；东盟主要港口公开信息；玉林产业带公开报道"
        },
        {
            id: "as-cat-004",
            category: "本地化运营",
            question: "面向海外玉林籍侨胞联络与服务，公开渠道通常有哪些？",
            answer_hint: "",
            tag: "本地增长",
            image: "images/assistant/assistant-cat-local.svg",
            related_questions: "侨联组织公开联系方式怎么查；涉侨活动公开信息；玉林侨乡文化公开资料"
        }
    ];

    const EXAMPLE_QUESTIONS = [
        "玉林归侨侨眷办事一般可以通过哪些公开渠道了解流程？",
        "广西涉侨政策的公开信息通常在哪里发布？",
        "侨联相关常识有哪些适合向群众说明的公开要点？",
        "海外玉林籍侨胞想咨询家乡事务，有哪些公开的联络或信息发布方式？",
        "玉林涉侨服务机构公开信息一般怎么查询？",
        "侨胞身份证明或涉侨公证类事项，公开依据通常怎么表述？",
        "玉林侨乡文化与侨情宣传，有哪些公开资料方向可以介绍？",
        "面向东盟的玉林产业合作，公开报道里常见关注哪些领域？",
        "涉侨法律援助或咨询的公开途径有哪些？",
        "全国通用侨务常识里，归侨侨眷权益方面有哪些公开表述要点？"
    ];

    const EXAMPLE_QUESTIONS_EN = [
        "Where can I find public channels for returned overseas Chinese to handle paperwork in Yulin?",
        "Where is Guangxi overseas-Chinese policy information usually published?",
        "What public points about the federation of returned overseas Chinese are useful for the public?",
        "How can overseas Yulin natives publicly get in touch or find updates about their hometown?",
        "How do I look up public information on Yulin overseas-Chinese service organizations?",
        "How are ID matters or notarization for overseas Chinese usually described in public materials?",
        "What directions can we introduce for Yulin hometown culture and publicity?",
        "Which areas show up often in public reporting on Yulin–ASEAN industrial cooperation?",
        "What public channels exist for legal aid or consultation on overseas-Chinese matters?",
        "What public talking points exist on rights of returned overseas Chinese and their relatives nationwide?"
    ];

    function exampleQuestionPool() {
        if (!window.I18n || window.I18n.getLocale() === "zh-CN") return EXAMPLE_QUESTIONS;
        var T = window.I18n.t.bind(window.I18n);
        var pool = [];
        for (var i = 0; i < 10; i++) {
            var k = "assistant.suggest." + i;
            var s = T(k);
            pool.push(s !== k ? s : EXAMPLE_QUESTIONS_EN[i] || "");
        }
        return pool;
    }

    function localizeAssistantCategoryRow(row) {
        if (!window.I18n || window.I18n.getLocale() === "zh-CN") return row;
        var T = window.I18n.t.bind(window.I18n);
        var id = String(row.id || "").trim();
        if (!id) return row;
        var p = "assistant.cat." + id + ".";
        var catK = p + "category";
        var cat = T(catK);
        if (cat !== catK) {
            return Object.assign({}, row, {
                category: cat,
                tag: T(p + "tag"),
                question: T(p + "question"),
                related_questions: T(p + "related")
            });
        }
        var en = ASSISTANT_CATEGORY_EN[id];
        return en ? Object.assign({}, row, en) : row;
    }

    let lastSuggestionRows = [];
    let storedCategories = fallbackCategories;

    function escapeHtml(s) {
        return String(s || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function escapeAttr(s) {
        return String(s || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function extractMessageText(message) {
        if (!message || message.content == null) return "";
        const c = message.content;
        if (typeof c === "string") return c.trim();
        if (Array.isArray(c)) {
            const parts = c.map(function (block) {
                if (!block || typeof block !== "object") return "";
                if (block.type === "text" && block.text) return String(block.text);
                return "";
            });
            return parts.join("\n").trim();
        }
        return String(c).trim();
    }

    function extractDeltaText(delta) {
        if (!delta || delta.content == null) return "";
        const c = delta.content;
        if (typeof c === "string") return c;
        if (Array.isArray(c)) {
            return c
                .map(function (block) {
                    if (!block || typeof block !== "object") return "";
                    if (block.type === "text" && block.text) return String(block.text);
                    return "";
                })
                .join("");
        }
        return String(c);
    }

    function buildRequestBody(userText, stream) {
        const cfg = window.ASSISTANT_ARK || {};
        const q = String(userText || "").trim();
        const body = {
            model: cfg.model || DEFAULT_ARK_BOT_MODEL,
            messages: [{ role: "user", content: q }],
            stream: Boolean(stream)
        };
        if (stream) {
            body.stream_options = { include_usage: true };
        }
        const cfgTok = Number(cfg.max_tokens);
        if (Number.isFinite(cfgTok) && cfgTok > 0) {
            body.max_tokens = Math.min(Math.round(cfgTok), 768);
        }
        if (typeof cfg.temperature === "number" && !Number.isNaN(cfg.temperature)) {
            body.temperature = cfg.temperature;
        }
        return body;
    }

    async function callArkChatWithBody(body, signal) {
        const cfg = window.ASSISTANT_ARK || {};
        const key = String(cfg.apiKey || "").trim();
        if (!key || key === "在此填写方舟 API Key") {
            throw new Error("未配置侨壮壮 API Key：请在 date/volc-ark-apis.json 中填写 qiaozhuangApiKey。");
        }
        const endpoint = arkEndpoint();
        const res = await fetch(endpoint, {
            method: "POST",
            signal: signal,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + key
            },
            body: JSON.stringify(body)
        });
        const raw = await res.text();
        let data;
        try {
            data = raw ? JSON.parse(raw) : {};
        } catch (e) {
            throw new Error("接口返回非 JSON：" + (raw.slice(0, 200) || res.statusText));
        }
        if (!res.ok) {
            const errMsg = (data.error && (data.error.message || data.error.msg)) || data.message || raw.slice(0, 400) || res.statusText;
            throw new Error(errMsg || "HTTP " + res.status);
        }
        const choice = data.choices && data.choices[0];
        const text = extractMessageText(choice && choice.message);
        if (!text) throw new Error("接口未返回有效文本内容");
        return text;
    }

    async function readSseStream(response, onAccumulated, signal) {
        const reader = response.body && response.body.getReader();
        if (!reader) return "";
        const decoder = new TextDecoder();
        let lineBuf = "";
        let acc = "";
        while (true) {
            if (signal && signal.aborted) {
                try {
                    await reader.cancel();
                } catch (_) {}
                break;
            }
            const { done, value } = await reader.read();
            if (done) break;
            lineBuf += decoder.decode(value, { stream: true });
            let nl;
            while ((nl = lineBuf.indexOf("\n")) >= 0) {
                const line = lineBuf.slice(0, nl).replace(/\r$/, "").trim();
                lineBuf = lineBuf.slice(nl + 1);
                if (!line.startsWith("data:")) continue;
                const payload = line.slice(5).trim();
                if (payload === "[DONE]") continue;
                try {
                    const j = JSON.parse(payload);
                    const delta = j.choices && j.choices[0] && j.choices[0].delta;
                    const piece = extractDeltaText(delta);
                    if (piece) {
                        acc += piece;
                        if (typeof onAccumulated === "function") onAccumulated(acc);
                    }
                } catch (_) {}
            }
        }
        return acc.trim();
    }

    async function callArkChatNonStream(userText, signal) {
        return callArkChatWithBody(buildRequestBody(userText, false), signal);
    }

    async function callArkChatWithStream(userText, onAccumulated, signal) {
        const cfg = window.ASSISTANT_ARK || {};
        const key = String(cfg.apiKey || "").trim();
        if (!key || key === "在此填写方舟 API Key") {
            throw new Error("未配置有效 API Key。");
        }
        const endpoint = arkEndpoint();
        const res = await fetch(endpoint, {
            method: "POST",
            signal: signal,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + key
            },
            body: JSON.stringify(buildRequestBody(userText, true))
        });
        if (!res.ok) {
            const raw = await res.text();
            let data;
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch (_) {
                data = {};
            }
            const errMsg = (data.error && (data.error.message || data.error.msg)) || raw.slice(0, 400) || res.statusText;
            throw new Error(errMsg || "HTTP " + res.status);
        }
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (!res.body || ct.indexOf("text/event-stream") < 0) {
            const raw = await res.text();
            let data;
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch (e) {
                throw new Error("流式响应解析失败");
            }
            const choice = data.choices && data.choices[0];
            const text = extractMessageText(choice && choice.message);
            if (text) {
                if (typeof onAccumulated === "function") onAccumulated(text);
                return text;
            }
            return "";
        }
        return readSseStream(res, onAccumulated, signal);
    }

    function scrollThreadToEnd() {
        if (!threadEl) return;
        threadEl.scrollTop = threadEl.scrollHeight;
    }

    function markThreadHasMessages() {
        if (threadEl) threadEl.classList.add("assistant-chat-thread--has-msg");
    }

    function startConversationUi() {
        document.body.classList.add("assistant-page--conversing");
        if (chatExitEl) chatExitEl.hidden = false;
        window.requestAnimationFrame(scrollThreadToEnd);
    }

    function exitChatMode() {
        currentAskId += 1;
        abortActiveAsk();
        releaseAskUi();
        document.body.classList.remove("assistant-page--conversing");
        if (chatExitEl) chatExitEl.hidden = true;
        if (threadEl) threadEl.classList.remove("assistant-chat-thread--has-msg");
        if (threadInnerEl) threadInnerEl.innerHTML = "";
        inputEl.value = "";
        autoResizeTextarea();
        clearDhModalAnchor();
    }

    function autoResizeTextarea() {
        const ta = inputEl;
        ta.style.height = "auto";
        const max = 160;
        ta.style.height = Math.min(ta.scrollHeight, max) + "px";
    }

    function appendUserBubble(text) {
        const el = document.createElement("div");
        el.className = "assistant-msg assistant-msg--user";
        const body = document.createElement("div");
        body.className = "assistant-msg-body";
        body.textContent = text;
        el.appendChild(body);
        threadInnerEl.appendChild(el);
        markThreadHasMessages();
        scrollThreadToEnd();
    }

    function appendBotBubble(text, loading) {
        const el = document.createElement("div");
        el.className = "assistant-msg assistant-msg--bot" + (loading ? " assistant-msg--loading" : "");
        const body = document.createElement("div");
        body.className = "assistant-msg-body";
        body.textContent = text;
        el.appendChild(body);
        threadInnerEl.appendChild(el);
        markThreadHasMessages();
        scrollThreadToEnd();
        return { root: el, body: body };
    }

    function setBotBubbleText(bot, text, doneLoading) {
        if (!bot || !bot.body) return;
        bot.body.textContent = text;
        if (doneLoading) bot.root.classList.remove("assistant-msg--loading");
        scrollThreadToEnd();
    }

    function openAnswerModal(text) {
        setAnswerText(text || "");
        if (answerModalEl) {
            answerModalEl.classList.add("is-open");
            answerModalEl.setAttribute("aria-hidden", "false");
        }
    }

    function clearDhModalAnchor() {
        if (!dhEl) return;
        dhEl.classList.remove("assistant-dh--beside-card", "assistant-dh--thinking");
        if (thinkingDhVideoEl) {
            try {
                thinkingDhVideoEl.pause();
                thinkingDhVideoEl.currentTime = 0;
            } catch (_) {}
        }
        if (idleDhVideoEl) {
            try {
                idleDhVideoEl.play();
            } catch (_) {}
        }
    }

    function anchorDhBesideModalThinking() {
        if (!dhEl) return;
        dhEl.classList.remove("is-collapsed");
        dhEl.classList.add("assistant-dh--beside-card", "assistant-dh--thinking");
        if (dhToggleEl) dhToggleEl.textContent = "▶";
        if (idleDhVideoEl) {
            try {
                idleDhVideoEl.pause();
            } catch (_) {}
        }
        if (thinkingDhVideoEl) {
            try {
                thinkingDhVideoEl.play();
            } catch (_) {}
        }
    }

    function endDhThinkingOnly() {
        if (dhEl) dhEl.classList.remove("assistant-dh--thinking");
        if (thinkingDhVideoEl) {
            try {
                thinkingDhVideoEl.pause();
                thinkingDhVideoEl.currentTime = 0;
            } catch (_) {}
        }
        if (idleDhVideoEl) {
            try {
                idleDhVideoEl.play();
            } catch (_) {}
        }
    }

    let askAbortController = null;
    let currentAskId = 0;

    function abortActiveAsk() {
        if (askAbortController) {
            try {
                askAbortController.abort();
            } catch (_) {}
            askAbortController = null;
        }
    }

    function releaseAskUi() {
        askInFlight = false;
        if (askBtnEl) {
            askBtnEl.classList.remove("is-loading");
            askBtnEl.disabled = false;
        }
    }

    function closeAnswerModal() {
        currentAskId += 1;
        abortActiveAsk();
        releaseAskUi();
        if (!answerModalEl) return;
        answerModalEl.classList.remove("is-open");
        answerModalEl.setAttribute("aria-hidden", "true");
        clearDhModalAnchor();
    }

    let askInFlight = false;

    function renderCategories(list) {
        if (!categoryGridEl) return;
        const base = Array.isArray(list) && list.length ? list : fallbackCategories;
        storedCategories = base;
        let rows = base.slice(0, 4).map(localizeAssistantCategoryRow);
        const T =
            window.I18n && typeof window.I18n.t === "function"
                ? window.I18n.t.bind(window.I18n)
                : function (k) {
                      return k;
                  };
        function toQuestions(row) {
            const raw = String(row.related_questions || "").trim();
            if (raw) return raw.split(/[;；|]/).map((x) => x.trim()).filter(Boolean).slice(0, 5);
            const q = String(row.question || "").trim();
            return q ? [q] : [];
        }
        categoryGridEl.innerHTML = rows
            .map((row) => {
                const qs = toQuestions(row);
                const firstQ = qs[0] || String(row.question || "").trim();
                return `
            <article class="assistant-category-card" data-first-question="${escapeAttr(firstQ)}">
                <div class="assistant-cat-type">${escapeHtml(row.category || T("page.assistant.cat.fallbackType"))}</div>
                <h3>${escapeHtml(row.tag || T("page.assistant.cat.fallbackTag"))}</h3>
                <ul class="assistant-question-list">
                    ${qs
                        .map(
                            (q) =>
                                `<li role="button" tabindex="0" data-question="${escapeAttr(q)}">${escapeHtml(q)}</li>`
                        )
                        .join("")}
                </ul>
            </article>`;
            })
            .join("");
    }

    function pickSuggestions(keyword) {
        const key = String(keyword || "").trim();
        const pool = exampleQuestionPool();
        if (!key) return pool.slice(0, 10);
        const matched = pool.filter((q) => q.includes(key));
        return (matched.length ? matched : pool).slice(0, 10);
    }

    function restartSuggestMarqueeAnimation() {
        if (!suggestTrackEl) return;
        try {
            suggestTrackEl.style.animation = "none";
            void suggestTrackEl.offsetHeight;
            suggestTrackEl.style.animation = "";
        } catch (e) {}
    }

    function renderSuggestions(rows) {
        if (!suggestTrackEl) return;
        lastSuggestionRows = rows.slice(0, 10);
        const items = lastSuggestionRows
            .map(function (q, i) {
                return (
                    '<li class="assistant-suggest-item" role="button" tabindex="0" data-suggest-index="' +
                    i +
                    '">' +
                    escapeHtml(q) +
                    "</li>"
                );
            })
            .join("");
        const block = '<ul class="assistant-suggest-row">' + items + "</ul>";
        suggestTrackEl.innerHTML = block + block.replace("<ul", '<ul aria-hidden="true"');
        restartSuggestMarqueeAnimation();
    }

    async function runAsk() {
        const q = String(inputEl.value || "").trim();

        if (!q) {
            appendBotBubble(
                window.I18n && window.I18n.t ? window.I18n.t("page.assistant.emptyPrompt") : "先写一句你想问的话，侨壮壮马上来～",
                false
            );
            scrollThreadToEnd();
            return;
        }

        startConversationUi();

        if (offline) {
            appendUserBubble(q);
            inputEl.value = "";
            autoResizeTextarea();
            openAnswerModal(
                window.I18n && window.I18n.t ? window.I18n.t("page.assistant.offlineFile") : "请用本地静态服务（http）打开本页，file 方式无法请求智能接口。"
            );
            return;
        }

        appendUserBubble(q);
        inputEl.value = "";
        autoResizeTextarea();

        abortActiveAsk();
        const myAskId = ++currentAskId;
        const ac = new AbortController();
        askAbortController = ac;
        const signal = ac.signal;

        askInFlight = true;
        if (askBtnEl) {
            askBtnEl.classList.add("is-loading");
            askBtnEl.disabled = true;
        }
        anchorDhBesideModalThinking();
        const bot = appendBotBubble("侨壮壮正在回复…", true);

        const cfg = window.ASSISTANT_ARK || {};
        const useStream = cfg.use_stream !== false;

        try {
            let finalText = "";
            if (useStream) {
                let streamed = "";
                try {
                    streamed = await callArkChatWithStream(
                        q,
                        function (acc) {
                            if (String(acc || "").trim().length > 0) endDhThinkingOnly();
                            setBotBubbleText(bot, acc && acc.length ? acc : "侨壮壮正在组织语言…", false);
                        },
                        signal
                    );
                } catch (streamErr) {
                    streamed = "";
                }
                finalText = String(streamed || "").trim();
                if (!finalText) {
                    finalText = await callArkChatNonStream(q, signal);
                    setBotBubbleText(bot, finalText, true);
                    endDhThinkingOnly();
                } else {
                    setBotBubbleText(bot, finalText, true);
                    endDhThinkingOnly();
                }
            } else {
                finalText = await callArkChatNonStream(q, signal);
                if (signal.aborted) return;
                setBotBubbleText(bot, finalText, true);
                endDhThinkingOnly();
            }

            if (signal.aborted) return;
            if (!finalText) throw new Error("接口未返回有效文本内容");
        } catch (e) {
            if (e && (e.name === "AbortError" || signal.aborted)) return;
            const msg = e && e.message ? e.message : String(e);
            clearDhModalAnchor();
            bot.root.remove();
            openAnswerModal(
                [
                    "这次没连上服务，你可以稍后再试。",
                    "",
                    "若经常失败：多半是浏览器跨域限制，需要后端转发方舟 API。",
                    "",
                    "详情：" + msg
                ].join("\n")
            );
        } finally {
            if (currentAskId !== myAskId) return;
            if (askAbortController === ac) {
                askAbortController = null;
            }
            releaseAskUi();
        }
    }

    askBtnEl.addEventListener("click", function () {
        runAsk();
    });

    inputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            runAsk();
        }
    });

    inputEl.addEventListener("input", autoResizeTextarea);

    function onComposerActivate() {
        inputEl.focus();
    }

    if (composerCardEl) {
        composerCardEl.addEventListener("click", function (e) {
            if (e.target === inputEl || e.target.closest("textarea")) return;
            if (e.target.closest("button")) return;
            onComposerActivate();
        });
    }

    if (chatExitEl) {
        chatExitEl.addEventListener("click", function () {
            exitChatMode();
            inputEl.blur();
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && document.body.classList.contains("assistant-page--conversing")) {
            exitChatMode();
        }
    });

    if (suggestMarqueeEl) {
        suggestMarqueeEl.addEventListener("click", function (e) {
            const li = e.target && e.target.closest && e.target.closest(".assistant-suggest-item");
            if (!li) return;
            e.preventDefault();
            const idx = parseInt(li.getAttribute("data-suggest-index"), 10);
            const text = lastSuggestionRows[idx];
            const qq = text != null ? String(text).trim() : "";
            if (!qq) return;
            inputEl.value = qq;
            autoResizeTextarea();
            window.setTimeout(function () {
                runAsk();
            }, 0);
        });
        suggestMarqueeEl.addEventListener("keydown", function (e) {
            if (e.key !== "Enter") return;
            const li = e.target && e.target.closest && e.target.closest(".assistant-suggest-item");
            if (!li) return;
            e.preventDefault();
            li.click();
        });
    }

    if (answerCloseEl) answerCloseEl.addEventListener("click", closeAnswerModal);
    if (answerModalEl) {
        answerModalEl.addEventListener("click", function (e) {
            if (e.target === answerModalEl) closeAnswerModal();
        });
    }

    if (dhToggleEl && dhEl) {
        dhToggleEl.addEventListener("click", function () {
            dhEl.classList.toggle("is-collapsed");
            dhToggleEl.textContent = dhEl.classList.contains("is-collapsed") ? "◀" : "▶";
            const isCollapsed = dhEl.classList.contains("is-collapsed");
            if (idleDhVideoEl) {
                try {
                    if (isCollapsed) idleDhVideoEl.pause();
                    else if (!dhEl.classList.contains("assistant-dh--thinking")) idleDhVideoEl.play();
                } catch (_) {}
            }
            if (thinkingDhVideoEl) {
                try {
                    if (isCollapsed) thinkingDhVideoEl.pause();
                    else if (dhEl.classList.contains("assistant-dh--thinking")) thinkingDhVideoEl.play();
                } catch (_) {}
            }
        });
    }

    if (categoryGridEl) {
        categoryGridEl.addEventListener("click", function (e) {
            const li = e.target && e.target.closest && e.target.closest(".assistant-question-list li");
            if (li && categoryGridEl.contains(li)) {
                e.preventDefault();
                const preset = String(li.getAttribute("data-question") || "").trim();
                if (!preset) return;
                inputEl.value = preset;
                autoResizeTextarea();
                window.setTimeout(function () {
                    runAsk();
                }, 0);
                return;
            }
            const card = e.target && e.target.closest && e.target.closest(".assistant-category-card");
            if (!card || !categoryGridEl.contains(card)) return;
            const preset = String(card.getAttribute("data-first-question") || "").trim();
            if (!preset) return;
            inputEl.value = preset;
            autoResizeTextarea();
            window.setTimeout(function () {
                runAsk();
            }, 0);
        });
        categoryGridEl.addEventListener("keydown", function (e) {
            if (e.key !== "Enter") return;
            const li = e.target && e.target.closest && e.target.closest(".assistant-question-list li");
            if (!li || !categoryGridEl.contains(li)) return;
            e.preventDefault();
            li.click();
        });
    }

    async function loadCsv(path, fallback) {
        if (offline || !window.AppDataUtils) return fallback;
        try {
            const rows = await window.AppDataUtils.loadCsv(path);
            return Array.isArray(rows) && rows.length ? rows : fallback;
        } catch (e) {
            return fallback;
        }
    }

    loadCsv("../../date/assistant_categories.csv", fallbackCategories)
        .then(function (categories) {
            renderCategories(categories);
            renderSuggestions(pickSuggestions(""));
            if (window.I18n && typeof window.I18n.scheduleLayoutCalibration === "function") {
                window.I18n.scheduleLayoutCalibration();
            }
        })
        .catch(function () {
            renderCategories(fallbackCategories);
            renderSuggestions(pickSuggestions(""));
            if (window.I18n && typeof window.I18n.scheduleLayoutCalibration === "function") {
                window.I18n.scheduleLayoutCalibration();
            }
        });

    if (window.I18n && window.I18n.EVENT_NAME) {
        window.addEventListener(window.I18n.EVENT_NAME, function () {
            if (!window.I18n) return;
            window.I18n.applyDom(document);
            renderCategories(storedCategories);
            renderSuggestions(pickSuggestions(""));
            if (typeof window.I18n.scheduleLayoutCalibration === "function") {
                window.I18n.scheduleLayoutCalibration();
            }
        });
    }

    autoResizeTextarea();
})();
