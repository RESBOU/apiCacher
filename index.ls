# autocompile

require! {
  fs
  leshdash: { wait, assign, keys }
  url
  colors
  http
  crypto
  'http-proxy'
  buffer
}

key = (req) ->
  req.method + " " + req.url

class Store
  get: -> ...
  set: -> ...
    
class InMemory extends Store
  (options) ->
    def = do
      store: {}
      
    assign @, def, options
  
  set: (req, data, cb) ->
    @store[ key(req) ] = data
    if cb then cb!
    
  get: (req, cb) ->
    cb @store[ key(req) ]


class Json extends InMemory
  (options) ->
    super ...
    
    @path = './json/' + @path + ".json"
    console.log "using json store #{@path}"
    @loadJson @path

  saveJson: (path) ->
    fs.writeFileSync path, JSON.stringify @store, null, 2

  loadJson: (path) ->
    try
      fs.statSync path
      @store = require path
      console.log keys @store.store
    catch
      console.warn "#{path} not found, will create new one"

  set: (req, cb) ->
    super ...
    @saveJson @path
            
class Cacher
  (options) ->
    def = do
      key: key
      port: 9000
      store: new InMemory()
    
    assign @, def, options
    
    if not @target then throw new Error "need target"
      
    proxy = @proxy = httpProxy.createProxyServer secure: false, target: @target
    
    server = @server = http.createServer (req, res) ~> 
      @store.get req, (cache) -> 
        if not cache
          console.log "→", colors.red(req.method), req.url
          proxy.web req, res
        else
          console.log "→", colors.green(req.method), req.url
          console.log "←", colors.green cache.status
          res.writeHead cache.status, cache.headers
          res.write cache.body
          res.end()

    proxy.on 'proxyRes',  (proxyRes, req, res) ~> 
      data = []
      console.log "←", colors.red proxyRes.statusCode

      proxyRes.on 'data', -> data.push it

      proxyRes.on 'end', ~> 
        cacheEntry = do
          headers: proxyRes.headers
          status: proxyRes.statusCode
          body: String Buffer.concat data

        @store.set req, cacheEntry

    proxy.on 'proxyReq', (proxyReq, req, res, options) ~>
      proxyReq.setHeader 'host', url.parse(@target).hostname

    proxy.on 'error', (e) -> 
      console.log 'error', e

    server.listen @port


module.exports = Cacher

if require.main is module
  def = do
    port: 9000
    
  argv = assign def, require('minimist') process.argv.slice 2
  
  if argv.persist then store = new Json path: argv.persist
  else store = new InMemory()
    
  cacher = new Cacher port:argv.port, target: argv.target, store: store
  console.log "proxying #{cacher.port} → #{cacher.target}"

