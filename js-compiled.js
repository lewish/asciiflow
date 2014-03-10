try {
  throw 1;
} catch (aa) {
  window.C = window.C || {};
}
var ba = "ontouchstart" in window || "onmsgesturechange" in window;
function f(a, b) {
  this.x = a;
  this.y = b;
}
function l(a, b) {
  return null != b && a.x == b.x && a.y == b.y;
}
function m(a, b) {
  return new f(a.x - b.x, a.y - b.y);
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
var n = new f(-1, 0), p = new f(1, 0), q = new f(0, -1), r = new f(0, 1), s = [n, p, q, r];
function ca() {
  this.f = this.value = null;
}
function v(a) {
  return null != a.f ? a.f : a.value;
}
function w(a) {
  return "+" == v(a);
}
function da(a, b, c, e) {
  this.left = a;
  this.right = b;
  this.n = c;
  this.j = e;
}
function x(a) {
  return a.left + a.right + a.n + a.j;
}
function ea(a, b) {
  this.position = a;
  this.value = b;
}
function fa(a, b) {
  this.position = a;
  this.A = b;
}
;function y(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new f(7500, 7500);
  this.s = this.c = !0;
  z(this);
}
function z(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.c = !0;
}
y.prototype.animate = function() {
  if (this.c || this.state.c) {
    this.c = !1, this.state.c = !1, ga(this);
  }
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function ga(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = m(A(a, new f(0, 0)), new f(3, 3)), e = A(a, new f(a.canvas.width, a.canvas.height)).add(new f(3, 3));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var d = c.x;d < e.x;d++) {
    b.moveTo(9 * d - a.offset.x, 0 - a.offset.y), b.lineTo(9 * d - a.offset.x, 17 * a.state.cells.length - a.offset.y);
  }
  for (d = c.y;d < e.y;d++) {
    b.moveTo(0 - a.offset.x, 17 * d - a.offset.y), b.lineTo(9 * a.state.cells.length - a.offset.x, 17 * d - a.offset.y);
  }
  a.context.stroke();
  d = !a.s;
  b.font = "15px Courier New";
  for (var g = c.x;g < e.x;g++) {
    for (var k = c.y;k < e.y;k++) {
      var h = B(a.state, new f(g, k));
      if (w(h) || null != h.f && " " != v(h)) {
        a.context.fillStyle = null != h.f ? "#DEF" : "#F5F5F5", b.fillRect(9 * g - a.offset.x, 17 * (k - 1) - a.offset.y, 9, 17);
      }
      var t = D(a.state, new f(g, k));
      null == t || w(h) && !d || (a.context.fillStyle = "#000000", b.fillText(t, 9 * g - a.offset.x, 17 * k - a.offset.y - 3));
    }
  }
  if (a.s) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (d = c.x;d < e.x;d++) {
      for (h = !1, g = c.y;g < e.y;g++) {
        k = B(a.state, new f(d, g)), w(k) && g != e.y - 1 || !h || (b.moveTo(9 * d - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), b.lineTo(9 * d - a.offset.x + 4.5, 17 * (g - 1) - a.offset.y - 8.5), h = !1), w(k) && !h && (h = g);
      }
    }
    for (g = c.y;g < e.y;g++) {
      for (h = !1, d = c.x;d < e.x;d++) {
        k = B(a.state, new f(d, g)), w(k) && d != e.x - 1 || !h || (b.moveTo(9 * h - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), b.lineTo(9 * (d - 1) - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), h = !1), w(k) && !h && (h = d);
      }
    }
    a.context.stroke();
  }
}
function A(a, b) {
  return new f(Math.min(Math.max(1, Math.round(((new f((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new f((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function E(a, b, c, e, d) {
  d = d || "+";
  var g = Math.min(b.x, c.x), k = Math.min(b.y, c.y), h = Math.max(b.x, c.x), t = Math.max(b.y, c.y), u = e ? c.x : b.x;
  for (e = e ? b.y : c.y;g++ < h;) {
    var O = new f(g, e), J = a.getContext(new f(g, e));
    " " == d && 2 == J.n + J.j || F(a, O, d);
  }
  for (;k++ < t;) {
    O = new f(u, k), J = a.getContext(new f(u, k)), " " == d && 2 == J.left + J.right || F(a, O, d);
  }
  G(a, b, d);
  G(a, c, d);
  F(a, new f(u, e), d);
}
function H(a) {
  this.state = a;
  this.a = null;
}
H.prototype.start = function(a) {
  this.a = a;
};
H.prototype.move = function(a) {
  this.l = a;
  I(this.state);
  E(this.state, this.a, a, !0);
  E(this.state, this.a, a, !1);
};
H.prototype.end = function() {
  K(this.state);
};
H.prototype.m = function() {
  return "crosshair";
};
H.prototype.h = function() {
};
function L(a) {
  this.state = a;
  this.a = null;
}
L.prototype.start = function(a) {
  this.a = a;
};
L.prototype.move = function(a) {
  I(this.state);
  var b = this.state.getContext(this.a), c = this.state.getContext(a);
  E(this.state, this.a, a, b.n && b.j || c.left && c.right);
};
L.prototype.end = function() {
  K(this.state);
};
L.prototype.m = function() {
  return "crosshair";
};
L.prototype.h = function() {
};
function M(a, b) {
  this.state = a;
  this.value = b;
}
M.prototype.start = function(a) {
  G(this.state, a, this.value);
};
M.prototype.move = function(a) {
  G(this.state, a, this.value);
};
M.prototype.end = function() {
  K(this.state);
};
M.prototype.m = function() {
  return "crosshair";
};
M.prototype.h = function(a) {
  1 == a.length && (this.value = a);
};
function N(a) {
  this.state = a;
  this.e = this.a = null;
}
N.prototype.start = function(a) {
  this.e = this.a = a;
  I(this.state);
  var b = v(B(this.state, a));
  G(this.state, a, null == b ? "\u2009" : b);
};
N.prototype.move = function() {
};
N.prototype.end = function() {
};
N.prototype.m = function() {
  return "text";
};
N.prototype.h = function(a) {
  if (null != this.e) {
    var b = this.e.add(p);
    if ("<enter>" == a || w(B(this.state, b))) {
      I(this.state), this.a = b = this.a.add(r);
    }
    "<backspace>" == a && this.a.x <= b.x && (I(this.state), b = this.e.add(n), b.x < this.a.x && (b.x = this.a.x), G(this.state, b, "\u2009"), K(this.state));
    "<up>" == a && (I(this.state), this.a = b = this.e.add(q));
    "<left>" == a && (I(this.state), this.a = b = this.e.add(n));
    "<right>" == a && (I(this.state), this.a = b = this.e.add(p));
    "<down>" == a && (I(this.state), this.a = b = this.e.add(r));
    1 == a.length && (G(this.state, this.e, a), K(this.state));
    this.e = b;
    a = v(B(this.state, b));
    G(this.state, b, null == a ? "\u2009" : a);
  }
};
function P(a) {
  this.state = a;
  this.l = this.a = null;
}
P.prototype.start = function(a) {
  this.a = a;
  this.move(a);
};
P.prototype.move = function(a) {
  I(this.state);
  this.l = a;
  var b = Math.min(this.a.x, this.l.x);
  a = Math.min(this.a.y, this.l.y);
  for (var c = Math.max(this.a.x, this.l.x), e = Math.max(this.a.y, this.l.y);b <= c;b++) {
    for (var d = a;d <= e;d++) {
      G(this.state, new f(b, d), "\u2009");
    }
  }
};
P.prototype.end = function() {
  K(this.state);
};
P.prototype.m = function() {
  return "crosshair";
};
P.prototype.h = function() {
};
function Q(a) {
  this.state = a;
  this.g = this.a = null;
}
Q.prototype.start = function(a) {
  if (ba && !w(B(this.state, a))) {
    var b = s.concat([n.add(q), n.add(r), p.add(q), p.add(r)]), c = null, e = 0, d;
    for (d in b) {
      var g = a.add(b[d]), k = x(this.state.getContext(g));
      w(B(this.state, g)) && k > e && (c = b[d], e = k);
    }
    a = null == c ? a : a.add(c);
  }
  this.a = a;
  this.g = null;
  if (w(B(this.state, this.a))) {
    this.state.getContext(this.a);
    a = [];
    for (var h in s) {
      var b = R(this, this.a, s[h]), t;
      for (t in b) {
        if (c = b[t], e = 0 != s[h].x, 1 == x(this.state.getContext(c))) {
          a.push({position:c, u:e});
        } else {
          for (var u in s) {
            0 != s[h].add(s[u]).length() && 2 != s[h].add(s[u]).length() && (d = R(this, c, s[u]), 0 != d.length && a.push({position:d[d.length - 1], u:e}));
          }
        }
      }
    }
    this.g = a;
    this.move(this.a);
  }
};
Q.prototype.move = function(a) {
  I(this.state);
  for (var b in this.g) {
    E(this.state, this.a, this.g[b].position, this.g[b].u, " ");
  }
  for (b in this.g) {
    E(this.state, a, this.g[b].position, this.g[b].u);
  }
};
Q.prototype.end = function() {
  K(this.state);
};
function R(a, b, c) {
  for (var e = b.clone(), d = [];;) {
    var g = e.add(c);
    if (!w(B(a.state, g))) {
      return l(b, e) || d.push(e), d;
    }
    e = g;
    3 == x(a.state.getContext(e)) && d.push(e);
  }
}
Q.prototype.m = function(a) {
  return w(B(this.state, a)) ? "pointer" : "default";
};
Q.prototype.h = function() {
};
function S() {
  this.cells = Array(2E3);
  this.i = [];
  this.c = !0;
  this.q = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(600);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new ca;
    }
  }
}
S.prototype.clear = function() {
  for (var a = 0;a < this.cells.length;a++) {
    for (var b = 0;b < this.cells[a].length;b++) {
      null != v(this.cells[a][b]) && G(this, new f(a, b), "\u2009");
    }
  }
  K(this);
};
function B(a, b) {
  return a.cells[b.x][b.y];
}
function G(a, b, c) {
  var e = B(a, b);
  a.i.push(new fa(b, e));
  e.f = c;
  a.c = !0;
}
function F(a, b, c) {
  v(B(a, b)) != c && G(a, b, c);
}
function I(a) {
  for (var b in a.i) {
    a.i[b].A.f = null;
  }
  a.i.length = 0;
}
function D(a, b) {
  var c = B(a, b), c = null != c.f ? c.f : c.value;
  if ("+" != c) {
    return c;
  }
  c = a.getContext(b);
  return c.left && c.right && !c.n && !c.j ? "\u2013" : !c.left && !c.right && c.n && c.j ? "|" : c.left && c.right && c.n && c.j ? "\u2013" : "+";
}
S.prototype.getContext = function(a) {
  var b = w(B(this, a.add(n))), c = w(B(this, a.add(p))), e = w(B(this, a.add(q)));
  a = w(B(this, a.add(r)));
  return new da(b, c, e, a);
};
function K(a, b) {
  var c = [], e = a.i.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), d = a.i.filter(function(a, b) {
    return e.indexOf(e[b]) == b;
  });
  a.i.length = 0;
  for (var g in d) {
    var k = d[g].A;
    c.push(new ea(d[g].position, null != k.value ? k.value : " "));
    var h = v(k);
    if ("\u2009" == h || " " == h) {
      h = null;
    }
    k.f = null;
    k.value = h;
  }
  !b && 0 < c.length && (50 < a.q.length && a.q.shift(), a.q.push(c));
  a.c = !0;
}
function T(a) {
  if (0 != a.q.length) {
    var b = a.q.pop(), c;
    for (c in b) {
      var e = b[c];
      G(a, e.position, e.value);
    }
    K(a, !0);
  }
}
function U(a) {
  for (var b = new f(Number.MAX_VALUE, Number.MAX_VALUE), c = new f(-1, -1), e = 0;e < a.cells.length;e++) {
    for (var d = 0;d < a.cells[e].length;d++) {
      null != v(a.cells[e][d]) && (e < b.x && (b.x = e), d < b.y && (b.y = d), e > c.x && (c.x = e), d > c.y && (c.y = d));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var g = "", d = b.y;d <= c.y;d++) {
    for (var k = "", e = b.x;e <= c.x;e++) {
      var h = D(a, new f(e, d)), k = k + (null == h ? " " : h)
    }
    g += k.replace("\\s+$/g", "") + "\n";
  }
  return g;
}
;function V(a, b) {
  this.view = a;
  this.state = b;
  this.d = new H(b);
  this.mode = 0;
  this.o();
}
V.prototype.r = function(a) {
  var b = A(this.view, a);
  null == this.p && (this.p = b);
  l(b, this.p) || (this.view.canvas.style.cursor = this.d.m(b));
  2 != this.mode || l(b, this.p) || this.d.move(b);
  if (1 == this.mode) {
    var c = this.view;
    a = this.w.add(m(this.v, a).scale(1 / this.view.zoom));
    c.offset = a;
    c.c = !0;
  }
  this.p = b;
};
function W(a) {
  (a.mode = 2) && a.d.end();
  a.mode = 0;
  a.v = null;
  a.w = null;
  a.p = null;
}
V.prototype.o = function() {
  var a = this;
  $(window).resize(function() {
    z(a.view);
  });
  $("button.tool").click(function(a) {
    a = a.target.id;
    $("button.tool").removeClass("active");
    $(".dialog").removeClass("visible");
    $("#" + a).toggleClass("active");
    $("#" + a + "-dialog").toggleClass("visible");
    "box-button" == a && (this.d = new H(this.state));
    "line-button" == a && (this.d = new L(this.state));
    "freeform-button" == a && (this.d = new M(this.state, "+"));
    "erase-button" == a && (this.d = new P(this.state));
    "move-button" == a && (this.d = new Q(this.state));
    "text-button" == a && (this.d = new N(this.state));
    "export-button" == a && $("#export-area").val(U(this.state));
    "clear-button" == a && this.state.clear();
    "undo-button" == a && T(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    for (var a = this.state, c = $("#import-area").val(), e = A(this.view, new f(this.view.canvas.width / 4, this.view.canvas.height / 4)), c = c.split("\n"), d = 0;d < c.length;d++) {
      for (var g = c[d], k = 0;k < g.length;k++) {
        var h = g.charAt(k);
        if ("\u2013" == h || "|" == h) {
          h = "+";
        }
        G(a, (new f(k, d)).add(e), h);
      }
    }
    K(a);
    $("#import-area").val("");
  }.bind(this));
  $("#use-lines-button").click(function() {
    $(".dialog").removeClass("visible");
    this.view.s = !0;
    this.view.c = !0;
  }.bind(this));
  $("#use-ascii-button").click(function() {
    $(".dialog").removeClass("visible");
    this.view.s = !1;
    this.view.c = !1;
  }.bind(this));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || 13 == a.keyCode || this.d.h(String.fromCharCode(a.keyCode));
  }.bind(this));
  $(window).keydown(function(a) {
    var c = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && T(this.state), 88 == a.keyCode && (c = "<cut>");
    }
    8 == a.keyCode && (c = "<backspace>");
    13 == a.keyCode && (c = "<enter>");
    38 == a.keyCode && (c = "<up>");
    40 == a.keyCode && (c = "<down>");
    37 == a.keyCode && (c = "<left>");
    39 == a.keyCode && (c = "<right>");
    null != c && this.d.h(c);
  }.bind(this));
};
function X(a) {
  this.state = a;
  this.file = null;
  $("#save-button").click(function() {
    this.save();
  }.bind(this));
}
function ha(a) {
  window.gapi.auth.authorize({client_id:"125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com", scope:"https://www.googleapis.com/auth/drive", immediate:!0}, function(b) {
    b && !b.error ? a(!0) : window.gapi.auth.authorize({client_id:"125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com", scope:"https://www.googleapis.com/auth/drive", immediate:!1}, function(b) {
      a(b && !b.error);
    });
  });
}
function ia(a, b) {
  a.file = b;
  $("#drive-filename").text(b.title);
  $("#drive-filename").editable(function(a) {
    this.file.title = a;
    this.save();
    $("#drive-filename").off();
    return a;
  }.bind(a), {type:"text", submit:"OK"});
}
X.prototype.save = function() {
  window.gapi.client.load("drive", "v2", function() {
    ha(function(a) {
      a && ja(this).execute(function(a) {
        ia(this, a);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};
function ja(a) {
  var b = U(a.state), b = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:null == a.file ? "Untitled ASCII Diagram" : a.file.title, mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({path:"/upload/drive/v2/files" + (null == a.file ? "" : "/" + a.file.id), method:null == a.file ? "POST" : "PUT", params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:b});
}
;function ka(a) {
  this.b = a;
  this.o();
}
ka.prototype.o = function() {
  var a = this.b.view.canvas;
  $(a).bind("mousewheel", function(a) {
    a = this.b.view.zoom * (0 < a.originalEvent.wheelDelta ? 1.1 : 0.9);
    a = Math.max(Math.min(a, 5), 0.2);
    var c = this.b.view;
    c.zoom = a;
    c.c = !0;
  }.bind(this));
  $(a).mousedown(function(a) {
    if (a.ctrlKey || a.metaKey) {
      var c = this.b;
      a = new f(a.clientX, a.clientY);
      c.mode = 1;
      c.v = a;
      c.w = c.view.offset;
    } else {
      c = this.b, a = new f(a.clientX, a.clientY), c.mode = 2, c.d.start(A(c.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    W(this.b);
  }.bind(this));
  $(a).mouseleave(function() {
    W(this.b);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.b.r(new f(a.clientX, a.clientY));
  }.bind(this));
};
function Y(a) {
  this.b = a;
  this.t = this.k = !1;
  this.o();
}
function la(a, b) {
  a.B = b;
  a.F = $.now();
  a.k = !1;
  window.setTimeout(function() {
    if (!this.k && !this.t) {
      var a = this.b;
      a.mode = 2;
      a.d.start(A(a.view, b));
    }
  }.bind(a), 130);
}
Y.prototype.r = function(a) {
  if (!this.k && 130 > $.now() - this.F && 3 < m(a, this.B).length()) {
    this.k = !0;
    var b = this.b;
    b.mode = 1;
    b.v = a;
    b.w = b.view.offset;
  }
  this.b.r(a);
};
Y.prototype.reset = function() {
  this.t = this.k = !1;
  this.B = null;
};
Y.prototype.o = function() {
  var a = this.b.view.canvas;
  $(a).bind("touchstart", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      la(this, new f(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new f(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new f(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        W(this.b);
        this.t = !0;
        this.k = !1;
        this.G = m(c, a).length();
        this.D = this.b.view.zoom;
      }
    }
  }.bind(this));
  $(a).bind("touchmove", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      this.r(new f(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new f(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new f(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        this.t && (c = this.D * m(c, a).length() / this.G, c = Math.max(Math.min(c, 5), 0.5), a = this.b.view, a.zoom = c, a.c = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    W(this.b);
  }.bind(this));
};
var Z = new S, ma = new y(Z), na = new V(ma, Z);
new Y(na);
new ka(na);
new X(Z);
ma.animate();

