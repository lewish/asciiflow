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
  this.a = !0;
  k(this);
}
function k(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.a = !0;
}
h.prototype.animate = function() {
  if (this.a || this.state.a) {
    this.a = !1, this.state.a = !1, l(this);
  }
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
  var d = m(n(a, new c(-20, -20))), e = m(n(a, new c(a.canvas.width + 20, a.canvas.height + 20)));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var f = d.x;f < e.x;f++) {
    b.moveTo(15 * f - a.offset.x, 0 - a.offset.y), b.lineTo(15 * f - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var g = d.y;g < e.y;g++) {
    b.moveTo(0 - a.offset.x, 15 * g - a.offset.y), b.lineTo(15 * a.state.cells.length - a.offset.x, 15 * g - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (f = d.x;f < e.x;f++) {
    for (g = d.y;g < e.y;g++) {
      null != a.state.cells[f][g].value && b.fillText(a.state.cells[f][g].value, 15 * f - a.offset.x + 3, 15 * g - a.offset.y - 2);
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
}
;function q(a, b) {
  a.c = b;
  a.d = $.now();
  window.setTimeout(function() {
    if (null == this.b) {
      var a = this.e.state, e = m(n(this.view, b));
      a.cells[e.x][e.y].value = "O";
      a.a = !0;
    }
  }.bind(a), 150);
}
function r(a, b) {
  if (null != a.c) {
    null == a.b && 150 > $.now() - a.d && 0.1 < (new c(b.x - a.c.x, b.y - a.c.y)).length() && (a.b = a.view.offset);
    if (null == a.b && 150 <= $.now() - a.d) {
      var d = a.e.state, e = m(n(a.view, b));
      d.cells[e.x][e.y].value = "O";
      d.a = !0;
    }
    null != a.b && (d = a.view, e = a.b.add((new c(a.c.x - b.x, a.c.y - b.y)).scale(1 / a.view.zoom)), d.offset = e, d.a = !0);
  }
}
function s(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    b = a.view.zoom * (0 < b.originalEvent.wheelDelta ? 1.1 : 0.9);
    b = Math.max(Math.min(b, 5), 0.2);
    var d = a.view;
    d.zoom = b;
    d.a = !0;
  });
  $(a.view.canvas).mousedown(function(b) {
    q(a, new c(b.clientX, b.clientY));
  });
  $(a.view.canvas).mouseup(function() {
    a.c = null;
    a.d = 0;
    a.b = null;
  });
  $(a.view.canvas).mousemove(function(b) {
    r(a, new c(b.clientX, b.clientY));
  });
  $(window).resize(function() {
    k(a.view);
  });
}
function t(a) {
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    q(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    a.c = null;
    a.d = 0;
    a.b = null;
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    r(a, new c(b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY));
  });
}
;function u() {
  this.value = null;
}
;var v = new function() {
  this.cells = Array(1E3);
  this.a = !0;
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new u;
    }
  }
}, w = new h(v);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.e = new p(b);
  s(this);
  t(this);
}(w, v);
w.animate();

