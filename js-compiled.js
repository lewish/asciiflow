var f;
try {
  throw 1;
} catch (aa) {
  window.O = window.O || {};
}
var g = ["+", "\u2012", "\u2013", "-"], m = [">", "<", "^", "v"], ba = g.concat(m), n = "ontouchstart" in window || "onmsgesturechange" in window;
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
function s(a, b) {
  this.v = Math.min(a.x, b.x);
  this.w = Math.min(a.y, b.y);
  this.I = Math.max(a.x, b.x);
  this.J = Math.max(a.y, b.y);
}
function t(a) {
  return new p(a.v, a.w);
}
s.prototype.contains = function(a) {
  return a.x >= this.v && a.x <= this.I && a.y >= this.w && a.y <= this.J;
};
var u = new p(-1, 0), v = new p(1, 0), w = new p(0, -1), z = new p(0, 1), A = [u, v, w, z];
function ca() {
  this.g = this.value = null;
}
function C(a) {
  return null != a.g ? a.g : a.value;
}
function D(a) {
  return-1 != ba.indexOf(C(a));
}
function da(a, b, c, d) {
  this.left = a;
  this.right = b;
  this.l = c;
  this.j = d;
}
function E(a) {
  return a.left + a.right + a.l + a.j;
}
function ea(a, b) {
  this.position = a;
  this.value = b;
}
function fa(a, b) {
  this.position = a;
  this.n = b;
}
;function ga(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new p(9E3, 5100);
  this.e = !0;
  this.A = !1;
  ha(this);
}
function ha(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.e = !0;
}
ga.prototype.animate = function() {
  if (this.e || this.state.e) {
    this.e = !1, this.state.e = !1, ia(this);
  }
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function ia(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = r(F(a, new p(0, 0)), new p(3, 3)), d = F(a, new p(a.canvas.width, a.canvas.height)).add(new p(3, 3));
  c.x = Math.max(0, Math.min(c.x, 2E3));
  d.x = Math.max(0, Math.min(d.x, 2E3));
  c.y = Math.max(0, Math.min(c.y, 600));
  d.y = Math.max(0, Math.min(d.y, 600));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var e = c.x;e < d.x;e++) {
    b.moveTo(9 * e - a.offset.x, 0 - a.offset.y), b.lineTo(9 * e - a.offset.x, 17 * a.state.cells.length - a.offset.y);
  }
  for (e = c.y;e < d.y;e++) {
    b.moveTo(0 - a.offset.x, 17 * e - a.offset.y), b.lineTo(9 * a.state.cells.length - a.offset.x, 17 * e - a.offset.y);
  }
  a.context.stroke();
  e = !a.A;
  b.font = "15px Courier New";
  for (var h = c.x;h < d.x;h++) {
    for (var l = c.y;l < d.y;l++) {
      var k = G(a.state, new p(h, l));
      if (D(k) || null != k.g && " " != C(k)) {
        a.context.fillStyle = null != k.g ? "#DEF" : "#F5F5F5", b.fillRect(9 * h - a.offset.x, 17 * (l - 1) - a.offset.y, 9, 17);
      }
      var x = ja(a.state, new p(h, l));
      null == x || D(k) && !e || (a.context.fillStyle = "#000000", b.fillText(x, 9 * h - a.offset.x, 17 * l - a.offset.y - 3));
    }
  }
  if (a.A) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (e = c.x;e < d.x;e++) {
      for (k = !1, h = c.y;h < d.y;h++) {
        l = G(a.state, new p(e, h)), D(l) && h != d.y - 1 || !k || (b.moveTo(9 * e - a.offset.x + 4.5, 17 * k - a.offset.y - 8.5), b.lineTo(9 * e - a.offset.x + 4.5, 17 * (h - 1) - a.offset.y - 8.5), k = !1), D(l) && !k && (k = h);
      }
    }
    for (h = c.y;h < d.y;h++) {
      for (k = !1, e = c.x;e < d.x;e++) {
        l = G(a.state, new p(e, h)), D(l) && e != d.x - 1 || !k || (b.moveTo(9 * k - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), b.lineTo(9 * (e - 1) - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), k = !1), D(l) && !k && (k = e);
      }
    }
    a.context.stroke();
  }
}
function F(a, b) {
  return new p(Math.min(Math.max(1, Math.round(((new p((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new p((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function H(a, b, c, d, e) {
  e = e || "+";
  var h = new s(b, c), l = h.v, k = h.w, x = h.I, h = h.J, y = d ? c.x : b.x;
  for (d = d ? b.y : c.y;l++ < x;) {
    var M = new p(l, d), B = a.getContext(new p(l, d));
    " " == e && 2 == B.l + B.j || I(a, M, e);
  }
  for (;k++ < h;) {
    M = new p(y, k), B = a.getContext(new p(y, k)), " " == e && 2 == B.left + B.right || I(a, M, e);
  }
  J(a, b, e);
  J(a, c, e);
  I(a, new p(y, d), e);
}
function K(a) {
  this.state = a;
  this.a = null;
}
f = K.prototype;
f.start = function(a) {
  this.a = a;
};
f.move = function(a) {
  this.b = a;
  L(this.state);
  H(this.state, this.a, a, !0);
  H(this.state, this.a, a, !1);
};
f.end = function() {
  N(this.state);
};
f.k = function() {
  return "crosshair";
};
f.f = function() {
};
function P(a, b) {
  this.state = a;
  this.P = b;
  this.a = null;
}
f = P.prototype;
f.start = function(a) {
  this.a = a;
};
f.move = function(a) {
  L(this.state);
  var b = this.state.getContext(this.a), c = this.state.getContext(a);
  H(this.state, this.a, a, b.l && b.j || c.left && c.right);
  this.P && J(this.state, a, "^");
};
f.end = function() {
  N(this.state);
};
f.k = function() {
  return "crosshair";
};
f.f = function() {
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
  J(this.state, a, this.value);
};
f.move = function(a) {
  J(this.state, a, this.value);
};
f.end = function() {
  N(this.state);
};
f.k = function() {
  return "crosshair";
};
f.f = function(a) {
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
  a = C(G(this.state, this.a));
  J(this.state, this.a, null == a ? "\u2009" : a);
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
f.k = function() {
  return "pointer";
};
f.f = function() {
  var a = $("#text-tool-input").val();
  L(this.state);
  for (var b = 0, c = 0, d = 0;d < a.length;d++) {
    "\n" == a[d] ? (c++, b = 0) : (J(this.state, this.b.add(new p(b, c)), a[d]), b++);
  }
};
function Q(a) {
  this.state = a;
  this.b = this.a = null;
}
f = Q.prototype;
f.start = function(a) {
  this.a = a;
  this.move(a);
};
f.move = function(a) {
  L(this.state);
  this.b = a;
  var b = Math.min(this.a.x, this.b.x);
  a = Math.min(this.a.y, this.b.y);
  for (var c = Math.max(this.a.x, this.b.x), d = Math.max(this.a.y, this.b.y);b <= c;b++) {
    for (var e = a;e <= d;e++) {
      J(this.state, new p(b, e), "\u2009");
    }
  }
};
f.end = function() {
  N(this.state);
};
f.k = function() {
  return "crosshair";
};
f.f = function() {
};
function ma(a) {
  this.state = a;
  this.h = this.a = null;
}
f = ma.prototype;
f.start = function(a) {
  if (n && !D(G(this.state, a))) {
    var b = A.concat([u.add(w), u.add(z), v.add(w), v.add(z)]), c = null, d = 0, e;
    for (e in b) {
      var h = a.add(b[e]), l = E(this.state.getContext(h));
      D(G(this.state, h)) && l > d && (c = b[e], d = l);
    }
    a = null == c ? a : a.add(c);
  }
  this.a = a;
  this.h = null;
  if (D(G(this.state, this.a))) {
    this.state.getContext(this.a);
    a = [];
    for (var k in A) {
      var b = na(this, this.a, A[k]), x;
      for (x in b) {
        if (c = b[x], d = 0 != A[k].x, 1 == E(this.state.getContext(c))) {
          a.push({position:c, D:d});
        } else {
          for (var y in A) {
            0 != A[k].add(A[y]).length() && 2 != A[k].add(A[y]).length() && (e = na(this, c, A[y]), 0 != e.length && a.push({position:e[e.length - 1], D:d}));
          }
        }
      }
    }
    this.h = a;
    this.move(this.a);
  }
};
f.move = function(a) {
  L(this.state);
  for (var b in this.h) {
    H(this.state, this.a, this.h[b].position, this.h[b].D, " ");
  }
  for (b in this.h) {
    H(this.state, a, this.h[b].position, this.h[b].D);
  }
};
f.end = function() {
  N(this.state);
};
function na(a, b, c) {
  for (var d = b.clone(), e = [];;) {
    var h = d.add(c);
    if (!D(G(a.state, h))) {
      return q(b, d) || e.push(d), e;
    }
    d = h;
    3 == E(a.state.getContext(d)) && e.push(d);
  }
}
f.k = function(a) {
  return D(G(this.state, a)) ? "pointer" : "default";
};
f.f = function() {
};
function oa(a) {
  this.state = a;
  this.F = this.o = this.b = this.a = null;
  this.K = !0;
  this.u = null;
}
f = oa.prototype;
f.start = function(a) {
  null != this.a && null != this.b && (new s(this.a, this.b)).contains(a) ? (this.o = a, pa(this), qa(this, a)) : (this.a = a, this.b = null, this.K = !1, this.move(a));
};
function pa(a) {
  var b = a.state.i.filter(function(a) {
    return null != C(a.n) && "\u2009" != C(a.n);
  }), c = t(new s(a.a, a.b));
  a.u = b.map(function(a) {
    return new ea(r(a.position, c), C(a.n));
  });
}
f.move = function(a) {
  if (null != this.o) {
    qa(this, a);
  } else {
    if (!0 != this.K) {
      this.b = a;
      L(this.state);
      a = new s(this.a, a);
      for (var b = a.v;b <= a.I;b++) {
        for (var c = a.w;c <= a.J;c++) {
          var d = new p(b, c), e = C(G(this.state, d));
          J(this.state, d, null == e ? "\u2009" : e);
        }
      }
    }
  }
};
function qa(a, b) {
  a.F = b;
  L(a.state);
  var c = new Q(a.state);
  c.start(a.a);
  c.move(a.b);
  c = r(a.F, a.o).add(t(new s(a.a, a.b)));
  ra(a, c);
}
function ra(a, b) {
  for (var c in a.u) {
    J(a.state, a.u[c].position.add(b), a.u[c].value);
  }
}
f.end = function() {
  null != this.o && (N(this.state), this.b = this.a = null);
  this.F = this.o = null;
  this.K = !0;
};
f.k = function(a) {
  return null != this.a && null != this.b && (new s(this.a, this.b)).contains(a) ? "pointer" : "default";
};
f.f = function(a) {
  if (null != this.a && null != this.b && ("<copy>" != a && "<cut>" != a || pa(this), "<cut>" == a)) {
    var b = new Q(this.state);
    b.start(this.a);
    b.move(this.b);
    N(this.state);
  }
  "<paste>" == a && (ra(this, this.a), N(this.state));
};
function R() {
  this.cells = Array(2E3);
  this.i = [];
  this.e = !0;
  this.N = [];
  this.M = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(600);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new ca;
    }
  }
}
R.prototype.clear = function() {
  for (var a = 0;a < this.cells.length;a++) {
    for (var b = 0;b < this.cells[a].length;b++) {
      null != C(this.cells[a][b]) && J(this, new p(a, b), "\u2009");
    }
  }
  N(this);
};
function G(a, b) {
  return a.cells[b.x][b.y];
}
function J(a, b, c) {
  var d = G(a, b);
  a.i.push(new fa(b, d));
  d.g = c;
  a.e = !0;
}
function I(a, b, c) {
  C(G(a, b)) != c && J(a, b, c);
}
function L(a) {
  for (var b in a.i) {
    a.i[b].n.g = null;
  }
  a.i.length = 0;
}
function ja(a, b) {
  var c = G(a, b), c = null != c.g ? c.g : c.value;
  if ("+" != c && "^" != c) {
    return c;
  }
  var d = a.getContext(b);
  if (d.left && d.right && !d.l && !d.j) {
    return "-";
  }
  if (!d.left && !d.right && d.l && d.j) {
    return "|";
  }
  if (4 == E(d)) {
    return "-";
  }
  if ("+" == c && 3 == E(d)) {
    return "+";
  }
  if ("^" == c && 3 == E(d)) {
    if (!d.left) {
      return "<";
    }
    if (!d.l) {
      return "^";
    }
    if (!d.j) {
      return "v";
    }
    if (!d.right) {
      return ">";
    }
  }
  if ("^" == c && 1 == E(d)) {
    if (d.left) {
      return ">";
    }
    if (d.l) {
      return "v";
    }
    if (d.j) {
      return "^";
    }
    if (d.right) {
      return "<";
    }
  }
  return c;
}
R.prototype.getContext = function(a) {
  var b = D(G(this, a.add(u))), c = D(G(this, a.add(v))), d = D(G(this, a.add(w)));
  a = D(G(this, a.add(z)));
  return new da(b, c, d, a);
};
function N(a, b) {
  var c = [], d = a.i.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), e = a.i.filter(function(a, b) {
    return d.indexOf(d[b]) == b;
  });
  a.i.length = 0;
  for (var h in e) {
    var l = e[h].n;
    c.push(new ea(e[h].position, null != l.value ? l.value : " "));
    var k = C(l);
    if ("\u2009" == k || " " == k) {
      k = null;
    }
    l.g = null;
    l.value = k;
  }
  e = b ? a.M : a.N;
  0 < c.length && (50 < e.length && e.shift(), e.push(c));
  a.e = !0;
}
function sa(a) {
  if (0 != a.N.length) {
    var b = a.N.pop(), c;
    for (c in b) {
      var d = b[c];
      J(a, d.position, d.value);
    }
    N(a, !0);
  }
}
function ta(a) {
  if (0 != a.M.length) {
    var b = a.M.pop(), c;
    for (c in b) {
      var d = b[c];
      J(a, d.position, d.value);
    }
    N(a);
  }
}
function S(a) {
  for (var b = new p(Number.MAX_VALUE, Number.MAX_VALUE), c = new p(-1, -1), d = 0;d < a.cells.length;d++) {
    for (var e = 0;e < a.cells[d].length;e++) {
      null != C(a.cells[d][e]) && (d < b.x && (b.x = d), e < b.y && (b.y = e), d > c.x && (c.x = d), e > c.y && (c.y = e));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var h = "", e = b.y;e <= c.y;e++) {
    for (var l = "", d = b.x;d <= c.x;d++) {
      var k = ja(a, new p(d, e)), l = l + (null == k ? " " : k)
    }
    h += l.replace("\\s+$/g", "") + "\n";
  }
  return h;
}
function ua(a, b, c) {
  b = b.split("\n");
  for (var d = new p(0, Math.round(b.length / 2)), e = 0;e < b.length;e++) {
    d.x = Math.max(d.x, Math.round(b[e].length / 2));
  }
  for (e = 0;e < b.length;e++) {
    for (var h = b[e], l = 0;l < h.length;l++) {
      var k = h.charAt(l);
      -1 != g.indexOf(k) && (k = "+");
      -1 != m.indexOf(k) && (k = "^");
      J(a, r((new p(l, e)).add(c), d), k);
    }
  }
}
;function T(a, b) {
  this.view = a;
  this.state = b;
  this.d = new K(b);
  this.mode = 0;
  this.p();
}
T.prototype.t = function(a) {
  var b = F(this.view, a);
  null == this.r && (this.r = b);
  q(b, this.r) || (this.view.canvas.style.cursor = this.d.k(b));
  2 != this.mode || q(b, this.r) || this.d.move(b);
  if (1 == this.mode) {
    var c = this.view;
    a = this.H.add(r(this.G, a).scale(1 / this.view.zoom));
    c.offset = a;
    c.e = !0;
  }
  this.r = b;
};
function U(a) {
  2 == a.mode && a.d.end();
  a.mode = 0;
  a.G = null;
  a.H = null;
  a.r = null;
}
T.prototype.p = function() {
  var a = this;
  $(window).resize(function() {
    ha(a.view);
  });
  $("#draw-tools > button.tool").click(function(a) {
    $("#text-tool-widget").hide(0);
    a = a.target.id;
    $("#draw-tools > button.tool").removeClass("active");
    $("#" + a).toggleClass("active");
    $(".dialog").removeClass("visible");
    "box-button" == a && (this.d = new K(this.state));
    "line-button" == a && (this.d = new P(this.state, !1));
    "arrow-button" == a && (this.d = new P(this.state, !0));
    "freeform-button" == a && (this.d = new ka(this.state, "X"));
    "erase-button" == a && (this.d = new Q(this.state));
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
    "export-button" == a && ($("#export-area").val(S(this.state)), $("#export-area").select());
    "clear-button" == a && this.state.clear();
    "undo-button" == a && sa(this.state);
    "redo-button" == a && ta(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    ua(this.state, $("#import-area").val(), F(this.view, new p(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    N(this.state);
    $("#import-area").val("");
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#use-lines-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.A = !0;
    a.e = !0;
  }.bind(this));
  $("#use-ascii-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.A = !1;
    a.e = !0;
  }.bind(this));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || 13 == a.keyCode || this.d.f(String.fromCharCode(a.keyCode));
  }.bind(this));
  $(window).keydown(function(a) {
    var c = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && sa(this.state), 89 == a.keyCode && ta(this.state), 88 == a.keyCode && (c = "<cut>");
    }
    8 == a.keyCode && (c = "<backspace>");
    13 == a.keyCode && (c = "<enter>");
    38 == a.keyCode && (c = "<up>");
    40 == a.keyCode && (c = "<down>");
    37 == a.keyCode && (c = "<left>");
    39 == a.keyCode && (c = "<right>");
    null != c && this.d.f(c);
  }.bind(this));
  $("#text-tool-input, #freeform-tool-input").keyup(function() {
    this.d.f("");
  }.bind(this));
  $("#text-tool-input, #freeform-tool-input").change(function() {
    this.d.f("");
  }.bind(this));
  $("#text-tool-close").click(function() {
    $("#text-tool-widget").hide();
    N(this.state);
  }.bind(this));
};
function va(a, b) {
  this.s = !1;
  this.state = a;
  this.view = b;
  this.file = null;
  wa(this);
  $("#drive-button").click(function() {
    this.s ? xa(this) : (V(this, !1), ya(this));
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
    !a || a.error || this.s || (this.s = !0, $("#drive-button").addClass("active"), window.setTimeout(function() {
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
    this.s ? xa(this) : (V(this, !0), ya(this));
  }.bind(a), 1E3);
}
function Ca(a, b) {
  a.file = b;
  $("#drive-filename").text(b.title);
  window.location.hash = b.id;
}
function xa(a) {
  $("#drive-dialog").addClass("visible");
  var b = S(a.state);
  5 < b.length && b != a.C && a.save();
  za(a);
}
function za(a) {
  W(window.gapi.client.request({path:"/drive/v2/files", params:{q:"mimeType = 'text/plain' and trashed = false"}, method:"GET"}), function(a) {
    $("#drive-file-list").children().remove();
    a = a.items;
    for (var c in a) {
      var d = document.createElement("li"), e = document.createElement("a");
      d.appendChild(e);
      e.href = "#" + a[c].id;
      $(e).click(function() {
        $("#drive-dialog").removeClass("visible");
      });
      e.innerHTML = a[c].title;
      $("#drive-file-list").append(d);
    }
  }.bind(a));
}
function W(a, b) {
  try {
    a.execute(function(a) {
      a.error || b(a);
    });
  } catch (c) {
  }
}
function Aa(a) {
  S(a.state) != a.C && a.file && a.file.editable && a.save();
  window.setTimeout(function() {
    Aa(this);
  }.bind(a), 5E3);
}
va.prototype.save = function() {
  var a = S(this.state);
  $("#drive-save-state").text("Saving...");
  W(Da(this, a), function(b) {
    Ca(this, b);
    $("#drive-save-state").text("Saved");
    this.C = a;
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
    ua(this.state, a, F(this.view, new p(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    this.C = S(this.state);
  }.bind(a));
}
function Da(a, b) {
  var c = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:null == a.file ? "Untitled ASCII Diagram" : a.file.title, mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({path:"/upload/drive/v2/files" + (null == a.file ? "" : "/" + a.file.id), method:null == a.file ? "POST" : "PUT", params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:c});
}
function Fa(a, b) {
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
;function Ga(a) {
  this.c = a;
  this.p();
}
Ga.prototype.p = function() {
  var a = this.c.view.canvas;
  $(a).bind("mousewheel", function(a) {
    a = this.c.view.zoom * (0 < a.originalEvent.wheelDelta ? 1.1 : 0.9);
    a = Math.max(Math.min(a, 5), 0.2);
    var c = this.c.view;
    c.zoom = a;
    c.e = !0;
  }.bind(this));
  $(a).mousedown(function(a) {
    if (a.ctrlKey || a.metaKey) {
      var c = this.c;
      a = new p(a.clientX, a.clientY);
      c.mode = 1;
      c.G = a;
      c.H = c.view.offset;
    } else {
      c = this.c, a = new p(a.clientX, a.clientY), c.mode = 2, c.d.start(F(c.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    U(this.c);
  }.bind(this));
  $(a).mouseleave(function() {
    U(this.c);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.c.t(new p(a.clientX, a.clientY));
  }.bind(this));
};
function X(a) {
  this.c = a;
  this.B = this.m = !1;
  this.p();
}
function Ha(a, b) {
  a.L = b;
  a.R = $.now();
  a.m = !1;
  window.setTimeout(function() {
    if (!this.m && !this.B && null != this.L) {
      var a = this.c;
      a.mode = 2;
      a.d.start(F(a.view, b));
    }
  }.bind(a), 150);
}
X.prototype.t = function(a) {
  if (!this.m && 150 > $.now() - this.R && 6 < r(a, this.L).length()) {
    this.m = !0;
    var b = this.c;
    b.mode = 1;
    b.G = a;
    b.H = b.view.offset;
  }
  this.c.t(a);
};
X.prototype.reset = function() {
  this.B = this.m = !1;
  this.L = null;
};
X.prototype.p = function() {
  var a = this.c.view.canvas;
  $(a).bind("touchstart", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      Ha(this, new p(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new p(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new p(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        U(this.c);
        this.B = !0;
        this.m = !1;
        this.S = r(c, a).length();
        this.Q = this.c.view.zoom;
      }
    }
  }.bind(this));
  $(a).bind("touchmove", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      this.t(new p(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new p(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new p(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        this.B && (c = this.Q * r(c, a).length() / this.S, c = Math.max(Math.min(c, 5), 0.5), a = this.c.view, a.zoom = c, a.e = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    U(this.c);
  }.bind(this));
};
var Y = new R, Z = new ga(Y), Ia = new T(Z, Y);
new X(Ia);
new Ga(Ia);
new va(Y, Z);
Z.animate();

