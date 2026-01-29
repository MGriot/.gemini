let clearLog = !0;
const offscreenSupported = "undefined" !== typeof chrome.offscreen;
let lastActivity = 0, sellerLockoutDuration = 60000, delayedFetch = !1, ignoreResponseCookies = !1, stockDelay = 0, startedAt = new Date();
setInterval(() => {
  3E5 < Date.now() - lastActivity && chrome.runtime.reload();
}, 144E5);
let hasWebRequestPermission = !!chrome.webRequest, interceptedExtensionCookies = {}, serviceWorkerUrl = chrome.runtime.getURL("").replace(/\/$/, "");
async function waitForCookies(a, c) {
  const b = interceptedExtensionCookies[a]?.promise;
  return new Promise(f => {
    const d = setTimeout(() => {
      console.log("Timeout reached without cookies", a);
      f(null);
    }, c);
    b || (clearTimeout(d), f(null));
    b.then(g => {
      clearTimeout(d);
      f(g);
    });
  });
}
try {
  chrome.runtime.onInstalled.addListener(a => {
    if (a.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      var c = chrome.runtime.getURL("welcome.html");
      setTimeout(() => chrome.tabs.create({url:c}), 250);
    }
  });
} catch (a) {
  console.warn("Welcome page init failed:", a);
}
function parseNumberFormat(a) {
  try {
    let c = a.toString(), b = c.includes(".") ? c.split(".")[1].length : 0;
    c = c.replace(".", "");
    return parseInt(c, 10) * Math.pow(10, 2 - b);
  } catch (c) {
  }
  return null;
}
async function handleGuestSession(a, c) {
  let b = null;
  try {
    b = cloud.getSessionId(settings.extensionCookies[a.domainId]?.cookies);
  } catch (f) {
    console.error(f);
  }
  await swapCookies(a.url, c, a.userCookies);
  delete settings.userCookies["" + a.domainId];
  a.response.cookies = null;
  a.response.text = null;
  delete settings.extensionCookies["" + a.domainId];
  delete common.addToCartAssocCsrfs[a.domainId];
  common.reportBug(null, generateBugReport("new s is u s", b, a));
  a.response.status = 900;
}
function updateCookies(a, c) {
  Array.isArray(a) || (a = []);
  Array.isArray(c) || (c = []);
  const b = new Map(a.map(d => [d.name, d])), f = new Set(c.filter(d => "-" !== d.value && "" !== d.value && "delete" !== d.value).map(d => d.name));
  c.forEach(d => {
    if (f.has(d.name)) {
      "-" !== d.value && "" !== d.value && "delete" !== d.value && b.set(d.name, d);
    } else {
      const g = b.get(d.name);
      g && g.secure === d.secure && g.path === d.path ? "" === d.value || "-" === d.value || "delete" === d.value ? b.delete(d.name) : b.set(d.name, d) : "" !== d.value && "-" !== d.value && "delete" !== d.value && b.set(d.name, d);
    }
  });
  return Array.from(b.values());
}
function parseSetCookieString(a) {
  a = a.split(";").map(d => d.trim());
  const [c, b] = a[0].split("="), f = {name:c, value:b, domain:"", path:"", secure:!1, hostOnly:!1, httpOnly:!1, session:!1, storeId:"0", sameSite:"unspecified", expirationDate:0};
  a.slice(1).forEach(d => {
    const [g, k] = d.split("=");
    switch(g.toLowerCase()) {
      case "domain":
        f.domain = k;
        break;
      case "path":
        f.path = k;
        break;
      case "expires":
        f.expirationDate = (new Date(k)).getTime() / 1000;
        break;
      case "secure":
        f.secure = !0;
        break;
      case "hostOnly":
        f.hostOnly = !0;
        break;
      case "httpOnly":
        f.httpOnly = !0;
        break;
      case "session":
        f.session = !0;
        break;
      case "sameSite":
        f.sameSite = !0;
    }
  });
  return f;
}
let AmazonSellerIds = "1 ATVPDKIKX0DER A3P5ROKL5A1OLE A3JWKAKR8XB7XF A1X6FK5RDHNB96 AN1VRQENFRJN5 A3DWYIK6Y9EEQB A1AJ19PSB66TGU A11IL2PNWYJU7H A1AT7YVPFBWXBL A3P5ROKL5A1OLE AVDBXBAVVSXLQ A1ZZFT5FULY4LN ANEGB3WVEVKZB A17D2BRD4YMT0X".split(" "), WarehouseDealsSellerIds = [];
const userAgentData = navigator.userAgentData?.brands.find(({brand:a}) => "Google Chrome" === a), settingKeys = "optOut_crawl revealStock s_boxOfferListing s_boxType s_boxHorizontal webGraphType webGraphRange overlayPriceGraph lastActivated".split(" "), isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent), userAgent = navigator.userAgent.toLowerCase(), isFirefox = userAgent.includes("firefox"), isEdge = userAgent.includes("edge/"), isSafari = /Apple Computer/.test(navigator.vendor) && 
userAgent.includes("safari"), isOpera = userAgent.includes("opera") || userAgent.includes("opr/"), isChrome = !isOpera && !isFirefox && !isEdge && !isSafari, type = isChrome ? "keepaChrome" : isOpera ? "keepaOpera" : isSafari ? "keepaSafari" : isEdge ? "keepaEdge" : "keepaFirefox", browserType = isFirefox ? "Firefox" : isSafari ? "Safari" : isChrome ? "Chrome" : isOpera ? "Opera" : isEdge ? "Edge" : "Unknown";
let installTimestamp = 0;
const runningSince = Date.now();
let settings = {}, cookieOrder = "session-id session-id-time i18n-prefs skin ubid-main sp-cdn session-token".split(" ");
const cookieToString = a => {
  let c = "", b = "";
  var f = {};
  for (let d in a) {
    const g = a[d];
    f[g.name] = g;
  }
  a = [];
  for (let d in cookieOrder) {
    f[cookieOrder[d]] && a.push(f[cookieOrder[d]]);
  }
  for (let d in cookieOrder) {
    delete f[cookieOrder[d]];
  }
  for (let d in f) {
    a.push(f[d]);
  }
  for (let d in a) {
    f = a[d], "-" != f.value && (c += b + f.name + "=" + f.value + ";", b = " ");
  }
  return c;
};
function generateBugReport(a, c, b) {
  return (new Date()).toISOString().substring(0, 19) + ` # ${a} ! ${c} --- ${b.userSession} ${b.url}` + ` status: ${b.response.status}` + ` webreq: ${hasWebRequestPermission}` + ` sc active: ${0 == lastSellerActivity ? "never" : (new Date(lastSellerActivity)).toISOString().substring(0, 19)}` + ` c active: ${0 == lastContentActivity ? "never" : (new Date(lastContentActivity)).toISOString().substring(0, 19)}`;
}
async function updateLocalStorage() {
  await chrome.storage.local.set({extensionCookies:await compressObject(settings.extensionCookies), userCookies:await compressObject(settings.userCookies)});
}
const swapCookies = async(a, c, b) => {
  cloud.getSessionId(c);
  cloud.getSessionId(b);
  let f = null != b ? new Set(b.map(g => g.name)) : null, d = [];
  if (null != c) {
    for (let g of c) {
      null != b && f.has(g.name) || (delete g.hostOnly, delete g.session, d.push(chrome.cookies.remove({url:a + g.path, name:g.name})));
    }
  }
  if (null != b) {
    for (let g of b) {
      delete g.hostOnly, delete g.session, g.url = a, d.push(chrome.cookies.set(g));
    }
  }
  await Promise.all(d).catch(g => {
    setTimeout(() => {
      common.reportBug(g, "Error in cookie swap.");
    }, 1);
  });
}, DNR = (() => {
  let a = 100;
  const c = f => 0 === f.length ? Promise.resolve() : chrome.declarativeNetRequest.updateSessionRules({removeRuleIds:f}), b = async() => {
    let f = [], d = chrome.declarativeNetRequest.getSessionRules();
    d.then(g => g.forEach(k => {
      f.push(k.id);
    }));
    await d;
    return c(f);
  };
  (async() => {
    await b();
  })();
  return {addSessionRules:f => {
    let d = [];
    f.forEach(g => {
      const k = ++a;
      g.id = k;
      d.push(k);
    });
    return [chrome.declarativeNetRequest.updateSessionRules({addRules:f}), d];
  }, deleteSessionRules:c, deleteAllRules:b};
})();
class Queue {
  constructor() {
    this._items = [];
  }
  enqueue(a) {
    this._items.push(a);
  }
  dequeue() {
    return this._items.shift();
  }
  get size() {
    return this._items.length;
  }
}
class AutoQueue extends Queue {
  constructor() {
    super();
    this._pendingPromise = !1;
  }
  enqueue(a) {
    return new Promise((c, b) => {
      super.enqueue({action:a, resolve:c, reject:b});
      this.dequeue();
    });
  }
  async dequeue() {
    if (this._pendingPromise) {
      return !1;
    }
    let a = super.dequeue();
    if (!a) {
      return !1;
    }
    try {
      this._pendingPromise = !0;
      let c = await a.action(this);
      this._pendingPromise = !1;
      a.resolve(c);
    } catch (c) {
      this._pendingPromise = !1, a.reject(c);
    } finally {
      this.dequeue();
    }
    return !0;
  }
}
const requestQueue = new AutoQueue(), processRequest = async a => {
  if (a) {
    if (!a.domainId && 0 < a.url.indexOf("amazon.")) {
      console.log("request without domainId");
    } else {
      var c = Date.now();
      lastActivity = c;
      if (!(a.isGuest && !1 === a.ignoreCookies && !hasWebRequestPermission && c - lastSellerActivity < sellerLockoutDuration)) {
        var b = parseInt(c / 1000), f = new URL(a.url);
        a.response = {headers:{}, text:null};
        "undefined" === typeof a.cookies && (a.cookies = []);
        a.userCookies = null;
        var d = null != a.cookies ? cookieToString(a.cookies) : null;
        c = hasWebRequestPermission || !0 === a.ignoreCookies && null != d && 8 < d.length;
        for (let m = 0; m < a.dnr.length; m++) {
          const e = a.dnr[m];
          e.priority = 108108;
          e.condition && (-1 < a.url.indexOf("amazon.") ? e.condition.urlFilter = "||amazon." + getTldByDomain(a.domainId) : e.condition.urlFilter = a.url, e.condition.initiatorDomains = [chrome.runtime.id], delete e.condition.tabIds);
          let l = !1;
          for (let n = 0; n < e.action.requestHeaders.length; n++) {
            const p = e.action.requestHeaders[n];
            "set" == p.operation && ("cookie" == p.header.toLowerCase() ? (null != d ? p.value = p.value.replace("{COOKIE}", d) : (delete p.value, p.operation = "remove"), l = !0) : (p.value = p.value.replace("{ORIGIN}", a.originHost ? a.originHost : f.host), a.language && (p.value = p.value.replace("{LANG}", a.language)), a.referer && (p.value = p.value.replace("{REFERER}", a.referer)), a.csrf && (p.value = p.value.replace("{CSRF}", a.csrf)), a.atcCsrf && (p.value = p.value.replace("{ATCCSRF}", 
            a.atcCsrf)), a.slateToken && (p.value = p.value.replace("{STOKEN}", a.slateToken))));
          }
          a.isGuest && !l && "modifyHeaders" == e.action.type && (null != d && 0 < a.cookies.length ? e.action.requestHeaders.push({header:"Cookie", operation:"set", value:d}) : e.action.requestHeaders.push({header:"Cookie", operation:"remove"}));
          a.isGuest && c && (e.action.responseHeaders = [{header:"Set-Cookie", operation:"remove"}]);
        }
        try {
          try {
            await DNR.deleteAllRules();
          } catch (l) {
            common.reportBug(l, "Error deleteAllRules.");
            return;
          }
          if (a.isGuest) {
            a.userSession = "";
            var g = {excludedInitiatorDomains:[chrome.runtime.id], isUrlFilterCaseSensitive:!1, urlFilter:"||amazon." + getTldByDomain(a.domainId), resourceTypes:"main_frame sub_frame csp_report font image media object other ping script stylesheet webbundle websocket webtransport xmlhttprequest".split(" ")};
            a.userCookies = await chrome.cookies.getAll({url:a.url});
            if (0 < a.userCookies.length) {
              var k = cloud.getSessionId(a.userCookies);
              if (k && 0 < k.length) {
                if (cloud.getSessionId(a.cookies) == k) {
                  throw "pre r; u s is r c s: " + k + " : " + a.userSession + " - " + a.url + "  sc active: " + (0 == lastSellerActivity ? "never" : (new Date(lastSellerActivity)).toISOString().substring(0, 19)) + " c active: " + (0 == lastContentActivity ? "never" : (new Date(lastContentActivity)).toISOString().substring(0, 19));
                }
                a.userSession = k;
              }
              c || a.dnr.push({priority:108107, action:{type:"modifyHeaders", requestHeaders:[{header:"Cookie", operation:"set", value:cookieToString(a.userCookies)}], responseHeaders:[{header:"Set-Cookie", operation:"remove"}]}, condition:g});
            } else {
              c || a.dnr.push({priority:108107, action:{type:"modifyHeaders", requestHeaders:[{header:"Cookie", operation:"remove"}], responseHeaders:[{header:"Set-Cookie", operation:"remove"}]}, condition:g});
            }
          }
          const [m, e] = DNR.addSessionRules(a.dnr);
          try {
            await m;
          } catch (l) {
            common.reportBug(l, "Error dnrPromise.");
            return;
          }
          var h = "object" === typeof a.urls;
          g = null;
          try {
            if (a.isGuest && (settings.userCookies["" + a.domainId] = a.userCookies, await chrome.storage.local.set({userCookies:await compressObject(settings.userCookies)}), !c)) {
              k = [];
              if (null != a.cookies) {
                for (f = 0; f < a.cookies.length; ++f) {
                  let n = a.cookies[f];
                  try {
                    n.expirationDate = Number(b + 180 + ".108108");
                  } catch (p) {
                    console.error(p);
                  }
                  "sp-cdn" != n.name && k.push(n);
                }
              } else {
                k = null;
              }
              await swapCookies(a.url, a.userCookies, k);
            }
            let l = n => {
              hasWebRequestPermission && (interceptedExtensionCookies[n] = {promise:null, resolve:null}, interceptedExtensionCookies[n].promise = new Promise(p => {
                interceptedExtensionCookies[n].resolve = p;
              }), setTimeout(() => {
                delete interceptedExtensionCookies[n];
              }, 60000));
            };
            if (h) {
              a.url = a.urls[0];
              a.urls.forEach(p => l(p));
              a.responses = {};
              const n = a.urls.map(async p => {
                let r = await fetch(p, a.fetch);
                a.responses[p] = {headers:{}, text:"", status:0};
                a.responses[p].text = await r.text();
                for (let q of r.headers.entries()) {
                  a.responses[p].headers[q[0]] = q[1];
                }
                a.responses[p].status = r.status;
              });
              await Promise.all(n);
            } else {
              l(a.url);
              g = await fetch(a.url, a.fetch);
              if (!delayedFetch || c) {
                a.response.text = await g.text();
              }
              for (let n of g.headers.entries()) {
                a.response.headers[n[0]] = n[1];
              }
              a.response.status = g.status;
            }
          } catch (l) {
            console.log(l, "Fetch: " + a.url);
          } finally {
            delete a.dnr;
            delete a.fetch;
            if (a.isGuest) {
              let l = await chrome.cookies.getAll({url:a.url}), n = cloud.getSessionId(l);
              if (c) {
                let p = [], r = [];
                if (hasWebRequestPermission) {
                  if (h) {
                    a.urls.forEach(async q => {
                      q = await waitForCookies(q, 2000);
                      null != q && (p.push(q.request), 0 < q.cookies.length && r.concat(q.cookies));
                    });
                  } else {
                    let q = await waitForCookies(a.url, 2000);
                    null != q && (r = q.cookies, p.push(q.request));
                  }
                }
                try {
                  0 < p.length && 302 == p[0].statusCode && (a.response.redirectUrl = p[0].responseHeaders.find(q => "location" === q.name.toLowerCase())?.value ?? null);
                } catch (q) {
                  console.log(q);
                }
                h = null;
                if (r && 0 < r.length) {
                  let q = updateCookies(a.cookies, r);
                  a.response.cookies = q;
                  h = cloud.getSessionId(a.response.cookies);
                  h == a.userSession || n == h ? await handleGuestSession(a, l) : "" != h ? "undefined" === typeof settings.extensionCookies["" + a.domainId] || null == settings.extensionCookies["" + a.domainId] ? settings.extensionCookies["" + a.domainId] = {cookies:a.response.cookies, createDate:Date.now()} : (settings.extensionCookies["" + a.domainId].cookies = a.response.cookies, settings.extensionCookies["" + a.domainId].createDate = Date.now()) : delete settings.extensionCookies["" + a.domainId];
                } else {
                  a.response.cookies = a.cookies;
                }
              } else {
                a.response.cookies = l, n != a.userSession || "" == n && "" == a.userSession ? ("" != n ? "undefined" === typeof settings.extensionCookies["" + a.domainId] ? settings.extensionCookies["" + a.domainId] = {cookies:a.response.cookies, createDate:Date.now()} : (settings.extensionCookies["" + a.domainId].cookies = a.response.cookies, settings.extensionCookies["" + a.domainId].createDate = Date.now()) : (delete settings.extensionCookies["" + a.domainId], delete common.addToCartAssocCsrfs[a.domainId]), 
                await swapCookies(a.url, a.response.cookies, a.userCookies)) : await handleGuestSession(a, l);
              }
            }
            delete settings.userCookies["" + a.domainId];
            await updateLocalStorage();
            await DNR.deleteSessionRules(e);
            delayedFetch && !c && null != g && (a.response.text = await g.text());
            delete interceptedExtensionCookies[a.url];
          }
        } catch (m) {
          a.response.cookies = null, a.response.text = null, a.response.status = 901, delete settings.extensionCookies["" + a.domainId], delete common.addToCartAssocCsrfs[a.domainId], delete settings.userCookies["" + a.domainId], await chrome.storage.local.set({extensionCookies:await compressObject(settings.extensionCookies), userCookies:await compressObject(settings.userCookies)}), await DNR.deleteAllRules(), common.reportBug(m, "rCatch: " + a.url);
        }
      }
    }
  }
}, init = () => {
  isFirefox ? chrome.storage.local.get(["install", "optOutCookies"], a => {
    a.optOutCookies && 3456E5 > Date.now() - a.optOutCookies || (a.install ? common?.register() : chrome.tabs.create({url:chrome.runtime.getURL("chrome/content/onboard.html")}));
  }) : common?.register();
  chrome.storage.local.get(["installTimestamp"], a => {
    a.installTimestamp && 12 < (a.installTimestamp + "").length ? installTimestamp = a.installTimestamp : (installTimestamp = Date.now(), chrome.storage.local.set({installTimestamp}));
  });
}, restoreUserCookies = async() => {
  try {
    for (let a = 0; a < settings.userCookies.length; a++) {
      const c = settings.userCookies[a];
      if (c) {
        const b = "https://www.amazon." + getTldByDomain(a);
        await swapCookies(b, settings.extensionCookies[a]?.cookies || [], c);
        delete settings.userCookies["" + a];
        await chrome.storage.local.set({userCookies:await compressObject(settings.userCookies)});
      }
    }
  } catch (a) {
    common.reportBug(a, "restoreUserCookies");
  }
};
async function decompress(a, c) {
  c = new DecompressionStream("deflate" + (c ? "-raw" : ""));
  let b = c.writable.getWriter();
  b.write(a);
  b.close();
  return await (new Response(c.readable)).arrayBuffer().then(function(f) {
    return (new TextDecoder()).decode(f);
  });
}
async function compress(a, c) {
  c = new CompressionStream("deflate" + (c ? "-raw" : ""));
  let b = c.writable.getWriter();
  b.write((new TextEncoder()).encode(a));
  b.close();
  a = await (new Response(c.readable)).arrayBuffer();
  return new Uint8Array(a);
}
async function compressObject(a) {
  try {
    let c = await compress(JSON.stringify(a), !0);
    return btoa(String.fromCharCode.apply(null, c));
  } catch (c) {
    return console.error("An error occurred:", c), null;
  }
}
async function decompressObject(a) {
  a = Uint8Array.from(atob(a), c => c.charCodeAt(0));
  return JSON.parse(await decompress(a, !0));
}
chrome.storage.local.set({lastActivated:Date.now()}, () => {
  chrome.storage.local.get(null, async a => {
    try {
      "undefined" != typeof a && (settings = a);
      if (settings.extensionCookies) {
        try {
          settings.extensionCookies = await decompressObject(settings.extensionCookies);
        } catch (c) {
          common.reportBug(c, "1 " + JSON.stringify(a)), settings.extensionCookies = [];
        }
      } else {
        settings.extensionCookies = [];
      }
      if (!hasWebRequestPermission && settings.userCookies) {
        try {
          settings.userCookies = await decompressObject(settings.userCookies), restoreUserCookies();
        } catch (c) {
          common.reportBug(c, "3 " + JSON.stringify(a)), settings.userCookies = [];
        }
      } else {
        settings.userCookies = [];
      }
      init();
      settings.stockCookies && chrome.storage.local.remove("stockCookies");
      settings.guestCookies && chrome.storage.local.remove("guestCookies");
    } catch (c) {
      common.reportBug(c, "4 " + JSON.stringify(a));
    }
  });
});
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();
let lifeline = null;
self.onactivate = a => {
};
chrome.alarms.clearAll();
chrome.alarms.create("keepAlive", {periodInMinutes:1});
chrome.alarms.onAlarm.addListener(a => {
  chrome.storage.local.get(["lastActivated"], c => {
  });
});
function getAmazonUrlPatterns() {
  const {host_permissions:a = []} = chrome.runtime.getManifest();
  return a.filter(c => /amazon\./.test(c) || /amzn\.com/.test(c));
}
let asinCache = {}, lastSellerActivity = 0, lastContentActivity = 0, asinCacheSize = 0;
chrome.runtime.onMessage.addListener((a, c, b) => {
  var f = Date.now();
  lastActivity = f;
  if (c.tab && c.tab.url || c.url) {
    switch(a.type) {
      case "restart":
        chrome.runtime.reload();
        break;
      case "refreshAmazonTabs":
        return (async() => {
          var k = getAmazonUrlPatterns();
          k = await chrome.tabs.query({url:k});
          const h = ["/dp/*", "/*/dp/*", "/gp/product/*", "/*ASIN*"];
          for (const m of k) {
            m && null != m.id && !m.incognito && "string" === typeof m.url && h.some(e => {
              try {
                const l = new URL(m.url);
                return "/dp/*" === e ? /\/dp\//.test(l.pathname) : "/*/dp/*" === e ? /\/.+\/dp\//.test(l.pathname) : "/gp/product/*" === e ? /\/gp\/product\//.test(l.pathname) : "/*ASIN*" === e ? /[?&]ASIN=/.test(l.search) : !1;
              } catch {
                return !1;
              }
            }) && chrome.tabs.reload(m.id, {bypassCache:!0});
          }
          b();
        })(), !0;
      case "fetchGraph":
        return (async() => {
          try {
            const m = await fetch(a.url, {cache:"force-cache"}), e = (m.headers.get("Screenshot-Status") || "").toUpperCase(), l = "FAIL" === e;
            if (!m.ok || l) {
              b({ok:!1, status:l ? 0 : m.status});
            } else {
              var k = await m.arrayBuffer(), h = btoa(String.fromCharCode(...(new Uint8Array(k))));
              b({ok:!0, dataUrl:`data:image/png;base64,${h}`, headers:{"Screenshot-Status":e}});
            }
          } catch (m) {
            b({ok:!1, status:"number" === typeof m ? m : 0});
          }
        })(), !0;
      case "setCookie":
        chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:a.key, value:a.val, secure:!0, expirationDate:(Date.now() / 1000 | 0) + 31536E3});
        "token" == a.key ? settings?.token != a.val && 64 == a.val.length && (settings.token = a.val, chrome.storage.local.set({token:a.val}), chrome.tabs.query({}, k => {
          try {
            k.forEach(h => {
              try {
                h.url && !h.incognito && chrome.tabs.sendMessage(h.id, {key:"updateToken", value:settings.token});
              } catch (m) {
                console.log(m);
              }
            });
          } catch (h) {
            console.log(h);
          }
        })) : (settings[a.key] = a.val, chrome.storage.local.set({[a.key]:a.val}));
        break;
      case "getCookie":
        return chrome.cookies.get({url:"https://keepa.com/extension", name:a.key}, k => {
          null == k ? b({value:null, install:installTimestamp}) : b({value:k.value, install:installTimestamp});
        }), !0;
      case "openPage":
        0 == a.url.indexOf("https://dyn.keepa.com") && chrome.windows.create({url:a.url, incognito:!0});
        break;
      case "isPro":
        common.stockData ? b({value:common.stockData.pro, stockData:common.stockData, amazonSellerIds:AmazonSellerIds, warehouseSellerIds:WarehouseDealsSellerIds}) : b({value:null});
        break;
      case "getStock":
        if (null == common.stockData.stock) {
          console.log("stock retrieval not initialized");
          b({error:"stock retrieval not initialized", errorCode:0});
          break;
        }
        if (0 == common.stockData.stockEnabled[a.domainId]) {
          console.log("stock retrieval not supported for domain");
          b({error:"stock retrieval not supported for domain", errorCode:1});
          break;
        }
        if (!0 !== common.stockData.pro && !a.force) {
          console.log("stock retrieval not pro");
          b({error:"stock retrieval failed, not subscribed", errorCode:2});
          break;
        }
        if (!a.offscreen) {
          return b({stock:a.maxQty, limit:!1, isMaxQty:a.maxQty >= common.stockData.stockMaxQty});
        }
        if (null == a.oid) {
          b({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " missing oid.", errorCode:12});
          break;
        }
        if (null == a.sellerId) {
          b({error:"Unable to retrieve stock for this offer. ", errorCode:45});
          break;
        }
        c = f - lastSellerActivity < sellerLockoutDuration && (!settings.extensionCookies[a.domainId] || a.getNewId);
        if ((a.offscreen ? common.stockData.cartDisabledOffscreen : common.stockData.cartDisabled) || a.onlyMaxQty && !a.isMAP || c) {
          b({stock:a.maxQty, limit:!1, isMaxQty:a.maxQty});
          break;
        }
        a.cachedStock = {stock:a.maxQty, limit:!1, isMaxQty:a.maxQty};
        let g = a.offscreen && !common.stockData.cartOffscreenBatch ? common.addStockJobSequential : common.addStockJob;
        g(a, k => {
          if (k.errorCode && 0 < k.errorCode && a.cachedStock && 430 != k.errorCode) {
            a.cachedStock.errorCode = k.errorCode, a.cachedStock.error = k.error, b(a.cachedStock);
          } else {
            if (5 != k.errorCode && 429 != k.errorCode && 430 != k.errorCode && 9 != k.errorCode || a.offscreen) {
              b(k);
            } else {
              if (9 == k.errorCode || 430 == k.errorCode) {
                a.getNewId = !0;
              }
              setTimeout(() => {
                g(a, b);
              }, 1);
            }
          }
        });
        return !0;
      case "getFilters":
        b({value:cloud.getFilters()});
        break;
      case "isSellerActive":
        lastSellerActivity = Date.now();
        b({});
        break;
      case "isActive":
        6E5 < f - lastContentActivity && webSocketObj.sendPlainMessage({key:"m1", payload:["c0"]});
        lastActivity = lastContentActivity = f;
        b({});
        break;
      case "sendData":
        c = a.val;
        if (null != c.ratings) {
          if (console.log("sendData", c.ratings), f = c.ratings, 1000 > asinCacheSize) {
            if ("f1" == c.key) {
              if (f) {
                let k = f.length;
                for (; k--;) {
                  var d = f[k];
                  null == d || null == d.asin ? f.splice(k, 1) : (d = c.domainId + d.asin + d.ls, asinCache[d] ? f.splice(k, 1) : (asinCache[d] = 1, asinCacheSize++));
                }
                0 < f.length && webSocketObj.sendPlainMessage(c);
              }
            } else {
              webSocketObj.sendPlainMessage(c);
            }
          } else {
            asinCache = {}, asinCacheSize = 0;
          }
        } else {
          webSocketObj.sendPlainMessage(c);
        }
        b({});
        break;
      default:
        b({});
    }
  }
});
try {
  chrome.action.onClicked.addListener(function(a) {
    chrome.tabs.create({url:"https://keepa.com/#!manage"});
  });
} catch (a) {
  console.log(a);
}
try {
  chrome.contextMenus.removeAll(), chrome.contextMenus.create({title:"View products on Keepa", contexts:["page"], id:"keepaContext", documentUrlPatterns:"*://*.amazon.com/* *://*.amzn.com/* *://*.amazon.co.uk/* *://*.amazon.de/* *://*.amazon.fr/* *://*.amazon.it/* *://*.amazon.ca/* *://*.amazon.com.mx/* *://*.amazon.es/* *://*.amazon.co.jp/* *://*.amazon.in/*".split(" ")}), chrome.contextMenus.onClicked.addListener((a, c) => {
    chrome.tabs.sendMessage(c.id, {key:"collectASINs"}, {}, b => {
      "undefined" != typeof b && chrome.tabs.create({url:"https://keepa.com/#!viewer/" + encodeURIComponent(JSON.stringify(b))});
    });
  });
} catch (a) {
  console.error(a);
}
const common = {version:chrome.runtime.getManifest().version, Guid:function() {
  const a = function(b, f, d) {
    return b.length >= f ? b : a(d + b, f, d || " ");
  }, c = function() {
    let b = (new Date()).getTime();
    return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/x/g, function(f) {
      const d = (b + 16 * Math.random()) % 16 | 0;
      b = Math.floor(b / 16);
      return ("x" === f ? d : d & 7 | 8).toString(16);
    });
  };
  return {newGuid:function() {
    var b = "undefined" != typeof self.crypto.getRandomValues;
    if ("undefined" != typeof self.crypto && b) {
      b = new self.Uint16Array(16);
      self.crypto.getRandomValues(b);
      var f = "";
      for (g in b) {
        var d = b[g].toString(16);
        d = a(d, 4, "0");
        f += d;
      }
      var g = f;
    } else {
      g = c();
    }
    return g;
  }};
}(), register:async function() {
  chrome.cookies.onChanged.addListener(b => {
    b.removed || null == b.cookie || "keepa.com" != b.cookie.domain || "/extension" != b.cookie.path || ("token" == b.cookie.name ? settings.token != b.cookie.value && 64 == b.cookie.value.length && (settings.token = b.cookie.value, chrome.tabs.query({}, f => {
      try {
        f.forEach(d => {
          try {
            d.url && !d.incognito && chrome.tabs.sendMessage(d.id, {key:"updateToken", value:settings.token});
          } catch (g) {
            console.log(g);
          }
        });
      } catch (d) {
        console.log(d);
      }
    })) : common.set(b.cookie.name, b.cookie.value));
  });
  let a = !1, c = async b => {
    for (let f = 0; f < b.length; f++) {
      const d = b[f];
      try {
        const g = await chrome.cookies.get({url:"https://keepa.com/extension", name:d});
        if (chrome.runtime.lastError && -1 < chrome.runtime.lastError.message.indexOf("No host permission")) {
          a || (a = !0, common.reportBug(null, "extensionPermission restricted ### " + chrome.runtime.lastError.message));
          break;
        }
        null != g && null != g.value && 0 < g.value.length && common.set(d, g.value);
      } catch (g) {
        console.log(g);
      }
    }
  };
  c(settingKeys);
  try {
    const b = await chrome.cookies.get({url:"https://keepa.com/extension", name:"token"});
    if (null != b && 64 == b.value.length) {
      settings.token = b.value, common.set("token", settings.token);
    } else {
      let f = (Date.now() / 1000 | 0) + 31536E3;
      chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"optOut_crawl", value:"0", secure:!0, expirationDate:f});
      chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"revealStock", value:"1", secure:!0, expirationDate:f});
      chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"s_boxType", value:"0", secure:!0, expirationDate:f});
      chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"s_boxOfferListing", value:"1", secure:!0, expirationDate:f});
      chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"s_boxHorizontal", value:"0", secure:!0, expirationDate:f});
      chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"webGraphType", value:"[1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]", secure:!0, expirationDate:f});
      chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"webGraphRange", value:"180", secure:!0, expirationDate:f});
      chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"overlayPriceGraph", value:"0", secure:!0, expirationDate:f});
      c(settingKeys);
      common.storage.get("token", function(d) {
        d = d.token;
        settings.token = d && 64 == d.length ? d : common.Guid.newGuid();
        chrome.cookies.set({url:"https://keepa.com", path:"/extension", name:"token", value:settings.token, secure:!0, expirationDate:f});
      });
    }
  } catch (b) {
    common.reportBug(b, "get token cookie");
  }
  isFirefox ? common.set("addonVersionFirefox", common.version) : common.set("addonVersionChrome", common.version);
  try {
    chrome.runtime.setUninstallURL("https://dyn-2.keepa.com/app/stats/?type=uninstall&version=" + type + "." + common.version);
  } catch (b) {
  }
  webSocketObj.initWebSocket();
}, storage:chrome.storage.local, parseCookieHeader:(a, c) => {
  if (0 < c.indexOf("\n")) {
    c = c.split("\n");
    a: for (var b = 0; b < c.length; ++b) {
      var f = c[b].substring(0, c[b].indexOf(";")), d = f.indexOf("=");
      f = [f.substring(0, d), f.substring(d + 1)];
      if (2 == f.length && "-" != f[1]) {
        for (d = 0; d < a.length; ++d) {
          if (a[d][0] == f[0]) {
            a[d][1] = f[1];
            continue a;
          }
        }
        a.push(f);
      }
    }
  } else {
    if (c = c.substring(0, c.indexOf(";")), b = c.indexOf("="), c = [c.substring(0, b), c.substring(b + 1)], 2 == c.length && "-" != c[1]) {
      for (b = 0; b < a.length; ++b) {
        if (a[b][0] == c[0]) {
          a[b][1] = c[1];
          return;
        }
      }
      a.push(c);
    }
  }
}, stockRequest:[], stockData:null, stockJobQueue:[], stockJobQueueSingle:[], addStockJobSequential:(a, c) => {
  a.gid = common.Guid.newGuid().substr(0, 8);
  a.requestType = -1;
  let b = !1, f = g => {
    b || (b = !0, clearTimeout(d), g.error && delete common.addToCartAssocCsrfs[a.domainId], common.stockJobQueueSingle.shift(), c(g), 0 < common.stockJobQueueSingle.length && (stockDelay ? setTimeout(() => {
      common.processStockJob(common.stockJobQueueSingle[0][0], null, null, null, common.stockJobQueueSingle[0][1]);
    }, stockDelay) : common.processStockJob(common.stockJobQueueSingle[0][0], null, null, null, common.stockJobQueueSingle[0][1])));
  }, d = setTimeout(() => {
    f({error:"stock retrieval timeout", errorCode:408});
  }, a.offscreen ? 5000 : 0 == common.stockJobQueueSingle.length ? 16000 : Math.min(3000 * common.stockJobQueueSingle.length, 60000));
  common.stockJobQueueSingle.push([a, f]);
  1 == common.stockJobQueueSingle.length && common.processStockJob(a, null, null, null, f);
}, batchTimer:null, batchProcessing:!1, addStockJob:(a, c) => {
  a.gid = common.Guid.newGuid().substr(0, 8);
  a.requestType = -1;
  let b = !1, f = g => {
    b || (b = !0, clearTimeout(d), c(g));
  }, d = setTimeout(() => {
    f({error:"stock retrieval timeout", errorCode:408});
  }, a.offscreen ? 5000 : 0 == common.stockJobQueue.length ? 16000 : Math.min(15000 + 6000 * common.stockJobQueue.length, 60000));
  common.stockJobQueue.push({request:a, hook:f});
  common.batchProcessing || (common.batchProcessing = !0, common.batchTimer = setTimeout(() => {
    common.processBatch();
  }, 100));
}, processBatch:() => {
  if (0 == common.stockJobQueue.length) {
    common.batchProcessing = !1;
  } else {
    var a = common.stockJobQueue;
    common.stockJobQueue = [];
    var c = {}, b = [], f = [];
    a.forEach(m => {
      let e = `${m.request.sellerId || "defaultSellerId"}_${m.request.asin || "defaultAsin"}`;
      c[e] ? m.request.offscreen ? m.hook({error:"stock dup", errorCode:444}) : f.push(m) : (c[e] = !0, b.push(m));
    });
    common.stockJobQueue.push(...f);
    a = b.map(m => m.request);
    var d = b.map(m => m.hook), g = b.map(m => m.request.asin), k = b.map(m => m.request.oid), h = b.map(m => m.request.sellerId);
    common.processStockJob(a[0], k, g, h, m => {
      try {
        m.forEach((e, l) => {
          d[l](e);
        });
      } catch (e) {
        d.forEach((l, n) => {
          d[n](m);
        });
      }
      0 < common.stockJobQueue.length ? common.processBatch() : common.batchProcessing = !1;
    });
  }
}, removeHeadersForUserRequest:(a, c) => {
  if (c) {
    var b = ["sec-ch-ua-platform", "sec-ch-ua", "user-agent", "sec-ch-ua-mobile"];
    a.dnr[0].action.requestHeaders = a.dnr[0].action.requestHeaders.filter(f => !b.includes(f.header.toLowerCase()));
  }
}, addToCartAjax:(a, c, b) => {
  let f = !1, d = !1, g = 0, k = cloud.getSessionId(a.cookies);
  k && (f = !0, k != a.session && (d = !0, g = k));
  if (f && d) {
    var h = structuredClone(common.stockData.addCart);
    h.isStock = !0;
    h.userSession = a.session;
    h.csrf = a.csrf;
    h.atcCsrf = a.atcCsrf;
    h.slateToken = a.slateToken;
    h.originHost = a.host;
    h.domainId = a.domainId;
    b || (h.url = h.url.replaceAll("{SESSION_ID}", g).replaceAll("{TLD}", getTldByDomain(a.domainId)).replaceAll("{OFFER_ID}", a.oid).replaceAll("{MARKETPLACE}", common.stockData.marketplaceIds[a.domainId]).replaceAll("{ADDCART}", encodeURIComponent(common.stockData.stockAdd[a.domainId])).replaceAll("{ASIN}", a.asin));
    h.language = common.stockData.languageCode[a.domainId];
    h.referer = common.stockData.isMobile ? "https://" + a.host + "/gp/aw/d/" + a.asin + "/" : a.referer;
    h.cookies = a.cookies;
    h.fetch.body = h.fetch.body.replaceAll("{SESSION_ID}", g).replaceAll("{CSRF}", encodeURIComponent(a.csrf)).replaceAll("{OFFER_ID}", a.oid).replaceAll("{ADDCART}", encodeURIComponent(common.stockData.stockAdd[a.domainId])).replaceAll("{ASIN}", a.asin);
    requestQueue.enqueue(() => processRequest(h)).then(async() => {
      const m = h.response?.text, e = h.response?.status;
      if (null == m) {
        a.cookies = null, common.stockData.domainId = -1, c({error:"(" + e + ") Stock retrieval failed for this offer. Try reloading the page or restarting your browser if the issue persists. ", errorCode:66});
      } else {
        try {
          if (422 == e || 200 == e) {
            let l = JSON.parse(m), n = (new RegExp(common.stockData.limit)).test(JSON.stringify(l.entity.items[0].responseMessage));
            c({stock:l.entity.items[0].quantity, orderLimit:-1, limit:n, price:-3, location:null, type:1});
          } else {
            c({error:"Stock retrieval failed for this offer. Try reloading the page after a while. ", errorCode:e});
          }
        } catch (l) {
          a.error = l, console.error("request failed", l), c({error:"An error occurred during stock retrieval", errorCode:500}), common.reportBug(l, "5 stock error - " + JSON.stringify(asins));
        }
      }
    }).catch(m => {
      a.error = m;
      console.error("request failed", m);
      c({error:"An error occurred during stock retrieval", errorCode:501});
      common.reportBug(m, "6 stock error - " + JSON.stringify(asins));
    });
  } else {
    common.reportBug(null, "stock session issue: " + f + " " + d + " c: " + JSON.stringify(a.cookies) + " " + JSON.stringify(a)), c({error:"stock session issue: " + f + " " + d, errorCode:4});
  }
}, addToCartAssocCsrfs:[], deleteExtensionCookies:async a => {
  delete common.addToCartAssocCsrfs[a];
  delete settings.extensionCookies[a];
  await chrome.storage.local.set({extensionCookies:await compressObject(settings.extensionCookies)});
}, addToCartAssoc:(a, c, b, f, d) => {
  let g = structuredClone(common.stockData.createCart);
  g.isStock = !0;
  g.userSession = a.session;
  g.originHost = a.host;
  g.domainId = a.domainId;
  g.language = common.stockData.languageCode[a.domainId];
  g.cookies = a.cookies;
  g.url = g.url.replaceAll("{TLD}", getTldByDomain(a.domainId)).replaceAll("{TAG}", common.stockData.tags[a.domainId]);
  g.url += "&Quantity.1=1&ASIN.1=" + a.asin;
  common.addToCartAssocCsrfs[a.domainId] ? common.addToCartAssocWithCsrf(a, c, b, f, d, common.addToCartAssocCsrfs[a.domainId], g.url) : requestQueue.enqueue(() => processRequest(g)).then(async() => {
    let k = g.response?.text, h = g.response?.status;
    if (null == k || 200 != h) {
      a.cookies = null, common.stockData.domainId = -1, common.deleteExtensionCookies(a.domainId), d({error:"(" + h + ") Stock retrieval failed for this offer. Try reloading the page or restarting your browser if the issue persists", errorCode:65});
    } else {
      try {
        let m = k.match(new RegExp(common.stockData.csrfAssoc));
        if (null != m) {
          m = m[1];
          let e = a.domainId;
          common.addToCartAssocCsrfs[e] = m;
          setTimeout(() => {
            delete common.addToCartAssocCsrfs[e];
          }, 6E5);
          common.addToCartAssocWithCsrf(a, c, b, f, d, m, g.url);
        } else {
          d({error:"Stock retrieval failed for this offer. Try reloading the page after a while. ", errorCode:h});
        }
      } catch (m) {
        a.error = m, console.error("request failed", m), d({error:"An error occurred during stock retrieval", errorCode:502}), common.reportBug(m, "4 stock error - " + JSON.stringify(b));
      }
    }
  }).catch(k => {
    a.error = k;
    console.error("cc request failed", k);
    d({error:"An error occurred during stock retrieval", errorCode:503});
    common.reportBug(k, "3 stock error - " + JSON.stringify(b));
  });
}, addToCartAssocWithCsrf:(a, c, b, f, d, g, k) => {
  let h = structuredClone(common.stockData.addCartAssoc);
  h.isStock = !0;
  h.userSession = a.session;
  h.originHost = a.host;
  h.domainId = a.domainId;
  h.language = common.stockData.languageCode[a.domainId];
  h.referer = k;
  h.cookies = a.cookies;
  k = "";
  for (var m = 0; m < c.length; m++) {
    var e = m + 1;
    k += "OfferListingId." + e + "=" + encodeURIComponent(c[m]) + "&";
    k += "ASIN." + e + "=" + encodeURIComponent(b[m]) + "&";
    k += "Quantity." + e + "=" + common.stockData.stockQty + "&";
  }
  k += "anti-csrftoken-a2z=" + encodeURIComponent(g);
  h.fetch.body = k;
  h.fetch.redirect = "follow";
  h.url = h.url.replaceAll("{TLD}", getTldByDomain(a.domainId));
  requestQueue.enqueue(() => processRequest(h)).then(async() => {
    let l = h.response?.text;
    if (200 != h.response?.status) {
      a.cookies = null, common.stockData.domainId = -1, common.deleteExtensionCookies(a.domainId), d({error:"Stock retrieval failed for this offer. Try reloading the page or restarting your browser if the issue persists. ", errorCode:165});
    } else {
      try {
        let p = [], r = !1;
        for (let q = 0; q < b.length; q++) {
          const t = b[q], u = f[q], v = (new RegExp(`<div[^>]*\\bdata-asin="${t}"[^>]*?(?=.*\\bdata-price="([^"]+)")(?=.*\\bdata-quantity="([^"]+)")(?=.*\\bdata-itemid="([^"]+)")[^]{10,2300}smid=${u}`, "i")).exec(l);
          if (v && !r) {
            const z = parseNumberFormat(v[1]);
            let w = parseInt(v[2]);
            const x = v[3];
            var n = null;
            if (a.offscreen) {
              const y = (new RegExp(common.stockData.stockLocation, "i")).exec(l);
              y && (n = y[1]);
            }
            "undefined" == typeof settings.extensionCookies[a.domainId].cartCache && (settings.extensionCookies[a.domainId].cartCache = []);
            settings.extensionCookies[a.domainId].cartCache[x] && (w = settings.extensionCookies[a.domainId].cartCache[x]);
            1000 < w ? (common.deleteExtensionCookies(a.domainId), p.push({asin:t, sellerId:u, errorCode:535, error:"Offer not found"}), r = !0) : (n = {asin:t, sellerId:u, dataItemId:x, stock:w, orderLimit:-1, limit:!1, price:z, type:2, location:n}, settings.extensionCookies[a.domainId].cartCache[x] = w, p.push(n));
          } else {
            p.push({asin:t, sellerId:u, errorCode:535, error:"Offer not found"});
          }
        }
        chrome.storage.local.set({extensionCookies:await compressObject(settings.extensionCookies)});
        d(p);
      } catch (p) {
        a.error = p, console.error("request failed", p), d({error:"An error occurred during stock retrieval", errorCode:505}), common.reportBug(p, "1 stock error - " + JSON.stringify(b));
      }
    }
  }).catch(l => {
    a.error = l;
    console.error("request failed", l);
    d({error:"An error occurred during stock retrieval", errorCode:506});
    common.reportBug(l, "2 stock error - " + JSON.stringify(b));
  });
}, processStockJob:async(a, c, b, f, d) => {
  Date.now();
  let g = !a.offscreen || common.stockData.cartOffscreenBatch;
  a.queue = [async() => {
    g ? common.addToCartAssoc(a, c, b, f, d) : common.addToCartAjax(a, d, g);
  }];
  a.getNewId && (common.stockData.geoRetry && common.deleteExtensionCookies(a.domainId), a.queue.unshift(async() => {
    let h = structuredClone(common.stockData.geo);
    h.userSession = a.session;
    h.isStock = !0;
    h.domainId = a.domainId;
    settings.extensionCookies[a.domainId]?.cookies && (h.cookies = settings.extensionCookies[a.domainId].cookies);
    h.url = "https://" + common.stockData.offerUrl.replace("{ORIGIN}", a.host).replace("{ASIN}", a.asin).replace("{SID}", a.sellerId);
    h.language = common.stockData.languageCode[a.domainId];
    requestQueue.enqueue(async() => processRequest(h)).then(async() => {
      if (h.response.text.match(common.stockData.sellerIdBBVerify.replace("{SID}", a.sellerId))) {
        var m = null;
        for (var e = 0; e < common.stockData.csrfBB.length; e++) {
          var l = h.response.text.match(new RegExp(common.stockData.csrfBB[e]));
          if (null != l && l[1]) {
            m = l[1];
            break;
          }
        }
        if (m) {
          a.csrf = m;
          m = null;
          for (e = 0; e < common.stockData.offerIdBB.length; e++) {
            if (l = h.response.text.match(new RegExp(common.stockData.offerIdBB[e])), null != l && l[1]) {
              m = l[1];
              break;
            }
          }
          if (m) {
            a.oid = m;
            a.callback();
            return;
          }
        }
      }
      common.deleteExtensionCookies(a.domainId);
      d({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " mismatch oid.", errorCode:10});
    }).catch(async m => {
      a.error = m;
      common.deleteExtensionCookies(a.domainId);
      d({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " mismatch oid.", errorCode:101});
      console.error("request failed", m);
    });
  }));
  a.callback = () => {
    const h = a.queue.shift();
    h ? h() : d({error:"callback queue empty", errorCode:509});
  };
  if (settings.extensionCookies[a.domainId] && 288E5 > Date.now() - settings.extensionCookies[a.domainId].createDate && 1729806460708 < settings.extensionCookies[a.domainId].createDate) {
    a.cookies = settings.extensionCookies[a.domainId].cookies, a.callback();
  } else {
    var k = common.stockData.zipCodes[a.domainId];
    if (common.stockData.domainId == a.domainId) {
      a.requestType = 3;
      let h = structuredClone(common.stockData.addressChange);
      h.userSession = a.session;
      h.isStock = !0;
      h.domainId = a.domainId;
      h.url = "https://" + a.host + h.url;
      h.csrf = "";
      h.language = common.stockData.languageCode[a.domainId];
      h.fetch.body = h.fetch.body.replace("{ZIPCODE}", k);
      requestQueue.enqueue(() => processRequest(h)).then(() => {
        a.cookies = h.response.cookies;
        a.callback();
      }).catch(m => {
        a.error = m;
        d({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " main.", errorCode:73});
        console.error("request failed", m);
      });
    } else {
      let h = structuredClone(common.stockData.geo);
      h.userSession = a.session;
      h.isStock = !0;
      h.url = "https://" + a.host + h.url;
      h.language = common.stockData.languageCode[a.domainId];
      h.domainId = a.domainId;
      requestQueue.enqueue(() => processRequest(h)).then(async() => {
        let m = h.response.text;
        var e = m?.match(new RegExp(common.stockData.csrfGeo));
        null != e && (h.csrf = e[1]);
        if (200 == h.response.status) {
          let l = structuredClone(common.stockData.setAddress);
          l.userSession = a.session;
          l.domainId = a.domainId;
          l.isStock = !0;
          l.referer = h.url;
          l.url = "https://" + a.host + l.url;
          l.language = common.stockData.languageCode[a.domainId];
          l.csrf = h.csrf;
          l.cookies = h.response.cookies;
          requestQueue.enqueue(() => processRequest(l)).then(() => {
            let n = structuredClone(common.stockData.addressChange);
            n.referer = h.url;
            n.userSession = a.session;
            n.domainId = a.domainId;
            l.isStock = !0;
            n.url = "https://" + a.host + n.url;
            n.language = common.stockData.languageCode[a.domainId];
            m = l.response.text;
            let p = m?.match(new RegExp(common.stockData.csrfSetAddress));
            null != p && (n.csrf = p[1]);
            n.cookies = l.response.cookies;
            n.fetch.body = n.fetch.body.replace("{ZIPCODE}", k);
            a.requestType = 3;
            requestQueue.enqueue(() => processRequest(n)).then(() => {
              a.cookies = n.response.cookies;
              a.callback();
            }).catch(async r => {
              a.error = r;
              console.error("request failed", r);
              common.deleteExtensionCookies(a.domainId);
              d({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " main.", errorCode:72});
            });
          }).catch(async n => {
            a.error = n;
            console.error("request failed", n);
            common.deleteExtensionCookies(a.domainId);
            d({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " main.", errorCode:71});
          });
        } else {
          if (429 != h.response.status || a.offscreen) {
            common.deleteExtensionCookies(a.domainId), d({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " main.", errorCode:7});
          } else {
            const l = a.isMainRetry;
            setTimeout(() => {
              l ? d({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " main.", errorCode:429}) : (a.isMainRetry = !0, (g ? common.addStockJob : common.addStockJobSequential)(a, d));
            }, 1156);
            l || (e = g ? common.stockJobQueue : common.stockJobQueueSingle, e.shift(), 0 < e.length && common.processStockJob(e[0][0], null, null, null, e[0][1]));
          }
        }
      }).catch(async m => {
        a.error = m;
        console.error("request failed " + a.url, m);
        common.deleteExtensionCookies(a.domainId);
        d({error:"stock retrieval failed for offer: " + a.asin + " id: " + a.gid + " main.", errorCode:74});
      });
    }
  }
}, set:function(a, c, b) {
  const f = {};
  f[a] = c;
  common.storage.set(f, b);
}, lastBugReport:0, reportBug:function(a, c, b) {
  console.error(a, c);
  const f = a ? a : Error();
  common.storage.get(["token"], function(d) {
    var g = Date.now();
    if (!(12E5 > g - common.lastBugReport || /(dead object)|(Script error)|(setUninstallURL)|(File error: Corrupted)|(operation is insecure)|(\.location is null)/i.test(a))) {
      common.lastBugReport = g;
      g = "";
      var k = common.version;
      c = c || "";
      try {
        if (g = f.stack.split("\n").splice(1).join("&ensp;&lArr;&ensp;"), !/(keepa|content)\.js/.test(g) || g.startsWith("https://www.amazon") || g.startsWith("https://smile.amazon") || g.startsWith("https://sellercentral")) {
          return;
        }
      } catch (m) {
      }
      try {
        g = g.replace(RegExp("chrome-extension://.*?/content/", "g"), "").replace(/:[0-9]*?\)/g, ")").replace(/[ ]{2,}/g, "");
      } catch (m) {
      }
      if ("object" == typeof a) {
        try {
          a = a instanceof Error ? a.toString() : JSON.stringify(a);
        } catch (m) {
        }
      }
      null == b && (b = {exception:a, additional:c, url:chrome.runtime.id, stack:g});
      b.keepaType = type;
      b.version = k;
      var h = JSON.stringify(b);
      setTimeout(function() {
        fetch("https://dyn-2.keepa.com/service/bugreport/?user=" + d.token + "&type=" + browserType + "&version=" + k + "&delayed=" + (delayedFetch ? 1 : 0) + "&timeout=" + sellerLockoutDuration, {method:"POST", body:h, mode:"cors", cache:"no-cache", credentials:"same-origin", redirect:"error"});
      }, 50);
    }
  });
}};
let webSocketObj = {lastDomain:0, clearTimeout:0, webSocket:null, sendPlainMessage:async function(a) {
  isMobile || (a = JSON.stringify(a), webSocketObj.webSocket.send(await compress(a, !1)));
}, sendMessage:async function(a) {
  isMobile || ((a = await compress(JSON.stringify(a), !1)) && 1 == webSocketObj.webSocket.readyState && webSocketObj.webSocket.send(a), clearLog && console.clear());
}, initWebSocket:async function() {
  if (!isMobile) {
    var a = settings.optOut_crawl;
    offscreenSupported || (a = "1");
    if (settings.token && 64 == settings.token.length) {
      let c = 1000;
      const b = function() {
        if (null == webSocketObj.webSocket || 1 != webSocketObj.webSocket.readyState) {
          if ("undefined" == typeof a || "undefined" == a || null == a || "null" == a) {
            a = "0";
          }
          const f = "wss://dyn.keepa.com/apps/cloud/?app=" + type + "&version=" + common.version + "&i=" + installTimestamp + "&mf=3&optOut=" + a + "&time=" + Date.now() + "&id=" + chrome.runtime.id + "&wr=" + (hasWebRequestPermission ? 1 : 0) + "&offscreen=" + (offscreenSupported ? 1 : 0) + "&mobile=" + isMobile, d = new WebSocket(f, settings.token);
          d.binaryType = "arraybuffer";
          d.onmessage = async function(g) {
            if (0 != g.data.byteLength) {
              g = g.data;
              var k = null;
              g instanceof ArrayBuffer && (g = await decompress(g, !0));
              try {
                k = JSON.parse(g);
              } catch (h) {
                common.reportBug(h, g);
                return;
              } finally {
                g = g = null;
              }
              lastActivity = Date.now();
              108 != k.status && ("" == k.key ? common.stockData.domainId = k.domainId : 108108 == k.timeout ? (k.stockDataV3 && (common.stockData = k.stockDataV3, common.stockData.cookieOrder && (cookieOrder = common.stockData.cookieOrder), k.stockDataV3.amazonIds && (AmazonSellerIds = k.stockDataV3.amazonIds), k.stockDataV3.warehouseIds && (WarehouseDealsSellerIds = k.stockDataV3.warehouseIds), common.stockData.sellerLockoutDuration && (sellerLockoutDuration = common.stockData.sellerLockoutDuration), 
              common.stockData.delayedFetch && (delayedFetch = common.stockData.delayedFetch), common.stockData.ignoreWebRequest && (hasWebRequestPermission = !1), hasWebRequestPermission && chrome.webRequest?.onHeadersReceived.addListener(h => {
                if (h.initiator == serviceWorkerUrl) {
                  var m = h.responseHeaders, e = h.url, l = [];
                  for (let n = 0; n < m.length; ++n) {
                    "set-cookie" == m[n].name.toLowerCase() && l.push(parseSetCookieString(m[n].value));
                  }
                  try {
                    interceptedExtensionCookies[e].resolve({cookies:l, request:h});
                  } catch (n) {
                    -1 < e.indexOf("/gp/cart/view") && interceptedExtensionCookies[e.replaceAll("/gp/cart/view.html", "/associates/addtocart")]?.resolve({cookies:l, request:h});
                  }
                }
              }, {urls:["<all_urls>"]}, ["responseHeaders", "extraHeaders"]), common.stockData.stockDelay && (stockDelay = common.stockData.stockDelay)), "undefined" != typeof k.keepaBoxPlaceholder && common.set("keepaBoxPlaceholder", k.keepaBoxPlaceholder), "undefined" != typeof k.keepaBoxPlaceholderBackup && common.set("keepaBoxPlaceholderBackup", k.keepaBoxPlaceholderBackup), "undefined" != typeof k.keepaBoxPlaceholderBackupClass && common.set("keepaBoxPlaceholderBackupClass", k.keepaBoxPlaceholderBackupClass), 
              "undefined" != typeof k.keepaBoxPlaceholderAppend && common.set("keepaBoxPlaceholderAppend", k.keepaBoxPlaceholderAppend), "undefined" != typeof k.keepaBoxPlaceholderBackupAppend && common.set("keepaBoxPlaceholderBackupAppend", k.keepaBoxPlaceholderBackupAppend)) : (k.domainId && (webSocketObj.lastDomain = k.domainId), cloud.onMessage(k)));
            }
          };
          d.onclose = function(g) {
            setTimeout(() => {
              72E5 < Date.now() - startedAt && 240000 < Date.now() - lastActivity ? chrome.runtime.reload() : (c = Math.min(2 * c, 300000), b());
            }, c + 18E4 * Math.random());
          };
          d.onerror = function(g) {
            d.close();
          };
          d.onopen = function() {
            c = 1000;
            cloud.abortJob(414, null, null);
          };
          webSocketObj.webSocket = d;
        }
      };
      b();
    }
  }
}}, cloud = function() {
  function a(e, l) {
    if (null != e) {
      e.sent = !0;
      e = {key:e.key, messageId:e.messageId, sessionId:d(settings.extensionCookies[e.domainId]?.cookies) || "", payload:l.payload || [], status:l.status || 200};
      for (let n in l) {
        e[n] = l[n];
      }
      return e;
    }
  }
  async function c(e) {
    if (-1 == e.url.indexOf("keepa.com/")) {
      e.request.cookies = settings.extensionCookies[e.domainId]?.cookies;
      try {
        e.request.userSession = "guest";
      } catch (l) {
      }
    }
    f(e, function(l) {
      let n = {payload:[]};
      if (l) {
        if (l.match(m)) {
          n.status = 403;
        } else {
          if (e.contentFilters && 0 < e.contentFilters.length) {
            for (let p in e.contentFilters) {
              let r = l.match(new RegExp(e.contentFilters[p]));
              if (r) {
                n.payload[p] = r[1].replace(/\n/g, "");
              } else {
                n.status = 305;
                n.payload[p] = l;
                break;
              }
            }
          } else {
            n.payload = [l];
          }
        }
      }
      "undefined" == typeof e.sent && webSocketObj.sendMessage(a(e, n));
    });
  }
  async function b(e) {
    e.request.cookies = settings.extensionCookies[e.domainId]?.cookies;
    e.request.userSession = "guest";
    f(e, function(l) {
      null == l && "undefined" == typeof e.sent && webSocketObj.sendMessage(a(e, {payload:[], redirectUrl:e.request?.response?.redirectUrl, status:305}));
    });
  }
  function f(e, l) {
    1 == e.httpMethod && e.scrapeFilters && 0 < e.scrapeFilters.length && (h = {scrapeFilters:e.scrapeFilters, dbg1:e.dbg1, dbg2:e.dbg2, domainId:e.domainId});
    e.request.domainId = e.domainId;
    requestQueue.enqueue(() => processRequest(e.request)).then(async() => {
      try {
        "object" === typeof e.request.urls && (e.request.response.text = "", e.request.urls.forEach(p => {
          p = e.request.responses[p];
          200 == p.status ? null != p.text && 10 < p.text.length && (e.request.response.text += p.text) : k(p.status, null, e);
        }));
      } catch (p) {
        console.error(p);
      }
      let n = e?.request?.response?.text;
      if (offscreenSupported && null != n && "" != n) {
        if ("o0" == e.key) {
          l(n);
        } else {
          try {
            await setupOffscreenDocument(), chrome.runtime.sendMessage({type:"parse", target:"offscreen", data:{content:n, message:e, stockData:common.stockData}}, p => {
              p = p.response;
              p = a(e, p);
              webSocketObj.sendMessage(p);
              chrome.offscreen.closeDocument();
            });
          } catch (p) {
            common.reportBug(p), e.request.isStock ? l(null) : k(410, null, e);
          }
        }
      } else {
        l(null);
      }
    }).catch(n => {
      console.error("request failed", n);
      e.request.error = n;
      e.request.isStock ? l(null) : k(410, null, e);
    });
  }
  function d(e) {
    try {
      if (e) {
        for (let l = 0; l < e.length; ++l) {
          let n = e[l];
          if ("session-id" == n.name && 16 < n.value.length && 65 > n.value.length) {
            return n.value;
          }
        }
      }
    } catch (l) {
      console.log(l);
    }
    return "";
  }
  async function g(e) {
    delete settings.extensionCookies["" + e];
    await chrome.storage.local.set({extensionCookies:await compressObject(settings.extensionCookies)});
    delete common.addToCartAssocCsrfs[e];
  }
  function k(e, l, n) {
    if (null != n) {
      try {
        if ("undefined" != typeof n.sent) {
          return;
        }
        const p = a(n, {});
        l && (p.payload = l);
        p.status = e;
        webSocketObj.sendMessage(p);
        chrome.offscreen.closeDocument();
      } catch (p) {
        common.reportBug(p, "abort");
      }
    }
    clearLog && console.clear();
  }
  let h = null;
  const m = /automated access|api-services-support@/;
  return {onMessage:function(e) {
    switch(e.key) {
      case "update":
        chrome.runtime.requestUpdateCheck(function(l, n) {
          "update_available" == l && chrome.runtime.reload();
        });
        break;
      case "o0":
        c(e);
        break;
      case "o1":
        b(e);
        break;
      case "o2":
        g(e.domainId);
        break;
      case "1":
        chrome.runtime.reload();
    }
  }, endSession:g, getSessionId:d, getOutgoingMessage:a, getFilters:function() {
    return h;
  }, abortJob:k};
}(), getTldByDomain = a => {
  a = parseInt(a);
  switch(a) {
    case 1:
      return "com";
    case 2:
      return "co.uk";
    case 3:
      return "de";
    case 4:
      return "fr";
    case 5:
      return "co.jp";
    case 6:
      return "ca";
    case 7:
      return "cn";
    case 8:
      return "it";
    case 9:
      return "es";
    case 10:
      return "in";
    case 11:
      return "com.mx";
    case 12:
      return "com.br";
    case 13:
      return "com.au";
    case 14:
      return "nl";
    default:
      return "com";
  }
}, creating;
async function setupOffscreenDocument() {
  const a = chrome.runtime.getURL("offscreen.html");
  chrome.runtime.getContexts && 0 < (await chrome.runtime.getContexts({contextTypes:["OFFSCREEN_DOCUMENT"], documentUrls:[a]})).length || (creating ||= chrome.offscreen.createDocument({url:"offscreen.html", reasons:["DOM_PARSER"], justification:"Extracting information from HTML"}).then(c => {
    creating = null;
    return c;
  }), await creating);
}
;
