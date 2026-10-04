/* 강의 소개 화면: 한눈에 보기 · 통계 카드 · 장점 슬라이드 · AI 도구 · 준비물 · 주차별 커리큘럼 · 수업 달력 */
(function () {
  "use strict";
  var H = window.H, S = window.Store, el = H.el, add = H.add, clear = H.clear;
  var SB = (window.SiteBuilders = window.SiteBuilders || {});
  var DOW = ["일", "월", "화", "수", "목", "금", "토"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 날짜 도구 ---------- */
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function parseDay(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function dayKey(d) { return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
  function md(d) { return (d.getMonth() + 1) + "/" + d.getDate() + "(" + DOW[d.getDay()] + ")"; }
  function dotted(d) { return d.getFullYear() + "." + p2(d.getMonth() + 1) + "." + p2(d.getDate()); }
  function dueLabel(s) { var d = new Date(s); return md(d) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : null; }

  /* 주차별 일정: 시작일 + 7일 × (주차-1). 주차에 date 를 직접 적으면 그 날짜를 우선한다. */
  function schedule() {
    var c = S.config.curriculum || {}, start = parseDay(c.startDate), asg = S.assignments(), out = [];
    (c.weeks || []).forEach(function (w, i) {
      var d = parseDay(w.date) || (start && new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7 * i));
      out.push({
        n: i + 1, date: d, key: d ? dayKey(d) : "", topic: w.topic, time: w.time || c.time, place: w.place || c.place,
        content: w.content || "", videos: (w.videos || []).filter(function (v) { return v && safeUrl(v.url); }),
        assignment: asg.filter(function (a) { return a.week === i + 1; })[0] || null
      });
    });
    return out;
  }
  function lines(text) {
    return String(text || "").split(/\r?\n/).map(function (l) { return l.replace(/^\s*[-•·]\s*/, "").trim(); }).filter(Boolean);
  }

  /* ---------- 마감까지 남은 시간 ---------- */
  function human(ms) {
    var d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
    return d > 0 ? d + "일 " + h + "시간" : h > 0 ? h + "시간 " + m + "분" : Math.max(m, 1) + "분";
  }
  function remain(due) {
    var ms = new Date(due) - Date.now();
    if (ms <= 0) return { text: "마감됨 · " + human(-ms) + " 지남", cls: "over" };
    var t0 = new Date(); t0.setHours(0, 0, 0, 0);
    var d1 = new Date(due); d1.setHours(0, 0, 0, 0);
    var dd = Math.round((d1 - t0) / 864e5);
    return { text: "마감까지 " + human(ms) + " 남음 (" + (dd === 0 ? "D-DAY" : "D-" + dd) + ")", cls: ms < 48 * 36e5 ? "urgent" : "ok" };
  }
  function remainEl(due) {
    var e = el("span", "remain");
    e.dataset.due = due;
    paint(e);
    return e;
  }
  function paint(e) { var r = remain(e.dataset.due); e.textContent = r.text; e.className = "remain " + r.cls; }
  setInterval(function () { document.querySelectorAll(".remain[data-due]").forEach(paint); }, 30000);

  /* ---------- 한눈에 보기 ---------- */
  function fill(text) {
    var list = schedule(), first = list[0] && list[0].date, last = list.length && list[list.length - 1].date, c = S.config.curriculum || {};
    return String(text || "")
      .replace(/\{start\}/g, first ? dotted(first) : "미정").replace(/\{end\}/g, last ? dotted(last) : "미정")
      .replace(/\{weeks\}/g, list.length).replace(/\{time\}/g, c.time || "").replace(/\{place\}/g, c.place || "")
      .replace(/\{weekday\}/g, first ? DOW[first.getDay()] + "요일" : "");
  }
  SB.overview = function (d) {
    var g = el("div", "grid cols-4 overview");
    g.setAttribute("role", "list");
    d.items.forEach(function (it) {
      var c = el("article", "card ov-card"); c.setAttribute("role", "listitem");
      add(c, el("div", "icon", it.icon), el("h3", null, it.label), el("p", null, fill(it.value)));
      g.appendChild(c);
    });
    return g;
  };

  /* ---------- 통계 카드 (숫자가 올라가는 효과) ---------- */
  function statValue(it) {
    if (it.source === "weeks") return ((S.config.curriculum || {}).weeks || []).length;
    if (it.source === "tools") return ((S.config.tools || {}).items || []).length;
    return Number(it.value) || 0;
  }
  SB.stats = function (d) {
    var g = el("div", "grid cols-4 stats");
    g.setAttribute("role", "list");
    var targets = [];
    d.items.forEach(function (it) {
      var v = statValue(it), c = el("article", "card stat-card"); c.setAttribute("role", "listitem");
      var num = el("b", null, reduce ? String(v) : "0"); num.setAttribute("aria-hidden", "true");
      var sr = el("span", "sr-only", v + (it.suffix || "") + " " + it.label);
      add(c, add(el("div", "stat-num"), num, el("small", null, it.suffix || "")), el("p", null, it.label), sr);
      g.appendChild(c);
      targets.push({ node: num, v: v });
    });
    if (!reduce && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.disconnect();
          var t0 = performance.now();
          (function tick(now) {
            var p = Math.min(1, (now - t0) / 1000), k = 1 - Math.pow(1 - p, 3);
            targets.forEach(function (t) { t.node.textContent = Math.round(t.v * k); });
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        });
      }, { threshold: 0.4 });
      io.observe(g);
    } else targets.forEach(function (t) { t.node.textContent = t.v; });
    return g;
  };

  /* ---------- 장점 슬라이드 (좌우로 넘기기) ---------- */
  function slider(slides, label) {
    var wrap = el("div", "slider");
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-roledescription", "carousel");
    wrap.setAttribute("aria-label", label);
    var track = el("div", "slides");
    track.tabIndex = 0;
    track.setAttribute("aria-label", label + " (좌우 방향키로 넘기기)");
    slides.forEach(function (s, i) {
      var c = el("article", "card slide");
      c.setAttribute("role", "group"); c.setAttribute("aria-roledescription", "슬라이드");
      c.setAttribute("aria-label", (i + 1) + " / " + slides.length);
      add(c, el("div", "icon", s.icon), el("h3", null, s.title), el("p", null, s.text));
      track.appendChild(c);
    });
    var prev = el("button", "slide-btn prev", "‹"), next = el("button", "slide-btn next", "›");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", "이전 슬라이드"); next.setAttribute("aria-label", "다음 슬라이드");
    var dots = el("div", "dots");

    function metrics() {
      var first = track.firstElementChild, step = first ? first.offsetWidth + 20 : 1;
      var per = Math.max(1, Math.round(track.clientWidth / step));
      return { step: step, per: per, pages: Math.max(1, Math.ceil(slides.length / per)) };
    }
    function page() { var m = metrics(); return Math.min(m.pages - 1, Math.round(track.scrollLeft / (m.step * m.per))); }
    function goto(p) { var m = metrics(); track.scrollTo({ left: p * m.per * m.step, behavior: reduce ? "auto" : "smooth" }); }
    function sync() {
      var m = metrics(), cur = page();
      if (dots.children.length !== m.pages) {
        clear(dots);
        for (var i = 0; i < m.pages; i++) {
          (function (i) {
            var b = el("button", "dot"); b.type = "button";
            b.setAttribute("aria-label", (i + 1) + "번째 슬라이드로 이동");
            b.addEventListener("click", function () { goto(i); });
            dots.appendChild(b);
          })(i);
        }
      }
      [].forEach.call(dots.children, function (b, i) { b.classList.toggle("on", i === cur); if (i === cur) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    }
    prev.addEventListener("click", function () { var m = metrics(); track.scrollBy({ left: -m.step * m.per, behavior: reduce ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { var m = metrics(); track.scrollBy({ left: m.step * m.per, behavior: reduce ? "auto" : "smooth" }); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener("resize", sync);
    add(wrap, track, add(el("div", "slider-ctl"), prev, dots, next));
    setTimeout(sync, 0);
    return wrap;
  }

  SB.intro = function (d) {
    var wrap = el("div");
    add(wrap, el("p", "summary", d.summary), slider(d.slides || [], "강의의 장점"));
    return wrap;
  };

  /* ---------- 실습 AI 도구 ---------- */
  SB.tools = function (d) {
    var g = el("div", "grid cols-3");
    d.items.forEach(function (t) {
      var c = el("article", "card tool");
      add(c, el("div", "icon", t.icon), el("h3", null, t.name), el("p", null, t.desc));
      if (t.use) c.appendChild(el("span", "tag", t.use));
      g.appendChild(c);
    });
    return g;
  };

  /* ---------- 수강 준비물 (체크하면 기억) ---------- */
  SB.prep = function (d) {
    var KEY = "kuc:prep", done = [];
    try { done = JSON.parse(S.lget(KEY)) || []; } catch (e) {}
    var wrap = el("div"), prog = el("p", "prep-progress"), list = el("div", "grid cols-2");
    prog.setAttribute("aria-live", "polite");
    function count() { prog.textContent = "준비 완료 " + done.length + " / " + d.items.length; }
    d.items.forEach(function (it, i) {
      var lab = el("label", "card prep-item");
      var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = done.indexOf(i) >= 0;
      cb.addEventListener("change", function () {
        done = done.filter(function (x) { return x !== i; });
        if (cb.checked) done.push(i);
        S.lset(KEY, JSON.stringify(done)); count();
      });
      var txt = el("span");
      add(txt, el("b", null, it.title), el("small", null, it.text));
      add(lab, cb, txt);
      list.appendChild(lab);
    });
    count();
    add(wrap, prog, list);
    if (d.note) wrap.appendChild(el("p", "muted center", d.note));
    return wrap;
  };

  /* ---------- 커리큘럼: 주차별 아코디언 + 월간 달력 ---------- */
  var items = {};

  function openWeek(n) {
    var det = items[n];
    if (!det) return;
    det.open = true;
    det.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function assignmentBox(w) {
    var a = w.assignment, box = el("div", "assign");
    add(box, el("h4", null, "📝 과제 · " + a.name));
    if (a.description) box.appendChild(el("p", null, a.description));
    var meta = el("p", "assign-meta");
    add(meta, el("span", null, "마감 " + dueLabel(a.due)), remainEl(a.due));
    var status = el("p", "sub-status");
    status.dataset.aid = a.id;
    var b = el("button", "btn primary small", "과제 제출"); b.type = "button";
    b.addEventListener("click", function () { window.Features.openSubmit(a); });
    add(box, meta, add(el("div", "assign-act"), b, status));
    return box;
  }

  function updateStatus() {
    var me = window.Features && window.Features.currentStudent();
    document.querySelectorAll(".sub-status").forEach(function (n) {
      var s = me && S.data.subs.filter(function (x) { return x.studentId === me.id && x.assignmentId === n.dataset.aid; })[0];
      n.textContent = s ? "제출 완료 ✓ " + s.fileName + (s.late ? " (지각)" : "") : (me ? "아직 제출하지 않았어요" : "로그인 후 제출할 수 있어요");
      n.classList.toggle("done", !!s);
    });
  }

  function weekItem(w) {
    var det = el("details", "card week-item" + (w.assignment ? " has-assign" : ""));
    det.id = "week-" + w.n;
    items[w.n] = det;
    var sum = el("summary");
    var mainTxt = el("span", "wk-main");
    add(mainTxt, el("b", null, w.topic), el("small", null, (w.date ? md(w.date) + " " : "") + (w.time || "")));
    var tags = el("span", "wk-tags");
    if (w.assignment) tags.appendChild(el("span", "tag assign-tag", "과제"));
    add(sum, el("span", "wk-no", w.n + "주차"), mainTxt, tags);

    var body = el("div", "week-body");
    var meta = el("dl", "week-meta");
    [["날짜", w.date ? dotted(w.date) + " (" + DOW[w.date.getDay()] + ")" : "미정"], ["시간", w.time], ["장소", w.place]].forEach(function (r) {
      var row = el("div"); add(row, el("dt", null, r[0]), el("dd", null, r[1] || "-")); meta.appendChild(row);
    });
    body.appendChild(meta);

    var ls = lines(w.content);
    if (ls.length) {
      var ul = el("ul", "week-content");
      ls.forEach(function (t) { ul.appendChild(el("li", null, t)); });
      add(body, el("h4", null, "학습 내용"), ul);
    }
    if (w.videos.length) {
      var vl = el("ul", "video-list");
      w.videos.forEach(function (v) {
        var a = el("a", null, "▶ " + (v.title || v.url)); a.href = safeUrl(v.url); a.target = "_blank"; a.rel = "noopener noreferrer";
        vl.appendChild(add(el("li"), a));
      });
      add(body, el("h4", null, "참고 영상"), vl);
    }
    if (w.assignment) body.appendChild(assignmentBox(w));
    add(det, sum, body);
    return det;
  }

  function calendar(list) {
    var byDay = {}, dueDay = {};
    list.forEach(function (w) {
      if (w.key) byDay[w.key] = w;
      if (w.assignment) { var k = dayKey(new Date(w.assignment.due)); (dueDay[k] = dueDay[k] || []).push(w); }
    });
    var today = new Date(), todayKey = dayKey(today);
    var dated = list.filter(function (w) { return w.date; });
    var upcoming = dated.filter(function (w) { return w.key >= todayKey; })[0] || dated[0];
    var view = upcoming ? new Date(upcoming.date.getFullYear(), upcoming.date.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1);
    var selected = upcoming ? upcoming.key : "";

    var card = el("article", "card cal");
    var head = el("div", "cal-head");
    var prev = el("button", "cal-nav", "‹"), next = el("button", "cal-nav", "›"), tdy = el("button", "btn small", "수업일로");
    prev.type = next.type = tdy.type = "button";
    prev.setAttribute("aria-label", "이전 달"); next.setAttribute("aria-label", "다음 달");
    var title = el("h3", "cal-title"); title.setAttribute("aria-live", "polite");
    add(head, prev, title, next, tdy);
    var dow = el("div", "cal-dow"); dow.setAttribute("aria-hidden", "true");
    DOW.forEach(function (n, i) { dow.appendChild(el("span", i === 0 ? "sun" : i === 6 ? "sat" : "", n)); });
    var grid = el("div", "cal-grid");
    var legend = el("p", "cal-legend");
    add(legend, el("span", "lg class", "수업일"), el("span", "lg due", "과제 마감"), el("span", "lg today", "오늘"));
    var detail = el("div", "cal-detail");
    detail.setAttribute("aria-live", "polite");
    add(card, head, dow, grid, legend, detail);

    function render() {
      title.textContent = view.getFullYear() + "년 " + (view.getMonth() + 1) + "월";
      clear(grid);
      var first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), i;
      for (i = 0; i < first; i++) grid.appendChild(el("span", "cal-pad"));
      for (i = 1; i <= days; i++) {
        var dt = new Date(view.getFullYear(), view.getMonth(), i), k = dayKey(dt), cls = "cal-day", lab = (dt.getMonth() + 1) + "월 " + i + "일 " + DOW[dt.getDay()] + "요일";
        if (byDay[k]) { cls += " class"; lab += ", " + byDay[k].n + "주차 수업"; }
        if (dueDay[k]) { cls += " due"; lab += ", 과제 마감"; }
        if (k === todayKey) { cls += " today"; lab += ", 오늘"; }
        if (k === selected) cls += " sel";
        var b = el("button", cls); b.type = "button"; b.dataset.k = k;
        b.setAttribute("aria-label", lab); b.setAttribute("aria-pressed", k === selected ? "true" : "false");
        b.appendChild(el("span", "num", String(i)));
        if (byDay[k]) b.appendChild(el("span", "wk", byDay[k].n + "주"));
        (function (k) { b.addEventListener("click", function () { selected = k; render(); }); })(k);
        grid.appendChild(b);
      }
      showDetail();
    }

    function showDetail() {
      clear(detail);
      if (!selected) { detail.appendChild(el("p", "muted", "날짜를 눌러 그날의 수업 내용을 확인하세요.")); return; }
      var d = parseDay(selected), w = byDay[selected], dues = dueDay[selected] || [];
      add(detail, el("h4", null, dotted(d) + " (" + DOW[d.getDay()] + ")"));
      if (w) {
        var box = el("div", "cal-lesson");
        add(box, el("p", "cal-topic", w.n + "주차 · " + w.topic), el("p", "muted", (w.time || "") + (w.place ? " · " + w.place : "")));
        var ls = lines(w.content).slice(0, 4);
        if (ls.length) { var ul = el("ul"); ls.forEach(function (t) { ul.appendChild(el("li", null, t)); }); box.appendChild(ul); }
        var more = el("button", "btn small primary", "주차 상세 보기"); more.type = "button";
        more.addEventListener("click", function () { openWeek(w.n); });
        box.appendChild(more);
        detail.appendChild(box);
      }
      dues.forEach(function (x) {
        var a = x.assignment, box = el("div", "cal-lesson due-box");
        add(box, el("p", "cal-topic", "📝 과제 마감 · " + a.title), el("p", "muted", "마감 " + dueLabel(a.due)), remainEl(a.due));
        detail.appendChild(box);
      });
      if (!w && !dues.length) detail.appendChild(el("p", "muted", "이 날은 수업이 없어요."));
    }

    prev.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
    next.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
    tdy.addEventListener("click", function () {
      if (!upcoming) return;
      view = new Date(upcoming.date.getFullYear(), upcoming.date.getMonth(), 1); selected = upcoming.key; render();
    });
    render();
    return card;
  }

  SB.curriculum = function (d) {
    var list = schedule(), wrap = el("div");
    items = {};
    var ctl = el("div", "week-ctl");
    var all = el("button", "btn small", "모두 펼치기"), none = el("button", "btn small", "모두 접기");
    all.type = none.type = "button";
    var acc = el("div", "week-list");
    list.forEach(function (w) { acc.appendChild(weekItem(w)); });
    all.addEventListener("click", function () { Object.keys(items).forEach(function (k) { items[k].open = true; }); });
    none.addEventListener("click", function () { Object.keys(items).forEach(function (k) { items[k].open = false; }); });
    add(ctl, el("span", "muted", "주차를 눌러 날짜·장소·학습 내용·영상·과제를 확인하세요."), add(el("div", "btn-row left"), all, none));

    var calHead = el("div", "section-head sub");
    add(calHead, el("h3", null, d.calendarTitle || "수업 달력"), el("p", null, d.calendarSubtitle || ""));
    add(wrap, ctl, acc, calHead, calendar(list));
    document.addEventListener("kuc:session", updateStatus);
    S.onChange(updateStatus);
    setTimeout(updateStatus, 0);
    return wrap;
  };
})();
