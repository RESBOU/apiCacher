require! {
  woden
}
port = 9000

proxy = new woden()
DS = {}

proxy.store do
    get: ( key, cb ) -> 
        callback void, DS[key]
    set: ( key, value, cb, cachetimeMS ) -> 
        DS[ key ] = value
        callback( )
        
proxy.listen port
console.log "in memory cache listening @ #{ port }"
