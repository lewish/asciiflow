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
function h(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new c(7500, 7500);
  this.b = !0;
  k(this);
}
function k(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.b = !0;
}
h.prototype.animate = function() {
  this.b && (this.b = !1, l(this));
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
  var d = m(n(a, new c(-70, -70))), g = m(n(a, new c(a.canvas.width + 70, a.canvas.height + 70)));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var e = d.x;e < g.x;e++) {
    b.moveTo(15 * e - a.offset.x, 0 - a.offset.y), b.lineTo(15 * e - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var f = d.y;f < g.y;f++) {
    b.moveTo(0 - a.offset.x, 15 * f - a.offset.y), b.lineTo(15 * a.state.cells.length - a.offset.x, 15 * f - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (e = d.x;e < g.x;e++) {
    for (f = d.y;f < g.y;f++) {
      var r = null != a.state.cells[e][f].d ? a.state.cells[e][f].d : a.state.cells[e][f].value;
      null != r && b.fillText(r, 15 * e - a.offset.x + 3, 15 * f - a.offset.y - 2);
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
  this.e = this.h = null;
}
p.prototype.start = function(a) {
  this.e = this.h = a;
  q(this);
};
p.prototype.move = function(a) {
  this.e = a;
  a = this.state;
  for (var b in a.a) {
    a.a[b].d = null;
  }
  a.a.length = 0;
  q(this);
};
p.prototype.end = function() {
  var a = this.state, b;
  for (b in a.a) {
    a.a[b].value = null != a.a[b].d ? a.a[b].d : a.a[b].value, a.a[b].d = null;
  }
};
function q(a) {
  var b = Math.min(a.h.x, a.e.x), d = Math.min(a.h.y, a.e.y), g = Math.max(a.h.x, a.e.x), e = Math.max(a.h.y, a.e.y);
  s(a.state, new c(b, d), "+");
  s(a.state, new c(b, e), "+");
  s(a.state, new c(g, d), "+");
  s(a.state, new c(g, e), "+");
  for (var f = b + 1;f < g;f++) {
    s(a.state, new c(f, d), "\u2014"), s(a.state, new c(f, e), "\u2014");
  }
  for (d += 1;d < e;d++) {
    s(a.state, new c(b, d), "|"), s(a.state, new c(g, d), "|");
  }
}
function t(a) {
  this.state = a;
  this.j = new p(a);
}
;function u(a, b) {
  a.f = b;
  a.i = $.now();
  window.setTimeout(function() {
    null == this.c && (this.k.j.start(m(n(this.view, b))), this.view.b = !0);
  }.bind(a), 150);
}
function v(a, b) {
  if (null != a.f && (null == a.c && 150 > $.now() - a.i && 0.1 < (new c(b.x - a.f.x, b.y - a.f.y)).length() && (a.c = a.view.offset), null == a.c && 150 <= $.now() - a.i && (null == a.g || null == m(n(a.view, a.g)) || m(n(a.view, b)).x != m(n(a.view, a.g)).x || m(n(a.view, b)).y != m(n(a.view, a.g)).y) && (a.k.j.move(m(n(a.view, b))), a.view.b = !0, a.g = b), null != a.c)) {
    var d = a.view, g = a.c.add((new c(a.f.x - b.x, a.f.y - b.y)).scale(1 / a.view.zoom));
    d.offset = g;
    d.b = !0;
  }
}
function w(a, b) {
  null == a.c && 150 <= $.now() - a.i && (a.k.j.end(m(n(a.view, b))), a.view.b = !0);
  a.f = null;
  a.i = 0;
  a.c = null;
  a.g = null;
}
function x(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var d = a.view;
    d.zoom = b;
    d.b = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    u(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function(b) {
    w(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseleave(function(b) {
    w(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mousemove(function(b) {
    v(a, new c(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    k(a.view);
  });
}
function y(a) {
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    u(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    w(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    v(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
}
;function z() {
  this.d = this.value = null;
}
function s(a, b, d) {
  b = a.cells[b.x][b.y];
  a.a.push(b);
  b.d = d;
}
;var A = new function() {
  this.cells = Array(1E3);
  this.a = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new z;
    }
  }
}, B = new h(A);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.k = new t(b);
  x(this);
  y(this);
}(B, A);
B.animate();

