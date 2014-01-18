function d(a, b) {
  this.x = a;
  this.y = b;
}
function k(a, b) {
  return null != b && a.x == b.x && a.y == b.y;
}
d.prototype.add = function(a) {
  return new d(this.x + a.x, this.y + a.y);
};
d.prototype.clone = function() {
  return new d(this.x, this.y);
};
d.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
d.prototype.scale = function(a) {
  return new d(this.x * a, this.y * a);
};
function m(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new d(7500, 7500);
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
  var c = r(s(a, new d(-70, -70))), e = r(s(a, new d(a.canvas.width + 70, a.canvas.height + 70)));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var f = c.x;f < e.x;f++) {
    b.moveTo(15 * f - a.offset.x, 0 - a.offset.y), b.lineTo(15 * f - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var g = c.y;g < e.y;g++) {
    b.moveTo(0 - a.offset.x, 15 * g - a.offset.y), b.lineTo(15 * a.state.cells.length - a.offset.x, 15 * g - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (f = c.x;f < e.x;f++) {
    for (g = c.y;g < e.y;g++) {
      t(a.state, new d(f, g)) && (a.context.fillStyle = "#F5F5F5", b.fillRect(15 * f - a.offset.x, 15 * (g - 1) - a.offset.y, 15, 15));
      var h = a.state.m(new d(f, g));
      null != h && (a.context.fillStyle = "#000000", b.fillText(h, 15 * f - a.offset.x + 3, 15 * g - a.offset.y - 2));
    }
  }
}
function s(a, b) {
  return new d((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y);
}
function r(a) {
  return new d(Math.round((a.x - 7.5) / 15), Math.round((a.y + 7.5) / 15));
}
;function u(a, b, c, e) {
  var f = Math.min(b.x, c.x), g = Math.min(b.y, c.y), h = Math.max(b.x, c.x), p = Math.max(b.y, c.y), l = e ? b.y : c.y;
  for (e = e ? c.x : b.x;f++ < h;) {
    v(a, new d(f, l), "+");
  }
  for (;g++ < p;) {
    v(a, new d(e, g), "+");
  }
  v(a, b, "+");
  v(a, c, "+");
  v(a, new d(e, l), "+");
}
function w(a) {
  this.state = a;
  this.h = null;
}
w.prototype.start = function(a) {
  this.h = a;
};
w.prototype.move = function(a) {
  x(this.state);
  u(this.state, this.h, a, !0);
  u(this.state, this.h, a, !1);
};
w.prototype.end = function() {
  y(this.state);
};
function z(a) {
  this.state = a;
  this.h = null;
}
z.prototype.start = function(a) {
  this.h = a;
};
z.prototype.move = function(a) {
  x(this.state);
  var b = this.state.getContext(this.h), c = this.state.getContext(a);
  u(this.state, this.h, a, b.i && b.e || c.left && c.right);
};
z.prototype.end = function() {
  y(this.state);
};
function A(a, b) {
  this.state = a;
  this.value = b;
}
A.prototype.start = function(a) {
  B(this.state, a).value = this.value;
};
A.prototype.move = function(a) {
  B(this.state, a).value = this.value;
};
A.prototype.end = function() {
};
function C(a) {
  this.state = a;
  this.j = null;
}
C.prototype.start = function(a) {
  this.state.getContext(a);
  var b = [new d(1, 0), new d(-1, 0), new d(0, 1), new d(0, -1)], c = [], e;
  for (e in b) {
    var f = D(this, a, b[e]), g = 0 != b[e].x;
    if (!k(a, f)) {
      var h = this.state.getContext(f);
      if (1 == h.left + h.right + h.i + h.e) {
        c.push({position:f, l:g});
      } else {
        for (var p in b) {
          0 != b[e].add(b[p]).length() && (h = D(this, f, b[p]), k(f, h) || c.push({position:h, l:g}));
        }
      }
    }
  }
  this.j = c;
  for (e in c) {
    var b = this.state, f = a, g = c[e].position, l = c[e].l;
    p = Math.min(f.x, g.x);
    for (var h = Math.min(f.y, g.y), M = Math.max(f.x, g.x), N = Math.max(f.y, g.y), F = l ? f.y : g.y, l = l ? g.x : f.x;p++ < M;) {
      v(b, new d(p, F), " ");
    }
    for (;h++ < N;) {
      v(b, new d(l, h), " ");
    }
    v(b, f, " ");
    v(b, g, " ");
    v(b, new d(l, F), " ");
  }
  y(this.state);
  this.move(a);
};
C.prototype.move = function(a) {
  x(this.state);
  for (var b in this.j) {
    u(this.state, a, this.j[b].position, this.j[b].l);
  }
};
C.prototype.end = function() {
  y(this.state);
};
function D(a, b, c) {
  for (b = b.clone();;) {
    var e = b.add(c);
    if (!t(a.state, e)) {
      return b;
    }
    b = e;
    e = a.state.getContext(e);
    if (!(e.left && e.right && !e.i && !e.e || !e.left && !e.right && e.i && e.e)) {
      return b;
    }
  }
}
function E(a) {
  this.state = a;
  this.c = new w(a);
  $("#box-button").click(function() {
    this.c = new w(a);
  }.bind(this));
  $("#line-button").click(function() {
    this.c = new z(a);
  }.bind(this));
  $("#freeform-button").click(function() {
    this.c = new A(a, "O");
  }.bind(this));
  $("#erase-button").click(function() {
    this.c = new A(a, null);
  }.bind(this));
  $("#move-button").click(function() {
    this.c = new C(a);
  }.bind(this));
}
;function G(a, b) {
  a.g = b;
  a.k = $.now();
  window.setTimeout(function() {
    null == this.f && null != this.g && (this.o.c.start(r(s(this.view, b))), this.view.b = !0);
  }.bind(a), 150);
}
function H(a, b) {
  if (null != a.g && (null == a.f && 150 > $.now() - a.k && 0.1 < (new d(b.x - a.g.x, b.y - a.g.y)).length() && (a.f = a.view.offset), null == a.f && 150 <= $.now() - a.k && (null == a.n || !k(r(s(a.view, b)), r(s(a.view, a.n)))) && (a.o.c.move(r(s(a.view, b))), a.view.b = !0, a.n = b), null != a.f)) {
    var c = a.view, e = a.f.add((new d(a.g.x - b.x, a.g.y - b.y)).scale(1 / a.view.zoom));
    c.offset = e;
    c.b = !0;
  }
}
function I(a, b) {
  null == a.f && 150 <= $.now() - a.k && (a.o.c.end(r(s(a.view, b))), a.view.b = !0);
  a.g = null;
  a.k = 0;
  a.f = null;
  a.n = null;
}
function J(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var c = a.view;
    c.zoom = b;
    c.b = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    G(a, new d(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function(b) {
    I(a, new d(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseleave(function(b) {
    I(a, new d(b.clientX, b.clientY));
  });
  $(a.view.canvas).mousemove(function(b) {
    H(a, new d(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    n(a.view);
  });
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    G(a, new d(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    I(a, new d(0, 0));
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    H(a, new d(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
}
;function K() {
  this.a = this.value = null;
}
K.prototype.m = function() {
  return null != this.a ? this.a : this.value;
};
function L(a, b, c, e) {
  this.left = a;
  this.right = b;
  this.i = c;
  this.e = e;
}
function O() {
  this.cells = Array(1E3);
  this.d = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new K;
    }
  }
}
function B(a, b) {
  return a.cells[b.x][b.y];
}
function v(a, b, c) {
  b = B(a, b);
  a.d.push(b);
  b.a = c;
}
function x(a) {
  for (var b in a.d) {
    a.d[b].a = null;
  }
  a.d.length = 0;
}
function t(a, b) {
  var c = B(a, b);
  return "+" == (null != c.a ? c.a : c.value);
}
O.prototype.m = function(a) {
  var b = B(this, a), b = null != b.a ? b.a : b.value;
  if ("+" != b) {
    return b;
  }
  a = this.getContext(a);
  return a.left && a.right && !a.i && !a.e ? "\u2014" : !a.left && !a.right && a.i && a.e ? "|" : a.left && a.right && a.i && a.e ? "\u2014" : "+";
};
O.prototype.getContext = function(a) {
  var b = t(this, a.add(new d(-1, 0))), c = t(this, a.add(new d(1, 0))), e = t(this, a.add(new d(0, -1)));
  a = t(this, a.add(new d(0, 1)));
  return new L(b, c, e, a);
};
function y(a) {
  for (var b in a.d) {
    a.d[b].value = a.d[b].m(), a.d[b].a = null;
  }
}
;var P = new O, Q = new m(P);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.o = new E(b);
  J(this);
}(Q, P);
Q.animate();

