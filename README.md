# ReqData

Collect request data from a url. Includes status code, redirects, headers and content.

## Install

```
npm install reqdata --save
```

## Usage

```javascript
const req = require("reqdata");

req("http://example.com").then(res => {
  console.log(res);
});
```

```javascript
const req = require("reqdata");

(async () => {
  const res = await req("http://example.com");
  console.log(res);
})();
```

**Result**

```json
{
  "url": "http://example.com/",
  "status": 200,
  "headers": {
    "content-encoding": "gzip",
    "cache-control": "max-age=604800",
    "content-type": "text/html; charset=UTF-8",
    "date": "Mon, 08 Oct 2018 03:44:06 GMT",
    "etag": "\"1541025663+gzip\"",
    "expires": "Mon, 15 Oct 2018 03:44:06 GMT",
    "last-modified": "Fri, 09 Aug 2013 23:54:35 GMT",
    "server": "ECS (lga/13A2)",
    "vary": "Accept-Encoding",
    "x-cache": "HIT",
    "content-length": "606",
    "connection": "close",
    "accept-ranges": "bytes"
  },
  "redirects": [],
  "html":
    "<!doctype html> <html> <head> <title>Example Domain</title> <meta charset=\"utf-8\" /> <meta http-equiv=\"Content-type\" content=\"text/html; charset=utf-8\" /> <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /> <style type=\"text/css\"> body { background-color: #f0f0f2; margin: 0; padding: 0; font-family: \"Open Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif; } div { width: 600px; margin: 5em auto; padding: 50px; background-color: #fff; border-radius: 1em; } a:link, a:visited { color: #38488f; text-decoration: none; } @media (max-width: 700px) { body { background-color: #fff; } div { width: auto; margin: 0 auto; border-radius: 0; padding: 1em; } } </style> </head> <body> <div> <h1>Example Domain</h1> <p>This domain is established to be used for illustrative examples in documents. You may use this domain in examples without prior coordination or asking for permission.</p> <p><a href=\"http://www.iana.org/domains/example\">More information...</a></p> </div> </body> </html>"
}
```

## Options

- `type`: _fetch_ or _emulate_ - Default is fetch. Emulate uses [Puppeteer](https://www.npmjs.com/package/puppeteer) to emulate a browser
- `agent`: User agent for request. If empty uses [User Agents](https://www.npmjs.com/package/user-agents) for a random agent
- `proxy`: `{host: '', port: '', user: '', password: ''}`

```javascript
req("http://example.com", {
  type: "emulate"
}).then(res => {
  console.log(res);
});
```
