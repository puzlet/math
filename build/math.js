
/*
Attaches math methods to Number and Array.
 */

(function() {
  var ArrayMath, AxesLabels, BlabPlotter, BlabPrinter, ComplexMath, EvalBoxPlotter, Figure, MathCoffee, NumericFunctions, ScalarMath, TypeMath,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  MathCoffee = (function() {
    MathCoffee.prototype.predefinedCoffee = "nm = numeric\nsize = nm.size\nmax = nm.max\nabs = nm.abs\npow = nm.pow\nsqrt = nm.sqrt\nexp = nm.exp\nlog = nm.log\nsin = nm.sin\ncos = nm.cos\ntan = nm.tan\nasin = nm.asin\nacos = nm.acos\natan = nm.atan\natan2 = nm.atan2\nceil = nm.ceil\nfloor = nm.floor\nround = nm.round\nrand = nm.rand\ncomplex = nm.complex\nconj = nm.conj\nlinspace = nm.linspace\nprint = nm.print\nplot = nm.plot\nplotSeries = nm.plotSeries\neplot = nm.plot\nfigure = nm.figure\npi = Math.PI\nj = complex 0, 1\nprint.clear()\neplot.clear()";

    MathCoffee.prototype.basicOps = [["add", "add"], ["sub", "subtract"], ["mul", "multiply"], ["div", "divide"]];

    MathCoffee.prototype.modOp = ["mod", "modulo"];

    MathCoffee.prototype.eqOps = [["mod", "modulo"], ["eq", "equals"], ["lt", "lt"], ["gt", "gt"], ["leq", "leq"], ["geq", "geq"]];

    MathCoffee.prototype.assignOps = ["addeq", "subeq", "muleq", "diveq", "modeq"];

    function MathCoffee() {
      this.ops = this.basicOps.concat([this.modOp]).concat(this.eqOps);
      this.predefinedCoffeeLines = this.predefinedCoffee.split("\n");
      this.initializeMath();
    }

    MathCoffee.prototype.initializeMath = function() {
      if (this.mathInitialized != null) {
        return;
      }
      new ScalarMath(this.ops);
      new ArrayMath(this.ops, this.assignOps);
      new ComplexMath(this.basicOps);
      new NumericFunctions;
      new BlabPrinter;
      new BlabPlotter;
      new EvalBoxPlotter;
      return this.mathInitialized = true;
    };

    MathCoffee.prototype.compile = function(code, bare) {
      var js, vanilla;
      vanilla = this.isVanilla(code);
      if (!vanilla) {
        code = this.preProcess(code);
      }
      js = $coffee.compile(code);
      if (!vanilla) {
        js = this.postProcess(js);
      }
      return js;
    };

    MathCoffee.prototype.evaluate = function(code, js) {
      if (!js) {
        js = this.compile(code);
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

    MathCoffee.prototype.plotLines = function(resultArray) {
      var b, d, i, idx, k, l, len, lfs, n, numLines, o, ref;
      n = null;
      numLines = resultArray.length;
      for (idx = k = 0, len = resultArray.length; k < len; idx = ++k) {
        b = resultArray[idx];
        if ((typeof b === "string") && b.indexOf("eval_plot") !== -1) {
          n = idx;
        }
      }
      d = n ? n - numLines + 8 : 0;
      l = d && d > 0 ? d : 0;
      if (!(l > 0)) {
        return "";
      }
      lfs = "";
      for (i = o = 1, ref = l; 1 <= ref ? o <= ref : o >= ref; i = 1 <= ref ? ++o : --o) {
        lfs += this.lf;
      }
      return lfs;
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
      var complex, j, j2, k, len, negj, op, ref;
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
      ref = this.ops;
      for (k = 0, len = ref.length; k < len; k++) {
        op = ref[k];
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
      var f, k, len, nabs, natan2, nm, npow, ref;
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

  BlabPrinter = (function() {
    function BlabPrinter() {
      var id, nm;
      nm = numeric;
      id = "blab_print";
      nm.print = function(x) {
        var container, htmlOut;
        container = $("#" + id);
        if (!container.length) {
          container = $("<div>", {
            id: id
          });
          htmlOut = $("#codeout_html");
          htmlOut.append(container);
        }
        return container.append("<pre>" + nm.prettyPrint(x) + "</pre>");
      };
      nm.print.clear = function() {
        var container;
        container = $("#" + id);
        if (container) {
          return container.empty();
        }
      };
    }

    return BlabPrinter;

  })();

  BlabPlotter = (function() {
    function BlabPlotter() {
      numeric.htmlplot = function(x, y, params) {
        var flot, htmlOut;
        if (params == null) {
          params = {};
        }
        flot = $("#flot");
        if (!flot.length) {
          flot = $("<div>", {
            id: "flot",
            css: {
              width: "600px",
              height: "300px"
            }
          });
          htmlOut = $("#codeout_html");
          htmlOut.append(flot);
        }
        if (params.series == null) {
          params.series = {
            color: "#55f"
          };
        }
        return $.plot($("#flot"), [numeric.transpose([x, y])], params);
      };
    }

    return BlabPlotter;

  })();

  EvalBoxPlotter = (function() {
    function EvalBoxPlotter() {
      this.clear();
      numeric.plot = (function(_this) {
        return function(x, y, params) {
          if (params == null) {
            params = {};
          }
          return _this.plot(x, y, params);
        };
      })(this);
      numeric.plot.clear = (function(_this) {
        return function() {
          return _this.clear();
        };
      })(this);
      numeric.figure = (function(_this) {
        return function(params) {
          if (params == null) {
            params = {};
          }
          return _this.figure(params);
        };
      })(this);
      numeric.plotSeries = (function(_this) {
        return function(series, params) {
          if (params == null) {
            params = {};
          }
          return _this.plotSeries(series, params);
        };
      })(this);
      this.figures = [];
      this.plotCount = 0;
    }

    EvalBoxPlotter.prototype.clear = function() {
      var ref, ref1, resource;
      resource = $blab.evaluatingResource;
      return resource != null ? (ref = resource.containers) != null ? (ref1 = ref.getEvalContainer()) != null ? ref1.find(".eval_flot").remove() : void 0 : void 0 : void 0;
    };

    EvalBoxPlotter.prototype.figure = function(params) {
      var flotId, resource;
      if (params == null) {
        params = {};
      }
      resource = $blab.evaluatingResource;
      if (!resource) {
        return;
      }
      flotId = "eval_plot_" + resource.url + "_" + this.plotCount;
      this.figures[flotId] = new Figure(resource, flotId, params);
      this.plotCount++;
      return flotId;
    };

    EvalBoxPlotter.prototype.doPlot = function(params, plotFcn) {
      var fig, flotId, ref;
      flotId = (ref = params.fig) != null ? ref : this.figure(params);
      if (!flotId) {
        return null;
      }
      fig = this.figures[flotId];
      if (!fig) {
        return null;
      }
      plotFcn(fig);
      if (params.fig) {
        return null;
      } else {
        return flotId;
      }
    };

    EvalBoxPlotter.prototype.plot = function(x, y, params) {
      if (params == null) {
        params = {};
      }
      return this.doPlot(params, function(fig) {
        return fig.plot(x, y);
      });
    };

    EvalBoxPlotter.prototype.plotSeries = function(series, params) {
      if (params == null) {
        params = {};
      }
      return this.doPlot(params, function(fig) {
        return fig.plotSeries(series);
      });
    };

    return EvalBoxPlotter;

  })();

  Figure = (function() {
    function Figure(resource1, flotId1, params1) {
      var ref, ref1, ref2, ref3;
      this.resource = resource1;
      this.flotId = flotId1;
      this.params = params1;
      this.container = (ref = this.resource.containers) != null ? ref.getEvalContainer() : void 0;
      if (!((ref1 = this.container) != null ? ref1.length : void 0)) {
        return;
      }
      this.w = this.container[0].offsetWidth;
      this.flot = $("<div>", {
        id: this.flotId,
        "class": "eval_flot",
        css: {
          position: "absolute",
          top: "0px",
          width: ((ref2 = this.params.width) != null ? ref2 : this.w - 50) + "px",
          height: ((ref3 = this.params.height) != null ? ref3 : 150) + "px",
          margin: "0px",
          marginLeft: "30px",
          marginTop: "20px",
          zIndex: 1
        }
      });
      this.container.append(this.flot);
      this.flot.hide();
      this.positioned = false;
      setTimeout(((function(_this) {
        return function() {
          return _this.setPos();
        };
      })(this)), 10);
    }

    Figure.prototype.setPos = function() {
      var p, ref;
      p = this.resource.compiler.findStr(this.flotId);
      if (!p) {
        return;
      }
      this.flot.css({
        top: (p * 22) + "px"
      });
      this.flot.show();
      if ((ref = this.axesLabels) != null) {
        ref.position();
      }
      return this.positioned = true;
    };

    Figure.prototype.plot = function(x, y) {
      var d, k, len, line, nLines, v;
      if (this.flot == null) {
        return;
      }
      if ((y != null ? y.length : void 0) && (y[0].length != null)) {
        nLines = y.length;
        d = [];
        for (k = 0, len = y.length; k < len; k++) {
          line = y[k];
          v = numeric.transpose([x, line]);
          d.push(v);
        }
      } else {
        d = [numeric.transpose([x, y])];
      }
      return this.plotSeries(d);
    };

    Figure.prototype.plotSeries = function(series) {
      var base;
      if (this.flot == null) {
        return;
      }
      if ((base = this.params).series == null) {
        base.series = {
          color: "#55f"
        };
      }
      if (!this.positioned) {
        this.flot.show();
      }
      $.plot(this.flot, series, this.params);
      if (!this.positioned) {
        this.flot.hide();
      }
      this.axesLabels = new AxesLabels(this.flot, this.params);
      if (this.positioned) {
        return this.axesLabels.position();
      }
    };

    return Figure;

  })();

  AxesLabels = (function() {
    function AxesLabels(container1, params1) {
      this.container = container1;
      this.params = params1;
      if (this.params.xlabel) {
        this.xaxisLabel = this.appendLabel(this.params.xlabel, "xaxisLabel");
      }
      if (this.params.ylabel) {
        this.yaxisLabel = this.appendLabel(this.params.ylabel, "yaxisLabel");
      }
    }

    AxesLabels.prototype.appendLabel = function(txt, className) {
      var label;
      label = $("<div>", {
        text: txt
      });
      label.addClass("axisLabel");
      label.addClass(className);
      this.container.append(label);
      return label;
    };

    AxesLabels.prototype.position = function() {
      var ref, ref1;
      if ((ref = this.xaxisLabel) != null) {
        ref.css({
          marginLeft: (-this.xaxisLabel.width() / 2 + 10) + "px",
          marginBottom: "-20px"
        });
      }
      return (ref1 = this.yaxisLabel) != null ? ref1.css({
        marginLeft: "-27px",
        marginTop: (this.yaxisLabel.width() / 2 - 10) + "px"
      }) : void 0;
    };

    return AxesLabels;

  })();

  window.$mathCoffee = new MathCoffee;


  /* Not used - to obsolete
  
  complexMatrices: ->
    
    Array.prototype.complexParts = ->
      A = this
      [m, n] = size A
      vParts = (v) -> [(a.x for a in v), (a.y for a in v)]
      if not n
         * Vector
        [real, imag] = vParts A
      else
         * Matrix
        real = new Array m
        imag = new Array m
        [real[m], imag[m]] = vParts(row) for row, m in A
      [real, imag]
    
     * These could be made more efficient.
    Array.prototype.real = -> this.complexParts()[0]
    Array.prototype.imag = -> this.complexParts()[1]
    
    #Array.prototype.isComplex = ->
     * A = this
     * [m, n] = size A
  
  manualOverloadExamples: ->
     * Not currently used - using numericjs instead.
    
    Number.prototype.__add = (y) ->
       * ZZZ is this inefficient for scaler x+y?
      if typeof y is "number"
        return this + y
      else if y instanceof Array
        return (this + yn for yn in y)
      else
        undefined
  
    Array.prototype.__add = (y) ->
      if typeof y is "number"
        return (x + y for x in this)
      else if y instanceof Array
        return (x + y[n] for x, n in this)
      else
        undefined
   */

}).call(this);
