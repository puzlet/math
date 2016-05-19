
/*
Attaches math methods to Number and Array.
 */

(function() {
  var ArrayMath, ComplexMath, MathCoffee, NumericFunctions, ScalarMath, TypeMath,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  MathCoffee = (function() {
    MathCoffee.prototype.predefinedCoffee = "nm = numeric\nsize = nm.size\nmax = nm.max\nabs = nm.abs\npow = nm.pow\nsqrt = nm.sqrt\nexp = nm.exp\nlog = nm.log\nsin = nm.sin\ncos = nm.cos\ntan = nm.tan\nasin = nm.asin\nacos = nm.acos\natan = nm.atan\natan2 = nm.atan2\nceil = nm.ceil\nfloor = nm.floor\nround = nm.round\nrand = nm.rand\ncomplex = nm.complex\nconj = nm.conj\nlinspace = nm.linspace\npi = Math.PI\nj = complex 0, 1";

    MathCoffee.prototype.basicOps = [["add", "add"], ["sub", "subtract"], ["mul", "multiply"], ["div", "divide"]];

    MathCoffee.prototype.modOp = ["mod", "modulo"];

    MathCoffee.prototype.eqOps = [["mod", "modulo"], ["eq", "equals"], ["lt", "lt"], ["gt", "gt"], ["leq", "leq"], ["geq", "geq"]];

    MathCoffee.prototype.assignOps = ["addeq", "subeq", "muleq", "diveq", "modeq"];

    function MathCoffee() {
      this.ops = this.basicOps.concat([this.modOp]).concat(this.eqOps);
      this.predefinedCoffeeLines = this.predefinedCoffee.split("\n");
      this.initializeMath();
    }

    MathCoffee.prototype.addPredefinedCode = function(code) {
      return this.predefinedCoffeeLines = this.predefinedCoffeeLines.concat(code.split("\n"));
    };

    MathCoffee.prototype.initializeMath = function() {
      if (this.mathInitialized != null) {
        return;
      }
      new ScalarMath(this.ops);
      new ArrayMath(this.ops, this.assignOps);
      new ComplexMath(this.basicOps);
      new NumericFunctions;
      return this.mathInitialized = true;
    };

    MathCoffee.prototype.compile = function(code, bare, isMain) {
      var js, vanilla;
      vanilla = this.isVanilla(code);
      if (!vanilla) {
        code = this.preProcess(code, isMain);
      }
      js = $coffee.compile(code);
      if (!vanilla) {
        js = this.postProcess(js);
      }
      return js;
    };

    MathCoffee.prototype.evaluate = function(code, js, isMain) {
      var bare;
      bare = false;
      if (!js) {
        js = this.compile(code, bare, isMain);
      }
      eval(js);
      return js;
    };

    MathCoffee.prototype.isVanilla = function(code) {
      var codeLines, firstLine;
      codeLines = code.split("\n");
      firstLine = codeLines[0];
      return firstLine === "#!vanilla";
    };

    MathCoffee.prototype.preProcess = function(code, isMain) {
      var codeLines, i, isMainStr, k, l, len, lf, preamble;
      lf = "\n";
      isMainStr = isMain ? 'true' : 'false';
      preamble = ["__isMain__ = " + isMainStr + lf].concat(this.predefinedCoffeeLines);
      if (this.preProcessor != null) {
        code = this.preProcessor(code);
      }
      codeLines = code.split(lf);
      for (i = k = 0, len = codeLines.length; k < len; i = ++k) {
        l = codeLines[i];
        if (l === "#!no-math-sugar") {
          codeLines[i] = "_disable_operator_overloading();";
        }
        if (l === "#!math-sugar") {
          codeLines[i] = "_enable_operator_overloading();";
        }
      }
      codeLines = preamble.concat(codeLines);
      return code = codeLines.join(lf);
    };

    MathCoffee.prototype.postProcess = function(js) {
      js = PaperScript.compile(js);
      return js;
    };

    return MathCoffee;

  })();

  TypeMath = (function() {
    function TypeMath(proto) {
      this.proto = proto;
    }

    TypeMath.prototype.setMethod = function(op) {
      return this.proto[op] = function(y) {
        return numeric[op](this, y);
      };
    };

    TypeMath.prototype.setUnaryMethod = function(op) {
      return this.proto[op] = function() {
        return numeric[op](this);
      };
    };

    TypeMath.prototype.overloadOperator = function(a, b) {
      return this.proto["__" + b] = this.proto[a];
    };

    return TypeMath;

  })();

  ScalarMath = (function(superClass) {
    extend(ScalarMath, superClass);

    function ScalarMath(ops) {
      var a, b, k, len, op, ref;
      this.ops = ops;
      ScalarMath.__super__.constructor.call(this, Number.prototype);
      ref = this.ops;
      for (k = 0, len = ref.length; k < len; k++) {
        op = ref[k];
        a = op[0], b = op[1];
        this.setMethod(a);
        this.overloadOperator(a, b);
      }
      this.proto.pow = function(p) {
        return Math.pow(this, p);
      };
    }

    ScalarMath.prototype.setMethod = function(op) {
      return this.proto[op] = function(y) {
        return numeric[op](+this, y);
      };
    };

    return ScalarMath;

  })(TypeMath);

  ArrayMath = (function(superClass) {
    extend(ArrayMath, superClass);

    function ArrayMath(ops, assignOps) {
      var a, b, k, len, len1, o, op, pow, ref, ref1;
      this.ops = ops;
      this.assignOps = assignOps;
      ArrayMath.__super__.constructor.call(this, Array.prototype);
      this.proto.size = function() {
        return [this.length, this[0].length];
      };
      this.proto.max = function() {
        return Math.max.apply(null, this);
      };
      numeric.zeros = function(m, n) {
        return numeric.rep([m, n], 0);
      };
      numeric.ones = function(m, n) {
        return numeric.rep([m, n], 1);
      };
      ref = this.ops;
      for (k = 0, len = ref.length; k < len; k++) {
        op = ref[k];
        a = op[0], b = op[1];
        this.setMethod(a);
        this.overloadOperator(a, b);
      }
      ref1 = this.assignOps;
      for (o = 0, len1 = ref1.length; o < len1; o++) {
        op = ref1[o];
        this.setMethod(op);
      }
      this.setMethod("dot");
      this.setUnaryMethod("neg");
      this.overloadOperator("neg", "negate");
      this.setUnaryMethod("clone");
      this.setUnaryMethod("sum");
      this.proto.transpose = function() {
        return numeric.transpose(this);
      };
      Object.defineProperty(this.proto, 'T', {
        get: function() {
          return this.transpose();
        }
      });
      pow = numeric.pow;
      this.proto.pow = function(p) {
        return pow(this, p);
      };
      numeric.rand = function(sz) {
        if (sz == null) {
          sz = null;
        }
        if (sz) {
          return numeric.random(sz);
        } else {
          return Math.random();
        }
      };
    }

    return ArrayMath;

  })(TypeMath);

  ComplexMath = (function(superClass) {
    extend(ComplexMath, superClass);

    function ComplexMath(ops) {
      var add, complex, div, fix, j, j2, k, len, mul, name, negj, op, ref, ref1, ref2, sub;
      this.ops = ops;
      ComplexMath.__super__.constructor.call(this, numeric.T.prototype);
      numeric.complex = function(x, y) {
        if (y == null) {
          y = 0;
        }
        return new numeric.T(x, y);
      };
      complex = numeric.complex;
      this.proto.size = function() {
        return [this.x.length, this.x[0].length];
      };
      fix = (function(_this) {
        return function(name, op) {
          return _this.proto[name] = function() {
            var z;
            z = op.apply(this, arguments);
            if (z.y == null) {
              z.y = 0;
            }
            return z;
          };
        };
      })(this);
      ref = this.proto, add = ref.add, sub = ref.sub, mul = ref.mul, div = ref.div;
      ref1 = {
        add: add,
        sub: sub,
        mul: mul,
        div: div
      };
      for (name in ref1) {
        op = ref1[name];
        fix(name, op);
      }
      ref2 = this.ops;
      for (k = 0, len = ref2.length; k < len; k++) {
        op = ref2[k];
        this.defineOperators(op[0], op[1]);
      }
      this.proto.__negate = this.proto.neg;
      Object.defineProperty(this.proto, 'T', {
        get: function() {
          return this.transpose();
        }
      });
      Object.defineProperty(this.proto, 'H', {
        get: function() {
          return this.transjugate();
        }
      });
      this.proto.arg = function() {
        var x, y;
        x = this.x;
        y = this.y;
        return numeric.atan2(y, x);
      };
      this.proto.pow = function(p) {
        var a, nm, pa, r;
        nm = numeric;
        r = this.abs().x;
        a = this.arg();
        pa = a.mul(p);
        return complex(nm.cos(pa), nm.sin(pa)).mul(r.pow(p));
      };
      this.proto.sqrt = function() {
        return this.pow(0.5);
      };
      this.proto.exp = function() {
        var e, x, y;
        x = this.x;
        y = this.y;
        e = Math.exp(x);
        return complex(e * Math.cos(y), e * Math.sin(y));
      };
      this.proto.log = function() {
        var a, r;
        r = this.abs().x;
        a = this.arg();
        return complex(numeric.log(r), a);
      };
      j = complex(0, 1);
      j2 = complex(0, 2);
      negj = complex(0, -1);
      this.proto.sin = function() {
        var e1, e2;
        e1 = (this.mul(j)).exp();
        e2 = (this.mul(negj)).exp();
        return (e1.sub(e2)).div(j2);
      };
      this.proto.cos = function() {
        var e1, e2;
        e1 = (this.mul(j)).exp();
        e2 = (this.mul(negj)).exp();
        return (e1.add(e2)).div(2);
      };
    }

    ComplexMath.prototype.defineOperators = function(op, op1) {
      var numericOld;
      numericOld = {};
      this.proto["__" + op1] = this.proto[op];
      numericOld[op] = numeric[op];
      return numeric[op] = function(x, y) {
        if (typeof x === "number" && y instanceof numeric.T) {
          return numeric.complex(x)[op](y);
        } else {
          return numericOld[op](x, y);
        }
      };
    };

    return ComplexMath;

  })(TypeMath);

  NumericFunctions = (function() {
    NumericFunctions.prototype.overrideFcns = ["sqrt", "sin", "cos", "exp", "log"];

    function NumericFunctions() {
      var exp, f, k, len, nabs, natan2, nm, npow, ref;
      ref = this.overrideFcns;
      for (k = 0, len = ref.length; k < len; k++) {
        f = ref[k];
        this.override(f);
      }
      nm = numeric;
      npow = nm.pow;
      nm.pow = function(x, p) {
        if (x.pow != null) {
          return x.pow(p);
        } else {
          return npow(x, p);
        }
      };
      exp = nm.exp;
      nm.exp = function(x) {
        if ((x.exp != null) && x instanceof nm.T) {
          return x.exp(x);
        } else {
          return exp(x);
        }
      };
      nabs = nm.abs;
      nm.abs = function(x) {
        if ((x.abs != null) && x instanceof nm.T) {
          return x.abs().x;
        } else {
          return nabs(x);
        }
      };
      natan2 = nm.atan2;
      nm.atan2 = function(y, x) {
        if (typeof x === "number" && typeof y === "number") {
          return Math.atan2(y, x);
        } else {
          return natan2(y, x);
        }
      };
    }

    NumericFunctions.prototype.override = function(name) {
      var f;
      f = numeric[name];
      return numeric[name] = function(x) {
        if (typeof x === "object" && (x[name] != null)) {
          return x[name]();
        } else {
          return f(x);
        }
      };
    };

    return NumericFunctions;

  })();

  window.$mathCoffee = new MathCoffee;

}).call(this);
