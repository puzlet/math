###
Attaches math methods to Number and Array. 
###


# TODO:
# *** isMain
# tan, asin, acos, atan.
# Make predefinedCoffee a function?  Extract contents?
# Functional form for complex arg.

class MathCoffee
  
  # This code is inserted into CoffeeScript nodes before compiling, unless #!vanilla directive at top of node.
  predefinedCoffee: """
    nm = numeric
    size = nm.size
    max = nm.max
    abs = nm.abs
    pow = nm.pow
    sqrt = nm.sqrt
    exp = nm.exp
    log = nm.log
    sin = nm.sin
    cos = nm.cos
    tan = nm.tan
    asin = nm.asin
    acos = nm.acos
    atan = nm.atan
    atan2 = nm.atan2
    ceil = nm.ceil
    floor = nm.floor
    round = nm.round
    rand = nm.rand
    complex = nm.complex
    conj = nm.conj
    linspace = nm.linspace
    pi = Math.PI
    j = complex 0, 1
  """
  
  # Operator arrays:
  # First column: method name for numericjs
  # Second column: __name for operator overload function.
  
  # Arithmetic operators
  basicOps: [
    ["add", "add"]
    ["sub", "subtract"]
    ["mul", "multiply"]
    ["div", "divide"]
  ]
  
  # Modulus operator
  modOp: ["mod", "modulo"]
  
  # Equality/inequality operators
  eqOps: [
    ["mod", "modulo"]
    ["eq", "equals"]
    ["lt", "lt"]
    ["gt", "gt"]
    ["leq", "leq"]
    ["geq", "geq"]
  ]
  
  # Assignment operators
  assignOps: ["addeq", "subeq", "muleq", "diveq", "modeq"]
  
  constructor: ->
    @ops = @basicOps.concat([@modOp]).concat(@eqOps)  # Scalar and Array ops.
    @predefinedCoffeeLines = @predefinedCoffee.split "\n"
    
    @initializeMath()  # TODO: call initialize math here?
    
    # TODO: check $coffee exists.
    # TODO: pass spec.isMain from client
    
  addPredefinedCode: (code) ->
    @predefinedCoffeeLines = @predefinedCoffeeLines.concat(code.split("\n"))
    
  initializeMath: ->
    return if @mathInitialized?
    # This sets methods for Number and Array prototypes (and others).
    new ScalarMath @ops
    new ArrayMath @ops, @assignOps
    new ComplexMath @basicOps
    new NumericFunctions
    @mathInitialized = true
    
  compile: (code, bare, isMain) ->
    vanilla = @isVanilla(code)
    code = @preProcess(code, isMain) unless vanilla
    js = $coffee.compile code
    js = @postProcess(js) unless vanilla
    js
  
  evaluate: (code, js, isMain) ->
    bare = false
    js = @compile code, bare, isMain unless js
    eval js
    js
  
  isVanilla: (code) ->
    codeLines = code.split "\n"
    firstLine = codeLines[0]
    firstLine is "#!vanilla"
  
  preProcess: (code, isMain) ->
  
    lf = "\n"
  
    isMainStr = if isMain then 'true' else 'false'
    preamble = ["__isMain__ = #{isMainStr}#{lf}"].concat @predefinedCoffeeLines
  
    codeLines = code.split lf
    
    for l, i in codeLines
      codeLines[i] = "_disable_operator_overloading();" if l is "#!no-math-sugar"
      codeLines[i] = "_enable_operator_overloading();" if l is "#!math-sugar"
    
    codeLines = preamble.concat(codeLines)
    code = codeLines.join lf
  
  postProcess: (js) ->
    js = PaperScript.compile js
    js


class TypeMath
  # Superclass
    
  constructor: (@proto) ->
  
  setMethod: (op) ->
    # Method for numericjs function.
    # e.g., Array.prototype.add = (y) -> numeric.add(this, y)
    @proto[op] = (y) -> numeric[op](this, y)
    
  setUnaryMethod: (op) ->
    # Array method for unary numericjs operator or function.
    # e.g., Array.prototype.neg = -> numeric.neg(this)
    @proto[op] = -> numeric[op](this)
  
  overloadOperator: (a, b) ->
    # Overload operator.  Set to operator method.
    # e.g., Array.prototype.__add = Array.prototype.add
    @proto["__"+b] = @proto[a]
  


class ScalarMath extends TypeMath
  
  constructor: (@ops) ->
    
    super Number.prototype
    
    # Regular operations
    for op in @ops
      [a, b] = op
      @setMethod a
      @overloadOperator a, b
      
    # Power
    @proto.pow = (p) -> Math.pow this, p
    
  setMethod: (op) ->
    # Method when first operand is scalar.
    # Need +this to convert to primitive value.
    # e.g., Number.protoype.add = (y) -> numeric.add(+this, y)
    @proto[op] = (y) -> numeric[op](+this, y)


