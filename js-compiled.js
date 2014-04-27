var f;
try {
  throw 1;
} catch (aa) {
  window.O = window.O || {};
}
var g = "ontouchstart" in window || "onmsgesturechange" in window;
function m(a, b) {
  this.x = a;
  this.y = b;
}
function n(a, b) {
  return null != b && a.x == b.x && a.y == b.y;
}
function p(a, b) {
  return new m(a.x - b.x, a.y - b.y);
}
m.prototype.add = function(a) {
  return new m(this.x + a.x, this.y + a.y);
};
m.prototype.clone = function() {
  return new m(this.x, this.y);
};
m.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
m.prototype.scale = function(a) {
  return new m(this.x * a, this.y * a);
};
function q(a, b) {
  this.v = Math.min(a.x, b.x);
  this.w = Math.min(a.y, b.y);
  this.I = Math.max(a.x, b.x);
  this.J = Math.max(a.y, b.y);
}
function r(a) {
  return new m(a.v, a.w);
}
q.prototype.contains = function(a) {
  return a.x >= this.v && a.x <= this.I && a.y >= this.w && a.y <= this.J;
};
var s = new m(-1, 0), t = new m(1, 0), u = new m(0, -1), v = new m(0, 1), y = [s, t, u, v];
function ba() {
  this.g = this.value = null;
}
function z(a) {
  return null != a.g ? a.g : a.value;
}
function B(a) {
  return "+" == z(a);
}
function ca(a, b, c, d) {
  this.left = a;
  this.right = b;
  this.m = c;
  this.k = d;
}
function C(a) {
  return a.left + a.right + a.m + a.k;
}
function D(a, b) {
  this.position = a;
  this.value = b;
}
function da(a, b) {
  this.position = a;
  this.n = b;
}
;function E(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new m(9E3, 5100);
  this.e = !0;
  this.A = !1;
  F(this);
}
function F(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.e = !0;
}
E.prototype.animate = function() {
  if (this.e || this.state.e) {
    this.e = !1, this.state.e = !1, ea(this);
  }
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function ea(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = p(G(a, new m(0, 0)), new m(3, 3)), d = G(a, new m(a.canvas.width, a.canvas.height)).add(new m(3, 3));
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
      var k = H(a.state, new m(h, l));
      if (B(k) || null != k.g && " " != z(k)) {
        a.context.fillStyle = null != k.g ? "#DEF" : "#F5F5F5", b.fillRect(9 * h - a.offset.x, 17 * (l - 1) - a.offset.y, 9, 17);
      }
      var w = fa(a.state, new m(h, l));
      null == w || B(k) && !e || (a.context.fillStyle = "#000000", b.fillText(w, 9 * h - a.offset.x, 17 * l - a.offset.y - 3));
    }
  }
  if (a.A) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (e = c.x;e < d.x;e++) {
      for (k = !1, h = c.y;h < d.y;h++) {
        l = H(a.state, new m(e, h)), B(l) && h != d.y - 1 || !k || (b.moveTo(9 * e - a.offset.x + 4.5, 17 * k - a.offset.y - 8.5), b.lineTo(9 * e - a.offset.x + 4.5, 17 * (h - 1) - a.offset.y - 8.5), k = !1), B(l) && !k && (k = h);
      }
    }
    for (h = c.y;h < d.y;h++) {
      for (k = !1, e = c.x;e < d.x;e++) {
        l = H(a.state, new m(e, h)), B(l) && e != d.x - 1 || !k || (b.moveTo(9 * k - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), b.lineTo(9 * (e - 1) - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), k = !1), B(l) && !k && (k = e);
      }
    }
    a.context.stroke();
  }
}
function G(a, b) {
  return new m(Math.min(Math.max(1, Math.round(((new m((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new m((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function I(a, b, c, d, e) {
  e = e || "+";
  var h = new q(b, c), l = h.v, k = h.w, w = h.I, h = h.J, x = d ? c.x : b.x;
  for (d = d ? b.y : c.y;l++ < w;) {
    var M = new m(l, d), A = a.getContext(new m(l, d));
    " " == e && 2 == A.m + A.k || J(a, M, e);
  }
  for (;k++ < h;) {
    M = new m(x, k), A = a.getContext(new m(x, k)), " " == e && 2 == A.left + A.right || J(a, M, e);
  }
  K(a, b, e);
  K(a, c, e);
  J(a, new m(x, d), e);
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
  N(this.state);
  I(this.state, this.a, a, !0);
  I(this.state, this.a, a, !1);
};
f.end = function() {
  P(this.state);
};
f.j = function() {
  return "crosshair";
};
f.f = function() {
};
function ga(a) {
  this.state = a;
  this.a = null;
}
f = ga.prototype;
f.start = function(a) {
  this.a = a;
};
f.move = function(a) {
  N(this.state);
  var b = this.state.getContext(this.a), c = this.state.getContext(a);
  I(this.state, this.a, a, b.m && b.k || c.left && c.right);
};
f.end = function() {
  P(this.state);
};
f.j = function() {
  return "crosshair";
};
f.f = function() {
};
function ha(a, b) {
  this.state = a;
  this.value = b;
  g && ($("#freeform-tool-input").val(""), $("#freeform-tool-input").hide(0, function() {
    $("#freeform-tool-input").show(0, function() {
      $("#freeform-tool-input").focus();
    });
  }));
}
f = ha.prototype;
f.start = function(a) {
  K(this.state, a, this.value);
};
f.move = function(a) {
  K(this.state, a, this.value);
};
f.end = function() {
  P(this.state);
};
f.j = function() {
  return "crosshair";
};
f.f = function(a) {
  g && (this.value = $("#freeform-tool-input").val().substr(0, 1), $("#freeform-tool-input").blur(), $("#freeform-tool-input").hide(0));
  1 == a.length && (this.value = a);
};
function ia(a) {
  this.state = a;
  this.a = null;
}
f = ia.prototype;
f.start = function(a) {
  P(this.state);
  $("#text-tool-input").val("");
  this.a = a;
  a = z(H(this.state, this.a));
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
f.j = function() {
  return "pointer";
};
f.f = function() {
  var a = $("#text-tool-input").val();
  N(this.state);
  for (var b = 0, c = 0, d = 0;d < a.length;d++) {
    "\n" == a[d] ? (c++, b = 0) : (K(this.state, this.b.add(new m(b, c)), a[d]), b++);
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
  N(this.state);
  this.b = a;
  var b = Math.min(this.a.x, this.b.x);
  a = Math.min(this.a.y, this.b.y);
  for (var c = Math.max(this.a.x, this.b.x), d = Math.max(this.a.y, this.b.y);b <= c;b++) {
    for (var e = a;e <= d;e++) {
      K(this.state, new m(b, e), "\u2009");
    }
  }
};
f.end = function() {
  P(this.state);
};
f.j = function() {
  return "crosshair";
};
f.f = function() {
};
function ja(a) {
  this.state = a;
  this.h = this.a = null;
}
f = ja.prototype;
f.start = function(a) {
  if (g && !B(H(this.state, a))) {
    var b = y.concat([s.add(u), s.add(v), t.add(u), t.add(v)]), c = null, d = 0, e;
    for (e in b) {
      var h = a.add(b[e]), l = C(this.state.getContext(h));
      B(H(this.state, h)) && l > d && (c = b[e], d = l);
    }
    a = null == c ? a : a.add(c);
  }
  this.a = a;
  this.h = null;
  if (B(H(this.state, this.a))) {
    this.state.getContext(this.a);
    a = [];
    for (var k in y) {
      var b = ka(this, this.a, y[k]), w;
      for (w in b) {
        if (c = b[w], d = 0 != y[k].x, 1 == C(this.state.getContext(c))) {
          a.push({position:c, D:d});
        } else {
          for (var x in y) {
            0 != y[k].add(y[x]).length() && 2 != y[k].add(y[x]).length() && (e = ka(this, c, y[x]), 0 != e.length && a.push({position:e[e.length - 1], D:d}));
          }
        }
      }
    }
    this.h = a;
    this.move(this.a);
  }
};
f.move = function(a) {
  N(this.state);
  for (var b in this.h) {
    I(this.state, this.a, this.h[b].position, this.h[b].D, " ");
  }
  for (b in this.h) {
    I(this.state, a, this.h[b].position, this.h[b].D);
  }
};
f.end = function() {
  P(this.state);
};
function ka(a, b, c) {
  for (var d = b.clone(), e = [];;) {
    var h = d.add(c);
    if (!B(H(a.state, h))) {
      return n(b, d) || e.push(d), e;
    }
    d = h;
    3 == C(a.state.getContext(d)) && e.push(d);
  }
}
f.j = function(a) {
  return B(H(this.state, a)) ? "pointer" : "default";
};
f.f = function() {
};
function la(a) {
  this.state = a;
  this.F = this.o = this.b = this.a = null;
  this.K = !0;
  this.u = null;
}
f = la.prototype;
f.start = function(a) {
  null != this.a && null != this.b && (new q(this.a, this.b)).contains(a) ? (this.o = a, ma(this), na(this, a)) : (this.a = a, this.b = null, this.K = !1, this.move(a));
};
function ma(a) {
  var b = a.state.i.filter(function(a) {
    return null != z(a.n) && "\u2009" != z(a.n);
  }), c = r(new q(a.a, a.b));
  a.u = b.map(function(a) {
    return new D(p(a.position, c), z(a.n));
  });
}
f.move = function(a) {
  if (null != this.o) {
    na(this, a);
  } else {
    if (!0 != this.K) {
      this.b = a;
      N(this.state);
      a = new q(this.a, a);
      for (var b = a.v;b <= a.I;b++) {
        for (var c = a.w;c <= a.J;c++) {
          var d = new m(b, c), e = z(H(this.state, d));
          K(this.state, d, null == e ? "\u2009" : e);
        }
      }
    }
  }
};
function na(a, b) {
  a.F = b;
  N(a.state);
  var c = new Q(a.state);
  c.start(a.a);
  c.move(a.b);
  c = p(a.F, a.o).add(r(new q(a.a, a.b)));
  oa(a, c);
}
function oa(a, b) {
  for (var c in a.u) {
    K(a.state, a.u[c].position.add(b), a.u[c].value);
  }
}
f.end = function() {
  null != this.o && (P(this.state), this.b = this.a = null);
  this.F = this.o = null;
  this.K = !0;
};
f.j = function(a) {
  return null != this.a && null != this.b && (new q(this.a, this.b)).contains(a) ? "pointer" : "default";
};
f.f = function(a) {
  if (null != this.a && null != this.b && ("<copy>" != a && "<cut>" != a || ma(this), "<cut>" == a)) {
    var b = new Q(this.state);
    b.start(this.a);
    b.move(this.b);
    P(this.state);
  }
  "<paste>" == a && (oa(this, this.a), P(this.state));
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
      this.cells[a][b] = new ba;
    }
  }
}
R.prototype.clear = function() {
  for (var a = 0;a < this.cells.length;a++) {
    for (var b = 0;b < this.cells[a].length;b++) {
      null != z(this.cells[a][b]) && K(this, new m(a, b), "\u2009");
    }
  }
  P(this);
};
function H(a, b) {
  return a.cells[b.x][b.y];
}
function K(a, b, c) {
  var d = H(a, b);
  a.i.push(new da(b, d));
  d.g = c;
  a.e = !0;
}
function J(a, b, c) {
  z(H(a, b)) != c && K(a, b, c);
}
function N(a) {
  for (var b in a.i) {
    a.i[b].n.g = null;
  }
  a.i.length = 0;
}
function fa(a, b) {
  var c = H(a, b), c = null != c.g ? c.g : c.value;
  if ("+" != c) {
    return c;
  }
  c = a.getContext(b);
  return c.left && c.right && !c.m && !c.k ? "\u2013" : !c.left && !c.right && c.m && c.k ? "|" : c.left && c.right && c.m && c.k ? "\u2013" : "+";
}
R.prototype.getContext = function(a) {
  var b = B(H(this, a.add(s))), c = B(H(this, a.add(t))), d = B(H(this, a.add(u)));
  a = B(H(this, a.add(v)));
  return new ca(b, c, d, a);
};
function P(a, b) {
  var c = [], d = a.i.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), e = a.i.filter(function(a, b) {
    return d.indexOf(d[b]) == b;
  });
  a.i.length = 0;
  for (var h in e) {
    var l = e[h].n;
    c.push(new D(e[h].position, null != l.value ? l.value : " "));
    var k = z(l);
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
function pa(a) {
  if (0 != a.N.length) {
    var b = a.N.pop(), c;
    for (c in b) {
      var d = b[c];
      K(a, d.position, d.value);
    }
    P(a, !0);
  }
}
function qa(a) {
  if (0 != a.M.length) {
    var b = a.M.pop(), c;
    for (c in b) {
      var d = b[c];
      K(a, d.position, d.value);
    }
    P(a);
  }
}
function S(a) {
  for (var b = new m(Number.MAX_VALUE, Number.MAX_VALUE), c = new m(-1, -1), d = 0;d < a.cells.length;d++) {
    for (var e = 0;e < a.cells[d].length;e++) {
      null != z(a.cells[d][e]) && (d < b.x && (b.x = d), e < b.y && (b.y = e), d > c.x && (c.x = d), e > c.y && (c.y = e));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var h = "", e = b.y;e <= c.y;e++) {
    for (var l = "", d = b.x;d <= c.x;d++) {
      var k = fa(a, new m(d, e)), l = l + (null == k ? " " : k)
    }
    h += l.replace("\\s+$/g", "") + "\n";
  }
  return h;
}
function ra(a, b, c) {
  b = b.split("\n");
  for (var d = new m(0, Math.round(b.length / 2)), e = 0;e < b.length;e++) {
    d.x = Math.max(d.x, Math.round(b[e].length / 2));
  }
  for (e = 0;e < b.length;e++) {
    for (var h = b[e], l = 0;l < h.length;l++) {
      var k = h.charAt(l);
      if ("\u2013" == k || "|" == k) {
        k = "+";
      }
      K(a, p((new m(l, e)).add(c), d), k);
    }
  }
}
;function T(a, b) {
  this.view = a;
  this.state = b;
  this.d = new L(b);
  this.mode = 0;
  this.p();
}
T.prototype.t = function(a) {
  var b = G(this.view, a);
  null == this.r && (this.r = b);
  n(b, this.r) || (this.view.canvas.style.cursor = this.d.j(b));
  2 != this.mode || n(b, this.r) || this.d.move(b);
  if (1 == this.mode) {
    var c = this.view;
    a = this.H.add(p(this.G, a).scale(1 / this.view.zoom));
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
    F(a.view);
  });
  $("#draw-tools > button.tool").click(function(a) {
    $("#text-tool-widget").hide(0);
    a = a.target.id;
    $("#draw-tools > button.tool").removeClass("active");
    $("#" + a).toggleClass("active");
    $(".dialog").removeClass("visible");
    "box-button" == a && (this.d = new L(this.state));
    "line-button" == a && (this.d = new ga(this.state));
    "freeform-button" == a && (this.d = new ha(this.state, "X"));
    "erase-button" == a && (this.d = new Q(this.state));
    "move-button" == a && (this.d = new ja(this.state));
    "text-button" == a && (this.d = new ia(this.state));
    "select-button" == a && (this.d = new la(this.state));
    P(this.state);
    this.view.canvas.focus();
  }.bind(this));
  $("#file-tools > button.tool").click(function(a) {
    a = a.target.id;
    $(".dialog").removeClass("visible");
    $("#" + a + "-dialog").toggleClass("visible");
    "import-button" == a && ($("#import-area").val(""), $("#import-area").focus());
    "export-button" == a && ($("#export-area").val(S(this.state)), $("#export-area").select());
    "clear-button" == a && this.state.clear();
    "undo-button" == a && pa(this.state);
    "redo-button" == a && qa(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    ra(this.state, $("#import-area").val(), G(this.view, new m(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    P(this.state);
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
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && pa(this.state), 89 == a.keyCode && qa(this.state), 88 == a.keyCode && (c = "<cut>");
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
    P(this.state);
  }.bind(this));
};
function sa(a, b) {
  this.s = !1;
  this.state = a;
  this.view = b;
  this.file = null;
  ta(this);
  $("#drive-button").click(function() {
    this.s ? ua(this) : (V(this, !1), va(this));
  }.bind(this));
  $("#drive-filename").click(function() {
    var a = "" + $("#drive-filename").text(), a = prompt("Enter new filename:", a);
    this.file.title = a;
    this.save();
    wa(this);
  }.bind(this));
  xa(this);
  $(window).bind("hashchange", function() {
    ya(this);
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
      ya(this);
    }.bind(this), 500));
  }.bind(a));
}
function ta(a) {
  window.gapi && window.gapi.auth && window.gapi.auth.authorize ? V(a, !0) : window.setTimeout(function() {
    ta(this);
  }.bind(a), 500);
}
function va(a) {
  window.setTimeout(function() {
    this.s ? ua(this) : (V(this, !0), va(this));
  }.bind(a), 1E3);
}
function za(a, b) {
  a.file = b;
  $("#drive-filename").text(b.title);
  window.location.hash = b.id;
}
function ua(a) {
  $("#drive-dialog").addClass("visible");
  var b = S(a.state);
  5 < b.length && b != a.C && a.save();
  wa(a);
}
function wa(a) {
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
function xa(a) {
  S(a.state) != a.C && a.file && a.file.editable && a.save();
  window.setTimeout(function() {
    xa(this);
  }.bind(a), 5E3);
}
sa.prototype.save = function() {
  var a = S(this.state);
  $("#drive-save-state").text("Saving...");
  W(Aa(this, a), function(b) {
    za(this, b);
    $("#drive-save-state").text("Saved");
    this.C = a;
  }.bind(this));
};
function ya(a) {
  1 < window.location.hash.length && ($("#drive-save-state").text("Loading..."), W(window.gapi.client.request({path:"/drive/v2/files/" + window.location.hash.substr(1, window.location.hash.length - 1), method:"GET"}), function(a) {
    za(this, a);
    Ba(this);
  }.bind(a)));
}
function Ba(a) {
  Ca(a.file.downloadUrl, function(a) {
    $("#drive-save-state").text("Loaded");
    this.state.clear();
    ra(this.state, a, G(this.view, new m(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    this.C = S(this.state);
  }.bind(a));
}
function Aa(a, b) {
  var c = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:null == a.file ? "Untitled ASCII Diagram" : a.file.title, mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({path:"/upload/drive/v2/files" + (null == a.file ? "" : "/" + a.file.id), method:null == a.file ? "POST" : "PUT", params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:c});
}
function Ca(a, b) {
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
;function Da(a) {
  this.c = a;
  this.p();
}
Da.prototype.p = function() {
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
      a = new m(a.clientX, a.clientY);
      c.mode = 1;
      c.G = a;
      c.H = c.view.offset;
    } else {
      c = this.c, a = new m(a.clientX, a.clientY), c.mode = 2, c.d.start(G(c.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    U(this.c);
  }.bind(this));
  $(a).mouseleave(function() {
    U(this.c);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.c.t(new m(a.clientX, a.clientY));
  }.bind(this));
};
function X(a) {
  this.c = a;
  this.B = this.l = !1;
  this.p();
}
function Ea(a, b) {
  a.L = b;
  a.Q = $.now();
  a.l = !1;
  window.setTimeout(function() {
    if (!this.l && !this.B && null != this.L) {
      var a = this.c;
      a.mode = 2;
      a.d.start(G(a.view, b));
    }
  }.bind(a), 150);
}
X.prototype.t = function(a) {
  if (!this.l && 150 > $.now() - this.Q && 6 < p(a, this.L).length()) {
    this.l = !0;
    var b = this.c;
    b.mode = 1;
    b.G = a;
    b.H = b.view.offset;
  }
  this.c.t(a);
};
X.prototype.reset = function() {
  this.B = this.l = !1;
  this.L = null;
};
X.prototype.p = function() {
  var a = this.c.view.canvas;
  $(a).bind("touchstart", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      Ea(this, new m(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new m(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new m(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        U(this.c);
        this.B = !0;
        this.l = !1;
        this.R = p(c, a).length();
        this.P = this.c.view.zoom;
      }
    }
  }.bind(this));
  $(a).bind("touchmove", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      this.t(new m(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new m(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new m(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        this.B && (c = this.P * p(c, a).length() / this.R, c = Math.max(Math.min(c, 5), 0.5), a = this.c.view, a.zoom = c, a.e = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    U(this.c);
  }.bind(this));
};
var Y = new R, Z = new E(Y), Fa = new T(Z, Y);
new X(Fa);
new Da(Fa);
new sa(Y, Z);
Z.animate();

