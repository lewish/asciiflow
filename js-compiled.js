try {
  throw 1;
} catch (aa) {
  window.G = window.G || {};
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
function ca(a, b, c, d) {
  this.left = a;
  this.right = b;
  this.m = c;
  this.j = d;
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
  this.F = b;
}
;function z(a) {
  this.state = a;
  this.canvas = document.getElementById("ascii-canvas");
  this.context = this.canvas.getContext("2d");
  this.zoom = 1;
  this.offset = new l(9E3, 5100);
  this.d = !0;
  this.s = !1;
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
  var c = n(B(a, new l(0, 0)), new l(3, 3)), d = B(a, new l(a.canvas.width, a.canvas.height)).add(new l(3, 3));
  c.x = Math.max(0, Math.min(c.x, 2E3));
  d.x = Math.max(0, Math.min(d.x, 2E3));
  c.y = Math.max(0, Math.min(c.y, 600));
  d.y = Math.max(0, Math.min(d.y, 600));
  b.lineWidth = "1";
  b.strokeStyle = "#EEEEEE";
  b.beginPath();
  for (var e = c.x;e < d.x;e++) {
    b.moveTo(9 * e - a.offset.x, 0 - a.offset.y), b.lineTo(9 * e - a.offset.x, 17 * a.state.cells.length - a.offset.y);
  }
  for (e = c.y;e < d.y;e++) {
    b.moveTo(0 - a.offset.x, 17 * e - a.offset.y), b.lineTo(9 * a.state.cells.length - a.offset.x, 17 * e - a.offset.y);
  }
  a.context.stroke();
  e = !a.s;
  b.font = "15px Courier New";
  for (var g = c.x;g < d.x;g++) {
    for (var k = c.y;k < d.y;k++) {
      var h = C(a.state, new l(g, k));
      if (x(h) || null != h.f && " " != w(h)) {
        a.context.fillStyle = null != h.f ? "#DEF" : "#F5F5F5", b.fillRect(9 * g - a.offset.x, 17 * (k - 1) - a.offset.y, 9, 17);
      }
      var t = ga(a.state, new l(g, k));
      null == t || x(h) && !e || (a.context.fillStyle = "#000000", b.fillText(t, 9 * g - a.offset.x, 17 * k - a.offset.y - 3));
    }
  }
  if (a.s) {
    b.lineWidth = "1";
    b.strokeStyle = "#000000";
    b.beginPath();
    for (e = c.x;e < d.x;e++) {
      for (h = !1, g = c.y;g < d.y;g++) {
        k = C(a.state, new l(e, g)), x(k) && g != d.y - 1 || !h || (b.moveTo(9 * e - a.offset.x + 4.5, 17 * h - a.offset.y - 8.5), b.lineTo(9 * e - a.offset.x + 4.5, 17 * (g - 1) - a.offset.y - 8.5), h = !1), x(k) && !h && (h = g);
      }
    }
    for (g = c.y;g < d.y;g++) {
      for (h = !1, e = c.x;e < d.x;e++) {
        k = C(a.state, new l(e, g)), x(k) && e != d.x - 1 || !h || (b.moveTo(9 * h - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), b.lineTo(9 * (e - 1) - a.offset.x + 4.5, 17 * g - a.offset.y - 8.5), h = !1), x(k) && !h && (h = e);
      }
    }
    a.context.stroke();
  }
}
function B(a, b) {
  return new l(Math.min(Math.max(1, Math.round(((new l((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).x - 4.5) / 9)), 1998), Math.min(Math.max(1, Math.round(((new l((b.x - a.canvas.width / 2) / a.zoom + a.offset.x, (b.y - a.canvas.height / 2) / a.zoom + a.offset.y)).y + 8.5) / 17)), 598));
}
;function E(a, b, c, d, e) {
  e = e || "+";
  var g = Math.min(b.x, c.x), k = Math.min(b.y, c.y), h = Math.max(b.x, c.x), t = Math.max(b.y, c.y), u = d ? c.x : b.x;
  for (d = d ? b.y : c.y;g++ < h;) {
    var Q = new l(g, d), D = a.getContext(new l(g, d));
    " " == e && 2 == D.m + D.j || F(a, Q, e);
  }
  for (;k++ < t;) {
    Q = new l(u, k), D = a.getContext(new l(u, k)), " " == e && 2 == D.left + D.right || F(a, Q, e);
  }
  H(a, b, e);
  H(a, c, e);
  F(a, new l(u, d), e);
}
function I(a) {
  this.state = a;
  this.a = null;
}
I.prototype.start = function(a) {
  this.a = a;
};
I.prototype.move = function(a) {
  this.g = a;
  J(this.state);
  E(this.state, this.a, a, !0);
  E(this.state, this.a, a, !1);
};
I.prototype.end = function() {
  K(this.state);
};
I.prototype.l = function() {
  return "crosshair";
};
I.prototype.e = function() {
};
function L(a) {
  this.state = a;
  this.a = null;
}
L.prototype.start = function(a) {
  this.a = a;
};
L.prototype.move = function(a) {
  J(this.state);
  var b = this.state.getContext(this.a), c = this.state.getContext(a);
  E(this.state, this.a, a, b.m && b.j || c.left && c.right);
};
L.prototype.end = function() {
  K(this.state);
};
L.prototype.l = function() {
  return "crosshair";
};
L.prototype.e = function() {
};
function M(a, b) {
  this.state = a;
  this.value = b;
  f && ($("#freeform-tool-input").val(""), $("#freeform-tool-input").hide(0, function() {
    $("#freeform-tool-input").show(0, function() {
      $("#freeform-tool-input").focus();
    });
  }));
}
M.prototype.start = function(a) {
  H(this.state, a, this.value);
};
M.prototype.move = function(a) {
  H(this.state, a, this.value);
};
M.prototype.end = function() {
  K(this.state);
};
M.prototype.l = function() {
  return "crosshair";
};
M.prototype.e = function(a) {
  f && (this.value = $("#freeform-tool-input").val().substr(0, 1), $("#freeform-tool-input").blur(), $("#freeform-tool-input").hide(0));
  1 == a.length && (this.value = a);
};
function N(a) {
  this.state = a;
  this.a = null;
}
N.prototype.start = function(a) {
  K(this.state);
  $("#text-tool-input").val("");
  this.a = a;
  a = w(C(this.state, this.a));
  H(this.state, this.a, null == a ? "\u2009" : a);
};
N.prototype.move = function() {
};
N.prototype.end = function() {
  null != this.a && (this.g = this.a, this.a = null, $("#text-tool-widget").hide(0, function() {
    $("#text-tool-widget").show(0, function() {
      $("#text-tool-input").focus();
    });
  }));
};
N.prototype.l = function() {
  return "pointer";
};
N.prototype.e = function() {
  var a = $("#text-tool-input").val();
  J(this.state);
  for (var b = 0, c = 0, d = 0;d < a.length;d++) {
    "\n" == a[d] ? (c++, b = 0) : (H(this.state, this.g.add(new l(b, c)), a[d]), b++);
  }
};
function O(a) {
  this.state = a;
  this.g = this.a = null;
}
O.prototype.start = function(a) {
  this.a = a;
  this.move(a);
};
O.prototype.move = function(a) {
  J(this.state);
  this.g = a;
  var b = Math.min(this.a.x, this.g.x);
  a = Math.min(this.a.y, this.g.y);
  for (var c = Math.max(this.a.x, this.g.x), d = Math.max(this.a.y, this.g.y);b <= c;b++) {
    for (var e = a;e <= d;e++) {
      H(this.state, new l(b, e), "\u2009");
    }
  }
};
O.prototype.end = function() {
  K(this.state);
};
O.prototype.l = function() {
  return "crosshair";
};
O.prototype.e = function() {
};
function P(a) {
  this.state = a;
  this.h = this.a = null;
}
P.prototype.start = function(a) {
  if (f && !x(C(this.state, a))) {
    var b = v.concat([p.add(r), p.add(s), q.add(r), q.add(s)]), c = null, d = 0, e;
    for (e in b) {
      var g = a.add(b[e]), k = y(this.state.getContext(g));
      x(C(this.state, g)) && k > d && (c = b[e], d = k);
    }
    a = null == c ? a : a.add(c);
  }
  this.a = a;
  this.h = null;
  if (x(C(this.state, this.a))) {
    this.state.getContext(this.a);
    a = [];
    for (var h in v) {
      var b = ha(this, this.a, v[h]), t;
      for (t in b) {
        if (c = b[t], d = 0 != v[h].x, 1 == y(this.state.getContext(c))) {
          a.push({position:c, v:d});
        } else {
          for (var u in v) {
            0 != v[h].add(v[u]).length() && 2 != v[h].add(v[u]).length() && (e = ha(this, c, v[u]), 0 != e.length && a.push({position:e[e.length - 1], v:d}));
          }
        }
      }
    }
    this.h = a;
    this.move(this.a);
  }
};
P.prototype.move = function(a) {
  J(this.state);
  for (var b in this.h) {
    E(this.state, this.a, this.h[b].position, this.h[b].v, " ");
  }
  for (b in this.h) {
    E(this.state, a, this.h[b].position, this.h[b].v);
  }
};
P.prototype.end = function() {
  K(this.state);
};
function ha(a, b, c) {
  for (var d = b.clone(), e = [];;) {
    var g = d.add(c);
    if (!x(C(a.state, g))) {
      return m(b, d) || e.push(d), e;
    }
    d = g;
    3 == y(a.state.getContext(d)) && e.push(d);
  }
}
P.prototype.l = function(a) {
  return x(C(this.state, a)) ? "pointer" : "default";
};
P.prototype.e = function() {
};
function R() {
  this.cells = Array(2E3);
  this.i = [];
  this.d = !0;
  this.D = [];
  this.C = [];
  for (var a = 0;a < this.cells.length;a++) {
    this.cells[a] = Array(600);
    for (var b = 0;b < this.cells[a].length;b++) {
      this.cells[a][b] = new ba;
    }
  }
}
R.prototype.clear = function() {
  for (var a = 0;a < this.cells.length;a++) {
    for (var b = 0;b < this.cells[a].length;b++) {
      null != w(this.cells[a][b]) && H(this, new l(a, b), "\u2009");
    }
  }
  K(this);
};
function C(a, b) {
  return a.cells[b.x][b.y];
}
function H(a, b, c) {
  var d = C(a, b);
  a.i.push(new ea(b, d));
  d.f = c;
  a.d = !0;
}
function F(a, b, c) {
  w(C(a, b)) != c && H(a, b, c);
}
function J(a) {
  for (var b in a.i) {
    a.i[b].F.f = null;
  }
  a.i.length = 0;
}
function ga(a, b) {
  var c = C(a, b), c = null != c.f ? c.f : c.value;
  if ("+" != c) {
    return c;
  }
  c = a.getContext(b);
  return c.left && c.right && !c.m && !c.j ? "\u2013" : !c.left && !c.right && c.m && c.j ? "|" : c.left && c.right && c.m && c.j ? "\u2013" : "+";
}
R.prototype.getContext = function(a) {
  var b = x(C(this, a.add(p))), c = x(C(this, a.add(q))), d = x(C(this, a.add(r)));
  a = x(C(this, a.add(s)));
  return new ca(b, c, d, a);
};
function K(a, b) {
  var c = [], d = a.i.map(function(a) {
    return a.position.x.toString() + a.position.y.toString();
  }), e = a.i.filter(function(a, b) {
    return d.indexOf(d[b]) == b;
  });
  a.i.length = 0;
  for (var g in e) {
    var k = e[g].F;
    c.push(new da(e[g].position, null != k.value ? k.value : " "));
    var h = w(k);
    if ("\u2009" == h || " " == h) {
      h = null;
    }
    k.f = null;
    k.value = h;
  }
  e = b ? a.C : a.D;
  0 < c.length && (50 < e.length && e.shift(), e.push(c));
  a.d = !0;
}
function ia(a) {
  if (0 != a.D.length) {
    var b = a.D.pop(), c;
    for (c in b) {
      var d = b[c];
      H(a, d.position, d.value);
    }
    K(a, !0);
  }
}
function ja(a) {
  if (0 != a.C.length) {
    var b = a.C.pop(), c;
    for (c in b) {
      var d = b[c];
      H(a, d.position, d.value);
    }
    K(a);
  }
}
function S(a) {
  for (var b = new l(Number.MAX_VALUE, Number.MAX_VALUE), c = new l(-1, -1), d = 0;d < a.cells.length;d++) {
    for (var e = 0;e < a.cells[d].length;e++) {
      null != w(a.cells[d][e]) && (d < b.x && (b.x = d), e < b.y && (b.y = e), d > c.x && (c.x = d), e > c.y && (c.y = e));
    }
  }
  if (0 > c.x) {
    return "";
  }
  for (var g = "", e = b.y;e <= c.y;e++) {
    for (var k = "", d = b.x;d <= c.x;d++) {
      var h = ga(a, new l(d, e)), k = k + (null == h ? " " : h)
    }
    g += k.replace("\\s+$/g", "") + "\n";
  }
  return g;
}
function ka(a, b, c) {
  b = b.split("\n");
  for (var d = new l(0, Math.round(b.length / 2)), e = 0;e < b.length;e++) {
    d.x = Math.max(d.x, Math.round(b[e].length / 2));
  }
  for (e = 0;e < b.length;e++) {
    for (var g = b[e], k = 0;k < g.length;k++) {
      var h = g.charAt(k);
      if ("\u2013" == h || "|" == h) {
        h = "+";
      }
      H(a, n((new l(k, e)).add(c), d), h);
    }
  }
  K(a);
}
;function T(a, b) {
  this.view = a;
  this.state = b;
  this.c = new I(b);
  this.mode = 0;
  this.n();
}
T.prototype.r = function(a) {
  var b = B(this.view, a);
  null == this.o && (this.o = b);
  m(b, this.o) || (this.view.canvas.style.cursor = this.c.l(b));
  2 != this.mode || m(b, this.o) || this.c.move(b);
  if (1 == this.mode) {
    var c = this.view;
    a = this.A.add(n(this.w, a).scale(1 / this.view.zoom));
    c.offset = a;
    c.d = !0;
  }
  this.o = b;
};
function U(a) {
  2 == a.mode && a.c.end();
  a.mode = 0;
  a.w = null;
  a.A = null;
  a.o = null;
}
T.prototype.n = function() {
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
    "box-button" == a && (this.c = new I(this.state));
    "line-button" == a && (this.c = new L(this.state));
    "freeform-button" == a && (this.c = new M(this.state, "X"));
    "erase-button" == a && (this.c = new O(this.state));
    "move-button" == a && (this.c = new P(this.state));
    "text-button" == a && (this.c = new N(this.state));
    K(this.state);
    this.view.canvas.focus();
  }.bind(this));
  $("#file-tools > button.tool").click(function(a) {
    a = a.target.id;
    $(".dialog").removeClass("visible");
    $("#" + a + "-dialog").toggleClass("visible");
    "import-button" == a && ($("#import-area").val(""), $("#import-area").focus());
    "export-button" == a && ($("#export-area").val(S(this.state)), $("#export-area").select());
    "clear-button" == a && this.state.clear();
    "undo-button" == a && ia(this.state);
    "redo-button" == a && ja(this.state);
  }.bind(this));
  $("button.close-dialog-button").click(function() {
    $(".dialog").removeClass("visible");
  }.bind(this));
  $("#import-submit-button").click(function() {
    this.state.clear();
    ka(this.state, $("#import-area").val(), B(this.view, new l(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    $("#import-area").val("");
  }.bind(this));
  $("#use-lines-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.s = !0;
    a.d = !0;
  }.bind(this));
  $("#use-ascii-button").click(function() {
    $(".dialog").removeClass("visible");
    var a = this.view;
    a.s = !1;
    a.d = !0;
  }.bind(this));
  $(window).keypress(function(a) {
    a.ctrlKey || a.metaKey || 13 == a.keyCode || this.c.e(String.fromCharCode(a.keyCode));
  }.bind(this));
  $(window).keydown(function(a) {
    var c = null;
    if (a.ctrlKey || a.metaKey) {
      67 == a.keyCode && (c = "<copy>"), 86 == a.keyCode && (c = "<paste>"), 90 == a.keyCode && ia(this.state), 89 == a.keyCode && ja(this.state), 88 == a.keyCode && (c = "<cut>");
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
    K(this.state);
  }.bind(this));
};
function la(a, b) {
  this.p = !1;
  this.state = a;
  this.view = b;
  this.file = null;
  ma(this);
  $("#drive-button").click(function() {
    this.p ? na(this) : (V(this, !1), oa(this));
  }.bind(this));
  $("#drive-filename").click(function() {
    var a = "" + $("#drive-filename").text(), a = prompt("Enter new filename:", a);
    this.file.title = a;
    this.save();
    pa(this);
  }.bind(this));
  qa(this);
  $(window).bind("hashchange", function() {
    ra(this);
  }.bind(this));
  $("#drive-new-file-button").click(function() {
    this.file = null;
    this.state.clear();
    window.location.hash = "";
    this.save();
    $("#drive-dialog").removeClass("visible");
  }.bind(this));
}
function V(a, b) {
  window.gapi.auth.authorize({client_id:"125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com", scope:"https://www.googleapis.com/auth/drive", immediate:b}, function(a) {
    !a || a.error || this.p || (this.p = !0, $("#drive-button").addClass("active"), window.setTimeout(function() {
      ra(this);
    }.bind(this), 500));
  }.bind(a));
}
function ma(a) {
  window.gapi && window.gapi.auth && window.gapi.auth.authorize ? V(a, !0) : window.setTimeout(function() {
    ma(this);
  }.bind(a), 500);
}
function oa(a) {
  window.setTimeout(function() {
    this.p ? na(this) : (V(this, !0), oa(this));
  }.bind(a), 1E3);
}
function sa(a, b) {
  a.file = b;
  $("#drive-filename").text(b.title);
  window.location.hash = b.id;
}
function na(a) {
  $("#drive-dialog").addClass("visible");
  var b = S(a.state);
  5 < b.length && b != a.u && a.save();
  pa(a);
}
function pa(a) {
  W(window.gapi.client.request({path:"/drive/v2/files", params:{q:"mimeType = 'text/plain' and trashed = false"}, method:"GET"}), function(a) {
    $("#drive-file-list").children().remove();
    a = a.items;
    for (var c in a) {
      var d = document.createElement("li");
      d.id = "drive-file-list-item";
      var e = document.createElement("a");
      d.appendChild(e);
      e.href = "#" + a[c].id;
      $(e).click(function() {
        $("#drive-dialog").removeClass("visible");
      });
      e.innerHTML = a[c].title;
      $("#drive-file-list").append(d);
    }
  }.bind(a));
}
function W(a, b) {
  try {
    a.execute(function(a) {
      a.error || b(a);
    });
  } catch (c) {
  }
}
function qa(a) {
  S(a.state) != a.u && a.file && a.file.editable && a.save();
  window.setTimeout(function() {
    qa(this);
  }.bind(a), 5E3);
}
la.prototype.save = function() {
  var a = S(this.state);
  $("#drive-save-state").text("Saving...");
  W(ta(this, a), function(b) {
    sa(this, b);
    $("#drive-save-state").text("Saved");
    this.u = a;
  }.bind(this));
};
function ra(a) {
  1 < window.location.hash.length && ($("#drive-save-state").text("Loading..."), W(window.gapi.client.request({path:"/drive/v2/files/" + window.location.hash.substr(1, window.location.hash.length - 1), method:"GET"}), function(a) {
    sa(this, a);
    ua(this);
  }.bind(a)));
}
function ua(a) {
  va(a.file.downloadUrl, function(a) {
    $("#drive-save-state").text("Loaded");
    this.state.clear();
    ka(this.state, a, B(this.view, new l(this.view.canvas.width / 2, this.view.canvas.height / 2)));
    this.u = S(this.state);
  }.bind(a));
}
function ta(a, b) {
  var c = "\r\n---------314159265358979323846\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify({title:null == a.file ? "Untitled ASCII Diagram" : a.file.title, mimeType:"text/plain"}) + "\r\n---------314159265358979323846\r\nContent-Type: text/plain\r\n\r\n" + b + "\r\n---------314159265358979323846--";
  return window.gapi.client.request({path:"/upload/drive/v2/files" + (null == a.file ? "" : "/" + a.file.id), method:null == a.file ? "POST" : "PUT", params:{uploadType:"multipart"}, headers:{"Content-Type":'multipart/mixed; boundary="-------314159265358979323846"'}, body:c});
}
function va(a, b) {
  var c = window.gapi.auth.getToken().access_token, d = new XMLHttpRequest;
  d.open("GET", a);
  d.setRequestHeader("Authorization", "Bearer " + c);
  d.onload = function() {
    b(d.responseText);
  };
  d.onerror = function() {
    b(null);
  };
  d.send();
}
;function wa(a) {
  this.b = a;
  this.n();
}
wa.prototype.n = function() {
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
      c.w = a;
      c.A = c.view.offset;
    } else {
      c = this.b, a = new l(a.clientX, a.clientY), c.mode = 2, c.c.start(B(c.view, a));
    }
  }.bind(this));
  $(a).mouseup(function() {
    U(this.b);
  }.bind(this));
  $(a).mouseleave(function() {
    U(this.b);
  }.bind(this));
  $(a).mousemove(function(a) {
    this.b.r(new l(a.clientX, a.clientY));
  }.bind(this));
};
function X(a) {
  this.b = a;
  this.t = this.k = !1;
  this.n();
}
function xa(a, b) {
  a.B = b;
  a.I = $.now();
  a.k = !1;
  window.setTimeout(function() {
    if (!this.k && !this.t && null != this.B) {
      var a = this.b;
      a.mode = 2;
      a.c.start(B(a.view, b));
    }
  }.bind(a), 130);
}
X.prototype.r = function(a) {
  if (!this.k && 130 > $.now() - this.I && 3 < n(a, this.B).length()) {
    this.k = !0;
    var b = this.b;
    b.mode = 1;
    b.w = a;
    b.A = b.view.offset;
  }
  this.b.r(a);
};
X.prototype.reset = function() {
  this.t = this.k = !1;
  this.B = null;
};
X.prototype.n = function() {
  var a = this.b.view.canvas;
  $(a).bind("touchstart", function(a) {
    a.preventDefault();
    if (1 == a.originalEvent.touches.length) {
      xa(this, new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY));
    } else {
      if (1 < a.originalEvent.touches.length) {
        var c = new l(a.originalEvent.touches[0].pageX, a.originalEvent.touches[0].pageY);
        a = new l(a.originalEvent.touches[1].pageX, a.originalEvent.touches[1].pageY);
        U(this.b);
        this.t = !0;
        this.k = !1;
        this.J = n(c, a).length();
        this.H = this.b.view.zoom;
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
        this.t && (c = this.H * n(c, a).length() / this.J, c = Math.max(Math.min(c, 5), 0.5), a = this.b.view, a.zoom = c, a.d = !0);
      }
    }
  }.bind(this));
  $(a).bind("touchend", function(a) {
    a.preventDefault();
    this.reset();
    U(this.b);
  }.bind(this));
};
var Y = new R, Z = new z(Y), ya = new T(Z, Y);
new X(ya);
new wa(ya);
new la(Y, Z);
Z.animate();

