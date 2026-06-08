#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
拉取侨情动态并合并写入 date/qiaowu-news.json（与前端首读文件格式一致）。

策略（写入前经「严格标题筛 + 地域/来源筛」；侨务主题优先；仅国家层与广西地方，不收其他省级门户）：
1) **并行方舟**拉取带真实标题/链接的 items（主来源，质控优先）；
2) 可选 **列表页 HTTP** 抓取仅补充 URL（种子仅限中央与广西；严筛伪标题）；
3) 仍不足则方舟串行补拉 / 二次并行；
4) 最后合并 date/qiaowu-news-baseline.json 兜底（同样严筛）。

方舟调用：仅「数据获取」chat/completions（date/volc-ark-apis.json → dataApiKey、
ARK_DATA_CHAT_DEFAULTS / DATA_ACQUISITION_ARK）；勿使用侨壮壮 bots 或翻译 /responses。

环境变量：
  ARK_API_KEY / ARK_ENDPOINT / ARK_MODEL   覆盖同文件配置（见 scripts/volc_keys.py）
  QIAOWU_PARALLEL      并行方舟请求数，默认 3（过大易触发限流）
  QIAOWU_MIN_FILE      最少写入条数，默认 100
  QIAOWU_SKIP_HARVEST  设为 1 时跳过列表页抓取，仅用方舟 + 原文件 + baseline
  QIAOWU_ARK_TIMEOUT   HTTP 超时，默认 30,600 即 (连接秒, 读取秒)；大模型生成久可读秒需调大
