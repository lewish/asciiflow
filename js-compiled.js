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
function f(a) {
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
f.prototype.animate = function() {
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
  var d = m(n(a, new c(-70, -70))), h = m(n(a, new c(a.canvas.width + 70, a.canvas.height + 70)));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var e = d.x;e < h.x;e++) {
    b.moveTo(15 * e - a.offset.x, 0 - a.offset.y), b.lineTo(15 * e - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var g = d.y;g < h.y;g++) {
    b.moveTo(0 - a.offset.x, 15 * g - a.offset.y), b.lineTo(15 * a.state.cells.length - a.offset.x, 15 * g - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (e = d.x;e < h.x;e++) {
    for (g = d.y;g < h.y;g++) {
      var u = null != a.state.cells[e][g].g ? a.state.cells[e][g].g : a.state.cells[e][g].value;
      null != u && b.fillText(u, 15 * e - a.offset.x + 3, 15 * g - a.offset.y - 2);
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
  var a = Math.min(this.b.x, this.a.x), b = Math.min(this.b.y, this.a.y), d = Math.max(this.b.x, this.a.x), h = Math.max(this.b.y, this.a.y);
  s(this.state, new c(a, b), "+");
  s(this.state, new c(a, h), "+");
  s(this.state, new c(d, b), "+");
  s(this.state, new c(d, h), "+");
  for (var e = a + 1;e < d;e++) {
    s(this.state, new c(e, b), "\u2014"), s(this.state, new c(e, h), "\u2014");
  }
  for (b += 1;b < h;b++) {
    s(this.state, new c(a, b), "|"), s(this.state, new c(d, b), "|");
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
  for (var a = Math.min(this.b.x, this.a.x), b = Math.min(this.b.y, this.a.y), d = Math.max(this.b.x, this.a.x), h = Math.max(this.b.y, this.a.y), e = this.b.y, g = this.a.x;a++ < d;) {
    s(this.state, new c(a, e), "\u2014");
  }
  for (;b++ < h;) {
    s(this.state, new c(g, b), "|");
  }
  s(this.state, new c(this.b.x, this.b.y), "+");
  s(this.state, new c(this.a.x, this.a.y), "+");
  s(this.state, new c(g, e), "+");
};
function v(a) {
  this.state = a;
}
v.prototype.start = function(a) {
  s(this.state, a, "O");
};
v.prototype.move = function(a) {
  s(this.state, a, "O");
};
v.prototype.end = function() {
  r(this.state);
};
function w(a) {
  this.state = a;
  this.h = new p(a);
  $("#box-button").click(function() {
    this.h = new p(a);
  }.bind(this));
  $("#line-button").click(function() {
    this.h = new t(a);
  }.bind(this));
  $("#freeform-button").click(function() {
    this.h = new v(a);
  }.bind(this));
}
;function x(a, b) {
  a.f = b;
  a.k = $.now();
  window.setTimeout(function() {
    null == this.e && null != this.f && (this.l.h.start(m(n(this.view, b))), this.view.d = !0);
  }.bind(a), 150);
}
function y(a, b) {
  if (null != a.f && (null == a.e && 150 > $.now() - a.k && 0.1 < (new c(b.x - a.f.x, b.y - a.f.y)).length() && (a.e = a.view.offset), null == a.e && 150 <= $.now() - a.k && (null == a.j || null == m(n(a.view, a.j)) || m(n(a.view, b)).x != m(n(a.view, a.j)).x || m(n(a.view, b)).y != m(n(a.view, a.j)).y) && (a.l.h.move(m(n(a.view, b))), a.view.d = !0, a.j = b), null != a.e)) {
    var d = a.view, h = a.e.add((new c(a.f.x - b.x, a.f.y - b.y)).scale(1 / a.view.zoom));
    d.offset = h;
    d.d = !0;
  }
}
function z(a, b) {
  null == a.e && 150 <= $.now() - a.k && (a.l.h.end(m(n(a.view, b))), a.view.d = !0);
  a.f = null;
  a.k = 0;
  a.e = null;
  a.j = null;
}
function A(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var d = a.view;
    d.zoom = b;
    d.d = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    x(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function(b) {
    z(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseleave(function(b) {
    z(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mousemove(function(b) {
    y(a, new c(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    k(a.view);
  });
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    x(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    z(a, new c(0, 0));
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    y(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
}
;function B() {
  this.g = this.value = null;
}
function s(a, b, d) {
  b = a.cells[b.x][b.y];
  a.c.push(b);
  b.g = d;
}
function q(a) {
  for (var b in a.c) {
    a.c[b].g = null;
  }
  a.c.length = 0;
}
function r(a) {
  for (var b in a.c) {
    a.c[b].value = null != a.c[b].g ? a.c[b].g : a.c[b].value, a.c[b].g = null;
  }
}
;var C = new function() {
  this.cells = Array(1E3);
  this.c = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new B;
    }
  }
}, D = new f(C);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.l = new w(b);
  A(this);
}(D, C);
D.animate();

