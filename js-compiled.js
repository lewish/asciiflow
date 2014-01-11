function d(a, b) {
  this.x = a;
  this.y = b;
}
d.prototype.add = function(a) {
  return new d(this.x + a.x, this.y + a.y);
};
d.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
d.prototype.scale = function(a) {
  return new d(this.x * a, this.y * a);
};
function f(a) {
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new d(7500, 7500);
  this.state = a;
  g(this);
}
function g(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
}
f.prototype.animate = function() {
  h(this);
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function h(a) {
  a.context.setTransform(1, 0, 0, 1, 0, 0);
  a.context.clearRect(0, 0, a.canvas.width, a.canvas.height);
  a.context.scale(a.zoom, a.zoom);
  a.context.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  a.context.lineWidth = "1";
  a.context.strokeStyle = "#EEEEEE";
  a.context.beginPath();
  for (var b = 0;b < a.state.cells.length;b++) {
    a.context.moveTo(15 * b - a.offset.x, 0 - a.offset.y), a.context.lineTo(15 * b - a.offset.x, 15 * a.state.cells.length - a.offset.y);
  }
  for (var c = 0;c < a.state.cells[0].length;c++) {
    a.context.moveTo(0 - a.offset.x, 15 * c - a.offset.y), a.context.lineTo(15 * a.state.cells.length - a.offset.x, 15 * c - a.offset.y);
  }
  a.context.stroke();
  a.context.font = "15px Courier New";
  for (b = 0;b < a.state.cells.length;b++) {
    for (c = 0;c < a.state.cells[b].length;c++) {
      null != a.state.cells[b][c].value && a.context.fillText(a.state.cells[b][c].value, 15 * b - a.offset.x + 3, 15 * c - a.offset.y - 2);
    }
  }
}
function k(a, b) {
  return new d((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y);
}
function l(a) {
  return new d(Math.round((a.x - 7.5) / 15), Math.round((a.y + 7.5) / 15));
}
;function m(a) {
  this.state = a;
}
;function n(a, b, c) {
  var e = new d(b, c);
  a.b = new d(b, c);
  a.c = $.now();
  window.setTimeout(function() {
    null == this.a && (this.d.state.cells[l(k(this.view, e)).x][l(k(this.view, e)).y].value = "O");
  }.bind(a), 150);
}
function p(a, b, c) {
  var e = new d(b, c);
  null != a.b && (null == a.a && 150 > $.now() - a.c && 0.1 < (new d(e.x - a.b.x, e.y - a.b.y)).length() && (a.a = a.view.offset), null == a.a && 150 <= $.now() - a.c && (a.d.state.cells[l(k(a.view, e)).x][l(k(a.view, e)).y].value = "O"), null != a.a && (e = a.b, b = new d(b, c), a.view.offset = a.a.add((new d(e.x - b.x, e.y - b.y)).scale(1 / a.view.zoom))));
}
function q(a) {
  $(a.view.canvas).bind("mousewheel", function(b) {
    a.view.zoom *= 0 < b.originalEvent.wheelDelta ? 1.1 : 0.9;
    a.view.zoom = Math.max(Math.min(a.view.zoom, 5), 0.2);
  });
  $(a.view.canvas).mousedown(function(b) {
    n(a, b.clientX, b.clientY);
  });
  $(a.view.canvas).mouseup(function() {
    a.b = null;
    a.c = 0;
    a.a = null;
  });
  $(a.view.canvas).mousemove(function(b) {
    p(a, b.clientX, b.clientY);
  });
  $(window).resize(function() {
    g(a.view);
  });
}
function r(a) {
  $(a.view.canvas).bind("touchstart", function(b) {
    b.preventDefault();
    n(a, b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY);
  });
  $(a.view.canvas).bind("touchend", function(b) {
    b.preventDefault();
    a.b = null;
    a.c = 0;
    a.a = null;
  });
  $(a.view.canvas).bind("touchmove", function(b) {
    b.preventDefault();
    p(a, b.originalEvent.touches[0].pageX, b.originalEvent.touches[0].pageY);
  });
}
;function s() {
  this.value = null;
}
;var t = new function() {
  this.cells = Array(1E3);
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(1E3);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new s;
    }
  }
}, u = new f(t);
new function(a, b) {
  this.view = a;
  this.state = b;
  this.d = new m(b);
  q(this);
  r(this);
}(u, t);
u.animate();

