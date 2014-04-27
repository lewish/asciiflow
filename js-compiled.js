var f;
try {
  throw 1;
} catch (aa) {
  window.U = window.U || {};
}
var h = ["+", "\u2012", "\u2013", "-", "|"], m = [">", "<", "^", "v"], ba = h.concat(m), n = "ontouchstart" in window || "onmsgesturechange" in window;
function p(a, b) {
  this.x = a;
  this.y = b;
}
function q(a, b) {
  return null != b && a.x == b.x && a.y == b.y;
}
function r(a, b) {
  return new p(a.x - b.x, a.y - b.y);
}
p.prototype.add = function(a) {
  return new p(this.x + a.x, this.y + a.y);
};
p.prototype.clone = function() {
  return new p(this.x, this.y);
};
p.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
p.prototype.scale = function(a) {
  return new p(this.x * a, this.y * a);
};
function t(a, b) {
  this.w = Math.min(a.x, b.x);
  this.A = Math.min(a.y, b.y);
  this.I = Math.max(a.x, b.x);
  this.J = Math.max(a.y, b.y);
}
function ca(a) {
  return new p(a.w, a.A);
}
t.prototype.contains = function(a) {
  return a.x >= this.w && a.x <= this.I && a.y >= this.A && a.y <= this.J;
};
var v = new p(-1, 0), w = new p(1, 0), x = new p(0, -1), y = new p(0, 1), A = [v, w, x, y];
function da() {
  this.h = this.value = null;
}
function B(a) {
  return null != a.h ? a.h : a.value;
}
function C(a) {
  return-1 != ba.indexOf(B(a));
}
function ea(a, b, d, c) {
  this.left = a;
  this.right = b;
  this.k = d;
  this.i = c;
  this.P = this.L = this.Q = this.M = !1;
}
function D(a) {
  return a.left + a.right + a.k + a.i;
}
function fa(a, b) {
  this.position = a;
  this.value = b;
}
function ga(a, b) {
  this.position = a;
  this.n = b;
}
;function ha(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new p(9E3, 5100);
  this.f = !0;
  this.B = !1;
  ia(this);
}
function ia(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.f = !0;
}
ha.prototype.animate = function() {
  if (this.f || this.state.f) {
    this.f = !1, this.state.f = !1, ja(this);
  }
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function ja(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var d = r(E(a, new p(0, 0)), new p(3, 3)), c = E(a, new p(a.canvas.width, a.canvas.height)).add(new p(3, 3));
  d.x = Math.max(0, Math.min(d.x, 2E3));
  c.x = Math.max(0, Math.min(c.x, 2E3));
  d.y = Math.max(0, Math.min(d.y, 600));
  c.y = Math.max(0, Math.min(c.y, 600));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var e = d.x;e < c.x;e++) {
    b.moveTo(9 * e - a.offset.x, 0 - a.offset.y), b.lineTo(9 * e - a.offset.x, 17 * a.state.cells.length - a.offset.y);
  }
  for (e = d.y;e < c.y;e++) {
    b.moveTo(0 - a.offset.x, 17 * e - a.offset.y), b.lineTo(9 * a.state.cells.length - a.offset.x, 17 * e - a.offset.y);
  }
  a.context.stroke();
  e = !a.B;
  b.font = "15px Courier New";
  for (var g = d.x;g < c.x;g++) {
    for (var l = d.y;l < c.y;l++) {
      var k = F(a.state, new p(g, l));
      if (C(k) || null != k.h && " " != B(k)) {
        a.context.fillStyle = null != k.h ? "#DEF" : "#F5F5F5", b.fillRect(9 * g - a.offset.x, 17 * (l - 1) - a.offset.y, 9, 17);
      }
      var s = G(a.state, new p(g, l));
      null == s || C(k) && !e || (a.context.fillStyle = "#000000", b.fillText(s, 9 * g - a.offset.x, 17 * l - a.offset.y - 3));
    }
  }
  if (a.B) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (e = d.x;e < c.x;e++) {
      for (k = !1, g = d.y;g < c.y;g++) {
        l = F(a.state, new p(e, g)), C(l) && g != c.y - 1 || !k || (b.moveTo(9 * e - a.offset.x + 4.5, 17 * k - a.offset.y - 8.5), b.lineTo(9 * e - a.offset.x + 4.5, 17 * (g - 1) - a.offset.y - 8.5), k = !1), C(l) && !k && (k = g);
      }
    }
    for (g = d.y;g < c.y;g++) {
      for (k = !1, e = d.x;e < c.x;e++) {
        l = F(a.state, new p(e, g)), C(l) && e != c.x - 1 || !k || (b.moveTo(9 * k - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), b.lineTo(9 * (e - 1) - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), k = !1), C(l) && !k && (k = e);
      }
    }
    a.context.stroke();
  }
}
function E(a, b) {
  return new p(Math.min(Math.max(1, Math.round(((new p((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new p((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function I(a, b, d, c, e) {
  e = e || "+";
  var g = new t(b, d), l = g.w, k = g.A, s = g.I, g = g.J, z = c ? d.x : b.x;
  for (c = c ? b.y : d.y;l++ < s;) {
    var u = new p(l, c), H = a.getContext(new p(l, c));
    " " == e && 2 == H.k + H.i || J(a, u, e);
  }
  for (;k++ < g;) {
    u = new p(z, k), H = a.getContext(new p(z, k)), " " == e && 2 == H.left + H.right || J(a, u, e);
  }
  K(a, b, e);
  K(a, d, e);
  J(a, new p(z, c), e);
}
function L(a) {
  this.state = a;
  this.a = null;
}
f = L.prototype;
f.start = function(a) {
  this.a = a;
};
f.move = function(a) {
  this.b = a;
  M(this.state);
  I(this.state, this.a, a, !0);
  I(this.state, this.a, a, !1);
};
f.end = function() {
  N(this.state);
};
f.l = function() {
  return "crosshair";
};
f.g = function() {
};
function O(a, b) {
  this.state = a;
  this.V = b;
  this.a = null;
}
f = O.prototype;
f.start = function(a) {
  this.a = a;
};
f.move = function(a) {
  M(this.state);
  var b = this.state.getContext(this.a), d = this.state.getContext(a);
  I(this.state, this.a, a, b.k && b.i || d.left && d.right);
  this.V && K(this.state, a, "^");
};
f.end = function() {
  N(this.state);
};
f.l = function() {
  return "crosshair";
};
f.g = function() {
};
function ka(a, b) {
  this.state = a;
  this.value = b;
  n && ($("#freeform-tool-input").val(""), $("#freeform-tool-input").hide(0, function() {
    $("#freeform-tool-input").show(0, function() {
      $("#freeform-tool-input").focus();
    });
  }));
}
f = ka.prototype;
f.start = function(a) {
  K(this.state, a, this.value);
};
f.move = function(a) {
  K(this.state, a, this.value);
};
f.end = function() {
  N(this.state);
};
f.l = function() {
  return "crosshair";
};
f.g = function(a) {
  n && (this.value = $("#freeform-tool-input").val().substr(0, 1), $("#freeform-tool-input").blur(), $("#freeform-tool-input").hide(0));
  1 == a.length && (this.value = a);
};
function la(a) {
  this.state = a;
  this.a = null;
}
f = la.prototype;
f.start = function(a) {
  N(this.state);
  $("#text-tool-input").val("");
  this.a = a;
  a = B(F(this.state, this.a));
  K(this.state, this.a, null == a ? "\u2009" : a);
};
f.move = function() {
};
f.end = function() {
  null != this.a && (this.b = this.a, this.a = null, $("#text-tool-widget").hide(0, function() {
    $("#text-tool-widget").show(0, function() {
      $("#text-tool-input").focus();
    });
  }));
};
f.l = function() {
  return "pointer";
};
f.g = function() {
  var a = $("#text-tool-input").val();
  M(this.state);
  for (var b = 0, d = 0, c = 0;c < a.length;c++) {
    "\n" == a[c] ? (d++, b = 0) : (K(this.state, this.b.add(new p(b, d)), a[c]), b++);
  }
};
function P(a) {
  this.state = a;
  this.b = this.a = null;
}
f = P.prototype;
f.start = function(a) {
  this.a = a;
  this.move(a);
};
f.move = function(a) {
  M(this.state);
  this.b = a;
  var b = Math.min(this.a.x, this.b.x);
  a = Math.min(this.a.y, this.b.y);
  for (var d = Math.max(this.a.x, this.b.x), c = Math.max(this.a.y, this.b.y);b <= d;b++) {
    for (var e = a;e <= c;e++) {
      K(this.state, new p(b, e), "\u2009");
    }
  }
};
f.end = function() {
  N(this.state);
};
f.l = function() {
  return "crosshair";
};
f.g = function() {
};
function ma(a) {
  this.state = a;
  this.e = this.a = null;
}
f = ma.prototype;
f.start = function(a) {
  var b;
  if (n) {
    if (C(F(this.state, a))) {
      b = a;
    } else {
      b = A.concat([v.add(x), v.add(y), w.add(x), w.add(y)]);
      var d = null, c = 0, e;
      for (e in b) {
        var g = a.add(b[e]), l = D(this.state.getContext(g));
        C(F(this.state, g)) && l > c && (d = b[e], c = l);
      }
      b = null == d ? a : a.add(d);
    }
  } else {
    b = a;
  }
  this.a = b;
  this.e = null;
  if (C(F(this.state, this.a))) {
    this.state.getContext(this.a);
    b = [];
    for (var k in A) {
      var d = na(this, this.a, A[k]), s;
      for (s in d) {
        if (c = d[s], e = 0 != A[k].x, g = -1 != m.indexOf(B(F(this.state, a))), l = -1 != m.indexOf(B(F(this.state, c))), 1 == D(this.state.getContext(c))) {
          b.push({position:c, o:e, T:g, S:l});
        } else {
          for (var z in A) {
            if (0 != A[k].add(A[z]).length() && 2 != A[k].add(A[z]).length()) {
              var u = na(this, c, A[z]);
              0 != u.length && (u = u[0], b.push({position:u, o:e, T:g, W:l, S:-1 != m.indexOf(B(F(this.state, u)))}));
            }
          }
        }
      }
    }
    this.e = b;
    this.move(this.a);
  }
};
f.move = function(a) {
  M(this.state);
  for (var b in this.e) {
    I(this.state, this.a, this.e[b].position, this.e[b].o, " ");
  }
  for (b in this.e) {
    I(this.state, a, this.e[b].position, this.e[b].o);
  }
  for (b in this.e) {
    this.e[b].T && K(this.state, a, "^"), this.e[b].S && K(this.state, this.e[b].position, "^"), this.e[b].W && K(this.state, new p(this.e[b].o ? this.e[b].position.x : a.x, this.e[b].o ? a.y : this.e[b].position.y), "^");
  }
};
f.end = function() {
  N(this.state);
};
function na(a, b, d) {
  for (var c = b.clone(), e = [];;) {
    var g = c.add(d);
    if (!C(F(a.state, g))) {
      return q(b, c) || e.push(c), e;
    }
    c = g;
    3 == D(a.state.getContext(c)) && e.push(c);
  }
}
f.l = function(a) {
  return C(F(this.state, a)) ? "pointer" : "default";
};
f.g = function() {
};
function oa(a) {
  this.state = a;
  this.F = this.p = this.b = this.a = null;
  this.K = !0;
  this.v = null;
}
f = oa.prototype;
f.start = function(a) {
  null != this.a && null != this.b && (new t(this.a, this.b)).contains(a) ? (this.p = a, pa(this), qa(this, a)) : (this.a = a, this.b = null, this.K = !1, this.move(a));
};
function pa(a) {
  var b = a.state.j.filter(function(a) {
    return null != B(a.n) && "\u2009" != B(a.n);
  }), d = ca(new t(a.a, a.b));
  a.v = b.map(function(a) {
    return new fa(r(a.position, d), B(a.n));
  });
}
f.move = function(a) {
  if (null != this.p) {
    qa(this, a);
  } else {
    if (!0 != this.K) {
      this.b = a;
      M(this.state);
      a = new t(this.a, a);
      for (var b = a.w;b <= a.I;b++) {
        for (var d = a.A;d <= a.J;d++) {
          var c = new p(b, d), e = B(F(this.state, c));
          K(this.state, c, null == e ? "\u2009" : e);
        }
      }
    }
  }
};
function qa(a, b) {
  a.F = b;
  M(a.state);
  var d = new P(a.state);
  d.start(a.a);
  d.move(a.b);
  d = r(a.F, a.p).add(ca(new t(a.a, a.b)));
  ra(a, d);
}
function ra(a, b) {
  for (var d in a.v) {
    K(a.state, a.v[d].position.add(b), a.v[d].value);
  }
}
f.end = function() {
  null != this.p && (N(this.state), this.b = this.a = null);
  this.F = this.p = null;
  this.K = !0;
};
f.l = function(a) {
  return null != this.a && null != this.b && (new t(this.a, this.b)).contains(a) ? "pointer" : "default";
};
f.g = function(a) {
  if (null != this.a && null != this.b && ("<copy>" != a && "<cut>" != a || pa(this), "<cut>" == a)) {
    var b = new P(this.state);
    b.start(this.a);
    b.move(this.b);
    N(this.state);
  }
  "<paste>" == a && (ra(this, this.a), N(this.state));
};
function Q() {
  this.cells = Array(2E3);
  this.j = [];
  this.f = !0;
  this.R = [];
  this.O = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(600);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new da;
    }
  }
}
Q.prototype.clear = function() {
  for (var a = 0;a < this.cells.length;a++) {
    for (var b = 0;b < this.cells[a].length;b++) {
      null != B(this.cells[a][b]) && K(this, new p(a, b), "\u2009");
    }
  }
  N(this);
};
function F(a, b) {
  return a.cells[b.x][b.y];
}
function K(a, b, d) {
  var c = F(a, b);
  a.j.push(new ga(b, c));
  c.h = d;
  a.f = !0;
}
function J(a, b, d) {
  B(F(a, b)) != d && K(a, b, d);
}
function M(a) {
  for (var b in a.j) {
    a.j[b].n.h = null;
  }
  a.j.length = 0;
}
function G(a, b) {
  var d = F(a, b), c = null != d.h ? d.h : d.value, d = -1 != h.indexOf(c), e = -1 != m.indexOf(c);
  if (!d && !e) {
    return c;
  }
  c = a.getContext(b);
  if (c.left && c.right && !c.k && !c.i) {
    return "-";
  }
  if (!c.left && !c.right && c.k && c.i) {
    return "|";
  }
  if (4 == D(c)) {
    return "-";
  }
  if (e && 3 == D(c)) {
    if (!c.left) {
      return "<";
    }
    if (!c.k) {
      return "^";
    }
    if (!c.i) {
      return "v";
    }
    if (!c.right) {
      return ">";
    }
  }
  if ((d || e) && 3 == D(c)) {
    return c.M = C(F(a, b.add(v).add(x))), c.Q = C(F(a, b.add(w).add(x))), c.L = C(F(a, b.add(v).add(y))), c.P = C(F(a, b.add(w).add(y))), !c.right && c.M && c.L || !c.left && c.Q && c.P ? "|" : !c.i && c.M && c.Q || !c.k && c.P && c.L ? "-" : "+";
  }
  if (e && 1 == D(c)) {
    if (c.left) {
      return ">";
    }
    if (c.k) {
      return "v";
    }
    if (c.i) {
      return "^";
    }
    if (c.right) {
      return "<";
    }
  }
  return "+";
}
Q.prototype.getContext = function(a) {
  var b = C(F(this, a.add(v))), d = C(F(this, a.add(w))), c = C(F(this, a.add(x)));
  a = C(F(this, a.add(y)));
  return new ea(b, d, c, a);
};
function N(a, b) {
  var d = [], c = a.j.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), e = a.j.filter(function(a, b) {
    return c.indexOf(c[b]) == b;
  });
  a.j.length = 0;
  for (var g in e) {
    var l = e[g].position, k = e[g].n;
    d.push(new fa(l, null != k.value ? k.value : " "));
    var s = B(k);
    if ("\u2009" == s || " " == s) {
      s = null;
    }
    C(k) && (s = G(a, l));
    k.h = null;
    k.value = s;
  }
  e = b ? a.O : a.R;
  0 < d.length && (50 < e.length && e.shift(), e.push(d));
  a.f = !0;
}
function sa(a) {
  if (0 != a.R.length) {
    var b = a.R.pop(), d;
    for (d in b) {
      var c = b[d];
      K(a, c.position, c.value);
    }
    N(a, !0);
  }
}
function ta(a) {
  if (0 != a.O.length) {
    var b = a.O.pop(), d;
    for (d in b) {
      var c = b[d];
      K(a, c.position, c.value);
    }
    N(a);
  }
}
function R(a) {
  for (var b = new p(Number.MAX_VALUE, Number.MAX_VALUE), d = new p(-1, -1), c = 0;c < a.cells.length;c++) {
    for (var e = 0;e < a.cells[c].length;e++) {
      null != B(a.cells[c][e]) && (c < b.x && (b.x = c), e < b.y && (b.y = e), c > d.x && (d.x = c), e > d.y && (d.y = e));
    }
  }
  if (0 > d.x) {
    return "";
  }
  for (var g = "", e = b.y;e <= d.y;e++) {
    for (var l = "", c = b.x;c <= d.x;c++) {
      var k = G(a, new p(c, e)), l = l + (null == k ? " " : k)
    }
    g += l.replace("\\s+$/g", "") + "\n";
  }
  return g;
}
function ua(a, b, d) {
  b = b.split("\n");
  for (var c = new p(0, Math.round(b.length / 2)), e = 0;e < b.length;e++) {
    c.x = Math.max(c.x, Math.round(b[e].length / 2));
  }
  for (e = 0;e < b.length;e++) {
    for (var g = b[e], l = 0;l < g.length;l++) {
      var k = g.charAt(l);
      -1 != h.indexOf(k) && (k = "+");
      -1 != m.indexOf(k) && (k = "^");
      K(a, r((new p(l, e)).add(d), c), k);
    }
  }
}
;function S(a, b) {
  this.view = a;
  this.state = b;
  this.d = new L(b);
  this.mode = 0;
  this.r();
}
S.prototype.u = function(a) {
  var b = E(this.view, a);
  null == this.s && (this.s = b);
  q(b, this.s) || (this.view.canvas.style.cursor = this.d.l(b));
  2 != this.mode || q(b, this.s) || this.d.move(b);
  if (1 == this.mode) {
    var d = this.view;
    a = this.H.add(r(this.G, a).scale(1 / this.view.zoom));
    d.offset = a;
    d.f = !0;
  }
  this.s = b;
};
function T(a) {
  2 == a.mode && a.d.end();
  a.mode = 0;
  a.G = null;
  a.H = null;
  a.s = null;
}
S.prototype.r = function() {
  var a = this;
  $(window).resize(function() {
    ia(a.view);
  });
  $("#draw-tools > button.tool").click(function(a) {
    $("#text-tool-widget").hide(0);
    a = a.target.id;
    $("#draw-tools > button.tool").removeClass("active");
    $("#" + a).toggleClass("active");
    $(".dialog").removeClass("visible");
    "box-button" == a && (this.d = new L(this.state));
    "line-button" == a && (this.d = new O(this.state, !1));
    "arrow-button" == a && (this.d = new O(this.state, !0));
    "freeform-button" == a && (this.d = new ka(this.state, "X"));
    "erase-button" == a && (this.d = new P(this.state));
    "move-button" == a && (this.d = new ma(this.state));
    "text-button" == a && (this.d = new la(this.state));
    "select-button" == a && (this.d = new oa(this.state));
    N(this.state);
    this.view.canvas.focus();
  }.bind(this));
  $("#file-tools > button.tool").click(function(a) {
    a = a.target.id;
    $(".dialog").removeClass("visible");
    $("#" + a + "-dialog").toggleClass("visible");
    "import-button" == a && ($("#import-area").val(""), $("#import-area").focus());
    "export-button" == a && ($("#export-area").val(R(this.state)), $("#export-area").select());
    "clear-button" == a && this.state.clear();
    "undo-button" == a && sa(this.state);
    "redo-button" == a && ta(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    ua(this.state, $("#import-area").val(), E(this.view, new p(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    N(this.state);
    $("#import-area").val("");
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#use-lines-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.B = !0;
    a.f = !0;
  }.bind(this));
  $("#use-ascii-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.B = !1;
    a.f = !0;
  }.bind(this));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || 13 == a.keyCode || this.d.g(String.fromCharCode(a.keyCode));
  }.bind(this));
  $(window).keydown(function(a) {
    var d = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (d = "<copy>"), 86 == a.keyCode && (d = "<paste>"), 90 == a.keyCode && sa(this.state), 89 == a.keyCode && ta(this.state), 88 == a.keyCode && (d = "<cut>");
    }
    8 == a.keyCode && (d = "<backspace>");
    13 == a.keyCode && (d = "<enter>");
    38 == a.keyCode && (d = "<up>");
    40 == a.keyCode && (d = "<down>");
    37 == a.keyCode && (d = "<left>");
    39 == a.keyCode && (d = "<right>");
    null != d && this.d.g(d);
  }.bind(this));
  $("#text-tool-input, #freeform-tool-input").keyup(function() {
    this.d.g("");
  }.bind(this));
  $("#text-tool-input, #freeform-tool-input").change(function() {
    this.d.g("");
  }.bind(this));
  $("#text-tool-close").click(function() {
    $("#text-tool-widget").hide();
    N(this.state);
  }.bind(this));
};
function va(a, b) {
  this.t = !1;
  this.state = a;
  this.view = b;
  this.file = null;
  wa(this);
  $("#drive-button").click(function() {
    this.t ? xa(this) : (V(this, !1), ya(this));
  }.bind(this));
  $("#drive-filename").click(function() {
    var a = "" + $("#drive-filename").text(), a = prompt("Enter new filename:", a);
    this.file.title = a;
    this.save();
    za(this);
  }.bind(this));
  Aa(this);
  $(window).bind("hashchange", function() {
    Ba(this);
  }.bind(this));
  $("#drive-new-file-button").click(function() {
    this.file = null;
    this.state.clear();
    window.location.hash = "";
    this.save();
    $("#drive-dialog").removeClass("visible");
  }.bind(this));
}
function V(a, b) {
  window.gapi.auth.authorize({client_id:"125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com", scope:"https://www.googleapis.com/auth/drive", immediate:b}, function(a) {
    !a || a.error || this.t || (this.t = !0, $("#drive-button").addClass("active"), window.setTimeout(function() {
      Ba(this);
    }.bind(this), 500));
  }.bind(a));
}
function wa(a) {
  window.gapi && window.gapi.auth && window.gapi.auth.authorize ? V(a, !0) : window.setTimeout(function() {
    wa(this);
  }.bind(a), 500);
}
function ya(a) {
  window.setTimeout(function() {
    this.t ? xa(this) : (V(this, !0), ya(this));
  }.bind(a), 1E3);
}
function Ca(a, b) {
  a.file = b;
  $("#drive-filename").text(b.title);
  window.location.hash = b.id;
}
function xa(a) {
  $("#drive-dialog").addClass("visible");
  var b = R(a.state);
  5 < b.length && b != a.D && a.save();
  za(a);
}
function za(a) {
  W(window.gapi.client.request({path:"/drive/v2/files", params:{q:"mimeType = 'text/plain' and trashed = false"}, method:"GET"}), function(a) {
    $("#drive-file-list").children().remove();
    a = a.items;
    for (var d in a) {
      var c = document.createElement("li"), e = document.createElement("a");
      c.appendChild(e);
      e.href = "#" + a[d].id;
      $(e).click(function() {
        $("#drive-dialog").removeClass("visible");
      });
      e.innerHTML = a[d].title;
      $("#drive-file-list").append(c);
    }
  }.bind(a));
}
function W(a, b) {
  try {
    a.execute(function(a) {
      a.error || b(a);
    });
  } catch (d) {
  }
}
function Aa(a) {
  R(a.state) != a.D && a.file && a.file.editable && a.save();
  window.setTimeout(function() {
    Aa(this);
  }.bind(a), 5E3);
}
va.prototype.save = function() {
  var a = R(this.state);
  $("#drive-save-state").text("Saving...");
  W(Da(this, a), function(b) {
    Ca(this, b);
    $("#drive-save-state").text("Saved");
    this.D = a;
  }.bind(this));
};
function Ba(a) {
  1 < window.location.hash.length && ($("#drive-save-state").text("Loading..."), W(window.gapi.client.request({path:"/drive/v2/files/" + window.location.hash.substr(1, window.location.hash.length - 1), method:"GET"}), function(a) {
    Ca(this, a);
    Ea(this);
  }.bind(a)));
}
function Ea(a) {
  Fa(a.file.downloadUrl, function(a) {
    $("#drive-save-state").text("Loaded");
    this.state.clear();
    ua(this.state, a, E(this.view, new p(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    N(this.state);
    this.D = R(this.state);
  }.bind(a));
}
function Da(a, b) {
  var d = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:null == a.file ? "Untitled ASCII Diagram" : a.file.title, mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({path:"/upload/drive/v2/files" + (null == a.file ? "" : "/" + a.file.id), method:null == a.file ? "POST" : "PUT", params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:d});
}
function Fa(a, b) {
  var d = window.gapi.auth.getToken().access_token, c = new XMLHttpRequest;
  c.open("GET", a);
  c.setRequestHeader("Authorization", "Bearer " + d);
  c.onload = function() {
    b(c.responseText);
  };
  c.onerror = function() {
    b(null);
  };
  c.send();
}
;function Ga(a) {
  this.c = a;
  this.r();
}
Ga.prototype.r = function() {
  var a = this.c.view.canvas;
  $(a).bind("mousewheel", function(a) {
    a = this.c.view.zoom * (0 < a.originalEvent.wheelDelta ? 1.1 : 0.9);
    a = Math.max(Math.min(a, 5), 0.2);
    var d = this.c.view;
    d.zoom = a;
    d.f = !0;
  }.bind(this));
  $(a).mousedown(function(a) {
    if (a.ctrlKey || a.metaKey) {
      var d = this.c;
      a = new p(a.clientX, a.clientY);
      d.mode = 1;
      d.G = a;
      d.H = d.view.offset;
    } else {
      d = this.c, a = new p(a.clientX, a.clientY), d.mode = 2, d.d.start(E(d.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    T(this.c);
  }.bind(this));
  $(a).mouseleave(function() {
    T(this.c);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.c.u(new p(a.clientX, a.clientY));
  }.bind(this));
};
function X(a) {
  this.c = a;
  this.C = this.m = !1;
  this.r();
}
function Ha(a, b) {
  a.N = b;
  a.Y = $.now();
  a.m = !1;
  window.setTimeout(function() {
    if (!this.m && !this.C && null != this.N) {
      var a = this.c;
      a.mode = 2;
      a.d.start(E(a.view, b));
    }
  }.bind(a), 150);
}
X.prototype.u = function(a) {
  if (!this.m && 150 > $.now() - this.Y && 6 < r(a, this.N).length()) {
    this.m = !0;
    var b = this.c;
    b.mode = 1;
    b.G = a;
    b.H = b.view.offset;
  }
  this.c.u(a);
};
X.prototype.reset = function() {
  this.C = this.m = !1;
  this.N = null;
};
X.prototype.r = function() {
  var a = this.c.view.canvas;
  $(a).bind("touchstart", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      Ha(this, new p(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var d = new p(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new p(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        T(this.c);
        this.C = !0;
        this.m = !1;
        this.Z = r(d, a).length();
        this.X = this.c.view.zoom;
      }
    }
  }.bind(this));
  $(a).bind("touchmove", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      this.u(new p(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var d = new p(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new p(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        this.C && (d = this.X * r(d, a).length() / this.Z, d = Math.max(Math.min(d, 5), 0.5), a = this.c.view, a.zoom = d, a.f = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    T(this.c);
  }.bind(this));
};
var Y = new Q, Z = new ha(Y), Ia = new S(Z, Y);
new X(Ia);
new Ga(Ia);
new va(Y, Z);
Z.animate();

