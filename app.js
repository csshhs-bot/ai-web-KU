/* config.js 의 내용을 읽어 페이지를 그립니다. 내용 수정은 config.js 에서 하세요. */
(function () {
  "use strict";
  var C = (window.Store && window.Store.config) || window.SITE_CONFIG;
  if (!C) { document.body.textContent = "config.js 를 불러오지 못했습니다."; return; }
  var el = window.H.el, add = window.H.add;

  function sectionHead(d) {
    var h = el("div", "section-head");
    add(h, el("h2", null, d.title));
    if (d.subtitle) add(h, el("p", null, d.subtitle));
    return h;
  }
  function block(id, data, body) {
    var s = el("section", "block");
    s.id = id;
    var c = el("div", "container");
    add(c, sectionHead(data), body);
    s.appendChild(c);
    return s;
  }

  /* ---- 문서 제목 / 헤더 ---- */
  document.title = C.pageTitle || (C.courseName + " | " + C.university);

  var brand = document.getElementById("brand");
  add(brand, el("span", null, "🌸"), el("span", "brand-text", C.courseName === "***" ? C.university + " " + C.department : "「" + C.courseName + "」"));
  if (C.version) brand.appendChild(el("span", "ver", C.version));

  var nav = document.getElementById("nav");
  C.nav.forEach(function (n) {
    if (n.menu === false) return;
    var a = el("a", null, n.label);
    a.href = "#" + n.id;
    a.dataset.target = n.id;
    nav.appendChild(a);
  });

  /* ---- 첫 화면 ---- */
  var hero = document.getElementById("hero");
  var hi = el("div", "hero-inner");
  var h1 = el("h1");
  add(h1, el("span", "dept", C.university + " " + C.department), document.createTextNode("「" + C.courseName + "」"));
  if (C.version) h1.appendChild(el("span", "ver", C.version));
  add(hi, el("span", "eyebrow", C.hero.eyebrow), h1, el("p", "subtitle", C.hero.subtitle), el("p", "desc", C.hero.description));
  var badges = el("div", "badges");
  C.hero.badges.forEach(function (b) { badges.appendChild(el("span", "badge", b)); });
  var btns = el("div", "btn-row");
  C.hero.buttons.forEach(function (b) {
    var a = el("a", "btn" + (b.primary ? " primary" : ""), b.label);
    a.href = "#" + b.target;
    btns.appendChild(a);
  });
  add(hi, badges, btns);
  hero.appendChild(hi);

  /* ---- 섹션 빌더: 수강 안내 / FAQ / 교수자 (나머지는 course.js, features.js 에서 제공) ---- */
  var builders = {
    guide: function (d) {
      var wrap = el("div");
      var g = el("div", "grid cols-2");

      var c1 = el("article", "card");
      add(c1, el("h3", "card-title", "강좌 정보"));
      var dl = el("dl", "info-list");
      d.info.forEach(function (i) {
        var row = el("div");
        add(row, el("dt", null, i.label), el("dd", null, i.value));
        dl.appendChild(row);
      });
      c1.appendChild(dl);

      var c2 = el("article", "card");
      add(c2, el("h3", "card-title", d.evaluationTitle));
      d.evaluation.forEach(function (e) {
        var row = el("div", "eval-row");
        var label = el("div", "label");
        add(label, el("span", null, e.item), el("span", null, e.percent + "%"));
        var bar = el("div", "bar");
        var fill = document.createElement("i");
        fill.dataset.w = e.percent;
        bar.appendChild(fill);
        add(row, label, bar);
        c2.appendChild(row);
      });

      add(g, c1, c2);
      var n = el("article", "card notice");
      add(n, el("h3", "card-title", "유의 사항"));
      var ul = el("ul");
      d.notices.forEach(function (t) { ul.appendChild(el("li", null, t)); });
      add(n, ul);
      return add(wrap, g, n);
    },
    faq: function (d) {
      var list = el("div", "faq-list");
      d.items.forEach(function (f) {
        var det = el("details", "card faq-item");
        add(det, el("summary", null, f.q), el("div", "answer", f.a));
        list.appendChild(det);
      });
      return list;
    },
    instructor: function (d) {
      var g = el("div", "grid " + (d.members.length > 1 ? "cols-2" : ""));
      g.style.maxWidth = d.members.length > 1 ? "none" : "820px";
      g.style.margin = "0 auto";
      d.members.forEach(function (m) {
        var card = el("article", "card prof");
        var av = el("div", "avatar");
        if (m.photo) {
          var img = document.createElement("img");
          img.src = m.photo; img.alt = m.name;
          av.appendChild(img);
        } else {
          av.textContent = m.name.charAt(0);
        }
        var info = el("div");
        add(info, el("h3", null, m.name), el("p", "role", m.role), el("p", null, m.bio));
        var tags = el("div", "tags");
        (m.tags || []).forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
        add(info, tags);
        var ul = el("ul", "contacts");
        (m.contacts || []).forEach(function (c) {
          var li = el("li");
          add(li, el("b", null, c.label));
          if (c.href) {
            var a = el("a", null, c.value);
            a.href = c.href;
            li.appendChild(a);
          } else {
            li.appendChild(document.createTextNode(c.value));
          }
          ul.appendChild(li);
        });
        add(info, ul);
        add(card, av, info);
        g.appendChild(card);
      });
      return g;
    }
  };
  Object.keys(window.SiteBuilders || {}).forEach(function (k) { builders[k] = window.SiteBuilders[k]; });

  /* ---- 첫 화면 아래 띠: 한눈에 보기 / 통계 ---- */
  var ob = document.getElementById("overviewBand"), sb = document.getElementById("statsBand");
  if (ob && C.overview && builders.overview) ob.appendChild(builders.overview(C.overview));
  if (sb && C.stats && builders.stats) sb.appendChild(builders.stats(C.stats));

  /* ---- 본문 섹션 (교수자는 맨 아래 푸터에 표시) ---- */
  var sections = document.getElementById("sections");
  C.nav.forEach(function (n) {
    if (n.id === "instructor") return;
    if (builders[n.id] && C[n.id]) sections.appendChild(block(n.id, C[n.id], builders[n.id](C[n.id])));
  });

  /* ---- 푸터: 교수자 사진 · 소개 · 연락처 ---- */
  var footer = document.getElementById("footer");
  if (C.instructor) {
    footer.id = "instructor";
    var fc = el("div", "container");
    add(fc, sectionHead(C.instructor), builders.instructor(C.instructor));
    footer.appendChild(fc);
  }
  footer.appendChild(el("p", "footer-text", C.footerText));

  /* ---- 모바일 메뉴 ---- */
  var toggle = document.getElementById("menuToggle");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---- 스크롤: 헤더 그림자 / 맨 위로 버튼 / 현재 메뉴 강조 ---- */
  var header = document.getElementById("siteHeader");
  var toTop = document.getElementById("toTop");
  var links = nav.querySelectorAll("a");
  var linked = {};
  C.nav.forEach(function (n) { if (n.menu !== false) linked[n.id] = true; });
  var ids = C.nav.map(function (n) { return n.id; }).filter(function (id) { return document.getElementById(id); });

  function onScroll() {
    var y = window.pageYOffset;
    header.classList.toggle("scrolled", y > 8);
    toTop.classList.toggle("show", y > 400);
    var current = "";
    var line = header.offsetHeight + 80;
    ids.forEach(function (id) {
      /* 메뉴에 없는 섹션(수강 준비물, 투표)은 가장 가까운 앞 메뉴를 계속 강조 */
      if (linked[id] && document.getElementById(id).getBoundingClientRect().top <= line) current = id;
    });
    if (y + window.innerHeight >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
    links.forEach(function (a) { a.classList.toggle("active", a.dataset.target === current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.getElementById("brand").addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---- 평가 막대 애니메이션 ---- */
  var fills = document.querySelectorAll(".bar i");
  function grow(f) { f.style.width = f.dataset.w + "%"; }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { grow(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.3 });
    fills.forEach(function (f) { io.observe(f); });
  } else {
    fills.forEach(grow);
  }

  if (window.Features) window.Features.init(C);

  /* ---- 벚꽃잎 (움직임 줄이기 설정 시 생략) ---- */
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var box = document.getElementById("petals");
    var count = window.innerWidth < 760 ? 10 : 18;
    for (var i = 0; i < count; i++) {
      var p = el("span", "petal");
      var size = 8 + Math.random() * 10;
      p.style.left = Math.random() * 100 + "%";
      p.style.width = p.style.height = size + "px";
      p.style.animationDuration = 10 + Math.random() * 12 + "s";
      p.style.animationDelay = -Math.random() * 20 + "s";
      p.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
      box.appendChild(p);
    }
  }
})();