class ArrayMath extends TypeMath
  
  constructor: (@ops, @assignOps) ->
    
    super Array.prototype
    
    # Size of 2D array
    @proto.size = -> [this.length, this[0].length]
    
    # Max value of array
    @proto.max = -> Math.max.apply null, this
    
    # Array builders
    numeric.zeros = (m, n) -> numeric.rep [m, n], 0
    numeric.ones = (m, n) -> numeric.rep [m, n], 1
    
    # Regular operations.
    for op in @ops
      [a, b] = op
      @setMethod a
      @overloadOperator a, b
      
    # Assignment operations.
    # Don't need to overload assignment operators.  Inferred from binary ops.
    @setMethod op for op in @assignOps
    
    # Dot product.  No operator overload for A.dot.
    @setMethod "dot"
    
    # Negation (unary).
    @setUnaryMethod "neg"
    @overloadOperator "neg", "negate"
    
    # Methods for other functions.
    @setUnaryMethod "clone"
    @setUnaryMethod "sum"
    
    # Transposes
    @proto.transpose = ->
      numeric.transpose this
    
    Object.defineProperty @proto, 'T', get: -> this.transpose()
    
    # Power - need this so don't get cyclic call.
    pow = numeric.pow
    @proto.pow = (p) -> pow this, p
    
    # Random numbers
    numeric.rand = (sz=null) ->
      if sz then numeric.random(sz) else Math.random()
      # ZZZ Also flatten?


class ComplexMath extends TypeMath
  
  constructor: (@ops) ->
    
    super numeric.T.prototype
    
    # Scalar to complex.
    numeric.complex = (x, y=0) -> new numeric.T(x, y)
    complex = numeric.complex
    
    # Size of complex array.
    @proto.size = -> [this.x.length, this.x[0].length]
    
    # Operators
    @defineOperators(op[0], op[1]) for op in @ops
  
    # Negation
    @proto.__negate = @proto.neg
    
    # Transposes
    Object.defineProperty @proto, 'T', get: -> this.transpose()
    Object.defineProperty @proto, 'H', get: -> this.transjugate()
    
    # Complex arg (angle)
    @proto.arg = ->
      x = this.x
      y = this.y
      numeric.atan2 y, x
    
    # Power.
    @proto.pow = (p) ->
      nm = numeric
      r = this.abs().x
      a = this.arg()
      pa = a.mul p
      complex(nm.cos(pa), nm.sin(pa)).mul(r.pow p)
    
    # Square root
    @proto.sqrt = -> this.pow 0.5
    
    # Natural logarthim
    @proto.log = ->
      r = this.abs().x
      a = this.arg()
      complex(numeric.log(r), a)
      
    #---Trig functions---
    
    # Constants for trig functions.
    j = complex 0, 1
    j2 = complex 0, 2
    negj = complex 0, -1
    # ZZZ create efficient method to rotate by +/-90 deg (for methods below)
    
    @proto.sin = ->
      e1 = (this.mul(j)).exp()
      e2 = (this.mul(negj)).exp()
      (e1.sub e2).div j2
      
    @proto.cos = ->
      e1 = (this.mul(j)).exp()
      e2 = (this.mul(negj)).exp()
      (e1.add e2).div 2
      
  defineOperators: (op, op1) ->
    # Redefine numeric.add (etc.) to check for scalar * numeric.T first.
    # Chain: 1+y (where y is a T) --> N._add --> N.add --> nm.add (redefined below) --> y.add 1 (T method)
    numericOld = {}  # Store old numeric methods here.
    @proto["__"+op1] = @proto[op]  # Operator overload
    numericOld[op] = numeric[op]  # Current method
    numeric[op] = (x, y) ->  # New method
      if typeof x is "number" and y instanceof numeric.T
        numeric.complex(x)[op] y  # Convert scalar to complex
      else
        numericOld[op] x, y  # Otherwise, just previous method.
  


class NumericFunctions
  
  overrideFcns: ["sqrt", "sin", "cos", "exp", "log"]
  
  constructor: ->
    
    # These numeric.f functions should call correct object methods:
    # pow, abs, sqrt, sin, cos, exp, log, atan2
    
    @override f for f in @overrideFcns
    
    #---Special handling---
    
    nm = numeric
    
    # Power
    npow = nm.pow
    nm.pow = (x, p) -> if x.pow? then x.pow(p) else npow(x, p)
    
    # Absolute value
    nabs = nm.abs
    nm.abs = (x) -> if x.abs? and x instanceof nm.T then x.abs().x else nabs(x)
    
    # atan2
    natan2 = nm.atan2
    nm.atan2 = (y, x) -> 
      if typeof(x) is "number" and typeof(y) is "number" then Math.atan2(y, x) else natan2(y, x)
  
  override: (name) ->
    f = numeric[name]
    numeric[name] = (x) ->
      if typeof(x) is "object" and x[name]?
        x[name]()
      else
        f(x)


# Export
window.$mathCoffee = new MathCoffee
