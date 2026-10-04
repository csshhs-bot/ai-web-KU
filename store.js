/* 공통 도구(H)와 저장소(Store). 서버가 없으므로 데이터는 이 브라우저의 localStorage / IndexedDB 에 저장됩니다. */
(function () {
  "use strict";

  /* ================= 공통 도구 ================= */
  var H = (window.H = {});
  H.el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== "") e.textContent = text;
    return e;
  };
  H.add = function (parent) {
    for (var i = 1; i < arguments.length; i++) if (arguments[i]) parent.appendChild(arguments[i]);
    return parent;
  };
  H.clear = function (n) { while (n.firstChild) n.removeChild(n.firstChild); };
  H.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  H.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  H.today = function () { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  H.fmt = function (ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  };

  H.toast = function (msg) {
    var t = H.el("div", "toast", msg);
    t.setAttribute("role", "status");
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add("out"); }, 2600);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3100);
  };

  H.download = function (name, data, type) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: type || "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 을 붙인 CSV. 수식으로 해석될 수 있는 값은 앞에 ' 를 붙여 무력화 */
  H.csv = function (rows) {
    function cell(v) {
      v = v == null ? "" : String(v);
      if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
      return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }
    return "﻿" + rows.map(function (r) { return r.map(cell).join(","); }).join("\r\n");
  };

  H.modal = function (title, body, opts) {
    opts = opts || {};
    var prev = document.activeElement;
    var ov = H.el("div", "modal-overlay");
    var box = H.el("div", "modal");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    var h = H.el("h3", "modal-title", title);
    h.id = "m" + H.uid();
    box.setAttribute("aria-labelledby", h.id);
    var x = H.el("button", "modal-x", "×");
    x.type = "button";
    x.setAttribute("aria-label", "닫기");
    H.add(box, x, h, body);
    ov.appendChild(box);
    document.body.appendChild(ov);
    function close() {
      if (!ov.parentNode) return;
      document.removeEventListener("keydown", key, true);
      ov.remove();
      if (prev && prev.focus) prev.focus({ preventScroll: true });
      if (opts.onClose) opts.onClose();
    }
    function key(e) {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
    }
    ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(); });
    x.addEventListener("click", close);
    document.addEventListener("keydown", key, true);
    var first = box.querySelector("input,textarea,select,.btn.primary");
    (first || x).focus({ preventScroll: true });
    return { close: close, box: box };
  };

  /* ================= SHA-256 (동기식, 외부 라이브러리 없음) ================= */
  var K = null, H0 = null;
  function init() {
    K = []; H0 = [];
    var primes = [], n = 2, i;
    while (primes.length < 64) {
      var ok = true;
      for (i = 0; i < primes.length; i++) if (n % primes[i] === 0) { ok = false; break; }
      if (ok) primes.push(n);
      n++;
    }
    for (i = 0; i < 64; i++) K[i] = Math.floor((Math.pow(primes[i], 1 / 3) % 1) * 4294967296);
    for (i = 0; i < 8; i++) H0[i] = Math.floor((Math.pow(primes[i], 0.5) % 1) * 4294967296);
  }
  function ror(x, n) { return (x >>> n) | (x << (32 - n)); }
  function sha256(str) {
    if (!K) init();
    var s = unescape(encodeURIComponent(str)), b = [], i, j;
    for (i = 0; i < s.length; i++) b.push(s.charCodeAt(i));
    var bits = b.length * 8;
    b.push(0x80);
    while (b.length % 64 !== 56) b.push(0);
    for (i = 7; i >= 0; i--) b.push(i > 3 ? 0 : (bits >>> (i * 8)) & 255);
    var h = H0.slice(), w = new Array(64);
    for (var off = 0; off < b.length; off += 64) {
      for (i = 0; i < 16; i++) w[i] = (b[off + 4 * i] << 24) | (b[off + 4 * i + 1] << 16) | (b[off + 4 * i + 2] << 8) | b[off + 4 * i + 3];
      for (i = 16; i < 64; i++) {
        var s0 = ror(w[i - 15], 7) ^ ror(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = ror(w[i - 2], 17) ^ ror(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = h[0], bb = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (i = 0; i < 64; i++) {
        var S1 = ror(e, 6) ^ ror(e, 11) ^ ror(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (hh + S1 + ch + K[i] + w[i]) | 0;
        var S0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
        var maj = (a & bb) ^ (a & c) ^ (bb & c);
        var t2 = (S0 + maj) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + bb) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
    }
    var out = "";
    for (j = 0; j < 8; j++) out += ("00000000" + (h[j] >>> 0).toString(16)).slice(-8);
    return out;
  }

  /* ================= 저장소 ================= */
  var S = (window.Store = {});
  S.sha256 = sha256;
  /* 비밀번호 해시: 솔트 + 반복 해시. 평문은 어디에도 저장하지 않습니다. */
  S.hashPw = function (salt, pw, iters) {
    var h = sha256(salt + ":" + pw);
    for (var i = 1; i < iters; i++) h = sha256(h + ":" + salt);
    return h;
  };

  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  S.lget = lget; S.lset = lset;
  S.lremove = function (k) { try { localStorage.removeItem(k); } catch (e) {} };
  S.sget = function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  S.sset = function (k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} };

  /* ----- 설정: config.js(원본) 위에 관리자 화면에서 고친 값(override)을 덮어씀 ----- */
  var CKEY = "kuc:config";
  S.baseConfig = window.SITE_CONFIG || {};
  function readOverride() { try { return JSON.parse(lget(CKEY)) || null; } catch (e) { return null; } }
  S.hasOverride = function () { return !!readOverride(); };
  S.config = Object.assign({}, S.baseConfig, readOverride() || {});
  S.readOverride = readOverride;
  S.saveOverride = function (obj) { return lset(CKEY, JSON.stringify(obj)); };
  S.clearOverride = function () { S.lremove(CKEY); };

  /* 과제 목록: 커리큘럼의 각 주차(assignment)에서 자동으로 만든다. id 가 비어 있으면 주차 번호로 대신한다. */
  S.assignments = function () {
    var out = [];
    ((S.config.curriculum || {}).weeks || []).forEach(function (w, i) {
      var a = w.assignment;
      if (a && a.title && a.due && !isNaN(new Date(a.due))) {
        out.push({ id: a.id || "w" + (i + 1), week: i + 1, title: (i + 1) + "주차 · " + a.title, name: a.title, description: a.description || "", due: a.due });
      }
    });
    return out;
  };

  /* ----- 데이터 ----- */
  var DKEY = "kuc:data";
  var DEF = { votes: {}, enroll: [], students: [], notices: [], attendance: [], subs: [] };
  function load() {
    var d = null;
    try { d = JSON.parse(lget(DKEY)); } catch (e) {}
    return Object.assign(H.clone(DEF), d && typeof d === "object" ? d : {});
  }
  S.data = load();
  var listeners = [];
  S.onChange = function (fn) { listeners.push(fn); };
  function fire() { listeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } }); }
  var bc = null;
  try { bc = new BroadcastChannel("kuc"); bc.onmessage = function () { S.data = load(); fire(); }; } catch (e) {}
  window.addEventListener("storage", function (e) { if (e.key === DKEY) { S.data = load(); fire(); } });
  S.save = function () {
    if (!lset(DKEY, JSON.stringify(S.data))) { H.toast("저장 공간이 부족해 저장하지 못했습니다."); return false; }
    try { if (bc) bc.postMessage("change"); } catch (e) {}
    fire();
    return true;
  };
  S.replaceData = function (obj) { S.data = Object.assign(H.clone(DEF), obj); return S.save(); };

  /* ----- 첨부 파일(과제): IndexedDB ----- */
  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open("kuc-files", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("f"); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function tx(mode, fn) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction("f", mode), req = fn(t.objectStore("f"));
        t.oncomplete = function () { res(req && req.result); };
        t.onerror = t.onabort = function () { rej(t.error); };
      });
    });
  }
  S.putFile = function (key, blob) { return tx("readwrite", function (s) { return s.put(blob, key); }); };
  S.getFile = function (key) { return tx("readonly", function (s) { return s.get(key); }); };
  S.delFile = function (key) { return tx("readwrite", function (s) { return s.delete(key); }); };
})();
