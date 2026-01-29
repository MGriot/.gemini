let onlyOnceLogStock = !0;
const scanner = function() {
  function W(F, w) {
    const E = {};
    if (null == document.body) {
      E.status = 599;
    } else {
      if (document.body.textContent.match("you're not a robot")) {
        E.status = 403;
      } else {
        for (var Q = document.evaluate("//comment()", document, null, XPathResult.ANY_TYPE, null), P = Q.iterateNext(), I = ""; P;) {
          I += P, P = Q.iterateNext();
        }
        if (I.match(/automated access|api-services-support@/)) {
          E.status = 403;
        } else {
          if (I.match(/ref=cs_503_link/)) {
            E.status = 503;
          } else {
            if (F.scrapeFilters && 0 < F.scrapeFilters.length) {
              Q = {};
              P = null;
              let G = "", f = null;
              const H = {};
              I = {};
              let X = !1;
              const T = function(b, d, g) {
                var e = [];
                if (!b.selectors || 0 == b.selectors.length) {
                  if (!b.regExp) {
                    return G = "invalid selector, sel/regexp", !1;
                  }
                  e = document.getElementsByTagName("html")[0].innerHTML.match(new RegExp(b.regExp, "i"));
                  if (!e || e.length < b.reGroup) {
                    g = "regexp fail: html - " + b.name + g;
                    if (!1 === b.optional) {
                      return G = g, !1;
                    }
                    f += " // " + g;
                    return !0;
                  }
                  return e[b.reGroup];
                }
                let c = [];
                b.selectors.find(m => {
                  m = d.querySelectorAll(m);
                  return 0 < m.length ? (c = m, !0) : !1;
                });
                if (0 === c.length) {
                  if (!0 === b.optional) {
                    return !0;
                  }
                  G = "selector no match: " + b.name + g;
                  return !1;
                }
                if (b.parentSelector && (c = [c[0].parentNode.querySelector(b.parentSelector)], null == c[0])) {
                  if (!0 === b.optional) {
                    return !0;
                  }
                  G = "parent selector no match: " + b.name + g;
                  return !1;
                }
                if ("undefined" != typeof b.multiple && null != b.multiple && (!0 === b.multiple && 1 > c.length || !1 === b.multiple && 1 < c.length)) {
                  if (!X) {
                    return X = !0, T(b, d, g);
                  }
                  g = "selector multiple mismatch: " + b.name + g + " found: " + c.length;
                  if (!1 === b.optional) {
                    b = "";
                    for (var h in c) {
                      !c.hasOwnProperty(h) || 1000 < b.length || (b += " - " + h + ": " + c[h].outerHTML + " " + c[h].getAttribute("class") + " " + c[h].getAttribute("id"));
                    }
                    G = g + b + " el: " + d.getAttribute("class") + " " + d.getAttribute("id");
                    return !1;
                  }
                  f += " // " + g;
                  return !0;
                }
                if (b.isListSelector) {
                  return H[b.name] = c, !0;
                }
                if (!b.attribute) {
                  return G = "selector attribute undefined?: " + b.name + g, !1;
                }
                for (let m in c) {
                  if (c.hasOwnProperty(m)) {
                    var k = c[m];
                    if (!k) {
                      break;
                    }
                    if (b.childNode) {
                      b.childNode = Number(b.childNode);
                      h = k.childNodes;
                      if (h.length < b.childNode) {
                        g = "childNodes fail: " + h.length + " - " + b.name + g;
                        if (!1 === b.optional) {
                          return G = g, !1;
                        }
                        f += " // " + g;
                        return !0;
                      }
                      k = h[b.childNode];
                    }
                    h = null;
                    h = "text" == b.attribute ? k.textContent : "html" == b.attribute ? k.innerHTML : k.getAttribute(b.attribute);
                    if (!h || 0 == h.length || 0 == h.replace(/(\r\n|\n|\r)/gm, "").replace(/^\s+|\s+$/g, "").length) {
                      g = "selector attribute null: " + b.name + g;
                      if (!1 === b.optional) {
                        return G = g, !1;
                      }
                      f += " // " + g;
                      return !0;
                    }
                    if (b.regExp) {
                      k = h.match(new RegExp(b.regExp, "i"));
                      if (!k || k.length < b.reGroup) {
                        g = "regexp fail: " + h + " - " + b.name + g;
                        if (!1 === b.optional) {
                          return G = g, !1;
                        }
                        f += " // " + g;
                        return !0;
                      }
                      e.push(k[b.reGroup]);
                    } else {
                      e.push(h);
                    }
                    if (!b.multiple) {
                      break;
                    }
                  }
                }
                b.multiple || (e = e[0]);
                return e;
              };
              let Z = document, a = !1;
              for (let b in F.scrapeFilters) {
                if (a) {
                  break;
                }
                let d = F.scrapeFilters[b], g = d.pageVersionTest;
                var p = [], q = !1;
                for (const e of g.selectors) {
                  if (p = document.querySelectorAll(e), 0 < p.length) {
                    q = !0;
                    break;
                  }
                }
                if (q) {
                  if ("undefined" != typeof g.multiple && null != g.multiple) {
                    if (!0 === g.multiple && 2 > p.length) {
                      continue;
                    }
                    if (!1 === g.multiple && 1 < p.length) {
                      continue;
                    }
                  }
                  if (g.attribute && (q = null, q = "text" == g.attribute ? "" : p[0].getAttribute(g.attribute), null == q)) {
                    continue;
                  }
                  P = b;
                  for (let e in d) {
                    if (a) {
                      break;
                    }
                    p = d[e];
                    if (p.name != g.name) {
                      if (p.parentList) {
                        q = [];
                        if ("undefined" != typeof H[p.parentList]) {
                          q = H[p.parentList];
                        } else {
                          if (!0 === T(d[p.parentList], Z, b)) {
                            q = H[p.parentList];
                          } else {
                            break;
                          }
                        }
                        I[p.parentList] || (I[p.parentList] = []);
                        for (let c in q) {
                          if (a) {
                            break;
                          }
                          if (!q.hasOwnProperty(c)) {
                            continue;
                          }
                          let h = T(p, q[c], b);
                          if (!1 === h) {
                            a = !0;
                            break;
                          }
                          if (!0 !== h) {
                            if (I[p.parentList][c] || (I[p.parentList][c] = {}), p.multiple) {
                              for (let k in h) {
                                h.hasOwnProperty(k) && !p.keepBR && (h[k] = h[k].replace(/(\r\n|\n|\r)/gm, " ").replace(/^\s+|\s+$/g, "").replace(/\s{2,}/g, " "));
                              }
                              h = h.join("\u271c\u271c");
                              I[p.parentList][c][p.name] = h;
                            } else {
                              I[p.parentList][c][p.name] = p.keepBR ? h : h.replace(/(\r\n|\n|\r)/gm, " ").replace(/^\s+|\s+$/g, "").replace(/\s{2,}/g, " ");
                            }
                          }
                        }
                      } else {
                        q = T(p, Z, b);
                        if (!1 === q) {
                          a = !0;
                          break;
                        }
                        if (!0 !== q) {
                          if (p.multiple) {
                            for (let c in q) {
                              q.hasOwnProperty(c) && !p.keepBR && (q[c] = q[c].replace(/(\r\n|\n|\r)/gm, " ").replace(/^\s+|\s+$/g, "").replace(/\s{2,}/g, " "));
                            }
                            q = q.join();
                          } else {
                            p.keepBR || (q = q.replace(/(\r\n|\n|\r)/gm, " ").replace(/^\s+|\s+$/g, "").replace(/\s{2,}/g, " "));
                          }
                          Q[p.name] = q;
                        }
                      }
                    }
                  }
                  a = !0;
                }
              }
              if (null == P) {
                G += " // no pageVersion matched", E.status = 308, E.payload = [f, G, F.dbg1 ? document.getElementsByTagName("html")[0].innerHTML : ""];
              } else {
                if ("" === G) {
                  E.payload = [f];
                  E.scrapedData = Q;
                  for (let b in I) {
                    E[b] = I[b];
                  }
                } else {
                  E.status = 305, E.payload = [f, G, F.dbg2 ? document.getElementsByTagName("html")[0].innerHTML : ""];
                }
              }
            } else {
              E.status = 306;
            }
          }
        }
      }
    }
    w(E);
  }
  let Y = !0;
  window.self === window.top && (Y = !1);
  window.sandboxHasRun && (Y = !1);
  Y && (window.sandboxHasRun = !0, window.addEventListener("message", function(F) {
    if (F.source == window.parent && F.data && (F.origin == "chrome-extension://" + chrome.runtime.id || F.origin.startsWith("moz-extension://") || F.origin.startsWith("safari-extension://"))) {
      var w = F.data.value;
      "data" == F.data.key && w.url && w.url == document.location && setTimeout(function() {
        null == document.body ? setTimeout(function() {
          W(w, function(E) {
            window.parent.postMessage({sandbox:E}, "*");
          });
        }, 1500) : W(w, function(E) {
          window.parent.postMessage({sandbox:E}, "*");
        });
      }, 800);
    }
  }, !1), window.parent.postMessage({sandbox:document.location + "", isUrlMsg:!0}, "*"));
  window.addEventListener("error", function(F, w, E, Q, P) {
    "ipbakfmnjdenbmoenhicfmoojdojjjem" != chrome.runtime.id && "blfpbjkajgamcehdbehfdioapoiibdmc" != chrome.runtime.id || console.log(P);
    return !1;
  });
  return {scan:W};
}();
(function() {
  let W = !1, Y = !1;
  const F = window.opera || -1 < navigator.userAgent.indexOf(" OPR/");
  var w = -1 < navigator.userAgent.toLowerCase().indexOf("firefox");
  const E = -1 < navigator.userAgent.toLowerCase().indexOf("edge/"), Q = /Apple Computer/.test(navigator.vendor) && /Safari/.test(navigator.userAgent), P = !F && !w && !E & !Q, I = w ? "Firefox" : Q ? "Safari" : P ? "Chrome" : F ? "Opera" : E ? "Edge" : "Unknown", p = chrome.runtime.getManifest().version;
  let q = !1;
  try {
    q = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
  } catch (a) {
  }
  if (!window.keepaHasRun) {
    window.keepaHasRun = !0;
    var G = 0;
    chrome.runtime.onMessage.addListener((a, b, d) => {
      switch(a.key) {
        case "updateToken":
          f.iframeStorage ? f.iframeStorage.contentWindow.postMessage({origin:"keepaContentScript", key:"updateTokenWebsite", value:a.value}, f.iframeStorage.src) : window.postMessage({origin:"keepaContentScript", key:"updateTokenWebsite", value:a.value}, "*");
      }
    });
    window.addEventListener("message", function(a) {
      if ("undefined" == typeof a.data.sandbox) {
        if ("https://keepa.com" == a.origin || "https://test.keepa.com" == a.origin || "https://dyn.keepa.com" == a.origin) {
          if (a.data.hasOwnProperty("origin") && "keepaIframe" == a.data.origin) {
            f.handleIFrameMessage(a.data.key, a.data.value, function(b) {
              try {
                a.source.postMessage({origin:"keepaContentScript", key:a.data.key, value:b, id:a.data.id}, a.origin);
              } catch (d) {
              }
            });
          } else {
            if ("string" === typeof a.data) {
              const b = a.data.split(",");
              if (2 > b.length) {
                return;
              }
              if (2 < b.length) {
                let d = 2;
                const g = b.length;
                for (; d < g; d++) {
                  b[1] += "," + b[d];
                }
              }
              f.handleIFrameMessage(b[0], b[1], function(d) {
                a.source.postMessage({origin:"keepaContentScript", value:d}, a.origin);
              });
            }
          }
        }
        if (a.origin.match(/^https?:\/\/.*?\.amazon\.(de|com|co\.uk|co\.jp|jp|ca|fr|es|nl|it|in|com\.mx|com\.br)/)) {
          let b;
          try {
            b = JSON.parse(a.data);
          } catch (d) {
            return;
          }
          (b = b.asin) && /^([BC][A-Z0-9]{9}|\d{9}(!?X|\d))$/.test(b.trim()) && (b != f.ASIN ? (f.ASIN = b, f.swapIFrame()) : 0 != G ? (window.clearTimeout(G), G = 1) : G = window.setTimeout(function() {
            f.swapIFrame();
          }, 1000));
        }
      }
    });
    var f = {domain:0, iframeStorage:null, ASIN:null, tld:"", placeholder:"", cssFlex:function() {
      let a = "flex";
      const b = ["flex", "-webkit-flex", "-moz-box", "-webkit-box", "-ms-flexbox"], d = document.createElement("flexelement");
      for (let g in b) {
        try {
          if ("undefined" != d.style[b[g]]) {
            a = b[g];
            break;
          }
        } catch (e) {
        }
      }
      return a;
    }(), getDomain:function(a) {
      switch(a) {
        case "com":
          return 1;
        case "co.uk":
          return 2;
        case "de":
          return 3;
        case "fr":
          return 4;
        case "co.jp":
          return 5;
        case "jp":
          return 5;
        case "ca":
          return 6;
        case "it":
          return 8;
        case "es":
          return 9;
        case "in":
          return 10;
        case "com.mx":
          return 11;
        case "com.br":
          return 12;
        case "com.au":
          return 13;
        case "nl":
          return 14;
        default:
          return -1;
      }
    }, revealWorking:!1, juvecOnlyOnce:!1, revealMapOnlyOnce:!1, revealCache:{}, revealMAP:function() {
      f.revealMapOnlyOnce || (f.revealMapOnlyOnce = !0, chrome.runtime?.id && chrome.runtime.sendMessage({type:"isPro"}, a => {
        if (null == a.value) {
          console.log("stock data fail");
        } else {
          var b = a.amazonSellerIds, d = a.stockData, g = !0 === a.value, e = c => {
            c = c.trim();
            let h = d.amazonNames[c];
            return h ? "W" === h ? d.warehouseIds[f.domain] : "A" === h ? d.amazonIds[f.domain] : h : (c = c.match(new RegExp(d.sellerId))) && c[1] ? c[1] : null;
          };
          chrome.storage.local.get("revealStock", function(c) {
            "undefined" == typeof c && (c = {});
            let h = !0;
            try {
              h = "0" != c.revealStock;
            } catch (l) {
            }
            onlyOnceLogStock && (onlyOnceLogStock = !1, console.log("Stock " + g + " " + h));
            try {
              if ((h || "com" == f.tld) && !f.revealWorking) {
                if (f.revealWorking = !0, document.getElementById("keepaMAP")) {
                  f.revealWorking = !1;
                } else {
                  var k = function() {
                    const l = new MutationObserver(function(v) {
                      setTimeout(function() {
                        f.revealMAP();
                      }, 100);
                      try {
                        l.disconnect();
                      } catch (B) {
                      }
                    });
                    l.observe(document.getElementById("keepaMAP").parentNode.parentNode.parentNode, {childList:!0, subtree:!0});
                  }, m = (l, v, B, r, z, x, N, O, S, L) => {
                    if (("undefined" == typeof f.revealCache[r] || null == l.parentElement.querySelector(".keepaStock")) && "undefined" !== typeof b) {
                      null == O && (O = b[f.domain]);
                      var M = "" == l.id && "aod-pinned-offer" == l.parentNode.id;
                      x = x || M;
                      try {
                        B = B || -1 != l.textContent.toLowerCase().indexOf("to cart to see") || !x && /(our price|always remove it|add this item to your cart|see product details in cart|see price in cart)/i.test(document.getElementById("price").textContent);
                      } catch (n) {
                      }
                      if (B || g) {
                        J(l, v, B, r, x);
                        var R = n => {
                          const V = document.getElementById("keepaStock" + r);
                          if (null != V) {
                            V.innerHTML = "";
                            if (null != n && null != n.price && B) {
                              var U = document.createElement("div");
                              n = 5 == f.domain ? n.price : (Number(n.price) / 100).toFixed(2);
                              let aa = new Intl.NumberFormat(" en-US en-GB de-DE fr-FR ja-JP en-CA zh-CN it-IT es-ES hi-IN es-MX pt-BR en-AU nl-NL tr-TR".split(" ")[f.domain], {style:"currency", currency:" USD GBP EUR EUR JPY CAD CNY EUR EUR INR MXN BRL AUD EUR TRY".split(" ")[f.domain]});
                              0 < n && (U.innerHTML = 'Price&emsp;&ensp;<span style="font-weight: bold;">' + aa.format(n) + "</span>");
                              V.parentNode.parentNode.parentNode.prepend(U);
                            }
                            g && (n = f.revealCache[r].stock, 999 == n ? n = "999+" : 1000 == n ? n = "1000+" : -3 != f.revealCache[r].price && 1 > f.revealCache[r].price && (30 == n || S) ? n += "+" : f.revealCache[r].isMaxQty && (n += "+"), U = document.createElement("span"), U.style = "font-weight: bold;", U.innerText = n + " ", n = document.createElement("span"), n.style = "color:#da4c33;", n.innerText = " order limit", V.appendChild(U), f.revealCache[r].limit && (0 < f.revealCache[r].orderLimit && 
                            (n.innerText += ": " + f.revealCache[r].orderLimit), V.appendChild(n)), U = f.revealCache[r].errorCode) && (n = document.createElement("span"), n.style = "color: #f7d1d1;", n.innerText = " (e_" + U + ")", null != f.revealCache[r].error && (n.title = f.revealCache[r].error + ". Contact info@keepa.com with a screenshot & URL for assistance."), V.appendChild(n));
                          }
                        };
                        if ("undefined" != typeof f.revealCache[r] && -1 != f.revealCache[r]) {
                          "pending" != f.revealCache[r] && R(f.revealCache[r]);
                        } else {
                          f.revealCache[r] = "pending";
                          x = l = "";
                          try {
                            l = document.querySelector("meta[name=encrypted-slate-token]").getAttribute("content"), x = document.querySelector("#aod-offer-list input#aod-atc-csrf-token").getAttribute("value");
                          } catch (n) {
                          }
                          chrome.runtime?.id && chrome.runtime.sendMessage({type:"getStock", asin:v, oid:r, sellerId:O, maxQty:N, hasPlus:S, isMAP:B, host:document.location.hostname, force:B, referer:document.location + "", domainId:f.domain, cachedStock:f.revealCache[O], offscreen:!1, atcCsrf:x || L, slateToken:l, session:z}, n => {
                            if ("undefined" == typeof n || null == n || !1 === n?.stock) {
                              if (n = document.getElementById("keepaMAP")) {
                                n.innerHTML = "";
                              }
                            } else {
                              f.revealCache[r] = n, f.revealCache[O] = n, R(n);
                            }
                          });
                        }
                      }
                    }
                  }, J = (l, v, B, r, z) => {
                    v = "" == l.id && "aod-pinned-offer" == l.parentNode.id;
                    var x = (z ? l.parentElement : l).querySelector(".keepaMAP");
                    if (null == (z ? l.parentElement : l).querySelector(".keepaStock")) {
                      null != x && null != x.parentElement && x.parentElement.remove();
                      var N = z ? "165px" : "55px;height:20px;";
                      x = document.createElement("div");
                      x.id = "keepaMAP" + (z ? B + r : "");
                      x.className = "a-section a-spacing-none a-spacing-top-micro aod-clear-float keepaStock";
                      B = document.createElement("div");
                      B.className = "a-fixed-left-grid";
                      var O = document.createElement("div");
                      O.style = "padding-left:" + N;
                      z && (O.className = "a-fixed-left-grid-inner");
                      var S = document.createElement("div");
                      S.style = "width:" + N + ";margin-left:-" + N + ";float:left;";
                      S.className = "a-fixed-left-grid-col aod-padding-right-10 a-col-left";
                      N = document.createElement("div");
                      N.style = "padding-left:0%;float:left;";
                      N.className = "a-fixed-left-grid-col a-col-right";
                      var L = document.createElement("span");
                      L.className = "a-size-small a-color-tertiary";
                      var M = document.createElement("span");
                      M.style = "color: #dedede;";
                      M.innerText = "loading\u2026";
                      var R = document.createElement("span");
                      R.className = "a-size-small a-color-base";
                      R.id = "keepaStock" + r;
                      R.appendChild(M);
                      N.appendChild(R);
                      S.appendChild(L);
                      O.appendChild(S);
                      O.appendChild(N);
                      B.appendChild(O);
                      x.appendChild(B);
                      L.className = "a-size-small a-color-tertiary";
                      f.revealWorking = !1;
                      g && (L.innerText = "Stock");
                      z ? v ? (l = document.querySelector("#aod-pinned-offer-show-more-link"), 0 == l.length && document.querySelector("#aod-pinned-offer-main-content-show-more"), l.prepend(x)) : l.parentNode.insertBefore(x, l.parentNode.children[l.parentNode.children.length - 1]) : l.appendChild(x);
                      z || k();
                    }
                  }, K = document.location.href;
                  (new MutationObserver(function(l) {
                    try {
                      var v = document.querySelectorAll("#aod-offer,#aod-pinned-offer");
                      if (null != v && 0 != v.length) {
                        l = null;
                        var B = v[0].querySelector('input[name="session-id"]');
                        if (B) {
                          l = B.getAttribute("value");
                        } else {
                          if (B = document.querySelector("#session-id")) {
                            l = document.querySelector("#session-id").value;
                          }
                        }
                        if (!l) {
                          var r = document.querySelectorAll("script");
                          for (const z of r) {
                            let x = z.text.match("ue_sid.?=.?'([0-9-]{19})'");
                            x && (l = x[1]);
                          }
                        }
                        if (l) {
                          for (const z of v) {
                            if (null != z && "DIV" == z.nodeName) {
                              let x;
                              B = 999;
                              let N = z.querySelector('input[name="offeringID.1"]');
                              if (N) {
                                x = N.getAttribute("value");
                              } else {
                                try {
                                  const L = z.querySelectorAll("[data-aod-atc-action]");
                                  if (0 < L.length) {
                                    let M = JSON.parse(L[0].dataset.aodAtcAction);
                                    x = M.oid;
                                    B = M.maxQty;
                                  }
                                } catch (L) {
                                  try {
                                    const M = z.querySelectorAll("[data-aw-aod-cart-api]");
                                    if (0 < M.length) {
                                      let R = JSON.parse(M[0].dataset.awAodCartApi);
                                      x = R.oid;
                                      B = R.maxQty;
                                    }
                                  } catch (M) {
                                  }
                                }
                              }
                              if (!x) {
                                continue;
                              }
                              const O = z.children[0];
                              v = null;
                              if (d) {
                                for (r = 0; r < d.soldByOffers.length; r++) {
                                  let L = z.querySelector(d.soldByOffers[r]);
                                  if (null == L) {
                                    continue;
                                  }
                                  v = e(L.innerText);
                                  if (null != v) {
                                    break;
                                  }
                                  let M = L.getAttribute("href") || L.innerHTML;
                                  v = e(M);
                                  if (null != v) {
                                    break;
                                  }
                                }
                              }
                              const S = z.textContent.toLowerCase().includes("add to cart to see product details.");
                              m(O, f.ASIN, S, x, l, !0, B, v);
                            }
                          }
                        } else {
                          console.error("missing sessionId");
                        }
                      }
                    } catch (z) {
                      console.log(z), f.reportBug(z, "MAP error: " + K);
                    }
                  })).observe(document.querySelector("body"), {childList:!0, attributes:!1, characterData:!1, subtree:!0, attributeOldValue:!1, characterDataOldValue:!1});
                  var A = document.querySelector(d.soldOfferId);
                  c = null;
                  if (d) {
                    var t = document.querySelector(d.soldByBBForm);
                    t && (c = t.getAttribute("value"));
                    if (null == c) {
                      for (t = 0; t < d.soldByBB.length; t++) {
                        var D = document.querySelector(d.soldByBB[t]);
                        if (null != D && (c = e(D.innerHTML), null != c)) {
                          break;
                        }
                      }
                    }
                  }
                  if (null != A && null != A.value) {
                    var y = A.parentElement.querySelector("#session-id");
                    const l = A.parentElement.querySelector("#ASIN"), v = A.parentElement.querySelector("#selectQuantity #quantity > option:last-child");
                    let B = A.parentElement.querySelector('input[name*="CSRF" i]')?.getAttribute("value");
                    if (null != y && null != l) {
                      for (D = 0; D < d.mainEl.length; D++) {
                        let r = document.querySelector(d.mainEl[D]);
                        if (null != r) {
                          t = D = !1;
                          if (null != v) {
                            try {
                              0 < v.innerText.indexOf("+") && (t = !0), D = Number("" == v.value ? v.innerText.replaceAll("+", "") : v.value);
                            } catch (z) {
                              console.log(z);
                            }
                          }
                          m(r, l.value, !1, A.value, y.value, !1, D, c, t, B);
                          break;
                        }
                      }
                    }
                  }
                  var u = document.getElementById("price");
                  if (null != u && /(our price|always remove it|add this item to your cart|see product details in cart|see price in cart)/i.test(u.textContent)) {
                    let l = document.getElementById("merchant-info");
                    y = A = "";
                    if (l) {
                      if (-1 == l.textContent.toLowerCase().indexOf("amazon.c")) {
                        const v = u.querySelector('span[data-action="a-modal"]');
                        if (v) {
                          var C = v.getAttribute("data-a-modal");
                          C.match(/offeringID\.1=(.*?)&amp/) && (A = RegExp.$1);
                        }
                        if (0 == A.length) {
                          if (C.match('map_help_pop_(.*?)"')) {
                            y = RegExp.$1;
                          } else {
                            f.revealWorking = !1;
                            return;
                          }
                        }
                      }
                      if (null != A && 10 < A.length) {
                        const v = document.querySelector("#session-id");
                        m(u, f.ASIN, !1, A, v.value, !1, !1, y);
                      }
                    } else {
                      f.revealWorking = !1;
                    }
                  } else {
                    f.revealWorking = !1;
                  }
                }
              }
            } catch (l) {
              f.revealWorking = !1, console.log(l);
            }
          });
        }
      }));
    }, onPageLoad:function() {
      f.tld = RegExp.$1;
      const a = RegExp.$3;
      f.ASIN || (f.ASIN = a);
      f.domain = f.getDomain(f.tld);
      chrome.storage.local.get(["s_boxType", "s_boxOfferListing"], function(b) {
        "undefined" == typeof b && (b = {});
        document.addEventListener("DOMContentLoaded", function(d) {
          d = document.getElementsByTagName("head")[0];
          const g = document.createElement("script");
          g.type = "text/javascript";
          g.src = chrome.runtime.getURL("selectionHook.js");
          d.appendChild(g);
          "0" == b.s_boxType ? f.swapIFrame() : f.getPlaceholderAndInsertIFrame((e, c) => {
            if (void 0 !== e) {
              c = document.createElement("div");
              c.setAttribute("id", "keepaButton");
              c.setAttribute("style", "    background-color: #444;\n    border: 0 solid #ccc;\n    border-radius: 6px 6px 6px 6px;\n    color: #fff;\n    cursor: pointer;\n    font-size: 12px;\n    margin: 15px;\n    padding: 6px;\n    text-decoration: none;\n    text-shadow: none;\n    display: flex;\n    box-shadow: 0px 0px 7px 0px #888;\n    width: 100px;\n    background-repeat: no-repeat;\n    height: 32px;\n    background-position-x: 7px;\n    background-position-y: 7px;\n    text-align: center;\n    background-image: url(https://cdn.keepa.com/img/logo_circled_w.svg);\n    background-size: 80px;");
              var h = document.createElement("style");
              h.appendChild(document.createTextNode("#keepaButton:hover{background-color:#666 !important}"));
              document.head.appendChild(h);
              c.addEventListener("click", function() {
                const k = document.getElementById("keepaButton");
                k.parentNode.removeChild(k);
                f.swapIFrame();
              }, !1);
              e.parentNode.insertBefore(c, e);
            }
          });
        }, !1);
      });
    }, swapIFrame:function() {
      if ("com.au" == f.tld) {
        try {
          f.revealMAP(document, f.ASIN, f.tld), f.revealMapOnlyOnce = !1;
        } catch (b) {
        }
      } else {
        if (!document.getElementById("keepaButton")) {
          f.swapIFrame.swapTimer && clearTimeout(f.swapIFrame.swapTimer);
          f.swapIFrame.swapTimer = setTimeout(function() {
            if (!q) {
              document.getElementById("keepaContainer") || f.getPlaceholderAndInsertIFrame(f.insertIFrame);
              try {
                f.revealMAP(document, f.ASIN, f.tld), f.revealMapOnlyOnce = !1;
              } catch (b) {
              }
              f.swapIFrame.swapTimer = setTimeout(function() {
                document.getElementById("keepaContainer") || f.getPlaceholderAndInsertIFrame(f.insertIFrame);
              }, 2000);
            }
          }, 2000);
          var a = document.getElementById("keepaContainer");
          if (null != f.iframeStorage && a) {
            try {
              f.iframeStorage.contentWindow.postMessage({origin:"keepaContentScript", key:"updateASIN", value:{d:f.domain, a:f.ASIN, eType:I, eVersion:p, url:document.location.href}}, "*");
            } catch (b) {
              console.error(b);
            }
          } else {
            f.getPlaceholderAndInsertIFrame(f.insertIFrame);
            try {
              f.revealMAP(document, f.ASIN, f.tld), f.revealMapOnlyOnce = !1;
            } catch (b) {
            }
          }
        }
      }
    }, getDevicePixelRatio:function() {
      let a = 1;
      void 0 !== window.screen.systemXDPI && void 0 !== window.screen.logicalXDPI && window.screen.systemXDPI > window.screen.logicalXDPI ? a = window.screen.systemXDPI / window.screen.logicalXDPI : void 0 !== window.devicePixelRatio && (a = window.devicePixelRatio);
      return a;
    }, getPlaceholderAndInsertIFrame:function(a) {
      chrome.storage.local.get("keepaBoxPlaceholder keepaBoxPlaceholderBackup keepaBoxPlaceholderBackupClass keepaBoxPlaceholderAppend keepaBoxPlaceholderBackupAppend webGraphType webGraphRange".split(" "), function(b) {
        "undefined" == typeof b && (b = {});
        let d = 0;
        const g = function() {
          if (!document.getElementById("keepaButton") && !document.getElementById("amazonlive-homepage-widget")) {
            var e = document.getElementById("gpdp-btf-container");
            if (e && e.previousElementSibling) {
              f.insertIFrame(e.previousElementSibling, !1, !0);
            } else {
              if ((e = document.getElementsByClassName("mocaGlamorContainer")[0]) || (e = document.getElementById("dv-sims")), e ||= document.getElementById("mas-terms-of-use"), e && e.nextSibling) {
                f.insertIFrame(e.nextSibling, !1, !0);
              } else {
                var c = b.keepaBoxPlaceholder || "#bottomRow";
                e = !1;
                if (c = document.querySelector(c)) {
                  "sims_fbt" == c.previousElementSibling.id && (c = c.previousElementSibling, "bucketDivider" == c.previousElementSibling.className && (c = c.previousElementSibling), e = !0), 1 == b.keepaBoxPlaceholderAppend && (c = c.nextSibling), a(c, e);
                } else {
                  if (c = b.keepaBoxPlaceholderBackup || "#elevatorBottom", "ATFCriticalFeaturesDataContainer" == c && (c = "#ATFCriticalFeaturesDataContainer"), c = document.querySelector(c)) {
                    1 == b.keepaBoxPlaceholderBackupAppend && (c = c.nextSibling), a(c, !0);
                  } else {
                    if (c = document.getElementById("hover-zoom-end")) {
                      a(c, !0);
                    } else {
                      if (q) {
                        if ((c = document.querySelector("#ATFCriticalFeaturesDataContainer,#atc-toast-overlay,#productTitleGroupAnchor")) && c.nextSibling) {
                          a(c.nextSibling, !0);
                          return;
                        }
                        document.querySelector("#tabular_feature_div,#olpLinkWidget_feature_div,#tellAFriendBox_feature_div");
                        if (c && c.nextSibling) {
                          a(c.nextSibling, !0);
                          return;
                        }
                      }
                      c = b.keepaBoxPlaceholderBackupClass || ".a-fixed-left-grid";
                      if ((c = document.querySelector(c)) && c.nextSibling) {
                        a(c.nextSibling, !0);
                      } else {
                        e = 0;
                        c = document.getElementsByClassName("twisterMediaMatrix");
                        var h = !!document.getElementById("dm_mp3Player");
                        if ((c = 0 == c.length ? document.getElementById("handleBuy") : c[0]) && 0 == e && !h && null != c.nextElementSibling) {
                          let k = !1;
                          for (h = c; h;) {
                            if (h = h.parentNode, "table" === h.tagName.toLowerCase()) {
                              if ("buyboxrentTable" === h.className || /buyBox/.test(h.className) || "buyingDetailsGrid" === h.className) {
                                k = !0;
                              }
                              break;
                            } else if ("html" === h.tagName.toLowerCase()) {
                              break;
                            }
                          }
                          if (!k) {
                            c = c.nextElementSibling;
                            a(c, !1);
                            return;
                          }
                        }
                        c = document.getElementsByClassName("bucketDivider");
                        0 == c.length && (c = document.getElementsByClassName("a-divider-normal"));
                        if (!c[e]) {
                          if (!c[0]) {
                            40 > d++ && window.setTimeout(function() {
                              g();
                            }, 100);
                            return;
                          }
                          e = 0;
                        }
                        for (h = c[e]; h && c[e];) {
                          if (h = h.parentNode, "table" === h.tagName.toLowerCase()) {
                            if ("buyboxrentTable" === h.className || /buyBox/.test(h.className) || "buyingDetailsGrid" === h.className) {
                              h = c[++e];
                            } else {
                              break;
                            }
                          } else if ("html" === h.tagName.toLowerCase()) {
                            break;
                          }
                        }
                        f.placeholder = c[e];
                        c[e] && c[e].parentNode && (e = document.getElementsByClassName("lpo")[0] && c[1] && 0 == e ? c[1] : c[e], a(e, !1));
                      }
                    }
                  }
                }
              }
            }
          }
        };
        g();
      });
    }, getAFComment:function(a) {
      for (a = [a]; 0 < a.length;) {
        const b = a.pop();
        for (let d = 0; d < b.childNodes.length; d++) {
          const g = b.childNodes[d];
          if (8 === g.nodeType && -1 < g.textContent.indexOf("MarkAF")) {
            return g;
          }
          a.push(g);
        }
      }
      return null;
    }, insertIFrame:function(a, b) {
      if (null != f.iframeStorage && document.getElementById("keepaContainer")) {
        f.swapIFrame();
      } else {
        var d = document.getElementById("hover-zoom-end"), g = function(e) {
          var c = document.getElementById(e);
          const h = [];
          for (; c;) {
            h.push(c), c.id = "a-different-id", c = document.getElementById(e);
          }
          for (c = 0; c < h.length; ++c) {
            h[c].id = e;
          }
          return h;
        }("hover-zoom-end");
        chrome.storage.local.get("s_boxHorizontal", function(e) {
          "undefined" == typeof e && (e = {});
          if (null == a) {
            setTimeout(() => {
              f.getPlaceholderAndInsertIFrame(f.insertIFrame);
            }, 3000);
          } else {
            var c = e.s_boxHorizontal, h = window.innerWidth - 50;
            if (!document.getElementById("keepaContainer")) {
              e = document.createElement("div");
              "0" == c ? (h -= 550, 960 > h && (h = 960), e.setAttribute("style", "min-width: 935px; max-width:" + h + "px;display: flex;  height: 500px; border:0 none; margin: 10px 0 0;")) : e.setAttribute("style", "min-width: 935px; width: calc(100% - 30px); height: 500px; display: flex; border:0 none; margin: 10px 0 0;");
              q && (c = (window.innerWidth - 1 * parseFloat(getComputedStyle(document.documentElement).fontSize)) / 935, e.setAttribute("style", "width: 935px;height: " + Math.max(300, 500 * c) + "px;display: flex;border:0 none;transform-origin: 0 0;transform:scale(" + c + ");margin: 10px -1rem 0 -1rem;"));
              e.setAttribute("id", "keepaContainer");
              var k = document.createElement("iframe");
              c = document.createElement("div");
              c.setAttribute("id", "keepaClear");
              k.setAttribute("style", "width: 100%; height: 100%; border:0 none;overflow: hidden;");
              k.setAttribute("src", "https://keepa.com/keepaBox.html");
              k.setAttribute("scrolling", "no");
              k.setAttribute("id", "keepa");
              Y ||= !0;
              e.appendChild(k);
              h = !1;
              if (!b) {
                null == a.parentNode || "promotions_feature_div" !== a.parentNode.id && "dp-out-of-stock-top_feature_div" !== a.parentNode.id || (a = a.parentNode);
                try {
                  var m = a.previousSibling.previousSibling;
                  null != m && "technicalSpecifications_feature_div" == m.id && (a = m);
                } catch (u) {
                }
                0 < g.length && (d = g[g.length - 1]) && "centerCol" != d.parentElement.id && ((m = f.getFirstInDOM([a, d], document.body)) && 600 < m.parentElement.offsetWidth && (a = m), a === d && (h = !0));
                (m = document.getElementById("title") || document.getElementById("title_row")) && f.getFirstInDOM([a, m], document.body) !== m && (a = m);
              }
              m = document.getElementById("vellumMsg");
              null != m && (a = m);
              m = document.body;
              var J = document.documentElement;
              J = Math.max(m.scrollHeight, m.offsetHeight, J.clientHeight, J.scrollHeight, J.offsetHeight);
              var K = a.offsetTop / J;
              if (0.5 < K || 0 > K) {
                m = f.getAFComment(m), null != m && (K = a.offsetTop / J, 0.5 > K && (a = m));
              }
              if (a.parentNode) {
                m = document.querySelector(".container_vertical_middle");
                "burjPageDivider" == a.id ? (a.parentNode.insertBefore(e, a), b || a.parentNode.insertBefore(c, e.nextSibling)) : "bottomRow" == a.id ? (a.parentNode.insertBefore(e, a), b || a.parentNode.insertBefore(c, e.nextSibling)) : h ? (a.parentNode.insertBefore(e, a.nextSibling), b || a.parentNode.insertBefore(c, e.nextSibling)) : null != m ? (a = m, a.parentNode.insertBefore(e, a.nextSibling), b || a.parentNode.insertBefore(c, e.nextSibling)) : (a.parentNode.insertBefore(e, a), b || a.parentNode.insertBefore(c, 
                e));
                f.iframeStorage = k;
                e.style.display = f.cssFlex;
                var A = !1, t = 5;
                if (!q) {
                  var D = setInterval(function() {
                    if (0 >= t--) {
                      clearInterval(D);
                    } else {
                      var u = null != document.getElementById("keepa");
                      try {
                        if (!u) {
                          throw f.getPlaceholderAndInsertIFrame(f.insertIFrame), 1;
                        }
                        if (A) {
                          throw 1;
                        }
                        document.getElementById("keepa").contentDocument.location = iframeUrl;
                      } catch (C) {
                        clearInterval(D);
                      }
                    }
                  }, 4000), y = function() {
                    A = !0;
                    k.removeEventListener("load", y, !1);
                    f.synchronizeIFrame();
                  };
                  k.addEventListener("load", y, !1);
                }
              } else {
                f.swapIFrame();
              }
            }
          }
        });
      }
    }, handleIFrameMessage:function(a, b, d) {
      switch(a) {
        case "resize":
          W ||= !0;
          a = b;
          b = "" + b;
          -1 == b.indexOf("px") && (b += "px");
          let g = document.getElementById("keepaContainer");
          g && (g.style.height = b, q && (g.style.marginBottom = -(a * (1 - window.innerWidth / 935)) + "px"));
          break;
        case "ping":
          d({location:chrome.runtime.id + " " + document.location});
          break;
        case "openPage":
          chrome.runtime?.id && chrome.runtime.sendMessage({type:"openPage", url:b});
          break;
        case "getToken":
          let e = {d:f.domain, a:f.ASIN, eType:I, eVersion:p, url:document.location.href};
          chrome.runtime?.id ? f.sendMessageWithRetry({type:"getCookie", key:"token"}, 3, 1000, c => {
            e.token = c?.value;
            e.install = c?.install;
            d(e);
          }, c => {
            console.log("failed token retrieval: ", c);
            d(e);
          }) : d(e);
          break;
        case "setCookie":
          chrome.runtime?.id && chrome.runtime.sendMessage({type:"setCookie", key:b.key, val:b.val});
      }
    }, sendMessageWithRetry:function(a, b, d, g, e) {
      let c = 0, h = !1;
      const k = () => {
        c += 1;
        chrome.runtime.sendMessage(a, m => {
          h || (h = !0, g(m));
        });
        setTimeout(() => {
          h || (c < b ? setTimeout(k, d) : (console.log("Failed to receive a response after maximum retries."), e()));
        }, d);
      };
      k();
    }, synchronizeIFrame:function() {
      let a = 0;
      chrome.storage.local.get("s_boxHorizontal", function(g) {
        "undefined" != typeof g && "undefined" != typeof g.s_boxHorizontal && (a = g.s_boxHorizontal);
      });
      let b = window.innerWidth, d = !1;
      q || window.addEventListener("resize", function() {
        d || (d = !0, window.setTimeout(function() {
          if (b != window.innerWidth && "0" == a) {
            b = window.innerWidth;
            let g = window.innerWidth - 50;
            g -= 550;
            935 > g && (g = 935);
            document.getElementById("keepaContainer").style.width = g;
          }
          d = !1;
        }, 100));
      }, !1);
    }, getFirstInDOM:function(a, b) {
      let d;
      for (b = b.firstChild; b; b = b.nextSibling) {
        if ("IFRAME" !== b.nodeName && 1 === b.nodeType) {
          if (-1 !== a.indexOf(b)) {
            return b;
          }
          if (d = f.getFirstInDOM(a, b)) {
            return d;
          }
        }
      }
      return null;
    }, getClipRect:function(a) {
      "string" === typeof a && (a = document.querySelector(a));
      let b = 0, d = 0;
      const g = function(e) {
        b += e.offsetLeft;
        d += e.offsetTop;
        e.offsetParent && g(e.offsetParent);
      };
      g(a);
      return 0 == d && 0 == b ? f.getClipRect(a.parentNode) : {top:d, left:b, width:a.offsetWidth, height:a.offsetHeight};
    }, findPlaceholderBelowImages:function(a) {
      const b = a;
      let d, g = 100;
      do {
        for (g--, d = null; !d;) {
          d = a.nextElementSibling, d || (d = a.parentNode.nextElementSibling), a = d ? d : a.parentNode.parentNode, !d || "IFRAME" !== d.nodeName && "SCRIPT" !== d.nodeName && 1 === d.nodeType || (d = null);
        }
      } while (0 < g && 100 < f.getClipRect(d).left);
      return d ? d : b;
    }, httpGet:function(a, b) {
      const d = new XMLHttpRequest();
      b && (d.onreadystatechange = function() {
        4 == d.readyState && b.call(this, d.responseText);
      });
      d.open("GET", a, !0);
      d.send();
    }, httpPost2:function(a, b, d, g, e) {
      const c = new XMLHttpRequest();
      g && (c.onreadystatechange = function() {
        4 == c.readyState && g.call(this, c.responseText);
      });
      c.withCredentials = e;
      c.open("POST", a, !0);
      c.setRequestHeader("Content-Type", d);
      c.send(b);
    }, httpPost:function(a, b, d, g) {
      f.httpPost2(a, b, "text/plain;charset=UTF-8", d, g);
    }, lastBugReport:0, reportBug:function(a, b, d) {
      var g = Date.now();
      if (!(6E5 > g - f.lastBugReport || /(dead object)|(Script error)|(\.location is null)/i.test(a))) {
        f.lastBugReport = g;
        g = "";
        try {
          g = Error().stack.split("\n").splice(1).splice(1).join("&ensp;&lArr;&ensp;");
          if (!/(keepa|content)\.js/.test(g)) {
            return;
          }
          g = g.replace(RegExp("chrome-extension://.*?/content/", "g"), "").replace(/:[0-9]*?\)/g, ")").replace(/[ ]{2,}/g, "");
        } catch (e) {
        }
        if ("object" == typeof a) {
          try {
            a = a instanceof Error ? a.toString() : JSON.stringify(a);
          } catch (e) {
          }
        }
        null == d && (d = {exception:a, additional:b, url:document.location.host, stack:g});
        null != d.url && d.url.startsWith("blob:") || (d.keepaType = P ? "keepaChrome" : F ? "keepaOpera" : Q ? "keepaSafari" : E ? "keepaEdge" : "keepaFirefox", d.version = p, chrome.storage.local.get("token", function(e) {
          "undefined" == typeof e && (e = {token:"undefined"});
          f.httpPost("https://dyn.keepa.com/service/bugreport/?user=" + e.token + "&type=" + I, JSON.stringify(d));
        }));
      }
    }};
    window.onerror = function(a, b, d, g, e) {
      let c;
      "string" !== typeof a && (e = a.error, c = a.filename || a.fileName, d = a.lineno || a.lineNumber, g = a.colno || a.columnNumber, a = a.message || a.name || e.message || e.name);
      a = a.toString();
      let h = "";
      g = g || 0;
      if (e && e.stack) {
        h = e.stack;
        try {
          h = e.stack.split("\n").splice(1).splice(1).join("&ensp;&lArr;&ensp;");
          if (!/(keepa|content)\.js/.test(h)) {
            return;
          }
          h = h.replace(RegExp("chrome-extension://.*?/content/", "g"), "").replace(/:[0-9]*?\)/g, ")").replace(/[ ]{2,}/g, "");
        } catch (k) {
        }
      }
      "undefined" === typeof d && (d = 0);
      "undefined" === typeof g && (g = 0);
      a = {msg:a, url:(b || c || document.location.toString()) + ":" + d + ":" + g, stack:h};
      "ipbakfmnjdenbmoenhicfmoojdojjjem" != chrome.runtime.id && "blfpbjkajgamcehdbehfdioapoiibdmc" != chrome.runtime.id || console.log(a);
      f.reportBug(null, null, a);
      return !1;
    };
    if (window.self == window.top && !(/.*music\.amazon\..*/.test(document.location.href) || /.*primenow\.amazon\..*/.test(document.location.href) || /.*amazonlive-portal\.amazon\..*/.test(document.location.href) || /.*amazon\.com\/restaurants.*/.test(document.location.href))) {
      w = function(a) {
        chrome.runtime.sendMessage({type:"sendData", val:{key:"m1", payload:[a]}}, function() {
        });
      };
      var H = document.location.href, X = !1;
      document.addEventListener("DOMContentLoaded", function(a) {
        if (!X) {
          try {
            if (H.startsWith("https://test.keepa.com") || H.startsWith("https://keepa.com")) {
              let b = document.createElement("div");
              b.id = "extension";
              b.setAttribute("type", I);
              b.setAttribute("version", p);
              document.body.appendChild(b);
              X = !0;
            }
          } catch (b) {
          }
        }
      });
      var T = !1;
      chrome.runtime.sendMessage({type:"isActive"});
      if (!/((\/images)|(\/review)|(\/customer-reviews)|(ask\/questions)|(\/product-reviews))/.test(H) && !/\/e\/([BC][A-Z0-9]{9}|\d{9}(!?X|\d))/.test(H) && (H.match(/^https:\/\/.*?\.amazon\.(de|com|co\.uk|co\.jp|ca|fr|it|es|nl|in|com\.mx|com\.br|com\.au)\/[^.]*?(\/|[?&]ASIN=)([BC][A-Z0-9]{9}|\d{9}(!?X|\d))/) || H.match(/^https:\/\/.*?\.amazon\.(de|com|co\.uk|co\.jp|ca|fr|it|es|nl|in|com\.mx|com\.br|com\.au)\/(.*?)\/dp\/([BC][A-Z0-9]{9}|\d{9}(!?X|\d))\//) || H.match(/^https:\/\/.*?\.amzn\.(com).*?\/([BC][A-Z0-9]{9}|\d{9}(!?X|\d))/))) {
        f.onPageLoad(!1), T = !0;
      } else if (!H.match(/^https:\/\/.*?\.amazon\.(de|com|co\.uk|co\.jp|ca|fr|it|nl|es|in|com\.mx|com\.br|com\.au)\/[^.]*?\/(wishlist|registry)/) && !H.match(/^htt(p|ps):\/\/w*?\.amzn\.(com)[^.]*?\/(wishlist|registry)/)) {
        if (H.match("^https://.*?(?:seller).*?.amazon.(de|com|co.uk|co.jp|ca|fr|it|nl|es|in|com.mx|com.br|com.au)/")) {
          w("s" + f.getDomain(RegExp.$1));
          let a = !1;
          function b() {
            a || (a = !0, chrome.runtime.sendMessage({type:"isSellerActive"}), setTimeout(() => {
              a = !1;
            }, 1000));
          }
          b();
          document.addEventListener("mousemove", b);
          document.addEventListener("keydown", b);
          document.addEventListener("touchstart", b);
        } else {
          H.match(/^https:\/\/.*?(?:af.?ilia|part|assoc).*?\.amazon\.(de|com|co\.uk|co\.jp|nl|ca|fr|it|es|in|com\.mx|com\.br|com\.au)\/home/) && w("a" + f.getDomain(RegExp.$1));
        }
      }
      if (!q) {
        w = /^https:\/\/.*?\.amazon\.(de|com|co\.uk|co\.jp|ca|fr|it|es|nl|in|com\.mx|com\.br|com\.au)\/(s([\/?])|gp\/bestsellers\/|gp\/search\/|.*?\/b\/)/;
        (T || H.match(w)) && document.addEventListener("DOMContentLoaded", function(a) {
          let b = null;
          chrome.runtime.sendMessage({type:"getFilters"}, function(d) {
            b = d;
            if (null != b && null != b.value) {
              let g = function() {
                let m = H.match("^https?://.*?.amazon.(de|com|co.uk|co.jp|ca|fr|it|es|in|com.br|nl|com.mx)/");
                if (T || m) {
                  let J = f.getDomain(RegExp.$1);
                  scanner.scan(d.value, function(K) {
                    K.key = "f1";
                    K.domainId = J;
                    chrome.runtime.sendMessage({type:"sendData", val:K}, function(A) {
                    });
                  });
                }
              };
              g();
              let e = document.location.href, c = -1, h = -1, k = -1;
              h = setInterval(function() {
                e != document.location.href && (e = document.location.href, clearTimeout(k), k = setTimeout(function() {
                  g();
                }, 2000), clearTimeout(c), c = setTimeout(function() {
                  clearInterval(h);
                }, 180000));
              }, 2000);
              c = setTimeout(function() {
                clearInterval(h);
              }, 180000);
            }
          });
        });
        w = document.location.href;
        w.match("^https://.*?.amazon.(de|com|co.uk|co.jp|ca|fr|it|es|in|nl|com.mx|com.br|com.au)/") && -1 == w.indexOf("aws.amazon.") && -1 == w.indexOf("music.amazon.") && -1 == w.indexOf("services.amazon.") && -1 == w.indexOf("primenow.amazon.") && -1 == w.indexOf("kindle.amazon.") && -1 == w.indexOf("/gp/video/") && -1 == w.indexOf("watch.amazon.") && -1 == w.indexOf("developer.amazon.") && -1 == w.indexOf("skills-store.amazon.") && -1 == w.indexOf("pay.amazon.") && document.addEventListener("DOMContentLoaded", 
        function(a) {
          setTimeout(function() {
            chrome.runtime.onMessage.addListener(function(b, d, g) {
              switch(b.key) {
                case "collectASINs":
                  b = {};
                  var e = !1;
                  d = (document.querySelector("#main") || document.querySelector("#zg") || document.querySelector("#pageContent") || document.querySelector("#wishlist-page") || document.querySelector("#merchandised-content") || document.querySelector("#reactApp") || document.querySelector("[id^='contentGrid']") || document.querySelector("#container") || document.querySelector(".a-container") || document).getElementsByTagName("a");
                  if (void 0 != d && null != d) {
                    for (let h = 0; h < d.length; h++) {
                      var c = d[h].href;
                      /\/images/.test(c) || /\/e\/([BC][A-Z0-9]{9}|\d{9}(!?X|\d))/.test(c) || !c.match(/^https?:\/\/.*?\.amazon\.(de|com|co\.uk|co\.jp|ca|fr|it|es|nl|in|com\.mx|com\.br|com\.au)\/[^.]*?(?:\/|\?ASIN=)([BC][A-Z0-9]{9}|\d{9}(!?X|\d))/) && !c.match(/^https?:\/\/.*?\.amzn\.(com)[^.]*?\/([BC][A-Z0-9]{9}|\d{9}(!?X|\d))/) || (e = RegExp.$2, c = f.getDomain(RegExp.$1), "undefined" === typeof b[c] && (b[c] = []), b[c].includes(e) || b[c].push(e), e = !0);
                    }
                  }
                  if (e) {
                    g(b);
                  } else {
                    return alert("Keepa: No product ASINs found on this page."), !1;
                  }
                  break;
                default:
                  g({});
              }
            });
            chrome.storage.local.get(["overlayPriceGraph", "webGraphType", "webGraphRange"], ({overlayPriceGraph:b = 0, webGraphType:d = "[]", webGraphRange:g = 365} = {}) => {
              function e(y) {
                if (!A.has(y)) {
                  var u = y.href;
                  if (-1 < u.indexOf("/gp/video/") || -1 < u.indexOf("/images/") || K.test(u)) {
                    var C = null;
                  } else {
                    if (C = J.exec(u), !C || u.includes("offer-listing")) {
                      C = null;
                    } else {
                      b: {
                        if (u = C[2], "string" !== typeof u || 0 === u.length) {
                          var l = !1;
                        } else {
                          for (l of u) {
                            u = l.charCodeAt(0);
                            const v = 65 <= u && 90 >= u;
                            if (!(48 <= u && 57 >= u || v)) {
                              l = !1;
                              break b;
                            }
                          }
                          l = !0;
                        }
                      }
                      C = l ? {tld:C[1], asin:C[2]} : null;
                    }
                  }
                  C && (A.add(y), Z.add_events(k, m, y, y.href, C.tld, C.asin));
                }
              }
              function c() {
                t.forEach(e);
                t.clear();
                D = !1;
              }
              function h(y) {
                1 === y.nodeType && ("A" === y.tagName && t.add(y), y.querySelectorAll?.("a").forEach(u => t.add(u)), D || (D = !0, requestIdleCallback(c, {timeout:80})));
              }
              if (1 == b) {
                try {
                  var k = JSON.parse(d);
                } catch {
                  k = void 0;
                }
                var m = Number(g) || 365, J = /^(?:https?:\/\/[^/]*?\.amazon\.([^./]+\.[^./]+|[^./]+)\/[^.]*?(?:\/|\?ASIN=)|https?:\/\/[^/]*?\.amzn\.com\/)([BC][A-Z0-9]{9}|\d{9}(?:X|\d))/i, K = /\/e\/([BC][A-Z0-9]{9}|\d{9}(?:X|\d))/, A = new WeakSet();
                Array.from(document.links).forEach(e);
                var t = new Set(), D = !1;
                (new MutationObserver(y => {
                  y.forEach(u => u.addedNodes.forEach(h));
                })).observe(document.documentElement, {childList:!0, subtree:!0});
              }
            });
          }, 100);
        });
        var Z = {_urlCache:new Map(), _blobUrlCache:new Map(), _containerId:"pf_preview", _gen:0, _getContainer(a) {
          let b = a.getElementById(this._containerId);
          if (b) {
            return b;
          }
          b = a.createElement("div");
          b.id = this._containerId;
          Object.assign(b.style, {position:"fixed", bottom:"12px", right:"12px", zIndex:"10000000", background:"#fff", boxShadow:"0 1px 7px -2px #444", display:"none", pointerEvents:"none"});
          a.body.appendChild(b);
          return b;
        }, _createImage(a, b, d) {
          a = a.createElement("img");
          Object.assign(a.style, {display:"block", position:"relative", padding:"5px", borderTop:"2px solid #ff9f29", borderBottom:"3px solid grey", width:`${b}px`, height:`${d}px`, maxWidth:`${b}px`, maxHeight:`${d}px`});
          return a;
        }, _createSpinner(a, b, d) {
          a = a.createElement("div");
          Object.assign(a.style, {width:`${b}px`, height:`${d}px`, display:"flex", justifyContent:"center", alignItems:"center"});
          a.innerHTML = '\n      <style>\n        @keyframes sp { to { transform: rotate(360deg) } }\n        .sp{\n          width:32px;height:32px;\n          border:4px solid #ff9f29;\n          border-right-color:transparent;\n          border-radius:50%;\n          animation:sp .7s linear infinite;\n        }\n      </style><div class="sp"></div>';
          return a;
        }, _createError(a, b) {
          a = a.createElement("div");
          a.textContent = 429 === b ? "Keepa price graph is rate limited. Please slow down and try again in a minute." : `Couldn\u2019t load Keepa price graph (status ${b}).`;
          Object.assign(a.style, {padding:"8px 12px", width:"100%", textAlign:"center", color:"#c00", font:"12px/1.4 sans-serif"});
          return a;
        }, _viewportDims(a) {
          return {w:Math.min(1000, Math.max(128, Math.floor(0.30 * a.innerWidth))), h:Math.min(1000, Math.max(128, Math.floor(0.30 * a.innerHeight)))};
        }, _buildUrl({asin:a, tld:b, w:d, h:g, graphTypeArr:e, range:c}) {
          a = `https://graph.keepa.com/pricehistory.png?type=${300 > d || 150 > g ? 1 : 2}` + `&asin=${a}&domain=${b}&width=${d}&height=${g}`;
          return a = Array.isArray(e) ? a + (`&amazon=${e[0]}&new=${e[1]}` + `&used=${e[2]}&salesrank=${e[3]}` + `&range=${c}` + `&fba=${e[10]}&fbm=${e[7]}` + `&bb=${e[18]}&ld=${e[8]}` + `&bbu=${e[32]}&pe=${e[33]}` + `&wd=${e[9]}`) : a + "&amazon=1&new=1&used=1&salesrank=1&range=365";
        }, _getUrlCached(a) {
          const b = `${a.asin}|${a.w}x${a.h}|${a.range || 365}`;
          this._urlCache.has(b) || this._urlCache.set(b, this._buildUrl(a));
          return this._urlCache.get(b);
        }, _show(a, b, d, g, e, c) {
          const h = a.currentTarget.ownerDocument, k = h.defaultView;
          this._hide(h);
          const m = ++this._gen, {w:J, h:K} = this._viewportDims(k), A = this._getUrlCached({asin:e, tld:c, w:J, h:K, graphTypeArr:b, range:d}), t = this._getContainer(h), D = this._createImage(h, J, K), y = this._createSpinner(h, J, K);
          t._currentGen = m;
          b = k.innerWidth - a.clientX < 1.05 * J;
          a = k.innerHeight - a.clientY < 1.05 * K;
          t.style.right = b ? "" : "12px";
          t.style.left = b ? "12px" : "";
          t.style.bottom = a ? "" : "12px";
          t.style.top = a ? "12px" : "";
          t.innerHTML = "";
          t.appendChild(y);
          t.style.display = "block";
          const u = () => this._hide(h);
          k.addEventListener("scroll", u, {passive:!0, capture:!0});
          k.addEventListener("resize", u, {passive:!0});
          t._unbind = () => {
            k.removeEventListener("scroll", u, !0);
            k.removeEventListener("resize", u);
          };
          this._blobUrlCache.has(A) ? m === this._gen && (D.src = this._blobUrlCache.get(A), t.replaceChild(D, y)) : f.sendMessageWithRetry({type:"fetchGraph", url:A}, 3, 3000, C => {
            m === this._gen && (C.ok ? (C = C.dataUrl, this._blobUrlCache.set(A, C), D.src = C, D.decode().then(() => {
              m === this._gen && (t.contains(y) ? t.replaceChild(D, y) : t.appendChild(D));
            })) : 0 === C.status ? this._hide(h) : (C = this._createError(h, C.status), t.replaceChild(C, y)));
          }, () => {
            m === this._gen && this._hide(h);
          });
        }, _hide(a = document) {
          (a = a.getElementById(this._containerId)) && "none" !== a.style.display && (a.style.display = "none", a.innerHTML = "", a._unbind?.(), a._unbind = null);
        }, add_events(a, b, d, g, e, c) {
          g.includes("#") || "pf_prevImg" === d.getAttribute("keepaPreview") || (d.setAttribute("keepaPreview", "pf_prevImg"), d.addEventListener("pointerenter", h => this._show(h, a, b, g, c, e)), d.addEventListener("pointerleave", () => this._hide(d.ownerDocument)));
        }};
      }
    }
  }
})();

