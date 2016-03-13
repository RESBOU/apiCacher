require! {
  lodash: { assign }
  url
  colors
  http
  crypto
  'http-proxy'
  buffer
}


key = (req) ->
  sha = crypto.createHash 'sha256'
  sha.update [ req.method, req.url ].join('/')
  sha.digest 'base64'


class InMemory
  -> @store = {}
  
  set: (req, data, cb) ->
    @store[ key(req) ] = data
    if cb then cb()
    
  get: (req, cb) ->
    cb @store[ key(req) ]

  
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
      #console.log 'RAW Response from the target', JSON.stringify proxyRes.headers, true, 2

      proxyRes.on 'data', -> data.push it

      proxyRes.on 'end', ~> 
        cacheEntry = do
          headers: proxyRes.headers
          status: proxyRes.statusCode
          body: Buffer.concat data

        @store.set req, cacheEntry


    proxy.on 'proxyReq', (proxyReq, req, res, options) ~>
      proxyReq.setHeader 'host', url.parse(@target).hostname

    proxy.on 'error', (e) -> 
      console.log 'error', e

    server.listen port


module.exports = Cacher


if require.main is module then
  cacher = new Cacher port: port = Number(process.argv.pop()), target: target = process.argv.pop() 
  console.log "proxying #{port} → #{target}"

