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
    var sha;
    sha = crypto.createHash('sha256');
    sha.update([req.method, req.url].join('/'));
    return sha.digest('base64');
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
      return fs.writeFileSync(path, JSON.stringify(this.store));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9hcGlDYWNoZXIvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFHRSxFQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBO0VBQ0EsSUFBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBWSxJQUFaLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWSxJQUFaLEVBQWtCLE1BQWxCLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBa0IsTUFBbEIsRUFBMEIsSUFBMUIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwQjtFQUMxQixHQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBO0VBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQTtFQUNBLElBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLE1BQUE7RUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBO0VBQ0EsU0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQTtFQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFFBQUE7RUFHRixHQUFJLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxHQUFBOztJQUNKLEdBQUksQ0FBQSxDQUFBLENBQUUsTUFBTSxDQUFDLFdBQVcsUUFBQTtJQUN4QixHQUFHLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFsQixDQUF1QixDQUFDLEtBQUssR0FBRCxDQUE1QjtXQUNYLEdBQUcsQ0FBQyxPQUFPLFFBQUE7O0VBR1AsU0FBTixRQUFBLENBQUE7OztjQUNFLE1BQUssUUFBQSxDQUFBO01BQUcsTUFBQSxzQkFBQTs7Y0FDUixNQUFLLFFBQUEsQ0FBQTtNQUFHLE1BQUEsc0JBQUE7Ozs7O0VBRUosWUFBTixRQUFBLENBQUEsVUFBQTs7SUFDRSxRQUFBLENBQUEsUUFBQSxDQUFBLE9BQUE7O01BQ0UsR0FBSSxDQUFB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LElBQUcsSUFBSSxDQUFDLE9BQVI7TUFBcUIsS0FBTSxDQUFBLENBQUEsS0FBTSxLQUFLO1FBQUEsTUFBTSxJQUFJLENBQUM7TUFBWCxDQUFBO0tBQ3RDO01BQUssS0FBTSxDQUFBLENBQUEsS0FBTSxTQUFROztJQUV6QixNQUFPLENBQUEsQ0FBQSxLQUFNLE9BQU87TUFBQSxNQUFLLElBQUksQ0FBQztNQUFNLFFBQVEsSUFBSSxDQUFDO01BQVEsT0FBTztJQUE1QyxDQUFBO0lBQ3BCLE9BQU8sQ0FBQyxJQUFJLFdBQUEsQ0FBQSxDQUFBLENBQVksTUFBTSxDQUFDLElBQUksQ0FBQSxDQUFBLENBQUMsS0FBQSxDQUFBLENBQUEsQ0FBSyxNQUFNLENBQUMsTUFBeEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIGF1dG9jb21waWxlXG5cbnJlcXVpcmUhIHtcbiAgZnNcbiAgbGVzaGRhc2g6IHsgd2FpdCwgYXNzaWduLCBrZXlzIH1cbiAgdXJsXG4gIGNvbG9yc1xuICBodHRwXG4gIGNyeXB0b1xuICAnaHR0cC1wcm94eSdcbiAgYnVmZmVyXG59XG5cbmtleSA9IChyZXEpIC0+XG4gIHNoYSA9IGNyeXB0by5jcmVhdGVIYXNoICdzaGEyNTYnXG4gIHNoYS51cGRhdGUgWyByZXEubWV0aG9kLCByZXEudXJsIF0uam9pbignLycpXG4gIHNoYS5kaWdlc3QgJ2Jhc2U2NCdcblxuXG5jbGFzcyBTdG9yZVxuICBnZXQ6IC0+IC4uLlxuICBzZXQ6IC0+IC4uLlxuICAgIFxuY2xhc3MgSW5NZW1vcnkgZXh0ZW5kcyBTdG9yZVxuICAob3B0aW9ucykgLT5cbiAgICBkZWYgPSBkb1xuICAgICAgc3RvcmU6IHt9XG4gICAgICBcbiAgICBhc3NpZ24gQCwgZGVmLCBvcHRpb25zXG4gIFxuICBzZXQ6IChyZXEsIGRhdGEsIGNiKSAtPlxuICAgIEBzdG9yZVsga2V5KHJlcSkgXSA9IGRhdGFcbiAgICBpZiBjYiB0aGVuIGNiKClcbiAgICBcbiAgZ2V0OiAocmVxLCBjYikgLT5cbiAgICBjYiBAc3RvcmVbIGtleShyZXEpIF1cblxuXG5jbGFzcyBKc29uIGV4dGVuZHMgSW5NZW1vcnlcbiAgKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgLi4uXG4gICAgXG4gICAgQHBhdGggPSAnLi9qc29uLycgKyBAcGF0aCArIFwiLmpzb25cIlxuICAgIGNvbnNvbGUubG9nIFwidXNpbmcganNvbiBzdG9yZSAje0BwYXRofVwiXG4gICAgQGxvYWRKc29uIEBwYXRoXG5cbiAgc2F2ZUpzb246IChwYXRoKSAtPlxuICAgIGZzLndyaXRlRmlsZVN5bmMgcGF0aCwgSlNPTi5zdHJpbmdpZnkgQHN0b3JlXG5cbiAgbG9hZEpzb246IChwYXRoKSAtPlxuICAgIHRyeVxuICAgICAgZnMuc3RhdFN5bmMgcGF0aFxuICAgICAgQHN0b3JlID0gcmVxdWlyZSBwYXRoXG4gICAgICBjb25zb2xlLmxvZyBrZXlzIEBzdG9yZS5zdG9yZVxuICAgIGNhdGNoXG4gICAgICBjb25zb2xlLndhcm4gXCIje3BhdGh9IG5vdCBmb3VuZCwgd2lsbCBjcmVhdGUgbmV3IG9uZVwiXG5cbiAgc2V0OiAocmVxLCBjYikgLT5cbiAgICBzdXBlciAuLi5cbiAgICBAc2F2ZUpzb24gQHBhdGhcbiAgICAgICAgICAgIFxuY2xhc3MgQ2FjaGVyXG4gIChvcHRpb25zKSAtPlxuICAgIGRlZiA9IGRvXG4gICAgICBrZXk6IGtleVxuICAgICAgcG9ydDogOTAwMFxuICAgICAgc3RvcmU6IG5ldyBJbk1lbW9yeSgpXG4gICAgXG4gICAgYXNzaWduIEAsIGRlZiwgb3B0aW9uc1xuICAgIFxuICAgIGlmIG5vdCBAdGFyZ2V0IHRoZW4gdGhyb3cgbmV3IEVycm9yIFwibmVlZCB0YXJnZXRcIlxuICAgICAgXG4gICAgcHJveHkgPSBAcHJveHkgPSBodHRwUHJveHkuY3JlYXRlUHJveHlTZXJ2ZXIgc2VjdXJlOiBmYWxzZSwgdGFyZ2V0OiBAdGFyZ2V0XG4gICAgXG4gICAgc2VydmVyID0gQHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyIChyZXEsIHJlcykgfj4gXG4gICAgICBAc3RvcmUuZ2V0IHJlcSwgKGNhY2hlKSAtPiBcbiAgICAgICAgaWYgbm90IGNhY2hlXG4gICAgICAgICAgY29uc29sZS5sb2cgXCLihpJcIiwgY29sb3JzLnJlZChyZXEubWV0aG9kKSwgcmVxLnVybFxuICAgICAgICAgIHByb3h5LndlYiByZXEsIHJlc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgY29uc29sZS5sb2cgXCLihpJcIiwgY29sb3JzLmdyZWVuKHJlcS5tZXRob2QpLCByZXEudXJsXG4gICAgICAgICAgY29uc29sZS5sb2cgXCLihpBcIiwgY29sb3JzLmdyZWVuIGNhY2hlLnN0YXR1c1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQgY2FjaGUuc3RhdHVzLCBjYWNoZS5oZWFkZXJzXG4gICAgICAgICAgcmVzLndyaXRlIGNhY2hlLmJvZHlcbiAgICAgICAgICByZXMuZW5kKClcblxuICAgIHByb3h5Lm9uICdwcm94eVJlcycsICAocHJveHlSZXMsIHJlcSwgcmVzKSB+PiBcbiAgICAgIGRhdGEgPSBbXVxuICAgICAgY29uc29sZS5sb2cgXCLihpBcIiwgY29sb3JzLnJlZCBwcm94eVJlcy5zdGF0dXNDb2RlXG5cbiAgICAgIHByb3h5UmVzLm9uICdkYXRhJywgLT4gZGF0YS5wdXNoIGl0XG5cbiAgICAgIHByb3h5UmVzLm9uICdlbmQnLCB+PiBcbiAgICAgICAgY2FjaGVFbnRyeSA9IGRvXG4gICAgICAgICAgaGVhZGVyczogcHJveHlSZXMuaGVhZGVyc1xuICAgICAgICAgIHN0YXR1czogcHJveHlSZXMuc3RhdHVzQ29kZVxuICAgICAgICAgIGJvZHk6IFN0cmluZyBCdWZmZXIuY29uY2F0IGRhdGFcblxuICAgICAgICBAc3RvcmUuc2V0IHJlcSwgY2FjaGVFbnRyeVxuXG4gICAgcHJveHkub24gJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIHJlcywgb3B0aW9ucykgfj5cbiAgICAgIHByb3h5UmVxLnNldEhlYWRlciAnaG9zdCcsIHVybC5wYXJzZShAdGFyZ2V0KS5ob3N0bmFtZVxuXG4gICAgcHJveHkub24gJ2Vycm9yJywgKGUpIC0+IFxuICAgICAgY29uc29sZS5sb2cgJ2Vycm9yJywgZVxuXG4gICAgc2VydmVyLmxpc3RlbiBAcG9ydFxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FjaGVyXG5cbmlmIHJlcXVpcmUubWFpbiBpcyBtb2R1bGVcbiAgZGVmID0gZG9cbiAgICBwb3J0OiA5MDAwXG4gICAgXG4gIGFyZ3YgPSBhc3NpZ24gZGVmLCByZXF1aXJlKCdtaW5pbWlzdCcpIHByb2Nlc3MuYXJndi5zbGljZSAyXG4gIFxuICBpZiBhcmd2LnBlcnNpc3QgdGhlbiBzdG9yZSA9IG5ldyBKc29uIHBhdGg6IGFyZ3YucGVyc2lzdFxuICBlbHNlIHN0b3JlID0gbmV3IEluTWVtb3J5KClcbiAgICBcbiAgY2FjaGVyID0gbmV3IENhY2hlciBwb3J0OmFyZ3YucG9ydCwgdGFyZ2V0OiBhcmd2LnRhcmdldCwgc3RvcmU6IHN0b3JlXG4gIGNvbnNvbGUubG9nIFwicHJveHlpbmcgI3tjYWNoZXIucG9ydH0g4oaSICN7Y2FjaGVyLnRhcmdldH1cIlxuXG4iXX0=
