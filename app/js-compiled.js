function f(a, b) {
  this.x = a;
  this.y = b;
}
function k(a, b) {
  return null != b && a.x == b.x && a.y == b.y;
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
function l() {
  this.e = this.value = null;
}
function n(a) {
  return null != a.e ? a.e : a.value;
}
function q(a) {
  return "+" == n(a);
}
function r(a, b, c, e) {
  this.left = a;
  this.right = b;
  this.k = c;
  this.f = e;
}
function s(a, b) {
  this.position = a;
  this.value = b;
}
function t(a, b) {
  this.position = a;
  this.s = b;
}
;function u(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new f(7500, 7500);
  this.b = !0;
  w(this);
}
function w(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.b = !0;
}
u.prototype.animate = function() {
  this.b && (this.b = !1, x(this));
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function x(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = y(z(a, new f(-70, -70))), e = y(z(a, new f(a.canvas.width + 70, a.canvas.height + 70)));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var d = c.x;d < e.x;d++) {
    b.moveTo(15 * d - a.offset.x, 0 - a.offset.y), b.lineTo(15 * d - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var h = c.y;h < e.y;h++) {
    b.moveTo(0 - a.offset.x, 15 * h - a.offset.y), b.lineTo(15 * a.state.cells.length - a.offset.x, 15 * h - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (d = c.x;d < e.x;d++) {
    for (h = c.y;h < e.y;h++) {
      var g = A(a.state, new f(d, h));
      if (null != g.e || q(g)) {
        a.context.fillStyle = null != g.e ? "#DEF" : "#F5F5F5", b.fillRect(15 * d - a.offset.x, 15 * (h - 1) - a.offset.y, 15, 15);
      }
      g = B(a.state, new f(d, h));
      null != g && (a.context.fillStyle = "#000000", b.fillText(g, 15 * d - a.offset.x + 3, 15 * h - a.offset.y - 2));
    }
  }
}
function z(a, b) {
  return new f((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y);
}
function y(a) {
  return new f(Math.round((a.x - 7.5) / 15), Math.round((a.y + 7.5) / 15));
}
;function C(a, b, c, e, d) {
  d = d || "+";
  var h = Math.min(b.x, c.x), g = Math.min(b.y, c.y), m = Math.max(b.x, c.x), p = Math.max(b.y, c.y), v = e ? c.x : b.x;
  for (e = e ? b.y : c.y;h++ < m;) {
    D(a, new f(h, e), d);
  }
  for (;g++ < p;) {
    D(a, new f(v, g), d);
  }
  D(a, b, d);
  D(a, c, d);
  D(a, new f(v, e), d);
}
function E(a) {
  this.state = a;
  this.a = null;
}
E.prototype.start = function(a) {
  this.a = a;
};
E.prototype.move = function(a) {
  this.l = a;
  F(this.state);
  C(this.state, this.a, a, !0);
  C(this.state, this.a, a, !1);
};
E.prototype.end = function() {
  G(this.state);
};
E.prototype.m = function() {
  return "crosshair";
};
E.prototype.h = function() {
};
function H(a) {
  this.state = a;
  this.a = null;
}
H.prototype.start = function(a) {
  this.a = a;
};
H.prototype.move = function(a) {
  F(this.state);
  var b = this.state.getContext(this.a), c = this.state.getContext(a);
  C(this.state, this.a, a, b.k && b.f || c.left && c.right);
};
H.prototype.end = function() {
  G(this.state);
};
H.prototype.m = function() {
  return "crosshair";
};
H.prototype.h = function() {
};
function I(a, b) {
  this.state = a;
  this.value = b;
}
I.prototype.start = function(a) {
  D(this.state, a, this.value);
};
I.prototype.move = function(a) {
  D(this.state, a, this.value);
};
I.prototype.end = function() {
  G(this.state);
};
I.prototype.m = function() {
  return "crosshair";
};
I.prototype.h = function() {
};
function J(a) {
  this.state = a;
  this.d = this.a = null;
}
J.prototype.start = function(a) {
  this.d = this.a = a;
  F(this.state);
  var b = n(A(this.state, a));
  D(this.state, a, null == b ? " " : b);
};
J.prototype.move = function() {
};
J.prototype.end = function() {
};
J.prototype.m = function() {
  return "text";
};
J.prototype.h = function(a) {
  if (null != this.d) {
    var b = this.d.add(new f(1, 0));
    if ("<enter>" == a || q(A(this.state, b))) {
      F(this.state), this.a = b = this.a.add(new f(0, 1));
    }
    "<backspace>" == a && this.a.x <= b.x && (F(this.state), b = this.d.add(new f(-1, 0)), D(this.state, b, " "), G(this.state));
    "<up>" == a && (F(this.state), this.a = b = this.d.add(new f(0, -1)));
    "<left>" == a && (F(this.state), this.a = b = this.d.add(new f(-1, 0)));
    "<right>" == a && (F(this.state), this.a = b = this.d.add(new f(1, 0)));
    "<down>" == a && (F(this.state), this.a = b = this.d.add(new f(0, 1)));
    1 == a.length && (D(this.state, this.d, a), G(this.state));
    this.d = b;
    a = n(A(this.state, b));
    D(this.state, b, null == a ? " " : a);
  }
};
function K(a) {
  this.state = a;
  this.l = this.a = null;
}
K.prototype.start = function(a) {
  this.a = a;
  this.move(a);
};
K.prototype.move = function(a) {
  F(this.state);
  this.l = a;
  var b = Math.min(this.a.x, this.l.x);
  a = Math.min(this.a.y, this.l.y);
  for (var c = Math.max(this.a.x, this.l.x), e = Math.max(this.a.y, this.l.y);b <= c;b++) {
    for (var d = a;d <= e;d++) {
      D(this.state, new f(b, d), " ");
    }
  }
};
K.prototype.end = function() {
  G(this.state);
};
K.prototype.m = function() {
  return "crosshair";
};
K.prototype.h = function() {
};
function L(a) {
  this.state = a;
  this.o = null;
}
L.prototype.start = function(a) {
  this.state.getContext(a);
  var b = [new f(1, 0), new f(-1, 0), new f(0, 1), new f(0, -1)], c = [], e;
  for (e in b) {
    var d = M(this, a, b[e]), h;
    for (h in d) {
      var g = d[h], m = 0 != b[e].x;
      if (!k(a, g)) {
        var p = this.state.getContext(g);
        if (1 == p.left + p.right + p.k + p.f) {
          c.push({position:g, q:m});
        } else {
          for (var v in b) {
            0 != b[e].add(b[v]).length() && 2 != b[e].add(b[v]).length() && (p = M(this, g, b[v]), 0 == p.length || k(g, p[0]) || c.push({position:p[0], q:m}));
          }
        }
      }
    }
  }
  this.o = c;
  for (e in c) {
    C(this.state, a, c[e].position, c[e].q, " ");
  }
  G(this.state);
  this.move(a);
};
L.prototype.move = function(a) {
  F(this.state);
  for (var b in this.o) {
    C(this.state, a, this.o[b].position, this.o[b].q);
  }
};
L.prototype.end = function() {
  G(this.state);
};
function M(a, b, c) {
  b = b.clone();
  for (var e = [];;) {
    var d = b.add(c);
    if (!q(A(a.state, b)) || !q(A(a.state, d))) {
      return e;
    }
    b = d;
    d = a.state.getContext(d);
    d.left && d.right && !d.k && !d.f || !d.left && !d.right && d.k && d.f || e.push(b);
  }
}
L.prototype.m = function(a) {
  return q(A(this.state, a)) ? "pointer" : "default";
};
L.prototype.h = function() {
};
function N(a, b) {
  a.i = b;
  a.p = $.now();
  window.setTimeout(function() {
    null == this.g && null != this.i && (this.c.start(y(z(this.view, b))), this.view.b = !0);
  }.bind(a), 130);
}
function O(a, b) {
  a.view.canvas.style.cursor = a.c.m(y(z(a.view, b)));
  if (null != a.i && (null == a.g && 130 > $.now() - a.p && 3 < (new f(b.x - a.i.x, b.y - a.i.y)).length() && (a.g = a.view.offset), null == a.g && 130 <= $.now() - a.p && (null == a.r || !k(y(z(a.view, b)), y(z(a.view, a.r)))) && (a.c.move(y(z(a.view, b))), a.view.b = !0, a.r = b), null != a.g)) {
    var c = a.view, e = a.g.add((new f(a.i.x - b.x, a.i.y - b.y)).scale(1 / a.view.zoom));
    c.offset = e;
    c.b = !0;
  }
}
function P(a, b) {
  null == a.g && 130 <= $.now() - a.p && (a.c.end(y(z(a.view, b))), a.view.b = !0);
  a.i = null;
  a.p = 0;
  a.g = null;
  a.r = null;
}
function Q(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var c = a.view;
    c.zoom = b;
    c.b = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    N(a, new f(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function(b) {
    P(a, new f(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseleave(function(b) {
    P(a, new f(b.clientX, b.clientY));
  });
  $(a.view.canvas).mousemove(function(b) {
    O(a, new f(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    w(a.view);
  });
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    N(a, new f(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    P(a, new f(0, 0));
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    O(a, new f(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $("#buttons > button.tool").click(function(a) {
    a = a.target.id;
    $("#buttons > button.tool").removeClass("active");
    $(".dialog").removeClass("visible");
    $("#" + a).addClass("active");
    $("#" + a + "-dialog").addClass("visible");
    "box-button" == a && (this.c = new E(this.state));
    "line-button" == a && (this.c = new H(this.state));
    "freeform-button" == a && (this.c = new I(this.state, "+"));
    "erase-button" == a && (this.c = new K(this.state));
    "move-button" == a && (this.c = new L(this.state));
    "text-button" == a && (this.c = new J(this.state));
    "export-button" == a && $("#export-area").val(R(this.state));
  }.bind(a));
  $("#undo-button").click(function() {
    S(this.state);
    this.view.b = !0;
  }.bind(a));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || (this.c.h(String.fromCharCode(a.keyCode)), this.view.b = !0);
  }.bind(a));
  $(window).keydown(function(a) {
    var c = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && (S(this.state), this.view.b = !0), 88 == a.keyCode && (c = "<cut>");
    }
    8 == a.keyCode && (c = "<backspace>");
    13 == a.keyCode && (c = "<enter>");
    38 == a.keyCode && (c = "<up>");
    40 == a.keyCode && (c = "<down>");
    37 == a.keyCode && (c = "<left>");
    39 == a.keyCode && (c = "<right>");
    null != c && (this.c.h(c), this.view.b = !0);
  }.bind(a));
}
;function T() {
  this.cells = Array(1E3);
  this.j = [];
  this.n = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new l;
    }
  }
}
function A(a, b) {
  return a.cells[b.x][b.y];
}
function D(a, b, c) {
  var e = A(a, b);
  a.j.push(new t(b, e));
  e.e = c;
}
function F(a) {
  for (var b in a.j) {
    a.j[b].s.e = null;
  }
  a.j.length = 0;
}
function B(a, b) {
  var c = A(a, b), c = null != c.e ? c.e : c.value;
  if ("+" != c) {
    return c;
  }
  c = a.getContext(b);
  return c.left && c.right && !c.k && !c.f ? "\u2014" : !c.left && !c.right && c.k && c.f ? "|" : c.left && c.right && c.k && c.f ? "\u2014" : "+";
}
T.prototype.getContext = function(a) {
  var b = q(A(this, a.add(new f(-1, 0)))), c = q(A(this, a.add(new f(1, 0)))), e = q(A(this, a.add(new f(0, -1))));
  a = q(A(this, a.add(new f(0, 1))));
  return new r(b, c, e, a);
};
function G(a, b) {
  var c = [], e = a.j.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), d = a.j.filter(function(a, b) {
    return e.indexOf(e[b]) == b;
  });
  a.j.length = 0;
  for (var h in d) {
    var g = d[h].s;
    c.push(new s(d[h].position, null != g.value ? g.value : " "));
    var m = n(g);
    " " == m && (m = null);
    g.e = null;
    g.value = m;
  }
  50 < a.n.length && a.n.shift();
  !b && 0 < c.length && a.n.push(c);
}
function S(a) {
  if (0 != a.n.length) {
    var b = a.n.pop(), c;
    for (c in b) {
      var e = b[c];
      D(a, e.position, e.value);
    }
    G(a, !0);
  }
}
function R(a) {
  for (var b = new f(Number.MAX_VALUE, Number.MAX_VALUE), c = new f(-1, -1), e = 0;e < a.cells.length;e++) {
    for (var d = 0;d < a.cells[e].length;d++) {
      null != n(a.cells[e][d]) && (e < b.x && (b.x = e), d < b.y && (b.y = d), e > c.x && (c.x = e), d > c.y && (c.y = d));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var h = "", d = b.y;d <= c.y;d++) {
    for (var g = "", e = b.x;e <= c.x;e++) {
      var m = B(a, new f(e, d)), g = g + (null == m ? " " : m)
    }
    h += g.replace("\\s+$/g", "") + "\n";
  }
  return h;
}
;var U = new T, V = new u(U);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.c = new E(b);
  Q(this);
}(V, U);
V.animate();

