try {
  throw 1;
} catch (aa) {
  window.C = window.C || {};
}
var f = "ontouchstart" in window || "onmsgesturechange" in window;
function l(a, b) {
  this.x = a;
  this.y = b;
}
function m(a, b) {
  return null != b && a.x == b.x && a.y == b.y;
}
function n(a, b) {
  return new l(a.x - b.x, a.y - b.y);
}
l.prototype.add = function(a) {
  return new l(this.x + a.x, this.y + a.y);
};
l.prototype.clone = function() {
  return new l(this.x, this.y);
};
l.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
l.prototype.scale = function(a) {
  return new l(this.x * a, this.y * a);
};
var p = new l(-1, 0), q = new l(1, 0), r = new l(0, -1), s = new l(0, 1), v = [p, q, r, s];
function ba() {
  this.f = this.value = null;
}
function w(a) {
  return null != a.f ? a.f : a.value;
}
function x(a) {
  return "+" == w(a);
}
function ca(a, b, c, e) {
  this.left = a;
  this.right = b;
  this.n = c;
  this.j = e;
}
function y(a) {
  return a.left + a.right + a.n + a.j;
}
function da(a, b) {
  this.position = a;
  this.value = b;
}
function ea(a, b) {
  this.position = a;
  this.A = b;
}
;function z(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new l(7500, 7500);
  this.c = !0;
  this.s = f;
  A(this);
}
function A(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.c = !0;
}
z.prototype.animate = function() {
  if (this.c || this.state.c) {
    this.c = !1, this.state.c = !1, fa(this);
  }
  var a = this;
  window.requestAnimationFrame(function() {
    a.animate();
  });
};
function fa(a) {
  var b = a.context;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, a.canvas.width, a.canvas.height);
  b.scale(a.zoom, a.zoom);
  b.translate(a.canvas.width / 2 / a.zoom, a.canvas.height / 2 / a.zoom);
  var c = n(B(a, new l(0, 0)), new l(3, 3)), e = B(a, new l(a.canvas.width, a.canvas.height)).add(new l(3, 3));
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
      var h = D(a.state, new l(g, k));
      if (x(h) || null != h.f && " " != w(h)) {
        a.context.fillStyle = null != h.f ? "#DEF" : "#F5F5F5", b.fillRect(9 * g - a.offset.x, 17 * (k - 1) - a.offset.y, 9, 17);
      }
      var t = E(a.state, new l(g, k));
      null == t || x(h) && !d || (a.context.fillStyle = "#000000", b.fillText(t, 9 * g - a.offset.x, 17 * k - a.offset.y - 3));
    }
  }
  if (a.s) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (d = c.x;d < e.x;d++) {
      for (h = !1, g = c.y;g < e.y;g++) {
        k = D(a.state, new l(d, g)), x(k) && g != e.y - 1 || !h || (b.moveTo(9 * d - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), b.lineTo(9 * d - a.offset.x + 4.5, 17 * (g - 1) - a.offset.y - 8.5), h = !1), x(k) && !h && (h = g);
      }
    }
    for (g = c.y;g < e.y;g++) {
      for (h = !1, d = c.x;d < e.x;d++) {
        k = D(a.state, new l(d, g)), x(k) && d != e.x - 1 || !h || (b.moveTo(9 * h - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), b.lineTo(9 * (d - 1) - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), h = !1), x(k) && !h && (h = d);
      }
    }
    a.context.stroke();
  }
}
function B(a, b) {
  return new l(Math.min(Math.max(1, Math.round(((new l((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new l((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function F(a, b, c, e, d) {
  d = d || "+";
  var g = Math.min(b.x, c.x), k = Math.min(b.y, c.y), h = Math.max(b.x, c.x), t = Math.max(b.y, c.y), u = e ? c.x : b.x;
  for (e = e ? b.y : c.y;g++ < h;) {
    var O = new l(g, e), J = a.getContext(new l(g, e));
    " " == d && 2 == J.n + J.j || G(a, O, d);
  }
  for (;k++ < t;) {
    O = new l(u, k), J = a.getContext(new l(u, k)), " " == d && 2 == J.left + J.right || G(a, O, d);
  }
  H(a, b, d);
  H(a, c, d);
  G(a, new l(u, e), d);
}
function I(a) {
  this.state = a;
  this.a = null;
}
I.prototype.start = function(a) {
  this.a = a;
};
I.prototype.move = function(a) {
  this.l = a;
  K(this.state);
  F(this.state, this.a, a, !0);
  F(this.state, this.a, a, !1);
};
I.prototype.end = function() {
  L(this.state);
};
I.prototype.m = function() {
  return "crosshair";
};
I.prototype.h = function() {
};
function M(a) {
  this.state = a;
  this.a = null;
}
M.prototype.start = function(a) {
  this.a = a;
};
M.prototype.move = function(a) {
  K(this.state);
  var b = this.state.getContext(this.a), c = this.state.getContext(a);
  F(this.state, this.a, a, b.n && b.j || c.left && c.right);
};
M.prototype.end = function() {
  L(this.state);
};
M.prototype.m = function() {
  return "crosshair";
};
M.prototype.h = function() {
};
function N(a, b) {
  this.state = a;
  this.value = b;
}
N.prototype.start = function(a) {
  H(this.state, a, this.value);
};
N.prototype.move = function(a) {
  H(this.state, a, this.value);
};
N.prototype.end = function() {
  L(this.state);
};
N.prototype.m = function() {
  return "crosshair";
};
N.prototype.h = function(a) {
  1 == a.length && (this.value = a);
};
function P(a) {
  this.state = a;
  this.e = this.a = null;
}
P.prototype.start = function(a) {
  this.e = this.a = a;
  K(this.state);
  var b = w(D(this.state, a));
  H(this.state, a, null == b ? "\u2009" : b);
};
P.prototype.move = function() {
};
P.prototype.end = function() {
};
P.prototype.m = function() {
  return "text";
};
P.prototype.h = function(a) {
  if (null != this.e) {
    var b = this.e.add(q);
    if ("<enter>" == a || x(D(this.state, b))) {
      K(this.state), this.a = b = this.a.add(s);
    }
    "<backspace>" == a && this.a.x <= b.x && (K(this.state), b = this.e.add(p), b.x < this.a.x && (b.x = this.a.x), H(this.state, b, "\u2009"), L(this.state));
    "<up>" == a && (K(this.state), this.a = b = this.e.add(r));
    "<left>" == a && (K(this.state), this.a = b = this.e.add(p));
    "<right>" == a && (K(this.state), this.a = b = this.e.add(q));
    "<down>" == a && (K(this.state), this.a = b = this.e.add(s));
    1 == a.length && (H(this.state, this.e, a), L(this.state));
    this.e = b;
    a = w(D(this.state, b));
    H(this.state, b, null == a ? "\u2009" : a);
  }
};
function Q(a) {
  this.state = a;
  this.l = this.a = null;
}
Q.prototype.start = function(a) {
  this.a = a;
  this.move(a);
};
Q.prototype.move = function(a) {
  K(this.state);
  this.l = a;
  var b = Math.min(this.a.x, this.l.x);
  a = Math.min(this.a.y, this.l.y);
  for (var c = Math.max(this.a.x, this.l.x), e = Math.max(this.a.y, this.l.y);b <= c;b++) {
    for (var d = a;d <= e;d++) {
      H(this.state, new l(b, d), "\u2009");
    }
  }
};
Q.prototype.end = function() {
  L(this.state);
};
Q.prototype.m = function() {
  return "crosshair";
};
Q.prototype.h = function() {
};
function R(a) {
  this.state = a;
  this.g = this.a = null;
}
R.prototype.start = function(a) {
  if (f && !x(D(this.state, a))) {
    var b = v.concat([p.add(r), p.add(s), q.add(r), q.add(s)]), c = null, e = 0, d;
    for (d in b) {
      var g = a.add(b[d]), k = y(this.state.getContext(g));
      x(D(this.state, g)) && k > e && (c = b[d], e = k);
    }
    a = null == c ? a : a.add(c);
  }
  this.a = a;
  this.g = null;
  if (x(D(this.state, this.a))) {
    this.state.getContext(this.a);
    a = [];
    for (var h in v) {
      var b = S(this, this.a, v[h]), t;
      for (t in b) {
        if (c = b[t], e = 0 != v[h].x, 1 == y(this.state.getContext(c))) {
          a.push({position:c, u:e});
        } else {
          for (var u in v) {
            0 != v[h].add(v[u]).length() && 2 != v[h].add(v[u]).length() && (d = S(this, c, v[u]), 0 != d.length && a.push({position:d[d.length - 1], u:e}));
          }
        }
      }
    }
    this.g = a;
    this.move(this.a);
  }
};
R.prototype.move = function(a) {
  K(this.state);
  for (var b in this.g) {
    F(this.state, this.a, this.g[b].position, this.g[b].u, " ");
  }
  for (b in this.g) {
    F(this.state, a, this.g[b].position, this.g[b].u);
  }
};
R.prototype.end = function() {
  L(this.state);
};
function S(a, b, c) {
  for (var e = b.clone(), d = [];;) {
    var g = e.add(c);
    if (!x(D(a.state, g))) {
      return m(b, e) || d.push(e), d;
    }
    e = g;
    3 == y(a.state.getContext(e)) && d.push(e);
  }
}
R.prototype.m = function(a) {
  return x(D(this.state, a)) ? "pointer" : "default";
};
R.prototype.h = function() {
};
function T() {
  this.cells = Array(2E3);
  this.i = [];
  this.c = !0;
  this.q = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(600);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new ba;
    }
  }
}
T.prototype.clear = function() {
  for (var a = 0;a < this.cells.length;a++) {
    for (var b = 0;b < this.cells[a].length;b++) {
      null != w(this.cells[a][b]) && H(this, new l(a, b), "\u2009");
    }
  }
  L(this);
};
function D(a, b) {
  return a.cells[b.x][b.y];
}
function H(a, b, c) {
  var e = D(a, b);
  a.i.push(new ea(b, e));
  e.f = c;
  a.c = !0;
}
function G(a, b, c) {
  w(D(a, b)) != c && H(a, b, c);
}
function K(a) {
  for (var b in a.i) {
    a.i[b].A.f = null;
  }
  a.i.length = 0;
}
function E(a, b) {
  var c = D(a, b), c = null != c.f ? c.f : c.value;
  if ("+" != c) {
    return c;
  }
  c = a.getContext(b);
  return c.left && c.right && !c.n && !c.j ? "\u2013" : !c.left && !c.right && c.n && c.j ? "|" : c.left && c.right && c.n && c.j ? "\u2013" : "+";
}
T.prototype.getContext = function(a) {
  var b = x(D(this, a.add(p))), c = x(D(this, a.add(q))), e = x(D(this, a.add(r)));
  a = x(D(this, a.add(s)));
  return new ca(b, c, e, a);
};
function L(a, b) {
  var c = [], e = a.i.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), d = a.i.filter(function(a, b) {
    return e.indexOf(e[b]) == b;
  });
  a.i.length = 0;
  for (var g in d) {
    var k = d[g].A;
    c.push(new da(d[g].position, null != k.value ? k.value : " "));
    var h = w(k);
    if ("\u2009" == h || " " == h) {
      h = null;
    }
    k.f = null;
    k.value = h;
  }
  !b && 0 < c.length && (50 < a.q.length && a.q.shift(), a.q.push(c));
  a.c = !0;
}
function U(a) {
  if (0 != a.q.length) {
    var b = a.q.pop(), c;
    for (c in b) {
      var e = b[c];
      H(a, e.position, e.value);
    }
    L(a, !0);
  }
}
function V(a) {
  for (var b = new l(Number.MAX_VALUE, Number.MAX_VALUE), c = new l(-1, -1), e = 0;e < a.cells.length;e++) {
    for (var d = 0;d < a.cells[e].length;d++) {
      null != w(a.cells[e][d]) && (e < b.x && (b.x = e), d < b.y && (b.y = d), e > c.x && (c.x = e), d > c.y && (c.y = d));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var g = "", d = b.y;d <= c.y;d++) {
    for (var k = "", e = b.x;e <= c.x;e++) {
      var h = E(a, new l(e, d)), k = k + (null == h ? " " : h)
    }
    g += k.replace("\\s+$/g", "") + "\n";
  }
  return g;
}
;function W(a, b) {
  this.view = a;
  this.state = b;
  this.d = new I(b);
  this.mode = 0;
  this.o();
}
W.prototype.r = function(a) {
  var b = B(this.view, a);
  null == this.p && (this.p = b);
  m(b, this.p) || (this.view.canvas.style.cursor = this.d.m(b));
  2 != this.mode || m(b, this.p) || this.d.move(b);
  if (1 == this.mode) {
    var c = this.view;
    a = this.w.add(n(this.v, a).scale(1 / this.view.zoom));
    c.offset = a;
    c.c = !0;
  }
  this.p = b;
};
function X(a) {
  (a.mode = 2) && a.d.end();
  a.mode = 0;
  a.v = null;
  a.w = null;
  a.p = null;
}
W.prototype.o = function() {
  var a = this;
  $(window).resize(function() {
    A(a.view);
  });
  $("#draw-tools > button.tool").click(function(a) {
    a = a.target.id;
    $("#draw-tools > button.tool").removeClass("active");
    $("#" + a).toggleClass("active");
    $(".dialog").removeClass("visible");
    "box-button" == a && (this.d = new I(this.state));
    "line-button" == a && (this.d = new M(this.state));
    "freeform-button" == a && (this.d = new N(this.state, "+"));
    "erase-button" == a && (this.d = new Q(this.state));
    "move-button" == a && (this.d = new R(this.state));
    "text-button" == a && (this.d = new P(this.state));
  }.bind(this));
  $("#file-tools > button.tool").click(function(a) {
    a = a.target.id;
    $(".dialog").removeClass("visible");
    $("#" + a + "-dialog").toggleClass("visible");
    "export-button" == a && ($("#export-area").val(V(this.state)), $("#export-area").focus(), $("#export-area").select());
    "clear-button" == a && this.state.clear();
    "undo-button" == a && U(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    for (var a = this.state, c = $("#import-area").val(), e = B(this.view, new l(this.view.canvas.width / 4, this.view.canvas.height / 4)), c = c.split("\n"), d = 0;d < c.length;d++) {
      for (var g = c[d], k = 0;k < g.length;k++) {
        var h = g.charAt(k);
        if ("\u2013" == h || "|" == h) {
          h = "+";
        }
        H(a, (new l(k, d)).add(e), h);
      }
    }
    L(a);
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
    this.view.c = !0;
  }.bind(this));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || 13 == a.keyCode || this.d.h(String.fromCharCode(a.keyCode));
  }.bind(this));
  $(window).keydown(function(a) {
    var c = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && U(this.state), 88 == a.keyCode && (c = "<cut>");
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
function ga(a) {
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
ga.prototype.save = function() {
  window.gapi.client.load("drive", "v2", function() {
    ha(function(a) {
      a && ja(this).execute(function(a) {
        ia(this, a);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};
function ja(a) {
  var b = V(a.state), b = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:null == a.file ? "Untitled ASCII Diagram" : a.file.title, mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
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
      a = new l(a.clientX, a.clientY);
      c.mode = 1;
      c.v = a;
      c.w = c.view.offset;
    } else {
      c = this.b, a = new l(a.clientX, a.clientY), c.mode = 2, c.d.start(B(c.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    X(this.b);
  }.bind(this));
  $(a).mouseleave(function() {
    X(this.b);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.b.r(new l(a.clientX, a.clientY));
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
      a.d.start(B(a.view, b));
    }
  }.bind(a), 130);
}
Y.prototype.r = function(a) {
  if (!this.k && 130 > $.now() - this.F && 3 < n(a, this.B).length()) {
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
      la(this, new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new l(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        X(this.b);
        this.t = !0;
        this.k = !1;
        this.G = n(c, a).length();
        this.D = this.b.view.zoom;
      }
    }
  }.bind(this));
  $(a).bind("touchmove", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      this.r(new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new l(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        this.t && (c = this.D * n(c, a).length() / this.G, c = Math.max(Math.min(c, 5), 0.5), a = this.b.view, a.zoom = c, a.c = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    X(this.b);
  }.bind(this));
};
var Z = new T, ma = new z(Z), na = new W(ma, Z);
new Y(na);
new ka(na);
new ga(Z);
ma.animate();

