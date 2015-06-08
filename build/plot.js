(function() {
  var AxesLabels, BlabPlotter, BlabPrinter, EvalBoxPlotter, Figure, MathPlotting;

  MathPlotting = (function() {
    MathPlotting.prototype.preDefinedCoffee = "print = nm.print\nplot = nm.plot\nplotSeries = nm.plotSeries\neplot = nm.plot\nfigure = nm.figure\nprint.clear()\neplot.clear()";

    function MathPlotting() {
      var evalBoxPlotter;
      new BlabPrinter;
      new BlabPlotter;
      evalBoxPlotter = new EvalBoxPlotter;
      $mathCoffee.extraLines = function(resultArray) {
        return evalBoxPlotter.extraLines(resultArray);
      };
      $mathCoffee.addPredefinedCode(this.preDefinedCoffee);
    }

    return MathPlotting;

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

    EvalBoxPlotter.prototype.extraLines = function(resultArray) {
      var b, d, i, idx, j, k, l, len, lfs, n, numLines, ref;
      if (!resultArray) {
        return "";
      }
      n = null;
      numLines = resultArray.length;
      for (idx = j = 0, len = resultArray.length; j < len; idx = ++j) {
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
      for (i = k = 1, ref = l; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
        lfs += "\n";
      }
      return lfs;
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
      var d, j, len, line, nLines, v;
      if (this.flot == null) {
        return;
      }
      if ((y != null ? y.length : void 0) && (y[0].length != null)) {
        nLines = y.length;
        d = [];
        for (j = 0, len = y.length; j < len; j++) {
          line = y[j];
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

  new MathPlotting;

}).call(this);
