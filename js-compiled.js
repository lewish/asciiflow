try {
  throw 1;
} catch (aa) {
  window.D = window.D || {};
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
  this.m = c;
  this.j = e;
}
function y(a) {
  return a.left + a.right + a.m + a.j;
}
function da(a, b) {
  this.position = a;
  this.value = b;
}
function ea(a, b) {
  this.position = a;
  this.C = b;
}
;function z(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new l(7500, 7500);
  this.d = !0;
  this.r = f;
  A(this);
}
function A(a) {
  a.canvas.width = document.documentElement.clientWidth;
  a.canvas.height = document.documentElement.clientHeight;
  a.d = !0;
}
z.prototype.animate = function() {
  if (this.d || this.state.d) {
    this.d = !1, this.state.d = !1, fa(this);
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
  d = !a.r;
  b.font = "15px Courier New";
  for (var g = c.x;g < e.x;g++) {
    for (var k = c.y;k < e.y;k++) {
      var h = C(a.state, new l(g, k));
      if (x(h) || null != h.f && " " != w(h)) {
        a.context.fillStyle = null != h.f ? "#DEF" : "#F5F5F5", b.fillRect(9 * g - a.offset.x, 17 * (k - 1) - a.offset.y, 9, 17);
      }
      var t = F(a.state, new l(g, k));
      null == t || x(h) && !d || (a.context.fillStyle = "#000000", b.fillText(t, 9 * g - a.offset.x, 17 * k - a.offset.y - 3));
    }
  }
  if (a.r) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (d = c.x;d < e.x;d++) {
      for (h = !1, g = c.y;g < e.y;g++) {
        k = C(a.state, new l(d, g)), x(k) && g != e.y - 1 || !h || (b.moveTo(9 * d - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), b.lineTo(9 * d - a.offset.x + 4.5, 17 * (g - 1) - a.offset.y - 8.5), h = !1), x(k) && !h && (h = g);
      }
    }
    for (g = c.y;g < e.y;g++) {
      for (h = !1, d = c.x;d < e.x;d++) {
        k = C(a.state, new l(d, g)), x(k) && d != e.x - 1 || !h || (b.moveTo(9 * h - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), b.lineTo(9 * (d - 1) - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), h = !1), x(k) && !h && (h = d);
      }
    }
    a.context.stroke();
  }
}
function B(a, b) {
  return new l(Math.min(Math.max(1, Math.round(((new l((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new l((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function G(a, b, c, e, d) {
  d = d || "+";
  var g = Math.min(b.x, c.x), k = Math.min(b.y, c.y), h = Math.max(b.x, c.x), t = Math.max(b.y, c.y), u = e ? c.x : b.x;
  for (e = e ? b.y : c.y;g++ < h;) {
    var P = new l(g, e), E = a.getContext(new l(g, e));
    " " == d && 2 == E.m + E.j || H(a, P, d);
  }
  for (;k++ < t;) {
    P = new l(u, k), E = a.getContext(new l(u, k)), " " == d && 2 == E.left + E.right || H(a, P, d);
  }
  I(a, b, d);
  I(a, c, d);
  H(a, new l(u, e), d);
}
function J(a) {
  this.state = a;
  this.a = null;
}
J.prototype.start = function(a) {
  this.a = a;
};
J.prototype.move = function(a) {
  this.g = a;
  K(this.state);
  G(this.state, this.a, a, !0);
  G(this.state, this.a, a, !1);
};
J.prototype.end = function() {
  L(this.state);
};
J.prototype.l = function() {
  return "crosshair";
};
J.prototype.e = function() {
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
  G(this.state, this.a, a, b.m && b.j || c.left && c.right);
};
M.prototype.end = function() {
  L(this.state);
};
M.prototype.l = function() {
  return "crosshair";
};
M.prototype.e = function() {
};
function N(a, b) {
  this.state = a;
  this.value = b;
  f && ($("#freeform-tool-input").val(""), $("#freeform-tool-input").hide(0, function() {
    $("#freeform-tool-input").show(0, function() {
      $("#freeform-tool-input").focus();
    });
  }));
}
N.prototype.start = function(a) {
  I(this.state, a, this.value);
};
N.prototype.move = function(a) {
  I(this.state, a, this.value);
};
N.prototype.end = function() {
  L(this.state);
};
N.prototype.l = function() {
  return "crosshair";
};
N.prototype.e = function(a) {
  f && (this.value = $("#freeform-tool-input").val().substr(0, 1), $("#freeform-tool-input").blur(), $("#freeform-tool-input").hide(0));
  1 == a.length && (this.value = a);
};
function O(a) {
  this.state = a;
  this.a = null;
}
O.prototype.start = function(a) {
  L(this.state);
  $("#text-tool-input").val("");
  this.a = a;
  a = w(C(this.state, this.a));
  I(this.state, this.a, null == a ? "\u2009" : a);
};
O.prototype.move = function() {
};
O.prototype.end = function() {
  null != this.a && (this.g = this.a, this.a = null, $("#text-tool-widget").hide(0, function() {
    $("#text-tool-widget").show(0, function() {
      $("#text-tool-input").focus();
    });
  }));
};
O.prototype.l = function() {
  return "pointer";
};
O.prototype.e = function() {
  var a = $("#text-tool-input").val();
  K(this.state);
  for (var b = 0, c = 0, e = 0;e < a.length;e++) {
    "\n" == a[e] ? (c++, b = 0) : (I(this.state, this.g.add(new l(b, c)), a[e]), b++);
  }
};
function Q(a) {
  this.state = a;
  this.g = this.a = null;
}
Q.prototype.start = function(a) {
  this.a = a;
  this.move(a);
};
Q.prototype.move = function(a) {
  K(this.state);
  this.g = a;
  var b = Math.min(this.a.x, this.g.x);
  a = Math.min(this.a.y, this.g.y);
  for (var c = Math.max(this.a.x, this.g.x), e = Math.max(this.a.y, this.g.y);b <= c;b++) {
    for (var d = a;d <= e;d++) {
      I(this.state, new l(b, d), "\u2009");
    }
  }
};
Q.prototype.end = function() {
  L(this.state);
};
Q.prototype.l = function() {
  return "crosshair";
};
Q.prototype.e = function() {
};
function R(a) {
  this.state = a;
  this.h = this.a = null;
}
R.prototype.start = function(a) {
  if (f && !x(C(this.state, a))) {
    var b = v.concat([p.add(r), p.add(s), q.add(r), q.add(s)]), c = null, e = 0, d;
    for (d in b) {
      var g = a.add(b[d]), k = y(this.state.getContext(g));
      x(C(this.state, g)) && k > e && (c = b[d], e = k);
    }
    a = null == c ? a : a.add(c);
  }
  this.a = a;
  this.h = null;
  if (x(C(this.state, this.a))) {
    this.state.getContext(this.a);
    a = [];
    for (var h in v) {
      var b = ga(this, this.a, v[h]), t;
      for (t in b) {
        if (c = b[t], e = 0 != v[h].x, 1 == y(this.state.getContext(c))) {
          a.push({position:c, t:e});
        } else {
          for (var u in v) {
            0 != v[h].add(v[u]).length() && 2 != v[h].add(v[u]).length() && (d = ga(this, c, v[u]), 0 != d.length && a.push({position:d[d.length - 1], t:e}));
          }
        }
      }
    }
    this.h = a;
    this.move(this.a);
  }
};
R.prototype.move = function(a) {
  K(this.state);
  for (var b in this.h) {
    G(this.state, this.a, this.h[b].position, this.h[b].t, " ");
  }
  for (b in this.h) {
    G(this.state, a, this.h[b].position, this.h[b].t);
  }
};
R.prototype.end = function() {
  L(this.state);
};
function ga(a, b, c) {
  for (var e = b.clone(), d = [];;) {
    var g = e.add(c);
    if (!x(C(a.state, g))) {
      return m(b, e) || d.push(e), d;
    }
    e = g;
    3 == y(a.state.getContext(e)) && d.push(e);
  }
}
R.prototype.l = function(a) {
  return x(C(this.state, a)) ? "pointer" : "default";
};
R.prototype.e = function() {
};
function S() {
  this.cells = Array(2E3);
  this.i = [];
  this.d = !0;
  this.B = [];
  this.A = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(600);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new ba;
    }
  }
}
S.prototype.clear = function() {
  for (var a = 0;a < this.cells.length;a++) {
    for (var b = 0;b < this.cells[a].length;b++) {
      null != w(this.cells[a][b]) && I(this, new l(a, b), "\u2009");
    }
  }
  L(this);
};
function C(a, b) {
  return a.cells[b.x][b.y];
}
function I(a, b, c) {
  var e = C(a, b);
  a.i.push(new ea(b, e));
  e.f = c;
  a.d = !0;
}
function H(a, b, c) {
  w(C(a, b)) != c && I(a, b, c);
}
function K(a) {
  for (var b in a.i) {
    a.i[b].C.f = null;
  }
  a.i.length = 0;
}
function F(a, b) {
  var c = C(a, b), c = null != c.f ? c.f : c.value;
  if ("+" != c) {
    return c;
  }
  c = a.getContext(b);
  return c.left && c.right && !c.m && !c.j ? "\u2013" : !c.left && !c.right && c.m && c.j ? "|" : c.left && c.right && c.m && c.j ? "\u2013" : "+";
}
S.prototype.getContext = function(a) {
  var b = x(C(this, a.add(p))), c = x(C(this, a.add(q))), e = x(C(this, a.add(r)));
  a = x(C(this, a.add(s)));
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
    var k = d[g].C;
    c.push(new da(d[g].position, null != k.value ? k.value : " "));
    var h = w(k);
    if ("\u2009" == h || " " == h) {
      h = null;
    }
    k.f = null;
    k.value = h;
  }
  d = b ? a.A : a.B;
  0 < c.length && (50 < d.length && d.shift(), d.push(c));
  a.d = !0;
}
function ha(a) {
  if (0 != a.B.length) {
    var b = a.B.pop(), c;
    for (c in b) {
      var e = b[c];
      I(a, e.position, e.value);
    }
    L(a, !0);
  }
}
function ia(a) {
  if (0 != a.A.length) {
    var b = a.A.pop(), c;
    for (c in b) {
      var e = b[c];
      I(a, e.position, e.value);
    }
    L(a);
  }
}
function T(a) {
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
      var h = F(a, new l(e, d)), k = k + (null == h ? " " : h)
    }
    g += k.replace("\\s+$/g", "") + "\n";
  }
  return g;
}
function ja(a, b, c) {
  b = b.split("\n");
  for (var e = new l(0, Math.round(b.length / 2)), d = 0;d < b.length;d++) {
    e.x = Math.max(e.x, Math.round(b[d].length / 2));
  }
  for (d = 0;d < b.length;d++) {
    for (var g = b[d], k = 0;k < g.length;k++) {
      var h = g.charAt(k);
      if ("\u2013" == h || "|" == h) {
        h = "+";
      }
      I(a, n((new l(k, d)).add(c), e), h);
    }
  }
  L(a);
}
;function U(a, b) {
  this.view = a;
  this.state = b;
  this.c = new J(b);
  this.mode = 0;
  this.n();
}
U.prototype.q = function(a) {
  var b = B(this.view, a);
  null == this.o && (this.o = b);
  m(b, this.o) || (this.view.canvas.style.cursor = this.c.l(b));
  2 != this.mode || m(b, this.o) || this.c.move(b);
  if (1 == this.mode) {
    var c = this.view;
    a = this.v.add(n(this.u, a).scale(1 / this.view.zoom));
    c.offset = a;
    c.d = !0;
  }
  this.o = b;
};
function V(a) {
  2 == a.mode && a.c.end();
  a.mode = 0;
  a.u = null;
  a.v = null;
  a.o = null;
}
U.prototype.n = function() {
  var a = this;
  $(window).resize(function() {
    A(a.view);
  });
  $("#draw-tools > button.tool").click(function(a) {
    $("#text-tool-widget").hide(0);
    a = a.target.id;
    $("#draw-tools > button.tool").removeClass("active");
    $("#" + a).toggleClass("active");
    $(".dialog").removeClass("visible");
    "box-button" == a && (this.c = new J(this.state));
    "line-button" == a && (this.c = new M(this.state));
    "freeform-button" == a && (this.c = new N(this.state, "+"));
    "erase-button" == a && (this.c = new Q(this.state));
    "move-button" == a && (this.c = new R(this.state));
    "text-button" == a && (this.c = new O(this.state));
    L(this.state);
    this.view.canvas.focus();
  }.bind(this));
  $("#file-tools > button.tool").click(function(a) {
    a = a.target.id;
    $(".dialog").removeClass("visible");
    $("#" + a + "-dialog").toggleClass("visible");
    "export-button" == a && ($("#export-area").val(T(this.state)), $("#export-area").focus(), $("#export-area").select());
    "clear-button" == a && this.state.clear();
    "undo-button" == a && ha(this.state);
    "redo-button" == a && ia(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    ja(this.state, $("#import-area").val(), B(this.view, new l(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    $("#import-area").val("");
  }.bind(this));
  $("#use-lines-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.r = !0;
    a.d = !0;
  }.bind(this));
  $("#use-ascii-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.r = !1;
    a.d = !0;
  }.bind(this));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || 13 == a.keyCode || this.c.e(String.fromCharCode(a.keyCode));
  }.bind(this));
  $(window).keydown(function(a) {
    var c = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && ha(this.state), 89 == a.keyCode && ia(this.state), 88 == a.keyCode && (c = "<cut>");
    }
    8 == a.keyCode && (c = "<backspace>");
    13 == a.keyCode && (c = "<enter>");
    38 == a.keyCode && (c = "<up>");
    40 == a.keyCode && (c = "<down>");
    37 == a.keyCode && (c = "<left>");
    39 == a.keyCode && (c = "<right>");
    null != c && this.c.e(c);
  }.bind(this));
  $("#text-tool-input, #freeform-tool-input").keyup(function() {
    this.c.e("");
  }.bind(this));
  $("#text-tool-input, #freeform-tool-input").change(function() {
    this.c.e("");
  }.bind(this));
  $("#text-tool-close").click(function() {
    $("#text-tool-widget").hide();
    L(this.state);
  }.bind(this));
};
function ka(a, b) {
  this.p = !1;
  this.state = a;
  this.view = b;
  this.file = null;
  la(this);
  $("#drive-button").click(function() {
    this.p ? ma(this) : (W(this, !1), na(this));
  }.bind(this));
  $("#drive-filename").click(function() {
    var a = "" + $("#drive-filename").text(), a = prompt("Enter new filename:", a);
    this.file.title = a;
    this.save();
  }.bind(this));
  oa(this);
}
function W(a, b) {
  window.gapi.auth.authorize({client_id:"125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com", scope:"https://www.googleapis.com/auth/drive", immediate:b}, function(a) {
    !a || a.error || this.p || (this.p = !0, $("#drive-button").addClass("active"), pa(this));
  }.bind(a));
}
function la(a) {
  window.gapi && window.gapi.auth && window.gapi.auth.authorize ? W(a, !0) : window.setTimeout(function() {
    la(this);
  }.bind(a), 500);
}
function na(a) {
  window.setTimeout(function() {
    this.p ? ma(this) : (W(this, !0), na(this));
  }.bind(a), 1E3);
}
function qa(a, b) {
  a.file = b;
  $("#drive-filename").text(b.title);
  window.location.hash = b.id;
}
function ma(a) {
  $("#drive-dialog").addClass("visible");
  a.save();
}
function oa(a) {
  var b = T(a.state);
  b != a.F && a.file && a.file.editable && (a.F = b, a.save());
  window.setTimeout(function() {
    oa(this);
  }.bind(a), 5E3);
}
ka.prototype.save = function() {
  var a = T(this.state);
  $("#drive-save-state").text("Saving...");
  ra(this, a).execute(function(a) {
    qa(this, a);
    $("#drive-save-state").text("Saved");
  }.bind(this));
};
function pa(a) {
  1 < window.location.hash.length && ($("#drive-save-state").text("Loading..."), window.gapi.client.request({path:"/drive/v2/files/" + window.location.hash.substr(1, window.location.hash.length - 1), method:"GET"}).execute(function(a) {
    qa(this, a);
    sa(this);
  }.bind(a)));
}
function sa(a) {
  ta(a.file.downloadUrl, function(a) {
    $("#drive-save-state").text("Loaded");
    this.state.clear();
    ja(this.state, a, B(this.view, new l(this.view.canvas.width / 2, this.view.canvas.height / 2)));
  }.bind(a));
}
function ra(a, b) {
  var c = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:null == a.file ? "Untitled ASCII Diagram" : a.file.title, mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({path:"/upload/drive/v2/files" + (null == a.file ? "" : "/" + a.file.id), method:null == a.file ? "POST" : "PUT", params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:c});
}
function ta(a, b) {
  var c = window.gapi.auth.getToken().access_token, e = new XMLHttpRequest;
  e.open("GET", a);
  e.setRequestHeader("Authorization", "Bearer " + c);
  e.onload = function() {
    b(e.responseText);
  };
  e.onerror = function() {
    b(null);
  };
  e.send();
}
;function ua(a) {
  this.b = a;
  this.n();
}
ua.prototype.n = function() {
  var a = this.b.view.canvas;
  $(a).bind("mousewheel", function(a) {
    a = this.b.view.zoom * (0 < a.originalEvent.wheelDelta ? 1.1 : 0.9);
    a = Math.max(Math.min(a, 5), 0.2);
    var c = this.b.view;
    c.zoom = a;
    c.d = !0;
  }.bind(this));
  $(a).mousedown(function(a) {
    if (a.ctrlKey || a.metaKey) {
      var c = this.b;
      a = new l(a.clientX, a.clientY);
      c.mode = 1;
      c.u = a;
      c.v = c.view.offset;
    } else {
      c = this.b, a = new l(a.clientX, a.clientY), c.mode = 2, c.c.start(B(c.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    V(this.b);
  }.bind(this));
  $(a).mouseleave(function() {
    V(this.b);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.b.q(new l(a.clientX, a.clientY));
  }.bind(this));
};
function X(a) {
  this.b = a;
  this.s = this.k = !1;
  this.n();
}
function va(a, b) {
  a.w = b;
  a.H = $.now();
  a.k = !1;
  window.setTimeout(function() {
    if (!this.k && !this.s && null != this.w) {
      var a = this.b;
      a.mode = 2;
      a.c.start(B(a.view, b));
    }
  }.bind(a), 130);
}
X.prototype.q = function(a) {
  if (!this.k && 130 > $.now() - this.H && 3 < n(a, this.w).length()) {
    this.k = !0;
    var b = this.b;
    b.mode = 1;
    b.u = a;
    b.v = b.view.offset;
  }
  this.b.q(a);
};
X.prototype.reset = function() {
  this.s = this.k = !1;
  this.w = null;
};
X.prototype.n = function() {
  var a = this.b.view.canvas;
  $(a).bind("touchstart", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      va(this, new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new l(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        V(this.b);
        this.s = !0;
        this.k = !1;
        this.I = n(c, a).length();
        this.G = this.b.view.zoom;
      }
    }
  }.bind(this));
  $(a).bind("touchmove", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      this.q(new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new l(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        this.s && (c = this.G * n(c, a).length() / this.I, c = Math.max(Math.min(c, 5), 0.5), a = this.b.view, a.zoom = c, a.d = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    V(this.b);
  }.bind(this));
};
var Y = new S, Z = new z(Y), wa = new U(Z, Y);
new X(wa);
new ua(wa);
new ka(Y, Z);
Z.animate();

