(function(){
  var fs, ref$, wait, assign, keys, url, colors, http, crypto, httpProxy, buffer, key, Store, InMemory, Json, Cacher, def, argv, store, cacher;
  fs = require('fs');
  ref$ = require('leshdash'), wait = ref$.wait, assign = ref$.assign, keys = ref$.keys;
  url = require('url');
  colors = require('colors');
  http = require('http');
  crypto = require('crypto');
  httpProxy = require('http-proxy');
  buffer = require('buffer');
  key = function(req){
    return req.method + " " + req.url;
  };
  Store = (function(){
    Store.displayName = 'Store';
    var prototype = Store.prototype, constructor = Store;
    prototype.get = function(){
      throw Error('unimplemented');
    };
    prototype.set = function(){
      throw Error('unimplemented');
    };
    function Store(){}
    return Store;
  }());
  InMemory = (function(superclass){
    var prototype = extend$((import$(InMemory, superclass).displayName = 'InMemory', InMemory), superclass).prototype, constructor = InMemory;
    function InMemory(options){
      var def;
      def = {
        store: {}
      };
      assign(this, def, options);
    }
    prototype.set = function(req, data, cb){
      this.store[key(req)] = data;
      if (cb) {
        return cb();
      }
    };
    prototype.get = function(req, cb){
      return cb(this.store[key(req)]);
    };
    return InMemory;
  }(Store));
  Json = (function(superclass){
    var prototype = extend$((import$(Json, superclass).displayName = 'Json', Json), superclass).prototype, constructor = Json;
    function Json(options){
      Json.superclass.apply(this, arguments);
      this.path = './json/' + this.path + ".json";
      console.log("using json store " + this.path);
      this.loadJson(this.path);
    }
    prototype.saveJson = function(path){
      return fs.writeFileSync(path, JSON.stringify(this.store, null, 2));
    };
    prototype.loadJson = function(path){
      var e;
      try {
        fs.statSync(path);
        this.store = require(path);
        return console.log(keys(this.store.store));
      } catch (e$) {
        e = e$;
        return console.warn(path + " not found, will create new one");
      }
    };
    prototype.set = function(req, cb){
      superclass.prototype.set.apply(this, arguments);
      return this.saveJson(this.path);
    };
    return Json;
  }(InMemory));
  Cacher = (function(){
    Cacher.displayName = 'Cacher';
    var prototype = Cacher.prototype, constructor = Cacher;
    function Cacher(options){
      var def, proxy, server, this$ = this;
      def = {
        key: key,
        port: 9000,
        store: new InMemory()
      };
      assign(this, def, options);
      if (!this.target) {
        throw new Error("need target");
      }
      proxy = this.proxy = httpProxy.createProxyServer({
        secure: false,
        target: this.target
      });
      server = this.server = http.createServer(function(req, res){
        return this$.store.get(req, function(cache){
          if (!cache) {
            console.log("→", colors.red(req.method), req.url);
            return proxy.web(req, res);
          } else {
            console.log("→", colors.green(req.method), req.url);
            console.log("←", colors.green(cache.status));
            res.writeHead(cache.status, cache.headers);
            res.write(cache.body);
            return res.end();
          }
        });
      });
      proxy.on('proxyRes', function(proxyRes, req, res){
        var data;
        data = [];
        console.log("←", colors.red(proxyRes.statusCode));
        proxyRes.on('data', function(it){
          return data.push(it);
        });
        return proxyRes.on('end', function(){
          var cacheEntry;
          cacheEntry = {
            headers: proxyRes.headers,
            status: proxyRes.statusCode,
            body: String(Buffer.concat(data))
          };
          return this$.store.set(req, cacheEntry);
        });
      });
      proxy.on('proxyReq', function(proxyReq, req, res, options){
        return proxyReq.setHeader('host', url.parse(this$.target).hostname);
      });
      proxy.on('error', function(e){
        return console.log('error', e);
      });
      server.listen(this.port);
    }
    return Cacher;
  }());
  module.exports = Cacher;
  if (require.main === module) {
    def = {
      port: 9000
    };
    argv = assign(def, require('minimist')(process.argv.slice(2)));
    if (argv.persist) {
      store = new Json({
        path: argv.persist
      });
    } else {
      store = new InMemory();
    }
    cacher = new Cacher({
      port: argv.port,
      target: argv.target,
      store: store
    });
    console.log("proxying " + cacher.port + " → " + cacher.target);
  }
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9hcGlDYWNoZXIvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFHRSxFQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBO0VBQ0EsSUFBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBWSxJQUFaLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWSxJQUFaLEVBQWtCLE1BQWxCLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBa0IsTUFBbEIsRUFBMEIsSUFBMUIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwQjtFQUMxQixHQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBO0VBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQTtFQUNBLElBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLE1BQUE7RUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBO0VBQ0EsU0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQTtFQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFFBQUE7RUFHRixHQUFJLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxHQUFBO1dBQ0osR0FBRyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUssR0FBQyxDQUFBLENBQUEsQ0FBRSxHQUFHLENBQUM7O0VBRW5CLFNBQU4sUUFBQSxDQUFBOzs7Y0FDRSxNQUFLLFFBQUEsQ0FBQTtNQUFHLE1BQUEsc0JBQUE7O2NBQ1IsTUFBSyxRQUFBLENBQUE7TUFBRyxNQUFBLHNCQUFBOzs7OztFQUVKLFlBQU4sUUFBQSxDQUFBLFVBQUE7O0lBQ0UsUUFBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBOztNQUNFLEdBQUksQ0FBQSxDQUFBLENBQ0Y7UUFBQSxPQUFPO01BQVA7TUFFRixPQUFPLE1BQUcsS0FBSyxPQUFSOztjQUVULE1BQUssUUFBQSxDQUFBLEdBQUEsRUFBQSxJQUFBLEVB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QUE7S0FDdEM7TUFBSyxLQUFNLENBQUEsQ0FBQSxLQUFNLFNBQVE7O0lBRXpCLE1BQU8sQ0FBQSxDQUFBLEtBQU0sT0FBTztNQUFBLE1BQUssSUFBSSxDQUFDO01BQU0sUUFBUSxJQUFJLENBQUM7TUFBUSxPQUFPO0lBQTVDLENBQUE7SUFDcEIsT0FBTyxDQUFDLElBQUksV0FBQSxDQUFBLENBQUEsQ0FBWSxNQUFNLENBQUMsSUFBSSxDQUFBLENBQUEsQ0FBQyxLQUFBLENBQUEsQ0FBQSxDQUFLLE1BQU0sQ0FBQyxNQUF4QyIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcblxucmVxdWlyZSEge1xuICBmc1xuICBsZXNoZGFzaDogeyB3YWl0LCBhc3NpZ24sIGtleXMgfVxuICB1cmxcbiAgY29sb3JzXG4gIGh0dHBcbiAgY3J5cHRvXG4gICdodHRwLXByb3h5J1xuICBidWZmZXJcbn1cblxua2V5ID0gKHJlcSkgLT5cbiAgcmVxLm1ldGhvZCArIFwiIFwiICsgcmVxLnVybFxuXG5jbGFzcyBTdG9yZVxuICBnZXQ6IC0+IC4uLlxuICBzZXQ6IC0+IC4uLlxuICAgIFxuY2xhc3MgSW5NZW1vcnkgZXh0ZW5kcyBTdG9yZVxuICAob3B0aW9ucykgLT5cbiAgICBkZWYgPSBkb1xuICAgICAgc3RvcmU6IHt9XG4gICAgICBcbiAgICBhc3NpZ24gQCwgZGVmLCBvcHRpb25zXG4gIFxuICBzZXQ6IChyZXEsIGRhdGEsIGNiKSAtPlxuICAgIEBzdG9yZVsga2V5KHJlcSkgXSA9IGRhdGFcbiAgICBpZiBjYiB0aGVuIGNiIVxuICAgIFxuICBnZXQ6IChyZXEsIGNiKSAtPlxuICAgIGNiIEBzdG9yZVsga2V5KHJlcSkgXVxuXG5cbmNsYXNzIEpzb24gZXh0ZW5kcyBJbk1lbW9yeVxuICAob3B0aW9ucykgLT5cbiAgICBzdXBlciAuLi5cbiAgICBcbiAgICBAcGF0aCA9ICcuL2pzb24vJyArIEBwYXRoICsgXCIuanNvblwiXG4gICAgY29uc29sZS5sb2cgXCJ1c2luZyBqc29uIHN0b3JlICN7QHBhdGh9XCJcbiAgICBAbG9hZEpzb24gQHBhdGhcblxuICBzYXZlSnNvbjogKHBhdGgpIC0+XG4gICAgZnMud3JpdGVGaWxlU3luYyBwYXRoLCBKU09OLnN0cmluZ2lmeSBAc3RvcmUsIG51bGwsIDJcblxuICBsb2FkSnNvbjogKHBhdGgpIC0+XG4gICAgdHJ5XG4gICAgICBmcy5zdGF0U3luYyBwYXRoXG4gICAgICBAc3RvcmUgPSByZXF1aXJlIHBhdGhcbiAgICAgIGNvbnNvbGUubG9nIGtleXMgQHN0b3JlLnN0b3JlXG4gICAgY2F0Y2hcbiAgICAgIGNvbnNvbGUud2FybiBcIiN7cGF0aH0gbm90IGZvdW5kLCB3aWxsIGNyZWF0ZSBuZXcgb25lXCJcblxuICBzZXQ6IChyZXEsIGNiKSAtPlxuICAgIHN1cGVyIC4uLlxuICAgIEBzYXZlSnNvbiBAcGF0aFxuICAgICAgICAgICAgXG5jbGFzcyBDYWNoZXJcbiAgKG9wdGlvbnMpIC0+XG4gICAgZGVmID0gZG9cbiAgICAgIGtleToga2V5XG4gICAgICBwb3J0OiA5MDAwXG4gICAgICBzdG9yZTogbmV3IEluTWVtb3J5KClcbiAgICBcbiAgICBhc3NpZ24gQCwgZGVmLCBvcHRpb25zXG4gICAgXG4gICAgaWYgbm90IEB0YXJnZXQgdGhlbiB0aHJvdyBuZXcgRXJyb3IgXCJuZWVkIHRhcmdldFwiXG4gICAgICBcbiAgICBwcm94eSA9IEBwcm94eSA9IGh0dHBQcm94eS5jcmVhdGVQcm94eVNlcnZlciBzZWN1cmU6IGZhbHNlLCB0YXJnZXQ6IEB0YXJnZXRcbiAgICBcbiAgICBzZXJ2ZXIgPSBAc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIgKHJlcSwgcmVzKSB+PiBcbiAgICAgIEBzdG9yZS5nZXQgcmVxLCAoY2FjaGUpIC0+IFxuICAgICAgICBpZiBub3QgY2FjaGVcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIuKGklwiLCBjb2xvcnMucmVkKHJlcS5tZXRob2QpLCByZXEudXJsXG4gICAgICAgICAgcHJveHkud2ViIHJlcSwgcmVzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIuKGklwiLCBjb2xvcnMuZ3JlZW4ocmVxLm1ldGhvZCksIHJlcS51cmxcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIuKGkFwiLCBjb2xvcnMuZ3JlZW4gY2FjaGUuc3RhdHVzXG4gICAgICAgICAgcmVzLndyaXRlSGVhZCBjYWNoZS5zdGF0dXMsIGNhY2hlLmhlYWRlcnNcbiAgICAgICAgICByZXMud3JpdGUgY2FjaGUuYm9keVxuICAgICAgICAgIHJlcy5lbmQoKVxuXG4gICAgcHJveHkub24gJ3Byb3h5UmVzJywgIChwcm94eVJlcywgcmVxLCByZXMpIH4+IFxuICAgICAgZGF0YSA9IFtdXG4gICAgICBjb25zb2xlLmxvZyBcIuKGkFwiLCBjb2xvcnMucmVkIHByb3h5UmVzLnN0YXR1c0NvZGVcblxuICAgICAgcHJveHlSZXMub24gJ2RhdGEnLCAtPiBkYXRhLnB1c2ggaXRcblxuICAgICAgcHJveHlSZXMub24gJ2VuZCcsIH4+IFxuICAgICAgICBjYWNoZUVudHJ5ID0gZG9cbiAgICAgICAgICBoZWFkZXJzOiBwcm94eVJlcy5oZWFkZXJzXG4gICAgICAgICAgc3RhdHVzOiBwcm94eVJlcy5zdGF0dXNDb2RlXG4gICAgICAgICAgYm9keTogU3RyaW5nIEJ1ZmZlci5jb25jYXQgZGF0YVxuXG4gICAgICAgIEBzdG9yZS5zZXQgcmVxLCBjYWNoZUVudHJ5XG5cbiAgICBwcm94eS5vbiAncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgcmVzLCBvcHRpb25zKSB+PlxuICAgICAgcHJveHlSZXEuc2V0SGVhZGVyICdob3N0JywgdXJsLnBhcnNlKEB0YXJnZXQpLmhvc3RuYW1lXG5cbiAgICBwcm94eS5vbiAnZXJyb3InLCAoZSkgLT4gXG4gICAgICBjb25zb2xlLmxvZyAnZXJyb3InLCBlXG5cbiAgICBzZXJ2ZXIubGlzdGVuIEBwb3J0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDYWNoZXJcblxuaWYgcmVxdWlyZS5tYWluIGlzIG1vZHVsZVxuICBkZWYgPSBkb1xuICAgIHBvcnQ6IDkwMDBcbiAgICBcbiAgYXJndiA9IGFzc2lnbiBkZWYsIHJlcXVpcmUoJ21pbmltaXN0JykgcHJvY2Vzcy5hcmd2LnNsaWNlIDJcbiAgXG4gIGlmIGFyZ3YucGVyc2lzdCB0aGVuIHN0b3JlID0gbmV3IEpzb24gcGF0aDogYXJndi5wZXJzaXN0XG4gIGVsc2Ugc3RvcmUgPSBuZXcgSW5NZW1vcnkoKVxuICAgIFxuICBjYWNoZXIgPSBuZXcgQ2FjaGVyIHBvcnQ6YXJndi5wb3J0LCB0YXJnZXQ6IGFyZ3YudGFyZ2V0LCBzdG9yZTogc3RvcmVcbiAgY29uc29sZS5sb2cgXCJwcm94eWluZyAje2NhY2hlci5wb3J0fSDihpIgI3tjYWNoZXIudGFyZ2V0fVwiXG5cbiJdfQ==
