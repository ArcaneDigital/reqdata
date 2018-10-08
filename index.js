"use strict";
const got = require("got");
const UserAgent = require("user-agents");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
module.exports = async function(url) {
  return new Promise(async (resolve, reject) => {
    const userAgent = new UserAgent();
    const redirects = [];
    let res = {};

    try {
      const response = await got
        .get(url, {
          timeout: {
            socket: 75000,
            connect: 12500,
            request: 17500
          },
          headers: {
            "user-agent": userAgent.toString()
          }
        })
        .on("redirect", (response, nextOptions) => {
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
              html: null
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
      html: tighten(res.body)
    });
  });
};

function tighten(text) {
  if (!text) return text;

  return text
    .replace(/\s+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(\s?-\s)/g, "")
    .trim();
}
