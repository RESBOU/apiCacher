(function(){
  var ref$, wait, assign, url, colors, http, crypto, httpProxy, buffer, key, InMemory, Cacher, cacher, port, target;
  ref$ = require('leshdash'), wait = ref$.wait, assign = ref$.assign;
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
  InMemory = (function(){
    InMemory.displayName = 'InMemory';
    var prototype = InMemory.prototype, constructor = InMemory;
    function InMemory(){
      this.store = {};
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
  }());
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
            body: Buffer.concat(data)
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
      server.listen(port);
    }
    return Cacher;
  }());
  module.exports = Cacher;
  if (require.main === module) {
    cacher = new Cacher({
      port: port = Number(process.argv.pop()),
      target: target = process.argv.pop()
    });
    console.log("proxying " + port + " → " + target);
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9hcGlDYWNoZXIvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFHRSxJQUFBLEdBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxFQUFZLElBQVosQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFZLElBQVosRUFBa0IsTUFBbEIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrQjtFQUNsQixHQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBO0VBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQTtFQUNBLElBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLE1BQUE7RUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBO0VBQ0EsU0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQTtFQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFFBQUE7RUFJRixHQUFJLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxHQUFBOztJQUNKLEdBQUksQ0FBQSxDQUFBLENBQUUsTUFBTSxDQUFDLFdBQVcsUUFBQTtJQUN4QixHQUFHLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFsQixDQUF1QixDQUFDLEtBQUssR0FBRCxDQUE1QjtXQUNYLEdBQUcsQ0FBQyxPQUFPLFFBQUE7O0VBR1AsWUFBTixRQUFBLENBQUE7OztJQUNFLFFBQUEsQ0FBQSxRQUFBLENBQUE7TUFBRyxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBRTs7Y0FFWixNQUFLLFFBQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEVBQUE7TUFDSCxJQUFDLENBQUEsS0FBSyxDQUFFLEdBQUYsQ0FBTSxHQUFELENBQUwsQ0FBYSxDQUFBLENBQUEsQ0FBRTtNQUNyQixJQUFHLEVBQUg7ZUFBVyxHQUFFOzs7Y0FFZixNQUFLLFFBQUEsQ0FBQSxHQUFBLEVBQUEsRUFB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QUFDLElBQUksQ0FBQyxJQUFHO0lBQTFFLENBQUE7SUFDcEIsT0FBTyxDQUFDLElBQUksV0FBQSxDQUFBLENBQUEsQ0FBWSxJQUFJLENBQUEsQ0FBQSxDQUFDLEtBQUEsQ0FBQSxDQUFBLENBQUssTUFBMUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIGF1dG9jb21waWxlXG5cbnJlcXVpcmUhIHtcbiAgbGVzaGRhc2g6IHsgd2FpdCwgYXNzaWduIH1cbiAgdXJsXG4gIGNvbG9yc1xuICBodHRwXG4gIGNyeXB0b1xuICAnaHR0cC1wcm94eSdcbiAgYnVmZmVyXG59XG5cblxua2V5ID0gKHJlcSkgLT5cbiAgc2hhID0gY3J5cHRvLmNyZWF0ZUhhc2ggJ3NoYTI1NidcbiAgc2hhLnVwZGF0ZSBbIHJlcS5tZXRob2QsIHJlcS51cmwgXS5qb2luKCcvJylcbiAgc2hhLmRpZ2VzdCAnYmFzZTY0J1xuXG5cbmNsYXNzIEluTWVtb3J5XG4gIC0+IEBzdG9yZSA9IHt9XG4gIFxuICBzZXQ6IChyZXEsIGRhdGEsIGNiKSAtPlxuICAgIEBzdG9yZVsga2V5KHJlcSkgXSA9IGRhdGFcbiAgICBpZiBjYiB0aGVuIGNiKClcbiAgICBcbiAgZ2V0OiAocmVxLCBjYikgLT5cbiAgICBjYiBAc3RvcmVbIGtleShyZXEpIF1cblxuICBcbmNsYXNzIENhY2hlclxuICAob3B0aW9ucykgLT5cbiAgICBkZWYgPSBkb1xuICAgICAga2V5OiBrZXlcbiAgICAgIHBvcnQ6IDkwMDBcbiAgICAgIHN0b3JlOiBuZXcgSW5NZW1vcnkoKVxuICAgIFxuICAgIGFzc2lnbiBALCBkZWYsIG9wdGlvbnNcbiAgICBcbiAgICBpZiBub3QgQHRhcmdldCB0aGVuIHRocm93IG5ldyBFcnJvciBcIm5lZWQgdGFyZ2V0XCJcbiAgICAgIFxuICAgIHByb3h5ID0gQHByb3h5ID0gaHR0cFByb3h5LmNyZWF0ZVByb3h5U2VydmVyIHNlY3VyZTogZmFsc2UsIHRhcmdldDogQHRhcmdldFxuICAgIFxuICAgIHNlcnZlciA9IEBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlciAocmVxLCByZXMpIH4+IFxuICAgICAgQHN0b3JlLmdldCByZXEsIChjYWNoZSkgLT4gXG4gICAgICAgIGlmIG5vdCBjYWNoZVxuICAgICAgICAgIGNvbnNvbGUubG9nIFwi4oaSXCIsIGNvbG9ycy5yZWQocmVxLm1ldGhvZCksIHJlcS51cmxcbiAgICAgICAgICBwcm94eS53ZWIgcmVxLCByZXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnNvbGUubG9nIFwi4oaSXCIsIGNvbG9ycy5ncmVlbihyZXEubWV0aG9kKSwgcmVxLnVybFxuICAgICAgICAgIGNvbnNvbGUubG9nIFwi4oaQXCIsIGNvbG9ycy5ncmVlbiBjYWNoZS5zdGF0dXNcbiAgICAgICAgICByZXMud3JpdGVIZWFkIGNhY2hlLnN0YXR1cywgY2FjaGUuaGVhZGVyc1xuICAgICAgICAgIHJlcy53cml0ZSBjYWNoZS5ib2R5XG4gICAgICAgICAgcmVzLmVuZCgpXG5cbiAgICBwcm94eS5vbiAncHJveHlSZXMnLCAgKHByb3h5UmVzLCByZXEsIHJlcykgfj4gXG4gICAgICBkYXRhID0gW11cbiAgICAgIGNvbnNvbGUubG9nIFwi4oaQXCIsIGNvbG9ycy5yZWQgcHJveHlSZXMuc3RhdHVzQ29kZVxuICAgICAgI2NvbnNvbGUubG9nICdSQVcgUmVzcG9uc2UgZnJvbSB0aGUgdGFyZ2V0JywgSlNPTi5zdHJpbmdpZnkgcHJveHlSZXMuaGVhZGVycywgdHJ1ZSwgMlxuXG4gICAgICBwcm94eVJlcy5vbiAnZGF0YScsIC0+IGRhdGEucHVzaCBpdFxuXG4gICAgICBwcm94eVJlcy5vbiAnZW5kJywgfj4gXG4gICAgICAgIGNhY2hlRW50cnkgPSBkb1xuICAgICAgICAgIGhlYWRlcnM6IHByb3h5UmVzLmhlYWRlcnNcbiAgICAgICAgICBzdGF0dXM6IHByb3h5UmVzLnN0YXR1c0NvZGVcbiAgICAgICAgICBib2R5OiBCdWZmZXIuY29uY2F0IGRhdGFcblxuICAgICAgICBAc3RvcmUuc2V0IHJlcSwgY2FjaGVFbnRyeVxuXG5cbiAgICBwcm94eS5vbiAncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgcmVzLCBvcHRpb25zKSB+PlxuICAgICAgcHJveHlSZXEuc2V0SGVhZGVyICdob3N0JywgdXJsLnBhcnNlKEB0YXJnZXQpLmhvc3RuYW1lXG5cbiAgICBwcm94eS5vbiAnZXJyb3InLCAoZSkgLT4gXG4gICAgICBjb25zb2xlLmxvZyAnZXJyb3InLCBlXG5cbiAgICBzZXJ2ZXIubGlzdGVuIHBvcnRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENhY2hlclxuXG5cbmlmIHJlcXVpcmUubWFpbiBpcyBtb2R1bGUgdGhlblxuICBjYWNoZXIgPSBuZXcgQ2FjaGVyIHBvcnQ6IHBvcnQgPSBOdW1iZXIocHJvY2Vzcy5hcmd2LnBvcCgpKSwgdGFyZ2V0OiB0YXJnZXQgPSBwcm9jZXNzLmFyZ3YucG9wKCkgXG4gIGNvbnNvbGUubG9nIFwicHJveHlpbmcgI3twb3J0fSDihpIgI3t0YXJnZXR9XCJcblxuIl19
