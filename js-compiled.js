var g, aa = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
  if (c.get || c.set) {
    throw new TypeError("ES3 does not support getters and setters.");
  }
  a != Array.prototype && a != Object.prototype && (a[b] = c.value);
}, h = "undefined" != typeof window && window === this ? this : "undefined" != typeof global && null != global ? global : this;
function ba() {
  ba = function() {
  };
  h.Symbol || (h.Symbol = ca);
}
var da = 0;
function ca(a) {
  return "jscomp_symbol_" + (a || "") + da++;
}
function m() {
  ba();
  var a = h.Symbol.iterator;
  a || (a = h.Symbol.iterator = h.Symbol("iterator"));
  "function" != typeof Array.prototype[a] && aa(Array.prototype, a, {configurable:!0, writable:!0, value:function() {
    return ea(this);
  }});
  m = function() {
  };
}
function ea(a) {
  var b = 0;
  return fa(function() {
    return b < a.length ? {done:!1, value:a[b++]} : {done:!0};
  });
}
function fa(a) {
  m();
  a = {next:a};
  a[h.Symbol.iterator] = function() {
    return this;
  };
  return a;
}
function n(a) {
  m();
  var b = a[Symbol.iterator];
  return b ? b.call(a) : ea(a);
}
function p(a, b) {
  this.x = a;
  this.y = b;
}
function r(a, b) {
  return !!b && a.x == b.x && a.y == b.y;
}
function t(a, b) {
  return new p(a.x - b.x, a.y - b.y);
}
p.prototype.add = function(a) {
  return new p(this.x + a.x, this.y + a.y);
};
p.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
p.prototype.scale = function(a) {
  return new p(this.x * a, this.y * a);
};
var u = ["+", "\u2012", "\u2013", "-", "|"], v = [">", "<", "^", "v"], ga = u.concat(v), w = "ontouchstart" in window || "onmsgesturechange" in window, x = new p(-1, 0), y = new p(1, 0), z = new p(0, -1), A = new p(0, 1), B = [x, y, z, A];
function C(a, b) {
  this.a = Math.min(a.x, b.x);
  this.b = Math.min(a.y, b.y);
  this.c = Math.max(a.x, b.x);
  this.f = Math.max(a.y, b.y);
}
function ha(a) {
  return new p(a.a, a.b);
}
C.prototype.contains = function(a) {
  return a.x >= this.a && a.x <= this.c && a.y >= this.b && a.y <= this.f;
};
function ia() {
  this.a = this.value = null;
}
function D(a) {
  return null != a.a ? a.a : a.value;
}
function F(a) {
  return -1 != ga.indexOf(D(a));
}
function G(a) {
  return null == a.value && null == a.a;
}
function ja(a, b, c, d) {
  this.a = a;
  this.b = b;
  this.f = c;
  this.c = d;
  this.l = this.g = this.u = this.h = !1;
}
function H(a) {
  return a.a + a.b + a.f + a.c;
}
function ka(a, b) {
  this.position = a;
  this.value = b;
}
function la(a, b) {
  this.position = a;
  this.a = b;
}
;function J(a) {
  for (var b = 0;b < a.a.length;b++) {
    for (var c = 0;c < a.a[b].length;c++) {
      null != D(a.a[b][c]) && K(a, new p(b, c), "\u2009");
    }
  }
  M(a);
}
function N(a, b) {
  return a.a[b.x][b.y];
}
function K(a, b, c) {
  var d = N(a, b);
  a.b.push(new la(b, d));
  d.a = c;
  a.c = !0;
}
function O(a, b, c) {
  D(N(a, b)) != c && K(a, b, c);
}
function P(a) {
  for (var b = n(a.b), c = b.next();!c.done;c = b.next()) {
    c.value.a.a = null;
  }
  a.b.length = 0;
}
function Q(a, b) {
  var c = N(a, b), d = null != c.a ? c.a : c.value, e = -1 != u.indexOf(d), f = -1 != v.indexOf(d);
  if (!e && !f) {
    return d;
  }
  c = R(a, b);
  if (e && c.a && c.b && !c.f && !c.c) {
    return "-";
  }
  if (e && !c.a && !c.b && c.f && c.c) {
    return "|";
  }
  if (4 == H(c)) {
    return "-";
  }
  if (f && 3 == H(c)) {
    if (!c.a) {
      return "<";
    }
    if (!c.f) {
      return "^";
    }
    if (!c.c) {
      return "v";
    }
    if (!c.b) {
      return ">";
    }
  }
  if ((e || f) && 3 == H(c)) {
    c.h = F(N(a, b.add(x).add(z)));
    c.u = F(N(a, b.add(y).add(z)));
    c.g = F(N(a, b.add(x).add(A)));
    c.l = F(N(a, b.add(y).add(A)));
    if (!c.b && c.h && c.g || !c.a && c.u && c.l) {
      return "|";
    }
    if (!c.c && c.h && c.u || !c.f && c.l && c.g) {
      return "-";
    }
    d = G(N(a, b.add(x).add(z)));
    e = G(N(a, b.add(y).add(z)));
    if (c.f && c.a && c.b && (!d || !e)) {
      return "-";
    }
    d = G(N(a, b.add(x).add(A)));
    e = G(N(a, b.add(y).add(A)));
    return !(c.c && c.a && c.b) || d && e ? "+" : "-";
  }
  if (f && 1 == H(c)) {
    if (c.a) {
      return ">";
    }
    if (c.f) {
      return "v";
    }
    if (c.c) {
      return "^";
    }
    if (c.b) {
      return "<";
    }
  }
  return d;
}
function R(a, b) {
  var c = F(N(a, b.add(x))), d = F(N(a, b.add(y))), e = F(N(a, b.add(z))), f = F(N(a, b.add(A)));
  return new ja(c, d, e, f);
}
function M(a, b) {
  var c = [], d = a.b.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), e = a.b.filter(function(a, b) {
    return d.indexOf(d[b]) == b;
  });
  a.b.length = 0;
  for (var e = n(e), f = e.next();!f.done;f = e.next()) {
    var k = f.value, f = k.position, k = k.a;
    c.push(new ka(f, null != k.value ? k.value : " "));
    var l = D(k);
    if ("\u2009" == l || " " == l) {
      l = null;
    }
    F(k) && (l = Q(a, f));
    k.a = null;
    k.value = l;
  }
  e = b ? a.f : a.g;
  0 < c.length && (50 < e.length && e.shift(), e.push(c));
  a.c = !0;
}
function ma(a) {
  if (a.g.length) {
    var b = a.g.pop(), c;
    for (c in b) {
      var d = b[c];
      K(a, d.position, d.value);
    }
    M(a, !0);
  }
}
function na(a) {
  if (a.f.length) {
    for (var b = a.f.pop(), b = n(b), c = b.next();!c.done;c = b.next()) {
      c = c.value, K(a, c.position, c.value);
    }
    M(a);
  }
}
function S(a) {
  for (var b = new p(Number.MAX_VALUE, Number.MAX_VALUE), c = new p(-1, -1), d = 0;d < a.a.length;d++) {
    for (var e = 0;e < a.a[d].length;e++) {
      null != D(a.a[d][e]) && (d < b.x && (b.x = d), e < b.y && (b.y = e), d > c.x && (c.x = d), e > c.y && (c.y = e));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var f = "", e = b.y;e <= c.y;e++) {
    for (var k = "", d = b.x;d <= c.x;d++) {
      var l = Q(a, new p(d, e)), k = k + (null == l || "\u2009" == l ? " " : l);
    }
    f += k.replace(/\s+$/, "") + "\n";
  }
  return f;
}
function oa(a, b, c) {
  b = b.split("\n");
  for (var d = new p(0, Math.round(b.length / 2)), e = 0;e < b.length;e++) {
    d.x = Math.max(d.x, Math.round(b[e].length / 2));
  }
  for (e = 0;e < b.length;e++) {
    for (var f = b[e], k = 0;k < f.length;k++) {
      var l = f.charAt(k);
      -1 != u.indexOf(l) && (l = "+");
      -1 != v.indexOf(l) && (l = "^");
      K(a, t((new p(k, e)).add(c), d), l);
    }
  }
}
;function pa(a) {
  a.b.width = document.documentElement.clientWidth;
  a.b.height = document.documentElement.clientHeight;
  a.f = !0;
}
function qa(a) {
  if (a.f || a.g.c) {
    a.f = !1, a.g.c = !1, ra(a);
  }
  window.requestAnimationFrame(function() {
    qa(a);
  });
}
function ra(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.b.width, a.b.height);
  b.scale(a.c, a.c);
  b.translate(a.b.width / 2 / a.c, a.b.height / 2 / a.c);
  var c = t(T(a, new p(0, 0)), new p(3, 3)), d = T(a, new p(a.b.width, a.b.height)).add(new p(3, 3));
  c.x = Math.max(0, Math.min(c.x, 2E3));
  d.x = Math.max(0, Math.min(d.x, 2E3));
  c.y = Math.max(0, Math.min(c.y, 600));
  d.y = Math.max(0, Math.min(d.y, 600));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var e = c.x;e < d.x;e++) {
    b.moveTo(9 * e - a.a.x, 0 - a.a.y), b.lineTo(9 * e - a.a.x, 17 * a.g.a.length - a.a.y);
  }
  for (e = c.y;e < d.y;e++) {
    b.moveTo(0 - a.a.x, 17 * e - a.a.y), b.lineTo(9 * a.g.a.length - a.a.x, 17 * e - a.a.y);
  }
  a.context.stroke();
  e = !a.h;
  b.font = "15px Courier New";
  for (var f = c.x;f < d.x;f++) {
    for (var k = c.y;k < d.y;k++) {
      var l = N(a.g, new p(f, k));
      if (F(l) || null != l.a && " " != D(l)) {
        a.context.fillStyle = null != l.a ? "#DEF" : "#F5F5F5", b.fillRect(9 * f - a.a.x, 17 * (k - 1) - a.a.y, 9, 17);
      }
      var E = Q(a.g, new p(f, k));
      null == E || F(l) && !e || (a.context.fillStyle = "#000000", b.fillText(E, 9 * f - a.a.x, 17 * k - a.a.y - 3));
    }
  }
  if (a.h) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (e = c.x;e < d.x;e++) {
      for (l = !1, f = c.y;f < d.y;f++) {
        k = N(a.g, new p(e, f)), F(k) && f != d.y - 1 || !l || (b.moveTo(9 * e - a.a.x + 4.5, 17 * l - a.a.y - 8.5), b.lineTo(9 * e - a.a.x + 4.5, 17 * (f - 1) - a.a.y - 8.5), l = !1), F(k) && !l && (l = f);
      }
    }
    for (f = c.y;f < d.y;f++) {
      for (l = !1, e = c.x;e < d.x;e++) {
        k = N(a.g, new p(e, f)), F(k) && e != d.x - 1 || !l || (b.moveTo(9 * l - a.a.x + 4.5, 17 * f - a.a.y - 8.5), b.lineTo(9 * (e - 1) - a.a.x + 4.5, 17 * f - a.a.y - 8.5), l = !1), F(k) && !l && (l = e);
      }
    }
    a.context.stroke();
  }
}
function T(a, b) {
  var c = new p((b.x - a.b.width / 2) / a.c + a.a.x, (b.y - a.b.height / 2) / a.c + a.a.y);
  return new p(Math.min(Math.max(1, Math.round((c.x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round((c.y + 8.5) / 17)), 598));
}
;function U(a, b, c, d, e) {
  e = void 0 === e ? "+" : e;
  var f = new C(b, c), k = f.a, l = f.b, E = f.c, f = f.f, I = d ? c.x : b.x;
  for (d = d ? b.y : c.y;k++ < E;) {
    var q = new p(k, d), L = R(a, new p(k, d));
    " " == e && 2 == L.f + L.c || O(a, q, e);
  }
  for (;l++ < f;) {
    q = new p(I, l), L = R(a, new p(I, l)), " " == e && 2 == L.a + L.b || O(a, q, e);
  }
  K(a, b, e);
  K(a, c, e);
  O(a, new p(I, d), e);
}
function V(a) {
  this.a = a;
  this.b = null;
}
g = V.prototype;
g.start = function(a) {
  this.b = a;
};
g.i = function(a) {
  P(this.a);
  U(this.a, this.b, a, !0);
  U(this.a, this.b, a, !1);
};
g.m = function() {
  M(this.a);
};
g.o = function() {
  return "crosshair";
};
g.j = function() {
};
function W(a, b) {
  this.a = a;
  this.c = b;
  this.b = null;
}
g = W.prototype;
g.start = function(a) {
  this.b = a;
};
g.i = function(a) {
  P(this.a);
  var b = R(this.a, this.b), c = R(this.a, a);
  U(this.a, this.b, a, b.f && b.c || c.a && c.b);
  this.c && K(this.a, a, "^");
};
g.m = function() {
  M(this.a);
};
g.o = function() {
  return "crosshair";
};
g.j = function() {
};
function sa(a, b) {
  this.a = a;
  this.value = b;
  w && ($("#freeform-tool-input").val(""), $("#freeform-tool-input").hide(0, function() {
    $("#freeform-tool-input").show(0, function() {
      $("#freeform-tool-input").focus();
    });
  }));
}
g = sa.prototype;
g.start = function(a) {
  K(this.a, a, this.value);
};
g.i = function(a) {
  K(this.a, a, this.value);
};
g.m = function() {
  M(this.a);
};
g.o = function() {
  return "crosshair";
};
g.j = function(a) {
  w && (this.value = $("#freeform-tool-input").val().substr(0, 1), $("#freeform-tool-input").blur(), $("#freeform-tool-input").hide(0));
  1 == a.length && (this.value = a);
};
function ta(a) {
  this.b = a;
  this.c = this.a = null;
}
g = ta.prototype;
g.start = function(a) {
  M(this.b);
  $("#text-tool-input").val("");
  this.a = a;
  a = D(N(this.b, this.a));
  K(this.b, this.a, null == a ? "\u2009" : a);
};
g.i = function() {
};
g.m = function() {
  null != this.a && (this.c = this.a, this.a = null, $("#text-tool-widget").hide(0, function() {
    $("#text-tool-widget").show(0, function() {
      $("#text-tool-input").focus();
    });
  }));
};
g.o = function() {
  return "pointer";
};
g.j = function() {
  var a = $("#text-tool-input").val();
  P(this.b);
  for (var b = 0, c = 0, d = 0;d < a.length;d++) {
    "\n" == a[d] ? (c++, b = 0) : (K(this.b, this.c.add(new p(b, c)), a[d]), b++);
  }
};
function X(a) {
  this.c = a;
  this.a = this.b = null;
}
g = X.prototype;
g.start = function(a) {
  this.b = a;
  this.i(a);
};
g.i = function(a) {
  P(this.c);
  this.a = a;
  a = Math.min(this.b.y, this.a.y);
  for (var b = Math.max(this.b.x, this.a.x), c = Math.max(this.b.y, this.a.y), d = Math.min(this.b.x, this.a.x);d <= b;d++) {
    for (var e = a;e <= c;e++) {
      K(this.c, new p(d, e), "\u2009");
    }
  }
};
g.m = function() {
  M(this.c);
};
g.o = function() {
  return "crosshair";
};
g.j = function() {
};
function ua(a) {
  this.a = a;
  this.b = null;
  this.c = [];
}
g = ua.prototype;
g.start = function(a) {
  var b;
  if (w) {
    if (F(N(this.a, a))) {
      b = a;
    } else {
      var c = B.concat([x.add(z), x.add(A), y.add(z), y.add(A)]);
      b = null;
      for (var d = 0, c = n(c), e = c.next();!e.done;e = c.next()) {
        var e = e.value, f = a.add(e), k = H(R(this.a, f));
        F(N(this.a, f)) && k > d && (b = e, d = k);
      }
      b = null == b ? a : a.add(b);
    }
  } else {
    b = a;
  }
  this.b = b;
  this.c = [];
  if (F(N(this.a, this.b))) {
    R(this.a, this.b);
    b = [];
    d = n(B);
    for (c = d.next();!c.done;c = d.next()) {
      for (c = c.value, e = va(this, this.b, c), e = n(e), f = e.next();!f.done;f = e.next()) {
        var f = f.value, k = 0 != c.x, l = -1 != v.indexOf(D(N(this.a, a))), E = -1 != v.indexOf(D(N(this.a, f)));
        if (1 == H(R(this.a, f))) {
          b.push({position:f, s:k, w:l, v:E});
        } else {
          for (var I = n(B), q = I.next();!q.done;q = I.next()) {
            q = q.value, 0 != c.add(q).length() && 2 != c.add(q).length() && (q = va(this, f, q), q.length && (q = q[0], b.push({position:q, s:k, w:l, A:E, v:-1 != v.indexOf(D(N(this.a, q)))})));
          }
        }
      }
    }
    this.c = b;
    this.i(this.b);
  }
};
g.i = function(a) {
  P(this.a);
  for (var b = n(this.c), c = b.next();!c.done;c = b.next()) {
    var d = c.value;
    U(this.a, this.b, d.position, d.s, " ");
  }
  for (var e in this.c) {
    U(this.a, a, d.position, d.s);
  }
  b = n(this.c);
  for (c = b.next();!c.done;c = b.next()) {
    d = c.value, d.w && K(this.a, a, "^"), d.v && K(this.a, d.position, "^"), d.A && K(this.a, new p(d.s ? d.position.x : a.x, d.s ? a.y : d.position.y), "^");
  }
};
g.m = function() {
  M(this.a);
};
function va(a, b, c) {
  for (var d = new p(b.x, b.y), e = [];;) {
    var f = d.add(c);
    if (!F(N(a.a, f))) {
      return r(b, d) || e.push(d), e;
    }
    d = f;
    3 == H(R(a.a, d)) && e.push(d);
  }
}
g.o = function(a) {
  return F(N(this.a, a)) ? "pointer" : "default";
};
g.j = function() {
};
function wa(a) {
  this.c = a;
  this.g = this.f = this.b = this.a = null;
  this.h = !0;
  this.l = [];
}
g = wa.prototype;
g.start = function(a) {
  this.a && this.b && (new C(this.a, this.b)).contains(a) ? (this.f = a, xa(this), ya(this, a)) : (this.a = a, this.b = null, this.h = !1, this.i(a));
};
function xa(a) {
  var b = a.c.b.filter(function(a) {
    return null != D(a.a) && "\u2009" != D(a.a);
  }), c = ha(new C(a.a, a.b));
  a.l = b.map(function(a) {
    return new ka(t(a.position, c), D(a.a));
  });
}
g.i = function(a) {
  if (this.f) {
    ya(this, a);
  } else {
    if (1 != this.h) {
      this.b = a;
      P(this.c);
      a = new C(this.a, a);
      for (var b = a.a;b <= a.c;b++) {
        for (var c = a.b;c <= a.f;c++) {
          var d = new p(b, c), e = D(N(this.c, d));
          K(this.c, d, null == e ? "\u2009" : e);
        }
      }
    }
  }
};
function ya(a, b) {
  a.g = b;
  P(a.c);
  var c = new X(a.c);
  c.start(a.a);
  c.i(a.b);
  c = t(a.g, a.f).add(ha(new C(a.a, a.b)));
  za(a, c);
}
function za(a, b) {
  for (var c = n(a.l), d = c.next();!d.done;d = c.next()) {
    var d = d.value, e = d.value;
    K(a.c, d.position.add(b), e);
  }
}
g.m = function() {
  this.f && (M(this.c), this.b = this.a = null);
  this.g = this.f = null;
  this.h = !0;
};
g.o = function(a) {
  return this.a && this.b && (new C(this.a, this.b)).contains(a) ? "pointer" : "default";
};
g.j = function(a) {
  if (this.a && this.b && ("<copy>" != a && "<cut>" != a || xa(this), "<cut>" == a)) {
    var b = new X(this.c);
    b.start(this.a);
    b.i(this.b);
    M(this.c);
  }
  "<paste>" == a && (za(this, this.a), M(this.c));
};
function Aa(a, b) {
  var c = T(a.a, b);
  a.f || (a.f = c);
  r(c, a.f) || (a.a.b.style.cursor = a.c.o(c));
  2 != a.mode || r(c, a.f) || a.c.i(c);
  if (1 == a.mode) {
    var d = a.a, e = a.h.add(t(a.g, b).scale(1 / a.a.c));
    d.a = e;
    d.f = !0;
  }
  a.f = c;
}
function Y(a) {
  2 == a.mode && a.c.m();
  a.mode = 0;
  a.g = null;
  a.h = null;
  a.f = null;
}
function Ba(a) {
  $(window).resize(function() {
    pa(a.a);
  });
  $("#draw-tools > button.tool").click(function(b) {
    $("#text-tool-widget").hide(0);
    b = b.target.id;
    $("#draw-tools > button.tool").removeClass("active");
    $("#" + b).toggleClass("active");
    $(".dialog").removeClass("visible");
    "box-button" == b && (a.c = new V(a.b));
    "line-button" == b && (a.c = new W(a.b, !1));
    "arrow-button" == b && (a.c = new W(a.b, !0));
    "freeform-button" == b && (a.c = new sa(a.b, "X"));
    "erase-button" == b && (a.c = new X(a.b));
    "move-button" == b && (a.c = new ua(a.b));
    "text-button" == b && (a.c = new ta(a.b));
    "select-button" == b && (a.c = new wa(a.b));
    M(a.b);
    a.a.b.focus();
  });
  $("#file-tools > button.tool").click(function(b) {
    b = b.target.id;
    $(".dialog").removeClass("visible");
    $("#" + b + "-dialog").toggleClass("visible");
    "import-button" == b && ($("#import-area").val(""), $("#import-area").focus());
    "export-button" == b && ($("#export-area").val(S(a.b)), $("#export-area").select());
    "clear-button" == b && J(a.b);
    "undo-button" == b && ma(a.b);
    "redo-button" == b && na(a.b);
  });
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  });
  $("#import-submit-button").click(function() {
    J(a.b);
    oa(a.b, $("#import-area").val(), T(a.a, new p(a.a.b.width / 2, a.a.b.height / 2)));
    M(a.b);
    $("#import-area").val("");
    $(".dialog").removeClass("visible");
  });
  $("#use-lines-button").click(function() {
    $(".dialog").removeClass("visible");
    var b = a.a;
    b.h = !0;
    b.f = !0;
  });
  $("#use-ascii-button").click(function() {
    $(".dialog").removeClass("visible");
    var b = a.a;
    b.h = !1;
    b.f = !0;
  });
  $(window).keypress(function(b) {
    b.ctrlKey || b.metaKey || 13 == b.keyCode || a.c.j(String.fromCharCode(b.keyCode));
  });
  $(window).keydown(function(b) {
    var c = null;
    if (b.ctrlKey || b.metaKey) {
      67 == b.keyCode && (c = "<copy>"), 86 == b.keyCode && (c = "<paste>"), 90 == b.keyCode && ma(a.b), 89 == b.keyCode && na(a.b), 88 == b.keyCode && (c = "<cut>");
    }
    8 == b.keyCode && (c = "<backspace>");
    13 == b.keyCode && (c = "<enter>");
    38 == b.keyCode && (c = "<up>");
    40 == b.keyCode && (c = "<down>");
    37 == b.keyCode && (c = "<left>");
    39 == b.keyCode && (c = "<right>");
    null != c && a.c.j(c);
  });
  $("#text-tool-input, #freeform-tool-input").keyup(function() {
    a.c.j("");
  });
  $("#text-tool-input, #freeform-tool-input").change(function() {
    a.c.j("");
  });
  $("#text-tool-close").click(function() {
    $("#text-tool-widget").hide();
    M(a.b);
  });
}
;function Ca(a, b) {
  var c = this;
  this.f = !1;
  this.b = a;
  this.g = b;
  this.a = null;
  this.c = "";
  Da(this);
  $("#drive-button").click(function() {
    c.f ? Ea(c) : (Fa(c, !1), Ga(c));
  });
  $("#drive-filename").click(function() {
    var a = "" + $("#drive-filename").text(), a = prompt("Enter new filename:", a);
    c.a.title = a;
    Z(c);
    Ha();
  });
  Ia(this);
  $(window).on("hashchange", this.h);
  $("#drive-new-file-button").click(function() {
    c.a = null;
    J(c.b);
    window.location.hash = "";
    Z(c);
    $("#drive-dialog").removeClass("visible");
  });
}
function Fa(a, b) {
  window.gapi.auth.authorize({client_id:"125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com", scope:"https://www.googleapis.com/auth/drive", immediate:b}, function(b) {
    !b || b.error || a.f || (a.f = !0, $("#drive-button").addClass("active"), window.setTimeout(a.h, 500));
  });
}
function Da(a) {
  window.gapi && window.gapi.auth && window.gapi.auth.authorize ? Fa(a, !0) : window.setTimeout(function() {
    Da(a);
  }, 500);
}
function Ga(a) {
  window.setTimeout(function() {
    a.f ? Ea(a) : (Fa(a, !0), Ga(a));
  }, 1E3);
}
function Ja(a, b) {
  a.a = b;
  $("#drive-filename").text(b.title);
  window.location.hash = b.id;
}
function Ea(a) {
  $("#drive-dialog").addClass("visible");
  var b = S(a.b);
  5 < b.length && b != a.c && Z(a);
  Ha();
}
function Ha() {
  Ka(window.gapi.client.request({path:"/drive/v2/files", params:{q:"mimeType = 'text/plain' and trashed = false"}, method:"GET"}), function(a) {
    $("#drive-file-list").children().remove();
    a = a.items;
    for (var b in a) {
      var c = document.createElement("li"), d = document.createElement("a");
      c.appendChild(d);
      d.href = "#" + a[b].id;
      $(d).click(function() {
        $("#drive-dialog").removeClass("visible");
      });
      d.innerHTML = a[b].title;
      $("#drive-file-list").append(c);
    }
  });
}
function Ka(a, b) {
  try {
    a.execute(function(a) {
      a.error || b(a);
    });
  } catch (c) {
  }
}
function Ia(a) {
  S(a.b) != a.c && a.a && a.a.editable && Z(a);
  window.setTimeout(function() {
    Ia(a);
  }, 5E3);
}
function Z(a) {
  var b = S(a.b);
  $("#drive-save-state").text("Saving...");
  Ka(La(a, b), function(c) {
    Ja(a, c);
    $("#drive-save-state").text("Saved");
    a.c = b;
  });
}
Ca.prototype.h = function() {
  var a = this;
  1 < window.location.hash.length && ($("#drive-save-state").text("Loading..."), Ka(window.gapi.client.request({path:"/drive/v2/files/" + window.location.hash.substr(1, window.location.hash.length - 1), method:"GET"}), function(b) {
    Ja(a, b);
    Ma(a);
  }));
};
function Ma(a) {
  Na(a.a.downloadUrl, function(b) {
    $("#drive-save-state").text("Loaded");
    J(a.b);
    oa(a.b, b, T(a.g, new p(a.g.b.width / 2, a.g.b.height / 2)));
    M(a.b);
    a.c = S(a.b);
  });
}
function La(a, b) {
  var c = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:a.a ? a.a.title : "Untitled ASCII Diagram", mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({path:"/upload/drive/v2/files" + (a.a ? "/" + a.a.id : ""), method:a.a ? "PUT" : "POST", params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:c});
}
function Na(a, b) {
  var c = window.gapi.auth.getToken().access_token, d = new XMLHttpRequest;
  d.open("GET", a);
  d.setRequestHeader("Authorization", "Bearer " + c);
  d.onload = function() {
    b(d.responseText);
  };
  d.onerror = function() {
    b(null);
  };
  d.send();
}
;function Oa(a) {
  var b = a.a.a.b;
  $(b).on("mousewheel", function(b) {
    b = a.a.a.c * (0 < b.originalEvent.wheelDelta ? 1.1 : .9);
    b = Math.max(Math.min(b, 5), .2);
    var c = a.a.a;
    c.c = b;
    c.f = !0;
  });
  $(b).mousedown(function(b) {
    if (b.ctrlKey || b.metaKey) {
      var c = a.a;
      b = new p(b.clientX, b.clientY);
      c.mode = 1;
      c.g = b;
      c.h = c.a.a;
    } else {
      c = a.a, b = new p(b.clientX, b.clientY), c.mode = 2, c.c.start(T(c.a, b));
    }
  });
  $(b).mouseup(function() {
    Y(a.a);
  });
  $(b).mouseleave(function() {
    Y(a.a);
  });
  $(b).mousemove(function(b) {
    Aa(a.a, new p(b.clientX, b.clientY));
  });
}
function Pa(a, b) {
  a.f = b;
  a.h = $.now();
  a.b = !1;
  window.setTimeout(function() {
    if (!a.b && !a.c && a.f) {
      var c = a.a;
      c.mode = 2;
      c.c.start(T(c.a, b));
    }
  }, 150);
}
function Qa(a) {
  var b = a.a.a.b;
  $(b).on("touchstart", function(b) {
    b.preventDefault();
    if (1 == b.originalEvent.touches.length) {
      Pa(a, new p(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
    } else {
      if (1 < b.originalEvent.touches.length) {
        var c = new p(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY);
        b = new p(b.originalEvent.touches[1].pageX, b.originalEvent.touches[1].pageY);
        Y(a.a);
        a.c = !0;
        a.b = !1;
        a.l = t(c, b).length();
        a.g = a.a.a.c;
      }
    }
  });
  $(b).on("touchmove", function(b) {
    b.preventDefault();
    if (1 == b.originalEvent.touches.length) {
      var c = new p(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY);
      !a.b && 150 > $.now() - a.h && 6 < t(c, a.f).length() && (a.b = !0, b = a.a, b.mode = 1, b.g = c, b.h = b.a.a);
      Aa(a.a, c);
    } else {
      1 < b.originalEvent.touches.length && (c = new p(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY), b = new p(b.originalEvent.touches[1].pageX, b.originalEvent.touches[1].pageY), a.c && (c = a.g * t(c, b).length() / a.l, c = Math.max(Math.min(c, 5), .5), b = a.a.a, b.c = c, b.f = !0));
    }
  });
  $(b).on("touchend", function(b) {
    b.preventDefault();
    a.b = !1;
    a.c = !1;
    a.f = null;
    Y(a.a);
  });
}
;var Ra = new function() {
  this.a = Array(2E3);
  this.b = [];
  this.c = !0;
  this.g = [];
  this.f = [];
  for (var a = 0;a < this.a.length;a++) {
    this.a[a] = Array(600);
    for (var b = 0;b < this.a[a].length;b++) {
      this.a[a][b] = new ia;
    }
  }
}, Sa = new function(a) {
  this.g = a;
  this.b = document.getElementById("ascii-canvas");
  this.context = this.b.getContext("2d");
  this.c = 1;
  this.a = new p(9E3, 5100);
  this.f = !0;
  this.h = !1;
  pa(this);
}(Ra), Ta = new function(a, b) {
  this.a = a;
  this.b = b;
  this.c = new V(b);
  this.mode = 0;
  this.f = null;
  Ba(this);
}(Sa, Ra);
new function(a) {
  this.a = a;
  this.c = this.b = !1;
  Qa(this);
}(Ta);
new function(a) {
  this.a = a;
  Oa(this);
}(Ta);
new Ca(Ra, Sa);
qa(Sa);

