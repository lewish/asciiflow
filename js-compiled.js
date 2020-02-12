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
  var c = a.originalEvent.touches[void 0 === b ? 0 : b];
  return new p(c.pageX, c.pageY);
}
function t(a, b) {
  return !!b && a.x == b.x && a.y == b.y;
}
function u(a, b) {
  return new p(a.x - b.x, a.y - b.y);
}
g = p.prototype;
g.add = function(a) {
  return new p(this.x + a.x, this.y + a.y);
};
g.clone = function() {
  return new p(this.x, this.y);
};
g.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
g.scale = function(a) {
  return new p(this.x * a, this.y * a);
};
function v(a) {
  return new p(a.x, a.y - 1);
}
function w(a) {
  return new p(a.x, a.y + 1);
}
function x(a) {
  return new p(a.x - 1, a.y);
}
g.right = function(a) {
  return new p(this.x + (void 0 === a ? 1 : a), this.y);
};
var ga = ["+", "\u2012", "\u2013", "-", "|"], y = [">", "<", "^", "v"], ha = ga.concat(y), z = "ontouchstart" in window || "onmsgesturechange" in window, B = new p(-1, 0), C = new p(1, 0), D = new p(0, -1), E = new p(0, 1), G = [B, C, D, E];
function H(a, b) {
  this.a = Math.min(a.x, b.x);
  this.b = Math.min(a.y, b.y);
  this.c = Math.max(a.x, b.x);
  this.f = Math.max(a.y, b.y);
}
function ia(a) {
  return new p(a.a, a.b);
}
H.prototype.contains = function(a) {
  return a.x >= this.a && a.x <= this.c && a.y >= this.b && a.y <= this.f;
};
function ja() {
  this.a = this.value = null;
  this.b = !1;
}
function I(a) {
  return null != a.a ? a.a : a.value;
}
function J(a) {
  return ha.includes(I(a));
}
function K(a) {
  return null == a.value && null == a.a;
}
function ka(a, b, c, e) {
  this.a = a;
  this.right = b;
  this.c = c;
  this.b = e;
  this.h = this.f = this.l = this.g = !1;
}
function M(a) {
  return a.a + a.right + a.c + a.b;
}
function la(a, b) {
  this.position = a;
  this.value = b;
}
function ma(a, b) {
  this.position = a;
  this.a = b;
}
;function na(a) {
  var b = N(a);
  window.localStorage.setItem("asciiflow2", JSON.stringify({cells:b, useLines:a.b}));
}
function O(a) {
  for (var b = 0;b < a.cells.length;b++) {
    for (var c = 0;c < a.cells[b].length;c++) {
      null != I(a.cells[b][c]) && P(a, new p(b, c), "\u2009");
    }
  }
  Q(a);
}
function R(a, b) {
  return a.cells[b.x][b.y];
}
function P(a, b, c, e) {
  var d = R(a, b);
  d.b = void 0 === e ? !1 : e;
  a.a.push(new ma(b, d));
  d.a = c;
  a.c = !0;
}
function oa(a, b, c) {
  I(R(a, b)) != c && P(a, b, c);
}
function S(a) {
  for (var b = n(a.a), c = b.next();!c.done;c = b.next()) {
    c.value.a.a = null;
  }
  a.a.length = 0;
}
function pa(a, b) {
  var c = R(a, b), e = null != c.a ? c.a : c.value, d = ga.includes(e), f = y.includes(e);
  if (!d && !f || c.b) {
    return e;
  }
  c = T(a, b);
  if (d && c.a && c.right && !c.c && !c.b) {
    return "-";
  }
  if (d && !c.a && !c.right && c.c && c.b) {
    return "|";
  }
  if (4 == M(c)) {
    return "-";
  }
  if (f && 3 == M(c)) {
    if (!c.a) {
      return "<";
    }
    if (!c.c) {
      return "^";
    }
    if (!c.b) {
      return "v";
    }
    if (!c.right) {
      return ">";
    }
  }
  if ((d || f) && 3 == M(c)) {
    c.g = J(R(a, v(x(b))));
    c.l = J(R(a, v(b.right())));
    c.f = J(R(a, w(x(b))));
    c.h = J(R(a, w(b.right())));
    if (!c.right && c.g && c.f || !c.a && c.l && c.h) {
      return "|";
    }
    if (!c.b && c.g && c.l || !c.c && c.h && c.f) {
      return "-";
    }
    e = K(R(a, v(x(b))));
    d = K(R(a, v(b.right())));
    if (c.c && c.a && c.right && (!e || !d)) {
      return "-";
    }
    e = K(R(a, w(x(b))));
    d = K(R(a, w(b.right())));
    return !(c.b && c.a && c.right) || e && d ? "+" : "-";
  }
  if (f && 1 == M(c)) {
    if (c.a) {
      return ">";
    }
    if (c.c) {
      return "v";
    }
    if (c.b) {
      return "^";
    }
    if (c.right) {
      return "<";
    }
  }
  return e;
}
function T(a, b) {
  var c = J(R(a, x(b))), e = J(R(a, b.right())), d = J(R(a, v(b))), f = J(R(a, w(b)));
  return new ka(c, e, d, f);
}
function Q(a, b) {
  var c = [], e = a.a.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), d = a.a.filter(function(a, c) {
    return e.indexOf(e[c]) == c;
  });
  a.a.length = 0;
  for (var d = n(d), f = d.next();!f.done;f = d.next()) {
    var k = f.value, f = k.position, k = k.a;
    c.push(new la(f, null != k.value ? k.value : " "));
    var l = I(k);
    if ("\u2009" == l || " " == l) {
      l = null;
    }
    J(k) && (l = pa(a, f));
    k.a = null;
    k.value = l;
  }
  d = b ? a.f : a.g;
  0 < c.length && (50 < d.length && d.shift(), d.push(c));
  a.c = !0;
  na(a);
}
function qa(a) {
  if (a.g.length) {
    for (var b = a.g.pop(), b = n(b), c = b.next();!c.done;c = b.next()) {
      c = c.value, P(a, c.position, c.value);
    }
    Q(a, !0);
  }
}
function ra(a) {
  if (a.f.length) {
    for (var b = a.f.pop(), b = n(b), c = b.next();!c.done;c = b.next()) {
      c = c.value, P(a, c.position, c.value);
    }
    Q(a);
  }
}
function N(a) {
  for (var b = new p(Number.MAX_VALUE, Number.MAX_VALUE), c = new p(-1, -1), e = 0;e < a.cells.length;e++) {
    for (var d = 0;d < a.cells[e].length;d++) {
      null != I(a.cells[e][d]) && (e < b.x && (b.x = e), d < b.y && (b.y = d), e > c.x && (c.x = e), d > c.y && (c.y = d));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var f = "", d = b.y;d <= c.y;d++) {
    for (var k = "", e = b.x;e <= c.x;e++) {
      var l = pa(a, new p(e, d)), k = k + (null == l || "\u2009" == l ? " " : l);
    }
    f += k.replace(/\s+$/, "") + "\n";
  }
  return f;
}
function sa(a, b, c) {
  b = b.split("\n");
  for (var e = new p(0, Math.round(b.length / 2)), d = 0;d < b.length;d++) {
    e.x = Math.max(e.x, Math.round(b[d].length / 2));
  }
  for (d = 0;d < b.length;d++) {
    for (var f = b[d], k = 0;k < f.length;k++) {
      var l = f.charAt(k);
      P(a, u((new p(k, d)).add(c), e), l, !0);
    }
  }
}
;function U(a, b, c, e, d) {
  d = void 0 === d ? "+" : d;
  var f = new H(b, c), k = f.a, l = f.b, A = f.c, f = f.f, F = e ? c.x : b.x;
  for (e = e ? b.y : c.y;k++ < A;) {
    var q = new p(k, e), L = T(a, new p(k, e));
    " " == d && 2 == L.c + L.b || oa(a, q, d);
  }
  for (;l++ < f;) {
    q = new p(F, l), L = T(a, new p(F, l)), " " == d && 2 == L.a + L.right || oa(a, q, d);
  }
  P(a, b, d);
  P(a, c, d);
  oa(a, new p(F, e), d);
}
;function ta(a) {
  this.a = a;
  this.b = null;
}
g = ta.prototype;
g.start = function(a) {
  this.b = a;
};
g.i = function(a) {
  S(this.a);
  U(this.a, this.b, a, !0);
  U(this.a, this.b, a, !1);
};
g.m = function() {
  Q(this.a);
};
g.o = function() {
  return "crosshair";
};
g.j = function() {
};
function ua(a) {
  a.b.width = document.documentElement.clientWidth;
  a.b.height = document.documentElement.clientHeight;
  a.g = !0;
}
function va(a) {
  if (a.g || a.c.c) {
    a.g = !1, a.c.c = !1, wa(a);
  }
  window.requestAnimationFrame(function() {
    va(a);
  });
}
function wa(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.b.width, a.b.height);
  b.scale(a.f, a.f);
  b.translate(a.b.width / 2 / a.f, a.b.height / 2 / a.f);
  var c = u(V(a, new p(0, 0)), new p(3, 3)), e = V(a, new p(a.b.width, a.b.height)).add(new p(3, 3));
  c.x = Math.max(0, Math.min(c.x, 2E3));
  e.x = Math.max(0, Math.min(e.x, 2E3));
  c.y = Math.max(0, Math.min(c.y, 600));
  e.y = Math.max(0, Math.min(e.y, 600));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var d = c.x;d < e.x;d++) {
    b.moveTo(9 * d - a.a.x, 0 - a.a.y), b.lineTo(9 * d - a.a.x, 17 * a.c.cells.length - a.a.y);
  }
  for (d = c.y;d < e.y;d++) {
    b.moveTo(0 - a.a.x, 17 * d - a.a.y), b.lineTo(9 * a.c.cells.length - a.a.x, 17 * d - a.a.y);
  }
  a.context.stroke();
  d = !a.c.b;
  b.font = "15px Courier New";
  for (var f = c.x;f < e.x;f++) {
    for (var k = c.y;k < e.y;k++) {
      var l = R(a.c, new p(f, k));
      if (J(l) || null != l.a && " " != I(l)) {
        a.context.fillStyle = null != l.a ? "#DEF" : "#F5F5F5", b.fillRect(9 * f - a.a.x, 17 * (k - 1) - a.a.y, 9, 17);
      }
      var A = pa(a.c, new p(f, k));
      null == A || J(l) && !d || (a.context.fillStyle = "#000000", b.fillText(A, 9 * f - a.a.x, 17 * k - a.a.y - 3));
    }
  }
  if (a.c.b) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (d = c.x;d < e.x;d++) {
      for (l = !1, f = c.y;f < e.y;f++) {
        k = R(a.c, new p(d, f)), J(k) && f != e.y - 1 || !l || (b.moveTo(9 * d - a.a.x + 4.5, 17 * l - a.a.y - 8.5), b.lineTo(9 * d - a.a.x + 4.5, 17 * (f - 1) - a.a.y - 8.5), l = !1), J(k) && !l && (l = f);
      }
    }
    for (f = c.y;f < e.y;f++) {
      for (l = !1, d = c.x;d < e.x;d++) {
        k = R(a.c, new p(d, f)), J(k) && d != e.x - 1 || !l || (b.moveTo(9 * l - a.a.x + 4.5, 17 * f - a.a.y - 8.5), b.lineTo(9 * (d - 1) - a.a.x + 4.5, 17 * f - a.a.y - 8.5), l = !1), J(k) && !l && (l = d);
      }
    }
    a.context.stroke();
  }
}
function V(a, b) {
  var c = new p((b.x - a.b.width / 2) / a.f + a.a.x, (b.y - a.b.height / 2) / a.f + a.a.y);
  return new p(Math.min(Math.max(1, Math.round((c.x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round((c.y + 8.5) / 17)), 598));
}
;function W(a) {
  this.c = a;
  this.a = this.b = null;
}
g = W.prototype;
g.start = function(a) {
  this.b = a;
  this.i(a);
};
g.i = function(a) {
  S(this.c);
  this.a = a;
  a = Math.min(this.b.y, this.a.y);
  for (var b = Math.max(this.b.x, this.a.x), c = Math.max(this.b.y, this.a.y), e = Math.min(this.b.x, this.a.x);e <= b;e++) {
    for (var d = a;d <= c;d++) {
      P(this.c, new p(e, d), "\u2009");
    }
  }
};
g.m = function() {
  Q(this.c);
};
g.o = function() {
  return "crosshair";
};
g.j = function() {
};
function X(a, b) {
  this.a = a;
  this.type = void 0 === b ? "connector" : b;
  this.b = null;
}
g = X.prototype;
g.start = function(a) {
  this.b = a;
};
function xa(a, b) {
  var c = T(a.a, b);
  c.c || c.b ? P(a.a, b, "|") : (c.a || c.right) && P(a.a, b, "-");
}
g.i = function(a) {
  S(this.a);
  var b = T(this.a, this.b), c = T(this.a, a);
  U(this.a, this.b, a, b.c && b.b || c.a && c.right);
  "plain" === this.type ? (xa(this, this.b), xa(this, a)) : "arrow" === this.type && P(this.a, a, c.c ? "^" : c.b ? "v" : c.a ? "<" : ">");
};
g.m = function() {
  Q(this.a);
};
g.o = function() {
  return "crosshair";
};
g.j = function() {
};
function ya(a) {
  this.c = a;
  this.g = this.f = this.b = this.a = null;
  this.h = !0;
  this.l = [];
}
g = ya.prototype;
g.start = function(a) {
  this.a && this.b && (new H(this.a, this.b)).contains(a) ? (this.f = a, za(this), Aa(this, a)) : (this.a = a, this.b = null, this.h = !1, this.i(a));
};
function za(a) {
  var b = a.c.a.filter(function(a) {
    return null != I(a.a) && "\u2009" != I(a.a);
  }), c = ia(new H(a.a, a.b));
  a.l = b.map(function(a) {
    return new la(u(a.position, c), I(a.a));
  });
}
g.i = function(a) {
  if (this.f) {
    Aa(this, a);
  } else {
    if (1 != this.h) {
      this.b = a;
      S(this.c);
      a = new H(this.a, a);
      for (var b = a.a;b <= a.c;b++) {
        for (var c = a.b;c <= a.f;c++) {
          var e = new p(b, c), d = I(R(this.c, e));
          P(this.c, e, null == d ? "\u2009" : d);
        }
      }
    }
  }
};
function Aa(a, b) {
  a.g = b;
  S(a.c);
  var c = new W(a.c);
  c.start(a.a);
  c.i(a.b);
  c = u(a.g, a.f).add(ia(new H(a.a, a.b)));
  Ba(a, c);
}
function Ba(a, b) {
  for (var c = n(a.l), e = c.next();!e.done;e = c.next()) {
    var e = e.value, d = e.value;
    P(a.c, e.position.add(b), d);
  }
}
g.m = function() {
  this.f && (Q(this.c), this.b = this.a = null);
  this.g = this.f = null;
  this.h = !0;
};
g.o = function(a) {
  return this.a && this.b && (new H(this.a, this.b)).contains(a) ? "pointer" : "default";
};
g.j = function(a) {
  if (this.a && this.b && ("<copy>" != a && "<cut>" != a || za(this), "<cut>" == a)) {
    var b = new W(this.c);
    b.start(this.a);
    b.i(this.b);
    Q(this.c);
  }
  "<paste>" == a && (Ba(this, this.a), Q(this.c));
};
function Ca(a) {
  this.b = a;
  this.c = this.a = null;
}
g = Ca.prototype;
g.start = function(a) {
  Q(this.b);
  $("#text-tool-input").val("");
  this.a = a;
  a = I(R(this.b, this.a));
  P(this.b, this.a, null == a ? "\u2009" : a, !0);
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
  S(this.b);
  for (var b = this.b, c = this.c, e = 0, d = 0, a = n(a), f = a.next();!f.done;f = a.next()) {
    f = f.value, "\n" == f ? (d++, e = 0) : (P(b, c.add(new p(e, d)), f, !0), e++);
  }
};
function Da(a) {
  this.a = a;
  this.b = null;
  this.c = [];
}
g = Da.prototype;
g.start = function(a) {
  var b;
  if (z) {
    if (J(R(this.a, a))) {
      b = a;
    } else {
      var c = G.concat([B.add(D), B.add(E), C.add(D), C.add(E)]);
      b = null;
      for (var e = 0, c = n(c), d = c.next();!d.done;d = c.next()) {
        var d = d.value, f = a.add(d), k = M(T(this.a, f));
        J(R(this.a, f)) && k > e && (b = d, e = k);
      }
      b = null == b ? a : a.add(b);
    }
  } else {
    b = a;
  }
  this.b = b;
  this.c = [];
  if (J(R(this.a, this.b))) {
    T(this.a, this.b);
    b = [];
    e = n(G);
    for (c = e.next();!c.done;c = e.next()) {
      for (c = c.value, d = Ea(this, this.b, c), d = n(d), f = d.next();!f.done;f = d.next()) {
        var f = f.value, k = 0 != c.x, l = -1 != y.indexOf(I(R(this.a, a))), A = -1 != y.indexOf(I(R(this.a, f)));
        if (1 == M(T(this.a, f))) {
          b.push({position:f, s:k, v:l, u:A});
        } else {
          for (var F = n(G), q = F.next();!q.done;q = F.next()) {
            q = q.value, 0 != c.add(q).length() && 2 != c.add(q).length() && (q = Ea(this, f, q), q.length && (q = q[0], b.push({position:q, s:k, v:l, w:A, u:-1 != y.indexOf(I(R(this.a, q)))})));
          }
        }
      }
    }
    this.c = b;
    this.i(this.b);
  }
};
g.i = function(a) {
  S(this.a);
  for (var b = n(this.c), c = b.next();!c.done;c = b.next()) {
    c = c.value, U(this.a, this.b, c.position, c.s, " ");
  }
  b = n(this.c);
  for (c = b.next();!c.done;c = b.next()) {
    c = c.value, U(this.a, a, c.position, c.s);
  }
  b = n(this.c);
  for (c = b.next();!c.done;c = b.next()) {
    c = c.value, c.v && P(this.a, a, "^"), c.u && P(this.a, c.position, "^"), c.w && P(this.a, new p(c.s ? c.position.x : a.x, c.s ? a.y : c.position.y), "^");
  }
};
g.m = function() {
  Q(this.a);
};
function Ea(a, b, c) {
  for (var e = b.clone(), d = [];;) {
    var f = e.add(c);
    if (!J(R(a.a, f))) {
      return t(b, e) || d.push(e), d;
    }
    e = f;
    3 == M(T(a.a, e)) && d.push(e);
  }
}
g.o = function(a) {
  return J(R(this.a, a)) ? "pointer" : "default";
};
g.j = function() {
};
function Fa(a, b) {
  this.a = a;
  this.value = b;
  z && ($("#freeform-tool-input").val(""), $("#freeform-tool-input").hide(0, function() {
    $("#freeform-tool-input").show(0, function() {
      $("#freeform-tool-input").focus();
    });
  }));
}
g = Fa.prototype;
g.start = function(a) {
  P(this.a, a, this.value);
};
g.i = function(a) {
  P(this.a, a, this.value);
};
g.m = function() {
  Q(this.a);
};
g.o = function() {
  return "crosshair";
};
g.j = function(a) {
  z && (this.value = $("#freeform-tool-input").val().substr(0, 1), $("#freeform-tool-input").blur(), $("#freeform-tool-input").hide(0));
  1 == a.length && (this.value = a);
};
function Ga(a, b) {
  var c = V(a.a, b);
  a.f || (a.f = c);
  t(c, a.f) || (a.a.b.style.cursor = a.c.o(c));
  2 != a.mode || t(c, a.f) || a.c.i(c);
  if (1 == a.mode) {
    var e = a.a, d = a.h.add(u(a.g, b).scale(1 / a.a.f));
    e.a = d;
    e.g = !0;
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
function Ha(a) {
  $(window).resize(function() {
    ua(a.a);
  });
  $("#draw-tools > button.tool").click(function(b) {
    $("#text-tool-widget").hide(0);
    b = b.target.id;
    $("#draw-tools > button.tool").removeClass("active");
    $("#" + b).toggleClass("active");
    $(".dialog").removeClass("visible");
    "box-button" == b && (a.c = new ta(a.b));
    "line-button" == b && (a.c = new X(a.b, "connector"));
    "arrow-button" == b && (a.c = new X(a.b, "arrow"));
    "plain-line-button" == b && (a.c = new X(a.b, "plain"));
    "freeform-button" == b && (a.c = new Fa(a.b, "X"));
    "erase-button" == b && (a.c = new W(a.b));
    "move-button" == b && (a.c = new Da(a.b));
    "text-button" == b && (a.c = new Ca(a.b));
    "select-button" == b && (a.c = new ya(a.b));
    Q(a.b);
    a.a.b.focus();
  });
  $("#file-tools > button.tool").click(function(b) {
    b = b.target.id;
    $(".dialog").removeClass("visible");
    $("#" + b + "-dialog").toggleClass("visible");
    "import-button" == b && ($("#import-area").val(""), $("#import-area").focus());
    "export-button" == b && ($("#export-area").val(N(a.b)), $("#export-area").select());
    "clear-button" == b && O(a.b);
    "undo-button" == b && qa(a.b);
    "redo-button" == b && ra(a.b);
  });
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  });
  $("#import-submit-button").click(function() {
    O(a.b);
    sa(a.b, $("#import-area").val(), V(a.a, new p(a.a.b.width / 2, a.a.b.height / 2)));
    Q(a.b);
    $("#import-area").val("");
    $(".dialog").removeClass("visible");
  });
  $("#use-lines-button").click(function() {
    $(".dialog").removeClass("visible");
    var b = a.a;
    b.c.b = !0;
    na(b.c);
    b.g = !0;
  });
  $("#use-ascii-button").click(function() {
    $(".dialog").removeClass("visible");
    var b = a.a;
    b.c.b = !1;
    na(b.c);
    b.g = !0;
  });
  $(window).keypress(function(b) {
    b.ctrlKey || b.metaKey || 13 == b.keyCode || a.c.j(String.fromCharCode(b.keyCode));
  });
  $(window).keydown(function(b) {
    var c = null;
    if (b.ctrlKey || b.metaKey) {
      67 == b.keyCode && (c = "<copy>"), 86 == b.keyCode && (c = "<paste>"), 90 == b.keyCode && qa(a.b), 89 == b.keyCode && ra(a.b), 88 == b.keyCode && (c = "<cut>");
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
    Q(a.b);
  });
}
;function Ia(a, b) {
  window.gapi.auth.authorize({client_id:"125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com", scope:"https://www.googleapis.com/auth/drive", A:b}, function(c) {
    !c || c.error || a.f || (a.f = !0, $("#drive-button").addClass("active"), window.setTimeout(function() {
      Ja(a);
    }, 500));
  });
}
function Ka(a) {
  window.gapi && window.gapi.auth && window.gapi.auth.authorize ? Ia(a, !0) : window.setTimeout(function() {
    Ka(a);
  }, 500);
}
function La(a) {
  window.setTimeout(function() {
    a.f ? Ma(a) : (Ia(a, !0), La(a));
  }, 1E3);
}
function Na(a, b) {
  a.a = b;
  $("#drive-filename").text(b.title);
  window.location.hash = b.id;
}
function Ma(a) {
  $("#drive-dialog").addClass("visible");
  var b = N(a.b);
  5 < b.length && b != a.c && Z(a);
  Oa();
}
function Oa() {
  Pa(window.gapi.client.request({path:"/drive/v2/files", params:{q:"mimeType = 'text/plain' and trashed = false"}, method:"GET"}), function(a) {
    $("#drive-file-list").children().remove();
    a = a.items;
    for (var b in a) {
      var c = document.createElement("li"), e = document.createElement("a");
      c.appendChild(e);
      e.href = "#" + a[b].id;
      $(e).click(function() {
        $("#drive-dialog").removeClass("visible");
      });
      e.innerHTML = a[b].title;
      $("#drive-file-list").append(c);
    }
  });
}
function Pa(a, b) {
  try {
    a.execute(function(a) {
      a.error || b(a);
    });
  } catch (c) {
  }
}
function Qa(a) {
  N(a.b) != a.c && a.a && a.a.editable && Z(a);
  window.setTimeout(function() {
    Qa(a);
  }, 5E3);
}
function Z(a) {
  var b = N(a.b);
  $("#drive-save-state").text("Saving...");
  Pa(Ra(a, b), function(c) {
    Na(a, c);
    $("#drive-save-state").text("Saved");
    a.c = b;
  });
}
function Ja(a) {
  1 < window.location.hash.length && ($("#drive-save-state").text("Loading..."), Pa(window.gapi.client.request({path:"/drive/v2/files/" + window.location.hash.substr(1, window.location.hash.length - 1), method:"GET"}), function(b) {
    Na(a, b);
    Sa(a);
  }));
}
function Sa(a) {
  Ta(a.a.downloadUrl, function(b) {
    $("#drive-save-state").text("Loaded");
    O(a.b);
    sa(a.b, b, V(a.g, new p(a.g.b.width / 2, a.g.b.height / 2)));
    Q(a.b);
    a.c = N(a.b);
  });
}
function Ra(a, b) {
  var c = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:a.a ? a.a.title : "Untitled ASCII Diagram", mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({method:a.a ? "PUT" : "POST", path:"/upload/drive/v2/files" + (a.a ? "/" + a.a.id : ""), params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:c});
}
function Ta(a, b) {
  var c = window.gapi.auth.getToken().access_token, e = new XMLHttpRequest;
  e.open("GET", a);
  e.setRequestHeader("Authorization", "Bearer " + c);
  e.onload = function() {
    b(e.responseText);
  };
  e.onerror = function() {
    b(null);
  };
  e.send();
}
;function Ua(a) {
  var b = $(a.a.a.b);
  b.on("mousewheel", function(c) {
    c = a.a.a.f * (0 < c.originalEvent.wheelDelta ? 1.1 : .9);
    c = Math.max(Math.min(c, 5), .2);
    var b = a.a.a;
    b.f = c;
    b.g = !0;
  });
  b.mousedown(function(c) {
    if (c.ctrlKey || c.metaKey) {
      var b = a.a;
      c = new p(c.clientX, c.clientY);
      b.mode = 1;
      b.g = c;
      b.h = b.a.a;
    } else {
      b = a.a, c = new p(c.clientX, c.clientY), b.mode = 2, b.c.start(V(b.a, c));
    }
  });
  b.mouseup(function() {
    Y(a.a);
  });
  b.mouseleave(function() {
    Y(a.a);
  });
  b.mousemove(function(c) {
    Ga(a.a, new p(c.clientX, c.clientY));
  });
}
function Va(a, b) {
  a.f = b;
  a.h = $.now();
  a.b = !1;
  window.setTimeout(function() {
    if (!a.b && !a.c && a.f) {
      var c = a.a;
      c.mode = 2;
      c.c.start(V(c.a, b));
    }
  }, 150);
}
function Wa(a) {
  var b = $(a.a.a.b);
  b.on("touchstart", function(c) {
    c.preventDefault();
    if (1 == c.originalEvent.touches.length) {
      Va(a, r(c));
    } else {
      if (1 < c.originalEvent.touches.length) {
        var b = r(c, 0);
        c = r(c, 1);
        Y(a.a);
        a.c = !0;
        a.b = !1;
        a.l = u(b, c).length();
        a.g = a.a.a.f;
      }
    }
  });
  b.on("touchmove", function(c) {
    c.preventDefault();
    if (1 == c.originalEvent.touches.length) {
      c = r(c);
      if (!a.b && 150 > $.now() - a.h && 6 < u(c, a.f).length()) {
        a.b = !0;
        var b = a.a;
        b.mode = 1;
        b.g = c;
        b.h = b.a.a;
      }
      Ga(a.a, c);
    } else {
      1 < c.originalEvent.touches.length && a.c && (c = a.g * u(r(c, 0), r(c, 1)).length() / a.l, c = Math.max(Math.min(c, 5), .5), b = a.a.a, b.f = c, b.g = !0);
    }
  });
  b.on("touchend", function(b) {
    b.preventDefault();
    a.b = !1;
    a.c = !1;
    a.f = null;
    Y(a.a);
  });
}
;var Xa = new function() {
  this.cells = Array(2E3);
  this.a = [];
  this.c = !0;
  this.b = !1;
  this.g = [];
  this.f = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(600);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new ja;
    }
  }
  try {
    var c = window.localStorage.getItem("asciiflow2");
    c && (c = JSON.parse(c));
    c.cells && sa(this, c.cells, new p(1E3, 300));
    c.useLines && (this.b = !0);
  } catch (e) {
    console.error("error deserializing state from localStorage:", e);
  }
}, Ya = new function(a) {
  this.c = a;
  this.b = document.getElementById("ascii-canvas");
  this.context = this.b.getContext("2d");
  this.f = 1;
  this.a = new p(9E3, 5100);
  this.g = !0;
  ua(this);
}(Xa), Za = new function(a, b) {
  this.a = a;
  this.b = b;
  this.c = new ta(b);
  this.mode = 0;
  this.f = null;
  Ha(this);
}(Ya, Xa);
new function(a) {
  this.a = a;
  this.c = this.b = !1;
  Wa(this);
}(Za);
new function(a) {
  this.a = a;
  Ua(this);
}(Za);
new function(a, b) {
  var c = this;
  this.f = !1;
  this.b = a;
  this.g = b;
  this.a = null;
  this.c = "";
  Ka(this);
  $("#drive-button").click(function() {
    c.f ? Ma(c) : (Ia(c, !1), La(c));
  });
  $("#drive-filename").click(function() {
    var a = "" + $("#drive-filename").text(), a = prompt("Enter new filename:", a);
    c.a.title = a;
    Z(c);
    Oa();
  });
  Qa(this);
  $(window).on("hashchange", function() {
    Ja(c);
  });
  $("#drive-new-file-button").click(function() {
    c.a = null;
    O(c.b);
    window.location.hash = "";
    Z(c);
    $("#drive-dialog").removeClass("visible");
  });
}(Xa, Ya);
va(Ya);

