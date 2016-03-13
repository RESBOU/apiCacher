# apiCacher

in memory cache for api requests for developing clients to avoid hammering services
supports https & all http methods

## Console Usage

```
node index.js https://google.com 9000

proxying 9000 → https://google.com
→ GET /bla
← 404
```

## Module Usage

also can be used as a module. read the code.
