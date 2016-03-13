(function(){
  var assign, url, colors, http, crypto, httpProxy, buffer, key, InMemory, Cacher, cacher, port, target;
  assign = require('lodash').assign;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9hcGlDYWNoZXIvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFHWSxNQUFWLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBVTtFQUNWLEdBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLEtBQUE7RUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBO0VBQ0EsSUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQTtFQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFFBQUE7RUFDQSxTQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBO0VBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQTtFQUlGLEdBQUksQ0FBQSxDQUFBLENBQUUsUUFBQSxDQUFBLEdBQUE7O0lBQ0osR0FBSSxDQUFBLENBQUEsQ0FBRSxNQUFNLENBQUMsV0FBVyxRQUFBO0lBQ3hCLEdBQUcsQ0FBQyxPQUFPLENBQUUsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQWxCLENBQXVCLENBQUMsS0FBSyxHQUFELENBQTVCO1dBQ1gsR0FBRyxDQUFDLE9BQU8sUUFBQTs7RUFHUCxZQUFOLFFBQUEsQ0FBQTs7O0lBQ0UsUUFBQSxDQUFBLFFBQUEsQ0FBQTtNQUFHLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFOztjQUVaLE1BQUssUUFBQSxDQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsRUFBQTtNQUNILElBQUMsQ0FBQSxLQUFLLENBQUUsR0FBRixDQUFNLEdBQUQsQ0FBTCxDQUFhLENBQUEsQ0FBQSxDQUFFO01BQ3JCLElBQUcsRUFBSDtlQUFXLEdBQUU7OztjQUVmLE1BQUssUUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBO2FBQ0gsR0FBRyxJQUFDLENBQUEsS0FBSyxDQUFFLEdBQUYsQ0FBTSxHQUFELENBQUwsQ0FBTjs7OztFQUdE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QSxDQUFZLElBQUksQ0FBQSxDQUFBLENBQUMsS0FBQSxDQUFBLENBQUEsQ0FBSyxNQUExQiIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcblxucmVxdWlyZSEge1xuICBsb2Rhc2g6IHsgYXNzaWduIH1cbiAgdXJsXG4gIGNvbG9yc1xuICBodHRwXG4gIGNyeXB0b1xuICAnaHR0cC1wcm94eSdcbiAgYnVmZmVyXG59XG5cblxua2V5ID0gKHJlcSkgLT5cbiAgc2hhID0gY3J5cHRvLmNyZWF0ZUhhc2ggJ3NoYTI1NidcbiAgc2hhLnVwZGF0ZSBbIHJlcS5tZXRob2QsIHJlcS51cmwgXS5qb2luKCcvJylcbiAgc2hhLmRpZ2VzdCAnYmFzZTY0J1xuXG5cbmNsYXNzIEluTWVtb3J5XG4gIC0+IEBzdG9yZSA9IHt9XG4gIFxuICBzZXQ6IChyZXEsIGRhdGEsIGNiKSAtPlxuICAgIEBzdG9yZVsga2V5KHJlcSkgXSA9IGRhdGFcbiAgICBpZiBjYiB0aGVuIGNiKClcbiAgICBcbiAgZ2V0OiAocmVxLCBjYikgLT5cbiAgICBjYiBAc3RvcmVbIGtleShyZXEpIF1cblxuICBcbmNsYXNzIENhY2hlclxuICAob3B0aW9ucykgLT5cbiAgICBkZWYgPSBkb1xuICAgICAga2V5OiBrZXlcbiAgICAgIHBvcnQ6IDkwMDBcbiAgICAgIHN0b3JlOiBuZXcgSW5NZW1vcnkoKVxuICAgIFxuICAgIGFzc2lnbiBALCBkZWYsIG9wdGlvbnNcbiAgICBcbiAgICBpZiBub3QgQHRhcmdldCB0aGVuIHRocm93IG5ldyBFcnJvciBcIm5lZWQgdGFyZ2V0XCJcbiAgICAgIFxuICAgIHByb3h5ID0gQHByb3h5ID0gaHR0cFByb3h5LmNyZWF0ZVByb3h5U2VydmVyIHNlY3VyZTogZmFsc2UsIHRhcmdldDogQHRhcmdldFxuICAgIFxuICAgIHNlcnZlciA9IEBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlciAocmVxLCByZXMpIH4+IFxuICAgICAgQHN0b3JlLmdldCByZXEsIChjYWNoZSkgLT4gXG4gICAgICAgIGlmIG5vdCBjYWNoZVxuICAgICAgICAgIGNvbnNvbGUubG9nIFwi4oaSXCIsIGNvbG9ycy5yZWQocmVxLm1ldGhvZCksIHJlcS51cmxcbiAgICAgICAgICBwcm94eS53ZWIgcmVxLCByZXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnNvbGUubG9nIFwi4oaSXCIsIGNvbG9ycy5ncmVlbihyZXEubWV0aG9kKSwgcmVxLnVybFxuICAgICAgICAgIGNvbnNvbGUubG9nIFwi4oaQXCIsIGNvbG9ycy5ncmVlbiBjYWNoZS5zdGF0dXNcbiAgICAgICAgICByZXMud3JpdGVIZWFkIGNhY2hlLnN0YXR1cywgY2FjaGUuaGVhZGVyc1xuICAgICAgICAgIHJlcy53cml0ZSBjYWNoZS5ib2R5XG4gICAgICAgICAgcmVzLmVuZCgpXG5cbiAgICBwcm94eS5vbiAncHJveHlSZXMnLCAgKHByb3h5UmVzLCByZXEsIHJlcykgfj4gXG4gICAgICBkYXRhID0gW11cbiAgICAgIGNvbnNvbGUubG9nIFwi4oaQXCIsIGNvbG9ycy5yZWQgcHJveHlSZXMuc3RhdHVzQ29kZVxuICAgICAgI2NvbnNvbGUubG9nICdSQVcgUmVzcG9uc2UgZnJvbSB0aGUgdGFyZ2V0JywgSlNPTi5zdHJpbmdpZnkgcHJveHlSZXMuaGVhZGVycywgdHJ1ZSwgMlxuXG4gICAgICBwcm94eVJlcy5vbiAnZGF0YScsIC0+IGRhdGEucHVzaCBpdFxuXG4gICAgICBwcm94eVJlcy5vbiAnZW5kJywgfj4gXG4gICAgICAgIGNhY2hlRW50cnkgPSBkb1xuICAgICAgICAgIGhlYWRlcnM6IHByb3h5UmVzLmhlYWRlcnNcbiAgICAgICAgICBzdGF0dXM6IHByb3h5UmVzLnN0YXR1c0NvZGVcbiAgICAgICAgICBib2R5OiBCdWZmZXIuY29uY2F0IGRhdGFcblxuICAgICAgICBAc3RvcmUuc2V0IHJlcSwgY2FjaGVFbnRyeVxuXG5cbiAgICBwcm94eS5vbiAncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgcmVzLCBvcHRpb25zKSB+PlxuICAgICAgcHJveHlSZXEuc2V0SGVhZGVyICdob3N0JywgdXJsLnBhcnNlKEB0YXJnZXQpLmhvc3RuYW1lXG5cbiAgICBwcm94eS5vbiAnZXJyb3InLCAoZSkgLT4gXG4gICAgICBjb25zb2xlLmxvZyAnZXJyb3InLCBlXG5cbiAgICBzZXJ2ZXIubGlzdGVuIHBvcnRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENhY2hlclxuXG5cbmlmIHJlcXVpcmUubWFpbiBpcyBtb2R1bGUgdGhlblxuICBjYWNoZXIgPSBuZXcgQ2FjaGVyIHBvcnQ6IHBvcnQgPSBOdW1iZXIocHJvY2Vzcy5hcmd2LnBvcCgpKSwgdGFyZ2V0OiB0YXJnZXQgPSBwcm9jZXNzLmFyZ3YucG9wKCkgXG4gIGNvbnNvbGUubG9nIFwicHJveHlpbmcgI3twb3J0fSDihpIgI3t0YXJnZXR9XCJcblxuIl19
