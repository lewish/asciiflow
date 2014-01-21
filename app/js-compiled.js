function e(a, b) {
  this.x = a;
  this.y = b;
}
function l(a, b) {
  return null != b && a.x == b.x && a.y == b.y;
}
e.prototype.add = function(a) {
  return new e(this.x + a.x, this.y + a.y);
};
e.prototype.clone = function() {
  return new e(this.x, this.y);
};
e.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
e.prototype.scale = function(a) {
  return new e(this.x * a, this.y * a);
};
function m() {
  this.d = this.value = null;
}
function n(a) {
  return null != a.d ? a.d : a.value;
}
function p(a) {
  return "+" == n(a);
}
function q(a, b, c, g) {
  this.left = a;
  this.right = b;
  this.i = c;
  this.f = g;
}
;function s(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new e(7500, 7500);
  this.c = !0;
  t(this);
}
function t(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.c = !0;
}
s.prototype.animate = function() {
  this.c && (this.c = !1, v(this));
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function v(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = w(x(a, new e(-70, -70))), g = w(x(a, new e(a.canvas.width + 70, a.canvas.height + 70)));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var d = c.x;d < g.x;d++) {
    b.moveTo(15 * d - a.offset.x, 0 - a.offset.y), b.lineTo(15 * d - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var h = c.y;h < g.y;h++) {
    b.moveTo(0 - a.offset.x, 15 * h - a.offset.y), b.lineTo(15 * a.state.cells.length - a.offset.x, 15 * h - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (d = c.x;d < g.x;d++) {
    for (h = c.y;h < g.y;h++) {
      var f = y(a.state, new e(d, h));
      if (null != f.d || p(f)) {
        a.context.fillStyle = null != f.d ? "#DEF" : "#F5F5F5", b.fillRect(15 * d - a.offset.x, 15 * (h - 1) - a.offset.y, 15, 15);
      }
      var f = a.state, r = new e(d, h), k = y(f, r), k = null != k.d ? k.d : k.value;
      "+" != k ? f = k : (f = f.getContext(r), f = f.left && f.right && !f.i && !f.f ? "\u2014" : !f.left && !f.right && f.i && f.f ? "|" : f.left && f.right && f.i && f.f ? "\u2014" : "+");
      null != f && (a.context.fillStyle = "#000000", b.fillText(f, 15 * d - a.offset.x + 3, 15 * h - a.offset.y - 2));
    }
  }
}
function x(a, b) {
  return new e((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y);
}
function w(a) {
  return new e(Math.round((a.x - 7.5) / 15), Math.round((a.y + 7.5) / 15));
}
;function z(a, b, c, g, d) {
  d = d || "+";
  var h = Math.min(b.x, c.x), f = Math.min(b.y, c.y), r = Math.max(b.x, c.x), k = Math.max(b.y, c.y), u = g ? c.x : b.x;
  for (g = g ? b.y : c.y;h++ < r;) {
    A(a, new e(h, g), d);
  }
  for (;f++ < k;) {
    A(a, new e(u, f), d);
  }
  A(a, b, d);
  A(a, c, d);
  A(a, new e(u, g), d);
}
function B(a) {
  this.state = a;
  this.a = null;
}
B.prototype.start = function(a) {
  this.a = a;
};
B.prototype.move = function(a) {
  this.j = a;
  C(this.state);
  z(this.state, this.a, a, !0);
  z(this.state, this.a, a, !1);
};
B.prototype.end = function() {
  D(this.state);
};
B.prototype.k = function() {
  return "crosshair";
};
B.prototype.l = function() {
};
function E(a) {
  this.state = a;
  this.a = null;
}
E.prototype.start = function(a) {
  this.a = a;
};
E.prototype.move = function(a) {
  C(this.state);
  var b = this.state.getContext(this.a), c = this.state.getContext(a);
  z(this.state, this.a, a, b.i && b.f || c.left && c.right);
};
E.prototype.end = function() {
  D(this.state);
};
E.prototype.k = function() {
  return "crosshair";
};
E.prototype.l = function() {
};
function F(a, b) {
  this.state = a;
  this.value = b;
}
F.prototype.start = function(a) {
  A(this.state, a, this.value);
};
F.prototype.move = function(a) {
  A(this.state, a, this.value);
};
F.prototype.end = function() {
  D(this.state);
};
F.prototype.k = function() {
  return "crosshair";
};
F.prototype.l = function() {
};
function G(a) {
  this.state = a;
  this.m = this.a = null;
}
G.prototype.start = function(a) {
  this.m = this.a = a;
  C(this.state);
  var b = n(y(this.state, a));
  A(this.state, a, null == b ? " " : b);
};
G.prototype.move = function() {
};
G.prototype.end = function() {
};
G.prototype.k = function() {
  return "text";
};
G.prototype.l = function(a) {
  if (null != this.m) {
    "\n" == a ? C(this.state) : (A(this.state, this.m, a), D(this.state));
    var b = this.m.add(new e(1, 0));
    if ("\n" == a || p(y(this.state, b))) {
      this.a = b = this.a.add(new e(0, 1));
    }
    this.m = b;
    a = n(y(this.state, b));
    A(this.state, b, null == a ? " " : a);
  }
};
function H(a) {
  this.state = a;
  this.j = this.a = null;
}
H.prototype.start = function(a) {
  this.a = a;
  this.move(a);
};
H.prototype.move = function(a) {
  C(this.state);
  this.j = a;
  var b = Math.min(this.a.x, this.j.x);
  a = Math.min(this.a.y, this.j.y);
  for (var c = Math.max(this.a.x, this.j.x), g = Math.max(this.a.y, this.j.y);b <= c;b++) {
    for (var d = a;d <= g;d++) {
      A(this.state, new e(b, d), " ");
    }
  }
};
H.prototype.end = function() {
  D(this.state);
};
H.prototype.k = function() {
  return "crosshair";
};
H.prototype.l = function() {
};
function I(a) {
  this.state = a;
  this.n = null;
}
I.prototype.start = function(a) {
  this.state.getContext(a);
  var b = [new e(1, 0), new e(-1, 0), new e(0, 1), new e(0, -1)], c = [], g;
  for (g in b) {
    var d = J(this, a, b[g]), h;
    for (h in d) {
      var f = d[h], r = 0 != b[g].x;
      if (!l(a, f)) {
        var k = this.state.getContext(f);
        if (1 == k.left + k.right + k.i + k.f) {
          c.push({position:f, p:r});
        } else {
          for (var u in b) {
            0 != b[g].add(b[u]).length() && 2 != b[g].add(b[u]).length() && (k = J(this, f, b[u]), 0 == k.length || l(f, k[0]) || c.push({position:k[0], p:r}));
          }
        }
      }
    }
  }
  this.n = c;
  for (g in c) {
    z(this.state, a, c[g].position, c[g].p, " ");
  }
  D(this.state);
  this.move(a);
};
I.prototype.move = function(a) {
  C(this.state);
  for (var b in this.n) {
    z(this.state, a, this.n[b].position, this.n[b].p);
  }
};
I.prototype.end = function() {
  D(this.state);
};
function J(a, b, c) {
  b = b.clone();
  for (var g = [];;) {
    var d = b.add(c);
    if (!p(y(a.state, b)) || !p(y(a.state, d))) {
      return g;
    }
    b = d;
    d = a.state.getContext(d);
    d.left && d.right && !d.i && !d.f || !d.left && !d.right && d.i && d.f || g.push(b);
  }
}
I.prototype.k = function(a) {
  return p(y(this.state, a)) ? "pointer" : "default";
};
I.prototype.l = function() {
};
function K(a, b) {
  a.h = b;
  a.o = $.now();
  window.setTimeout(function() {
    null == this.g && null != this.h && (this.b.start(w(x(this.view, b))), this.view.c = !0);
  }.bind(a), 130);
}
function L(a, b) {
  a.view.canvas.style.cursor = a.b.k(w(x(a.view, b)));
  if (null != a.h && (null == a.g && 130 > $.now() - a.o && 3 < (new e(b.x - a.h.x, b.y - a.h.y)).length() && (a.g = a.view.offset), null == a.g && 130 <= $.now() - a.o && (null == a.q || !l(w(x(a.view, b)), w(x(a.view, a.q)))) && (a.b.move(w(x(a.view, b))), a.view.c = !0, a.q = b), null != a.g)) {
    var c = a.view, g = a.g.add((new e(a.h.x - b.x, a.h.y - b.y)).scale(1 / a.view.zoom));
    c.offset = g;
    c.c = !0;
  }
}
function M(a, b) {
  null == a.g && 130 <= $.now() - a.o && (a.b.end(w(x(a.view, b))), a.view.c = !0);
  a.h = null;
  a.o = 0;
  a.g = null;
  a.q = null;
}
function N(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var c = a.view;
    c.zoom = b;
    c.c = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    K(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function(b) {
    M(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseleave(function(b) {
    M(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mousemove(function(b) {
    L(a, new e(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    t(a.view);
  });
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    K(a, new e(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    M(a, new e(0, 0));
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    L(a, new e(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $("#buttons > button").click(function(a) {
    a = a.target.id;
    $("#buttons > button").removeClass("active");
    $(".dialog").removeClass("visible");
    $("#" + a).addClass("active");
    $("#" + a + "-dialog").addClass("visible");
    "box-button" == a && (this.b = new B(this.state));
    "line-button" == a && (this.b = new E(this.state));
    "freeform-button" == a && (this.b = new F(this.state, "+"));
    "erase-button" == a && (this.b = new H(this.state));
    "move-button" == a && (this.b = new I(this.state));
    "text-button" == a && (this.b = new G(this.state));
  }.bind(a));
  $(window).keypress(function(a) {
    a = a.keyCode;
    var c = String.fromCharCode(a);
    13 == a && (c = "\n");
    this.b.l(c);
    this.view.c = !0;
  }.bind(a));
}
;function O() {
  this.cells = Array(1E3);
  this.e = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new m;
    }
  }
}
function y(a, b) {
  return a.cells[b.x][b.y];
}
function A(a, b, c) {
  b = y(a, b);
  a.e.push(b);
  b.d = c;
}
function C(a) {
  for (var b in a.e) {
    a.e[b].d = null;
  }
  a.e.length = 0;
}
O.prototype.getContext = function(a) {
  var b = p(y(this, a.add(new e(-1, 0)))), c = p(y(this, a.add(new e(1, 0)))), g = p(y(this, a.add(new e(0, -1))));
  a = p(y(this, a.add(new e(0, 1))));
  return new q(b, c, g, a);
};
function D(a) {
  for (var b in a.e) {
    var c = n(a.e[b]);
    " " == c && (c = null);
    a.e[b].d = null;
    a.e[b].value = c;
  }
}
;var P = new O, Q = new s(P);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.b = new B(b);
  N(this);
}(Q, P);
Q.animate();

