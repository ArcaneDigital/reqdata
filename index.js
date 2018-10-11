"use strict";
const got = require("got");
const puppeteer = require("puppeteer");
const UserAgent = require("user-agents");
const tunnel = require("tunnel-agent");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
module.exports = async function(url, options = {}) {
  const type = options.type || "fetch";
  if (type == "emulate") return await emulate(url, options);

  return await fetch(url, options);
};
async function fetch(url, options) {
  return new Promise(async (resolve, reject) => {
    const userAgent = new UserAgent();
    const redirects = [];
    let res = {};
    let agent = null;
    if (options.proxy) {
      agent = tunnel.httpsOverHttp({
        proxy: {
          host: options.proxy.host,
          port: options.proxy.port,
          proxyAuth: `${options.proxy.user}:${options.proxy.password}`
        }
      });
    }
    try {
      const response = await got(url, {
        agent: agent,
        timeout: {
          socket: 75000,
          connect: 12500,
          request: 17500
        },
        headers: {
          "user-agent": options.agent || userAgent.toString()
        }
      }).on("redirect", (response, nextOptions) => {
        redirects.push({
          source: response.url,
          status: response.statusCode,
          headers: response.headers,
          destination: response.headers.location
        });

        if (nextOptions.host.length == 0) {
          return resolve({
            url: response.url,
            status: 500,
            headers: response.headers,
            redirects: redirects,
            content: null
          });
          throw Error(url);
        }
      });

      res = response || res;
    } catch (error) {
      res = {
        requestUrl: error.url || url,
        statusCode: error.code || error.statusCode || "ECONNREFUSED",
        headers: error.headers || {},
        url: error.url || url,
        body: null
      };
    }

    resolve({
      url: res.requestUrl,
      status: res.statusCode,
      headers: res.headers,
      redirects: redirects,
      content: tighten(res.body),
      type: "fetch"
    });
  });
}
async function emulate(url, options) {
  return new Promise(async (resolve, reject) => {
    let res = {};
    const userAgent = new UserAgent();
    let proxy = "";
    if (options.proxy) {
      proxy = `--proxy-server=http://${options.proxy.host}:${
        options.proxy.port
      }`;
    }
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        `--disk-cache-size=0`,
        proxy
      ]
    });
    let response = "";
    try {
      const page = await browser.newPage();
      if (options.proxy) {
        await page.authenticate({
          username: options.proxy.user,
          password: options.proxy.password
        });
      }
      page.on("pageerror", error => {});
      await page.emulate({
        viewport: { width: 1280, height: 1024 },
        deviceScaleFactor: 1,
        userAgent: options.agent || userAgent.toString()
      });

      const response = await page.goto(url, {
        timeout: 30000,
        waitUntil: "networkidle2"
      });
      const redirects = response
        .request()
        .redirectChain()
        .map(r => {
          return {
            source: r.url(),
            status: r.response().status(),
            headers: r.response().headers(),
            destination: r.response().headers().location
          };
        });
      res = {
        url: url,
        status: response.status(),
        headers: response.headers(),
        redirects: redirects,
        content: tighten(await response.text()),
        type: "emulate"
      };
    } catch (e) {
      console.log(e);
      res = {
        url: url,
        status: e.code || e.statusCode || "ECONNREFUSED",
        headers: {},
        redirects: [],
        content: null,
        type: "emulate"
      };
    }

    await browser.close();
    resolve(res);
  });
}
function tighten(text) {
  if (!text) return text;

  return text
    .replace(/\s+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(\s?-\s)/g, "")
    .trim();
}
