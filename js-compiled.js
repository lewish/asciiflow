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
function m(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new e(7500, 7500);
  this.b = !0;
  n(this);
}
function n(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.b = !0;
}
m.prototype.animate = function() {
  this.b && (this.b = !1, q(this));
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function q(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = r(s(a, new e(-70, -70))), f = r(s(a, new e(a.canvas.width + 70, a.canvas.height + 70)));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var d = c.x;d < f.x;d++) {
    b.moveTo(15 * d - a.offset.x, 0 - a.offset.y), b.lineTo(15 * d - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var g = c.y;g < f.y;g++) {
    b.moveTo(0 - a.offset.x, 15 * g - a.offset.y), b.lineTo(15 * a.state.cells.length - a.offset.x, 15 * g - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (d = c.x;d < f.x;d++) {
    for (g = c.y;g < f.y;g++) {
      t(a.state, new e(d, g)) && (a.context.fillStyle = "#F5F5F5", b.fillRect(15 * d - a.offset.x, 15 * (g - 1) - a.offset.y, 15, 15));
      var h = a.state.m(new e(d, g));
      null != h && (a.context.fillStyle = "#000000", b.fillText(h, 15 * d - a.offset.x + 3, 15 * g - a.offset.y - 2));
    }
  }
}
function s(a, b) {
  return new e((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y);
}
function r(a) {
  return new e(Math.round((a.x - 7.5) / 15), Math.round((a.y + 7.5) / 15));
}
;function w(a, b, c, f) {
  var d = Math.min(b.x, c.x), g = Math.min(b.y, c.y), h = Math.max(b.x, c.x), p = Math.max(b.y, c.y), k = f ? b.y : c.y;
  for (f = f ? c.x : b.x;d++ < h;) {
    x(a, new e(d, k), "+");
  }
  for (;g++ < p;) {
    x(a, new e(f, g), "+");
  }
  x(a, b, "+");
  x(a, c, "+");
  x(a, new e(f, k), "+");
}
function y(a) {
  this.state = a;
  this.h = null;
}
y.prototype.start = function(a) {
  this.h = a;
};
y.prototype.move = function(a) {
  z(this.state);
  w(this.state, this.h, a, !0);
  w(this.state, this.h, a, !1);
};
y.prototype.end = function() {
  A(this.state);
};
function B(a) {
  this.state = a;
  this.h = null;
}
B.prototype.start = function(a) {
  this.h = a;
};
B.prototype.move = function(a) {
  z(this.state);
  var b = this.state.getContext(this.h), c = this.state.getContext(a);
  w(this.state, this.h, a, b.i && b.e || c.left && c.right);
};
B.prototype.end = function() {
  A(this.state);
};
function C(a, b) {
  this.state = a;
  this.value = b;
}
C.prototype.start = function(a) {
  D(this.state, a).value = this.value;
};
C.prototype.move = function(a) {
  D(this.state, a).value = this.value;
};
C.prototype.end = function() {
};
function E(a) {
  this.state = a;
  this.j = null;
}
E.prototype.start = function(a) {
  this.state.getContext(a);
  var b = [new e(1, 0), new e(-1, 0), new e(0, 1), new e(0, -1)], c = [], f;
  for (f in b) {
    var d = F(this, a, b[f]);
    window.console.log(d);
    for (var g in d) {
      var h = d[g], p = 0 != b[f].x;
      if (!l(a, h)) {
        var k = this.state.getContext(h);
        if (1 == k.left + k.right + k.i + k.e) {
          c.push({position:h, l:p});
        } else {
          for (var u in b) {
            0 != b[f].add(b[u]).length() && 2 != b[f].add(b[u]).length() && (k = F(this, h, b[u]), 0 == k.length || l(h, k[0]) || c.push({position:k[0], l:p}));
          }
        }
      }
    }
  }
  window.console.log(c);
  this.j = c;
  for (f in c) {
    b = this.state;
    d = a;
    g = c[f].position;
    var v = c[f].l, h = Math.min(d.x, g.x), p = Math.min(d.y, g.y);
    u = Math.max(d.x, g.x);
    for (var k = Math.max(d.y, g.y), H = v ? d.y : g.y, v = v ? g.x : d.x;h++ < u;) {
      x(b, new e(h, H), " ");
    }
    for (;p++ < k;) {
      x(b, new e(v, p), " ");
    }
    x(b, d, " ");
    x(b, g, " ");
    x(b, new e(v, H), " ");
  }
  A(this.state);
  this.move(a);
};
E.prototype.move = function(a) {
  z(this.state);
  for (var b in this.j) {
    w(this.state, a, this.j[b].position, this.j[b].l);
  }
};
E.prototype.end = function() {
  A(this.state);
};
function F(a, b, c) {
  b = b.clone();
  for (var f = [];;) {
    var d = b.add(c);
    if (!t(a.state, d)) {
      return f;
    }
    b = d;
    d = a.state.getContext(d);
    d.left && d.right && !d.i && !d.e || !d.left && !d.right && d.i && d.e || f.push(b);
  }
}
function G(a) {
  this.state = a;
  this.c = new y(a);
  $("#box-button").click(function() {
    this.c = new y(a);
  }.bind(this));
  $("#line-button").click(function() {
    this.c = new B(a);
  }.bind(this));
  $("#freeform-button").click(function() {
    this.c = new C(a, "O");
  }.bind(this));
  $("#erase-button").click(function() {
    this.c = new C(a, null);
  }.bind(this));
  $("#move-button").click(function() {
    this.c = new E(a);
  }.bind(this));
}
;function I(a, b) {
  a.g = b;
  a.k = $.now();
  window.setTimeout(function() {
    null == this.f && null != this.g && (this.o.c.start(r(s(this.view, b))), this.view.b = !0);
  }.bind(a), 150);
}
function J(a, b) {
  if (null != a.g && (null == a.f && 150 > $.now() - a.k && 0.1 < (new e(b.x - a.g.x, b.y - a.g.y)).length() && (a.f = a.view.offset), null == a.f && 150 <= $.now() - a.k && (null == a.n || !l(r(s(a.view, b)), r(s(a.view, a.n)))) && (a.o.c.move(r(s(a.view, b))), a.view.b = !0, a.n = b), null != a.f)) {
    var c = a.view, f = a.f.add((new e(a.g.x - b.x, a.g.y - b.y)).scale(1 / a.view.zoom));
    c.offset = f;
    c.b = !0;
  }
}
function K(a, b) {
  null == a.f && 150 <= $.now() - a.k && (a.o.c.end(r(s(a.view, b))), a.view.b = !0);
  a.g = null;
  a.k = 0;
  a.f = null;
  a.n = null;
}
function L(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var c = a.view;
    c.zoom = b;
    c.b = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    I(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function(b) {
    K(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseleave(function(b) {
    K(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mousemove(function(b) {
    J(a, new e(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    n(a.view);
  });
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    I(a, new e(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    K(a, new e(0, 0));
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    J(a, new e(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
}
;function M() {
  this.a = this.value = null;
}
M.prototype.m = function() {
  return null != this.a ? this.a : this.value;
};
function N(a, b, c, f) {
  this.left = a;
  this.right = b;
  this.i = c;
  this.e = f;
}
function O() {
  this.cells = Array(1E3);
  this.d = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new M;
    }
  }
}
function D(a, b) {
  return a.cells[b.x][b.y];
}
function x(a, b, c) {
  b = D(a, b);
  a.d.push(b);
  b.a = c;
}
function z(a) {
  for (var b in a.d) {
    a.d[b].a = null;
  }
  a.d.length = 0;
}
function t(a, b) {
  var c = D(a, b);
  return "+" == (null != c.a ? c.a : c.value);
}
O.prototype.m = function(a) {
  var b = D(this, a), b = null != b.a ? b.a : b.value;
  if ("+" != b) {
    return b;
  }
  a = this.getContext(a);
  return a.left && a.right && !a.i && !a.e ? "\u2014" : !a.left && !a.right && a.i && a.e ? "|" : a.left && a.right && a.i && a.e ? "\u2014" : "+";
};
O.prototype.getContext = function(a) {
  var b = t(this, a.add(new e(-1, 0))), c = t(this, a.add(new e(1, 0))), f = t(this, a.add(new e(0, -1)));
  a = t(this, a.add(new e(0, 1)));
  return new N(b, c, f, a);
};
function A(a) {
  for (var b in a.d) {
    a.d[b].value = a.d[b].m(), a.d[b].a = null;
  }
}
;var P = new O, Q = new m(P);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.o = new G(b);
  L(this);
}(Q, P);
Q.animate();

