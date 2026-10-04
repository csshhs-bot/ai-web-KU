/* 관리자 화면: 자물쇠 아이콘 → 비밀번호 → 편집 / 수강생 / 공지 / 출석 / 과제 / 신청 / 투표 / 설정·백업 */
(function () {
  "use strict";
  var H = window.H, S = window.Store, el = H.el, add = H.add, clear = H.clear;
  var btn = document.getElementById("adminBtn");
  if (!btn) return;
  var SKEY = "kuc:admin", ADMIN_ITERS = 20000;
  var fails = 0, lockUntil = 0;

  btn.addEventListener("click", function () { if (S.sget(SKEY) === "1") openPanel(); else login(); });

  /* ---------- 로그인 ---------- */
  function login() {
    var form = el("form");
    var pw = document.createElement("input");
    pw.type = "password"; pw.id = "admin-pw"; pw.autocomplete = "current-password";
    var l = el("label", null, "관리자 비밀번호"); l.setAttribute("for", pw.id);
    var msg = el("p", "form-msg err-text"); msg.setAttribute("role", "alert");
    var go = el("button", "btn primary", "열기"); go.type = "submit";
    add(form, el("div", "field", null), msg, go);
    form.firstChild.appendChild(l); form.firstChild.appendChild(pw);
    var m = H.modal("🔒 관리자 확인", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var wait = Math.ceil((lockUntil - Date.now()) / 1000);
      if (wait > 0) { msg.textContent = wait + "초 후에 다시 시도해 주세요."; return; }
      var sec = S.config.security || {};
      if (S.hashPw(sec.salt || "", pw.value, ADMIN_ITERS) === sec.adminHash) {
        fails = 0; S.sset(SKEY, "1"); m.close(); openPanel();
      } else {
        fails++; pw.value = "";
        if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; msg.textContent = "여러 번 틀렸어요. 30초 후에 다시 시도해 주세요."; }
        else msg.textContent = "비밀번호가 올바르지 않아요.";
        pw.focus();
      }
    });
  }

  /* ---------- 공통 UI 조각 ---------- */
  function table(headers, rows, empty) {
    var wrap = el("div", "table-wrap"), t = el("table"), thead = el("thead"), tr = el("tr");
    headers.forEach(function (h) { tr.appendChild(el("th", null, h)); });
    thead.appendChild(tr);
    var tb = el("tbody");
    rows.forEach(function (r) {
      var row = el("tr");
      r.forEach(function (c) { var td = el("td"); if (c instanceof Node) td.appendChild(c); else td.textContent = c == null ? "" : c; row.appendChild(td); });
      tb.appendChild(row);
    });
    if (!rows.length) { var er = el("tr"), td = el("td", "muted", empty || "내역이 없어요."); td.colSpan = headers.length; er.appendChild(td); tb.appendChild(er); }
    add(t, thead, tb); wrap.appendChild(t);
    return wrap;
  }
  function button(text, fn, cls) { var b = el("button", "btn small" + (cls ? " " + cls : ""), text); b.type = "button"; b.addEventListener("click", fn); return b; }
  function csvBtn(text, name, rows) { return button(text, function () { H.download(name, H.csv(rows), "text/csv;charset=utf-8"); }, "primary"); }
  function head(title, desc) { var d = el("div", "admin-intro"); add(d, el("h3", null, title)); if (desc) d.appendChild(el("p", "muted", desc)); return d; }
  function stamp() { return H.today(); }
  function pickFile(accept, cb) {
    var f = document.createElement("input"); f.type = "file"; f.accept = accept;
    f.addEventListener("change", function () { if (f.files[0]) { var r = new FileReader(); r.onload = function () { cb(String(r.result), f.files[0]); }; r.readAsText(f.files[0]); } });
    f.click();
  }

  /* ---------- 화면에서 바로 고치는 범용 편집기 ---------- */
  var LABELS = { university: "대학교", department: "학과", courseName: "교과목명", courseCode: "학수번호", tagline: "한 줄 소개", pageTitle: "브라우저 탭 제목", footerText: "푸터 문구",
    title: "제목", subtitle: "부제목", eyebrow: "상단 문구", description: "설명", badges: "배지", buttons: "버튼", label: "표시 이름", target: "이동할 섹션 id", primary: "강조 버튼",
    summary: "요약", cards: "카드", icon: "아이콘", text: "내용", weeks: "주차", week: "주차", topic: "주제", detail: "세부 내용", info: "강좌 정보", value: "값",
    evaluationTitle: "평가 제목", evaluation: "평가 항목", item: "항목", percent: "비율(%)", notices: "유의 사항", items: "목록", q: "질문", a: "답변", members: "교수자",
    name: "이름", role: "직함", photo: "사진 경로", bio: "소개", tags: "태그", contacts: "연락처", href: "링크", question: "투표 질문", topics: "투표 주제",
    grades: "학년 선택지", consentText: "동의 문구", successMessage: "제출 완료 문구", assignments: "과제 목록", due: "마감일(YYYY-MM-DD)", maxFileMB: "파일 최대 크기(MB)",
    enabled: "사용", delayMs: "표시 지연(ms)", lines: "안내 문구", buttonLabel: "버튼 문구", id: "ID (수정 불가)", nav: "상단 메뉴", loginHelp: "로그인 안내 문구",
    menu: "메뉴에 표시", content: "학습 내용(한 줄에 하나씩)", slides: "슬라이드", startDate: "시작일(YYYY-MM-DD)", time: "수업 시간", place: "수업 장소", date: "날짜 직접 지정(비우면 자동)",
    videos: "참고 영상", url: "영상 주소(https://…)", assignment: "과제 (제목·마감을 모두 적으면 표시)", calendarTitle: "달력 제목", calendarSubtitle: "달력 설명",
    source: "자동 계산(weeks 또는 tools, 비우면 값 사용)", suffix: "단위", use: "활용 분야", desc: "설명" };
  var SECTIONS = [["basic", "기본 정보"], ["hero", "첫 화면"], ["overview", "한눈에 보기"], ["stats", "통계 카드"], ["intro", "프로그램 소개·장점 슬라이드"], ["curriculum", "커리큘럼·주차별 일정"],
    ["tools", "실습 AI 도구"], ["prep", "수강 준비물"], ["guide", "수강 안내"], ["poll", "투표"], ["enroll", "수강 신청서"], ["classroom", "내 강의실"], ["faq", "FAQ"],
    ["instructor", "교수자(푸터)"], ["popup", "안내 팝업"], ["nav", "상단 메뉴"]];
  var BASIC = ["university", "department", "courseName", "courseCode", "pageTitle", "footerText"];
  /* 빈 배열에 항목을 추가할 때 쓰는 기본 모양, 그리고 항상 여러 줄 입력칸으로 보여줄 항목 */
  var EMPTY_TMPL = { videos: { title: "", url: "" } };
  var MULTI = { content: 1, description: 1, text: 1, a: 1, bio: 1, summary: 1, desc: 1 };

  function blank(v) {
    if (typeof v === "string") return "";
    if (typeof v === "number") return 0;
    if (typeof v === "boolean") return false;
    if (Array.isArray(v)) return [];
    var o = {}; Object.keys(v).forEach(function (k) { o[k] = k === "id" ? H.uid() : blank(v[k]); }); return o;
  }
  function field(box, parent, key, path) {
    var v = parent[key], label = LABELS[key] || (typeof key === "number" ? "#" + (key + 1) : key);
    if (typeof v === "string" || typeof v === "number") {
      var row = el("label", "f-row"), multi = typeof v === "string" && (MULTI[key] || v.length > 50 || v.indexOf("\n") > -1);
      var inp = el(multi ? "textarea" : "input", "f-input");
      if (multi) inp.rows = 3; else inp.type = typeof v === "number" ? "number" : "text";
      inp.value = v;
      if (key === "id" || /^nav\.\d+\.id$/.test(path)) inp.disabled = true;
      inp.addEventListener("input", function () { parent[key] = typeof v === "number" ? Number(inp.value) : inp.value; });
      add(row, el("span", "f-label", label), inp); box.appendChild(row);
    } else if (typeof v === "boolean") {
      var r2 = el("label", "f-row f-check"), cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = v;
      cb.addEventListener("change", function () { parent[key] = cb.checked; });
      add(r2, cb, el("span", null, label)); box.appendChild(r2);
    } else if (Array.isArray(v)) {
      var fs = el("fieldset", "f-group"), lg = el("legend", null, label);
      var tmpl = v.length ? blank(v[0]) : (EMPTY_TMPL[key] ? H.clone(EMPTY_TMPL[key]) : "");
      var fixed = path === "nav";
      fs.appendChild(lg);
      var body = el("div");
      fs.appendChild(body);
      var draw = function () {
        clear(body);
        v.forEach(function (it, i) {
          var card = el("div", "f-item"), hd = el("div", "f-item-head");
          hd.appendChild(el("span", null, "#" + (i + 1)));
          if (!fixed) {
            var up = button("↑", function () { if (i > 0) { v.splice(i - 1, 0, v.splice(i, 1)[0]); draw(); } });
            var dn = button("↓", function () { if (i < v.length - 1) { v.splice(i + 1, 0, v.splice(i, 1)[0]); draw(); } });
            var rm = button("삭제", function () { v.splice(i, 1); draw(); }, "danger");
            add(hd, up, dn, rm);
          }
          card.appendChild(hd);
          if (it && typeof it === "object") Object.keys(it).forEach(function (k) { field(card, it, k, path + "." + i + "." + k); });
          else field(card, v, i, path + "." + i);
          body.appendChild(card);
        });
        if (!fixed) body.appendChild(button("+ 항목 추가", function () { var n = tmpl && typeof tmpl === "object" ? H.clone(tmpl) : tmpl; if (n && typeof n === "object" && "id" in n) n.id = H.uid(); v.push(n); draw(); }));
      };
      draw(); box.appendChild(fs);
    } else if (v && typeof v === "object") {
      var g = el("fieldset", "f-group"); g.appendChild(el("legend", null, label));
      Object.keys(v).forEach(function (k) { field(g, v, k, path + "." + k); });
      box.appendChild(g);
    }
  }

  /* ---------- 관리자 패널 ---------- */
  function openPanel() {
    if (document.querySelector(".admin")) return;
    var ov = el("div", "admin");
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "관리자 화면");
    var top = el("div", "admin-head");
    var closeP = button("닫기", close), out = button("로그아웃", function () { S.sset(SKEY, null); close(); });
    add(top, el("h2", null, "🌸 관리자 화면"), add(el("div", "admin-head-btns"), out, closeP));
    var tabs = el("div", "admin-tabs"), main = el("div", "admin-main");
    var draft = H.clone(S.config); delete draft.security;
    var current = "edit";
    var TABS = [["edit", "사이트 편집"], ["students", "수강생"], ["notices", "공지"], ["att", "출석"], ["subs", "과제"], ["enroll", "수강 신청"], ["poll", "투표"], ["files", "설정·백업"]];
    var views = { edit: vEdit, students: vStudents, notices: vNotices, att: vAtt, subs: vSubs, enroll: vEnroll, poll: vPoll, files: vFiles };
    function show(k) {
      current = k || current;
      var keepY = main.scrollTop;
      clear(tabs); clear(main);
      TABS.forEach(function (t) {
        var b = el("button", "admin-tab" + (t[0] === current ? " on" : ""), t[1]); b.type = "button";
        b.setAttribute("aria-current", t[0] === current ? "page" : "false");
        b.addEventListener("click", function () { show(t[0]); });
        tabs.appendChild(b);
      });
      main.appendChild(views[current]());
      main.scrollTop = keepY;
    }
    function close() { document.removeEventListener("keydown", esc); ov.remove(); document.body.classList.remove("no-scroll"); btn.focus(); }
    function esc(e) { if (e.key === "Escape" && !document.querySelector(".modal-overlay")) close(); }
    document.addEventListener("keydown", esc);
    add(ov, top, tabs, main);
    document.body.appendChild(ov);
    document.body.classList.add("no-scroll");

    /* --- 사이트 편집 --- */
    function vEdit() {
      var w = el("div"), sel = document.createElement("select"), form = el("div");
      sel.id = "edit-sec";
      SECTIONS.forEach(function (s) { var o = el("option", null, s[1]); o.value = s[0]; sel.appendChild(o); });
      sel.value = vEdit.sec || "basic";
      function draw() {
        vEdit.sec = sel.value; clear(form);
        if (sel.value === "basic") BASIC.forEach(function (k) { field(form, draft, k, k); });
        else field(form, draft, sel.value, sel.value);
      }
      sel.addEventListener("change", draw);
      var save = button("저장하고 사이트에 적용", function () {
        var next = Object.assign({}, S.config, draft, { security: S.config.security });
        if (!S.saveOverride(next)) { H.toast("저장하지 못했어요."); return; }
        H.toast("저장했어요. 사이트를 새로 불러옵니다."); setTimeout(function () { location.reload(); }, 600);
      }, "primary");
      var reset = button("원본(config.js)으로 되돌리기", function () {
        if (!confirm("화면에서 고친 내용을 모두 버리고 config.js 원본으로 되돌릴까요?")) return;
        S.clearOverride(); location.reload();
      }, "danger");
      var lab = el("label", "f-row"); add(lab, el("span", "f-label", "편집할 영역"), sel);
      add(w, head("사이트 편집", "내용을 고친 뒤 ‘저장하고 사이트에 적용’을 눌러야 반영돼요. 이 저장은 이 브라우저에만 적용되니, 다른 사람에게도 보이게 하려면 ‘설정·백업’에서 config.js로 저장해 교체하세요."), lab, form,
        add(el("div", "btn-row left"), save, reset));
      draw();
      return w;
    }

    /* --- 수강생 --- */
    function vStudents() {
      var w = el("div");
      var ta = document.createElement("textarea"); ta.rows = 5; ta.placeholder = "2024123456, 홍길동\n2024123457, 김벚꽃";
      ta.id = "stu-ta";
      ta.value = vStudents.left || "";
      var msg = el("p", "form-msg", vStudents.flash || "");
      vStudents.flash = vStudents.left = "";
      var reg = button("명단 등록", function () {
        var ok = 0, upd = 0, bad = [];
        ta.value.split(/\r?\n/).forEach(function (line, i) {
          line = line.trim(); if (!line) return;
          var p = line.split(/[,\t]+/).map(function (x) { return x.trim(); });
          if (i === 0 && /학번/.test(p[0])) return;
          if (!/^[A-Za-z0-9]{4,12}$/.test(p[0] || "") || !p[1]) { bad.push(line); return; }
          var ex = S.data.students.filter(function (s) { return s.id === p[0]; })[0];
          if (ex) { ex.name = p[1]; upd++; } else { S.data.students.push({ id: p[0], name: p[1], hash: S.studentHash(p[0], p[0]) }); ok++; }
        });
        S.save();
        vStudents.flash = "신규 " + ok + "명, 이름 갱신 " + upd + "명" + (bad.length ? " · 형식 오류 " + bad.length + "줄은 입력창에 남겨두었어요." : "");
        vStudents.left = bad.join("\n");
        show();
      }, "primary");
      var imp = button("CSV/텍스트 파일 불러오기", function () { pickFile(".csv,.txt", function (t) { ta.value = t.replace(/^﻿/, ""); }); });
      add(w, head("수강생 명단", "‘학번, 이름’을 한 줄에 한 명씩 붙여 넣으세요. 처음 비밀번호는 학번과 같고, 이미 있는 학번은 이름만 바뀝니다."), ta, add(el("div", "btn-row left"), reg, imp), msg);
      var rows = S.data.students.map(function (s) {
        return [s.id, s.name, add(el("div", "cell-btns"),
          button("비밀번호 초기화", function () { if (confirm(s.name + "님의 비밀번호를 학번으로 되돌릴까요?")) { s.hash = S.studentHash(s.id, s.id); S.save(); H.toast("초기화했어요."); } }),
          button("삭제", function () { if (confirm(s.name + "님을 명단에서 삭제할까요? (출석·과제 기록은 남습니다)")) { S.data.students.splice(S.data.students.indexOf(s), 1); S.save(); show(); } }, "danger"))];
      });
      add(w, el("h4", "sub-title", "등록된 수강생 " + rows.length + "명"), table(["학번", "이름", "관리"], rows, "아직 등록된 수강생이 없어요."));
      if (rows.length) w.appendChild(csvBtn("명단 CSV 내려받기", "수강생명단_" + stamp() + ".csv", [["학번", "이름"]].concat(S.data.students.map(function (s) { return [s.id, s.name]; }))));
      return w;
    }

    /* --- 공지 --- */
    function vNotices() {
      var w = el("div"), t = document.createElement("input"), b = document.createElement("textarea"), msg = el("p", "form-msg");
      t.id = "nt-t"; b.id = "nt-b"; b.rows = 4;
      var post = button("공지 올리기", function () {
        if (!t.value.trim() || !b.value.trim()) { msg.textContent = "제목과 내용을 모두 입력해 주세요."; return; }
        S.data.notices.push({ id: H.uid(), time: Date.now(), title: t.value.trim(), body: b.value.trim() });
        S.save(); H.toast("공지를 올렸어요."); show();
      }, "primary");
      var l1 = el("div", "field"), l2 = el("div", "field");
      add(l1, Object.assign(el("label", null, "제목"), { htmlFor: "nt-t" }), t);
      add(l2, Object.assign(el("label", null, "내용"), { htmlFor: "nt-b" }), b);
      add(w, head("공지 올리기", "최근 공지 3개가 첫 화면 아래에 표시돼요."), l1, l2, add(el("div", "btn-row left"), post), msg);
      var rows = S.data.notices.slice().sort(function (a, c) { return c.time - a.time; }).map(function (n) {
        return [H.fmt(n.time), n.title, n.body, button("삭제", function () { if (confirm("이 공지를 삭제할까요?")) { S.data.notices.splice(S.data.notices.indexOf(n), 1); S.save(); show(); } }, "danger")];
      });
      add(w, el("h4", "sub-title", "올린 공지"), table(["일시", "제목", "내용", ""], rows, "올린 공지가 없어요."));
      return w;
    }

    /* --- 출석 --- */
    function vAtt() {
      var w = el("div"), A = S.data.attendance.slice().sort(function (a, b) { return b.time - a.time; });
      var dates = []; A.forEach(function (a) { if (dates.indexOf(a.date) < 0) dates.push(a.date); }); dates.sort();
      var ids = S.data.students.map(function (s) { return s.id; }), people = S.data.students.map(function (s) { return [s.id, s.name]; });
      A.forEach(function (a) { if (ids.indexOf(a.id) < 0) { ids.push(a.id); people.push([a.id, a.name]); } });
      var grid = [["학번", "이름"].concat(dates, ["출석 횟수"])];
      people.forEach(function (p) {
        var n = 0, r = [p[0], p[1]];
        dates.forEach(function (d) { var has = A.some(function (a) { return a.id === p[0] && a.date === d; }); if (has) n++; r.push(has ? "O" : ""); });
        grid.push(r.concat([n]));
      });
      add(w, head("출석", "총 " + A.length + "건 · 수업일 " + dates.length + "일"),
        add(el("div", "btn-row left"), csvBtn("출석부(학생×날짜) CSV", "출석부_" + stamp() + ".csv", grid),
          csvBtn("출석 기록 CSV", "출석기록_" + stamp() + ".csv", [["날짜", "시각", "학번", "이름"]].concat(A.map(function (a) { return [a.date, H.fmt(a.time).slice(11), a.id, a.name]; })))),
        table(["날짜", "시각", "학번", "이름"], A.map(function (a) { return [a.date, H.fmt(a.time).slice(11), a.id, a.name]; }), "출석 기록이 없어요."));
      return w;
    }

    /* --- 과제 --- */
    function vSubs() {
      var w = el("div"), L = S.data.subs.slice().sort(function (a, b) { return b.time - a.time; });
      var rows = L.map(function (s) {
        return [s.title, s.studentId, s.name, s.fileName, Math.max(1, Math.round(s.size / 1024)) + "KB", H.fmt(s.time), s.late ? "지각" : "",
          button("다운로드", function () { S.getFile(s.key).then(function (b) { if (b) H.download(s.studentId + "_" + s.name + "_" + s.fileName, b); else H.toast("파일을 찾을 수 없어요."); }); })];
      });
      add(w, head("과제 제출", "총 " + L.length + "건"),
        add(el("div", "btn-row left"), csvBtn("제출 내역 CSV", "과제제출_" + stamp() + ".csv",
          [["과제", "학번", "이름", "파일명", "크기(KB)", "제출시각", "지각"]].concat(L.map(function (s) { return [s.title, s.studentId, s.name, s.fileName, Math.round(s.size / 1024), H.fmt(s.time), s.late ? "지각" : ""]; })))),
        table(["과제", "학번", "이름", "파일", "크기", "제출 시각", "상태", ""], rows, "제출된 과제가 없어요."));
      return w;
    }

    /* --- 수강 신청 --- */
    function vEnroll() {
      var w = el("div"), L = S.data.enroll.slice().sort(function (a, b) { return b.time - a.time; });
      var hdr = ["제출시각", "이름", "학번", "소속 학과", "학년", "이메일", "연락처", "수강 동기"];
      var data = L.map(function (r) { return [H.fmt(r.time), r.name, r.studentId, r.dept, r.grade, r.email, r.phone, r.motive]; });
      add(w, head("수강 신청 내역", "총 " + L.length + "건"), add(el("div", "btn-row left"), csvBtn("신청 내역 CSV", "수강신청_" + stamp() + ".csv", [hdr].concat(data))),
        table(hdr.concat([""]), data.map(function (r, i) {
          return r.concat([button("삭제", function () { if (confirm(L[i].name + "님의 신청서를 삭제할까요?")) { S.data.enroll.splice(S.data.enroll.indexOf(L[i]), 1); S.save(); show(); } }, "danger")]);
        }), "제출된 신청서가 없어요."));
      return w;
    }

    /* --- 투표 --- */
    function vPoll() {
      var w = el("div"), P = S.config.poll, v = S.data.votes, total = 0;
      P.topics.forEach(function (t) { total += v[t.id] || 0; });
      var rows = P.topics.map(function (t) { var n = v[t.id] || 0; return [t.label, n, (total ? Math.round(n / total * 100) : 0) + "%"]; });
      add(w, head("투표 결과", "총 " + total + "표 (브라우저별 1표)"), add(el("div", "btn-row left"),
        csvBtn("투표 결과 CSV", "투표결과_" + stamp() + ".csv", [["주제", "득표수", "비율"]].concat(rows)),
        button("투표 초기화", function () { if (confirm("모든 득표 수를 0으로 되돌릴까요?")) { S.data.votes = {}; S.save(); show(); } }, "danger")),
        table(["주제", "득표수", "비율"], rows));
      return w;
    }

    /* --- 설정 · 백업 --- */
    function vFiles() {
      var w = el("div");
      function exportable() { var c = H.clone(S.config); delete c.security; return c; }
      add(w, head("설정 파일", "화면에서 저장한 설정을 파일로 내려받고, 나중에 다시 불러올 수 있어요. (비밀번호 정보는 포함되지 않아요.)"),
        add(el("div", "btn-row left"),
          button("설정 저장 (.json)", function () { var c = exportable(); c._format = "ku-course-site-config"; H.download("site-config_" + stamp() + ".json", JSON.stringify(c, null, 2), "application/json"); }, "primary"),
          button("설정 불러오기 (.json)", function () {
            pickFile(".json,application/json", function (t) {
              var o; try { o = JSON.parse(t); } catch (e) { H.toast("JSON 파일을 읽지 못했어요."); return; }
              if (!o || o._format !== "ku-course-site-config" || !Array.isArray(o.nav)) { H.toast("이 사이트에서 저장한 설정 파일이 아니에요."); return; }
              if (!confirm("불러온 설정으로 현재 설정을 바꿀까요?")) return;
              delete o._format; delete o.security;
              S.saveOverride(Object.assign({}, S.config, o, { security: S.config.security })); location.reload();
            });
          }),
          button("config.js 로 저장", function () {
            var c = H.clone(S.config);
            H.download("config.js", "/* 관리자 화면에서 내보낸 설정 (" + stamp() + ") */\nwindow.SITE_CONFIG = " + JSON.stringify(c, null, 2) + ";\n", "text/javascript");
          })),
        el("p", "muted", "config.js 로 저장한 파일을 사이트 폴더의 config.js 와 바꿔 올리면 모든 방문자에게 반영돼요. 비밀번호 해시도 함께 들어 있어요."));

      var pw1 = document.createElement("input"), pw2 = document.createElement("input"), pm = el("p", "form-msg");
      pw1.type = pw2.type = "password"; pw1.id = "np1"; pw2.id = "np2"; pw1.autocomplete = pw2.autocomplete = "new-password";
      var chg = button("비밀번호 변경", function () {
        if (pw1.value.length < 8) { pm.textContent = "8자 이상으로 정해 주세요."; return; }
        if (pw1.value !== pw2.value) { pm.textContent = "두 비밀번호가 달라요."; return; }
        var sec = { salt: "ku-" + H.uid(), adminHash: "" };
        sec.adminHash = S.hashPw(sec.salt, pw1.value, ADMIN_ITERS);
        S.config.security = sec;
        S.saveOverride(Object.assign({}, S.readOverride() || {}, { security: sec }));
        pw1.value = pw2.value = ""; pm.textContent = "변경했어요. 모든 방문자에 적용하려면 위에서 config.js 로 저장해 교체하세요.";
      }, "primary");
      var f1 = el("div", "field"), f2 = el("div", "field");
      add(f1, Object.assign(el("label", null, "새 비밀번호"), { htmlFor: "np1" }), pw1);
      add(f2, Object.assign(el("label", null, "새 비밀번호 확인"), { htmlFor: "np2" }), pw2);
      add(w, el("h4", "sub-title", "관리자 비밀번호 변경"), f1, f2, add(el("div", "btn-row left"), chg), pm);

      add(w, el("h4", "sub-title", "데이터 백업 · 복원"),
        el("p", "muted", "수강생, 공지, 출석, 신청, 투표 기록을 한 파일로 백업해요. 과제 첨부 파일은 포함되지 않으니 ‘과제’ 탭에서 따로 내려받으세요."),
        add(el("div", "btn-row left"),
          button("데이터 백업 (.json)", function () { H.download("site-data_" + stamp() + ".json", JSON.stringify(Object.assign({ _format: "ku-course-site-data" }, S.data), null, 2), "application/json"); }),
          button("데이터 복원 (.json)", function () {
            pickFile(".json,application/json", function (t) {
              var o; try { o = JSON.parse(t); } catch (e) { H.toast("JSON 파일을 읽지 못했어요."); return; }
              if (!o || o._format !== "ku-course-site-data") { H.toast("이 사이트의 데이터 백업 파일이 아니에요."); return; }
              if (!confirm("현재 데이터를 백업 파일의 내용으로 바꿀까요?")) return;
              delete o._format; S.replaceData(o); H.toast("복원했어요."); show();
            });
          })));
      return w;
    }

    show("edit");
  }
})();
