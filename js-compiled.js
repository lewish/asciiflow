function c(a, b) {
  this.x = a;
  this.y = b;
}
c.prototype.add = function(a) {
  return new c(this.x + a.x, this.y + a.y);
};
c.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
c.prototype.scale = function(a) {
  return new c(this.x * a, this.y * a);
};
function g(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new c(7500, 7500);
  this.d = !0;
  k(this);
}
function k(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.d = !0;
}
g.prototype.animate = function() {
  this.d && (this.d = !1, l(this));
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function l(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var d = m(n(a, new c(-70, -70))), f = m(n(a, new c(a.canvas.width + 70, a.canvas.height + 70)));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var e = d.x;e < f.x;e++) {
    b.moveTo(15 * e - a.offset.x, 0 - a.offset.y), b.lineTo(15 * e - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var h = d.y;h < f.y;h++) {
    b.moveTo(0 - a.offset.x, 15 * h - a.offset.y), b.lineTo(15 * a.state.cells.length - a.offset.x, 15 * h - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (e = d.x;e < f.x;e++) {
    for (h = d.y;h < f.y;h++) {
      var v = a.state.l(new c(e, h));
      null != v && b.fillText(v, 15 * e - a.offset.x + 3, 15 * h - a.offset.y - 2);
    }
  }
}
function n(a, b) {
  return new c((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y);
}
function m(a) {
  return new c(Math.round((a.x - 7.5) / 15), Math.round((a.y + 7.5) / 15));
}
;function p(a) {
  this.state = a;
  this.a = this.b = null;
}
p.prototype.start = function(a) {
  this.a = this.b = a;
  this.i();
};
p.prototype.move = function(a) {
  this.a = a;
  q(this.state);
  this.i();
};
p.prototype.end = function() {
  r(this.state);
};
p.prototype.i = function() {
  var a = Math.min(this.b.x, this.a.x), b = Math.min(this.b.y, this.a.y), d = Math.max(this.b.x, this.a.x), f = Math.max(this.b.y, this.a.y);
  s(this.state, new c(a, b));
  s(this.state, new c(a, f));
  s(this.state, new c(d, b));
  s(this.state, new c(d, f));
  for (var e = a + 1;e < d;e++) {
    s(this.state, new c(e, b)), s(this.state, new c(e, f));
  }
  for (b += 1;b < f;b++) {
    s(this.state, new c(a, b)), s(this.state, new c(d, b));
  }
};
function t(a) {
  this.state = a;
  this.a = this.b = null;
}
t.prototype.start = function(a) {
  this.a = this.b = a;
  this.i();
};
t.prototype.move = function(a) {
  this.a = a;
  q(this.state);
  this.i();
};
t.prototype.end = function() {
  r(this.state);
};
t.prototype.i = function() {
  for (var a = u(this.state, this.b.add(new c(0, -1))), b = u(this.state, this.b.add(new c(0, 1))), d = u(this.state, this.a.add(new c(-1, 0))), f = u(this.state, this.a.add(new c(1, 0))), e = a && b || d && f, a = Math.min(this.b.x, this.a.x), b = Math.min(this.b.y, this.a.y), d = Math.max(this.b.x, this.a.x), f = Math.max(this.b.y, this.a.y), h = e ? this.b.y : this.a.y, e = e ? this.a.x : this.b.x;a++ < d;) {
    s(this.state, new c(a, h));
  }
  for (;b++ < f;) {
    s(this.state, new c(e, b));
  }
  s(this.state, new c(this.b.x, this.b.y));
  s(this.state, new c(this.a.x, this.a.y));
  s(this.state, new c(e, h));
};
function w(a, b) {
  this.state = a;
  this.value = b;
}
w.prototype.start = function(a) {
  x(this.state, a).value = this.value;
};
w.prototype.move = function(a) {
  x(this.state, a).value = this.value;
};
w.prototype.end = function() {
};
function y(a) {
  this.state = a;
  this.g = new p(a);
  $("#box-button").click(function() {
    this.g = new p(a);
  }.bind(this));
  $("#line-button").click(function() {
    this.g = new t(a);
  }.bind(this));
  $("#freeform-button").click(function() {
    this.g = new w(a, "O");
  }.bind(this));
  $("#erase-button").click(function() {
    this.g = new w(a, null);
  }.bind(this));
}
;function z(a, b) {
  a.h = b;
  a.k = $.now();
  window.setTimeout(function() {
    null == this.f && null != this.h && (this.m.g.start(m(n(this.view, b))), this.view.d = !0);
  }.bind(a), 150);
}
function A(a, b) {
  if (null != a.h && (null == a.f && 150 > $.now() - a.k && 0.1 < (new c(b.x - a.h.x, b.y - a.h.y)).length() && (a.f = a.view.offset), null == a.f && 150 <= $.now() - a.k && (null == a.j || null == m(n(a.view, a.j)) || m(n(a.view, b)).x != m(n(a.view, a.j)).x || m(n(a.view, b)).y != m(n(a.view, a.j)).y) && (a.m.g.move(m(n(a.view, b))), a.view.d = !0, a.j = b), null != a.f)) {
    var d = a.view, f = a.f.add((new c(a.h.x - b.x, a.h.y - b.y)).scale(1 / a.view.zoom));
    d.offset = f;
    d.d = !0;
  }
}
function B(a, b) {
  null == a.f && 150 <= $.now() - a.k && (a.m.g.end(m(n(a.view, b))), a.view.d = !0);
  a.h = null;
  a.k = 0;
  a.f = null;
  a.j = null;
}
function C(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var d = a.view;
    d.zoom = b;
    d.d = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    z(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function(b) {
    B(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseleave(function(b) {
    B(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mousemove(function(b) {
    A(a, new c(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    k(a.view);
  });
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    z(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    B(a, new c(0, 0));
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    A(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
}
;function D() {
  this.c = this.value = null;
}
D.prototype.l = function() {
  return null != this.c ? this.c : this.value;
};
function E() {
  this.cells = Array(1E3);
  this.e = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new D;
    }
  }
}
function x(a, b) {
  return a.cells[b.x][b.y];
}
function s(a, b) {
  var d = x(a, b);
  a.e.push(d);
  d.c = "+";
}
function q(a) {
  for (var b in a.e) {
    a.e[b].c = null;
  }
  a.e.length = 0;
}
function u(a, b) {
  var d = x(a, b);
  return "+" == (null != d.c ? d.c : d.value);
}
E.prototype.l = function(a) {
  var b = x(this, a), b = null != b.c ? b.c : b.value;
  if ("+" != b) {
    return b;
  }
  var b = u(this, a.add(new c(-1, 0))), d = u(this, a.add(new c(1, 0))), f = u(this, a.add(new c(0, -1)));
  a = u(this, a.add(new c(0, 1)));
  return b && d && !f && !a ? "\u2014" : !b && !d && f && a ? "|" : b && d && f && a ? "\u2014" : "+";
};
function r(a) {
  for (var b in a.e) {
    a.e[b].value = a.e[b].l(), a.e[b].c = null;
  }
}
;var F = new E, G = new g(F);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.m = new y(b);
  C(this);
}(G, F);
G.animate();

