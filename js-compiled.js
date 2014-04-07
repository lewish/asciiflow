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
  this.M = Math.min(a.x, b.x);
  this.N = Math.min(a.y, b.y);
  this.H = Math.max(a.x, b.x);
  this.I = Math.max(a.y, b.y);
}
q.prototype.contains = function(a) {
  return a.x >= this.M && a.x <= this.H && a.y >= this.N && a.y <= this.I;
};
var r = new m(-1, 0), s = new m(1, 0), t = new m(0, -1), u = new m(0, 1), x = [r, s, t, u];
function ba() {
  this.g = this.value = null;
}
function y(a) {
  return null != a.g ? a.g : a.value;
}
function z(a) {
  return "+" == y(a);
}
function ca(a, b, c, d) {
  this.left = a;
  this.right = b;
  this.m = c;
  this.k = d;
}
function B(a) {
  return a.left + a.right + a.m + a.k;
}
function C(a, b) {
  this.position = a;
  this.value = b;
}
function da(a, b) {
  this.position = a;
  this.n = b;
}
;function D(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new m(9E3, 5100);
  this.e = !0;
  this.w = !1;
  E(this);
}
function E(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.e = !0;
}
D.prototype.animate = function() {
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
  var c = p(F(a, new m(0, 0)), new m(3, 3)), d = F(a, new m(a.canvas.width, a.canvas.height)).add(new m(3, 3));
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
  e = !a.w;
  b.font = "15px Courier New";
  for (var h = c.x;h < d.x;h++) {
    for (var l = c.y;l < d.y;l++) {
      var k = G(a.state, new m(h, l));
      if (z(k) || null != k.g && " " != y(k)) {
        a.context.fillStyle = null != k.g ? "#DEF" : "#F5F5F5", b.fillRect(9 * h - a.offset.x, 17 * (l - 1) - a.offset.y, 9, 17);
      }
      var v = H(a.state, new m(h, l));
      null == v || z(k) && !e || (a.context.fillStyle = "#000000", b.fillText(v, 9 * h - a.offset.x, 17 * l - a.offset.y - 3));
    }
  }
  if (a.w) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (e = c.x;e < d.x;e++) {
      for (k = !1, h = c.y;h < d.y;h++) {
        l = G(a.state, new m(e, h)), z(l) && h != d.y - 1 || !k || (b.moveTo(9 * e - a.offset.x + 4.5, 17 * k - a.offset.y - 8.5), b.lineTo(9 * e - a.offset.x + 4.5, 17 * (h - 1) - a.offset.y - 8.5), k = !1), z(l) && !k && (k = h);
      }
    }
    for (h = c.y;h < d.y;h++) {
      for (k = !1, e = c.x;e < d.x;e++) {
        l = G(a.state, new m(e, h)), z(l) && e != d.x - 1 || !k || (b.moveTo(9 * k - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), b.lineTo(9 * (e - 1) - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), k = !1), z(l) && !k && (k = e);
      }
    }
    a.context.stroke();
  }
}
function F(a, b) {
  return new m(Math.min(Math.max(1, Math.round(((new m((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new m((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function I(a, b, c, d, e) {
  e = e || "+";
  var h = new q(b, c), l = h.M, k = h.N, v = h.H, h = h.I, w = d ? c.x : b.x;
  for (d = d ? b.y : c.y;l++ < v;) {
    var L = new m(l, d), A = a.getContext(new m(l, d));
    " " == e && 2 == A.m + A.k || J(a, L, e);
  }
  for (;k++ < h;) {
    L = new m(w, k), A = a.getContext(new m(w, k)), " " == e && 2 == A.left + A.right || J(a, L, e);
  }
  K(a, b, e);
  K(a, c, e);
  J(a, new m(w, d), e);
}
function M(a) {
  this.state = a;
  this.a = null;
}
f = M.prototype;
f.start = function(a) {
  this.a = a;
};
f.move = function(a) {
  this.c = a;
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
function fa(a) {
  this.state = a;
  this.a = null;
}
f = fa.prototype;
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
function ga(a, b) {
  this.state = a;
  this.value = b;
  g && ($("#freeform-tool-input").val(""), $("#freeform-tool-input").hide(0, function() {
    $("#freeform-tool-input").show(0, function() {
      $("#freeform-tool-input").focus();
    });
  }));
}
f = ga.prototype;
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
function ha(a) {
  this.state = a;
  this.a = null;
}
f = ha.prototype;
f.start = function(a) {
  P(this.state);
  $("#text-tool-input").val("");
  this.a = a;
  a = y(G(this.state, this.a));
  K(this.state, this.a, null == a ? "\u2009" : a);
};
f.move = function() {
};
f.end = function() {
  null != this.a && (this.c = this.a, this.a = null, $("#text-tool-widget").hide(0, function() {
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
    "\n" == a[d] ? (c++, b = 0) : (K(this.state, this.c.add(new m(b, c)), a[d]), b++);
  }
};
function Q(a) {
  this.state = a;
  this.c = this.a = null;
}
f = Q.prototype;
f.start = function(a) {
  this.a = a;
  this.move(a);
};
f.move = function(a) {
  N(this.state);
  this.c = a;
  var b = Math.min(this.a.x, this.c.x);
  a = Math.min(this.a.y, this.c.y);
  for (var c = Math.max(this.a.x, this.c.x), d = Math.max(this.a.y, this.c.y);b <= c;b++) {
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
function ia(a) {
  this.state = a;
  this.h = this.a = null;
}
f = ia.prototype;
f.start = function(a) {
  if (g && !z(G(this.state, a))) {
    var b = x.concat([r.add(t), r.add(u), s.add(t), s.add(u)]), c = null, d = 0, e;
    for (e in b) {
      var h = a.add(b[e]), l = B(this.state.getContext(h));
      z(G(this.state, h)) && l > d && (c = b[e], d = l);
    }
    a = null == c ? a : a.add(c);
  }
  this.a = a;
  this.h = null;
  if (z(G(this.state, this.a))) {
    this.state.getContext(this.a);
    a = [];
    for (var k in x) {
      var b = ja(this, this.a, x[k]), v;
      for (v in b) {
        if (c = b[v], d = 0 != x[k].x, 1 == B(this.state.getContext(c))) {
          a.push({position:c, C:d});
        } else {
          for (var w in x) {
            0 != x[k].add(x[w]).length() && 2 != x[k].add(x[w]).length() && (e = ja(this, c, x[w]), 0 != e.length && a.push({position:e[e.length - 1], C:d}));
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
    I(this.state, this.a, this.h[b].position, this.h[b].C, " ");
  }
  for (b in this.h) {
    I(this.state, a, this.h[b].position, this.h[b].C);
  }
};
f.end = function() {
  P(this.state);
};
function ja(a, b, c) {
  for (var d = b.clone(), e = [];;) {
    var h = d.add(c);
    if (!z(G(a.state, h))) {
      return n(b, d) || e.push(d), e;
    }
    d = h;
    3 == B(a.state.getContext(d)) && e.push(d);
  }
}
f.j = function(a) {
  return z(G(this.state, a)) ? "pointer" : "default";
};
f.f = function() {
};
function ka(a) {
  this.state = a;
  this.D = this.o = this.c = this.a = null;
  this.J = !0;
  this.u = null;
}
f = ka.prototype;
f.start = function(a) {
  if (null != this.a && null != this.c && (new q(this.a, this.c)).contains(a)) {
    this.o = a;
    this.u = this.state.i.filter(function(a) {
      return null != y(a.n) && "\u2009" != y(a.n);
    }).map(function(a) {
      return new C(a.position, y(a.n));
    });
    var b = new Q(this.state);
    b.start(this.a);
    b.move(this.c);
    b.end();
    this.state.v.pop();
    la(this, a);
  } else {
    this.a = a, this.c = null, this.J = !1, this.move(a);
  }
};
f.move = function(a) {
  this.c = a;
  null != this.o && la(this, a);
  if (!0 != this.J) {
    N(this.state);
    a = new q(this.a, a);
    for (var b = a.M;b <= a.H;b++) {
      for (var c = a.N;c <= a.I;c++) {
        var d = new m(b, c), e = y(G(this.state, d));
        K(this.state, d, null == e ? "\u2009" : e);
      }
    }
  }
};
function la(a, b) {
  a.D = b;
  N(a.state);
  var c = p(a.o, a.D), d;
  for (d in a.u) {
    K(a.state, p(a.u[d].position, c), a.u[d].value);
  }
}
f.end = function() {
  null != this.o && (P(this.state), this.c = this.a = null);
  this.D = this.o = null;
  this.J = !0;
};
f.j = function(a) {
  return null != this.a && null != this.c && (new q(this.a, this.c)).contains(a) ? "pointer" : "default";
};
f.f = function() {
};
function R() {
  this.cells = Array(2E3);
  this.i = [];
  this.e = !0;
  this.v = [];
  this.L = [];
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
      null != y(this.cells[a][b]) && K(this, new m(a, b), "\u2009");
    }
  }
  P(this);
};
function G(a, b) {
  return a.cells[b.x][b.y];
}
function K(a, b, c) {
  var d = G(a, b);
  a.i.push(new da(b, d));
  d.g = c;
  a.e = !0;
}
function J(a, b, c) {
  y(G(a, b)) != c && K(a, b, c);
}
function N(a) {
  for (var b in a.i) {
    a.i[b].n.g = null;
  }
  a.i.length = 0;
}
function H(a, b) {
  var c = G(a, b), c = null != c.g ? c.g : c.value;
  if ("+" != c) {
    return c;
  }
  c = a.getContext(b);
  return c.left && c.right && !c.m && !c.k ? "\u2013" : !c.left && !c.right && c.m && c.k ? "|" : c.left && c.right && c.m && c.k ? "\u2013" : "+";
}
R.prototype.getContext = function(a) {
  var b = z(G(this, a.add(r))), c = z(G(this, a.add(s))), d = z(G(this, a.add(t)));
  a = z(G(this, a.add(u)));
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
    c.push(new C(e[h].position, null != l.value ? l.value : " "));
    var k = y(l);
    if ("\u2009" == k || " " == k) {
      k = null;
    }
    l.g = null;
    l.value = k;
  }
  e = b ? a.L : a.v;
  0 < c.length && (50 < e.length && e.shift(), e.push(c));
  a.e = !0;
}
function ma(a) {
  if (0 != a.v.length) {
    var b = a.v.pop(), c;
    for (c in b) {
      var d = b[c];
      K(a, d.position, d.value);
    }
    P(a, !0);
  }
}
function na(a) {
  if (0 != a.L.length) {
    var b = a.L.pop(), c;
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
      null != y(a.cells[d][e]) && (d < b.x && (b.x = d), e < b.y && (b.y = e), d > c.x && (c.x = d), e > c.y && (c.y = e));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var h = "", e = b.y;e <= c.y;e++) {
    for (var l = "", d = b.x;d <= c.x;d++) {
      var k = H(a, new m(d, e)), l = l + (null == k ? " " : k)
    }
    h += l.replace("\\s+$/g", "") + "\n";
  }
  return h;
}
function oa(a, b, c) {
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
  this.d = new M(b);
  this.mode = 0;
  this.p();
}
T.prototype.t = function(a) {
  var b = F(this.view, a);
  null == this.r && (this.r = b);
  n(b, this.r) || (this.view.canvas.style.cursor = this.d.j(b));
  2 != this.mode || n(b, this.r) || this.d.move(b);
  if (1 == this.mode) {
    var c = this.view;
    a = this.G.add(p(this.F, a).scale(1 / this.view.zoom));
    c.offset = a;
    c.e = !0;
  }
  this.r = b;
};
function U(a) {
  2 == a.mode && a.d.end();
  a.mode = 0;
  a.F = null;
  a.G = null;
  a.r = null;
}
T.prototype.p = function() {
  var a = this;
  $(window).resize(function() {
    E(a.view);
  });
  $("#draw-tools > button.tool").click(function(a) {
    $("#text-tool-widget").hide(0);
    a = a.target.id;
    $("#draw-tools > button.tool").removeClass("active");
    $("#" + a).toggleClass("active");
    $(".dialog").removeClass("visible");
    "box-button" == a && (this.d = new M(this.state));
    "line-button" == a && (this.d = new fa(this.state));
    "freeform-button" == a && (this.d = new ga(this.state, "X"));
    "erase-button" == a && (this.d = new Q(this.state));
    "move-button" == a && (this.d = new ia(this.state));
    "text-button" == a && (this.d = new ha(this.state));
    "select-button" == a && (this.d = new ka(this.state));
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
    "undo-button" == a && ma(this.state);
    "redo-button" == a && na(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    oa(this.state, $("#import-area").val(), F(this.view, new m(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    P(this.state);
    $("#import-area").val("");
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#use-lines-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.w = !0;
    a.e = !0;
  }.bind(this));
  $("#use-ascii-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.w = !1;
    a.e = !0;
  }.bind(this));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || 13 == a.keyCode || this.d.f(String.fromCharCode(a.keyCode));
  }.bind(this));
  $(window).keydown(function(a) {
    var c = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && ma(this.state), 89 == a.keyCode && na(this.state), 88 == a.keyCode && (c = "<cut>");
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
function pa(a, b) {
  this.s = !1;
  this.state = a;
  this.view = b;
  this.file = null;
  qa(this);
  $("#drive-button").click(function() {
    this.s ? ra(this) : (V(this, !1), sa(this));
  }.bind(this));
  $("#drive-filename").click(function() {
    var a = "" + $("#drive-filename").text(), a = prompt("Enter new filename:", a);
    this.file.title = a;
    this.save();
    ta(this);
  }.bind(this));
  ua(this);
  $(window).bind("hashchange", function() {
    va(this);
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
      va(this);
    }.bind(this), 500));
  }.bind(a));
}
function qa(a) {
  window.gapi && window.gapi.auth && window.gapi.auth.authorize ? V(a, !0) : window.setTimeout(function() {
    qa(this);
  }.bind(a), 500);
}
function sa(a) {
  window.setTimeout(function() {
    this.s ? ra(this) : (V(this, !0), sa(this));
  }.bind(a), 1E3);
}
function wa(a, b) {
  a.file = b;
  $("#drive-filename").text(b.title);
  window.location.hash = b.id;
}
function ra(a) {
  $("#drive-dialog").addClass("visible");
  var b = S(a.state);
  5 < b.length && b != a.B && a.save();
  ta(a);
}
function ta(a) {
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
function ua(a) {
  S(a.state) != a.B && a.file && a.file.editable && a.save();
  window.setTimeout(function() {
    ua(this);
  }.bind(a), 5E3);
}
pa.prototype.save = function() {
  var a = S(this.state);
  $("#drive-save-state").text("Saving...");
  W(xa(this, a), function(b) {
    wa(this, b);
    $("#drive-save-state").text("Saved");
    this.B = a;
  }.bind(this));
};
function va(a) {
  1 < window.location.hash.length && ($("#drive-save-state").text("Loading..."), W(window.gapi.client.request({path:"/drive/v2/files/" + window.location.hash.substr(1, window.location.hash.length - 1), method:"GET"}), function(a) {
    wa(this, a);
    ya(this);
  }.bind(a)));
}
function ya(a) {
  za(a.file.downloadUrl, function(a) {
    $("#drive-save-state").text("Loaded");
    this.state.clear();
    oa(this.state, a, F(this.view, new m(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    this.B = S(this.state);
  }.bind(a));
}
function xa(a, b) {
  var c = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:null == a.file ? "Untitled ASCII Diagram" : a.file.title, mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({path:"/upload/drive/v2/files" + (null == a.file ? "" : "/" + a.file.id), method:null == a.file ? "POST" : "PUT", params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:c});
}
function za(a, b) {
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
;function Aa(a) {
  this.b = a;
  this.p();
}
Aa.prototype.p = function() {
  var a = this.b.view.canvas;
  $(a).bind("mousewheel", function(a) {
    a = this.b.view.zoom * (0 < a.originalEvent.wheelDelta ? 1.1 : 0.9);
    a = Math.max(Math.min(a, 5), 0.2);
    var c = this.b.view;
    c.zoom = a;
    c.e = !0;
  }.bind(this));
  $(a).mousedown(function(a) {
    if (a.ctrlKey || a.metaKey) {
      var c = this.b;
      a = new m(a.clientX, a.clientY);
      c.mode = 1;
      c.F = a;
      c.G = c.view.offset;
    } else {
      c = this.b, a = new m(a.clientX, a.clientY), c.mode = 2, c.d.start(F(c.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    U(this.b);
  }.bind(this));
  $(a).mouseleave(function() {
    U(this.b);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.b.t(new m(a.clientX, a.clientY));
  }.bind(this));
};
function X(a) {
  this.b = a;
  this.A = this.l = !1;
  this.p();
}
function Ba(a, b) {
  a.K = b;
  a.Q = $.now();
  a.l = !1;
  window.setTimeout(function() {
    if (!this.l && !this.A && null != this.K) {
      var a = this.b;
      a.mode = 2;
      a.d.start(F(a.view, b));
    }
  }.bind(a), 150);
}
X.prototype.t = function(a) {
  if (!this.l && 150 > $.now() - this.Q && 6 < p(a, this.K).length()) {
    this.l = !0;
    var b = this.b;
    b.mode = 1;
    b.F = a;
    b.G = b.view.offset;
  }
  this.b.t(a);
};
X.prototype.reset = function() {
  this.A = this.l = !1;
  this.K = null;
};
X.prototype.p = function() {
  var a = this.b.view.canvas;
  $(a).bind("touchstart", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      Ba(this, new m(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new m(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new m(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        U(this.b);
        this.A = !0;
        this.l = !1;
        this.R = p(c, a).length();
        this.P = this.b.view.zoom;
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
        this.A && (c = this.P * p(c, a).length() / this.R, c = Math.max(Math.min(c, 5), 0.5), a = this.b.view, a.zoom = c, a.e = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    U(this.b);
  }.bind(this));
};
var Y = new R, Z = new D(Y), Ca = new T(Z, Y);
new X(Ca);
new Aa(Ca);
new pa(Y, Z);
Z.animate();

