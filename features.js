/* 수강생 참여 기능: 투표 · 수강 신청 · 내 강의실(로그인/출석/과제) · 공지 · 안내 팝업 · 폭죽 */
(function () {
  "use strict";
  var H = window.H, S = window.Store, el = H.el, add = H.add, clear = H.clear;
  var SB = (window.SiteBuilders = {});
  var STUDENT_KEY = "kuc:student";
  var STUDENT_ITERS = 2000;

  function input(type, name, attrs) {
    var i = document.createElement("input");
    i.type = type; i.name = name; i.id = "f-" + name + "-" + H.uid();
    Object.keys(attrs || {}).forEach(function (k) { i.setAttribute(k, attrs[k]); });
    return i;
  }
  function labeled(text, control) {
    var wrap = el("div", "field");
    var l = el("label", null, text);
    l.setAttribute("for", control.id);
    add(wrap, l, control);
    return wrap;
  }

  /* ================= 실시간 투표 ================= */
  SB.poll = function (d) {
    var MY = "kuc:myvote", flash = "";
    var wrap = el("div", "grid cols-2");
    var formCard = el("article", "card"), chartCard = el("article", "card");
    add(wrap, formCard, chartCard);

    function draw() {
      var votes = S.data.votes, my = S.lget(MY);
      clear(formCard); clear(chartCard);

      add(formCard, el("h3", "card-title", d.question));
      var form = el("form");
      form.noValidate = true;
      var group = el("div", "choices");
      group.setAttribute("role", "radiogroup");
      group.setAttribute("aria-label", d.question);
      d.topics.forEach(function (t) {
        var lab = el("label", "choice");
        var r = document.createElement("input");
        r.type = "radio"; r.name = "topic"; r.value = t.id;
        if (t.id === my) r.checked = true;
        add(lab, r, el("span", null, t.label));
        group.appendChild(lab);
      });
      var btn = el("button", "btn primary", my ? "투표 바꾸기" : "투표하기");
      btn.type = "submit";
      var note = el("p", "form-msg", flash);
      note.setAttribute("role", "status");
      flash = "";
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var sel = form.querySelector("input:checked");
        if (!sel) { flash = "주제를 먼저 선택해 주세요."; draw(); return; }
        var prev = S.lget(MY);
        if (prev === sel.value) { flash = "이미 선택한 주제예요."; draw(); return; }
        var v = S.data.votes;
        if (prev && v[prev]) v[prev]--;
        v[sel.value] = (v[sel.value] || 0) + 1;
        S.lset(MY, sel.value);
        flash = "투표가 반영되었어요. 🌸";
        S.save();
      });
      add(form, group, btn, note);
      add(formCard, form, el("p", "muted", "한 브라우저에서 1표만 행사할 수 있고, 언제든 바꿀 수 있어요."));

      var total = 0, max = 0;
      d.topics.forEach(function (t) { var n = votes[t.id] || 0; total += n; if (n > max) max = n; });
      add(chartCard, el("h3", "card-title", "투표 결과"));
      var list = el("div", "bars");
      list.setAttribute("role", "list");
      d.topics.forEach(function (t) {
        var n = votes[t.id] || 0, pct = total ? Math.round((n / total) * 100) : 0;
        var row = el("div", "bar-row" + (max > 0 && n === max ? " top" : ""));
        row.setAttribute("role", "listitem");
        var head = el("div", "bar-head");
        add(head, el("span", null, t.label + (t.id === my ? " ✓" : "")), el("b", null, n + "표 · " + pct + "%"));
        var track = el("div", "bar-track"), fill = document.createElement("i");
        fill.style.width = pct + "%";
        track.appendChild(fill);
        add(row, head, track);
        list.appendChild(row);
      });
      add(chartCard, list, el("p", "muted", "총 " + total + "표"));
    }
    S.onChange(draw);
    draw();
    return wrap;
  };

  /* ================= 수강 신청서 ================= */
  SB.enroll = function (d) {
    var FIELDS = [
      { k: "name", label: "이름", req: 1, attrs: { autocomplete: "name" } },
      { k: "studentId", label: "학번", req: 1, test: /^\d{6,10}$/, bad: "학번은 숫자 6~10자리로 입력해 주세요.", attrs: { inputmode: "numeric", autocomplete: "off" } },
      { k: "dept", label: "소속 학과", req: 1 },
      { k: "grade", label: "학년", req: 1, select: d.grades },
      { k: "email", label: "이메일", req: 1, type: "email", test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, bad: "이메일 형식이 올바르지 않아요. (예: name@korea.ac.kr)", attrs: { autocomplete: "email" } },
      { k: "phone", label: "연락처", req: 1, type: "tel", test: /^01[016789][-\s]?\d{3,4}[-\s]?\d{4}$/, bad: "연락처 형식이 올바르지 않아요. (예: 010-1234-5678)", attrs: { autocomplete: "tel" } },
      { k: "motive", label: "수강 동기", req: 1, area: true },
      { k: "consent", label: "개인정보 수집·이용 동의", req: 1, check: d.consentText }
    ];

    var card = el("article", "card form-card");
    var form = el("form");
    form.noValidate = true;
    var alertBox = el("div", "alert-box");
    alertBox.setAttribute("role", "alert");
    alertBox.hidden = true;
    var controls = {}, errs = {};

    FIELDS.forEach(function (f) {
      var wrap = el("div", "field" + (f.check ? " check" : ""));
      var c;
      if (f.select) {
        c = document.createElement("select");
        var o = el("option", null, "선택하세요"); o.value = "";
        c.appendChild(o);
        f.select.forEach(function (g) { var op = el("option", null, g); op.value = g; c.appendChild(op); });
        c.name = f.k; c.id = "e-" + f.k;
      } else if (f.area) {
        c = document.createElement("textarea"); c.rows = 4; c.name = f.k; c.id = "e-" + f.k;
      } else if (f.check) {
        c = document.createElement("input"); c.type = "checkbox"; c.name = f.k; c.id = "e-" + f.k;
      } else {
        c = document.createElement("input"); c.type = f.type || "text"; c.name = f.k; c.id = "e-" + f.k;
      }
      Object.keys(f.attrs || {}).forEach(function (k) { c.setAttribute(k, f.attrs[k]); });
      var lab = el("label", null, f.check ? f.check : f.label + (f.req ? " *" : ""));
      lab.setAttribute("for", c.id);
      var er = el("span", "err");
      er.id = "e-" + f.k + "-err";
      c.setAttribute("aria-describedby", er.id);
      if (f.check) add(wrap, c, lab, er); else add(wrap, lab, c, er);
      c.addEventListener("input", function () { setErr(f.k, ""); });
      c.addEventListener("change", function () { setErr(f.k, ""); });
      controls[f.k] = c; errs[f.k] = er;
      form.appendChild(wrap);
    });
    function setErr(k, msg) {
      errs[k].textContent = msg;
      if (msg) controls[k].setAttribute("aria-invalid", "true"); else controls[k].removeAttribute("aria-invalid");
    }

    var submit = el("button", "btn primary", "수강 신청서 제출");
    submit.type = "submit";
    var done = el("p", "form-msg ok");
    done.setAttribute("role", "status");
    add(form, submit, done);
    add(card, alertBox, form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      done.textContent = "";
      var missing = [], badFmt = [], first = null, val = {};
      FIELDS.forEach(function (f) {
        var c = controls[f.k];
        var v = f.check ? c.checked : c.value.trim();
        val[f.k] = v;
        var msg = "";
        if (f.req && !v) { msg = f.check ? "동의가 필요해요." : f.label + "을(를) 입력해 주세요."; missing.push(f.label); }
        else if (f.test && !f.test.test(v)) { msg = f.bad; badFmt.push(f.label); }
        setErr(f.k, msg);
        if (msg && !first) first = c;
      });
      if (!first && S.data.enroll.some(function (r) { return r.studentId === val.studentId; })) {
        setErr("studentId", "이미 신청서가 제출된 학번이에요.");
        first = controls.studentId;
        badFmt.push("학번(중복)");
      }
      if (first) {
        clear(alertBox);
        add(alertBox, el("strong", null, "제출하기 전에 아래 항목을 확인해 주세요."));
        var ul = el("ul");
        if (missing.length) ul.appendChild(el("li", null, "빠진 항목: " + missing.join(", ")));
        if (badFmt.length) ul.appendChild(el("li", null, "다시 확인할 항목: " + badFmt.join(", ")));
        alertBox.appendChild(ul);
        alertBox.hidden = false;
        first.focus();
        return;
      }
      alertBox.hidden = true;
      S.data.enroll.push({
        id: H.uid(), time: Date.now(), name: val.name, studentId: val.studentId, dept: val.dept,
        grade: val.grade, email: val.email, phone: val.phone, motive: val.motive
      });
      if (S.save()) {
        form.reset();
        done.textContent = d.successMessage;
      }
    });
    return card;
  };

  /* ================= 내 강의실: 로그인 / 출석 / 과제 ================= */
  function findStudent(id) {
    for (var i = 0; i < S.data.students.length; i++) if (S.data.students[i].id === id) return S.data.students[i];
    return null;
  }
  S.studentHash = function (id, pw) { return S.hashPw(S.config.security.salt + ":" + id, pw, STUDENT_ITERS); };

  function currentStudent() { return findStudent(S.sget(STUDENT_KEY)); }
  function sessionChanged() { document.dispatchEvent(new Event("kuc:session")); }

  /* 과제 파일 저장 (내 강의실과 주차별 카드의 제출 창이 함께 사용) */
  function saveSubmission(me, as, f) {
    var key = "sub:" + H.uid();
    var old = S.data.subs.filter(function (s) { return s.studentId === me.id && s.assignmentId === as.id; })[0];
    return S.putFile(key, f).then(function () {
      if (old) { S.delFile(old.key).catch(function () {}); S.data.subs.splice(S.data.subs.indexOf(old), 1); }
      var late = new Date() > new Date(as.due);
      S.data.subs.push({ key: key, assignmentId: as.id, title: as.title, studentId: me.id, name: me.name, fileName: f.name, size: f.size, time: Date.now(), late: late });
      return { old: !!old, late: late };
    });
  }

  /* 주차 카드의 [과제 제출] 버튼: 로그인 여부에 따라 안내 또는 제출 창 */
  function openSubmit(as) {
    var me = currentStudent(), body = el("div"), max = (S.config.classroom || {}).maxFileMB || 10;
    add(body, el("p", null, as.title), el("p", "muted", "마감 " + as.due.replace("T", " ")));
    if (!me) {
      add(body, el("p", null, "과제를 제출하려면 먼저 ‘내 강의실’에서 로그인해 주세요."));
      var go = el("a", "btn primary", "내 강의실로 이동"); go.href = "#classroom";
      var m = H.modal("과제 제출", add(body, add(el("div", "btn-row"), go)));
      go.addEventListener("click", function () { m.close(); });
      return;
    }
    var form = el("form"), file = input("file", "hwfile2", {});
    var msg = el("p", "form-msg"); msg.setAttribute("role", "status");
    var sb = el("button", "btn primary", "제출하기"); sb.type = "submit";
    add(form, labeled("파일 (최대 " + max + "MB)", file), sb, msg);
    add(body, el("p", "muted", me.name + "님으로 제출합니다. 마감 후 제출은 지각으로 표시돼요."), form);
    var mod = H.modal("과제 제출", body);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = file.files[0];
      if (!f) { msg.textContent = "제출할 파일을 선택해 주세요."; return; }
      if (f.size > max * 1024 * 1024) { msg.textContent = "파일이 너무 커요. " + max + "MB 이하만 제출할 수 있어요."; return; }
      sb.disabled = true;
      saveSubmission(me, as, f).then(function (r) {
        S.save(); mod.close();
        H.toast((r.old ? "다시 제출했어요." : "제출했어요.") + (r.late ? " (지각)" : " 🌸"));
      }).catch(function () { msg.textContent = "파일을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요."; sb.disabled = false; });
    });
  }

  SB.classroom = function (d) {
    var root = el("div"), flash = "";

    function draw() {
      clear(root);
      var me = findStudent(S.sget(STUDENT_KEY));
      if (!me) { S.sset(STUDENT_KEY, null); root.appendChild(loginView()); }
      else root.appendChild(roomView(me));
    }

    function loginView() {
      var card = el("article", "card login-card");
      add(card, el("h3", "card-title", "수강생 로그인"), el("p", "muted", d.loginHelp));
      var form = el("form");
      var id = input("text", "sid", { autocomplete: "username", inputmode: "numeric" });
      var pw = input("password", "spw", { autocomplete: "current-password" });
      var msg = el("p", "form-msg err-text", flash);
      msg.setAttribute("role", "alert");
      flash = "";
      var btn = el("button", "btn primary", "로그인");
      btn.type = "submit";
      add(form, labeled("학번", id), labeled("비밀번호", pw), btn, msg);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var sid = id.value.trim(), st = findStudent(sid);
        if (!S.data.students.length) { msg.textContent = "아직 등록된 수강생이 없어요. 담당 교수자에게 문의해 주세요."; return; }
        if (!sid || !pw.value) { msg.textContent = "학번과 비밀번호를 모두 입력해 주세요."; return; }
        if (!st || S.studentHash(sid, pw.value) !== st.hash) { msg.textContent = "학번 또는 비밀번호가 올바르지 않아요."; return; }
        S.sset(STUDENT_KEY, sid);
        flash = "";
        draw();
        sessionChanged();
      });
      card.appendChild(form);
      return card;
    }

    function roomView(me) {
      var box = el("div");
      var bar = el("div", "room-bar");
      var out = el("button", "btn", "로그아웃");
      out.type = "button";
      out.addEventListener("click", function () { S.sset(STUDENT_KEY, null); draw(); sessionChanged(); });
      add(bar, el("strong", null, me.name + "님, 환영합니다 🌸"), out);
      var g = el("div", "grid cols-2");

      /* 출석 */
      var att = el("article", "card");
      add(att, el("h3", "card-title", "출석 체크"));
      var today = H.today();
      var mine = S.data.attendance.filter(function (a) { return a.id === me.id; });
      var did = mine.some(function (a) { return a.date === today; });
      var ab = el("button", "btn primary", did ? "오늘 출석 완료 ✓" : "오늘 출석 체크");
      ab.type = "button"; ab.disabled = did;
      ab.addEventListener("click", function () {
        if (S.data.attendance.some(function (a) { return a.id === me.id && a.date === today; })) return;
        S.data.attendance.push({ date: today, time: Date.now(), id: me.id, name: me.name });
        S.save(); H.toast("출석이 기록되었어요.");
      });
      add(att, ab, el("p", "muted", "누적 출석 " + mine.length + "회"));
      var ul = el("ul", "plain-list");
      mine.slice(-5).reverse().forEach(function (a) { ul.appendChild(el("li", null, a.date + " " + H.fmt(a.time).slice(11))); });
      att.appendChild(ul);

      /* 과제 */
      var hw = el("article", "card");
      add(hw, el("h3", "card-title", "과제 제출"));
      var form = el("form");
      var sel = document.createElement("select"); sel.id = "hw-sel";
      var AS = S.assignments();
      AS.forEach(function (a) { var o = el("option", null, a.title + " (마감 " + a.due.replace("T", " ") + ")"); o.value = a.id; sel.appendChild(o); });
      var file = input("file", "hwfile", {});
      var msg = el("p", "form-msg", flash);
      msg.setAttribute("role", "status");
      flash = "";
      var sb = el("button", "btn primary", "제출하기"); sb.type = "submit";
      add(form, labeled("과제 선택", sel), labeled("파일 (최대 " + d.maxFileMB + "MB)", file), sb, msg);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var f = file.files[0];
        if (!AS.length) { msg.textContent = "등록된 과제가 없어요."; return; }
        if (!f) { msg.textContent = "제출할 파일을 선택해 주세요."; return; }
        if (f.size > d.maxFileMB * 1024 * 1024) { msg.textContent = "파일이 너무 커요. " + d.maxFileMB + "MB 이하만 제출할 수 있어요."; return; }
        var as = AS.filter(function (a) { return a.id === sel.value; })[0];
        sb.disabled = true;
        saveSubmission(me, as, f).then(function (r) {
          flash = (r.old ? "다시 제출했어요. " : "제출했어요. ") + (r.late ? "(마감 이후 제출)" : "🌸");
          S.save();
        }).catch(function () { msg.textContent = "파일을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요."; sb.disabled = false; });
      });
      hw.appendChild(form);
      var hl = el("ul", "plain-list");
      S.data.subs.filter(function (s) { return s.studentId === me.id; }).forEach(function (s) {
        hl.appendChild(el("li", null, s.title + " · " + s.fileName + " · " + H.fmt(s.time) + (s.late ? " · 지각" : "")));
      });
      add(hw, el("h4", "sub-title", "내 제출 내역"), hl);
      if (!hl.children.length) hl.appendChild(el("li", "muted", "아직 제출한 과제가 없어요."));

      add(g, att, hw);
      add(box, bar, g);
      return box;
    }

    S.onChange(function () { if (!root.querySelector("form input:focus,form select:focus")) draw(); });
    draw();
    return root;
  };

  /* ================= 공지 ================= */
  function mountNotices() {
    var band = document.getElementById("noticeBand");
    if (!band) return;
    function draw() {
      clear(band);
      var list = S.data.notices.slice().sort(function (a, b) { return b.time - a.time; }).slice(0, 3);
      if (!list.length) return;
      var card = el("article", "card notice-card");
      card.appendChild(el("h3", "card-title", "📢 공지사항"));
      list.forEach(function (n) {
        var it = el("div", "notice-item");
        add(it, el("strong", null, n.title), el("span", "muted", " · " + H.fmt(n.time)), el("p", null, n.body));
        card.appendChild(it);
      });
      band.appendChild(card);
    }
    S.onChange(draw);
    draw();
  }

  /* ================= 폭죽 ================= */
  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var cv = el("canvas", "confetti");
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    var ctx = cv.getContext("2d"), dpr = window.devicePixelRatio || 1, W = 0, Ht = 0;
    function size() { W = window.innerWidth; Ht = window.innerHeight; cv.width = W * dpr; cv.height = Ht * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size();
    var colors = ["#f9cfe2", "#ee8fb7", "#d4568d", "#c3a6ee", "#8e6bd1", "#ffffff", "#ffd9ec"];
    var parts = [], bursts = [[0, .18, .95], [350, .82, .95], [800, .5, .6], [1300, .3, .8], [1500, .7, .8]];
    function burst(fx, fy) {
      for (var i = 0; i < 70; i++) {
        var a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * .9, sp = 7 + Math.random() * 9;
        parts.push({ x: W * fx, y: Ht * fy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
          r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[(Math.random() * colors.length) | 0], life: 150 + Math.random() * 80 });
      }
    }
    var start = performance.now(), fired = 0;
    function frame(now) {
      var t = now - start;
      while (fired < bursts.length && t >= bursts[fired][0]) { burst(bursts[fired][1], bursts[fired][2]); fired++; }
      ctx.clearRect(0, 0, W, Ht);
      parts = parts.filter(function (p) { return p.life > 0 && p.y < Ht + 20; });
      parts.forEach(function (p) {
        p.vy += .22; p.vx *= .985; p.vy *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
        ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 40); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (fired < bursts.length || parts.length) requestAnimationFrame(frame); else cv.remove();
    }
    requestAnimationFrame(frame);
  }

  /* ================= 수강 신청 안내 팝업 ================= */
  function popup(p) {
    if (!p || !p.enabled || S.lget("kuc:popupHide") === H.today()) return;
    setTimeout(function () {
      if (document.querySelector(".modal-overlay")) return;
      var body = el("div");
      (p.lines || []).forEach(function (l) { body.appendChild(el("p", null, l)); });
      var chk = document.createElement("input"); chk.type = "checkbox"; chk.id = "popup-hide";
      var lab = el("label", "popup-hide", "오늘 하루 보지 않기"); lab.setAttribute("for", chk.id);
      var row = el("div", "check-row"); add(row, chk, lab);
      var go = el("a", "btn primary", p.buttonLabel || "수강 신청하기"); go.href = "#enroll";
      var cl = el("button", "btn", "닫기"); cl.type = "button";
      var btns = el("div", "btn-row"); add(btns, go, cl);
      add(body, row, btns);
      var m = H.modal(p.title, body, { onClose: function () { if (chk.checked) S.lset("kuc:popupHide", H.today()); } });
      go.addEventListener("click", function () { m.close(); });
      cl.addEventListener("click", function () { m.close(); });
    }, p.delayMs == null ? 2500 : p.delayMs);
  }

  window.Features = {
    currentStudent: currentStudent,
    openSubmit: openSubmit,
    init: function (C) {
      mountNotices();
      if (!S.lget("kuc:visited")) {
        S.lset("kuc:visited", "1");
        if (!C.confetti || C.confetti.enabled !== false) setTimeout(confetti, 500);
      }
      popup(C.popup);
    }
  };
})();
