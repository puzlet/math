class MathPlotting
  
  preDefinedCoffee: """
      print = nm.print
      plot = nm.plot
      plotSeries = nm.plotSeries
      eplot = nm.plot
      figure = nm.figure
      print.clear()
      eplot.clear()
  """
  
  constructor: ->
    
    new BlabPrinter
    new BlabPlotter
    evalBoxPlotter = new EvalBoxPlotter
    
    $mathCoffee.extraLines = (resultArray) -> evalBoxPlotter.extraLines(resultArray)
    
    $mathCoffee.addPredefinedCode @preDefinedCoffee


class BlabPrinter
  
  constructor: ->
    
    nm = numeric
    
    id = "blab_print"
    
    nm.print = (x) ->
      container = $ "##{id}"
      unless container.length
        container = $ "<div>",
          id: id
        htmlOut = $ "#codeout_html"
        htmlOut.append container
      container.append("<pre>"+nm.prettyPrint(x)+"</pre>")
      
    nm.print.clear = ->
      container = $ "##{id}"
      container.empty() if container


class BlabPlotter
  
  constructor: ->
    
    numeric.htmlplot = (x, y, params={}) ->
      
      flot = $ "#flot"
      
      unless flot.length
        flot = $ "<div>",
          id: "flot"
          css: {width: "600px", height: "300px"}
        htmlOut = $ "#codeout_html"
        htmlOut.append flot
        
      params.series ?= {color: "#55f"}
      $.plot $("#flot"), [numeric.transpose([x, y])], params


class EvalBoxPlotter
  
  constructor: ->
    @clear()
    numeric.plot = (x, y, params={}) => @plot(x, y, params)
    numeric.plot.clear = => @clear()
    numeric.figure = (params={}) => @figure params
    numeric.plotSeries = (series, params={}) => @plotSeries(series, params)
    @figures = []
    @plotCount = 0
  
  clear: ->
    resource = $blab.evaluatingResource
    resource?.containers?.getEvalContainer()?.find(".eval_flot").remove()
    
  figure: (params={}) ->
    resource = $blab.evaluatingResource
    return unless resource
    flotId = "eval_plot_#{resource.url}_#{@plotCount}"
    
    @figures[flotId] = new Figure resource, flotId, params
    @plotCount++
    flotId  # ZZZ need to replace this line in coffee eval box
  
  doPlot: (params, plotFcn) ->
    flotId = params.fig ? @figure params
    return null unless flotId
    fig = @figures[flotId]
    return null unless fig
    plotFcn fig
    if params.fig then null else flotId
  
  plot: (x, y, params={}) ->
    @doPlot params, (fig) -> fig.plot(x, y)  # no support yet for params here
    
  plotSeries: (series, params={}) ->
    @doPlot params, (fig) -> fig.plotSeries(series)  # no support yet for params here
    
  extraLines: (resultArray) ->
      return "" unless resultArray
      n = null
      numLines = resultArray.length
      for b, idx in resultArray
          n = idx if (typeof b is "string") and b.indexOf("eval_plot") isnt -1
      d = if n then (n - numLines + 8) else 0
      l = if d and d>0 then d else 0
      return "" unless l>0
      lfs = ""
      lfs += "\n" for i in [1..l]
      lfs


class Figure
  
  constructor: (@resource, @flotId, @params) ->
    
    @container = @resource.containers?.getEvalContainer()
    return unless @container?.length
    
    # Plot container (eval box)
    @w = @container[0].offsetWidth
    
    @flot = $ "<div>",
      id: @flotId
      class: "eval_flot"
      css:
        position: "absolute"
        top: "0px"
        width: (@params.width ? @w-50)+"px"
        height: (@params.height ? 150)+"px"
        margin: "0px"
        marginLeft: "30px"
        marginTop: "20px"
        #background: "white"
        zIndex: 1  # ZZZ needed?
      
    @container.append @flot
    @flot.hide()
    @positioned = false
    setTimeout (=> @setPos()), 10 # ZZZ better way them timeout?  e.g., after blab eval?
    
  setPos: ->
    p = @resource.compiler.findStr @flotId  # ZZZ finds *last* one
    return unless p
    @flot.css top: "#{p*22}px"
    @flot.show()  # Delay showing div until set position
    @axesLabels?.position()
    @positioned = true
    
  plot: (x, y) ->
    
    return unless @flot?
    
    # ZZZ currently all params must be set at figure creation
    # ZZZ later, copy params fields to @params
    #return unless y?.length
    #@params.series ?= {color: "#55f"}
    if y?.length and y[0].length?
      nLines = y.length
      d = []
      for line in y
        v = numeric.transpose([x, line])
        d.push v
    else
      d = [numeric.transpose([x, y])]
    @plotSeries d
    
  plotSeries: (series) ->
    # ZZZ dup code
    return unless @flot?
    @params.series ?= {color: "#55f"}
    @flot.show() unless @positioned
    $.plot @flot, series, @params
    @flot.hide() unless @positioned
    @axesLabels = new AxesLabels @flot, @params
    @axesLabels.position() if @positioned
    


class AxesLabels
  
  constructor: (@container, @params) ->
    @xaxisLabel = @appendLabel @params.xlabel, "xaxisLabel" if @params.xlabel
    @yaxisLabel = @appendLabel @params.ylabel, "yaxisLabel" if @params.ylabel
      
  appendLabel: (txt, className) ->
    label = $ "<div>", text: txt
    label.addClass "axisLabel"
    label.addClass className
    @container.append label
    label
  
  position: ->
    @xaxisLabel?.css
      marginLeft: (-@xaxisLabel.width() / 2 + 10) + "px"  # width of ylabels?
      marginBottom: "-20px"
      
    @yaxisLabel?.css
      marginLeft: "-27px"
      marginTop: (@yaxisLabel.width() / 2 - 10) + "px"


new MathPlotting
