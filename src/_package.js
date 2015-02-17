// type checking functions
var toString = Object.prototype.toString;

qrvis.isObject = function(obj) {
  return obj === Object(obj);
};

qrvis.isFunction = function(obj) {
  return toString.call(obj) == '[object Function]';
};

qrvis.isString = function(obj) {
  return toString.call(obj) == '[object String]';
};
  
qrvis.isArray = Array.isArray || function(obj) {
  return toString.call(obj) == '[object Array]';
};

qrvis.isNumber = function(obj) {
  return toString.call(obj) == '[object Number]';
};

qrvis.isBoolean = function(obj) {
  return toString.call(obj) == '[object Boolean]';
};

qrvis.isTree = function(obj) {
  return obj && obj.__qrvistree__;
};

qrvis.tree = function(obj, children) {
  var d = [obj];
  d.__qrvistree__ = true;
  d.children = children || "children";
  return d;
};

qrvis.number = function(s) { return +s; };

qrvis.boolean = function(s) { return !!s; };

// utility functions

qrvis.identity = function(x) { return x; };

qrvis.true = function() { return true; };

qrvis.extend = function(obj) {
  for (var x, name, i=1, len=arguments.length; i<len; ++i) {
    x = arguments[i];
    for (name in x) { obj[name] = x[name]; }
  }
  return obj;
};

qrvis.duplicate = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

qrvis.field = function(f) {
  return f.split("\\.")
    .map(function(d) { return d.split("."); })
    .reduce(function(a, b) {
      if (a.length) { a[a.length-1] += "." + b.shift(); }
      a.push.apply(a, b);
      return a;
    }, []);
};

qrvis.accessor = function(f) {
  var s;
  return (qrvis.isFunction(f) || f==null)
    ? f : qrvis.isString(f) && (s=qrvis.field(f)).length > 1
    ? function(x) { return s.reduce(function(x,f) {
          return x[f];
        }, x);
      }
    : function(x) { return x[f]; };
};

qrvis.mutator = function(f) {
  var s;
  return qrvis.isString(f) && (s=qrvis.field(f)).length > 1
    ? function(x, v) {
        for (var i=0; i<s.length-1; ++i) x = x[s[i]];
        x[s[i]] = v;
      }
    : function(x, v) { x[f] = v; };
};

qrvis.comparator = function(sort) {
  var sign = [];
  if (sort === undefined) sort = [];
  sort = qrvis.array(sort).map(function(f) {
    var s = 1;
    if      (f[0] === "-") { s = -1; f = f.slice(1); }
    else if (f[0] === "+") { s = +1; f = f.slice(1); }
    sign.push(s);
    return qrvis.accessor(f);
  });
  return function(a,b) {
    var i, n, f, x, y;
    for (i=0, n=sort.length; i<n; ++i) {
      f = sort[i]; x = f(a); y = f(b);
      if (x < y) return -1 * sign[i];
      if (x > y) return sign[i];
    }
    return 0;
  };
};

qrvis.cmp = function(a, b) { return a<b ? -1 : a>b ? 1 : 0; };

qrvis.numcmp = function(a, b) { return a - b; };

qrvis.array = function(x) {
  return x != null ? (qrvis.isArray(x) ? x : [x]) : [];
};

qrvis.values = function(x) {
  return (qrvis.isObject(x) && !qrvis.isArray(x) && x.values) ? x.values : x;
};

qrvis.str = function(x) {
  return qrvis.isArray(x) ? "[" + x.map(qrvis.str) + "]"
    : qrvis.isObject(x) ? JSON.stringify(x)
    : qrvis.isString(x) ? ("'"+qrvis_escape_str(x)+"'") : x;
};

var escape_str_re = /(^|[^\\])'/g;

function qrvis_escape_str(x) {
  return x.replace(escape_str_re, "$1\\'");
}

qrvis.keys = function(x) {
  var keys = [];
  for (var key in x) keys.push(key);
  return keys;
};

qrvis.unique = function(data, f, results) {
  if (!qrvis.isArray(data) || data.length==0) return [];
  f = f || qrvis.identity;
  results = results || [];
  for (var v, i=0, n=data.length; i<n; ++i) {
    v = f(data[i]);
    if (results.indexOf(v) < 0) results.push(v);
  }
  return results;
};

qrvis.minIndex = function(data, f) {
  if (!qrvis.isArray(data) || data.length==0) return -1;
  f = f || qrvis.identity;
  var idx = 0, min = f(data[0]), v = min;
  for (var i=1, n=data.length; i<n; ++i) {
    v = f(data[i]);
    if (v < min) { min = v; idx = i; }
  }
  return idx;
};

qrvis.maxIndex = function(data, f) {
  if (!qrvis.isArray(data) || data.length==0) return -1;
  f = f || qrvis.identity;
  var idx = 0, max = f(data[0]), v = max;
  for (var i=1, n=data.length; i<n; ++i) {
    v = f(data[i]);
    if (v > max) { max = v; idx = i; }
  }
  return idx;
};

qrvis.truncate = function(s, length, pos, word, ellipsis) {
  var len = s.length;
  if (len <= length) return s;
  ellipsis = ellipsis || "...";
  var l = Math.max(0, length - ellipsis.length);

  switch (pos) {
    case "left":
      return ellipsis + (word ? qrvis_truncateOnWord(s,l,1) : s.slice(len-l));
    case "middle":
    case "center":
      var l1 = Math.ceil(l/2), l2 = Math.floor(l/2);
      return (word ? qrvis_truncateOnWord(s,l1) : s.slice(0,l1)) + ellipsis
        + (word ? qrvis_truncateOnWord(s,l2,1) : s.slice(len-l2));
    default:
      return (word ? qrvis_truncateOnWord(s,l) : s.slice(0,l)) + ellipsis;
  }
}

function qrvis_truncateOnWord(s, len, rev) {
  var cnt = 0, tok = s.split(qrvis_truncate_word_re);
  if (rev) {
    s = (tok = tok.reverse())
      .filter(function(w) { cnt += w.length; return cnt <= len; })
      .reverse();
  } else {
    s = tok.filter(function(w) { cnt += w.length; return cnt <= len; });
  }
  return s.length ? s.join("").trim() : tok[0].slice(0, len);
}

var qrvis_truncate_word_re = /([\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF])/;

// Logging

function qrvis_write(msg) {
  qrvis.config.isNode
    ? process.stderr.write(msg + "\n")
    : console.log(msg);
}

qrvis.log = function(msg) {
  qrvis_write("[Vega Log] " + msg);
};

qrvis.error = function(msg) {
  msg = "[Vega Err] " + msg;
  qrvis_write(msg);
  if (typeof alert !== "undefined") alert(msg);
};