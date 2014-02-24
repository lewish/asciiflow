try {
  throw 1;
} catch (aa) {
  window.B = window.B || {};
}
var ba = "ontouchstart" in window || "onmsgesturechange" in window;
function f(a, b) {
  this.x = a;
  this.y = b;
}
function l(a, b) {
  return null != b && a.x == b.x && a.y == b.y;
}
function m(a, b) {
  return new f(a.x - b.x, a.y - b.y);
}
f.prototype.add = function(a) {
  return new f(this.x + a.x, this.y + a.y);
};
f.prototype.clone = function() {
  return new f(this.x, this.y);
};
f.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
f.prototype.scale = function(a) {
  return new f(this.x * a, this.y * a);
};
var n = new f(-1, 0), p = new f(1, 0), q = new f(0, -1), r = new f(0, 1), s = [n, p, q, r];
function ca() {
  this.f = this.value = null;
}
function u(a) {
  return null != a.f ? a.f : a.value;
}
function v(a) {
  return "+" == u(a);
}
function da(a, b, c, e) {
  this.left = a;
  this.right = b;
  this.n = c;
  this.j = e;
}
function w(a) {
  return a.left + a.right + a.n + a.j;
}
function ea(a, b) {
  this.position = a;
  this.value = b;
}
function fa(a, b) {
  this.position = a;
  this.w = b;
}
;function x(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new f(7500, 7500);
  this.d = !0;
  y(this);
}
function y(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.d = !0;
}
x.prototype.animate = function() {
  if (this.d || this.state.d) {
    this.d = !1, this.state.d = !1, ga(this);
  }
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function ga(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = z(a, new f(-70, -70)), e = z(a, new f(a.canvas.width + 70, a.canvas.height + 70));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var d = c.x;d < e.x;d++) {
    b.moveTo(9 * d - a.offset.x, 0 - a.offset.y), b.lineTo(9 * d - a.offset.x, 17 * a.state.cells.length - a.offset.y);
  }
  for (var g = c.y;g < e.y;g++) {
    b.moveTo(0 - a.offset.x, 17 * g - a.offset.y), b.lineTo(9 * a.state.cells.length - a.offset.x, 17 * g - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (d = c.x;d < e.x;d++) {
    for (g = c.y;g < e.y;g++) {
      var h = A(a.state, new f(d, g));
      if (v(h) || null != h.f && " " != u(h)) {
        a.context.fillStyle = null != h.f ? "#DEF" : "#F5F5F5", b.fillRect(9 * d - a.offset.x, 17 * (g - 1) - a.offset.y, 9, 17);
      }
      h = C(a.state, new f(d, g));
      null != h && (a.context.fillStyle = "#000000", b.fillText(h, 9 * d - a.offset.x, 17 * g - a.offset.y - 3));
    }
  }
}
function z(a, b) {
  return new f(Math.min(Math.max(1, Math.round(((new f((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new f((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function D(a, b, c, e, d) {
  d = d || "+";
  var g = Math.min(b.x, c.x), h = Math.min(b.y, c.y), k = Math.max(b.x, c.x), J = Math.max(b.y, c.y), t = e ? c.x : b.x;
  for (e = e ? b.y : c.y;g++ < k;) {
    var O = new f(g, e), H = a.getContext(new f(g, e));
    " " == d && 2 == H.n + H.j || E(a, O, d);
  }
  for (;h++ < J;) {
    O = new f(t, h), H = a.getContext(new f(t, h)), " " == d && 2 == H.left + H.right || E(a, O, d);
  }
  F(a, b, d);
  F(a, c, d);
  E(a, new f(t, e), d);
}
function G(a) {
  this.state = a;
  this.a = null;
}
G.prototype.start = function(a) {
  this.a = a;
};
G.prototype.move = function(a) {
  this.l = a;
  I(this.state);
  D(this.state, this.a, a, !0);
  D(this.state, this.a, a, !1);
};
G.prototype.end = function() {
  K(this.state);
};
G.prototype.m = function() {
  return "crosshair";
};
G.prototype.h = function() {
};
function L(a) {
  this.state = a;
  this.a = null;
}
L.prototype.start = function(a) {
  this.a = a;
};
L.prototype.move = function(a) {
  I(this.state);
  var b = this.state.getContext(this.a), c = this.state.getContext(a);
  D(this.state, this.a, a, b.n && b.j || c.left && c.right);
};
L.prototype.end = function() {
  K(this.state);
};
L.prototype.m = function() {
  return "crosshair";
};
L.prototype.h = function() {
};
function M(a, b) {
  this.state = a;
  this.value = b;
}
M.prototype.start = function(a) {
  F(this.state, a, this.value);
};
M.prototype.move = function(a) {
  F(this.state, a, this.value);
};
M.prototype.end = function() {
  K(this.state);
};
M.prototype.m = function() {
  return "crosshair";
};
M.prototype.h = function(a) {
  1 == a.length && (this.value = a);
};
function N(a) {
  this.state = a;
  this.e = this.a = null;
}
N.prototype.start = function(a) {
  this.e = this.a = a;
  I(this.state);
  var b = u(A(this.state, a));
  F(this.state, a, null == b ? "\u2009" : b);
};
N.prototype.move = function() {
};
N.prototype.end = function() {
};
N.prototype.m = function() {
  return "text";
};
N.prototype.h = function(a) {
  if (null != this.e) {
    var b = this.e.add(p);
    if ("<enter>" == a || v(A(this.state, b))) {
      I(this.state), this.a = b = this.a.add(r);
    }
    "<backspace>" == a && this.a.x <= b.x && (I(this.state), b = this.e.add(n), b.x < this.a.x && (b.x = this.a.x), F(this.state, b, "\u2009"), K(this.state));
    "<up>" == a && (I(this.state), this.a = b = this.e.add(q));
    "<left>" == a && (I(this.state), this.a = b = this.e.add(n));
    "<right>" == a && (I(this.state), this.a = b = this.e.add(p));
    "<down>" == a && (I(this.state), this.a = b = this.e.add(r));
    1 == a.length && (F(this.state, this.e, a), K(this.state));
    this.e = b;
    a = u(A(this.state, b));
    F(this.state, b, null == a ? "\u2009" : a);
  }
};
function P(a) {
  this.state = a;
  this.l = this.a = null;
}
P.prototype.start = function(a) {
  this.a = a;
  this.move(a);
};
P.prototype.move = function(a) {
  I(this.state);
  this.l = a;
  var b = Math.min(this.a.x, this.l.x);
  a = Math.min(this.a.y, this.l.y);
  for (var c = Math.max(this.a.x, this.l.x), e = Math.max(this.a.y, this.l.y);b <= c;b++) {
    for (var d = a;d <= e;d++) {
      F(this.state, new f(b, d), "\u2009");
    }
  }
};
P.prototype.end = function() {
  K(this.state);
};
P.prototype.m = function() {
  return "crosshair";
};
P.prototype.h = function() {
};
function Q(a) {
  this.state = a;
  this.g = this.a = null;
}
Q.prototype.start = function(a) {
  if (ba && !v(A(this.state, a))) {
    var b = s.concat([n.add(q), n.add(r), p.add(q), p.add(r)]), c = null, e = 0, d;
    for (d in b) {
      var g = a.add(b[d]), h = w(this.state.getContext(g));
      v(A(this.state, g)) && h > e && (c = b[d], e = h);
    }
    a = null == c ? a : a.add(c);
  }
  this.a = a;
  this.g = null;
  if (v(A(this.state, this.a))) {
    this.state.getContext(this.a);
    a = [];
    for (var k in s) {
      var b = R(this, this.a, s[k]), J;
      for (J in b) {
        if (c = b[J], e = 0 != s[k].x, 1 == w(this.state.getContext(c))) {
          a.push({position:c, t:e});
        } else {
          for (var t in s) {
            0 != s[k].add(s[t]).length() && 2 != s[k].add(s[t]).length() && (d = R(this, c, s[t]), 0 != d.length && a.push({position:d[d.length - 1], t:e}));
          }
        }
      }
    }
    this.g = a;
    this.move(this.a);
  }
};
Q.prototype.move = function(a) {
  I(this.state);
  for (var b in this.g) {
    D(this.state, this.a, this.g[b].position, this.g[b].t, " ");
  }
  for (b in this.g) {
    D(this.state, a, this.g[b].position, this.g[b].t);
  }
};
Q.prototype.end = function() {
  K(this.state);
};
function R(a, b, c) {
  for (var e = b.clone(), d = [];;) {
    var g = e.add(c);
    if (!v(A(a.state, g))) {
      return l(b, e) || d.push(e), d;
    }
    e = g;
    3 == w(a.state.getContext(e)) && d.push(e);
  }
}
Q.prototype.m = function(a) {
  return v(A(this.state, a)) ? "pointer" : "default";
};
Q.prototype.h = function() {
};
function S() {
  this.cells = Array(2E3);
  this.i = [];
  this.d = !0;
  this.q = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(600);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new ca;
    }
  }
}
S.prototype.clear = function() {
  for (var a = 0;a < this.cells.length;a++) {
    for (var b = 0;b < this.cells[a].length;b++) {
      null != u(this.cells[a][b]) && F(this, new f(a, b), "\u2009");
    }
  }
  K(this);
};
function A(a, b) {
  return a.cells[b.x][b.y];
}
function F(a, b, c) {
  var e = A(a, b);
  a.i.push(new fa(b, e));
  e.f = c;
  a.d = !0;
}
function E(a, b, c) {
  u(A(a, b)) != c && F(a, b, c);
}
function I(a) {
  for (var b in a.i) {
    a.i[b].w.f = null;
  }
  a.i.length = 0;
}
function C(a, b) {
  var c = A(a, b), c = null != c.f ? c.f : c.value;
  if ("+" != c) {
    return c;
  }
  c = a.getContext(b);
  return c.left && c.right && !c.n && !c.j ? "\u2013" : !c.left && !c.right && c.n && c.j ? "|" : c.left && c.right && c.n && c.j ? "\u2013" : "+";
}
S.prototype.getContext = function(a) {
  var b = v(A(this, a.add(n))), c = v(A(this, a.add(p))), e = v(A(this, a.add(q)));
  a = v(A(this, a.add(r)));
  return new da(b, c, e, a);
};
function K(a, b) {
  var c = [], e = a.i.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), d = a.i.filter(function(a, b) {
    return e.indexOf(e[b]) == b;
  });
  a.i.length = 0;
  for (var g in d) {
    var h = d[g].w;
    c.push(new ea(d[g].position, null != h.value ? h.value : " "));
    var k = u(h);
    if ("\u2009" == k || " " == k) {
      k = null;
    }
    h.f = null;
    h.value = k;
  }
  !b && 0 < c.length && (50 < a.q.length && a.q.shift(), a.q.push(c));
  a.d = !0;
}
function T(a) {
  if (0 != a.q.length) {
    var b = a.q.pop(), c;
    for (c in b) {
      var e = b[c];
      F(a, e.position, e.value);
    }
    K(a, !0);
  }
}
function ha(a) {
  for (var b = new f(Number.MAX_VALUE, Number.MAX_VALUE), c = new f(-1, -1), e = 0;e < a.cells.length;e++) {
    for (var d = 0;d < a.cells[e].length;d++) {
      null != u(a.cells[e][d]) && (e < b.x && (b.x = e), d < b.y && (b.y = d), e > c.x && (c.x = e), d > c.y && (c.y = d));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var g = "", d = b.y;d <= c.y;d++) {
    for (var h = "", e = b.x;e <= c.x;e++) {
      var k = C(a, new f(e, d)), h = h + (null == k ? " " : k)
    }
    g += h.replace("\\s+$/g", "") + "\n";
  }
  return g;
}
;function U(a, b) {
  this.view = a;
  this.state = b;
  this.c = new G(b);
  this.mode = 0;
  this.o();
}
U.prototype.r = function(a) {
  var b = z(this.view, a);
  null == this.p && (this.p = b);
  l(b, this.p) || (this.view.canvas.style.cursor = this.c.m(b));
  2 != this.mode || l(b, this.p) || this.c.move(b);
  if (1 == this.mode) {
    var c = this.view;
    a = this.v.add(m(this.u, a).scale(1 / this.view.zoom));
    c.offset = a;
    c.d = !0;
  }
  this.p = b;
};
function V(a) {
  (a.mode = 2) && a.c.end();
  a.mode = 0;
  a.u = null;
  a.v = null;
  a.p = null;
}
U.prototype.o = function() {
  var a = this;
  $(window).resize(function() {
    y(a.view);
  });
  $("button.tool").click(function(a) {
    a = a.target.id;
    $("button.tool").removeClass("active");
    $(".dialog").removeClass("visible");
    $("#" + a).toggleClass("active");
    $("#" + a + "-dialog").toggleClass("visible");
    "box-button" == a && (this.c = new G(this.state));
    "line-button" == a && (this.c = new L(this.state));
    "freeform-button" == a && (this.c = new M(this.state, "+"));
    "erase-button" == a && (this.c = new P(this.state));
    "move-button" == a && (this.c = new Q(this.state));
    "text-button" == a && (this.c = new N(this.state));
    "export-button" == a && $("#export-area").val(ha(this.state));
    "clear-button" == a && this.state.clear();
    "undo-button" == a && T(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    for (var a = this.state, c = $("#import-area").val(), e = z(this.view, new f(this.view.canvas.width / 4, this.view.canvas.height / 4)), c = c.split("\n"), d = 0;d < c.length;d++) {
      for (var g = c[d], h = 0;h < g.length;h++) {
        var k = g.charAt(h);
        if ("\u2013" == k || "|" == k) {
          k = "+";
        }
        F(a, (new f(h, d)).add(e), k);
      }
    }
    K(a);
    $("#import-area").val("");
  }.bind(this));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || 13 == a.keyCode || this.c.h(String.fromCharCode(a.keyCode));
  }.bind(this));
  $(window).keydown(function(a) {
    var c = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && T(this.state), 88 == a.keyCode && (c = "<cut>");
    }
    8 == a.keyCode && (c = "<backspace>");
    13 == a.keyCode && (c = "<enter>");
    38 == a.keyCode && (c = "<up>");
    40 == a.keyCode && (c = "<down>");
    37 == a.keyCode && (c = "<left>");
    39 == a.keyCode && (c = "<right>");
    null != c && this.c.h(c);
  }.bind(this));
};
function W(a) {
  this.b = a;
  this.o();
}
W.prototype.o = function() {
  var a = this.b.view.canvas;
  $(a).bind("mousewheel", function(a) {
    a = this.b.view.zoom * (0 < a.originalEvent.wheelDelta ? 1.1 : 0.9);
    a = Math.max(Math.min(a, 5), 0.2);
    var c = this.b.view;
    c.zoom = a;
    c.d = !0;
  }.bind(this));
  $(a).mousedown(function(a) {
    if (a.ctrlKey || a.metaKey) {
      var c = this.b;
      a = new f(a.clientX, a.clientY);
      c.mode = 1;
      c.u = a;
      c.v = c.view.offset;
    } else {
      c = this.b, a = new f(a.clientX, a.clientY), c.mode = 2, c.c.start(z(c.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    V(this.b);
  }.bind(this));
  $(a).mouseleave(function() {
    V(this.b);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.b.r(new f(a.clientX, a.clientY));
  }.bind(this));
};
function X(a) {
  this.b = a;
  this.s = this.k = !1;
  this.o();
}
function ia(a, b) {
  a.A = b;
  a.D = $.now();
  a.k = !1;
  window.setTimeout(function() {
    if (!this.k && !this.s) {
      var a = this.b;
      a.mode = 2;
      a.c.start(z(a.view, b));
    }
  }.bind(a), 130);
}
X.prototype.r = function(a) {
  if (!this.k && 130 > $.now() - this.D && 3 < m(a, this.A).length()) {
    this.k = !0;
    var b = this.b;
    b.mode = 1;
    b.u = a;
    b.v = b.view.offset;
  }
  this.b.r(a);
};
X.prototype.reset = function() {
  this.s = this.k = !1;
  this.A = null;
};
X.prototype.o = function() {
  var a = this.b.view.canvas;
  $(a).bind("touchstart", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      ia(this, new f(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new f(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new f(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        V(this.b);
        this.s = !0;
        this.k = !1;
        this.F = m(c, a).length();
        this.C = this.b.view.zoom;
      }
    }
  }.bind(this));
  $(a).bind("touchmove", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      this.r(new f(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new f(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new f(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        this.s && (c = this.C * m(c, a).length() / this.F, c = Math.max(Math.min(c, 5), 0.5), a = this.b.view, a.zoom = c, a.d = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    V(this.b);
  }.bind(this));
};
var Y = new S, Z = new x(Y), ja = new U(Z, Y);
new X(ja);
new W(ja);
Z.animate();