"""
from __future__ import annotations

import html as html_lib
import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urljoin, urlparse

from deps_bootstrap import ensure_requests

ensure_requests()

import requests

from volc_keys import ROOT, get_data_acquisition_runtime

OUT_PATH = ROOT / "date" / "qiaowu-news.json"
BASELINE_PATH = ROOT / "date" / "qiaowu-news-baseline.json"

MAX_ROWS = 380

MIN_ITEMS_IN_FILE = int(os.environ.get("QIAOWU_MIN_FILE", "100"))
PARALLEL_WORKERS = max(1, min(6, int(os.environ.get("QIAOWU_PARALLEL", "3"))))
MAX_TOPUP_ROUNDS = 28

# 门户导航/栏目名，非稿件标题，严筛时丢弃（避免列表页混入的「网站地图」类链接）
_NAV_CHROME_TITLES: frozenset[str] = frozenset(
    {
        "国务院部门网站",
        "地方政府网站",
        "驻港澳机构网站",
        "国务院客户端",
        "政府信息公开",
        "政府信息公开指南",
        "政府信息公开制度",
        "法定主动公开内容",
        "政府信息公开年报",
        "政府工作报告",
        "自治区重要信息",
        "@国务院 我来说",
        "十五计划纲要",
    }
)


def _truthy_env(name: str) -> bool:
    return os.environ.get(name, "").strip().lower() in ("1", "true", "yes", "on")


def _ark_http_timeout() -> tuple[float, float] | float:
    """requests 的 timeout：(连接, 读取) 秒；单值则二项相同。"""
    raw = (os.environ.get("QIAOWU_ARK_TIMEOUT") or "30,600").strip()
    if "," in raw:
        a, b = raw.split(",", 1)
        return (float(a.strip()), float(b.strip()))
    v = float(raw)
    return (v, v)


def write_qiaowu_json(merged: list[dict]) -> None:
    out_obj = {
        "items": merged,
        "meta": {
            "description": (
                "侨情动态（方舟主采 + 可选列表补缺；写入前严筛标题）；"
                "配置见 date/volc-ark-apis.json；更新见 scripts/fetch_qiaowu_to_date.py / one-click-update.py。"
            ),
            "minItemsGuarantee": MIN_ITEMS_IN_FILE,
        },
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        json.dumps(out_obj, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

HTTP_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.5",
}

# 列表页种子：仅中央政策面 + 广西（含玉林、自治区侨务入口）+ 涉侨权威媒体（不收其他省份门户）
HARVEST_LIST_PAGES: list[str] = [
    "https://www.yulin.gov.cn/jryl/bmdt/index.html",
    "https://www.yulin.gov.cn/yw/jrys/index.html",
    "https://www.nanning.gov.cn/zfxxgk/zfxxgkml/rsdt/",
    "https://www.gxzf.gov.cn/gxyw/",
    "http://gat.gxzf.gov.cn/",
    "https://www.gov.cn/zhengce/zuixin/",
    "https://www.chinanews.com.cn/huaren/",
    "https://www.chinaqw.com/chinanews/index.shtml",
]

# 省级政府门户常见域名后缀（及直辖市等），用于拒绝「其他省份」稿件；广西 *.gxzf.gov.cn / 市属等已在允许逻辑中优先放行
_PROVINCIAL_GOV_CN_SUFFIXES: tuple[str, ...] = (
    ".beijing.gov.cn",
    ".shanghai.gov.cn",
    ".tj.gov.cn",
    ".cq.gov.cn",
    ".hebei.gov.cn",
    ".shanxi.gov.cn",
    ".ln.gov.cn",
    ".jl.gov.cn",
    ".hlj.gov.cn",
    ".js.gov.cn",
    ".zj.gov.cn",
    ".ah.gov.cn",
    ".fj.gov.cn",
    ".jx.gov.cn",
    ".sd.gov.cn",
    ".henan.gov.cn",
    ".hubei.gov.cn",
    ".hunan.gov.cn",
    ".gd.gov.cn",
    ".hainan.gov.cn",
    ".sc.gov.cn",
    ".gz.gov.cn",
    ".yn.gov.cn",
    ".xz.gov.cn",
    ".sn.gov.cn",
    ".gs.gov.cn",
    ".qh.gov.cn",
    ".nx.gov.cn",
    ".xj.gov.cn",
    ".nm.gov.cn",
)

CONTINUE_URL_CAP = 120
SKIP_HREF_SUB = ("/css/", "/js/", "/images/", "mailto:", "javascript:", "#", "../")


def url_passes_qiaowu_geography(url: str) -> bool:
    """
    地域与来源：仅收录 (1) 国家级 gov.cn（含中央部委/国家局子域、www.gov.cn）、
    国务院侨办 gqb.gov.cn、中国侨联 chinaql.org；(2) 广西壮族自治区政府网 gxzf 体系及区内市属（如玉林、南宁）；
    (3) 中国侨网、中新网侨胞/华人频道。排除其它省级政府门户域名。
    """
    try:
        host = urlparse((url or "").strip()).netloc.lower().split(":")[0]
    except Exception:
        return False
    if not host:
        return False
    if host.endswith(".yulin.gov.cn") or host == "yulin.gov.cn":
        return True
    if host.endswith(".nanning.gov.cn") or host == "nanning.gov.cn":
        return True
    if host.endswith(".gxzf.gov.cn") or host == "gxzf.gov.cn":
        return True
    if host.endswith("chinaqw.com") or host.endswith("chinaql.org"):
        return True
    if host.endswith("chinanews.com.cn"):
        return True
    if host.endswith("gqb.gov.cn"):
        return True
    if host == "www.gov.cn":
        return True
    for suf in _PROVINCIAL_GOV_CN_SUFFIXES:
        if host.endswith(suf):
            return False
    if host.endswith(".gov.cn"):
        return True
    return False


def row_passes_geo_scope(r: dict | None) -> bool:
    if not r:
        return False
    return url_passes_qiaowu_geography(str(r.get("url") or ""))


def _configure_stdio_utf8() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


def parse_json_from_model_text(text: str) -> dict:
    s = (text or "").strip()
    if not s:
        return {}
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", s, re.I)
    if fence:
        s = fence.group(1).strip()
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", s)
        if not m:
            return {}
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            return {}


def url_key(u: str) -> str:
    u = (u or "").strip()
    try:
        p = urlparse(u)
        return f"{p.scheme}://{p.netloc}{p.path}".rstrip("/").lower()
    except Exception:
        return u.lower()


def normalize_row(it: dict) -> dict | None:
    if not isinstance(it, dict):
        return None
    url = str(it.get("url") or it.get("link") or it.get("href") or "").strip()
    title = str(it.get("title") or it.get("headline") or "").strip()
    if not title or not url:
        return None
    if not re.match(r"^https?://", url, re.I):
        return None
    source = str(
        it.get("source")
        or it.get("site")
        or it.get("publisher")
        or it.get("channel")
        or ""
    ).strip()
    summary = str(
        it.get("summary") or it.get("excerpt") or it.get("media") or it.get("dek") or ""
    ).strip()
    if not summary and source:
        summary = source
    row: dict = {
        "title": title,
        "summary": summary,
        "source": source,
        "time": str(it.get("time") or it.get("date") or it.get("publishedAt") or "").strip(),
        "url": url,
        "content": str(it.get("content") or it.get("full_text") or it.get("fullText") or "").strip(),
        "excerpt": str(it.get("excerpt") or "").strip(),
    }
    return row


def sort_items_by_time_desc(rows: list[dict]) -> list[dict]:
    def sort_key(r: dict) -> tuple[int, int, int]:
        t = str((r or {}).get("time") or "")
        m = re.match(r"(\d{4})-(\d{2})-(\d{2})", t)
        if not m:
            return (0, 0, 0)
        try:
            return (int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return (0, 0, 0)

    return sorted(rows, key=sort_key, reverse=True)


def merge_prefer_new(fresh: list[dict], old: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []

    def push_row(r: dict | None, is_new: bool = False) -> None:
        if not r or not r.get("url") or not row_passes_strict(r) or not row_passes_geo_scope(r):
            return
        k = url_key(str(r["url"]))
        if not k or k in seen:
            return
        seen.add(k)
        if is_new:
            r["_is_new"] = True
        out.append(r)

    for r in fresh:
        push_row(r, is_new=True)
    for r in old:
        push_row(r, is_new=False)
    
    def sort_key(r: dict) -> tuple[int, int, int, int]:
        t = str((r or {}).get("time") or "")
        m = re.match(r"(\d{4})-(\d{2})-(\d{2})", t)
        if m:
            try:
                year, month, day = int(m.group(1)), int(m.group(2)), int(m.group(3))
                if r.get("_is_new"):
                    return (year, month, day, 0)
                else:
                    return (year - 100, month, day, 1)
            except ValueError:
                pass
        if r.get("_is_new"):
            return (9999, 12, 31, 0)
        return (0, 0, 0, 1)
    
    sorted_out = sorted(out, key=sort_key, reverse=True)
    
    for r in sorted_out:
        r.pop("_is_new", None)
    
    return sorted_out[:MAX_ROWS]


def read_existing_items() -> list[dict]:
    if not OUT_PATH.is_file():
        return []
    try:
        data = json.loads(OUT_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    if isinstance(data, list):
        raw = data
    else:
        raw = data.get("items") or data.get("news") or data.get("data") or []
    if not isinstance(raw, list):
        return []
    rows = [normalize_row(x) for x in raw]
    return [r for r in rows if r and row_passes_strict(r) and row_passes_geo_scope(r)]


def load_baseline_items() -> list[dict]:
    if not BASELINE_PATH.is_file():
        return []
    try:
        data = json.loads(BASELINE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    raw = data.get("items") if isinstance(data, dict) else []
    if not isinstance(raw, list):
        return []
    rows = [normalize_row(x) for x in raw]
    return [r for r in rows if r and row_passes_strict(r) and row_passes_geo_scope(r)]


_HREF_RE = re.compile(
    r"""href\s*=\s*["']([^"'<>]+)["']""",
    re.I,
)
# 列表页 <a href="...">标题</a>，属性区不宜过长以免误吞页面
_ANCHOR_BLOCK_RE = re.compile(r"<a\s([^>]{0,4000})>([\s\S]*?)</a>", re.I)


def _fix_response_encoding(resp: requests.Response) -> None:
    """减少中文列表页被当成 latin-1 解码导致的乱码。"""
    enc = (getattr(resp, "encoding", None) or "").lower()
    if enc in ("iso-8859-1", "windows-1252") and getattr(resp, "apparent_encoding", None):
        try:
            resp.encoding = resp.apparent_encoding
        except Exception:
            pass


def _resolve_href(raw_href: str, page_url: str) -> str | None:
    raw_href = (raw_href or "").strip()
    if not raw_href or any(s in raw_href for s in SKIP_HREF_SUB):
        return None
    if raw_href.startswith("//"):
        return "https:" + raw_href
    if raw_href.startswith("/"):
        return urljoin(page_url, raw_href)
    if re.match(r"^https?://", raw_href, re.I):
        return raw_href
    return urljoin(page_url, raw_href)


def _strip_html_to_text(fragment: str) -> str:
    t = re.sub(r"<script[\s\S]*?</script>", " ", fragment, flags=re.I)
    t = re.sub(r"<style[\s\S]*?</style>", " ", t, flags=re.I)
    t = re.sub(r"<br\s*/?>", " ", t, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html_lib.unescape(t)
    return re.sub(r"\s+", " ", t).strip()


def _is_weak_harvest_title(title: str) -> bool:
    """路径或占位生成的伪标题（非编码乱码），前端展示会像「乱码/无意义」。"""
    s = (title or "").strip()
    if len(s) < 5:
        return True
    if re.match(r"^content\s*\d+$", s, re.I) or re.match(r"^content\d+$", s, re.I):
        return True
    if re.match(r"^t\d+$", s, re.I):
        return True
    # 仅数字类编号（无拉丁字母）
    if re.fullmatch(r"[\d\s\-_.]+", s):
        return True
    if not re.search(r"[\u4e00-\u9fff]", s):
        # 无中文：太短或 slug 状视为弱；够长的拉丁标题保留（避免误杀英文稿）
        if len(s) < 10:
            return True
        if len(s) >= 20:
            return False
        if " " in s and len(s) >= 14:
            return False
        if re.fullmatch(r"[\d\s\-_.A-Za-z/]+", s):
            return True
        return True
    if "公开信息" in s and len(s) <= 24:
        return True
    if re.search(r"^(www\.)?[\w.-]+\.(gov\.cn)\s+公开信息$", s, re.I):
        return True
    if "公开信息" in s and re.search(r"[\w.-]+\.(gov|com)\.cn", s, re.I):
        return True
    return False


def strict_title_ok(title: str) -> bool:
    """写入 JSON / 前台前：排除占位标题，优先保留像「新闻标题」的条目。"""
    s = (title or "").strip()
    if len(s) < 6 or _is_weak_harvest_title(s):
        return False
    if s in _NAV_CHROME_TITLES:
        return False
    han = len(re.findall(r"[\u4e00-\u9fff]", s))
    if han >= 2:
        return True
    if han >= 1 and len(s) >= 12:
        return True
    if han == 0 and len(s) >= 18 and re.search(r"[A-Za-z]{5,}", s):
        return True
    return False


def row_passes_strict(r: dict | None) -> bool:
    if not r:
        return False
    return strict_title_ok(str(r.get("title") or ""))


def _extract_title_attr(attrs: str) -> str:
    m = re.search(r"\btitle\s*=\s*([\"'])([\s\S]*?)\1", attrs, re.I)
    if not m:
        return ""
    return html_lib.unescape(m.group(2).strip())


def _build_anchor_title_map(page_html: str, page_url: str) -> dict[str, str]:
    """同一 href 取较长的一条作为标题（列表页 link text / title 属性）。"""
    out: dict[str, str] = {}
    for m in _ANCHOR_BLOCK_RE.finditer(page_html):
        attrs, body = m.group(1), m.group(2)
        hm = re.search(r"\bhref\s*=\s*([\"'])([^\"']+)\1", attrs, re.I)
        if not hm:
            continue
        href = _resolve_href(hm.group(2).strip(), page_url)
        if not href or not re.search(r"\.(shtml|html|htm)(\?|$)", href, re.I):
            continue
        if not url_passes_qiaowu_geography(href):
            continue
        t_attr = _extract_title_attr(attrs)
        link_text = _strip_html_to_text(body)
        cand = ""
        if t_attr and len(t_attr) >= 4 and not t_attr.startswith("http"):
            cand = t_attr
        if (not cand or len(link_text) > len(cand)) and link_text:
            cand = link_text
        if len(cand) < 5:
            continue
        prev = out.get(href)
        if prev is None or len(cand) > len(prev):
            out[href] = cand[:240]
    return out


def harvest_rows_from_list_page(page_url: str, per_page_cap: int = 45) -> list[dict]:
    """从频道列表页抓取外链；优先使用 <a> 内正文/title 属性，避免仅用 URL 路径导致 content 数字等伪标题。"""
    out: list[dict] = []
    try:
        r = requests.get(page_url, headers=HTTP_HEADERS, timeout=HTTP_TIMEOUT, allow_redirects=True)
        _fix_response_encoding(r)
        if r.status_code != 200:
            return out
        page_html = r.text or ""
    except (requests.RequestException, OSError):
        return out

    title_map = _build_anchor_title_map(page_html, page_url)
    seen_local: set[str] = set()
    for m in _HREF_RE.finditer(page_html):
        raw_href = (m.group(1) or "").strip()
        href = _resolve_href(raw_href, page_url)
        if not href or not re.search(r"\.(shtml|html|htm)(\?|$)", href, re.I):
            continue
        if not url_passes_qiaowu_geography(href):
            continue
        host = urlparse(href).netloc.lower()
        k = url_key(href)
        if not k or k in seen_local:
            continue
        seen_local.add(k)
        src = host.replace("www.", "")
        title = (title_map.get(href) or "").strip()
        if not title or _is_weak_harvest_title(title):
            path = unquote_path_title(urlparse(href).path)
            title = ""
            if path and len(path) > 6 and not _is_weak_harvest_title(path):
                title = path
            elif path and re.search(r"[\u4e00-\u9fff]", path) and len(path) > 4:
                title = path
        if not title or _is_weak_harvest_title(title):
            continue
        row = normalize_row(
            {
                "title": title[:120],
                "url": href,
                "source": src,
                "time": "",
                "summary": "",
            }
        )
        if row and row_passes_strict(row) and row_passes_geo_scope(row):
            out.append(row)
        if len(out) >= per_page_cap:
            break
    return out


def unquote_path_title(path: str) -> str:
    seg = path.strip("/").split("/")[-1]
    seg = re.sub(r"\.(shtml|html|htm)$", "", seg, flags=re.I)
    if re.match(r"^t\d+$", seg, re.I):
        return ""
    return seg.replace("_", " ").replace("-", " ")


HTTP_TIMEOUT = 22


def harvest_all_list_pages() -> list[dict]:
    acc: list[dict] = []
    seen: set[str] = set()
    for u in HARVEST_LIST_PAGES:
        rows = harvest_rows_from_list_page(u, per_page_cap=50)
        for r in rows:
            k = url_key(str(r.get("url", "")))
            if k and k not in seen:
                seen.add(k)
                acc.append(r)
        print(f"[抓取] {u} -> 累计唯一 {len(acc)} 条", file=sys.stderr)
    return acc


def _qiaowu_prompt_hard_rules() -> str:
    return (
        "【主题】每条必须与**侨务**直接相关：华侨、归侨侨眷的为侨服务、联谊恳亲、"
        "涉侨政策法规解读、护侨维权、引智引资、华助中心与基层侨务等；"
        "与侨务**无关**的一般政务、经济社会简讯**不要**输出。\n"
        "【地域与来源】`url` 对应站点**仅限**："
        "(1) **中央政府**及部委/国家局 public.gov.cn 体系、**国务院侨办 / 统战涉侨信息**、**中国侨联**（chinaql.org）等国家级涉侨文件与新闻；"
        "(2) **广西壮族自治区**内各级政府门户网站（含自治区 gxzf、各市如**南宁/玉林**及下属机关子域）；"
        "(3) **中国侨网**、**中新网**「华侨/涉侨」类公开稿件。\n"
        "**禁止**收录其它省（自治区、直辖市）**地方政府门户**及其下属机关稿件（如江苏、广东、京沪闽等省级站点）；"
        "兄弟省份内容即使涉侨也一律不要，除非稿源为中央文件且链接落在 **www.gov.cn、gqb.gov.cn、中央部委 gov.cn 子域**等国家层站点。\n"
    )


def qiaowu_prompt_variant(variant_id: int) -> str:
    angles = [
        "侧重**2026年最新**的广西（含**玉林、南宁**等）政府机关发布的**涉侨动态、为侨服务与联谊活动**权威新闻，优先2026年发布的稿件；",
        "侧重**2026年最新**的国务院侨办、统战、侨联、移民管理等**中央机关**公开的涉侨**政策、通知、重要会议**类权威稿件，优先2026年发布；",
        "侧重**2026年最新**的护侨维权、农林场华侨、困难侨胞帮扶、引智引资等**专题**在广西或国家层的权威公开报道，优先2026年发布；",
        "侧重**2026年最新**的中国侨网、中新网等权威媒体发布的与**广西侨乡或国家侨务**直接相关的要闻，优先2026年发布；",
    ]
    angle = angles[variant_id % len(angles)]
    return (
        "生成2026年最新权威侨情资讯 JSON。当前时间为2026年5月，请提供**2025年至2026年**发布的最新新闻。"
        + _qiaowu_prompt_hard_rules()
        + f"本轮侧重：{angle}\n"
        + "要求：`url` 为真实可访问的 http(s) 权威媒体地址，**须符合上述地域**，禁止编造；`title`、`source`、`summary` 用简体中文；"
        + "`summary` 用一句话简明点明**新闻核心内容与侨务的关联**；`items` **至少 32 条、尽量 40 条**，按登载日期从新到旧严格排序；"
        + "无日期则 `time` 空串；**只输出简体中文**，不要英文翻译字段。\n"
        + '{"items":[{"title":"","time":"","url":"","source":"","summary":""}]}'
    )


def qiaowu_prompt_continue(occupying_urls: list[str], round_1based: int, need_hint: int) -> str:
    lines = occupying_urls[:CONTINUE_URL_CAP]
    block = "\n".join(lines) if lines else "（尚无）"
    batch = max(36, min(72, need_hint + 12))
    return (
        f"已占用 URL（禁止重复）：\n{block}\n\n"
        + f"【补批第 {round_1based} 轮】再输出2026年最新权威侨情资讯 JSON，items **至少 {batch} 条** 全新 `url`。\n"
        + "当前时间为2026年5月，请提供**2025年至2026年**发布的最新新闻。\n"
        + _qiaowu_prompt_hard_rules()
        + "仍须：**侨务主题** + **仅国家层或广西地方**允许的站点（禁止其它省级地方门户）；"
        + "优先2025-2026年发布的权威新闻，按日期从新到旧排序；**只输出简体中文**，不要英文翻译字段。\n"
        + '{"items":[{"title":"","time":"","url":"","source":"","summary":""}]}'
    )


def call_ark_with_user(
    api_key: str,
    endpoint: str,
    model: str,
    user: str,
    *,
    temperature: float,
    max_tokens: int,
    timeout: float | tuple[float, float],
) -> str:
    system = (
        "你是玉林侨务数字平台「数据获取」资讯助理（火山方舟 chat/completions 接入点，"
        "非侨壮壮对话 Bot、非翻译接口）。"
        "只收录**与华侨/侨务直接相关**的最新权威新闻或政策稿件链接；来源仅限**中华人民共和国中央层（gov.cn 国家站点、侨办/侨联体系）**"
        "与**广西壮族自治区**政府机关网；**不要**收录其它省、自治区、直辖市地方门户及其下属站点稿件。"
        "优先收录近三个月内发布的权威新闻；**只输出简体中文**，不需要英文翻译字段；"
        "只输出合法 JSON，不要 Markdown、不要代码块以外的说明文字。"
    )
    max_tok = max(int(max_tokens), 16000)
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": float(temperature),
        "max_tokens": max_tok,
    }
    r = requests.post(
        endpoint,
        headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=timeout,
    )
    r.raise_for_status()
    data = r.json()
    err = data.get("error")
    if err:
        raise RuntimeError(str(err.get("message") or err))
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("API 未返回 choices")
    msg = choices[0].get("message") or {}
    content = msg.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(
            (b.get("text") or "") if isinstance(b, dict) and b.get("type") == "text" else ""
            for b in content
        )
    return str(content or "")


def parse_items_from_response(text: str) -> list[dict]:
    obj = parse_json_from_model_text(text)
    items = obj.get("items") if isinstance(obj, dict) else None
    if not isinstance(items, list):
        return []
    out = [normalize_row(x) for x in items if isinstance(x, dict)]
    return [r for r in out if r]


def ingest_model_response(
    text: str,
    seen_urls: set[str],
    accumulated: list[dict],
) -> int:
    fresh = parse_items_from_response(text)
    added = 0
    for r in fresh:
        if not row_passes_strict(r) or not row_passes_geo_scope(r):
            continue
        k = url_key(str(r.get("url") or ""))
        if not k or k in seen_urls:
            continue
        seen_urls.add(k)
        accumulated.append(r)
        added += 1
    return added


def main() -> int:
    _configure_stdio_utf8()
    
    print("[初始化] 加载保底数据（应对无网络情况）…", file=sys.stderr, flush=True)
    baseline_rows = load_baseline_items()
    print(f"  baseline 加载完成，共 {len(baseline_rows)} 条", file=sys.stderr, flush=True)
    
    print("[初始化] 读取已有数据…", file=sys.stderr, flush=True)
    old_rows = read_existing_items()
    print(f"  已有数据加载完成，共 {len(old_rows)} 条", file=sys.stderr, flush=True)
    
    accumulated: list[dict] = []
    seen_urls: set[str] = set()

    def ingest_rows(rows: list[dict]) -> None:
        for r in rows:
            if not row_passes_strict(r) or not row_passes_geo_scope(r):
                continue
            k = url_key(str(r.get("url") or ""))
            if not k or k in seen_urls:
                continue
            seen_urls.add(k)
            accumulated.append(r)

    network_available = True
    rt = get_data_acquisition_runtime()
    
    if not rt.get("enabled", True):
        print("[网络] volc-ark-apis.json 中 DATA_ACQUISITION_ARK.enabled 为 false，使用保底数据。", file=sys.stderr)
        network_available = False
    else:
        api_key = (rt.get("api_key") or "").strip()
        if not api_key:
            print("[网络] 未找到 dataApiKey，使用保底数据。", file=sys.stderr)
            network_available = False
    
    if network_available:
        endpoint = (rt.get("endpoint") or "").strip()
        model = (rt.get("model") or "").strip()
        da_temp = float(rt.get("temperature") or 0.35)
        da_max_tokens = int(rt.get("max_tokens") or 12288)
        ark_timeout = _ark_http_timeout()

        to = ark_timeout if isinstance(ark_timeout, tuple) else (ark_timeout, ark_timeout)
        print(
            f"\n[1/4] 并行方舟 {PARALLEL_WORKERS} 路（主数据来源；HTTP 超时 连接≈{to[0]}s 读取≈{to[1]}s）…",
            file=sys.stderr,
            flush=True,
        )

        def _one_variant(vid: int) -> str:
            print(
                f"  [方舟] variant {vid} 开始请求…",
                file=sys.stderr,
                flush=True,
            )
            return call_ark_with_user(
                api_key,
                endpoint,
                model,
                qiaowu_prompt_variant(vid),
                temperature=da_temp,
                max_tokens=da_max_tokens,
                timeout=ark_timeout,
            )

        parallel_errors = 0
        with ThreadPoolExecutor(max_workers=PARALLEL_WORKERS) as ex:
            futures = {ex.submit(_one_variant, i): i for i in range(PARALLEL_WORKERS)}
            for fu in as_completed(futures):
                try:
                    text = fu.result()
                    n = ingest_model_response(text, seen_urls, accumulated)
                    print(
                        f"  并行一路完成，新增 {n} 条，累计唯一 {len(accumulated)}",
                        file=sys.stderr,
                        flush=True,
                    )
                except Exception as e:
                    parallel_errors += 1
                    print(f"  并行一路失败：{e}", file=sys.stderr, flush=True)

        if parallel_errors == PARALLEL_WORKERS and not accumulated:
            print("[警告] 并行请求全部失败，将使用保底数据。", file=sys.stderr)
            network_available = False
    
    if network_available and len(accumulated) > 0:
        print("\n[2/4] 列表页抓取（补充最新权威数据）…", file=sys.stderr, flush=True)
        try:
            ingest_rows(harvest_all_list_pages())
        except Exception as e:
            print(f"  列表页抓取失败：{e}", file=sys.stderr)
        
        print("\n[3/4] 串行补拉（确保数据充足）…", file=sys.stderr, flush=True)
        topup_round = 0
        while len(accumulated) < MIN_ITEMS_IN_FILE and topup_round < MAX_TOPUP_ROUNDS:
            need = MIN_ITEMS_IN_FILE - len(accumulated)
            topup_round += 1
            try:
                text = call_ark_with_user(
                    api_key,
                    endpoint,
                    model,
                    qiaowu_prompt_continue(sorted(seen_urls), topup_round, need),
                    temperature=da_temp,
                    max_tokens=da_max_tokens,
                    timeout=ark_timeout,
                )
            except Exception as e:
                print(f"  补拉第 {topup_round} 轮失败：{e}", file=sys.stderr)
                break
            added = ingest_model_response(text, seen_urls, accumulated)
            print(
                f"  补拉第 {topup_round} 轮：新增 {added}，累计 {len(accumulated)}",
                file=sys.stderr,
                flush=True,
            )
            if added == 0:
                break

    print(f"\n[4/4] 合并数据（最新数据优先）…", file=sys.stderr, flush=True)
    
    if len(accumulated) > 0:
        new_dates = [r.get("time") for r in accumulated if r.get("time")]
        print(f"  新获取数据：{len(accumulated)} 条，其中有日期的 {len(new_dates)} 条", file=sys.stderr, flush=True)
        if new_dates:
            print(f"  新数据日期范围：{min(new_dates)} ~ {max(new_dates)}", file=sys.stderr, flush=True)
    
    merged: list[dict] = []
    if len(accumulated) > 0:
        merged = merge_prefer_new(accumulated, old_rows)
        print(f"  网络数据 + 已有数据合并：{len(merged)} 条", file=sys.stderr, flush=True)
    else:
        merged = old_rows
        print(f"  无网络数据，使用已有数据：{len(merged)} 条", file=sys.stderr, flush=True)
    
    if len(merged) < MIN_ITEMS_IN_FILE:
        print(f"  数据不足 {MIN_ITEMS_IN_FILE} 条，补充 baseline 兜底…", file=sys.stderr, flush=True)
        ingest_rows(baseline_rows)
        merged = merge_prefer_new(accumulated, old_rows)
        print(f"  合并 baseline 后：{len(merged)} 条", file=sys.stderr, flush=True)
    
    if len(merged) == 0:
        print(f"  无任何数据可用，使用 baseline 作为最终数据…", file=sys.stderr, flush=True)
        merged = baseline_rows[:MAX_ROWS]
    
    merged = sort_items_by_time_desc(merged)[:MAX_ROWS]
    
    write_qiaowu_json(merged)
    print(
        f"\n[完成] 已写入 {OUT_PATH} ，共 {len(merged)} 条（最新数据优先，日期降序）。",
        file=sys.stderr,
        flush=True,
    )
    
    if not network_available:
        print("[提示] 当前使用保底数据，网络恢复后将自动获取最新新闻。", file=sys.stderr)
    
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
