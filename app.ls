require! {
  woden
}

woden = new Woden({})

DS = {}
woden.store do
    get: ( key, cb ) -> 
        callback void, DS[key]
    set: ( key, value, cb, cachetimeMS ) -> 
        DS[ key ] = value
        callback( )
        
woden.listen 9000 
