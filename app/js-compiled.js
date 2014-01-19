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
  this.b = this.value = null;
}
function n(a) {
  return "+" == (null != a.b ? a.b : a.value);
}
function p(a, b, c, g) {
  this.left = a;
  this.right = b;
  this.i = c;
  this.e = g;
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
  this.c && (this.c = !1, u(this));
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function u(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = v(w(a, new e(-70, -70))), g = v(w(a, new e(a.canvas.width + 70, a.canvas.height + 70)));
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
      n(x(a.state, new e(d, h))) && (a.context.fillStyle = "#F5F5F5", b.fillRect(15 * d - a.offset.x, 15 * (h - 1) - a.offset.y, 15, 15));
      var f;
      f = a.state;
      var q = new e(d, h), k = x(f, q), k = null != k.b ? k.b : k.value;
      "+" != k ? f = k : (f = f.getContext(q), f = f.left && f.right && !f.i && !f.e ? "\u2014" : !f.left && !f.right && f.i && f.e ? "|" : f.left && f.right && f.i && f.e ? "\u2014" : "+");
      null != f && (a.context.fillStyle = "#000000", b.fillText(f, 15 * d - a.offset.x + 3, 15 * h - a.offset.y - 2));
    }
  }
}
function w(a, b) {
  return new e((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y);
}
function v(a) {
  return new e(Math.round((a.x - 7.5) / 15), Math.round((a.y + 7.5) / 15));
}
;function y(a, b, c, g, d) {
  d = d || "+";
  var h = Math.min(b.x, c.x), f = Math.min(b.y, c.y), q = Math.max(b.x, c.x), k = Math.max(b.y, c.y), r = g ? b.y : c.y;
  for (g = g ? c.x : b.x;h++ < q;) {
    z(a, new e(h, r), d);
  }
  for (;f++ < k;) {
    z(a, new e(g, f), d);
  }
  z(a, b, d);
  z(a, c, d);
  z(a, new e(g, r), d);
}
function A(a) {
  this.state = a;
  this.h = null;
}
A.prototype.start = function(a) {
  this.h = a;
};
A.prototype.move = function(a) {
  B(this.state);
  y(this.state, this.h, a, !0);
  y(this.state, this.h, a, !1);
};
A.prototype.end = function() {
  C(this.state);
};
function D(a) {
  this.state = a;
  this.h = null;
}
D.prototype.start = function(a) {
  this.h = a;
};
D.prototype.move = function(a) {
  B(this.state);
  var b = this.state.getContext(this.h), c = this.state.getContext(a);
  y(this.state, this.h, a, b.i && b.e || c.left && c.right);
};
D.prototype.end = function() {
  C(this.state);
};
function E(a, b) {
  this.state = a;
  this.value = b;
}
E.prototype.start = function(a) {
  x(this.state, a).value = this.value;
};
E.prototype.move = function(a) {
  x(this.state, a).value = this.value;
};
E.prototype.end = function() {
};
function F(a) {
  this.state = a;
  this.j = null;
}
F.prototype.start = function(a) {
  this.state.getContext(a);
  var b = [new e(1, 0), new e(-1, 0), new e(0, 1), new e(0, -1)], c = [], g;
  for (g in b) {
    var d = G(this, a, b[g]), h;
    for (h in d) {
      var f = d[h], q = 0 != b[g].x;
      if (!l(a, f)) {
        var k = this.state.getContext(f);
        if (1 == k.left + k.right + k.i + k.e) {
          c.push({position:f, l:q});
        } else {
          for (var r in b) {
            0 != b[g].add(b[r]).length() && 2 != b[g].add(b[r]).length() && (k = G(this, f, b[r]), 0 == k.length || l(f, k[0]) || c.push({position:k[0], l:q}));
          }
        }
      }
    }
  }
  this.j = c;
  for (g in c) {
    y(this.state, a, c[g].position, c[g].l, " ");
  }
  C(this.state);
  this.move(a);
};
F.prototype.move = function(a) {
  B(this.state);
  for (var b in this.j) {
    y(this.state, a, this.j[b].position, this.j[b].l);
  }
};
F.prototype.end = function() {
  C(this.state);
};
function G(a, b, c) {
  b = b.clone();
  for (var g = [];;) {
    var d = b.add(c);
    if (!n(x(a.state, b)) || !n(x(a.state, d))) {
      return g;
    }
    b = d;
    d = a.state.getContext(d);
    d.left && d.right && !d.i && !d.e || !d.left && !d.right && d.i && d.e || g.push(b);
  }
}
;function H(a, b) {
  a.g = b;
  a.k = $.now();
  window.setTimeout(function() {
    null == this.f && null != this.g && (this.d.start(v(w(this.view, b))), this.view.c = !0);
  }.bind(a), 130);
}
function I(a, b) {
  if (null != a.g && (null == a.f && 130 > $.now() - a.k && 3 < (new e(b.x - a.g.x, b.y - a.g.y)).length() && (a.f = a.view.offset), null == a.f && 130 <= $.now() - a.k && (null == a.m || !l(v(w(a.view, b)), v(w(a.view, a.m)))) && (a.d.move(v(w(a.view, b))), a.view.c = !0, a.m = b), null != a.f)) {
    var c = a.view, g = a.f.add((new e(a.g.x - b.x, a.g.y - b.y)).scale(1 / a.view.zoom));
    c.offset = g;
    c.c = !0;
  }
}
function J(a, b) {
  null == a.f && 130 <= $.now() - a.k && (a.d.end(v(w(a.view, b))), a.view.c = !0);
  a.g = null;
  a.k = 0;
  a.f = null;
  a.m = null;
}
function K(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var c = a.view;
    c.zoom = b;
    c.c = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    H(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function(b) {
    J(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseleave(function(b) {
    J(a, new e(b.clientX, b.clientY));
  });
  $(a.view.canvas).mousemove(function(b) {
    I(a, new e(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    t(a.view);
  });
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    H(a, new e(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    J(a, new e(0, 0));
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    I(a, new e(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $("#box-button").click(function() {
    this.d = new A(this.state);
  }.bind(a));
  $("#line-button").click(function() {
    this.d = new D(this.state);
  }.bind(a));
  $("#freeform-button").click(function() {
    this.d = new E(this.state, "+");
  }.bind(a));
  $("#erase-button").click(function() {
    this.d = new E(this.state, null);
  }.bind(a));
  $("#move-button").click(function() {
    this.d = new F(this.state);
  }.bind(a));
}
;function L() {
  this.cells = Array(1E3);
  this.a = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new m;
    }
  }
}
function x(a, b) {
  return a.cells[b.x][b.y];
}
function z(a, b, c) {
  b = x(a, b);
  a.a.push(b);
  b.b = c;
}
function B(a) {
  for (var b in a.a) {
    a.a[b].b = null;
  }
  a.a.length = 0;
}
L.prototype.getContext = function(a) {
  var b = n(x(this, a.add(new e(-1, 0)))), c = n(x(this, a.add(new e(1, 0)))), g = n(x(this, a.add(new e(0, -1))));
  a = n(x(this, a.add(new e(0, 1))));
  return new p(b, c, g, a);
};
function C(a) {
  for (var b in a.a) {
    a.a[b].value = null != a.a[b].b ? a.a[b].b : a.a[b].value, a.a[b].b = null;
  }
}
;var M = new L, N = new s(M);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.d = new A(b);
  K(this);
}(N, M);
N.animate();

