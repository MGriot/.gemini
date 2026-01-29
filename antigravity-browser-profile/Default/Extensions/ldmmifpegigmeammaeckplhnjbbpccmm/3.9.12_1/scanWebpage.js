var _a, _b;
var siteReadableZoneMap = {
  ["chatgpt.com"]: "main"
};
function getHostname() {
  return window.location.hostname.replace(/^www./, "");
}
function isAKnownSite(doc) {
  return getHostname() in siteReadableZoneMap;
}
function getReadableZone() {
  return siteReadableZoneMap[getHostname()];
}
var ob2Str = (val) => {
  return {}.toString.call(val);
};
var isArray = (val) => {
  return Array.isArray(val);
};
var isString = (val) => {
  return String(val) === val;
};
var isNumber = (val) => {
  return Number(val) === val;
};
var isFunction = (val) => {
  return ob2Str(val) === "[object Function]";
};
var isObject$1 = (val) => {
  return ob2Str(val) === "[object Object]" && !isArray(val);
};
var isDate = (val) => {
  return val instanceof Date && !isNaN(val.valueOf());
};
var hasProperty = (ob, k) => {
  if (!ob || !k) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(ob, k);
};
var toStringX = (input2) => {
  var s = isNumber(input2) ? String(input2) : input2;
  if (!isString(s)) {
    throw new Error("InvalidInput: String required.");
  }
  return s;
};
var truncate = (s, len = 140) => {
  var txt = toStringX(s);
  var txtlen = txt.length;
  if (txtlen <= len) {
    return txt;
  }
  var subtxt = txt.substring(0, len).trim();
  var subtxtArr = subtxt.split(" ");
  var subtxtLen = subtxtArr.length;
  if (subtxtLen > 1) {
    subtxtArr.pop();
    return subtxtArr.map((word) => word.trim()).join(" ") + "...";
  }
  return subtxt.substring(0, len - 3) + "...";
};
var stripTags = (s) => {
  return toStringX(s).replace(/(<([^>]+)>)/ig, " ").replace(/\s\s+/g, " ").trim();
};
var pipe = (...fns) => {
  return fns.reduce((f, g) => (x2) => g(f(x2)));
};
var clone = (val, history = null) => {
  var stack = history || /* @__PURE__ */ new Set();
  if (stack.has(val)) {
    return val;
  }
  stack.add(val);
  if (isDate(val)) {
    return new Date(val.valueOf());
  }
  var copyObject = (o) => {
    var oo = /* @__PURE__ */ Object.create({});
    for (var k in o) {
      if (hasProperty(o, k)) {
        oo[k] = clone(o[k], stack);
      }
    }
    return oo;
  };
  var copyArray = (a) => {
    return [...a].map((e) => {
      if (isArray(e)) {
        return copyArray(e);
      } else if (isObject$1(e)) {
        return copyObject(e);
      }
      return clone(e, stack);
    });
  };
  if (isArray(val)) {
    return copyArray(val);
  }
  if (isObject$1(val)) {
    return copyObject(val);
  }
  return val;
};
var unique = (arr = []) => {
  return [...new Set(arr)];
};
var DOMParser = window.DOMParser;
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        var args = [null];
        args.push.apply(args, arguments);
        var Ctor = Function.bind.apply(f, args);
        return new Ctor();
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", {
    value: true
  });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var lib$5 = {};
var Parser$3 = {};
var Tokenizer = {};
var decode = {};
var decodeDataHtml = {};
Object.defineProperty(decodeDataHtml, "__esModule", {
  value: true
});
decodeDataHtml.default = new Uint16Array(
  // prettier-ignore
  '\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map(function(c) {
    return c.charCodeAt(0);
  })
);
var decodeDataXml = {};
Object.defineProperty(decodeDataXml, "__esModule", {
  value: true
});
decodeDataXml.default = new Uint16Array(
  // prettier-ignore
  "\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map(function(c) {
    return c.charCodeAt(0);
  })
);
var decode_codepoint = {};
(function(exports) {
  var _a2;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.replaceCodePoint = exports.fromCodePoint = void 0;
  var decodeMap = /* @__PURE__ */ new Map([
    [0, 65533],
    // C1 Unicode control character reference replacements
    [128, 8364],
    [130, 8218],
    [131, 402],
    [132, 8222],
    [133, 8230],
    [134, 8224],
    [135, 8225],
    [136, 710],
    [137, 8240],
    [138, 352],
    [139, 8249],
    [140, 338],
    [142, 381],
    [145, 8216],
    [146, 8217],
    [147, 8220],
    [148, 8221],
    [149, 8226],
    [150, 8211],
    [151, 8212],
    [152, 732],
    [153, 8482],
    [154, 353],
    [155, 8250],
    [156, 339],
    [158, 382],
    [159, 376]
  ]);
  exports.fromCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (_a2 = String.fromCodePoint) !== null && _a2 !== void 0 ? _a2 : function(codePoint) {
    var output = "";
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  };
  function replaceCodePoint(codePoint) {
    var _a22;
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return 65533;
    }
    return (_a22 = decodeMap.get(codePoint)) !== null && _a22 !== void 0 ? _a22 : codePoint;
  }
  exports.replaceCodePoint = replaceCodePoint;
  function decodeCodePoint(codePoint) {
    return (0, exports.fromCodePoint)(replaceCodePoint(codePoint));
  }
  exports.default = decodeCodePoint;
})(decode_codepoint);
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = {
        enumerable: true,
        get: function() {
          return m[k];
        }
      };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
      enumerable: true,
      value: v
    });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result2 = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding2(result2, mod, k);
    }
    __setModuleDefault2(result2, mod);
    return result2;
  };
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
      "default": mod
    };
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.decodeXML = exports.decodeHTMLStrict = exports.decodeHTMLAttribute = exports.decodeHTML = exports.determineBranch = exports.EntityDecoder = exports.DecodingMode = exports.BinTrieFlags = exports.fromCodePoint = exports.replaceCodePoint = exports.decodeCodePoint = exports.xmlDecodeTree = exports.htmlDecodeTree = void 0;
  var decode_data_html_js_1 = __importDefault2(decodeDataHtml);
  exports.htmlDecodeTree = decode_data_html_js_1.default;
  var decode_data_xml_js_1 = __importDefault2(decodeDataXml);
  exports.xmlDecodeTree = decode_data_xml_js_1.default;
  var decode_codepoint_js_1 = __importStar2(decode_codepoint);
  exports.decodeCodePoint = decode_codepoint_js_1.default;
  var decode_codepoint_js_2 = decode_codepoint;
  Object.defineProperty(exports, "replaceCodePoint", {
    enumerable: true,
    get: function() {
      return decode_codepoint_js_2.replaceCodePoint;
    }
  });
  Object.defineProperty(exports, "fromCodePoint", {
    enumerable: true,
    get: function() {
      return decode_codepoint_js_2.fromCodePoint;
    }
  });
  var CharCodes;
  (function(CharCodes2) {
    CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
    CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
    CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
    CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
    CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
    CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
    CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
    CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
    CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
    CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
    CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
    CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
  })(CharCodes || (CharCodes = {}));
  var TO_LOWER_BIT = 32;
  var BinTrieFlags;
  (function(BinTrieFlags2) {
    BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
    BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
    BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
  })(BinTrieFlags = exports.BinTrieFlags || (exports.BinTrieFlags = {}));
  function isNumber2(code) {
    return code >= CharCodes.ZERO && code <= CharCodes.NINE;
  }
  function isHexadecimalCharacter(code) {
    return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F;
  }
  function isAsciiAlphaNumeric(code) {
    return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z || isNumber2(code);
  }
  function isEntityInAttributeInvalidEnd(code) {
    return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
  }
  var EntityDecoderState;
  (function(EntityDecoderState2) {
    EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
    EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
    EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
    EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
    EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
  })(EntityDecoderState || (EntityDecoderState = {}));
  var DecodingMode;
  (function(DecodingMode2) {
    DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
    DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
    DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
  })(DecodingMode = exports.DecodingMode || (exports.DecodingMode = {}));
  var EntityDecoder = (
    /** @class */
    function() {
      function EntityDecoder2(decodeTree, emitCodePoint, errors) {
        this.decodeTree = decodeTree;
        this.emitCodePoint = emitCodePoint;
        this.errors = errors;
        this.state = EntityDecoderState.EntityStart;
        this.consumed = 1;
        this.result = 0;
        this.treeIndex = 0;
        this.excess = 1;
        this.decodeMode = DecodingMode.Strict;
      }
      EntityDecoder2.prototype.startEntity = function(decodeMode) {
        this.decodeMode = decodeMode;
        this.state = EntityDecoderState.EntityStart;
        this.result = 0;
        this.treeIndex = 0;
        this.excess = 1;
        this.consumed = 1;
      };
      EntityDecoder2.prototype.write = function(str, offset) {
        switch (this.state) {
          case EntityDecoderState.EntityStart: {
            if (str.charCodeAt(offset) === CharCodes.NUM) {
              this.state = EntityDecoderState.NumericStart;
              this.consumed += 1;
              return this.stateNumericStart(str, offset + 1);
            }
            this.state = EntityDecoderState.NamedEntity;
            return this.stateNamedEntity(str, offset);
          }
          case EntityDecoderState.NumericStart: {
            return this.stateNumericStart(str, offset);
          }
          case EntityDecoderState.NumericDecimal: {
            return this.stateNumericDecimal(str, offset);
          }
          case EntityDecoderState.NumericHex: {
            return this.stateNumericHex(str, offset);
          }
          case EntityDecoderState.NamedEntity: {
            return this.stateNamedEntity(str, offset);
          }
        }
      };
      EntityDecoder2.prototype.stateNumericStart = function(str, offset) {
        if (offset >= str.length) {
          return -1;
        }
        if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
          this.state = EntityDecoderState.NumericHex;
          this.consumed += 1;
          return this.stateNumericHex(str, offset + 1);
        }
        this.state = EntityDecoderState.NumericDecimal;
        return this.stateNumericDecimal(str, offset);
      };
      EntityDecoder2.prototype.addToNumericResult = function(str, start, end, base) {
        if (start !== end) {
          var digitCount = end - start;
          this.result = this.result * Math.pow(base, digitCount) + parseInt(str.substr(start, digitCount), base);
          this.consumed += digitCount;
        }
      };
      EntityDecoder2.prototype.stateNumericHex = function(str, offset) {
        var startIdx = offset;
        while (offset < str.length) {
          var char = str.charCodeAt(offset);
          if (isNumber2(char) || isHexadecimalCharacter(char)) {
            offset += 1;
          } else {
            this.addToNumericResult(str, startIdx, offset, 16);
            return this.emitNumericEntity(char, 3);
          }
        }
        this.addToNumericResult(str, startIdx, offset, 16);
        return -1;
      };
      EntityDecoder2.prototype.stateNumericDecimal = function(str, offset) {
        var startIdx = offset;
        while (offset < str.length) {
          var char = str.charCodeAt(offset);
          if (isNumber2(char)) {
            offset += 1;
          } else {
            this.addToNumericResult(str, startIdx, offset, 10);
            return this.emitNumericEntity(char, 2);
          }
        }
        this.addToNumericResult(str, startIdx, offset, 10);
        return -1;
      };
      EntityDecoder2.prototype.emitNumericEntity = function(lastCp, expectedLength) {
        var _a2;
        if (this.consumed <= expectedLength) {
          (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
          return 0;
        }
        if (lastCp === CharCodes.SEMI) {
          this.consumed += 1;
        } else if (this.decodeMode === DecodingMode.Strict) {
          return 0;
        }
        this.emitCodePoint((0, decode_codepoint_js_1.replaceCodePoint)(this.result), this.consumed);
        if (this.errors) {
          if (lastCp !== CharCodes.SEMI) {
            this.errors.missingSemicolonAfterCharacterReference();
          }
          this.errors.validateNumericCharacterReference(this.result);
        }
        return this.consumed;
      };
      EntityDecoder2.prototype.stateNamedEntity = function(str, offset) {
        var decodeTree = this.decodeTree;
        var current = decodeTree[this.treeIndex];
        var valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
        for (; offset < str.length; offset++, this.excess++) {
          var char = str.charCodeAt(offset);
          this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
          if (this.treeIndex < 0) {
            return this.result === 0 || // If we are parsing an attribute
            this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
            (valueLength === 0 || // And there should be no invalid characters.
            isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
          }
          current = decodeTree[this.treeIndex];
          valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
          if (valueLength !== 0) {
            if (char === CharCodes.SEMI) {
              return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
            }
            if (this.decodeMode !== DecodingMode.Strict) {
              this.result = this.treeIndex;
              this.consumed += this.excess;
              this.excess = 0;
            }
          }
        }
        return -1;
      };
      EntityDecoder2.prototype.emitNotTerminatedNamedEntity = function() {
        var _a2;
        var _b2 = this, result2 = _b2.result, decodeTree = _b2.decodeTree;
        var valueLength = (decodeTree[result2] & BinTrieFlags.VALUE_LENGTH) >> 14;
        this.emitNamedEntityData(result2, valueLength, this.consumed);
        (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
        return this.consumed;
      };
      EntityDecoder2.prototype.emitNamedEntityData = function(result2, valueLength, consumed) {
        var decodeTree = this.decodeTree;
        this.emitCodePoint(valueLength === 1 ? decodeTree[result2] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result2 + 1], consumed);
        if (valueLength === 3) {
          this.emitCodePoint(decodeTree[result2 + 2], consumed);
        }
        return consumed;
      };
      EntityDecoder2.prototype.end = function() {
        var _a2;
        switch (this.state) {
          case EntityDecoderState.NamedEntity: {
            return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
          }
          case EntityDecoderState.NumericDecimal: {
            return this.emitNumericEntity(0, 2);
          }
          case EntityDecoderState.NumericHex: {
            return this.emitNumericEntity(0, 3);
          }
          case EntityDecoderState.NumericStart: {
            (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
            return 0;
          }
          case EntityDecoderState.EntityStart: {
            return 0;
          }
        }
      };
      return EntityDecoder2;
    }()
  );
  exports.EntityDecoder = EntityDecoder;
  function getDecoder(decodeTree) {
    var ret = "";
    var decoder = new EntityDecoder(decodeTree, function(str) {
      return ret += (0, decode_codepoint_js_1.fromCodePoint)(str);
    });
    return function decodeWithTrie(str, decodeMode) {
      var lastIndex = 0;
      var offset = 0;
      while ((offset = str.indexOf("&", offset)) >= 0) {
        ret += str.slice(lastIndex, offset);
        decoder.startEntity(decodeMode);
        var len = decoder.write(
          str,
          // Skip the "&"
          offset + 1
        );
        if (len < 0) {
          lastIndex = offset + decoder.end();
          break;
        }
        lastIndex = offset + len;
        offset = len === 0 ? lastIndex + 1 : lastIndex;
      }
      var result2 = ret + str.slice(lastIndex);
      ret = "";
      return result2;
    };
  }
  function determineBranch(decodeTree, current, nodeIdx, char) {
    var branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
    var jumpOffset = current & BinTrieFlags.JUMP_TABLE;
    if (branchCount === 0) {
      return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
    }
    if (jumpOffset) {
      var value = char - jumpOffset;
      return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
    }
    var lo = nodeIdx;
    var hi = lo + branchCount - 1;
    while (lo <= hi) {
      var mid = lo + hi >>> 1;
      var midVal = decodeTree[mid];
      if (midVal < char) {
        lo = mid + 1;
      } else if (midVal > char) {
        hi = mid - 1;
      } else {
        return decodeTree[mid + branchCount];
      }
    }
    return -1;
  }
  exports.determineBranch = determineBranch;
  var htmlDecoder = getDecoder(decode_data_html_js_1.default);
  var xmlDecoder = getDecoder(decode_data_xml_js_1.default);
  function decodeHTML(str, mode) {
    if (mode === void 0) {
      mode = DecodingMode.Legacy;
    }
    return htmlDecoder(str, mode);
  }
  exports.decodeHTML = decodeHTML;
  function decodeHTMLAttribute(str) {
    return htmlDecoder(str, DecodingMode.Attribute);
  }
  exports.decodeHTMLAttribute = decodeHTMLAttribute;
  function decodeHTMLStrict(str) {
    return htmlDecoder(str, DecodingMode.Strict);
  }
  exports.decodeHTMLStrict = decodeHTMLStrict;
  function decodeXML(str) {
    return xmlDecoder(str, DecodingMode.Strict);
  }
  exports.decodeXML = decodeXML;
})(decode);
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.QuoteType = void 0;
  var decode_js_12 = decode;
  var CharCodes;
  (function(CharCodes2) {
    CharCodes2[CharCodes2["Tab"] = 9] = "Tab";
    CharCodes2[CharCodes2["NewLine"] = 10] = "NewLine";
    CharCodes2[CharCodes2["FormFeed"] = 12] = "FormFeed";
    CharCodes2[CharCodes2["CarriageReturn"] = 13] = "CarriageReturn";
    CharCodes2[CharCodes2["Space"] = 32] = "Space";
    CharCodes2[CharCodes2["ExclamationMark"] = 33] = "ExclamationMark";
    CharCodes2[CharCodes2["Number"] = 35] = "Number";
    CharCodes2[CharCodes2["Amp"] = 38] = "Amp";
    CharCodes2[CharCodes2["SingleQuote"] = 39] = "SingleQuote";
    CharCodes2[CharCodes2["DoubleQuote"] = 34] = "DoubleQuote";
    CharCodes2[CharCodes2["Dash"] = 45] = "Dash";
    CharCodes2[CharCodes2["Slash"] = 47] = "Slash";
    CharCodes2[CharCodes2["Zero"] = 48] = "Zero";
    CharCodes2[CharCodes2["Nine"] = 57] = "Nine";
    CharCodes2[CharCodes2["Semi"] = 59] = "Semi";
    CharCodes2[CharCodes2["Lt"] = 60] = "Lt";
    CharCodes2[CharCodes2["Eq"] = 61] = "Eq";
    CharCodes2[CharCodes2["Gt"] = 62] = "Gt";
    CharCodes2[CharCodes2["Questionmark"] = 63] = "Questionmark";
    CharCodes2[CharCodes2["UpperA"] = 65] = "UpperA";
    CharCodes2[CharCodes2["LowerA"] = 97] = "LowerA";
    CharCodes2[CharCodes2["UpperF"] = 70] = "UpperF";
    CharCodes2[CharCodes2["LowerF"] = 102] = "LowerF";
    CharCodes2[CharCodes2["UpperZ"] = 90] = "UpperZ";
    CharCodes2[CharCodes2["LowerZ"] = 122] = "LowerZ";
    CharCodes2[CharCodes2["LowerX"] = 120] = "LowerX";
    CharCodes2[CharCodes2["OpeningSquareBracket"] = 91] = "OpeningSquareBracket";
  })(CharCodes || (CharCodes = {}));
  var State;
  (function(State2) {
    State2[State2["Text"] = 1] = "Text";
    State2[State2["BeforeTagName"] = 2] = "BeforeTagName";
    State2[State2["InTagName"] = 3] = "InTagName";
    State2[State2["InSelfClosingTag"] = 4] = "InSelfClosingTag";
    State2[State2["BeforeClosingTagName"] = 5] = "BeforeClosingTagName";
    State2[State2["InClosingTagName"] = 6] = "InClosingTagName";
    State2[State2["AfterClosingTagName"] = 7] = "AfterClosingTagName";
    State2[State2["BeforeAttributeName"] = 8] = "BeforeAttributeName";
    State2[State2["InAttributeName"] = 9] = "InAttributeName";
    State2[State2["AfterAttributeName"] = 10] = "AfterAttributeName";
    State2[State2["BeforeAttributeValue"] = 11] = "BeforeAttributeValue";
    State2[State2["InAttributeValueDq"] = 12] = "InAttributeValueDq";
    State2[State2["InAttributeValueSq"] = 13] = "InAttributeValueSq";
    State2[State2["InAttributeValueNq"] = 14] = "InAttributeValueNq";
    State2[State2["BeforeDeclaration"] = 15] = "BeforeDeclaration";
    State2[State2["InDeclaration"] = 16] = "InDeclaration";
    State2[State2["InProcessingInstruction"] = 17] = "InProcessingInstruction";
    State2[State2["BeforeComment"] = 18] = "BeforeComment";
    State2[State2["CDATASequence"] = 19] = "CDATASequence";
    State2[State2["InSpecialComment"] = 20] = "InSpecialComment";
    State2[State2["InCommentLike"] = 21] = "InCommentLike";
    State2[State2["BeforeSpecialS"] = 22] = "BeforeSpecialS";
    State2[State2["SpecialStartSequence"] = 23] = "SpecialStartSequence";
    State2[State2["InSpecialTag"] = 24] = "InSpecialTag";
    State2[State2["BeforeEntity"] = 25] = "BeforeEntity";
    State2[State2["BeforeNumericEntity"] = 26] = "BeforeNumericEntity";
    State2[State2["InNamedEntity"] = 27] = "InNamedEntity";
    State2[State2["InNumericEntity"] = 28] = "InNumericEntity";
    State2[State2["InHexEntity"] = 29] = "InHexEntity";
  })(State || (State = {}));
  function isWhitespace(c) {
    return c === CharCodes.Space || c === CharCodes.NewLine || c === CharCodes.Tab || c === CharCodes.FormFeed || c === CharCodes.CarriageReturn;
  }
  function isEndOfTagSection(c) {
    return c === CharCodes.Slash || c === CharCodes.Gt || isWhitespace(c);
  }
  function isNumber2(c) {
    return c >= CharCodes.Zero && c <= CharCodes.Nine;
  }
  function isASCIIAlpha(c) {
    return c >= CharCodes.LowerA && c <= CharCodes.LowerZ || c >= CharCodes.UpperA && c <= CharCodes.UpperZ;
  }
  function isHexDigit(c) {
    return c >= CharCodes.UpperA && c <= CharCodes.UpperF || c >= CharCodes.LowerA && c <= CharCodes.LowerF;
  }
  var QuoteType;
  (function(QuoteType2) {
    QuoteType2[QuoteType2["NoValue"] = 0] = "NoValue";
    QuoteType2[QuoteType2["Unquoted"] = 1] = "Unquoted";
    QuoteType2[QuoteType2["Single"] = 2] = "Single";
    QuoteType2[QuoteType2["Double"] = 3] = "Double";
  })(QuoteType = exports.QuoteType || (exports.QuoteType = {}));
  var Sequences = {
    Cdata: new Uint8Array([67, 68, 65, 84, 65, 91]),
    CdataEnd: new Uint8Array([93, 93, 62]),
    CommentEnd: new Uint8Array([45, 45, 62]),
    ScriptEnd: new Uint8Array([60, 47, 115, 99, 114, 105, 112, 116]),
    StyleEnd: new Uint8Array([60, 47, 115, 116, 121, 108, 101]),
    TitleEnd: new Uint8Array([60, 47, 116, 105, 116, 108, 101])
    // `</title`
  };
  var Tokenizer2 = (
    /** @class */
    function() {
      function Tokenizer3(_a2, cbs) {
        var _b2 = _a2.xmlMode, xmlMode = _b2 === void 0 ? false : _b2, _c = _a2.decodeEntities, decodeEntities = _c === void 0 ? true : _c;
        this.cbs = cbs;
        this.state = State.Text;
        this.buffer = "";
        this.sectionStart = 0;
        this.index = 0;
        this.baseState = State.Text;
        this.isSpecial = false;
        this.running = true;
        this.offset = 0;
        this.currentSequence = void 0;
        this.sequenceIndex = 0;
        this.trieIndex = 0;
        this.trieCurrent = 0;
        this.entityResult = 0;
        this.entityExcess = 0;
        this.xmlMode = xmlMode;
        this.decodeEntities = decodeEntities;
        this.entityTrie = xmlMode ? decode_js_12.xmlDecodeTree : decode_js_12.htmlDecodeTree;
      }
      Tokenizer3.prototype.reset = function() {
        this.state = State.Text;
        this.buffer = "";
        this.sectionStart = 0;
        this.index = 0;
        this.baseState = State.Text;
        this.currentSequence = void 0;
        this.running = true;
        this.offset = 0;
      };
      Tokenizer3.prototype.write = function(chunk) {
        this.offset += this.buffer.length;
        this.buffer = chunk;
        this.parse();
      };
      Tokenizer3.prototype.end = function() {
        if (this.running)
          this.finish();
      };
      Tokenizer3.prototype.pause = function() {
        this.running = false;
      };
      Tokenizer3.prototype.resume = function() {
        this.running = true;
        if (this.index < this.buffer.length + this.offset) {
          this.parse();
        }
      };
      Tokenizer3.prototype.getIndex = function() {
        return this.index;
      };
      Tokenizer3.prototype.getSectionStart = function() {
        return this.sectionStart;
      };
      Tokenizer3.prototype.stateText = function(c) {
        if (c === CharCodes.Lt || !this.decodeEntities && this.fastForwardTo(CharCodes.Lt)) {
          if (this.index > this.sectionStart) {
            this.cbs.ontext(this.sectionStart, this.index);
          }
          this.state = State.BeforeTagName;
          this.sectionStart = this.index;
        } else if (this.decodeEntities && c === CharCodes.Amp) {
          this.state = State.BeforeEntity;
        }
      };
      Tokenizer3.prototype.stateSpecialStartSequence = function(c) {
        var isEnd = this.sequenceIndex === this.currentSequence.length;
        var isMatch = isEnd ? (
          // If we are at the end of the sequence, make sure the tag name has ended
          isEndOfTagSection(c)
        ) : (
          // Otherwise, do a case-insensitive comparison
          (c | 32) === this.currentSequence[this.sequenceIndex]
        );
        if (!isMatch) {
          this.isSpecial = false;
        } else if (!isEnd) {
          this.sequenceIndex++;
          return;
        }
        this.sequenceIndex = 0;
        this.state = State.InTagName;
        this.stateInTagName(c);
      };
      Tokenizer3.prototype.stateInSpecialTag = function(c) {
        if (this.sequenceIndex === this.currentSequence.length) {
          if (c === CharCodes.Gt || isWhitespace(c)) {
            var endOfText = this.index - this.currentSequence.length;
            if (this.sectionStart < endOfText) {
              var actualIndex = this.index;
              this.index = endOfText;
              this.cbs.ontext(this.sectionStart, endOfText);
              this.index = actualIndex;
            }
            this.isSpecial = false;
            this.sectionStart = endOfText + 2;
            this.stateInClosingTagName(c);
            return;
          }
          this.sequenceIndex = 0;
        }
        if ((c | 32) === this.currentSequence[this.sequenceIndex]) {
          this.sequenceIndex += 1;
        } else if (this.sequenceIndex === 0) {
          if (this.currentSequence === Sequences.TitleEnd) {
            if (this.decodeEntities && c === CharCodes.Amp) {
              this.state = State.BeforeEntity;
            }
          } else if (this.fastForwardTo(CharCodes.Lt)) {
            this.sequenceIndex = 1;
          }
        } else {
          this.sequenceIndex = Number(c === CharCodes.Lt);
        }
      };
      Tokenizer3.prototype.stateCDATASequence = function(c) {
        if (c === Sequences.Cdata[this.sequenceIndex]) {
          if (++this.sequenceIndex === Sequences.Cdata.length) {
            this.state = State.InCommentLike;
            this.currentSequence = Sequences.CdataEnd;
            this.sequenceIndex = 0;
            this.sectionStart = this.index + 1;
          }
        } else {
          this.sequenceIndex = 0;
          this.state = State.InDeclaration;
          this.stateInDeclaration(c);
        }
      };
      Tokenizer3.prototype.fastForwardTo = function(c) {
        while (++this.index < this.buffer.length + this.offset) {
          if (this.buffer.charCodeAt(this.index - this.offset) === c) {
            return true;
          }
        }
        this.index = this.buffer.length + this.offset - 1;
        return false;
      };
      Tokenizer3.prototype.stateInCommentLike = function(c) {
        if (c === this.currentSequence[this.sequenceIndex]) {
          if (++this.sequenceIndex === this.currentSequence.length) {
            if (this.currentSequence === Sequences.CdataEnd) {
              this.cbs.oncdata(this.sectionStart, this.index, 2);
            } else {
              this.cbs.oncomment(this.sectionStart, this.index, 2);
            }
            this.sequenceIndex = 0;
            this.sectionStart = this.index + 1;
            this.state = State.Text;
          }
        } else if (this.sequenceIndex === 0) {
          if (this.fastForwardTo(this.currentSequence[0])) {
            this.sequenceIndex = 1;
          }
        } else if (c !== this.currentSequence[this.sequenceIndex - 1]) {
          this.sequenceIndex = 0;
        }
      };
      Tokenizer3.prototype.isTagStartChar = function(c) {
        return this.xmlMode ? !isEndOfTagSection(c) : isASCIIAlpha(c);
      };
      Tokenizer3.prototype.startSpecial = function(sequence, offset) {
        this.isSpecial = true;
        this.currentSequence = sequence;
        this.sequenceIndex = offset;
        this.state = State.SpecialStartSequence;
      };
      Tokenizer3.prototype.stateBeforeTagName = function(c) {
        if (c === CharCodes.ExclamationMark) {
          this.state = State.BeforeDeclaration;
          this.sectionStart = this.index + 1;
        } else if (c === CharCodes.Questionmark) {
          this.state = State.InProcessingInstruction;
          this.sectionStart = this.index + 1;
        } else if (this.isTagStartChar(c)) {
          var lower = c | 32;
          this.sectionStart = this.index;
          if (!this.xmlMode && lower === Sequences.TitleEnd[2]) {
            this.startSpecial(Sequences.TitleEnd, 3);
          } else {
            this.state = !this.xmlMode && lower === Sequences.ScriptEnd[2] ? State.BeforeSpecialS : State.InTagName;
          }
        } else if (c === CharCodes.Slash) {
          this.state = State.BeforeClosingTagName;
        } else {
          this.state = State.Text;
          this.stateText(c);
        }
      };
      Tokenizer3.prototype.stateInTagName = function(c) {
        if (isEndOfTagSection(c)) {
          this.cbs.onopentagname(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.state = State.BeforeAttributeName;
          this.stateBeforeAttributeName(c);
        }
      };
      Tokenizer3.prototype.stateBeforeClosingTagName = function(c) {
        if (isWhitespace(c))
          ;
        else if (c === CharCodes.Gt) {
          this.state = State.Text;
        } else {
          this.state = this.isTagStartChar(c) ? State.InClosingTagName : State.InSpecialComment;
          this.sectionStart = this.index;
        }
      };
      Tokenizer3.prototype.stateInClosingTagName = function(c) {
        if (c === CharCodes.Gt || isWhitespace(c)) {
          this.cbs.onclosetag(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.state = State.AfterClosingTagName;
          this.stateAfterClosingTagName(c);
        }
      };
      Tokenizer3.prototype.stateAfterClosingTagName = function(c) {
        if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
          this.state = State.Text;
          this.baseState = State.Text;
          this.sectionStart = this.index + 1;
        }
      };
      Tokenizer3.prototype.stateBeforeAttributeName = function(c) {
        if (c === CharCodes.Gt) {
          this.cbs.onopentagend(this.index);
          if (this.isSpecial) {
            this.state = State.InSpecialTag;
            this.sequenceIndex = 0;
          } else {
            this.state = State.Text;
          }
          this.baseState = this.state;
          this.sectionStart = this.index + 1;
        } else if (c === CharCodes.Slash) {
          this.state = State.InSelfClosingTag;
        } else if (!isWhitespace(c)) {
          this.state = State.InAttributeName;
          this.sectionStart = this.index;
        }
      };
      Tokenizer3.prototype.stateInSelfClosingTag = function(c) {
        if (c === CharCodes.Gt) {
          this.cbs.onselfclosingtag(this.index);
          this.state = State.Text;
          this.baseState = State.Text;
          this.sectionStart = this.index + 1;
          this.isSpecial = false;
        } else if (!isWhitespace(c)) {
          this.state = State.BeforeAttributeName;
          this.stateBeforeAttributeName(c);
        }
      };
      Tokenizer3.prototype.stateInAttributeName = function(c) {
        if (c === CharCodes.Eq || isEndOfTagSection(c)) {
          this.cbs.onattribname(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.state = State.AfterAttributeName;
          this.stateAfterAttributeName(c);
        }
      };
      Tokenizer3.prototype.stateAfterAttributeName = function(c) {
        if (c === CharCodes.Eq) {
          this.state = State.BeforeAttributeValue;
        } else if (c === CharCodes.Slash || c === CharCodes.Gt) {
          this.cbs.onattribend(QuoteType.NoValue, this.index);
          this.state = State.BeforeAttributeName;
          this.stateBeforeAttributeName(c);
        } else if (!isWhitespace(c)) {
          this.cbs.onattribend(QuoteType.NoValue, this.index);
          this.state = State.InAttributeName;
          this.sectionStart = this.index;
        }
      };
      Tokenizer3.prototype.stateBeforeAttributeValue = function(c) {
        if (c === CharCodes.DoubleQuote) {
          this.state = State.InAttributeValueDq;
          this.sectionStart = this.index + 1;
        } else if (c === CharCodes.SingleQuote) {
          this.state = State.InAttributeValueSq;
          this.sectionStart = this.index + 1;
        } else if (!isWhitespace(c)) {
          this.sectionStart = this.index;
          this.state = State.InAttributeValueNq;
          this.stateInAttributeValueNoQuotes(c);
        }
      };
      Tokenizer3.prototype.handleInAttributeValue = function(c, quote) {
        if (c === quote || !this.decodeEntities && this.fastForwardTo(quote)) {
          this.cbs.onattribdata(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.cbs.onattribend(quote === CharCodes.DoubleQuote ? QuoteType.Double : QuoteType.Single, this.index);
          this.state = State.BeforeAttributeName;
        } else if (this.decodeEntities && c === CharCodes.Amp) {
          this.baseState = this.state;
          this.state = State.BeforeEntity;
        }
      };
      Tokenizer3.prototype.stateInAttributeValueDoubleQuotes = function(c) {
        this.handleInAttributeValue(c, CharCodes.DoubleQuote);
      };
      Tokenizer3.prototype.stateInAttributeValueSingleQuotes = function(c) {
        this.handleInAttributeValue(c, CharCodes.SingleQuote);
      };
      Tokenizer3.prototype.stateInAttributeValueNoQuotes = function(c) {
        if (isWhitespace(c) || c === CharCodes.Gt) {
          this.cbs.onattribdata(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.cbs.onattribend(QuoteType.Unquoted, this.index);
          this.state = State.BeforeAttributeName;
          this.stateBeforeAttributeName(c);
        } else if (this.decodeEntities && c === CharCodes.Amp) {
          this.baseState = this.state;
          this.state = State.BeforeEntity;
        }
      };
      Tokenizer3.prototype.stateBeforeDeclaration = function(c) {
        if (c === CharCodes.OpeningSquareBracket) {
          this.state = State.CDATASequence;
          this.sequenceIndex = 0;
        } else {
          this.state = c === CharCodes.Dash ? State.BeforeComment : State.InDeclaration;
        }
      };
      Tokenizer3.prototype.stateInDeclaration = function(c) {
        if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
          this.cbs.ondeclaration(this.sectionStart, this.index);
          this.state = State.Text;
          this.sectionStart = this.index + 1;
        }
      };
      Tokenizer3.prototype.stateInProcessingInstruction = function(c) {
        if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
          this.cbs.onprocessinginstruction(this.sectionStart, this.index);
          this.state = State.Text;
          this.sectionStart = this.index + 1;
        }
      };
      Tokenizer3.prototype.stateBeforeComment = function(c) {
        if (c === CharCodes.Dash) {
          this.state = State.InCommentLike;
          this.currentSequence = Sequences.CommentEnd;
          this.sequenceIndex = 2;
          this.sectionStart = this.index + 1;
        } else {
          this.state = State.InDeclaration;
        }
      };
      Tokenizer3.prototype.stateInSpecialComment = function(c) {
        if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
          this.cbs.oncomment(this.sectionStart, this.index, 0);
          this.state = State.Text;
          this.sectionStart = this.index + 1;
        }
      };
      Tokenizer3.prototype.stateBeforeSpecialS = function(c) {
        var lower = c | 32;
        if (lower === Sequences.ScriptEnd[3]) {
          this.startSpecial(Sequences.ScriptEnd, 4);
        } else if (lower === Sequences.StyleEnd[3]) {
          this.startSpecial(Sequences.StyleEnd, 4);
        } else {
          this.state = State.InTagName;
          this.stateInTagName(c);
        }
      };
      Tokenizer3.prototype.stateBeforeEntity = function(c) {
        this.entityExcess = 1;
        this.entityResult = 0;
        if (c === CharCodes.Number) {
          this.state = State.BeforeNumericEntity;
        } else if (c === CharCodes.Amp)
          ;
        else {
          this.trieIndex = 0;
          this.trieCurrent = this.entityTrie[0];
          this.state = State.InNamedEntity;
          this.stateInNamedEntity(c);
        }
      };
      Tokenizer3.prototype.stateInNamedEntity = function(c) {
        this.entityExcess += 1;
        this.trieIndex = (0, decode_js_12.determineBranch)(this.entityTrie, this.trieCurrent, this.trieIndex + 1, c);
        if (this.trieIndex < 0) {
          this.emitNamedEntity();
          this.index--;
          return;
        }
        this.trieCurrent = this.entityTrie[this.trieIndex];
        var masked = this.trieCurrent & decode_js_12.BinTrieFlags.VALUE_LENGTH;
        if (masked) {
          var valueLength = (masked >> 14) - 1;
          if (!this.allowLegacyEntity() && c !== CharCodes.Semi) {
            this.trieIndex += valueLength;
          } else {
            var entityStart = this.index - this.entityExcess + 1;
            if (entityStart > this.sectionStart) {
              this.emitPartial(this.sectionStart, entityStart);
            }
            this.entityResult = this.trieIndex;
            this.trieIndex += valueLength;
            this.entityExcess = 0;
            this.sectionStart = this.index + 1;
            if (valueLength === 0) {
              this.emitNamedEntity();
            }
          }
        }
      };
      Tokenizer3.prototype.emitNamedEntity = function() {
        this.state = this.baseState;
        if (this.entityResult === 0) {
          return;
        }
        var valueLength = (this.entityTrie[this.entityResult] & decode_js_12.BinTrieFlags.VALUE_LENGTH) >> 14;
        switch (valueLength) {
          case 1: {
            this.emitCodePoint(this.entityTrie[this.entityResult] & ~decode_js_12.BinTrieFlags.VALUE_LENGTH);
            break;
          }
          case 2: {
            this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
            break;
          }
          case 3: {
            this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
            this.emitCodePoint(this.entityTrie[this.entityResult + 2]);
          }
        }
      };
      Tokenizer3.prototype.stateBeforeNumericEntity = function(c) {
        if ((c | 32) === CharCodes.LowerX) {
          this.entityExcess++;
          this.state = State.InHexEntity;
        } else {
          this.state = State.InNumericEntity;
          this.stateInNumericEntity(c);
        }
      };
      Tokenizer3.prototype.emitNumericEntity = function(strict) {
        var entityStart = this.index - this.entityExcess - 1;
        var numberStart = entityStart + 2 + Number(this.state === State.InHexEntity);
        if (numberStart !== this.index) {
          if (entityStart > this.sectionStart) {
            this.emitPartial(this.sectionStart, entityStart);
          }
          this.sectionStart = this.index + Number(strict);
          this.emitCodePoint((0, decode_js_12.replaceCodePoint)(this.entityResult));
        }
        this.state = this.baseState;
      };
      Tokenizer3.prototype.stateInNumericEntity = function(c) {
        if (c === CharCodes.Semi) {
          this.emitNumericEntity(true);
        } else if (isNumber2(c)) {
          this.entityResult = this.entityResult * 10 + (c - CharCodes.Zero);
          this.entityExcess++;
        } else {
          if (this.allowLegacyEntity()) {
            this.emitNumericEntity(false);
          } else {
            this.state = this.baseState;
          }
          this.index--;
        }
      };
      Tokenizer3.prototype.stateInHexEntity = function(c) {
        if (c === CharCodes.Semi) {
          this.emitNumericEntity(true);
        } else if (isNumber2(c)) {
          this.entityResult = this.entityResult * 16 + (c - CharCodes.Zero);
          this.entityExcess++;
        } else if (isHexDigit(c)) {
          this.entityResult = this.entityResult * 16 + ((c | 32) - CharCodes.LowerA + 10);
          this.entityExcess++;
        } else {
          if (this.allowLegacyEntity()) {
            this.emitNumericEntity(false);
          } else {
            this.state = this.baseState;
          }
          this.index--;
        }
      };
      Tokenizer3.prototype.allowLegacyEntity = function() {
        return !this.xmlMode && (this.baseState === State.Text || this.baseState === State.InSpecialTag);
      };
      Tokenizer3.prototype.cleanup = function() {
        if (this.running && this.sectionStart !== this.index) {
          if (this.state === State.Text || this.state === State.InSpecialTag && this.sequenceIndex === 0) {
            this.cbs.ontext(this.sectionStart, this.index);
            this.sectionStart = this.index;
          } else if (this.state === State.InAttributeValueDq || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueNq) {
            this.cbs.onattribdata(this.sectionStart, this.index);
            this.sectionStart = this.index;
          }
        }
      };
      Tokenizer3.prototype.shouldContinue = function() {
        return this.index < this.buffer.length + this.offset && this.running;
      };
      Tokenizer3.prototype.parse = function() {
        while (this.shouldContinue()) {
          var c = this.buffer.charCodeAt(this.index - this.offset);
          switch (this.state) {
            case State.Text: {
              this.stateText(c);
              break;
            }
            case State.SpecialStartSequence: {
              this.stateSpecialStartSequence(c);
              break;
            }
            case State.InSpecialTag: {
              this.stateInSpecialTag(c);
              break;
            }
            case State.CDATASequence: {
              this.stateCDATASequence(c);
              break;
            }
            case State.InAttributeValueDq: {
              this.stateInAttributeValueDoubleQuotes(c);
              break;
            }
            case State.InAttributeName: {
              this.stateInAttributeName(c);
              break;
            }
            case State.InCommentLike: {
              this.stateInCommentLike(c);
              break;
            }
            case State.InSpecialComment: {
              this.stateInSpecialComment(c);
              break;
            }
            case State.BeforeAttributeName: {
              this.stateBeforeAttributeName(c);
              break;
            }
            case State.InTagName: {
              this.stateInTagName(c);
              break;
            }
            case State.InClosingTagName: {
              this.stateInClosingTagName(c);
              break;
            }
            case State.BeforeTagName: {
              this.stateBeforeTagName(c);
              break;
            }
            case State.AfterAttributeName: {
              this.stateAfterAttributeName(c);
              break;
            }
            case State.InAttributeValueSq: {
              this.stateInAttributeValueSingleQuotes(c);
              break;
            }
            case State.BeforeAttributeValue: {
              this.stateBeforeAttributeValue(c);
              break;
            }
            case State.BeforeClosingTagName: {
              this.stateBeforeClosingTagName(c);
              break;
            }
            case State.AfterClosingTagName: {
              this.stateAfterClosingTagName(c);
              break;
            }
            case State.BeforeSpecialS: {
              this.stateBeforeSpecialS(c);
              break;
            }
            case State.InAttributeValueNq: {
              this.stateInAttributeValueNoQuotes(c);
              break;
            }
            case State.InSelfClosingTag: {
              this.stateInSelfClosingTag(c);
              break;
            }
            case State.InDeclaration: {
              this.stateInDeclaration(c);
              break;
            }
            case State.BeforeDeclaration: {
              this.stateBeforeDeclaration(c);
              break;
            }
            case State.BeforeComment: {
              this.stateBeforeComment(c);
              break;
            }
            case State.InProcessingInstruction: {
              this.stateInProcessingInstruction(c);
              break;
            }
            case State.InNamedEntity: {
              this.stateInNamedEntity(c);
              break;
            }
            case State.BeforeEntity: {
              this.stateBeforeEntity(c);
              break;
            }
            case State.InHexEntity: {
              this.stateInHexEntity(c);
              break;
            }
            case State.InNumericEntity: {
              this.stateInNumericEntity(c);
              break;
            }
            default: {
              this.stateBeforeNumericEntity(c);
            }
          }
          this.index++;
        }
        this.cleanup();
      };
      Tokenizer3.prototype.finish = function() {
        if (this.state === State.InNamedEntity) {
          this.emitNamedEntity();
        }
        if (this.sectionStart < this.index) {
          this.handleTrailingData();
        }
        this.cbs.onend();
      };
      Tokenizer3.prototype.handleTrailingData = function() {
        var endIndex = this.buffer.length + this.offset;
        if (this.state === State.InCommentLike) {
          if (this.currentSequence === Sequences.CdataEnd) {
            this.cbs.oncdata(this.sectionStart, endIndex, 0);
          } else {
            this.cbs.oncomment(this.sectionStart, endIndex, 0);
          }
        } else if (this.state === State.InNumericEntity && this.allowLegacyEntity()) {
          this.emitNumericEntity(false);
        } else if (this.state === State.InHexEntity && this.allowLegacyEntity()) {
          this.emitNumericEntity(false);
        } else if (this.state === State.InTagName || this.state === State.BeforeAttributeName || this.state === State.BeforeAttributeValue || this.state === State.AfterAttributeName || this.state === State.InAttributeName || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueDq || this.state === State.InAttributeValueNq || this.state === State.InClosingTagName)
          ;
        else {
          this.cbs.ontext(this.sectionStart, endIndex);
        }
      };
      Tokenizer3.prototype.emitPartial = function(start, endIndex) {
        if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) {
          this.cbs.onattribdata(start, endIndex);
        } else {
          this.cbs.ontext(start, endIndex);
        }
      };
      Tokenizer3.prototype.emitCodePoint = function(cp) {
        if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) {
          this.cbs.onattribentity(cp);
        } else {
          this.cbs.ontextentity(cp);
        }
      };
      return Tokenizer3;
    }()
  );
  exports.default = Tokenizer2;
})(Tokenizer);
var __createBinding$1 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault$1 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$1 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result2 = {};
  if (mod != null) {
    for (var k in mod)
      if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
        __createBinding$1(result2, mod, k);
  }
  __setModuleDefault$1(result2, mod);
  return result2;
};
Object.defineProperty(Parser$3, "__esModule", {
  value: true
});
Parser$3.Parser = void 0;
var Tokenizer_js_1 = __importStar$1(Tokenizer);
var decode_js_1 = decode;
var formTags = /* @__PURE__ */ new Set(["input", "option", "optgroup", "select", "button", "datalist", "textarea"]);
var pTag = /* @__PURE__ */ new Set(["p"]);
var tableSectionTags = /* @__PURE__ */ new Set(["thead", "tbody"]);
var ddtTags = /* @__PURE__ */ new Set(["dd", "dt"]);
var rtpTags = /* @__PURE__ */ new Set(["rt", "rp"]);
var openImpliesClose = /* @__PURE__ */ new Map([["tr", /* @__PURE__ */ new Set(["tr", "th", "td"])], ["th", /* @__PURE__ */ new Set(["th"])], ["td", /* @__PURE__ */ new Set(["thead", "th", "td"])], ["body", /* @__PURE__ */ new Set(["head", "link", "script"])], ["li", /* @__PURE__ */ new Set(["li"])], ["p", pTag], ["h1", pTag], ["h2", pTag], ["h3", pTag], ["h4", pTag], ["h5", pTag], ["h6", pTag], ["select", formTags], ["input", formTags], ["output", formTags], ["button", formTags], ["datalist", formTags], ["textarea", formTags], ["option", /* @__PURE__ */ new Set(["option"])], ["optgroup", /* @__PURE__ */ new Set(["optgroup", "option"])], ["dd", ddtTags], ["dt", ddtTags], ["address", pTag], ["article", pTag], ["aside", pTag], ["blockquote", pTag], ["details", pTag], ["div", pTag], ["dl", pTag], ["fieldset", pTag], ["figcaption", pTag], ["figure", pTag], ["footer", pTag], ["form", pTag], ["header", pTag], ["hr", pTag], ["main", pTag], ["nav", pTag], ["ol", pTag], ["pre", pTag], ["section", pTag], ["table", pTag], ["ul", pTag], ["rt", rtpTags], ["rp", rtpTags], ["tbody", tableSectionTags], ["tfoot", tableSectionTags]]);
var voidElements = /* @__PURE__ */ new Set(["area", "base", "basefont", "br", "col", "command", "embed", "frame", "hr", "img", "input", "isindex", "keygen", "link", "meta", "param", "source", "track", "wbr"]);
var foreignContextElements = /* @__PURE__ */ new Set(["math", "svg"]);
var htmlIntegrationElements = /* @__PURE__ */ new Set(["mi", "mo", "mn", "ms", "mtext", "annotation-xml", "foreignobject", "desc", "title"]);
var reNameEnd = /\s|\//;
var Parser$2 = (
  /** @class */
  function() {
    function Parser3(cbs, options) {
      if (options === void 0) {
        options = {};
      }
      var _a2, _b2, _c, _d, _e;
      this.options = options;
      this.startIndex = 0;
      this.endIndex = 0;
      this.openTagStart = 0;
      this.tagname = "";
      this.attribname = "";
      this.attribvalue = "";
      this.attribs = null;
      this.stack = [];
      this.foreignContext = [];
      this.buffers = [];
      this.bufferOffset = 0;
      this.writeIndex = 0;
      this.ended = false;
      this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
      this.lowerCaseTagNames = (_a2 = options.lowerCaseTags) !== null && _a2 !== void 0 ? _a2 : !options.xmlMode;
      this.lowerCaseAttributeNames = (_b2 = options.lowerCaseAttributeNames) !== null && _b2 !== void 0 ? _b2 : !options.xmlMode;
      this.tokenizer = new ((_c = options.Tokenizer) !== null && _c !== void 0 ? _c : Tokenizer_js_1.default)(this.options, this);
      (_e = (_d = this.cbs).onparserinit) === null || _e === void 0 ? void 0 : _e.call(_d, this);
    }
    Parser3.prototype.ontext = function(start, endIndex) {
      var _a2, _b2;
      var data = this.getSlice(start, endIndex);
      this.endIndex = endIndex - 1;
      (_b2 = (_a2 = this.cbs).ontext) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, data);
      this.startIndex = endIndex;
    };
    Parser3.prototype.ontextentity = function(cp) {
      var _a2, _b2;
      var index = this.tokenizer.getSectionStart();
      this.endIndex = index - 1;
      (_b2 = (_a2 = this.cbs).ontext) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, (0, decode_js_1.fromCodePoint)(cp));
      this.startIndex = index;
    };
    Parser3.prototype.isVoidElement = function(name) {
      return !this.options.xmlMode && voidElements.has(name);
    };
    Parser3.prototype.onopentagname = function(start, endIndex) {
      this.endIndex = endIndex;
      var name = this.getSlice(start, endIndex);
      if (this.lowerCaseTagNames) {
        name = name.toLowerCase();
      }
      this.emitOpenTag(name);
    };
    Parser3.prototype.emitOpenTag = function(name) {
      var _a2, _b2, _c, _d;
      this.openTagStart = this.startIndex;
      this.tagname = name;
      var impliesClose = !this.options.xmlMode && openImpliesClose.get(name);
      if (impliesClose) {
        while (this.stack.length > 0 && impliesClose.has(this.stack[this.stack.length - 1])) {
          var element = this.stack.pop();
          (_b2 = (_a2 = this.cbs).onclosetag) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, element, true);
        }
      }
      if (!this.isVoidElement(name)) {
        this.stack.push(name);
        if (foreignContextElements.has(name)) {
          this.foreignContext.push(true);
        } else if (htmlIntegrationElements.has(name)) {
          this.foreignContext.push(false);
        }
      }
      (_d = (_c = this.cbs).onopentagname) === null || _d === void 0 ? void 0 : _d.call(_c, name);
      if (this.cbs.onopentag)
        this.attribs = {};
    };
    Parser3.prototype.endOpenTag = function(isImplied) {
      var _a2, _b2;
      this.startIndex = this.openTagStart;
      if (this.attribs) {
        (_b2 = (_a2 = this.cbs).onopentag) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, this.tagname, this.attribs, isImplied);
        this.attribs = null;
      }
      if (this.cbs.onclosetag && this.isVoidElement(this.tagname)) {
        this.cbs.onclosetag(this.tagname, true);
      }
      this.tagname = "";
    };
    Parser3.prototype.onopentagend = function(endIndex) {
      this.endIndex = endIndex;
      this.endOpenTag(false);
      this.startIndex = endIndex + 1;
    };
    Parser3.prototype.onclosetag = function(start, endIndex) {
      var _a2, _b2, _c, _d, _e, _f;
      this.endIndex = endIndex;
      var name = this.getSlice(start, endIndex);
      if (this.lowerCaseTagNames) {
        name = name.toLowerCase();
      }
      if (foreignContextElements.has(name) || htmlIntegrationElements.has(name)) {
        this.foreignContext.pop();
      }
      if (!this.isVoidElement(name)) {
        var pos = this.stack.lastIndexOf(name);
        if (pos !== -1) {
          if (this.cbs.onclosetag) {
            var count = this.stack.length - pos;
            while (count--) {
              this.cbs.onclosetag(this.stack.pop(), count !== 0);
            }
          } else
            this.stack.length = pos;
        } else if (!this.options.xmlMode && name === "p") {
          this.emitOpenTag("p");
          this.closeCurrentTag(true);
        }
      } else if (!this.options.xmlMode && name === "br") {
        (_b2 = (_a2 = this.cbs).onopentagname) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, "br");
        (_d = (_c = this.cbs).onopentag) === null || _d === void 0 ? void 0 : _d.call(_c, "br", {}, true);
        (_f = (_e = this.cbs).onclosetag) === null || _f === void 0 ? void 0 : _f.call(_e, "br", false);
      }
      this.startIndex = endIndex + 1;
    };
    Parser3.prototype.onselfclosingtag = function(endIndex) {
      this.endIndex = endIndex;
      if (this.options.xmlMode || this.options.recognizeSelfClosing || this.foreignContext[this.foreignContext.length - 1]) {
        this.closeCurrentTag(false);
        this.startIndex = endIndex + 1;
      } else {
        this.onopentagend(endIndex);
      }
    };
    Parser3.prototype.closeCurrentTag = function(isOpenImplied) {
      var _a2, _b2;
      var name = this.tagname;
      this.endOpenTag(isOpenImplied);
      if (this.stack[this.stack.length - 1] === name) {
        (_b2 = (_a2 = this.cbs).onclosetag) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, name, !isOpenImplied);
        this.stack.pop();
      }
    };
    Parser3.prototype.onattribname = function(start, endIndex) {
      this.startIndex = start;
      var name = this.getSlice(start, endIndex);
      this.attribname = this.lowerCaseAttributeNames ? name.toLowerCase() : name;
    };
    Parser3.prototype.onattribdata = function(start, endIndex) {
      this.attribvalue += this.getSlice(start, endIndex);
    };
    Parser3.prototype.onattribentity = function(cp) {
      this.attribvalue += (0, decode_js_1.fromCodePoint)(cp);
    };
    Parser3.prototype.onattribend = function(quote, endIndex) {
      var _a2, _b2;
      this.endIndex = endIndex;
      (_b2 = (_a2 = this.cbs).onattribute) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, this.attribname, this.attribvalue, quote === Tokenizer_js_1.QuoteType.Double ? '"' : quote === Tokenizer_js_1.QuoteType.Single ? "'" : quote === Tokenizer_js_1.QuoteType.NoValue ? void 0 : null);
      if (this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) {
        this.attribs[this.attribname] = this.attribvalue;
      }
      this.attribvalue = "";
    };
    Parser3.prototype.getInstructionName = function(value) {
      var index = value.search(reNameEnd);
      var name = index < 0 ? value : value.substr(0, index);
      if (this.lowerCaseTagNames) {
        name = name.toLowerCase();
      }
      return name;
    };
    Parser3.prototype.ondeclaration = function(start, endIndex) {
      this.endIndex = endIndex;
      var value = this.getSlice(start, endIndex);
      if (this.cbs.onprocessinginstruction) {
        var name = this.getInstructionName(value);
        this.cbs.onprocessinginstruction("!".concat(name), "!".concat(value));
      }
      this.startIndex = endIndex + 1;
    };
    Parser3.prototype.onprocessinginstruction = function(start, endIndex) {
      this.endIndex = endIndex;
      var value = this.getSlice(start, endIndex);
      if (this.cbs.onprocessinginstruction) {
        var name = this.getInstructionName(value);
        this.cbs.onprocessinginstruction("?".concat(name), "?".concat(value));
      }
      this.startIndex = endIndex + 1;
    };
    Parser3.prototype.oncomment = function(start, endIndex, offset) {
      var _a2, _b2, _c, _d;
      this.endIndex = endIndex;
      (_b2 = (_a2 = this.cbs).oncomment) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, this.getSlice(start, endIndex - offset));
      (_d = (_c = this.cbs).oncommentend) === null || _d === void 0 ? void 0 : _d.call(_c);
      this.startIndex = endIndex + 1;
    };
    Parser3.prototype.oncdata = function(start, endIndex, offset) {
      var _a2, _b2, _c, _d, _e, _f, _g, _h, _j, _k;
      this.endIndex = endIndex;
      var value = this.getSlice(start, endIndex - offset);
      if (this.options.xmlMode || this.options.recognizeCDATA) {
        (_b2 = (_a2 = this.cbs).oncdatastart) === null || _b2 === void 0 ? void 0 : _b2.call(_a2);
        (_d = (_c = this.cbs).ontext) === null || _d === void 0 ? void 0 : _d.call(_c, value);
        (_f = (_e = this.cbs).oncdataend) === null || _f === void 0 ? void 0 : _f.call(_e);
      } else {
        (_h = (_g = this.cbs).oncomment) === null || _h === void 0 ? void 0 : _h.call(_g, "[CDATA[".concat(value, "]]"));
        (_k = (_j = this.cbs).oncommentend) === null || _k === void 0 ? void 0 : _k.call(_j);
      }
      this.startIndex = endIndex + 1;
    };
    Parser3.prototype.onend = function() {
      var _a2, _b2;
      if (this.cbs.onclosetag) {
        this.endIndex = this.startIndex;
        for (var index = this.stack.length; index > 0; this.cbs.onclosetag(this.stack[--index], true))
          ;
      }
      (_b2 = (_a2 = this.cbs).onend) === null || _b2 === void 0 ? void 0 : _b2.call(_a2);
    };
    Parser3.prototype.reset = function() {
      var _a2, _b2, _c, _d;
      (_b2 = (_a2 = this.cbs).onreset) === null || _b2 === void 0 ? void 0 : _b2.call(_a2);
      this.tokenizer.reset();
      this.tagname = "";
      this.attribname = "";
      this.attribs = null;
      this.stack.length = 0;
      this.startIndex = 0;
      this.endIndex = 0;
      (_d = (_c = this.cbs).onparserinit) === null || _d === void 0 ? void 0 : _d.call(_c, this);
      this.buffers.length = 0;
      this.bufferOffset = 0;
      this.writeIndex = 0;
      this.ended = false;
    };
    Parser3.prototype.parseComplete = function(data) {
      this.reset();
      this.end(data);
    };
    Parser3.prototype.getSlice = function(start, end) {
      while (start - this.bufferOffset >= this.buffers[0].length) {
        this.shiftBuffer();
      }
      var slice = this.buffers[0].slice(start - this.bufferOffset, end - this.bufferOffset);
      while (end - this.bufferOffset > this.buffers[0].length) {
        this.shiftBuffer();
        slice += this.buffers[0].slice(0, end - this.bufferOffset);
      }
      return slice;
    };
    Parser3.prototype.shiftBuffer = function() {
      this.bufferOffset += this.buffers[0].length;
      this.writeIndex--;
      this.buffers.shift();
    };
    Parser3.prototype.write = function(chunk) {
      var _a2, _b2;
      if (this.ended) {
        (_b2 = (_a2 = this.cbs).onerror) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, new Error(".write() after done!"));
        return;
      }
      this.buffers.push(chunk);
      if (this.tokenizer.running) {
        this.tokenizer.write(chunk);
        this.writeIndex++;
      }
    };
    Parser3.prototype.end = function(chunk) {
      var _a2, _b2;
      if (this.ended) {
        (_b2 = (_a2 = this.cbs).onerror) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, new Error(".end() after done!"));
        return;
      }
      if (chunk)
        this.write(chunk);
      this.ended = true;
      this.tokenizer.end();
    };
    Parser3.prototype.pause = function() {
      this.tokenizer.pause();
    };
    Parser3.prototype.resume = function() {
      this.tokenizer.resume();
      while (this.tokenizer.running && this.writeIndex < this.buffers.length) {
        this.tokenizer.write(this.buffers[this.writeIndex++]);
      }
      if (this.ended)
        this.tokenizer.end();
    };
    Parser3.prototype.parseChunk = function(chunk) {
      this.write(chunk);
    };
    Parser3.prototype.done = function(chunk) {
      this.end(chunk);
    };
    return Parser3;
  }()
);
Parser$3.Parser = Parser$2;
var lib$4 = {};
var lib$3 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = exports.ElementType = void 0;
  var ElementType2;
  (function(ElementType3) {
    ElementType3["Root"] = "root";
    ElementType3["Text"] = "text";
    ElementType3["Directive"] = "directive";
    ElementType3["Comment"] = "comment";
    ElementType3["Script"] = "script";
    ElementType3["Style"] = "style";
    ElementType3["Tag"] = "tag";
    ElementType3["CDATA"] = "cdata";
    ElementType3["Doctype"] = "doctype";
  })(ElementType2 = exports.ElementType || (exports.ElementType = {}));
  function isTag2(elem) {
    return elem.type === ElementType2.Tag || elem.type === ElementType2.Script || elem.type === ElementType2.Style;
  }
  exports.isTag = isTag2;
  exports.Root = ElementType2.Root;
  exports.Text = ElementType2.Text;
  exports.Directive = ElementType2.Directive;
  exports.Comment = ElementType2.Comment;
  exports.Script = ElementType2.Script;
  exports.Style = ElementType2.Style;
  exports.Tag = ElementType2.Tag;
  exports.CDATA = ElementType2.CDATA;
  exports.Doctype = ElementType2.Doctype;
})(lib$3);
var node$1 = {};
var __extends = commonjsGlobal && commonjsGlobal.__extends || function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var __assign$1 = commonjsGlobal && commonjsGlobal.__assign || function() {
  __assign$1 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign$1.apply(this, arguments);
};
Object.defineProperty(node$1, "__esModule", {
  value: true
});
node$1.cloneNode = node$1.hasChildren = node$1.isDocument = node$1.isDirective = node$1.isComment = node$1.isText = node$1.isCDATA = node$1.isTag = node$1.Element = node$1.Document = node$1.CDATA = node$1.NodeWithChildren = node$1.ProcessingInstruction = node$1.Comment = node$1.Text = node$1.DataNode = node$1.Node = void 0;
var domelementtype_1$1 = lib$3;
var Node$5 = (
  /** @class */
  function() {
    function Node3() {
      this.parent = null;
      this.prev = null;
      this.next = null;
      this.startIndex = null;
      this.endIndex = null;
    }
    Object.defineProperty(Node3.prototype, "parentNode", {
      // Read-write aliases for properties
      /**
       * Same as {@link parent}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get: function() {
        return this.parent;
      },
      set: function(parent) {
        this.parent = parent;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Node3.prototype, "previousSibling", {
      /**
       * Same as {@link prev}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get: function() {
        return this.prev;
      },
      set: function(prev) {
        this.prev = prev;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Node3.prototype, "nextSibling", {
      /**
       * Same as {@link next}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get: function() {
        return this.next;
      },
      set: function(next) {
        this.next = next;
      },
      enumerable: false,
      configurable: true
    });
    Node3.prototype.cloneNode = function(recursive) {
      if (recursive === void 0) {
        recursive = false;
      }
      return cloneNode$1(this, recursive);
    };
    return Node3;
  }()
);
node$1.Node = Node$5;
var DataNode = (
  /** @class */
  function(_super) {
    __extends(DataNode2, _super);
    function DataNode2(data) {
      var _this = _super.call(this) || this;
      _this.data = data;
      return _this;
    }
    Object.defineProperty(DataNode2.prototype, "nodeValue", {
      /**
       * Same as {@link data}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get: function() {
        return this.data;
      },
      set: function(data) {
        this.data = data;
      },
      enumerable: false,
      configurable: true
    });
    return DataNode2;
  }(Node$5)
);
node$1.DataNode = DataNode;
var Text = (
  /** @class */
  function(_super) {
    __extends(Text2, _super);
    function Text2() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.type = domelementtype_1$1.ElementType.Text;
      return _this;
    }
    Object.defineProperty(Text2.prototype, "nodeType", {
      get: function() {
        return 3;
      },
      enumerable: false,
      configurable: true
    });
    return Text2;
  }(DataNode)
);
node$1.Text = Text;
var Comment$5 = (
  /** @class */
  function(_super) {
    __extends(Comment3, _super);
    function Comment3() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.type = domelementtype_1$1.ElementType.Comment;
      return _this;
    }
    Object.defineProperty(Comment3.prototype, "nodeType", {
      get: function() {
        return 8;
      },
      enumerable: false,
      configurable: true
    });
    return Comment3;
  }(DataNode)
);
node$1.Comment = Comment$5;
var ProcessingInstruction = (
  /** @class */
  function(_super) {
    __extends(ProcessingInstruction2, _super);
    function ProcessingInstruction2(name, data) {
      var _this = _super.call(this, data) || this;
      _this.name = name;
      _this.type = domelementtype_1$1.ElementType.Directive;
      return _this;
    }
    Object.defineProperty(ProcessingInstruction2.prototype, "nodeType", {
      get: function() {
        return 1;
      },
      enumerable: false,
      configurable: true
    });
    return ProcessingInstruction2;
  }(DataNode)
);
node$1.ProcessingInstruction = ProcessingInstruction;
var NodeWithChildren = (
  /** @class */
  function(_super) {
    __extends(NodeWithChildren2, _super);
    function NodeWithChildren2(children) {
      var _this = _super.call(this) || this;
      _this.children = children;
      return _this;
    }
    Object.defineProperty(NodeWithChildren2.prototype, "firstChild", {
      // Aliases
      /** First child of the node. */
      get: function() {
        var _a2;
        return (_a2 = this.children[0]) !== null && _a2 !== void 0 ? _a2 : null;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(NodeWithChildren2.prototype, "lastChild", {
      /** Last child of the node. */
      get: function() {
        return this.children.length > 0 ? this.children[this.children.length - 1] : null;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(NodeWithChildren2.prototype, "childNodes", {
      /**
       * Same as {@link children}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get: function() {
        return this.children;
      },
      set: function(children) {
        this.children = children;
      },
      enumerable: false,
      configurable: true
    });
    return NodeWithChildren2;
  }(Node$5)
);
node$1.NodeWithChildren = NodeWithChildren;
var CDATA = (
  /** @class */
  function(_super) {
    __extends(CDATA2, _super);
    function CDATA2() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.type = domelementtype_1$1.ElementType.CDATA;
      return _this;
    }
    Object.defineProperty(CDATA2.prototype, "nodeType", {
      get: function() {
        return 4;
      },
      enumerable: false,
      configurable: true
    });
    return CDATA2;
  }(NodeWithChildren)
);
node$1.CDATA = CDATA;
var Document$4 = (
  /** @class */
  function(_super) {
    __extends(Document3, _super);
    function Document3() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.type = domelementtype_1$1.ElementType.Root;
      return _this;
    }
    Object.defineProperty(Document3.prototype, "nodeType", {
      get: function() {
        return 9;
      },
      enumerable: false,
      configurable: true
    });
    return Document3;
  }(NodeWithChildren)
);
node$1.Document = Document$4;
var Element = (
  /** @class */
  function(_super) {
    __extends(Element2, _super);
    function Element2(name, attribs, children, type) {
      if (children === void 0) {
        children = [];
      }
      if (type === void 0) {
        type = name === "script" ? domelementtype_1$1.ElementType.Script : name === "style" ? domelementtype_1$1.ElementType.Style : domelementtype_1$1.ElementType.Tag;
      }
      var _this = _super.call(this, children) || this;
      _this.name = name;
      _this.attribs = attribs;
      _this.type = type;
      return _this;
    }
    Object.defineProperty(Element2.prototype, "nodeType", {
      get: function() {
        return 1;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Element2.prototype, "tagName", {
      // DOM Level 1 aliases
      /**
       * Same as {@link name}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get: function() {
        return this.name;
      },
      set: function(name) {
        this.name = name;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Element2.prototype, "attributes", {
      get: function() {
        var _this = this;
        return Object.keys(this.attribs).map(function(name) {
          var _a2, _b2;
          return {
            name,
            value: _this.attribs[name],
            namespace: (_a2 = _this["x-attribsNamespace"]) === null || _a2 === void 0 ? void 0 : _a2[name],
            prefix: (_b2 = _this["x-attribsPrefix"]) === null || _b2 === void 0 ? void 0 : _b2[name]
          };
        });
      },
      enumerable: false,
      configurable: true
    });
    return Element2;
  }(NodeWithChildren)
);
node$1.Element = Element;
function isTag(node2) {
  return (0, domelementtype_1$1.isTag)(node2);
}
node$1.isTag = isTag;
function isCDATA(node2) {
  return node2.type === domelementtype_1$1.ElementType.CDATA;
}
node$1.isCDATA = isCDATA;
function isText(node2) {
  return node2.type === domelementtype_1$1.ElementType.Text;
}
node$1.isText = isText;
function isComment(node2) {
  return node2.type === domelementtype_1$1.ElementType.Comment;
}
node$1.isComment = isComment;
function isDirective(node2) {
  return node2.type === domelementtype_1$1.ElementType.Directive;
}
node$1.isDirective = isDirective;
function isDocument(node2) {
  return node2.type === domelementtype_1$1.ElementType.Root;
}
node$1.isDocument = isDocument;
function hasChildren(node2) {
  return Object.prototype.hasOwnProperty.call(node2, "children");
}
node$1.hasChildren = hasChildren;
function cloneNode$1(node2, recursive) {
  if (recursive === void 0) {
    recursive = false;
  }
  var result2;
  if (isText(node2)) {
    result2 = new Text(node2.data);
  } else if (isComment(node2)) {
    result2 = new Comment$5(node2.data);
  } else if (isTag(node2)) {
    var children = recursive ? cloneChildren(node2.children) : [];
    var clone_1 = new Element(node2.name, __assign$1({}, node2.attribs), children);
    children.forEach(function(child) {
      return child.parent = clone_1;
    });
    if (node2.namespace != null) {
      clone_1.namespace = node2.namespace;
    }
    if (node2["x-attribsNamespace"]) {
      clone_1["x-attribsNamespace"] = __assign$1({}, node2["x-attribsNamespace"]);
    }
    if (node2["x-attribsPrefix"]) {
      clone_1["x-attribsPrefix"] = __assign$1({}, node2["x-attribsPrefix"]);
    }
    result2 = clone_1;
  } else if (isCDATA(node2)) {
    var children = recursive ? cloneChildren(node2.children) : [];
    var clone_2 = new CDATA(children);
    children.forEach(function(child) {
      return child.parent = clone_2;
    });
    result2 = clone_2;
  } else if (isDocument(node2)) {
    var children = recursive ? cloneChildren(node2.children) : [];
    var clone_3 = new Document$4(children);
    children.forEach(function(child) {
      return child.parent = clone_3;
    });
    if (node2["x-mode"]) {
      clone_3["x-mode"] = node2["x-mode"];
    }
    result2 = clone_3;
  } else if (isDirective(node2)) {
    var instruction = new ProcessingInstruction(node2.name, node2.data);
    if (node2["x-name"] != null) {
      instruction["x-name"] = node2["x-name"];
      instruction["x-publicId"] = node2["x-publicId"];
      instruction["x-systemId"] = node2["x-systemId"];
    }
    result2 = instruction;
  } else {
    throw new Error("Not implemented yet: ".concat(node2.type));
  }
  result2.startIndex = node2.startIndex;
  result2.endIndex = node2.endIndex;
  if (node2.sourceCodeLocation != null) {
    result2.sourceCodeLocation = node2.sourceCodeLocation;
  }
  return result2;
}
node$1.cloneNode = cloneNode$1;
function cloneChildren(childs) {
  var children = childs.map(function(child) {
    return cloneNode$1(child, true);
  });
  for (var i = 1; i < children.length; i++) {
    children[i].prev = children[i - 1];
    children[i - 1].next = children[i];
  }
  return children;
}
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = {
        enumerable: true,
        get: function() {
          return m[k];
        }
      };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding2(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DomHandler = void 0;
  var domelementtype_12 = lib$3;
  var node_js_1 = node$1;
  __exportStar(node$1, exports);
  var defaultOpts = {
    withStartIndices: false,
    withEndIndices: false,
    xmlMode: false
  };
  var DomHandler = (
    /** @class */
    function() {
      function DomHandler2(callback, options, elementCB) {
        this.dom = [];
        this.root = new node_js_1.Document(this.dom);
        this.done = false;
        this.tagStack = [this.root];
        this.lastNode = null;
        this.parser = null;
        if (typeof options === "function") {
          elementCB = options;
          options = defaultOpts;
        }
        if (typeof callback === "object") {
          options = callback;
          callback = void 0;
        }
        this.callback = callback !== null && callback !== void 0 ? callback : null;
        this.options = options !== null && options !== void 0 ? options : defaultOpts;
        this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
      }
      DomHandler2.prototype.onparserinit = function(parser2) {
        this.parser = parser2;
      };
      DomHandler2.prototype.onreset = function() {
        this.dom = [];
        this.root = new node_js_1.Document(this.dom);
        this.done = false;
        this.tagStack = [this.root];
        this.lastNode = null;
        this.parser = null;
      };
      DomHandler2.prototype.onend = function() {
        if (this.done)
          return;
        this.done = true;
        this.parser = null;
        this.handleCallback(null);
      };
      DomHandler2.prototype.onerror = function(error) {
        this.handleCallback(error);
      };
      DomHandler2.prototype.onclosetag = function() {
        this.lastNode = null;
        var elem = this.tagStack.pop();
        if (this.options.withEndIndices) {
          elem.endIndex = this.parser.endIndex;
        }
        if (this.elementCB)
          this.elementCB(elem);
      };
      DomHandler2.prototype.onopentag = function(name, attribs) {
        var type = this.options.xmlMode ? domelementtype_12.ElementType.Tag : void 0;
        var element = new node_js_1.Element(name, attribs, void 0, type);
        this.addNode(element);
        this.tagStack.push(element);
      };
      DomHandler2.prototype.ontext = function(data) {
        var lastNode = this.lastNode;
        if (lastNode && lastNode.type === domelementtype_12.ElementType.Text) {
          lastNode.data += data;
          if (this.options.withEndIndices) {
            lastNode.endIndex = this.parser.endIndex;
          }
        } else {
          var node2 = new node_js_1.Text(data);
          this.addNode(node2);
          this.lastNode = node2;
        }
      };
      DomHandler2.prototype.oncomment = function(data) {
        if (this.lastNode && this.lastNode.type === domelementtype_12.ElementType.Comment) {
          this.lastNode.data += data;
          return;
        }
        var node2 = new node_js_1.Comment(data);
        this.addNode(node2);
        this.lastNode = node2;
      };
      DomHandler2.prototype.oncommentend = function() {
        this.lastNode = null;
      };
      DomHandler2.prototype.oncdatastart = function() {
        var text = new node_js_1.Text("");
        var node2 = new node_js_1.CDATA([text]);
        this.addNode(node2);
        text.parent = node2;
        this.lastNode = text;
      };
      DomHandler2.prototype.oncdataend = function() {
        this.lastNode = null;
      };
      DomHandler2.prototype.onprocessinginstruction = function(name, data) {
        var node2 = new node_js_1.ProcessingInstruction(name, data);
        this.addNode(node2);
      };
      DomHandler2.prototype.handleCallback = function(error) {
        if (typeof this.callback === "function") {
          this.callback(error, this.dom);
        } else if (error) {
          throw error;
        }
      };
      DomHandler2.prototype.addNode = function(node2) {
        var parent = this.tagStack[this.tagStack.length - 1];
        var previousSibling = parent.children[parent.children.length - 1];
        if (this.options.withStartIndices) {
          node2.startIndex = this.parser.startIndex;
        }
        if (this.options.withEndIndices) {
          node2.endIndex = this.parser.endIndex;
        }
        parent.children.push(node2);
        if (previousSibling) {
          node2.prev = previousSibling;
          previousSibling.next = node2;
        }
        node2.parent = parent;
        this.lastNode = null;
      };
      return DomHandler2;
    }()
  );
  exports.DomHandler = DomHandler;
  exports.default = DomHandler;
})(lib$4);
var lib$2 = {};
var stringify$5 = {};
var lib$1 = {};
var lib = {};
var encode = {};
var encodeHtml = {};
Object.defineProperty(encodeHtml, "__esModule", {
  value: true
});
function restoreDiff(arr) {
  for (var i = 1; i < arr.length; i++) {
    arr[i][0] += arr[i - 1][0] + 1;
  }
  return arr;
}
encodeHtml.default = new Map(/* @__PURE__ */ restoreDiff([[9, "&Tab;"], [0, "&NewLine;"], [22, "&excl;"], [0, "&quot;"], [0, "&num;"], [0, "&dollar;"], [0, "&percnt;"], [0, "&amp;"], [0, "&apos;"], [0, "&lpar;"], [0, "&rpar;"], [0, "&ast;"], [0, "&plus;"], [0, "&comma;"], [1, "&period;"], [0, "&sol;"], [10, "&colon;"], [0, "&semi;"], [0, {
  v: "&lt;",
  n: 8402,
  o: "&nvlt;"
}], [0, {
  v: "&equals;",
  n: 8421,
  o: "&bne;"
}], [0, {
  v: "&gt;",
  n: 8402,
  o: "&nvgt;"
}], [0, "&quest;"], [0, "&commat;"], [26, "&lbrack;"], [0, "&bsol;"], [0, "&rbrack;"], [0, "&Hat;"], [0, "&lowbar;"], [0, "&DiacriticalGrave;"], [5, {
  n: 106,
  o: "&fjlig;"
}], [20, "&lbrace;"], [0, "&verbar;"], [0, "&rbrace;"], [34, "&nbsp;"], [0, "&iexcl;"], [0, "&cent;"], [0, "&pound;"], [0, "&curren;"], [0, "&yen;"], [0, "&brvbar;"], [0, "&sect;"], [0, "&die;"], [0, "&copy;"], [0, "&ordf;"], [0, "&laquo;"], [0, "&not;"], [0, "&shy;"], [0, "&circledR;"], [0, "&macr;"], [0, "&deg;"], [0, "&PlusMinus;"], [0, "&sup2;"], [0, "&sup3;"], [0, "&acute;"], [0, "&micro;"], [0, "&para;"], [0, "&centerdot;"], [0, "&cedil;"], [0, "&sup1;"], [0, "&ordm;"], [0, "&raquo;"], [0, "&frac14;"], [0, "&frac12;"], [0, "&frac34;"], [0, "&iquest;"], [0, "&Agrave;"], [0, "&Aacute;"], [0, "&Acirc;"], [0, "&Atilde;"], [0, "&Auml;"], [0, "&angst;"], [0, "&AElig;"], [0, "&Ccedil;"], [0, "&Egrave;"], [0, "&Eacute;"], [0, "&Ecirc;"], [0, "&Euml;"], [0, "&Igrave;"], [0, "&Iacute;"], [0, "&Icirc;"], [0, "&Iuml;"], [0, "&ETH;"], [0, "&Ntilde;"], [0, "&Ograve;"], [0, "&Oacute;"], [0, "&Ocirc;"], [0, "&Otilde;"], [0, "&Ouml;"], [0, "&times;"], [0, "&Oslash;"], [0, "&Ugrave;"], [0, "&Uacute;"], [0, "&Ucirc;"], [0, "&Uuml;"], [0, "&Yacute;"], [0, "&THORN;"], [0, "&szlig;"], [0, "&agrave;"], [0, "&aacute;"], [0, "&acirc;"], [0, "&atilde;"], [0, "&auml;"], [0, "&aring;"], [0, "&aelig;"], [0, "&ccedil;"], [0, "&egrave;"], [0, "&eacute;"], [0, "&ecirc;"], [0, "&euml;"], [0, "&igrave;"], [0, "&iacute;"], [0, "&icirc;"], [0, "&iuml;"], [0, "&eth;"], [0, "&ntilde;"], [0, "&ograve;"], [0, "&oacute;"], [0, "&ocirc;"], [0, "&otilde;"], [0, "&ouml;"], [0, "&div;"], [0, "&oslash;"], [0, "&ugrave;"], [0, "&uacute;"], [0, "&ucirc;"], [0, "&uuml;"], [0, "&yacute;"], [0, "&thorn;"], [0, "&yuml;"], [0, "&Amacr;"], [0, "&amacr;"], [0, "&Abreve;"], [0, "&abreve;"], [0, "&Aogon;"], [0, "&aogon;"], [0, "&Cacute;"], [0, "&cacute;"], [0, "&Ccirc;"], [0, "&ccirc;"], [0, "&Cdot;"], [0, "&cdot;"], [0, "&Ccaron;"], [0, "&ccaron;"], [0, "&Dcaron;"], [0, "&dcaron;"], [0, "&Dstrok;"], [0, "&dstrok;"], [0, "&Emacr;"], [0, "&emacr;"], [2, "&Edot;"], [0, "&edot;"], [0, "&Eogon;"], [0, "&eogon;"], [0, "&Ecaron;"], [0, "&ecaron;"], [0, "&Gcirc;"], [0, "&gcirc;"], [0, "&Gbreve;"], [0, "&gbreve;"], [0, "&Gdot;"], [0, "&gdot;"], [0, "&Gcedil;"], [1, "&Hcirc;"], [0, "&hcirc;"], [0, "&Hstrok;"], [0, "&hstrok;"], [0, "&Itilde;"], [0, "&itilde;"], [0, "&Imacr;"], [0, "&imacr;"], [2, "&Iogon;"], [0, "&iogon;"], [0, "&Idot;"], [0, "&imath;"], [0, "&IJlig;"], [0, "&ijlig;"], [0, "&Jcirc;"], [0, "&jcirc;"], [0, "&Kcedil;"], [0, "&kcedil;"], [0, "&kgreen;"], [0, "&Lacute;"], [0, "&lacute;"], [0, "&Lcedil;"], [0, "&lcedil;"], [0, "&Lcaron;"], [0, "&lcaron;"], [0, "&Lmidot;"], [0, "&lmidot;"], [0, "&Lstrok;"], [0, "&lstrok;"], [0, "&Nacute;"], [0, "&nacute;"], [0, "&Ncedil;"], [0, "&ncedil;"], [0, "&Ncaron;"], [0, "&ncaron;"], [0, "&napos;"], [0, "&ENG;"], [0, "&eng;"], [0, "&Omacr;"], [0, "&omacr;"], [2, "&Odblac;"], [0, "&odblac;"], [0, "&OElig;"], [0, "&oelig;"], [0, "&Racute;"], [0, "&racute;"], [0, "&Rcedil;"], [0, "&rcedil;"], [0, "&Rcaron;"], [0, "&rcaron;"], [0, "&Sacute;"], [0, "&sacute;"], [0, "&Scirc;"], [0, "&scirc;"], [0, "&Scedil;"], [0, "&scedil;"], [0, "&Scaron;"], [0, "&scaron;"], [0, "&Tcedil;"], [0, "&tcedil;"], [0, "&Tcaron;"], [0, "&tcaron;"], [0, "&Tstrok;"], [0, "&tstrok;"], [0, "&Utilde;"], [0, "&utilde;"], [0, "&Umacr;"], [0, "&umacr;"], [0, "&Ubreve;"], [0, "&ubreve;"], [0, "&Uring;"], [0, "&uring;"], [0, "&Udblac;"], [0, "&udblac;"], [0, "&Uogon;"], [0, "&uogon;"], [0, "&Wcirc;"], [0, "&wcirc;"], [0, "&Ycirc;"], [0, "&ycirc;"], [0, "&Yuml;"], [0, "&Zacute;"], [0, "&zacute;"], [0, "&Zdot;"], [0, "&zdot;"], [0, "&Zcaron;"], [0, "&zcaron;"], [19, "&fnof;"], [34, "&imped;"], [63, "&gacute;"], [65, "&jmath;"], [142, "&circ;"], [0, "&caron;"], [16, "&breve;"], [0, "&DiacriticalDot;"], [0, "&ring;"], [0, "&ogon;"], [0, "&DiacriticalTilde;"], [0, "&dblac;"], [51, "&DownBreve;"], [127, "&Alpha;"], [0, "&Beta;"], [0, "&Gamma;"], [0, "&Delta;"], [0, "&Epsilon;"], [0, "&Zeta;"], [0, "&Eta;"], [0, "&Theta;"], [0, "&Iota;"], [0, "&Kappa;"], [0, "&Lambda;"], [0, "&Mu;"], [0, "&Nu;"], [0, "&Xi;"], [0, "&Omicron;"], [0, "&Pi;"], [0, "&Rho;"], [1, "&Sigma;"], [0, "&Tau;"], [0, "&Upsilon;"], [0, "&Phi;"], [0, "&Chi;"], [0, "&Psi;"], [0, "&ohm;"], [7, "&alpha;"], [0, "&beta;"], [0, "&gamma;"], [0, "&delta;"], [0, "&epsi;"], [0, "&zeta;"], [0, "&eta;"], [0, "&theta;"], [0, "&iota;"], [0, "&kappa;"], [0, "&lambda;"], [0, "&mu;"], [0, "&nu;"], [0, "&xi;"], [0, "&omicron;"], [0, "&pi;"], [0, "&rho;"], [0, "&sigmaf;"], [0, "&sigma;"], [0, "&tau;"], [0, "&upsi;"], [0, "&phi;"], [0, "&chi;"], [0, "&psi;"], [0, "&omega;"], [7, "&thetasym;"], [0, "&Upsi;"], [2, "&phiv;"], [0, "&piv;"], [5, "&Gammad;"], [0, "&digamma;"], [18, "&kappav;"], [0, "&rhov;"], [3, "&epsiv;"], [0, "&backepsilon;"], [10, "&IOcy;"], [0, "&DJcy;"], [0, "&GJcy;"], [0, "&Jukcy;"], [0, "&DScy;"], [0, "&Iukcy;"], [0, "&YIcy;"], [0, "&Jsercy;"], [0, "&LJcy;"], [0, "&NJcy;"], [0, "&TSHcy;"], [0, "&KJcy;"], [1, "&Ubrcy;"], [0, "&DZcy;"], [0, "&Acy;"], [0, "&Bcy;"], [0, "&Vcy;"], [0, "&Gcy;"], [0, "&Dcy;"], [0, "&IEcy;"], [0, "&ZHcy;"], [0, "&Zcy;"], [0, "&Icy;"], [0, "&Jcy;"], [0, "&Kcy;"], [0, "&Lcy;"], [0, "&Mcy;"], [0, "&Ncy;"], [0, "&Ocy;"], [0, "&Pcy;"], [0, "&Rcy;"], [0, "&Scy;"], [0, "&Tcy;"], [0, "&Ucy;"], [0, "&Fcy;"], [0, "&KHcy;"], [0, "&TScy;"], [0, "&CHcy;"], [0, "&SHcy;"], [0, "&SHCHcy;"], [0, "&HARDcy;"], [0, "&Ycy;"], [0, "&SOFTcy;"], [0, "&Ecy;"], [0, "&YUcy;"], [0, "&YAcy;"], [0, "&acy;"], [0, "&bcy;"], [0, "&vcy;"], [0, "&gcy;"], [0, "&dcy;"], [0, "&iecy;"], [0, "&zhcy;"], [0, "&zcy;"], [0, "&icy;"], [0, "&jcy;"], [0, "&kcy;"], [0, "&lcy;"], [0, "&mcy;"], [0, "&ncy;"], [0, "&ocy;"], [0, "&pcy;"], [0, "&rcy;"], [0, "&scy;"], [0, "&tcy;"], [0, "&ucy;"], [0, "&fcy;"], [0, "&khcy;"], [0, "&tscy;"], [0, "&chcy;"], [0, "&shcy;"], [0, "&shchcy;"], [0, "&hardcy;"], [0, "&ycy;"], [0, "&softcy;"], [0, "&ecy;"], [0, "&yucy;"], [0, "&yacy;"], [1, "&iocy;"], [0, "&djcy;"], [0, "&gjcy;"], [0, "&jukcy;"], [0, "&dscy;"], [0, "&iukcy;"], [0, "&yicy;"], [0, "&jsercy;"], [0, "&ljcy;"], [0, "&njcy;"], [0, "&tshcy;"], [0, "&kjcy;"], [1, "&ubrcy;"], [0, "&dzcy;"], [7074, "&ensp;"], [0, "&emsp;"], [0, "&emsp13;"], [0, "&emsp14;"], [1, "&numsp;"], [0, "&puncsp;"], [0, "&ThinSpace;"], [0, "&hairsp;"], [0, "&NegativeMediumSpace;"], [0, "&zwnj;"], [0, "&zwj;"], [0, "&lrm;"], [0, "&rlm;"], [0, "&dash;"], [2, "&ndash;"], [0, "&mdash;"], [0, "&horbar;"], [0, "&Verbar;"], [1, "&lsquo;"], [0, "&CloseCurlyQuote;"], [0, "&lsquor;"], [1, "&ldquo;"], [0, "&CloseCurlyDoubleQuote;"], [0, "&bdquo;"], [1, "&dagger;"], [0, "&Dagger;"], [0, "&bull;"], [2, "&nldr;"], [0, "&hellip;"], [9, "&permil;"], [0, "&pertenk;"], [0, "&prime;"], [0, "&Prime;"], [0, "&tprime;"], [0, "&backprime;"], [3, "&lsaquo;"], [0, "&rsaquo;"], [3, "&oline;"], [2, "&caret;"], [1, "&hybull;"], [0, "&frasl;"], [10, "&bsemi;"], [7, "&qprime;"], [7, {
  v: "&MediumSpace;",
  n: 8202,
  o: "&ThickSpace;"
}], [0, "&NoBreak;"], [0, "&af;"], [0, "&InvisibleTimes;"], [0, "&ic;"], [72, "&euro;"], [46, "&tdot;"], [0, "&DotDot;"], [37, "&complexes;"], [2, "&incare;"], [4, "&gscr;"], [0, "&hamilt;"], [0, "&Hfr;"], [0, "&Hopf;"], [0, "&planckh;"], [0, "&hbar;"], [0, "&imagline;"], [0, "&Ifr;"], [0, "&lagran;"], [0, "&ell;"], [1, "&naturals;"], [0, "&numero;"], [0, "&copysr;"], [0, "&weierp;"], [0, "&Popf;"], [0, "&Qopf;"], [0, "&realine;"], [0, "&real;"], [0, "&reals;"], [0, "&rx;"], [3, "&trade;"], [1, "&integers;"], [2, "&mho;"], [0, "&zeetrf;"], [0, "&iiota;"], [2, "&bernou;"], [0, "&Cayleys;"], [1, "&escr;"], [0, "&Escr;"], [0, "&Fouriertrf;"], [1, "&Mellintrf;"], [0, "&order;"], [0, "&alefsym;"], [0, "&beth;"], [0, "&gimel;"], [0, "&daleth;"], [12, "&CapitalDifferentialD;"], [0, "&dd;"], [0, "&ee;"], [0, "&ii;"], [10, "&frac13;"], [0, "&frac23;"], [0, "&frac15;"], [0, "&frac25;"], [0, "&frac35;"], [0, "&frac45;"], [0, "&frac16;"], [0, "&frac56;"], [0, "&frac18;"], [0, "&frac38;"], [0, "&frac58;"], [0, "&frac78;"], [49, "&larr;"], [0, "&ShortUpArrow;"], [0, "&rarr;"], [0, "&darr;"], [0, "&harr;"], [0, "&updownarrow;"], [0, "&nwarr;"], [0, "&nearr;"], [0, "&LowerRightArrow;"], [0, "&LowerLeftArrow;"], [0, "&nlarr;"], [0, "&nrarr;"], [1, {
  v: "&rarrw;",
  n: 824,
  o: "&nrarrw;"
}], [0, "&Larr;"], [0, "&Uarr;"], [0, "&Rarr;"], [0, "&Darr;"], [0, "&larrtl;"], [0, "&rarrtl;"], [0, "&LeftTeeArrow;"], [0, "&mapstoup;"], [0, "&map;"], [0, "&DownTeeArrow;"], [1, "&hookleftarrow;"], [0, "&hookrightarrow;"], [0, "&larrlp;"], [0, "&looparrowright;"], [0, "&harrw;"], [0, "&nharr;"], [1, "&lsh;"], [0, "&rsh;"], [0, "&ldsh;"], [0, "&rdsh;"], [1, "&crarr;"], [0, "&cularr;"], [0, "&curarr;"], [2, "&circlearrowleft;"], [0, "&circlearrowright;"], [0, "&leftharpoonup;"], [0, "&DownLeftVector;"], [0, "&RightUpVector;"], [0, "&LeftUpVector;"], [0, "&rharu;"], [0, "&DownRightVector;"], [0, "&dharr;"], [0, "&dharl;"], [0, "&RightArrowLeftArrow;"], [0, "&udarr;"], [0, "&LeftArrowRightArrow;"], [0, "&leftleftarrows;"], [0, "&upuparrows;"], [0, "&rightrightarrows;"], [0, "&ddarr;"], [0, "&leftrightharpoons;"], [0, "&Equilibrium;"], [0, "&nlArr;"], [0, "&nhArr;"], [0, "&nrArr;"], [0, "&DoubleLeftArrow;"], [0, "&DoubleUpArrow;"], [0, "&DoubleRightArrow;"], [0, "&dArr;"], [0, "&DoubleLeftRightArrow;"], [0, "&DoubleUpDownArrow;"], [0, "&nwArr;"], [0, "&neArr;"], [0, "&seArr;"], [0, "&swArr;"], [0, "&lAarr;"], [0, "&rAarr;"], [1, "&zigrarr;"], [6, "&larrb;"], [0, "&rarrb;"], [15, "&DownArrowUpArrow;"], [7, "&loarr;"], [0, "&roarr;"], [0, "&hoarr;"], [0, "&forall;"], [0, "&comp;"], [0, {
  v: "&part;",
  n: 824,
  o: "&npart;"
}], [0, "&exist;"], [0, "&nexist;"], [0, "&empty;"], [1, "&Del;"], [0, "&Element;"], [0, "&NotElement;"], [1, "&ni;"], [0, "&notni;"], [2, "&prod;"], [0, "&coprod;"], [0, "&sum;"], [0, "&minus;"], [0, "&MinusPlus;"], [0, "&dotplus;"], [1, "&Backslash;"], [0, "&lowast;"], [0, "&compfn;"], [1, "&radic;"], [2, "&prop;"], [0, "&infin;"], [0, "&angrt;"], [0, {
  v: "&ang;",
  n: 8402,
  o: "&nang;"
}], [0, "&angmsd;"], [0, "&angsph;"], [0, "&mid;"], [0, "&nmid;"], [0, "&DoubleVerticalBar;"], [0, "&NotDoubleVerticalBar;"], [0, "&and;"], [0, "&or;"], [0, {
  v: "&cap;",
  n: 65024,
  o: "&caps;"
}], [0, {
  v: "&cup;",
  n: 65024,
  o: "&cups;"
}], [0, "&int;"], [0, "&Int;"], [0, "&iiint;"], [0, "&conint;"], [0, "&Conint;"], [0, "&Cconint;"], [0, "&cwint;"], [0, "&ClockwiseContourIntegral;"], [0, "&awconint;"], [0, "&there4;"], [0, "&becaus;"], [0, "&ratio;"], [0, "&Colon;"], [0, "&dotminus;"], [1, "&mDDot;"], [0, "&homtht;"], [0, {
  v: "&sim;",
  n: 8402,
  o: "&nvsim;"
}], [0, {
  v: "&backsim;",
  n: 817,
  o: "&race;"
}], [0, {
  v: "&ac;",
  n: 819,
  o: "&acE;"
}], [0, "&acd;"], [0, "&VerticalTilde;"], [0, "&NotTilde;"], [0, {
  v: "&eqsim;",
  n: 824,
  o: "&nesim;"
}], [0, "&sime;"], [0, "&NotTildeEqual;"], [0, "&cong;"], [0, "&simne;"], [0, "&ncong;"], [0, "&ap;"], [0, "&nap;"], [0, "&ape;"], [0, {
  v: "&apid;",
  n: 824,
  o: "&napid;"
}], [0, "&backcong;"], [0, {
  v: "&asympeq;",
  n: 8402,
  o: "&nvap;"
}], [0, {
  v: "&bump;",
  n: 824,
  o: "&nbump;"
}], [0, {
  v: "&bumpe;",
  n: 824,
  o: "&nbumpe;"
}], [0, {
  v: "&doteq;",
  n: 824,
  o: "&nedot;"
}], [0, "&doteqdot;"], [0, "&efDot;"], [0, "&erDot;"], [0, "&Assign;"], [0, "&ecolon;"], [0, "&ecir;"], [0, "&circeq;"], [1, "&wedgeq;"], [0, "&veeeq;"], [1, "&triangleq;"], [2, "&equest;"], [0, "&ne;"], [0, {
  v: "&Congruent;",
  n: 8421,
  o: "&bnequiv;"
}], [0, "&nequiv;"], [1, {
  v: "&le;",
  n: 8402,
  o: "&nvle;"
}], [0, {
  v: "&ge;",
  n: 8402,
  o: "&nvge;"
}], [0, {
  v: "&lE;",
  n: 824,
  o: "&nlE;"
}], [0, {
  v: "&gE;",
  n: 824,
  o: "&ngE;"
}], [0, {
  v: "&lnE;",
  n: 65024,
  o: "&lvertneqq;"
}], [0, {
  v: "&gnE;",
  n: 65024,
  o: "&gvertneqq;"
}], [0, {
  v: "&ll;",
  n: new Map(/* @__PURE__ */ restoreDiff([[824, "&nLtv;"], [7577, "&nLt;"]]))
}], [0, {
  v: "&gg;",
  n: new Map(/* @__PURE__ */ restoreDiff([[824, "&nGtv;"], [7577, "&nGt;"]]))
}], [0, "&between;"], [0, "&NotCupCap;"], [0, "&nless;"], [0, "&ngt;"], [0, "&nle;"], [0, "&nge;"], [0, "&lesssim;"], [0, "&GreaterTilde;"], [0, "&nlsim;"], [0, "&ngsim;"], [0, "&LessGreater;"], [0, "&gl;"], [0, "&NotLessGreater;"], [0, "&NotGreaterLess;"], [0, "&pr;"], [0, "&sc;"], [0, "&prcue;"], [0, "&sccue;"], [0, "&PrecedesTilde;"], [0, {
  v: "&scsim;",
  n: 824,
  o: "&NotSucceedsTilde;"
}], [0, "&NotPrecedes;"], [0, "&NotSucceeds;"], [0, {
  v: "&sub;",
  n: 8402,
  o: "&NotSubset;"
}], [0, {
  v: "&sup;",
  n: 8402,
  o: "&NotSuperset;"
}], [0, "&nsub;"], [0, "&nsup;"], [0, "&sube;"], [0, "&supe;"], [0, "&NotSubsetEqual;"], [0, "&NotSupersetEqual;"], [0, {
  v: "&subne;",
  n: 65024,
  o: "&varsubsetneq;"
}], [0, {
  v: "&supne;",
  n: 65024,
  o: "&varsupsetneq;"
}], [1, "&cupdot;"], [0, "&UnionPlus;"], [0, {
  v: "&sqsub;",
  n: 824,
  o: "&NotSquareSubset;"
}], [0, {
  v: "&sqsup;",
  n: 824,
  o: "&NotSquareSuperset;"
}], [0, "&sqsube;"], [0, "&sqsupe;"], [0, {
  v: "&sqcap;",
  n: 65024,
  o: "&sqcaps;"
}], [0, {
  v: "&sqcup;",
  n: 65024,
  o: "&sqcups;"
}], [0, "&CirclePlus;"], [0, "&CircleMinus;"], [0, "&CircleTimes;"], [0, "&osol;"], [0, "&CircleDot;"], [0, "&circledcirc;"], [0, "&circledast;"], [1, "&circleddash;"], [0, "&boxplus;"], [0, "&boxminus;"], [0, "&boxtimes;"], [0, "&dotsquare;"], [0, "&RightTee;"], [0, "&dashv;"], [0, "&DownTee;"], [0, "&bot;"], [1, "&models;"], [0, "&DoubleRightTee;"], [0, "&Vdash;"], [0, "&Vvdash;"], [0, "&VDash;"], [0, "&nvdash;"], [0, "&nvDash;"], [0, "&nVdash;"], [0, "&nVDash;"], [0, "&prurel;"], [1, "&LeftTriangle;"], [0, "&RightTriangle;"], [0, {
  v: "&LeftTriangleEqual;",
  n: 8402,
  o: "&nvltrie;"
}], [0, {
  v: "&RightTriangleEqual;",
  n: 8402,
  o: "&nvrtrie;"
}], [0, "&origof;"], [0, "&imof;"], [0, "&multimap;"], [0, "&hercon;"], [0, "&intcal;"], [0, "&veebar;"], [1, "&barvee;"], [0, "&angrtvb;"], [0, "&lrtri;"], [0, "&bigwedge;"], [0, "&bigvee;"], [0, "&bigcap;"], [0, "&bigcup;"], [0, "&diam;"], [0, "&sdot;"], [0, "&sstarf;"], [0, "&divideontimes;"], [0, "&bowtie;"], [0, "&ltimes;"], [0, "&rtimes;"], [0, "&leftthreetimes;"], [0, "&rightthreetimes;"], [0, "&backsimeq;"], [0, "&curlyvee;"], [0, "&curlywedge;"], [0, "&Sub;"], [0, "&Sup;"], [0, "&Cap;"], [0, "&Cup;"], [0, "&fork;"], [0, "&epar;"], [0, "&lessdot;"], [0, "&gtdot;"], [0, {
  v: "&Ll;",
  n: 824,
  o: "&nLl;"
}], [0, {
  v: "&Gg;",
  n: 824,
  o: "&nGg;"
}], [0, {
  v: "&leg;",
  n: 65024,
  o: "&lesg;"
}], [0, {
  v: "&gel;",
  n: 65024,
  o: "&gesl;"
}], [2, "&cuepr;"], [0, "&cuesc;"], [0, "&NotPrecedesSlantEqual;"], [0, "&NotSucceedsSlantEqual;"], [0, "&NotSquareSubsetEqual;"], [0, "&NotSquareSupersetEqual;"], [2, "&lnsim;"], [0, "&gnsim;"], [0, "&precnsim;"], [0, "&scnsim;"], [0, "&nltri;"], [0, "&NotRightTriangle;"], [0, "&nltrie;"], [0, "&NotRightTriangleEqual;"], [0, "&vellip;"], [0, "&ctdot;"], [0, "&utdot;"], [0, "&dtdot;"], [0, "&disin;"], [0, "&isinsv;"], [0, "&isins;"], [0, {
  v: "&isindot;",
  n: 824,
  o: "&notindot;"
}], [0, "&notinvc;"], [0, "&notinvb;"], [1, {
  v: "&isinE;",
  n: 824,
  o: "&notinE;"
}], [0, "&nisd;"], [0, "&xnis;"], [0, "&nis;"], [0, "&notnivc;"], [0, "&notnivb;"], [6, "&barwed;"], [0, "&Barwed;"], [1, "&lceil;"], [0, "&rceil;"], [0, "&LeftFloor;"], [0, "&rfloor;"], [0, "&drcrop;"], [0, "&dlcrop;"], [0, "&urcrop;"], [0, "&ulcrop;"], [0, "&bnot;"], [1, "&profline;"], [0, "&profsurf;"], [1, "&telrec;"], [0, "&target;"], [5, "&ulcorn;"], [0, "&urcorn;"], [0, "&dlcorn;"], [0, "&drcorn;"], [2, "&frown;"], [0, "&smile;"], [9, "&cylcty;"], [0, "&profalar;"], [7, "&topbot;"], [6, "&ovbar;"], [1, "&solbar;"], [60, "&angzarr;"], [51, "&lmoustache;"], [0, "&rmoustache;"], [2, "&OverBracket;"], [0, "&bbrk;"], [0, "&bbrktbrk;"], [37, "&OverParenthesis;"], [0, "&UnderParenthesis;"], [0, "&OverBrace;"], [0, "&UnderBrace;"], [2, "&trpezium;"], [4, "&elinters;"], [59, "&blank;"], [164, "&circledS;"], [55, "&boxh;"], [1, "&boxv;"], [9, "&boxdr;"], [3, "&boxdl;"], [3, "&boxur;"], [3, "&boxul;"], [3, "&boxvr;"], [7, "&boxvl;"], [7, "&boxhd;"], [7, "&boxhu;"], [7, "&boxvh;"], [19, "&boxH;"], [0, "&boxV;"], [0, "&boxdR;"], [0, "&boxDr;"], [0, "&boxDR;"], [0, "&boxdL;"], [0, "&boxDl;"], [0, "&boxDL;"], [0, "&boxuR;"], [0, "&boxUr;"], [0, "&boxUR;"], [0, "&boxuL;"], [0, "&boxUl;"], [0, "&boxUL;"], [0, "&boxvR;"], [0, "&boxVr;"], [0, "&boxVR;"], [0, "&boxvL;"], [0, "&boxVl;"], [0, "&boxVL;"], [0, "&boxHd;"], [0, "&boxhD;"], [0, "&boxHD;"], [0, "&boxHu;"], [0, "&boxhU;"], [0, "&boxHU;"], [0, "&boxvH;"], [0, "&boxVh;"], [0, "&boxVH;"], [19, "&uhblk;"], [3, "&lhblk;"], [3, "&block;"], [8, "&blk14;"], [0, "&blk12;"], [0, "&blk34;"], [13, "&square;"], [8, "&blacksquare;"], [0, "&EmptyVerySmallSquare;"], [1, "&rect;"], [0, "&marker;"], [2, "&fltns;"], [1, "&bigtriangleup;"], [0, "&blacktriangle;"], [0, "&triangle;"], [2, "&blacktriangleright;"], [0, "&rtri;"], [3, "&bigtriangledown;"], [0, "&blacktriangledown;"], [0, "&dtri;"], [2, "&blacktriangleleft;"], [0, "&ltri;"], [6, "&loz;"], [0, "&cir;"], [32, "&tridot;"], [2, "&bigcirc;"], [8, "&ultri;"], [0, "&urtri;"], [0, "&lltri;"], [0, "&EmptySmallSquare;"], [0, "&FilledSmallSquare;"], [8, "&bigstar;"], [0, "&star;"], [7, "&phone;"], [49, "&female;"], [1, "&male;"], [29, "&spades;"], [2, "&clubs;"], [1, "&hearts;"], [0, "&diamondsuit;"], [3, "&sung;"], [2, "&flat;"], [0, "&natural;"], [0, "&sharp;"], [163, "&check;"], [3, "&cross;"], [8, "&malt;"], [21, "&sext;"], [33, "&VerticalSeparator;"], [25, "&lbbrk;"], [0, "&rbbrk;"], [84, "&bsolhsub;"], [0, "&suphsol;"], [28, "&LeftDoubleBracket;"], [0, "&RightDoubleBracket;"], [0, "&lang;"], [0, "&rang;"], [0, "&Lang;"], [0, "&Rang;"], [0, "&loang;"], [0, "&roang;"], [7, "&longleftarrow;"], [0, "&longrightarrow;"], [0, "&longleftrightarrow;"], [0, "&DoubleLongLeftArrow;"], [0, "&DoubleLongRightArrow;"], [0, "&DoubleLongLeftRightArrow;"], [1, "&longmapsto;"], [2, "&dzigrarr;"], [258, "&nvlArr;"], [0, "&nvrArr;"], [0, "&nvHarr;"], [0, "&Map;"], [6, "&lbarr;"], [0, "&bkarow;"], [0, "&lBarr;"], [0, "&dbkarow;"], [0, "&drbkarow;"], [0, "&DDotrahd;"], [0, "&UpArrowBar;"], [0, "&DownArrowBar;"], [2, "&Rarrtl;"], [2, "&latail;"], [0, "&ratail;"], [0, "&lAtail;"], [0, "&rAtail;"], [0, "&larrfs;"], [0, "&rarrfs;"], [0, "&larrbfs;"], [0, "&rarrbfs;"], [2, "&nwarhk;"], [0, "&nearhk;"], [0, "&hksearow;"], [0, "&hkswarow;"], [0, "&nwnear;"], [0, "&nesear;"], [0, "&seswar;"], [0, "&swnwar;"], [8, {
  v: "&rarrc;",
  n: 824,
  o: "&nrarrc;"
}], [1, "&cudarrr;"], [0, "&ldca;"], [0, "&rdca;"], [0, "&cudarrl;"], [0, "&larrpl;"], [2, "&curarrm;"], [0, "&cularrp;"], [7, "&rarrpl;"], [2, "&harrcir;"], [0, "&Uarrocir;"], [0, "&lurdshar;"], [0, "&ldrushar;"], [2, "&LeftRightVector;"], [0, "&RightUpDownVector;"], [0, "&DownLeftRightVector;"], [0, "&LeftUpDownVector;"], [0, "&LeftVectorBar;"], [0, "&RightVectorBar;"], [0, "&RightUpVectorBar;"], [0, "&RightDownVectorBar;"], [0, "&DownLeftVectorBar;"], [0, "&DownRightVectorBar;"], [0, "&LeftUpVectorBar;"], [0, "&LeftDownVectorBar;"], [0, "&LeftTeeVector;"], [0, "&RightTeeVector;"], [0, "&RightUpTeeVector;"], [0, "&RightDownTeeVector;"], [0, "&DownLeftTeeVector;"], [0, "&DownRightTeeVector;"], [0, "&LeftUpTeeVector;"], [0, "&LeftDownTeeVector;"], [0, "&lHar;"], [0, "&uHar;"], [0, "&rHar;"], [0, "&dHar;"], [0, "&luruhar;"], [0, "&ldrdhar;"], [0, "&ruluhar;"], [0, "&rdldhar;"], [0, "&lharul;"], [0, "&llhard;"], [0, "&rharul;"], [0, "&lrhard;"], [0, "&udhar;"], [0, "&duhar;"], [0, "&RoundImplies;"], [0, "&erarr;"], [0, "&simrarr;"], [0, "&larrsim;"], [0, "&rarrsim;"], [0, "&rarrap;"], [0, "&ltlarr;"], [1, "&gtrarr;"], [0, "&subrarr;"], [1, "&suplarr;"], [0, "&lfisht;"], [0, "&rfisht;"], [0, "&ufisht;"], [0, "&dfisht;"], [5, "&lopar;"], [0, "&ropar;"], [4, "&lbrke;"], [0, "&rbrke;"], [0, "&lbrkslu;"], [0, "&rbrksld;"], [0, "&lbrksld;"], [0, "&rbrkslu;"], [0, "&langd;"], [0, "&rangd;"], [0, "&lparlt;"], [0, "&rpargt;"], [0, "&gtlPar;"], [0, "&ltrPar;"], [3, "&vzigzag;"], [1, "&vangrt;"], [0, "&angrtvbd;"], [6, "&ange;"], [0, "&range;"], [0, "&dwangle;"], [0, "&uwangle;"], [0, "&angmsdaa;"], [0, "&angmsdab;"], [0, "&angmsdac;"], [0, "&angmsdad;"], [0, "&angmsdae;"], [0, "&angmsdaf;"], [0, "&angmsdag;"], [0, "&angmsdah;"], [0, "&bemptyv;"], [0, "&demptyv;"], [0, "&cemptyv;"], [0, "&raemptyv;"], [0, "&laemptyv;"], [0, "&ohbar;"], [0, "&omid;"], [0, "&opar;"], [1, "&operp;"], [1, "&olcross;"], [0, "&odsold;"], [1, "&olcir;"], [0, "&ofcir;"], [0, "&olt;"], [0, "&ogt;"], [0, "&cirscir;"], [0, "&cirE;"], [0, "&solb;"], [0, "&bsolb;"], [3, "&boxbox;"], [3, "&trisb;"], [0, "&rtriltri;"], [0, {
  v: "&LeftTriangleBar;",
  n: 824,
  o: "&NotLeftTriangleBar;"
}], [0, {
  v: "&RightTriangleBar;",
  n: 824,
  o: "&NotRightTriangleBar;"
}], [11, "&iinfin;"], [0, "&infintie;"], [0, "&nvinfin;"], [4, "&eparsl;"], [0, "&smeparsl;"], [0, "&eqvparsl;"], [5, "&blacklozenge;"], [8, "&RuleDelayed;"], [1, "&dsol;"], [9, "&bigodot;"], [0, "&bigoplus;"], [0, "&bigotimes;"], [1, "&biguplus;"], [1, "&bigsqcup;"], [5, "&iiiint;"], [0, "&fpartint;"], [2, "&cirfnint;"], [0, "&awint;"], [0, "&rppolint;"], [0, "&scpolint;"], [0, "&npolint;"], [0, "&pointint;"], [0, "&quatint;"], [0, "&intlarhk;"], [10, "&pluscir;"], [0, "&plusacir;"], [0, "&simplus;"], [0, "&plusdu;"], [0, "&plussim;"], [0, "&plustwo;"], [1, "&mcomma;"], [0, "&minusdu;"], [2, "&loplus;"], [0, "&roplus;"], [0, "&Cross;"], [0, "&timesd;"], [0, "&timesbar;"], [1, "&smashp;"], [0, "&lotimes;"], [0, "&rotimes;"], [0, "&otimesas;"], [0, "&Otimes;"], [0, "&odiv;"], [0, "&triplus;"], [0, "&triminus;"], [0, "&tritime;"], [0, "&intprod;"], [2, "&amalg;"], [0, "&capdot;"], [1, "&ncup;"], [0, "&ncap;"], [0, "&capand;"], [0, "&cupor;"], [0, "&cupcap;"], [0, "&capcup;"], [0, "&cupbrcap;"], [0, "&capbrcup;"], [0, "&cupcup;"], [0, "&capcap;"], [0, "&ccups;"], [0, "&ccaps;"], [2, "&ccupssm;"], [2, "&And;"], [0, "&Or;"], [0, "&andand;"], [0, "&oror;"], [0, "&orslope;"], [0, "&andslope;"], [1, "&andv;"], [0, "&orv;"], [0, "&andd;"], [0, "&ord;"], [1, "&wedbar;"], [6, "&sdote;"], [3, "&simdot;"], [2, {
  v: "&congdot;",
  n: 824,
  o: "&ncongdot;"
}], [0, "&easter;"], [0, "&apacir;"], [0, {
  v: "&apE;",
  n: 824,
  o: "&napE;"
}], [0, "&eplus;"], [0, "&pluse;"], [0, "&Esim;"], [0, "&Colone;"], [0, "&Equal;"], [1, "&ddotseq;"], [0, "&equivDD;"], [0, "&ltcir;"], [0, "&gtcir;"], [0, "&ltquest;"], [0, "&gtquest;"], [0, {
  v: "&leqslant;",
  n: 824,
  o: "&nleqslant;"
}], [0, {
  v: "&geqslant;",
  n: 824,
  o: "&ngeqslant;"
}], [0, "&lesdot;"], [0, "&gesdot;"], [0, "&lesdoto;"], [0, "&gesdoto;"], [0, "&lesdotor;"], [0, "&gesdotol;"], [0, "&lap;"], [0, "&gap;"], [0, "&lne;"], [0, "&gne;"], [0, "&lnap;"], [0, "&gnap;"], [0, "&lEg;"], [0, "&gEl;"], [0, "&lsime;"], [0, "&gsime;"], [0, "&lsimg;"], [0, "&gsiml;"], [0, "&lgE;"], [0, "&glE;"], [0, "&lesges;"], [0, "&gesles;"], [0, "&els;"], [0, "&egs;"], [0, "&elsdot;"], [0, "&egsdot;"], [0, "&el;"], [0, "&eg;"], [2, "&siml;"], [0, "&simg;"], [0, "&simlE;"], [0, "&simgE;"], [0, {
  v: "&LessLess;",
  n: 824,
  o: "&NotNestedLessLess;"
}], [0, {
  v: "&GreaterGreater;",
  n: 824,
  o: "&NotNestedGreaterGreater;"
}], [1, "&glj;"], [0, "&gla;"], [0, "&ltcc;"], [0, "&gtcc;"], [0, "&lescc;"], [0, "&gescc;"], [0, "&smt;"], [0, "&lat;"], [0, {
  v: "&smte;",
  n: 65024,
  o: "&smtes;"
}], [0, {
  v: "&late;",
  n: 65024,
  o: "&lates;"
}], [0, "&bumpE;"], [0, {
  v: "&PrecedesEqual;",
  n: 824,
  o: "&NotPrecedesEqual;"
}], [0, {
  v: "&sce;",
  n: 824,
  o: "&NotSucceedsEqual;"
}], [2, "&prE;"], [0, "&scE;"], [0, "&precneqq;"], [0, "&scnE;"], [0, "&prap;"], [0, "&scap;"], [0, "&precnapprox;"], [0, "&scnap;"], [0, "&Pr;"], [0, "&Sc;"], [0, "&subdot;"], [0, "&supdot;"], [0, "&subplus;"], [0, "&supplus;"], [0, "&submult;"], [0, "&supmult;"], [0, "&subedot;"], [0, "&supedot;"], [0, {
  v: "&subE;",
  n: 824,
  o: "&nsubE;"
}], [0, {
  v: "&supE;",
  n: 824,
  o: "&nsupE;"
}], [0, "&subsim;"], [0, "&supsim;"], [2, {
  v: "&subnE;",
  n: 65024,
  o: "&varsubsetneqq;"
}], [0, {
  v: "&supnE;",
  n: 65024,
  o: "&varsupsetneqq;"
}], [2, "&csub;"], [0, "&csup;"], [0, "&csube;"], [0, "&csupe;"], [0, "&subsup;"], [0, "&supsub;"], [0, "&subsub;"], [0, "&supsup;"], [0, "&suphsub;"], [0, "&supdsub;"], [0, "&forkv;"], [0, "&topfork;"], [0, "&mlcp;"], [8, "&Dashv;"], [1, "&Vdashl;"], [0, "&Barv;"], [0, "&vBar;"], [0, "&vBarv;"], [1, "&Vbar;"], [0, "&Not;"], [0, "&bNot;"], [0, "&rnmid;"], [0, "&cirmid;"], [0, "&midcir;"], [0, "&topcir;"], [0, "&nhpar;"], [0, "&parsim;"], [9, {
  v: "&parsl;",
  n: 8421,
  o: "&nparsl;"
}], [44343, {
  n: new Map(/* @__PURE__ */ restoreDiff([[56476, "&Ascr;"], [1, "&Cscr;"], [0, "&Dscr;"], [2, "&Gscr;"], [2, "&Jscr;"], [0, "&Kscr;"], [2, "&Nscr;"], [0, "&Oscr;"], [0, "&Pscr;"], [0, "&Qscr;"], [1, "&Sscr;"], [0, "&Tscr;"], [0, "&Uscr;"], [0, "&Vscr;"], [0, "&Wscr;"], [0, "&Xscr;"], [0, "&Yscr;"], [0, "&Zscr;"], [0, "&ascr;"], [0, "&bscr;"], [0, "&cscr;"], [0, "&dscr;"], [1, "&fscr;"], [1, "&hscr;"], [0, "&iscr;"], [0, "&jscr;"], [0, "&kscr;"], [0, "&lscr;"], [0, "&mscr;"], [0, "&nscr;"], [1, "&pscr;"], [0, "&qscr;"], [0, "&rscr;"], [0, "&sscr;"], [0, "&tscr;"], [0, "&uscr;"], [0, "&vscr;"], [0, "&wscr;"], [0, "&xscr;"], [0, "&yscr;"], [0, "&zscr;"], [52, "&Afr;"], [0, "&Bfr;"], [1, "&Dfr;"], [0, "&Efr;"], [0, "&Ffr;"], [0, "&Gfr;"], [2, "&Jfr;"], [0, "&Kfr;"], [0, "&Lfr;"], [0, "&Mfr;"], [0, "&Nfr;"], [0, "&Ofr;"], [0, "&Pfr;"], [0, "&Qfr;"], [1, "&Sfr;"], [0, "&Tfr;"], [0, "&Ufr;"], [0, "&Vfr;"], [0, "&Wfr;"], [0, "&Xfr;"], [0, "&Yfr;"], [1, "&afr;"], [0, "&bfr;"], [0, "&cfr;"], [0, "&dfr;"], [0, "&efr;"], [0, "&ffr;"], [0, "&gfr;"], [0, "&hfr;"], [0, "&ifr;"], [0, "&jfr;"], [0, "&kfr;"], [0, "&lfr;"], [0, "&mfr;"], [0, "&nfr;"], [0, "&ofr;"], [0, "&pfr;"], [0, "&qfr;"], [0, "&rfr;"], [0, "&sfr;"], [0, "&tfr;"], [0, "&ufr;"], [0, "&vfr;"], [0, "&wfr;"], [0, "&xfr;"], [0, "&yfr;"], [0, "&zfr;"], [0, "&Aopf;"], [0, "&Bopf;"], [1, "&Dopf;"], [0, "&Eopf;"], [0, "&Fopf;"], [0, "&Gopf;"], [1, "&Iopf;"], [0, "&Jopf;"], [0, "&Kopf;"], [0, "&Lopf;"], [0, "&Mopf;"], [1, "&Oopf;"], [3, "&Sopf;"], [0, "&Topf;"], [0, "&Uopf;"], [0, "&Vopf;"], [0, "&Wopf;"], [0, "&Xopf;"], [0, "&Yopf;"], [1, "&aopf;"], [0, "&bopf;"], [0, "&copf;"], [0, "&dopf;"], [0, "&eopf;"], [0, "&fopf;"], [0, "&gopf;"], [0, "&hopf;"], [0, "&iopf;"], [0, "&jopf;"], [0, "&kopf;"], [0, "&lopf;"], [0, "&mopf;"], [0, "&nopf;"], [0, "&oopf;"], [0, "&popf;"], [0, "&qopf;"], [0, "&ropf;"], [0, "&sopf;"], [0, "&topf;"], [0, "&uopf;"], [0, "&vopf;"], [0, "&wopf;"], [0, "&xopf;"], [0, "&yopf;"], [0, "&zopf;"]]))
}], [8906, "&fflig;"], [0, "&filig;"], [0, "&fllig;"], [0, "&ffilig;"], [0, "&ffllig;"]]));
var _escape = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.escape = exports.encodeXML = exports.getCodePoint = exports.xmlReplacer = void 0;
  exports.xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
  var xmlCodeMap = /* @__PURE__ */ new Map([[34, "&quot;"], [38, "&amp;"], [39, "&apos;"], [60, "&lt;"], [62, "&gt;"]]);
  exports.getCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  String.prototype.codePointAt != null ? function(str, index) {
    return str.codePointAt(index);
  } : (
    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    function(c, index) {
      return (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index);
    }
  );
  function encodeXML(str) {
    var ret = "";
    var lastIdx = 0;
    var match;
    while ((match = exports.xmlReplacer.exec(str)) !== null) {
      var i = match.index;
      var char = str.charCodeAt(i);
      var next = xmlCodeMap.get(char);
      if (next !== void 0) {
        ret += str.substring(lastIdx, i) + next;
        lastIdx = i + 1;
      } else {
        ret += "".concat(str.substring(lastIdx, i), "&#x").concat((0, exports.getCodePoint)(str, i).toString(16), ";");
        lastIdx = exports.xmlReplacer.lastIndex += Number((char & 64512) === 55296);
      }
    }
    return ret + str.substr(lastIdx);
  }
  exports.encodeXML = encodeXML;
  exports.escape = encodeXML;
  function getEscaper(regex, map) {
    return function escape(data) {
      var match;
      var lastIdx = 0;
      var result2 = "";
      while (match = regex.exec(data)) {
        if (lastIdx !== match.index) {
          result2 += data.substring(lastIdx, match.index);
        }
        result2 += map.get(match[0].charCodeAt(0));
        lastIdx = match.index + 1;
      }
      return result2 + data.substring(lastIdx);
    };
  }
  exports.escapeUTF8 = getEscaper(/[&<>'"]/g, xmlCodeMap);
  exports.escapeAttribute = getEscaper(/["&\u00A0]/g, /* @__PURE__ */ new Map([[34, "&quot;"], [38, "&amp;"], [160, "&nbsp;"]]));
  exports.escapeText = getEscaper(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([[38, "&amp;"], [60, "&lt;"], [62, "&gt;"], [160, "&nbsp;"]]));
})(_escape);
var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(encode, "__esModule", {
  value: true
});
encode.encodeNonAsciiHTML = encode.encodeHTML = void 0;
var encode_html_js_1 = __importDefault$1(encodeHtml);
var escape_js_1 = _escape;
var htmlReplacer = /[\t\n!-,./:-@[-`\f{-}$\x80-\uFFFF]/g;
function encodeHTML(data) {
  return encodeHTMLTrieRe(htmlReplacer, data);
}
encode.encodeHTML = encodeHTML;
function encodeNonAsciiHTML(data) {
  return encodeHTMLTrieRe(escape_js_1.xmlReplacer, data);
}
encode.encodeNonAsciiHTML = encodeNonAsciiHTML;
function encodeHTMLTrieRe(regExp, str) {
  var ret = "";
  var lastIdx = 0;
  var match;
  while ((match = regExp.exec(str)) !== null) {
    var i = match.index;
    ret += str.substring(lastIdx, i);
    var char = str.charCodeAt(i);
    var next = encode_html_js_1.default.get(char);
    if (typeof next === "object") {
      if (i + 1 < str.length) {
        var nextChar = str.charCodeAt(i + 1);
        var value = typeof next.n === "number" ? next.n === nextChar ? next.o : void 0 : next.n.get(nextChar);
        if (value !== void 0) {
          ret += value;
          lastIdx = regExp.lastIndex += 1;
          continue;
        }
      }
      next = next.v;
    }
    if (next !== void 0) {
      ret += next;
      lastIdx = i + 1;
    } else {
      var cp = (0, escape_js_1.getCodePoint)(str, i);
      ret += "&#x".concat(cp.toString(16), ";");
      lastIdx = regExp.lastIndex += Number(cp !== char);
    }
  }
  return ret + str.substr(lastIdx);
}
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLAttribute = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.DecodingMode = exports.EntityDecoder = exports.encodeHTML5 = exports.encodeHTML4 = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.escape = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = exports.EncodingMode = exports.EntityLevel = void 0;
  var decode_js_12 = decode;
  var encode_js_1 = encode;
  var escape_js_12 = _escape;
  var EntityLevel;
  (function(EntityLevel2) {
    EntityLevel2[EntityLevel2["XML"] = 0] = "XML";
    EntityLevel2[EntityLevel2["HTML"] = 1] = "HTML";
  })(EntityLevel = exports.EntityLevel || (exports.EntityLevel = {}));
  var EncodingMode;
  (function(EncodingMode2) {
    EncodingMode2[EncodingMode2["UTF8"] = 0] = "UTF8";
    EncodingMode2[EncodingMode2["ASCII"] = 1] = "ASCII";
    EncodingMode2[EncodingMode2["Extensive"] = 2] = "Extensive";
    EncodingMode2[EncodingMode2["Attribute"] = 3] = "Attribute";
    EncodingMode2[EncodingMode2["Text"] = 4] = "Text";
  })(EncodingMode = exports.EncodingMode || (exports.EncodingMode = {}));
  function decode$1(data, options) {
    if (options === void 0) {
      options = EntityLevel.XML;
    }
    var level = typeof options === "number" ? options : options.level;
    if (level === EntityLevel.HTML) {
      var mode = typeof options === "object" ? options.mode : void 0;
      return (0, decode_js_12.decodeHTML)(data, mode);
    }
    return (0, decode_js_12.decodeXML)(data);
  }
  exports.decode = decode$1;
  function decodeStrict(data, options) {
    var _a2;
    if (options === void 0) {
      options = EntityLevel.XML;
    }
    var opts = typeof options === "number" ? {
      level: options
    } : options;
    (_a2 = opts.mode) !== null && _a2 !== void 0 ? _a2 : opts.mode = decode_js_12.DecodingMode.Strict;
    return decode$1(data, opts);
  }
  exports.decodeStrict = decodeStrict;
  function encode$1(data, options) {
    if (options === void 0) {
      options = EntityLevel.XML;
    }
    var opts = typeof options === "number" ? {
      level: options
    } : options;
    if (opts.mode === EncodingMode.UTF8)
      return (0, escape_js_12.escapeUTF8)(data);
    if (opts.mode === EncodingMode.Attribute)
      return (0, escape_js_12.escapeAttribute)(data);
    if (opts.mode === EncodingMode.Text)
      return (0, escape_js_12.escapeText)(data);
    if (opts.level === EntityLevel.HTML) {
      if (opts.mode === EncodingMode.ASCII) {
        return (0, encode_js_1.encodeNonAsciiHTML)(data);
      }
      return (0, encode_js_1.encodeHTML)(data);
    }
    return (0, escape_js_12.encodeXML)(data);
  }
  exports.encode = encode$1;
  var escape_js_2 = _escape;
  Object.defineProperty(exports, "encodeXML", {
    enumerable: true,
    get: function() {
      return escape_js_2.encodeXML;
    }
  });
  Object.defineProperty(exports, "escape", {
    enumerable: true,
    get: function() {
      return escape_js_2.escape;
    }
  });
  Object.defineProperty(exports, "escapeUTF8", {
    enumerable: true,
    get: function() {
      return escape_js_2.escapeUTF8;
    }
  });
  Object.defineProperty(exports, "escapeAttribute", {
    enumerable: true,
    get: function() {
      return escape_js_2.escapeAttribute;
    }
  });
  Object.defineProperty(exports, "escapeText", {
    enumerable: true,
    get: function() {
      return escape_js_2.escapeText;
    }
  });
  var encode_js_2 = encode;
  Object.defineProperty(exports, "encodeHTML", {
    enumerable: true,
    get: function() {
      return encode_js_2.encodeHTML;
    }
  });
  Object.defineProperty(exports, "encodeNonAsciiHTML", {
    enumerable: true,
    get: function() {
      return encode_js_2.encodeNonAsciiHTML;
    }
  });
  Object.defineProperty(exports, "encodeHTML4", {
    enumerable: true,
    get: function() {
      return encode_js_2.encodeHTML;
    }
  });
  Object.defineProperty(exports, "encodeHTML5", {
    enumerable: true,
    get: function() {
      return encode_js_2.encodeHTML;
    }
  });
  var decode_js_2 = decode;
  Object.defineProperty(exports, "EntityDecoder", {
    enumerable: true,
    get: function() {
      return decode_js_2.EntityDecoder;
    }
  });
  Object.defineProperty(exports, "DecodingMode", {
    enumerable: true,
    get: function() {
      return decode_js_2.DecodingMode;
    }
  });
  Object.defineProperty(exports, "decodeXML", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeXML;
    }
  });
  Object.defineProperty(exports, "decodeHTML", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeHTML;
    }
  });
  Object.defineProperty(exports, "decodeHTMLStrict", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeHTMLStrict;
    }
  });
  Object.defineProperty(exports, "decodeHTMLAttribute", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeHTMLAttribute;
    }
  });
  Object.defineProperty(exports, "decodeHTML4", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeHTML;
    }
  });
  Object.defineProperty(exports, "decodeHTML5", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeHTML;
    }
  });
  Object.defineProperty(exports, "decodeHTML4Strict", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeHTMLStrict;
    }
  });
  Object.defineProperty(exports, "decodeHTML5Strict", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeHTMLStrict;
    }
  });
  Object.defineProperty(exports, "decodeXMLStrict", {
    enumerable: true,
    get: function() {
      return decode_js_2.decodeXML;
    }
  });
})(lib);
var foreignNames = {};
Object.defineProperty(foreignNames, "__esModule", {
  value: true
});
foreignNames.attributeNames = foreignNames.elementNames = void 0;
foreignNames.elementNames = new Map(["altGlyph", "altGlyphDef", "altGlyphItem", "animateColor", "animateMotion", "animateTransform", "clipPath", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "foreignObject", "glyphRef", "linearGradient", "radialGradient", "textPath"].map(function(val) {
  return [val.toLowerCase(), val];
}));
foreignNames.attributeNames = new Map(["definitionURL", "attributeName", "attributeType", "baseFrequency", "baseProfile", "calcMode", "clipPathUnits", "diffuseConstant", "edgeMode", "filterUnits", "glyphRef", "gradientTransform", "gradientUnits", "kernelMatrix", "kernelUnitLength", "keyPoints", "keySplines", "keyTimes", "lengthAdjust", "limitingConeAngle", "markerHeight", "markerUnits", "markerWidth", "maskContentUnits", "maskUnits", "numOctaves", "pathLength", "patternContentUnits", "patternTransform", "patternUnits", "pointsAtX", "pointsAtY", "pointsAtZ", "preserveAlpha", "preserveAspectRatio", "primitiveUnits", "refX", "refY", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "specularConstant", "specularExponent", "spreadMethod", "startOffset", "stdDeviation", "stitchTiles", "surfaceScale", "systemLanguage", "tableValues", "targetX", "targetY", "textLength", "viewBox", "viewTarget", "xChannelSelector", "yChannelSelector", "zoomAndPan"].map(function(val) {
  return [val.toLowerCase(), val];
}));
var __assign = commonjsGlobal && commonjsGlobal.__assign || function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result2 = {};
  if (mod != null) {
    for (var k in mod)
      if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
        __createBinding(result2, mod, k);
  }
  __setModuleDefault(result2, mod);
  return result2;
};
Object.defineProperty(lib$1, "__esModule", {
  value: true
});
lib$1.render = void 0;
var ElementType = __importStar(lib$3);
var entities_1 = lib;
var foreignNames_js_1 = foreignNames;
var unencodedElements = /* @__PURE__ */ new Set(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]);
function replaceQuotes(value) {
  return value.replace(/"/g, "&quot;");
}
function formatAttributes(attributes, opts) {
  var _a2;
  if (!attributes)
    return;
  var encode2 = ((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) === false ? replaceQuotes : opts.xmlMode || opts.encodeEntities !== "utf8" ? entities_1.encodeXML : entities_1.escapeAttribute;
  return Object.keys(attributes).map(function(key) {
    var _a22, _b2;
    var value = (_a22 = attributes[key]) !== null && _a22 !== void 0 ? _a22 : "";
    if (opts.xmlMode === "foreign") {
      key = (_b2 = foreignNames_js_1.attributeNames.get(key)) !== null && _b2 !== void 0 ? _b2 : key;
    }
    if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
      return key;
    }
    return "".concat(key, '="').concat(encode2(value), '"');
  }).join(" ");
}
var singleTag = /* @__PURE__ */ new Set(["area", "base", "basefont", "br", "col", "command", "embed", "frame", "hr", "img", "input", "isindex", "keygen", "link", "meta", "param", "source", "track", "wbr"]);
function render(node2, options) {
  if (options === void 0) {
    options = {};
  }
  var nodes = "length" in node2 ? node2 : [node2];
  var output = "";
  for (var i = 0; i < nodes.length; i++) {
    output += renderNode(nodes[i], options);
  }
  return output;
}
lib$1.render = render;
lib$1.default = render;
function renderNode(node2, options) {
  switch (node2.type) {
    case ElementType.Root:
      return render(node2.children, options);
    case ElementType.Doctype:
    case ElementType.Directive:
      return renderDirective(node2);
    case ElementType.Comment:
      return renderComment(node2);
    case ElementType.CDATA:
      return renderCdata(node2);
    case ElementType.Script:
    case ElementType.Style:
    case ElementType.Tag:
      return renderTag(node2, options);
    case ElementType.Text:
      return renderText(node2, options);
  }
}
var foreignModeIntegrationPoints = /* @__PURE__ */ new Set(["mi", "mo", "mn", "ms", "mtext", "annotation-xml", "foreignObject", "desc", "title"]);
var foreignElements = /* @__PURE__ */ new Set(["svg", "math"]);
function renderTag(elem, opts) {
  var _a2;
  if (opts.xmlMode === "foreign") {
    elem.name = (_a2 = foreignNames_js_1.elementNames.get(elem.name)) !== null && _a2 !== void 0 ? _a2 : elem.name;
    if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
      opts = __assign(__assign({}, opts), {
        xmlMode: false
      });
    }
  }
  if (!opts.xmlMode && foreignElements.has(elem.name)) {
    opts = __assign(__assign({}, opts), {
      xmlMode: "foreign"
    });
  }
  var tag = "<".concat(elem.name);
  var attribs = formatAttributes(elem.attribs, opts);
  if (attribs) {
    tag += " ".concat(attribs);
  }
  if (elem.children.length === 0 && (opts.xmlMode ? (
    // In XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
    opts.selfClosingTags !== false
  ) : (
    // User explicitly asked for self-closing tags, even in HTML mode
    opts.selfClosingTags && singleTag.has(elem.name)
  ))) {
    if (!opts.xmlMode)
      tag += " ";
    tag += "/>";
  } else {
    tag += ">";
    if (elem.children.length > 0) {
      tag += render(elem.children, opts);
    }
    if (opts.xmlMode || !singleTag.has(elem.name)) {
      tag += "</".concat(elem.name, ">");
    }
  }
  return tag;
}
function renderDirective(elem) {
  return "<".concat(elem.data, ">");
}
function renderText(elem, opts) {
  var _a2;
  var data = elem.data || "";
  if (((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) {
    data = opts.xmlMode || opts.encodeEntities !== "utf8" ? (0, entities_1.encodeXML)(data) : (0, entities_1.escapeText)(data);
  }
  return data;
}
function renderCdata(elem) {
  return "<![CDATA[".concat(elem.children[0].data, "]]>");
}
function renderComment(elem) {
  return "<!--".concat(elem.data, "-->");
}
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(stringify$5, "__esModule", {
  value: true
});
stringify$5.innerText = stringify$5.textContent = stringify$5.getText = stringify$5.getInnerHTML = stringify$5.getOuterHTML = void 0;
var domhandler_1$3 = lib$4;
var dom_serializer_1 = __importDefault(lib$1);
var domelementtype_1 = lib$3;
function getOuterHTML(node2, options) {
  return (0, dom_serializer_1.default)(node2, options);
}
stringify$5.getOuterHTML = getOuterHTML;
function getInnerHTML(node2, options) {
  return (0, domhandler_1$3.hasChildren)(node2) ? node2.children.map(function(node3) {
    return getOuterHTML(node3, options);
  }).join("") : "";
}
stringify$5.getInnerHTML = getInnerHTML;
function getText(node2) {
  if (Array.isArray(node2))
    return node2.map(getText).join("");
  if ((0, domhandler_1$3.isTag)(node2))
    return node2.name === "br" ? "\n" : getText(node2.children);
  if ((0, domhandler_1$3.isCDATA)(node2))
    return getText(node2.children);
  if ((0, domhandler_1$3.isText)(node2))
    return node2.data;
  return "";
}
stringify$5.getText = getText;
function textContent(node2) {
  if (Array.isArray(node2))
    return node2.map(textContent).join("");
  if ((0, domhandler_1$3.hasChildren)(node2) && !(0, domhandler_1$3.isComment)(node2)) {
    return textContent(node2.children);
  }
  if ((0, domhandler_1$3.isText)(node2))
    return node2.data;
  return "";
}
stringify$5.textContent = textContent;
function innerText(node2) {
  if (Array.isArray(node2))
    return node2.map(innerText).join("");
  if ((0, domhandler_1$3.hasChildren)(node2) && (node2.type === domelementtype_1.ElementType.Tag || (0, domhandler_1$3.isCDATA)(node2))) {
    return innerText(node2.children);
  }
  if ((0, domhandler_1$3.isText)(node2))
    return node2.data;
  return "";
}
stringify$5.innerText = innerText;
var traversal = {};
Object.defineProperty(traversal, "__esModule", {
  value: true
});
traversal.prevElementSibling = traversal.nextElementSibling = traversal.getName = traversal.hasAttrib = traversal.getAttributeValue = traversal.getSiblings = traversal.getParent = traversal.getChildren = void 0;
var domhandler_1$2 = lib$4;
function getChildren(elem) {
  return (0, domhandler_1$2.hasChildren)(elem) ? elem.children : [];
}
traversal.getChildren = getChildren;
function getParent(elem) {
  return elem.parent || null;
}
traversal.getParent = getParent;
function getSiblings(elem) {
  var _a2, _b2;
  var parent = getParent(elem);
  if (parent != null)
    return getChildren(parent);
  var siblings = [elem];
  var prev = elem.prev, next = elem.next;
  while (prev != null) {
    siblings.unshift(prev);
    _a2 = prev, prev = _a2.prev;
  }
  while (next != null) {
    siblings.push(next);
    _b2 = next, next = _b2.next;
  }
  return siblings;
}
traversal.getSiblings = getSiblings;
function getAttributeValue(elem, name) {
  var _a2;
  return (_a2 = elem.attribs) === null || _a2 === void 0 ? void 0 : _a2[name];
}
traversal.getAttributeValue = getAttributeValue;
function hasAttrib(elem, name) {
  return elem.attribs != null && Object.prototype.hasOwnProperty.call(elem.attribs, name) && elem.attribs[name] != null;
}
traversal.hasAttrib = hasAttrib;
function getName(elem) {
  return elem.name;
}
traversal.getName = getName;
function nextElementSibling(elem) {
  var _a2;
  var next = elem.next;
  while (next !== null && !(0, domhandler_1$2.isTag)(next))
    _a2 = next, next = _a2.next;
  return next;
}
traversal.nextElementSibling = nextElementSibling;
function prevElementSibling(elem) {
  var _a2;
  var prev = elem.prev;
  while (prev !== null && !(0, domhandler_1$2.isTag)(prev))
    _a2 = prev, prev = _a2.prev;
  return prev;
}
traversal.prevElementSibling = prevElementSibling;
var manipulation = {};
Object.defineProperty(manipulation, "__esModule", {
  value: true
});
manipulation.prepend = manipulation.prependChild = manipulation.append = manipulation.appendChild = manipulation.replaceElement = manipulation.removeElement = void 0;
function removeElement(elem) {
  if (elem.prev)
    elem.prev.next = elem.next;
  if (elem.next)
    elem.next.prev = elem.prev;
  if (elem.parent) {
    var childs = elem.parent.children;
    var childsIndex = childs.lastIndexOf(elem);
    if (childsIndex >= 0) {
      childs.splice(childsIndex, 1);
    }
  }
  elem.next = null;
  elem.prev = null;
  elem.parent = null;
}
manipulation.removeElement = removeElement;
function replaceElement(elem, replacement) {
  var prev = replacement.prev = elem.prev;
  if (prev) {
    prev.next = replacement;
  }
  var next = replacement.next = elem.next;
  if (next) {
    next.prev = replacement;
  }
  var parent = replacement.parent = elem.parent;
  if (parent) {
    var childs = parent.children;
    childs[childs.lastIndexOf(elem)] = replacement;
    elem.parent = null;
  }
}
manipulation.replaceElement = replaceElement;
function appendChild(parent, child) {
  removeElement(child);
  child.next = null;
  child.parent = parent;
  if (parent.children.push(child) > 1) {
    var sibling = parent.children[parent.children.length - 2];
    sibling.next = child;
    child.prev = sibling;
  } else {
    child.prev = null;
  }
}
manipulation.appendChild = appendChild;
function append(elem, next) {
  removeElement(next);
  var parent = elem.parent;
  var currNext = elem.next;
  next.next = currNext;
  next.prev = elem;
  elem.next = next;
  next.parent = parent;
  if (currNext) {
    currNext.prev = next;
    if (parent) {
      var childs = parent.children;
      childs.splice(childs.lastIndexOf(currNext), 0, next);
    }
  } else if (parent) {
    parent.children.push(next);
  }
}
manipulation.append = append;
function prependChild(parent, child) {
  removeElement(child);
  child.parent = parent;
  child.prev = null;
  if (parent.children.unshift(child) !== 1) {
    var sibling = parent.children[1];
    sibling.prev = child;
    child.next = sibling;
  } else {
    child.next = null;
  }
}
manipulation.prependChild = prependChild;
function prepend(elem, prev) {
  removeElement(prev);
  var parent = elem.parent;
  if (parent) {
    var childs = parent.children;
    childs.splice(childs.indexOf(elem), 0, prev);
  }
  if (elem.prev) {
    elem.prev.next = prev;
  }
  prev.parent = parent;
  prev.prev = elem.prev;
  prev.next = elem;
  elem.prev = prev;
}
manipulation.prepend = prepend;
var querying = {};
Object.defineProperty(querying, "__esModule", {
  value: true
});
querying.findAll = querying.existsOne = querying.findOne = querying.findOneChild = querying.find = querying.filter = void 0;
var domhandler_1$1 = lib$4;
function filter$1(test, node2, recurse, limit) {
  if (recurse === void 0) {
    recurse = true;
  }
  if (limit === void 0) {
    limit = Infinity;
  }
  return find(test, Array.isArray(node2) ? node2 : [node2], recurse, limit);
}
querying.filter = filter$1;
function find(test, nodes, recurse, limit) {
  var result2 = [];
  var nodeStack = [nodes];
  var indexStack = [0];
  for (; ; ) {
    if (indexStack[0] >= nodeStack[0].length) {
      if (indexStack.length === 1) {
        return result2;
      }
      nodeStack.shift();
      indexStack.shift();
      continue;
    }
    var elem = nodeStack[0][indexStack[0]++];
    if (test(elem)) {
      result2.push(elem);
      if (--limit <= 0)
        return result2;
    }
    if (recurse && (0, domhandler_1$1.hasChildren)(elem) && elem.children.length > 0) {
      indexStack.unshift(0);
      nodeStack.unshift(elem.children);
    }
  }
}
querying.find = find;
function findOneChild(test, nodes) {
  return nodes.find(test);
}
querying.findOneChild = findOneChild;
function findOne(test, nodes, recurse) {
  if (recurse === void 0) {
    recurse = true;
  }
  var elem = null;
  for (var i = 0; i < nodes.length && !elem; i++) {
    var node2 = nodes[i];
    if (!(0, domhandler_1$1.isTag)(node2)) {
      continue;
    } else if (test(node2)) {
      elem = node2;
    } else if (recurse && node2.children.length > 0) {
      elem = findOne(test, node2.children, true);
    }
  }
  return elem;
}
querying.findOne = findOne;
function existsOne(test, nodes) {
  return nodes.some(function(checked) {
    return (0, domhandler_1$1.isTag)(checked) && (test(checked) || existsOne(test, checked.children));
  });
}
querying.existsOne = existsOne;
function findAll(test, nodes) {
  var result2 = [];
  var nodeStack = [nodes];
  var indexStack = [0];
  for (; ; ) {
    if (indexStack[0] >= nodeStack[0].length) {
      if (nodeStack.length === 1) {
        return result2;
      }
      nodeStack.shift();
      indexStack.shift();
      continue;
    }
    var elem = nodeStack[0][indexStack[0]++];
    if (!(0, domhandler_1$1.isTag)(elem))
      continue;
    if (test(elem))
      result2.push(elem);
    if (elem.children.length > 0) {
      indexStack.unshift(0);
      nodeStack.unshift(elem.children);
    }
  }
}
querying.findAll = findAll;
var legacy = {};
Object.defineProperty(legacy, "__esModule", {
  value: true
});
legacy.getElementsByTagType = legacy.getElementsByTagName = legacy.getElementById = legacy.getElements = legacy.testElement = void 0;
var domhandler_1 = lib$4;
var querying_js_1 = querying;
var Checks = {
  tag_name: function(name) {
    if (typeof name === "function") {
      return function(elem) {
        return (0, domhandler_1.isTag)(elem) && name(elem.name);
      };
    } else if (name === "*") {
      return domhandler_1.isTag;
    }
    return function(elem) {
      return (0, domhandler_1.isTag)(elem) && elem.name === name;
    };
  },
  tag_type: function(type) {
    if (typeof type === "function") {
      return function(elem) {
        return type(elem.type);
      };
    }
    return function(elem) {
      return elem.type === type;
    };
  },
  tag_contains: function(data) {
    if (typeof data === "function") {
      return function(elem) {
        return (0, domhandler_1.isText)(elem) && data(elem.data);
      };
    }
    return function(elem) {
      return (0, domhandler_1.isText)(elem) && elem.data === data;
    };
  }
};
function getAttribCheck(attrib, value) {
  if (typeof value === "function") {
    return function(elem) {
      return (0, domhandler_1.isTag)(elem) && value(elem.attribs[attrib]);
    };
  }
  return function(elem) {
    return (0, domhandler_1.isTag)(elem) && elem.attribs[attrib] === value;
  };
}
function combineFuncs(a, b) {
  return function(elem) {
    return a(elem) || b(elem);
  };
}
function compileTest(options) {
  var funcs = Object.keys(options).map(function(key) {
    var value = options[key];
    return Object.prototype.hasOwnProperty.call(Checks, key) ? Checks[key](value) : getAttribCheck(key, value);
  });
  return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
}
function testElement(options, node2) {
  var test = compileTest(options);
  return test ? test(node2) : true;
}
legacy.testElement = testElement;
function getElements(options, nodes, recurse, limit) {
  if (limit === void 0) {
    limit = Infinity;
  }
  var test = compileTest(options);
  return test ? (0, querying_js_1.filter)(test, nodes, recurse, limit) : [];
}
legacy.getElements = getElements;
function getElementById(id, nodes, recurse) {
  if (recurse === void 0) {
    recurse = true;
  }
  if (!Array.isArray(nodes))
    nodes = [nodes];
  return (0, querying_js_1.findOne)(getAttribCheck("id", id), nodes, recurse);
}
legacy.getElementById = getElementById;
function getElementsByTagName(tagName, nodes, recurse, limit) {
  if (recurse === void 0) {
    recurse = true;
  }
  if (limit === void 0) {
    limit = Infinity;
  }
  return (0, querying_js_1.filter)(Checks["tag_name"](tagName), nodes, recurse, limit);
}
legacy.getElementsByTagName = getElementsByTagName;
function getElementsByTagType(type, nodes, recurse, limit) {
  if (recurse === void 0) {
    recurse = true;
  }
  if (limit === void 0) {
    limit = Infinity;
  }
  return (0, querying_js_1.filter)(Checks["tag_type"](type), nodes, recurse, limit);
}
legacy.getElementsByTagType = getElementsByTagType;
var helpers = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.uniqueSort = exports.compareDocumentPosition = exports.DocumentPosition = exports.removeSubsets = void 0;
  var domhandler_12 = lib$4;
  function removeSubsets(nodes) {
    var idx = nodes.length;
    while (--idx >= 0) {
      var node2 = nodes[idx];
      if (idx > 0 && nodes.lastIndexOf(node2, idx - 1) >= 0) {
        nodes.splice(idx, 1);
        continue;
      }
      for (var ancestor = node2.parent; ancestor; ancestor = ancestor.parent) {
        if (nodes.includes(ancestor)) {
          nodes.splice(idx, 1);
          break;
        }
      }
    }
    return nodes;
  }
  exports.removeSubsets = removeSubsets;
  var DocumentPosition;
  (function(DocumentPosition2) {
    DocumentPosition2[DocumentPosition2["DISCONNECTED"] = 1] = "DISCONNECTED";
    DocumentPosition2[DocumentPosition2["PRECEDING"] = 2] = "PRECEDING";
    DocumentPosition2[DocumentPosition2["FOLLOWING"] = 4] = "FOLLOWING";
    DocumentPosition2[DocumentPosition2["CONTAINS"] = 8] = "CONTAINS";
    DocumentPosition2[DocumentPosition2["CONTAINED_BY"] = 16] = "CONTAINED_BY";
  })(DocumentPosition = exports.DocumentPosition || (exports.DocumentPosition = {}));
  function compareDocumentPosition(nodeA, nodeB) {
    var aParents = [];
    var bParents = [];
    if (nodeA === nodeB) {
      return 0;
    }
    var current = (0, domhandler_12.hasChildren)(nodeA) ? nodeA : nodeA.parent;
    while (current) {
      aParents.unshift(current);
      current = current.parent;
    }
    current = (0, domhandler_12.hasChildren)(nodeB) ? nodeB : nodeB.parent;
    while (current) {
      bParents.unshift(current);
      current = current.parent;
    }
    var maxIdx = Math.min(aParents.length, bParents.length);
    var idx = 0;
    while (idx < maxIdx && aParents[idx] === bParents[idx]) {
      idx++;
    }
    if (idx === 0) {
      return DocumentPosition.DISCONNECTED;
    }
    var sharedParent = aParents[idx - 1];
    var siblings = sharedParent.children;
    var aSibling = aParents[idx];
    var bSibling = bParents[idx];
    if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
      if (sharedParent === nodeB) {
        return DocumentPosition.FOLLOWING | DocumentPosition.CONTAINED_BY;
      }
      return DocumentPosition.FOLLOWING;
    }
    if (sharedParent === nodeA) {
      return DocumentPosition.PRECEDING | DocumentPosition.CONTAINS;
    }
    return DocumentPosition.PRECEDING;
  }
  exports.compareDocumentPosition = compareDocumentPosition;
  function uniqueSort(nodes) {
    nodes = nodes.filter(function(node2, i, arr) {
      return !arr.includes(node2, i + 1);
    });
    nodes.sort(function(a, b) {
      var relative2 = compareDocumentPosition(a, b);
      if (relative2 & DocumentPosition.PRECEDING) {
        return -1;
      } else if (relative2 & DocumentPosition.FOLLOWING) {
        return 1;
      }
      return 0;
    });
    return nodes;
  }
  exports.uniqueSort = uniqueSort;
})(helpers);
var feeds = {};
Object.defineProperty(feeds, "__esModule", {
  value: true
});
feeds.getFeed = void 0;
var stringify_js_1 = stringify$5;
var legacy_js_1 = legacy;
function getFeed(doc) {
  var feedRoot = getOneElement(isValidFeed, doc);
  return !feedRoot ? null : feedRoot.name === "feed" ? getAtomFeed(feedRoot) : getRssFeed(feedRoot);
}
feeds.getFeed = getFeed;
function getAtomFeed(feedRoot) {
  var _a2;
  var childs = feedRoot.children;
  var feed = {
    type: "atom",
    items: (0, legacy_js_1.getElementsByTagName)("entry", childs).map(function(item) {
      var _a22;
      var children = item.children;
      var entry = {
        media: getMediaElements(children)
      };
      addConditionally(entry, "id", "id", children);
      addConditionally(entry, "title", "title", children);
      var href2 = (_a22 = getOneElement("link", children)) === null || _a22 === void 0 ? void 0 : _a22.attribs["href"];
      if (href2) {
        entry.link = href2;
      }
      var description = fetchScan("summary", children) || fetchScan("content", children);
      if (description) {
        entry.description = description;
      }
      var pubDate = fetchScan("updated", children);
      if (pubDate) {
        entry.pubDate = new Date(pubDate);
      }
      return entry;
    })
  };
  addConditionally(feed, "id", "id", childs);
  addConditionally(feed, "title", "title", childs);
  var href = (_a2 = getOneElement("link", childs)) === null || _a2 === void 0 ? void 0 : _a2.attribs["href"];
  if (href) {
    feed.link = href;
  }
  addConditionally(feed, "description", "subtitle", childs);
  var updated = fetchScan("updated", childs);
  if (updated) {
    feed.updated = new Date(updated);
  }
  addConditionally(feed, "author", "email", childs, true);
  return feed;
}
function getRssFeed(feedRoot) {
  var _a2, _b2;
  var childs = (_b2 = (_a2 = getOneElement("channel", feedRoot.children)) === null || _a2 === void 0 ? void 0 : _a2.children) !== null && _b2 !== void 0 ? _b2 : [];
  var feed = {
    type: feedRoot.name.substr(0, 3),
    id: "",
    items: (0, legacy_js_1.getElementsByTagName)("item", feedRoot.children).map(function(item) {
      var children = item.children;
      var entry = {
        media: getMediaElements(children)
      };
      addConditionally(entry, "id", "guid", children);
      addConditionally(entry, "title", "title", children);
      addConditionally(entry, "link", "link", children);
      addConditionally(entry, "description", "description", children);
      var pubDate = fetchScan("pubDate", children) || fetchScan("dc:date", children);
      if (pubDate)
        entry.pubDate = new Date(pubDate);
      return entry;
    })
  };
  addConditionally(feed, "title", "title", childs);
  addConditionally(feed, "link", "link", childs);
  addConditionally(feed, "description", "description", childs);
  var updated = fetchScan("lastBuildDate", childs);
  if (updated) {
    feed.updated = new Date(updated);
  }
  addConditionally(feed, "author", "managingEditor", childs, true);
  return feed;
}
var MEDIA_KEYS_STRING = ["url", "type", "lang"];
var MEDIA_KEYS_INT = ["fileSize", "bitrate", "framerate", "samplingrate", "channels", "duration", "height", "width"];
function getMediaElements(where) {
  return (0, legacy_js_1.getElementsByTagName)("media:content", where).map(function(elem) {
    var attribs = elem.attribs;
    var media = {
      medium: attribs["medium"],
      isDefault: !!attribs["isDefault"]
    };
    for (var _i = 0, MEDIA_KEYS_STRING_1 = MEDIA_KEYS_STRING; _i < MEDIA_KEYS_STRING_1.length; _i++) {
      var attrib = MEDIA_KEYS_STRING_1[_i];
      if (attribs[attrib]) {
        media[attrib] = attribs[attrib];
      }
    }
    for (var _a2 = 0, MEDIA_KEYS_INT_1 = MEDIA_KEYS_INT; _a2 < MEDIA_KEYS_INT_1.length; _a2++) {
      var attrib = MEDIA_KEYS_INT_1[_a2];
      if (attribs[attrib]) {
        media[attrib] = parseInt(attribs[attrib], 10);
      }
    }
    if (attribs["expression"]) {
      media.expression = attribs["expression"];
    }
    return media;
  });
}
function getOneElement(tagName, node2) {
  return (0, legacy_js_1.getElementsByTagName)(tagName, node2, true, 1)[0];
}
function fetchScan(tagName, where, recurse) {
  if (recurse === void 0) {
    recurse = false;
  }
  return (0, stringify_js_1.textContent)((0, legacy_js_1.getElementsByTagName)(tagName, where, recurse, 1)).trim();
}
function addConditionally(obj, prop, tagName, where, recurse) {
  if (recurse === void 0) {
    recurse = false;
  }
  var val = fetchScan(tagName, where, recurse);
  if (val)
    obj[prop] = val;
}
function isValidFeed(value) {
  return value === "rss" || value === "feed" || value === "rdf:RDF";
}
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = {
        enumerable: true,
        get: function() {
          return m[k];
        }
      };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding2(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.hasChildren = exports.isDocument = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = void 0;
  __exportStar(stringify$5, exports);
  __exportStar(traversal, exports);
  __exportStar(manipulation, exports);
  __exportStar(querying, exports);
  __exportStar(legacy, exports);
  __exportStar(helpers, exports);
  __exportStar(feeds, exports);
  var domhandler_12 = lib$4;
  Object.defineProperty(exports, "isTag", {
    enumerable: true,
    get: function() {
      return domhandler_12.isTag;
    }
  });
  Object.defineProperty(exports, "isCDATA", {
    enumerable: true,
    get: function() {
      return domhandler_12.isCDATA;
    }
  });
  Object.defineProperty(exports, "isText", {
    enumerable: true,
    get: function() {
      return domhandler_12.isText;
    }
  });
  Object.defineProperty(exports, "isComment", {
    enumerable: true,
    get: function() {
      return domhandler_12.isComment;
    }
  });
  Object.defineProperty(exports, "isDocument", {
    enumerable: true,
    get: function() {
      return domhandler_12.isDocument;
    }
  });
  Object.defineProperty(exports, "hasChildren", {
    enumerable: true,
    get: function() {
      return domhandler_12.hasChildren;
    }
  });
})(lib$2);
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = {
        enumerable: true,
        get: function() {
          return m[k];
        }
      };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
      enumerable: true,
      value: v
    });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result2 = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding2(result2, mod, k);
    }
    __setModuleDefault2(result2, mod);
    return result2;
  };
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
      "default": mod
    };
  };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DomUtils = exports.parseFeed = exports.getFeed = exports.ElementType = exports.Tokenizer = exports.createDomStream = exports.parseDOM = exports.parseDocument = exports.DefaultHandler = exports.DomHandler = exports.Parser = void 0;
  var Parser_js_1 = Parser$3;
  var Parser_js_2 = Parser$3;
  Object.defineProperty(exports, "Parser", {
    enumerable: true,
    get: function() {
      return Parser_js_2.Parser;
    }
  });
  var domhandler_12 = lib$4;
  var domhandler_2 = lib$4;
  Object.defineProperty(exports, "DomHandler", {
    enumerable: true,
    get: function() {
      return domhandler_2.DomHandler;
    }
  });
  Object.defineProperty(exports, "DefaultHandler", {
    enumerable: true,
    get: function() {
      return domhandler_2.DomHandler;
    }
  });
  function parseDocument(data, options) {
    var handler = new domhandler_12.DomHandler(void 0, options);
    new Parser_js_1.Parser(handler, options).end(data);
    return handler.root;
  }
  exports.parseDocument = parseDocument;
  function parseDOM(data, options) {
    return parseDocument(data, options).children;
  }
  exports.parseDOM = parseDOM;
  function createDomStream(callback, options, elementCallback) {
    var handler = new domhandler_12.DomHandler(callback, options, elementCallback);
    return new Parser_js_1.Parser(handler, options);
  }
  exports.createDomStream = createDomStream;
  var Tokenizer_js_12 = Tokenizer;
  Object.defineProperty(exports, "Tokenizer", {
    enumerable: true,
    get: function() {
      return __importDefault2(Tokenizer_js_12).default;
    }
  });
  exports.ElementType = __importStar2(lib$3);
  var domutils_1 = lib$2;
  var domutils_2 = lib$2;
  Object.defineProperty(exports, "getFeed", {
    enumerable: true,
    get: function() {
      return domutils_2.getFeed;
    }
  });
  var parseFeedDefaultOptions = {
    xmlMode: true
  };
  function parseFeed(feed, options) {
    if (options === void 0) {
      options = parseFeedDefaultOptions;
    }
    return (0, domutils_1.getFeed)(parseDOM(feed, options));
  }
  exports.parseFeed = parseFeed;
  exports.DomUtils = __importStar2(lib$2);
})(lib$5);
var escapeStringRegexp$1 = (string) => {
  if (typeof string !== "string") {
    throw new TypeError("Expected a string");
  }
  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
};
var isPlainObject$2 = {};
Object.defineProperty(isPlainObject$2, "__esModule", {
  value: true
});
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function isPlainObject$1(o) {
  var ctor, prot;
  if (isObject(o) === false)
    return false;
  ctor = o.constructor;
  if (ctor === void 0)
    return true;
  prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }
  return true;
}
isPlainObject$2.isPlainObject = isPlainObject$1;
var isMergeableObject = function isMergeableObject2(value) {
  return isNonNullObject(value) && !isSpecial(value);
};
function isNonNullObject(value) {
  return !!value && typeof value === "object";
}
function isSpecial(value) {
  var stringValue = Object.prototype.toString.call(value);
  return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
}
var canUseSymbol = typeof Symbol === "function" && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 60103;
function isReactElement(value) {
  return value.$$typeof === REACT_ELEMENT_TYPE;
}
function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}
function cloneUnlessOtherwiseSpecified(value, options) {
  return options.clone !== false && options.isMergeableObject(value) ? deepmerge$1(emptyTarget(value), value, options) : value;
}
function defaultArrayMerge(target, source, options) {
  return target.concat(source).map(function(element) {
    return cloneUnlessOtherwiseSpecified(element, options);
  });
}
function getMergeFunction(key, options) {
  if (!options.customMerge) {
    return deepmerge$1;
  }
  var customMerge = options.customMerge(key);
  return typeof customMerge === "function" ? customMerge : deepmerge$1;
}
function getEnumerableOwnPropertySymbols(target) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
    return target.propertyIsEnumerable(symbol);
  }) : [];
}
function getKeys(target) {
  return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}
function propertyIsOnObject(object, property) {
  try {
    return property in object;
  } catch (_) {
    return false;
  }
}
function propertyIsUnsafe(target, key) {
  return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
}
function mergeObject(target, source, options) {
  var destination = {};
  if (options.isMergeableObject(target)) {
    getKeys(target).forEach(function(key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  getKeys(source).forEach(function(key) {
    if (propertyIsUnsafe(target, key)) {
      return;
    }
    if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
      destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    }
  });
  return destination;
}
function deepmerge$1(target, source, options) {
  options = options || {};
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
  var sourceIsArray = Array.isArray(source);
  var targetIsArray = Array.isArray(target);
  var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options);
  } else {
    return mergeObject(target, source, options);
  }
}
deepmerge$1.all = function deepmergeAll(array, options) {
  if (!Array.isArray(array)) {
    throw new Error("first argument should be an array");
  }
  return array.reduce(function(prev, next) {
    return deepmerge$1(prev, next, options);
  }, {});
};
var deepmerge_1 = deepmerge$1;
var cjs = deepmerge_1;
var parseSrcsetExports = {};
var parseSrcset$1 = {
  get exports() {
    return parseSrcsetExports;
  },
  set exports(v) {
    parseSrcsetExports = v;
  }
};
(function(module) {
  (function(root2, factory) {
    if (module.exports) {
      module.exports = factory();
    } else {
      root2.parseSrcset = factory();
    }
  })(commonjsGlobal, function() {
    return function(input2) {
      function isSpace(c2) {
        return c2 === " " || // space
        c2 === "	" || // horizontal tab
        c2 === "\n" || // new line
        c2 === "\f" || // form feed
        c2 === "\r";
      }
      function collectCharacters(regEx) {
        var chars, match = regEx.exec(input2.substring(pos));
        if (match) {
          chars = match[0];
          pos += chars.length;
          return chars;
        }
      }
      var inputLength = input2.length, regexLeadingSpaces = /^[ \t\n\r\u000c]+/, regexLeadingCommasOrSpaces = /^[, \t\n\r\u000c]+/, regexLeadingNotSpaces = /^[^ \t\n\r\u000c]+/, regexTrailingCommas = /[,]+$/, regexNonNegativeInteger = /^\d+$/, regexFloatingPoint = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/, url, descriptors, currentDescriptor, state, c, pos = 0, candidates = [];
      while (true) {
        collectCharacters(regexLeadingCommasOrSpaces);
        if (pos >= inputLength) {
          return candidates;
        }
        url = collectCharacters(regexLeadingNotSpaces);
        descriptors = [];
        if (url.slice(-1) === ",") {
          url = url.replace(regexTrailingCommas, "");
          parseDescriptors();
        } else {
          tokenize2();
        }
      }
      function tokenize2() {
        collectCharacters(regexLeadingSpaces);
        currentDescriptor = "";
        state = "in descriptor";
        while (true) {
          c = input2.charAt(pos);
          if (state === "in descriptor") {
            if (isSpace(c)) {
              if (currentDescriptor) {
                descriptors.push(currentDescriptor);
                currentDescriptor = "";
                state = "after descriptor";
              }
            } else if (c === ",") {
              pos += 1;
              if (currentDescriptor) {
                descriptors.push(currentDescriptor);
              }
              parseDescriptors();
              return;
            } else if (c === "(") {
              currentDescriptor = currentDescriptor + c;
              state = "in parens";
            } else if (c === "") {
              if (currentDescriptor) {
                descriptors.push(currentDescriptor);
              }
              parseDescriptors();
              return;
            } else {
              currentDescriptor = currentDescriptor + c;
            }
          } else if (state === "in parens") {
            if (c === ")") {
              currentDescriptor = currentDescriptor + c;
              state = "in descriptor";
            } else if (c === "") {
              descriptors.push(currentDescriptor);
              parseDescriptors();
              return;
            } else {
              currentDescriptor = currentDescriptor + c;
            }
          } else if (state === "after descriptor") {
            if (isSpace(c))
              ;
            else if (c === "") {
              parseDescriptors();
              return;
            } else {
              state = "in descriptor";
              pos -= 1;
            }
          }
          pos += 1;
        }
      }
      function parseDescriptors() {
        var pError = false, w, d, h, i, candidate = {}, desc, lastChar, value, intVal, floatVal;
        for (i = 0; i < descriptors.length; i++) {
          desc = descriptors[i];
          lastChar = desc[desc.length - 1];
          value = desc.substring(0, desc.length - 1);
          intVal = parseInt(value, 10);
          floatVal = parseFloat(value);
          if (regexNonNegativeInteger.test(value) && lastChar === "w") {
            if (w || d) {
              pError = true;
            }
            if (intVal === 0) {
              pError = true;
            } else {
              w = intVal;
            }
          } else if (regexFloatingPoint.test(value) && lastChar === "x") {
            if (w || d || h) {
              pError = true;
            }
            if (floatVal < 0) {
              pError = true;
            } else {
              d = floatVal;
            }
          } else if (regexNonNegativeInteger.test(value) && lastChar === "h") {
            if (h || d) {
              pError = true;
            }
            if (intVal === 0) {
              pError = true;
            } else {
              h = intVal;
            }
          } else {
            pError = true;
          }
        }
        if (!pError) {
          candidate.url = url;
          if (w) {
            candidate.w = w;
          }
          if (d) {
            candidate.d = d;
          }
          if (h) {
            candidate.h = h;
          }
          candidates.push(candidate);
        } else if (console && console.log) {
          console.log("Invalid srcset descriptor found in '" + input2 + "' at '" + desc + "'.");
        }
      }
    };
  });
})(parseSrcset$1);
var picocolors_browserExports = {};
var picocolors_browser = {
  get exports() {
    return picocolors_browserExports;
  },
  set exports(v) {
    picocolors_browserExports = v;
  }
};
var create = function() {
  let x = String;
  return {
    isColorSupported: false,
    reset: x,
    bold: x,
    dim: x,
    italic: x,
    underline: x,
    inverse: x,
    hidden: x,
    strikethrough: x,
    black: x,
    red: x,
    green: x,
    yellow: x,
    blue: x,
    magenta: x,
    cyan: x,
    white: x,
    gray: x,
    bgBlack: x,
    bgRed: x,
    bgGreen: x,
    bgYellow: x,
    bgBlue: x,
    bgMagenta: x,
    bgCyan: x,
    bgWhite: x
  };
};
picocolors_browser.exports = create();
picocolors_browserExports.createColors = create;
var __viteBrowserExternal = {};
var __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal
}, Symbol.toStringTag, {
  value: "Module"
}));
var require$$2 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
pico = picocolors_browserExports;
var terminalHighlight$1 = require$$2;
var CssSyntaxError$3 = class CssSyntaxError extends Error {
  constructor(message, line, column, source, file, plugin2) {
    super(message);
    this.name = "CssSyntaxError";
    this.reason = message;
    if (file) {
      this.file = file;
    }
    if (source) {
      this.source = source;
    }
    if (plugin2) {
      this.plugin = plugin2;
    }
    if (typeof line !== "undefined" && typeof column !== "undefined") {
      if (typeof line === "number") {
        this.line = line;
        this.column = column;
      } else {
        this.line = line.line;
        this.column = line.column;
        this.endLine = column.line;
        this.endColumn = column.column;
      }
    }
    this.setMessage();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CssSyntaxError);
    }
  }
  setMessage() {
    this.message = this.plugin ? this.plugin + ": " : "";
    this.message += this.file ? this.file : "<css input>";
    if (typeof this.line !== "undefined") {
      this.message += ":" + this.line + ":" + this.column;
    }
    this.message += ": " + this.reason;
  }
  showSourceCode(color) {
    if (!this.source)
      return "";
    var css = this.source;
    if (color == null)
      color = pico.isColorSupported;
    if (terminalHighlight$1) {
      if (color)
        css = terminalHighlight$1(css);
    }
    var lines = css.split(/\r?\n/);
    var start = Math.max(this.line - 3, 0);
    var end = Math.min(this.line + 2, lines.length);
    var maxWidth = String(end).length;
    var mark, aside;
    if (color) {
      var {
        bold,
        red,
        gray
      } = pico.createColors(true);
      mark = (text) => bold(red(text));
      aside = (text) => gray(text);
    } else {
      mark = aside = (str) => str;
    }
    return lines.slice(start, end).map((line, index) => {
      var number = start + 1 + index;
      var gutter = " " + (" " + number).slice(-maxWidth) + " | ";
      if (number === this.line) {
        var spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, this.column - 1).replace(/[^\t]/g, " ");
        return mark(">") + aside(gutter) + line + "\n " + spacing + mark("^");
      }
      return " " + aside(gutter) + line;
    }).join("\n");
  }
  toString() {
    var code = this.showSourceCode();
    if (code) {
      code = "\n\n" + code + "\n";
    }
    return this.name + ": " + this.message + code;
  }
};
var cssSyntaxError = CssSyntaxError$3;
CssSyntaxError$3.default = CssSyntaxError$3;
var symbols = {};
symbols.isClean = Symbol("isClean");
symbols.my = Symbol("my");
var DEFAULT_RAW = {
  colon: ": ",
  indent: "    ",
  beforeDecl: "\n",
  beforeRule: "\n",
  beforeOpen: " ",
  beforeClose: "\n",
  beforeComment: "\n",
  after: "\n",
  emptyBody: "",
  commentLeft: " ",
  commentRight: " ",
  semicolon: false
};
function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}
var Stringifier$2 = class Stringifier {
  constructor(builder) {
    this.builder = builder;
  }
  stringify(node2, semicolon) {
    if (!this[node2.type]) {
      throw new Error("Unknown AST node type " + node2.type + ". Maybe you need to change PostCSS stringifier.");
    }
    this[node2.type](node2, semicolon);
  }
  document(node2) {
    this.body(node2);
  }
  root(node2) {
    this.body(node2);
    if (node2.raws.after)
      this.builder(node2.raws.after);
  }
  comment(node2) {
    var left = this.raw(node2, "left", "commentLeft");
    var right = this.raw(node2, "right", "commentRight");
    this.builder("/*" + left + node2.text + right + "*/", node2);
  }
  decl(node2, semicolon) {
    var between = this.raw(node2, "between", "colon");
    var string = node2.prop + between + this.rawValue(node2, "value");
    if (node2.important) {
      string += node2.raws.important || " !important";
    }
    if (semicolon)
      string += ";";
    this.builder(string, node2);
  }
  rule(node2) {
    this.block(node2, this.rawValue(node2, "selector"));
    if (node2.raws.ownSemicolon) {
      this.builder(node2.raws.ownSemicolon, node2, "end");
    }
  }
  atrule(node2, semicolon) {
    var name = "@" + node2.name;
    var params = node2.params ? this.rawValue(node2, "params") : "";
    if (typeof node2.raws.afterName !== "undefined") {
      name += node2.raws.afterName;
    } else if (params) {
      name += " ";
    }
    if (node2.nodes) {
      this.block(node2, name + params);
    } else {
      var end = (node2.raws.between || "") + (semicolon ? ";" : "");
      this.builder(name + params + end, node2);
    }
  }
  body(node2) {
    var last = node2.nodes.length - 1;
    while (last > 0) {
      if (node2.nodes[last].type !== "comment")
        break;
      last -= 1;
    }
    var semicolon = this.raw(node2, "semicolon");
    for (let i = 0; i < node2.nodes.length; i++) {
      var child = node2.nodes[i];
      var before = this.raw(child, "before");
      if (before)
        this.builder(before);
      this.stringify(child, last !== i || semicolon);
    }
  }
  block(node2, start) {
    var between = this.raw(node2, "between", "beforeOpen");
    this.builder(start + between + "{", node2, "start");
    var after;
    if (node2.nodes && node2.nodes.length) {
      this.body(node2);
      after = this.raw(node2, "after");
    } else {
      after = this.raw(node2, "after", "emptyBody");
    }
    if (after)
      this.builder(after);
    this.builder("}", node2, "end");
  }
  raw(node2, own, detect) {
    var value;
    if (!detect)
      detect = own;
    if (own) {
      value = node2.raws[own];
      if (typeof value !== "undefined")
        return value;
    }
    var parent = node2.parent;
    if (detect === "before") {
      if (!parent || parent.type === "root" && parent.first === node2) {
        return "";
      }
      if (parent && parent.type === "document") {
        return "";
      }
    }
    if (!parent)
      return DEFAULT_RAW[detect];
    var root2 = node2.root();
    if (!root2.rawCache)
      root2.rawCache = {};
    if (typeof root2.rawCache[detect] !== "undefined") {
      return root2.rawCache[detect];
    }
    if (detect === "before" || detect === "after") {
      return this.beforeAfter(node2, detect);
    } else {
      var method = "raw" + capitalize(detect);
      if (this[method]) {
        value = this[method](root2, node2);
      } else {
        root2.walk((i) => {
          value = i.raws[own];
          if (typeof value !== "undefined")
            return false;
        });
      }
    }
    if (typeof value === "undefined")
      value = DEFAULT_RAW[detect];
    root2.rawCache[detect] = value;
    return value;
  }
  rawSemicolon(root2) {
    var value;
    root2.walk((i) => {
      if (i.nodes && i.nodes.length && i.last.type === "decl") {
        value = i.raws.semicolon;
        if (typeof value !== "undefined")
          return false;
      }
    });
    return value;
  }
  rawEmptyBody(root2) {
    var value;
    root2.walk((i) => {
      if (i.nodes && i.nodes.length === 0) {
        value = i.raws.after;
        if (typeof value !== "undefined")
          return false;
      }
    });
    return value;
  }
  rawIndent(root2) {
    if (root2.raws.indent)
      return root2.raws.indent;
    var value;
    root2.walk((i) => {
      var p = i.parent;
      if (p && p !== root2 && p.parent && p.parent === root2) {
        if (typeof i.raws.before !== "undefined") {
          var parts = i.raws.before.split("\n");
          value = parts[parts.length - 1];
          value = value.replace(/\S/g, "");
          return false;
        }
      }
    });
    return value;
  }
  rawBeforeComment(root2, node2) {
    var value;
    root2.walkComments((i) => {
      if (typeof i.raws.before !== "undefined") {
        value = i.raws.before;
        if (value.includes("\n")) {
          value = value.replace(/[^\n]+$/, "");
        }
        return false;
      }
    });
    if (typeof value === "undefined") {
      value = this.raw(node2, null, "beforeDecl");
    } else if (value) {
      value = value.replace(/\S/g, "");
    }
    return value;
  }
  rawBeforeDecl(root2, node2) {
    var value;
    root2.walkDecls((i) => {
      if (typeof i.raws.before !== "undefined") {
        value = i.raws.before;
        if (value.includes("\n")) {
          value = value.replace(/[^\n]+$/, "");
        }
        return false;
      }
    });
    if (typeof value === "undefined") {
      value = this.raw(node2, null, "beforeRule");
    } else if (value) {
      value = value.replace(/\S/g, "");
    }
    return value;
  }
  rawBeforeRule(root2) {
    var value;
    root2.walk((i) => {
      if (i.nodes && (i.parent !== root2 || root2.first !== i)) {
        if (typeof i.raws.before !== "undefined") {
          value = i.raws.before;
          if (value.includes("\n")) {
            value = value.replace(/[^\n]+$/, "");
          }
          return false;
        }
      }
    });
    if (value)
      value = value.replace(/\S/g, "");
    return value;
  }
  rawBeforeClose(root2) {
    var value;
    root2.walk((i) => {
      if (i.nodes && i.nodes.length > 0) {
        if (typeof i.raws.after !== "undefined") {
          value = i.raws.after;
          if (value.includes("\n")) {
            value = value.replace(/[^\n]+$/, "");
          }
          return false;
        }
      }
    });
    if (value)
      value = value.replace(/\S/g, "");
    return value;
  }
  rawBeforeOpen(root2) {
    var value;
    root2.walk((i) => {
      if (i.type !== "decl") {
        value = i.raws.between;
        if (typeof value !== "undefined")
          return false;
      }
    });
    return value;
  }
  rawColon(root2) {
    var value;
    root2.walkDecls((i) => {
      if (typeof i.raws.between !== "undefined") {
        value = i.raws.between.replace(/[^\s:]/g, "");
        return false;
      }
    });
    return value;
  }
  beforeAfter(node2, detect) {
    var value;
    if (node2.type === "decl") {
      value = this.raw(node2, null, "beforeDecl");
    } else if (node2.type === "comment") {
      value = this.raw(node2, null, "beforeComment");
    } else if (detect === "before") {
      value = this.raw(node2, null, "beforeRule");
    } else {
      value = this.raw(node2, null, "beforeClose");
    }
    var buf = node2.parent;
    var depth = 0;
    while (buf && buf.type !== "root") {
      depth += 1;
      buf = buf.parent;
    }
    if (value.includes("\n")) {
      var indent = this.raw(node2, null, "indent");
      if (indent.length) {
        for (let step = 0; step < depth; step++)
          value += indent;
      }
    }
    return value;
  }
  rawValue(node2, prop) {
    var value = node2[prop];
    var raw = node2.raws[prop];
    if (raw && raw.value === value) {
      return raw.raw;
    }
    return value;
  }
};
var stringifier = Stringifier$2;
Stringifier$2.default = Stringifier$2;
var Stringifier$1 = stringifier;
function stringify$4(node2, builder) {
  var str = new Stringifier$1(builder);
  str.stringify(node2);
}
var stringify_1 = stringify$4;
stringify$4.default = stringify$4;
var {
  isClean: isClean$2,
  my: my$2
} = symbols;
var CssSyntaxError$2 = cssSyntaxError;
var Stringifier2 = stringifier;
var stringify$3 = stringify_1;
function cloneNode(obj, parent) {
  var cloned = new obj.constructor();
  for (let i in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, i)) {
      continue;
    }
    if (i === "proxyCache")
      continue;
    var value = obj[i];
    var type = typeof value;
    if (i === "parent" && type === "object") {
      if (parent)
        cloned[i] = parent;
    } else if (i === "source") {
      cloned[i] = value;
    } else if (Array.isArray(value)) {
      cloned[i] = value.map((j) => cloneNode(j, cloned));
    } else {
      if (type === "object" && value !== null)
        value = cloneNode(value);
      cloned[i] = value;
    }
  }
  return cloned;
}
var Node$4 = class Node2 {
  constructor(defaults = {}) {
    this.raws = {};
    this[isClean$2] = false;
    this[my$2] = true;
    for (let name in defaults) {
      if (name === "nodes") {
        this.nodes = [];
        for (let node2 of defaults[name]) {
          if (typeof node2.clone === "function") {
            this.append(node2.clone());
          } else {
            this.append(node2);
          }
        }
      } else {
        this[name] = defaults[name];
      }
    }
  }
  error(message, opts = {}) {
    if (this.source) {
      var {
        start,
        end
      } = this.rangeBy(opts);
      return this.source.input.error(message, {
        line: start.line,
        column: start.column
      }, {
        line: end.line,
        column: end.column
      }, opts);
    }
    return new CssSyntaxError$2(message);
  }
  warn(result2, text, opts) {
    var data = {
      node: this
    };
    for (let i in opts)
      data[i] = opts[i];
    return result2.warn(text, data);
  }
  remove() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.parent = void 0;
    return this;
  }
  toString(stringifier2 = stringify$3) {
    if (stringifier2.stringify)
      stringifier2 = stringifier2.stringify;
    var result2 = "";
    stringifier2(this, (i) => {
      result2 += i;
    });
    return result2;
  }
  assign(overrides = {}) {
    for (let name in overrides) {
      this[name] = overrides[name];
    }
    return this;
  }
  clone(overrides = {}) {
    var cloned = cloneNode(this);
    for (let name in overrides) {
      cloned[name] = overrides[name];
    }
    return cloned;
  }
  cloneBefore(overrides = {}) {
    var cloned = this.clone(overrides);
    this.parent.insertBefore(this, cloned);
    return cloned;
  }
  cloneAfter(overrides = {}) {
    var cloned = this.clone(overrides);
    this.parent.insertAfter(this, cloned);
    return cloned;
  }
  replaceWith(...nodes) {
    if (this.parent) {
      var bookmark = this;
      var foundSelf = false;
      for (let node2 of nodes) {
        if (node2 === this) {
          foundSelf = true;
        } else if (foundSelf) {
          this.parent.insertAfter(bookmark, node2);
          bookmark = node2;
        } else {
          this.parent.insertBefore(bookmark, node2);
        }
      }
      if (!foundSelf) {
        this.remove();
      }
    }
    return this;
  }
  next() {
    if (!this.parent)
      return void 0;
    var index = this.parent.index(this);
    return this.parent.nodes[index + 1];
  }
  prev() {
    if (!this.parent)
      return void 0;
    var index = this.parent.index(this);
    return this.parent.nodes[index - 1];
  }
  before(add) {
    this.parent.insertBefore(this, add);
    return this;
  }
  after(add) {
    this.parent.insertAfter(this, add);
    return this;
  }
  root() {
    var result2 = this;
    while (result2.parent && result2.parent.type !== "document") {
      result2 = result2.parent;
    }
    return result2;
  }
  raw(prop, defaultType) {
    var str = new Stringifier2();
    return str.raw(this, prop, defaultType);
  }
  cleanRaws(keepBetween) {
    delete this.raws.before;
    delete this.raws.after;
    if (!keepBetween)
      delete this.raws.between;
  }
  toJSON(_, inputs) {
    var fixed = {};
    var emitInputs = inputs == null;
    inputs = inputs || /* @__PURE__ */ new Map();
    var inputsNextIndex = 0;
    for (let name in this) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) {
        continue;
      }
      if (name === "parent" || name === "proxyCache")
        continue;
      var value = this[name];
      if (Array.isArray(value)) {
        fixed[name] = value.map((i) => {
          if (typeof i === "object" && i.toJSON) {
            return i.toJSON(null, inputs);
          } else {
            return i;
          }
        });
      } else if (typeof value === "object" && value.toJSON) {
        fixed[name] = value.toJSON(null, inputs);
      } else if (name === "source") {
        var inputId = inputs.get(value.input);
        if (inputId == null) {
          inputId = inputsNextIndex;
          inputs.set(value.input, inputsNextIndex);
          inputsNextIndex++;
        }
        fixed[name] = {
          inputId,
          start: value.start,
          end: value.end
        };
      } else {
        fixed[name] = value;
      }
    }
    if (emitInputs) {
      fixed.inputs = [...inputs.keys()].map((input2) => input2.toJSON());
    }
    return fixed;
  }
  positionInside(index) {
    var string = this.toString();
    var column = this.source.start.column;
    var line = this.source.start.line;
    for (let i = 0; i < index; i++) {
      if (string[i] === "\n") {
        column = 1;
        line += 1;
      } else {
        column += 1;
      }
    }
    return {
      line,
      column
    };
  }
  positionBy(opts) {
    var pos = this.source.start;
    if (opts.index) {
      pos = this.positionInside(opts.index);
    } else if (opts.word) {
      var index = this.toString().indexOf(opts.word);
      if (index !== -1)
        pos = this.positionInside(index);
    }
    return pos;
  }
  rangeBy(opts) {
    var start = {
      line: this.source.start.line,
      column: this.source.start.column
    };
    var end = this.source.end ? {
      line: this.source.end.line,
      column: this.source.end.column + 1
    } : {
      line: start.line,
      column: start.column + 1
    };
    if (opts.word) {
      var index = this.toString().indexOf(opts.word);
      if (index !== -1) {
        start = this.positionInside(index);
        end = this.positionInside(index + opts.word.length);
      }
    } else {
      if (opts.start) {
        start = {
          line: opts.start.line,
          column: opts.start.column
        };
      } else if (opts.index) {
        start = this.positionInside(opts.index);
      }
      if (opts.end) {
        end = {
          line: opts.end.line,
          column: opts.end.column
        };
      } else if (opts.endIndex) {
        end = this.positionInside(opts.endIndex);
      } else if (opts.index) {
        end = this.positionInside(opts.index + 1);
      }
    }
    if (end.line < start.line || end.line === start.line && end.column <= start.column) {
      end = {
        line: start.line,
        column: start.column + 1
      };
    }
    return {
      start,
      end
    };
  }
  getProxyProcessor() {
    return {
      set(node2, prop, value) {
        if (node2[prop] === value)
          return true;
        node2[prop] = value;
        if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || /* c8 ignore next */
        prop === "text") {
          node2.markDirty();
        }
        return true;
      },
      get(node2, prop) {
        if (prop === "proxyOf") {
          return node2;
        } else if (prop === "root") {
          return () => node2.root().toProxy();
        } else {
          return node2[prop];
        }
      }
    };
  }
  toProxy() {
    if (!this.proxyCache) {
      this.proxyCache = new Proxy(this, this.getProxyProcessor());
    }
    return this.proxyCache;
  }
  addToError(error) {
    error.postcssNode = this;
    if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
      var s = this.source;
      error.stack = error.stack.replace(/\n\s{4}at /, `$&${s.input.from}:${s.start.line}:${s.start.column}$&`);
    }
    return error;
  }
  markDirty() {
    if (this[isClean$2]) {
      this[isClean$2] = false;
      var next = this;
      while (next = next.parent) {
        next[isClean$2] = false;
      }
    }
  }
  get proxyOf() {
    return this;
  }
};
var node = Node$4;
Node$4.default = Node$4;
var Node$3 = node;
var Declaration$4 = class Declaration extends Node$3 {
  constructor(defaults) {
    if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") {
      defaults = {
        ...defaults,
        value: String(defaults.value)
      };
    }
    super(defaults);
    this.type = "decl";
  }
  get variable() {
    return this.prop.startsWith("--") || this.prop[0] === "$";
  }
};
var declaration = Declaration$4;
Declaration$4.default = Declaration$4;
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var customAlphabet = (alphabet, defaultSize = 21) => {
  return (size = defaultSize) => {
    var id = "";
    var i = size;
    while (i--) {
      id += alphabet[Math.random() * alphabet.length | 0];
    }
    return id;
  };
};
nanoid$1 = (size = 21) => {
  var id = "";
  var i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};
var nonSecure = {
  nanoid: nanoid$1,
  customAlphabet
};
var {
  SourceMapConsumer: SourceMapConsumer$2,
  SourceMapGenerator: SourceMapGenerator$2
} = require$$2;
var {
  existsSync,
  readFileSync
} = require$$2;
var {
  dirname: dirname$1
} = require$$2;
function fromBase64(str) {
  if (Buffer) {
    return Buffer.from(str, "base64").toString();
  } else {
    return window.atob(str);
  }
}
var PreviousMap$2 = class PreviousMap {
  constructor(css, opts) {
    if (opts.map === false)
      return;
    this.loadAnnotation(css);
    this.inline = this.startWith(this.annotation, "data:");
    var prev = opts.map ? opts.map.prev : void 0;
    var text = this.loadMap(opts.from, prev);
    if (!this.mapFile && opts.from) {
      this.mapFile = opts.from;
    }
    if (this.mapFile)
      this.root = dirname$1(this.mapFile);
    if (text)
      this.text = text;
  }
  consumer() {
    if (!this.consumerCache) {
      this.consumerCache = new SourceMapConsumer$2(this.text);
    }
    return this.consumerCache;
  }
  withContent() {
    return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
  }
  startWith(string, start) {
    if (!string)
      return false;
    return string.substr(0, start.length) === start;
  }
  getAnnotationURL(sourceMapString) {
    return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
  }
  loadAnnotation(css) {
    var comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
    if (!comments)
      return;
    var start = css.lastIndexOf(comments.pop());
    var end = css.indexOf("*/", start);
    if (start > -1 && end > -1) {
      this.annotation = this.getAnnotationURL(css.substring(start, end));
    }
  }
  decodeInline(text) {
    var baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
    var baseUri = /^data:application\/json;base64,/;
    var charsetUri = /^data:application\/json;charset=utf-?8,/;
    var uri = /^data:application\/json,/;
    if (charsetUri.test(text) || uri.test(text)) {
      return decodeURIComponent(text.substr(RegExp.lastMatch.length));
    }
    if (baseCharsetUri.test(text) || baseUri.test(text)) {
      return fromBase64(text.substr(RegExp.lastMatch.length));
    }
    var encoding = text.match(/data:application\/json;([^,]+),/)[1];
    throw new Error("Unsupported source map encoding " + encoding);
  }
  loadFile(path) {
    this.root = dirname$1(path);
    if (existsSync(path)) {
      this.mapFile = path;
      return readFileSync(path, "utf-8").toString().trim();
    }
  }
  loadMap(file, prev) {
    if (prev === false)
      return false;
    if (prev) {
      if (typeof prev === "string") {
        return prev;
      } else if (typeof prev === "function") {
        var prevPath = prev(file);
        if (prevPath) {
          var map = this.loadFile(prevPath);
          if (!map) {
            throw new Error("Unable to load previous source map: " + prevPath.toString());
          }
          return map;
        }
      } else if (prev instanceof SourceMapConsumer$2) {
        return SourceMapGenerator$2.fromSourceMap(prev).toString();
      } else if (prev instanceof SourceMapGenerator$2) {
        return prev.toString();
      } else if (this.isMap(prev)) {
        return JSON.stringify(prev);
      } else {
        throw new Error("Unsupported previous source map format: " + prev.toString());
      }
    } else if (this.inline) {
      return this.decodeInline(this.annotation);
    } else if (this.annotation) {
      var map = this.annotation;
      if (file)
        map = join(dirname$1(file), map);
      return this.loadFile(map);
    }
  }
  isMap(map) {
    if (typeof map !== "object")
      return false;
    return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
  }
};
var previousMap = PreviousMap$2;
PreviousMap$2.default = PreviousMap$2;
var {
  SourceMapConsumer: SourceMapConsumer$1,
  SourceMapGenerator: SourceMapGenerator$1
} = require$$2;
var {
  fileURLToPath,
  pathToFileURL: pathToFileURL$1
} = require$$2;
var {
  resolve: resolve$1,
  isAbsolute
} = require$$2;
var {
  nanoid
} = nonSecure;
var terminalHighlight = require$$2;
var CssSyntaxError$1 = cssSyntaxError;
var PreviousMap$1 = previousMap;
var fromOffsetCache = Symbol("fromOffsetCache");
var sourceMapAvailable$1 = Boolean(SourceMapConsumer$1 && SourceMapGenerator$1);
var pathAvailable$1 = Boolean(resolve$1 && isAbsolute);
var Input$4 = class Input {
  constructor(css, opts = {}) {
    if (css === null || typeof css === "undefined" || typeof css === "object" && !css.toString) {
      throw new Error(`PostCSS received ${css} instead of CSS string`);
    }
    this.css = css.toString();
    if (this.css[0] === "\uFEFF" || this.css[0] === "\uFFFE") {
      this.hasBOM = true;
      this.css = this.css.slice(1);
    } else {
      this.hasBOM = false;
    }
    if (opts.from) {
      if (!pathAvailable$1 || /^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) {
        this.file = opts.from;
      } else {
        this.file = resolve$1(opts.from);
      }
    }
    if (pathAvailable$1 && sourceMapAvailable$1) {
      var map = new PreviousMap$1(this.css, opts);
      if (map.text) {
        this.map = map;
        var file = map.consumer().file;
        if (!this.file && file)
          this.file = this.mapResolve(file);
      }
    }
    if (!this.file) {
      this.id = "<input css " + nanoid(6) + ">";
    }
    if (this.map)
      this.map.file = this.from;
  }
  fromOffset(offset) {
    var lastLine, lineToIndex;
    if (!this[fromOffsetCache]) {
      var lines = this.css.split("\n");
      lineToIndex = new Array(lines.length);
      var prevIndex = 0;
      for (let i = 0, l = lines.length; i < l; i++) {
        lineToIndex[i] = prevIndex;
        prevIndex += lines[i].length + 1;
      }
      this[fromOffsetCache] = lineToIndex;
    } else {
      lineToIndex = this[fromOffsetCache];
    }
    lastLine = lineToIndex[lineToIndex.length - 1];
    var min = 0;
    if (offset >= lastLine) {
      min = lineToIndex.length - 1;
    } else {
      var max = lineToIndex.length - 2;
      var mid;
      while (min < max) {
        mid = min + (max - min >> 1);
        if (offset < lineToIndex[mid]) {
          max = mid - 1;
        } else if (offset >= lineToIndex[mid + 1]) {
          min = mid + 1;
        } else {
          min = mid;
          break;
        }
      }
    }
    return {
      line: min + 1,
      col: offset - lineToIndex[min] + 1
    };
  }
  error(message, line, column, opts = {}) {
    var result2, endLine, endColumn;
    if (line && typeof line === "object") {
      var start = line;
      var end = column;
      if (typeof start.offset === "number") {
        var pos = this.fromOffset(start.offset);
        line = pos.line;
        column = pos.col;
      } else {
        line = start.line;
        column = start.column;
      }
      if (typeof end.offset === "number") {
        var pos = this.fromOffset(end.offset);
        endLine = pos.line;
        endColumn = pos.col;
      } else {
        endLine = end.line;
        endColumn = end.column;
      }
    } else if (!column) {
      var pos = this.fromOffset(line);
      line = pos.line;
      column = pos.col;
    }
    var origin = this.origin(line, column, endLine, endColumn);
    if (origin) {
      result2 = new CssSyntaxError$1(message, origin.endLine === void 0 ? origin.line : {
        line: origin.line,
        column: origin.column
      }, origin.endLine === void 0 ? origin.column : {
        line: origin.endLine,
        column: origin.endColumn
      }, origin.source, origin.file, opts.plugin);
    } else {
      result2 = new CssSyntaxError$1(message, endLine === void 0 ? line : {
        line,
        column
      }, endLine === void 0 ? column : {
        line: endLine,
        column: endColumn
      }, this.css, this.file, opts.plugin);
    }
    result2.input = {
      line,
      column,
      endLine,
      endColumn,
      source: this.css
    };
    if (this.file) {
      if (pathToFileURL$1) {
        result2.input.url = pathToFileURL$1(this.file).toString();
      }
      result2.input.file = this.file;
    }
    return result2;
  }
  origin(line, column, endLine, endColumn) {
    if (!this.map)
      return false;
    var consumer = this.map.consumer();
    var from = consumer.originalPositionFor({
      line,
      column
    });
    if (!from.source)
      return false;
    var to;
    if (typeof endLine === "number") {
      to = consumer.originalPositionFor({
        line: endLine,
        column: endColumn
      });
    }
    var fromUrl;
    if (isAbsolute(from.source)) {
      fromUrl = pathToFileURL$1(from.source);
    } else {
      fromUrl = new URL(from.source, this.map.consumer().sourceRoot || pathToFileURL$1(this.map.mapFile));
    }
    var result2 = {
      url: fromUrl.toString(),
      line: from.line,
      column: from.column,
      endLine: to && to.line,
      endColumn: to && to.column
    };
    if (fromUrl.protocol === "file:") {
      if (fileURLToPath) {
        result2.file = fileURLToPath(fromUrl);
      } else {
        throw new Error(`file: protocol is not available in this PostCSS build`);
      }
    }
    var source = consumer.sourceContentFor(from.source);
    if (source)
      result2.source = source;
    return result2;
  }
  mapResolve(file) {
    if (/^\w+:\/\//.test(file)) {
      return file;
    }
    return resolve$1(this.map.consumer().sourceRoot || this.map.root || ".", file);
  }
  get from() {
    return this.file || this.id;
  }
  toJSON() {
    var json = {};
    for (let name of ["hasBOM", "css", "file", "id"]) {
      if (this[name] != null) {
        json[name] = this[name];
      }
    }
    if (this.map) {
      json.map = {
        ...this.map
      };
      if (json.map.consumerCache) {
        json.map.consumerCache = void 0;
      }
    }
    return json;
  }
};
var input = Input$4;
Input$4.default = Input$4;
if (terminalHighlight && terminalHighlight.registerInput) {
  terminalHighlight.registerInput(Input$4);
}
var {
  SourceMapConsumer,
  SourceMapGenerator
} = require$$2;
var {
  dirname,
  resolve,
  relative,
  sep
} = require$$2;
var {
  pathToFileURL
} = require$$2;
var Input$3 = input;
var sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
var pathAvailable = Boolean(dirname && resolve && relative && sep);
var MapGenerator$2 = class MapGenerator {
  constructor(stringify2, root2, opts, cssString) {
    this.stringify = stringify2;
    this.mapOpts = opts.map || {};
    this.root = root2;
    this.opts = opts;
    this.css = cssString;
    this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
  }
  isMap() {
    if (typeof this.opts.map !== "undefined") {
      return !!this.opts.map;
    }
    return this.previous().length > 0;
  }
  previous() {
    if (!this.previousMaps) {
      this.previousMaps = [];
      if (this.root) {
        this.root.walk((node2) => {
          if (node2.source && node2.source.input.map) {
            var map = node2.source.input.map;
            if (!this.previousMaps.includes(map)) {
              this.previousMaps.push(map);
            }
          }
        });
      } else {
        var input2 = new Input$3(this.css, this.opts);
        if (input2.map)
          this.previousMaps.push(input2.map);
      }
    }
    return this.previousMaps;
  }
  isInline() {
    if (typeof this.mapOpts.inline !== "undefined") {
      return this.mapOpts.inline;
    }
    var annotation = this.mapOpts.annotation;
    if (typeof annotation !== "undefined" && annotation !== true) {
      return false;
    }
    if (this.previous().length) {
      return this.previous().some((i) => i.inline);
    }
    return true;
  }
  isSourcesContent() {
    if (typeof this.mapOpts.sourcesContent !== "undefined") {
      return this.mapOpts.sourcesContent;
    }
    if (this.previous().length) {
      return this.previous().some((i) => i.withContent());
    }
    return true;
  }
  clearAnnotation() {
    if (this.mapOpts.annotation === false)
      return;
    if (this.root) {
      var node2;
      for (let i = this.root.nodes.length - 1; i >= 0; i--) {
        node2 = this.root.nodes[i];
        if (node2.type !== "comment")
          continue;
        if (node2.text.indexOf("# sourceMappingURL=") === 0) {
          this.root.removeChild(i);
        }
      }
    } else if (this.css) {
      this.css = this.css.replace(/(\n)?\/\*#[\S\s]*?\*\/$/gm, "");
    }
  }
  setSourcesContent() {
    var already = {};
    if (this.root) {
      this.root.walk((node2) => {
        if (node2.source) {
          var from2 = node2.source.input.from;
          if (from2 && !already[from2]) {
            already[from2] = true;
            var fromUrl = this.usesFileUrls ? this.toFileUrl(from2) : this.toUrl(this.path(from2));
            this.map.setSourceContent(fromUrl, node2.source.input.css);
          }
        }
      });
    } else if (this.css) {
      var from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
      this.map.setSourceContent(from, this.css);
    }
  }
  applyPrevMaps() {
    for (let prev of this.previous()) {
      var from = this.toUrl(this.path(prev.file));
      var root2 = prev.root || dirname(prev.file);
      var map;
      if (this.mapOpts.sourcesContent === false) {
        map = new SourceMapConsumer(prev.text);
        if (map.sourcesContent) {
          map.sourcesContent = map.sourcesContent.map(() => null);
        }
      } else {
        map = prev.consumer();
      }
      this.map.applySourceMap(map, from, this.toUrl(this.path(root2)));
    }
  }
  isAnnotation() {
    if (this.isInline()) {
      return true;
    }
    if (typeof this.mapOpts.annotation !== "undefined") {
      return this.mapOpts.annotation;
    }
    if (this.previous().length) {
      return this.previous().some((i) => i.annotation);
    }
    return true;
  }
  toBase64(str) {
    if (Buffer) {
      return Buffer.from(str).toString("base64");
    } else {
      return window.btoa(unescape(encodeURIComponent(str)));
    }
  }
  addAnnotation() {
    var content;
    if (this.isInline()) {
      content = "data:application/json;base64," + this.toBase64(this.map.toString());
    } else if (typeof this.mapOpts.annotation === "string") {
      content = this.mapOpts.annotation;
    } else if (typeof this.mapOpts.annotation === "function") {
      content = this.mapOpts.annotation(this.opts.to, this.root);
    } else {
      content = this.outputFile() + ".map";
    }
    var eol = "\n";
    if (this.css.includes("\r\n"))
      eol = "\r\n";
    this.css += eol + "/*# sourceMappingURL=" + content + " */";
  }
  outputFile() {
    if (this.opts.to) {
      return this.path(this.opts.to);
    } else if (this.opts.from) {
      return this.path(this.opts.from);
    } else {
      return "to.css";
    }
  }
  generateMap() {
    if (this.root) {
      this.generateString();
    } else if (this.previous().length === 1) {
      var prev = this.previous()[0].consumer();
      prev.file = this.outputFile();
      this.map = SourceMapGenerator.fromSourceMap(prev);
    } else {
      this.map = new SourceMapGenerator({
        file: this.outputFile()
      });
      this.map.addMapping({
        source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>",
        generated: {
          line: 1,
          column: 0
        },
        original: {
          line: 1,
          column: 0
        }
      });
    }
    if (this.isSourcesContent())
      this.setSourcesContent();
    if (this.root && this.previous().length > 0)
      this.applyPrevMaps();
    if (this.isAnnotation())
      this.addAnnotation();
    if (this.isInline()) {
      return [this.css];
    } else {
      return [this.css, this.map];
    }
  }
  path(file) {
    if (file.indexOf("<") === 0)
      return file;
    if (/^\w+:\/\//.test(file))
      return file;
    if (this.mapOpts.absolute)
      return file;
    var from = this.opts.to ? dirname(this.opts.to) : ".";
    if (typeof this.mapOpts.annotation === "string") {
      from = dirname(resolve(from, this.mapOpts.annotation));
    }
    file = relative(from, file);
    return file;
  }
  toUrl(path) {
    if (sep === "\\") {
      path = path.replace(/\\/g, "/");
    }
    return encodeURI(path).replace(/[#?]/g, encodeURIComponent);
  }
  toFileUrl(path) {
    if (pathToFileURL) {
      return pathToFileURL(path).toString();
    } else {
      throw new Error("`map.absolute` option is not available in this PostCSS build");
    }
  }
  sourcePath(node2) {
    if (this.mapOpts.from) {
      return this.toUrl(this.mapOpts.from);
    } else if (this.usesFileUrls) {
      return this.toFileUrl(node2.source.input.from);
    } else {
      return this.toUrl(this.path(node2.source.input.from));
    }
  }
  generateString() {
    this.css = "";
    this.map = new SourceMapGenerator({
      file: this.outputFile()
    });
    var line = 1;
    var column = 1;
    var noSource = "<no source>";
    var mapping = {
      source: "",
      generated: {
        line: 0,
        column: 0
      },
      original: {
        line: 0,
        column: 0
      }
    };
    var lines, last;
    this.stringify(this.root, (str, node2, type) => {
      this.css += str;
      if (node2 && type !== "end") {
        mapping.generated.line = line;
        mapping.generated.column = column - 1;
        if (node2.source && node2.source.start) {
          mapping.source = this.sourcePath(node2);
          mapping.original.line = node2.source.start.line;
          mapping.original.column = node2.source.start.column - 1;
          this.map.addMapping(mapping);
        } else {
          mapping.source = noSource;
          mapping.original.line = 1;
          mapping.original.column = 0;
          this.map.addMapping(mapping);
        }
      }
      lines = str.match(/\n/g);
      if (lines) {
        line += lines.length;
        last = str.lastIndexOf("\n");
        column = str.length - last;
      } else {
        column += str.length;
      }
      if (node2 && type !== "start") {
        var p = node2.parent || {
          raws: {}
        };
        var childless = node2.type === "decl" || node2.type === "atrule" && !node2.nodes;
        if (!childless || node2 !== p.last || p.raws.semicolon) {
          if (node2.source && node2.source.end) {
            mapping.source = this.sourcePath(node2);
            mapping.original.line = node2.source.end.line;
            mapping.original.column = node2.source.end.column - 1;
            mapping.generated.line = line;
            mapping.generated.column = column - 2;
            this.map.addMapping(mapping);
          } else {
            mapping.source = noSource;
            mapping.original.line = 1;
            mapping.original.column = 0;
            mapping.generated.line = line;
            mapping.generated.column = column - 1;
            this.map.addMapping(mapping);
          }
        }
      }
    });
  }
  generate() {
    this.clearAnnotation();
    if (pathAvailable && sourceMapAvailable && this.isMap()) {
      return this.generateMap();
    } else {
      var result2 = "";
      this.stringify(this.root, (i) => {
        result2 += i;
      });
      return [result2];
    }
  }
};
var mapGenerator = MapGenerator$2;
var Node$2 = node;
var Comment$4 = class Comment extends Node$2 {
  constructor(defaults) {
    super(defaults);
    this.type = "comment";
  }
};
var comment = Comment$4;
Comment$4.default = Comment$4;
var {
  isClean: isClean$1,
  my: my$1
} = symbols;
var Declaration$3 = declaration;
var Comment$3 = comment;
var Node$1 = node;
var parse$4, Rule$4, AtRule$4, Root$6;
function cleanSource(nodes) {
  return nodes.map((i) => {
    if (i.nodes)
      i.nodes = cleanSource(i.nodes);
    delete i.source;
    return i;
  });
}
function markDirtyUp(node2) {
  node2[isClean$1] = false;
  if (node2.proxyOf.nodes) {
    for (let i of node2.proxyOf.nodes) {
      markDirtyUp(i);
    }
  }
}
Container$7 = class Container extends Node$1 {
  push(child) {
    child.parent = this;
    this.proxyOf.nodes.push(child);
    return this;
  }
  each(callback) {
    if (!this.proxyOf.nodes)
      return void 0;
    var iterator = this.getIterator();
    var index, result2;
    while (this.indexes[iterator] < this.proxyOf.nodes.length) {
      index = this.indexes[iterator];
      result2 = callback(this.proxyOf.nodes[index], index);
      if (result2 === false)
        break;
      this.indexes[iterator] += 1;
    }
    delete this.indexes[iterator];
    return result2;
  }
  walk(callback) {
    return this.each((child, i) => {
      var result2;
      try {
        result2 = callback(child, i);
      } catch (e) {
        throw child.addToError(e);
      }
      if (result2 !== false && child.walk) {
        result2 = child.walk(callback);
      }
      return result2;
    });
  }
  walkDecls(prop, callback) {
    if (!callback) {
      callback = prop;
      return this.walk((child, i) => {
        if (child.type === "decl") {
          return callback(child, i);
        }
      });
    }
    if (prop instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === "decl" && prop.test(child.prop)) {
          return callback(child, i);
        }
      });
    }
    return this.walk((child, i) => {
      if (child.type === "decl" && child.prop === prop) {
        return callback(child, i);
      }
    });
  }
  walkRules(selector, callback) {
    if (!callback) {
      callback = selector;
      return this.walk((child, i) => {
        if (child.type === "rule") {
          return callback(child, i);
        }
      });
    }
    if (selector instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === "rule" && selector.test(child.selector)) {
          return callback(child, i);
        }
      });
    }
    return this.walk((child, i) => {
      if (child.type === "rule" && child.selector === selector) {
        return callback(child, i);
      }
    });
  }
  walkAtRules(name, callback) {
    if (!callback) {
      callback = name;
      return this.walk((child, i) => {
        if (child.type === "atrule") {
          return callback(child, i);
        }
      });
    }
    if (name instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === "atrule" && name.test(child.name)) {
          return callback(child, i);
        }
      });
    }
    return this.walk((child, i) => {
      if (child.type === "atrule" && child.name === name) {
        return callback(child, i);
      }
    });
  }
  walkComments(callback) {
    return this.walk((child, i) => {
      if (child.type === "comment") {
        return callback(child, i);
      }
    });
  }
  append(...children) {
    for (let child of children) {
      var nodes = this.normalize(child, this.last);
      for (let node2 of nodes)
        this.proxyOf.nodes.push(node2);
    }
    this.markDirty();
    return this;
  }
  prepend(...children) {
    children = children.reverse();
    for (let child of children) {
      var nodes = this.normalize(child, this.first, "prepend").reverse();
      for (let node2 of nodes)
        this.proxyOf.nodes.unshift(node2);
      for (let id in this.indexes) {
        this.indexes[id] = this.indexes[id] + nodes.length;
      }
    }
    this.markDirty();
    return this;
  }
  cleanRaws(keepBetween) {
    super.cleanRaws(keepBetween);
    if (this.nodes) {
      for (let node2 of this.nodes)
        node2.cleanRaws(keepBetween);
    }
  }
  insertBefore(exist, add) {
    var existIndex = this.index(exist);
    var type = existIndex === 0 ? "prepend" : false;
    var nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
    existIndex = this.index(exist);
    for (let node2 of nodes)
      this.proxyOf.nodes.splice(existIndex, 0, node2);
    var index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (existIndex <= index) {
        this.indexes[id] = index + nodes.length;
      }
    }
    this.markDirty();
    return this;
  }
  insertAfter(exist, add) {
    var existIndex = this.index(exist);
    var nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
    existIndex = this.index(exist);
    for (let node2 of nodes)
      this.proxyOf.nodes.splice(existIndex + 1, 0, node2);
    var index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (existIndex < index) {
        this.indexes[id] = index + nodes.length;
      }
    }
    this.markDirty();
    return this;
  }
  removeChild(child) {
    child = this.index(child);
    this.proxyOf.nodes[child].parent = void 0;
    this.proxyOf.nodes.splice(child, 1);
    var index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (index >= child) {
        this.indexes[id] = index - 1;
      }
    }
    this.markDirty();
    return this;
  }
  removeAll() {
    for (let node2 of this.proxyOf.nodes)
      node2.parent = void 0;
    this.proxyOf.nodes = [];
    this.markDirty();
    return this;
  }
  replaceValues(pattern, opts, callback) {
    if (!callback) {
      callback = opts;
      opts = {};
    }
    this.walkDecls((decl) => {
      if (opts.props && !opts.props.includes(decl.prop))
        return;
      if (opts.fast && !decl.value.includes(opts.fast))
        return;
      decl.value = decl.value.replace(pattern, callback);
    });
    this.markDirty();
    return this;
  }
  every(condition) {
    return this.nodes.every(condition);
  }
  some(condition) {
    return this.nodes.some(condition);
  }
  index(child) {
    if (typeof child === "number")
      return child;
    if (child.proxyOf)
      child = child.proxyOf;
    return this.proxyOf.nodes.indexOf(child);
  }
  get first() {
    if (!this.proxyOf.nodes)
      return void 0;
    return this.proxyOf.nodes[0];
  }
  get last() {
    if (!this.proxyOf.nodes)
      return void 0;
    return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
  }
  normalize(nodes, sample) {
    if (typeof nodes === "string") {
      nodes = cleanSource(parse$4(nodes).nodes);
    } else if (Array.isArray(nodes)) {
      nodes = nodes.slice(0);
      for (let i of nodes) {
        if (i.parent)
          i.parent.removeChild(i, "ignore");
      }
    } else if (nodes.type === "root" && this.type !== "document") {
      nodes = nodes.nodes.slice(0);
      for (let i of nodes) {
        if (i.parent)
          i.parent.removeChild(i, "ignore");
      }
    } else if (nodes.type) {
      nodes = [nodes];
    } else if (nodes.prop) {
      if (typeof nodes.value === "undefined") {
        throw new Error("Value field is missed in node creation");
      } else if (typeof nodes.value !== "string") {
        nodes.value = String(nodes.value);
      }
      nodes = [new Declaration$3(nodes)];
    } else if (nodes.selector) {
      nodes = [new Rule$4(nodes)];
    } else if (nodes.name) {
      nodes = [new AtRule$4(nodes)];
    } else if (nodes.text) {
      nodes = [new Comment$3(nodes)];
    } else {
      throw new Error("Unknown node type in node creation");
    }
    var processed = nodes.map((i) => {
      if (!i[my$1])
        Container.rebuild(i);
      i = i.proxyOf;
      if (i.parent)
        i.parent.removeChild(i);
      if (i[isClean$1])
        markDirtyUp(i);
      if (typeof i.raws.before === "undefined") {
        if (sample && typeof sample.raws.before !== "undefined") {
          i.raws.before = sample.raws.before.replace(/\S/g, "");
        }
      }
      i.parent = this.proxyOf;
      return i;
    });
    return processed;
  }
  getProxyProcessor() {
    return {
      set(node2, prop, value) {
        if (node2[prop] === value)
          return true;
        node2[prop] = value;
        if (prop === "name" || prop === "params" || prop === "selector") {
          node2.markDirty();
        }
        return true;
      },
      get(node2, prop) {
        if (prop === "proxyOf") {
          return node2;
        } else if (!node2[prop]) {
          return node2[prop];
        } else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) {
          return (...args) => {
            return node2[prop](...args.map((i) => {
              if (typeof i === "function") {
                return (child, index) => i(child.toProxy(), index);
              } else {
                return i;
              }
            }));
          };
        } else if (prop === "every" || prop === "some") {
          return (cb) => {
            return node2[prop]((child, ...other) => cb(child.toProxy(), ...other));
          };
        } else if (prop === "root") {
          return () => node2.root().toProxy();
        } else if (prop === "nodes") {
          return node2.nodes.map((i) => i.toProxy());
        } else if (prop === "first" || prop === "last") {
          return node2[prop].toProxy();
        } else {
          return node2[prop];
        }
      }
    };
  }
  getIterator() {
    if (!this.lastEach)
      this.lastEach = 0;
    if (!this.indexes)
      this.indexes = {};
    this.lastEach += 1;
    var iterator = this.lastEach;
    this.indexes[iterator] = 0;
    return iterator;
  }
};
Container$7.registerParse = (dependant) => {
  parse$4 = dependant;
};
Container$7.registerRule = (dependant) => {
  Rule$4 = dependant;
};
Container$7.registerAtRule = (dependant) => {
  AtRule$4 = dependant;
};
Container$7.registerRoot = (dependant) => {
  Root$6 = dependant;
};
var container = Container$7;
Container$7.default = Container$7;
Container$7.rebuild = (node2) => {
  if (node2.type === "atrule") {
    Object.setPrototypeOf(node2, AtRule$4.prototype);
  } else if (node2.type === "rule") {
    Object.setPrototypeOf(node2, Rule$4.prototype);
  } else if (node2.type === "decl") {
    Object.setPrototypeOf(node2, Declaration$3.prototype);
  } else if (node2.type === "comment") {
    Object.setPrototypeOf(node2, Comment$3.prototype);
  } else if (node2.type === "root") {
    Object.setPrototypeOf(node2, Root$6.prototype);
  }
  node2[my$1] = true;
  if (node2.nodes) {
    node2.nodes.forEach((child) => {
      Container$7.rebuild(child);
    });
  }
};
var Container$6 = container;
var LazyResult$4, Processor$3;
var Document$3 = class Document extends Container$6 {
  constructor(defaults) {
    super({
      type: "document",
      ...defaults
    });
    if (!this.nodes) {
      this.nodes = [];
    }
  }
  toResult(opts = {}) {
    var lazy = new LazyResult$4(new Processor$3(), this, opts);
    return lazy.stringify();
  }
};
Document$3.registerLazyResult = (dependant) => {
  LazyResult$4 = dependant;
};
Document$3.registerProcessor = (dependant) => {
  Processor$3 = dependant;
};
var document$1 = Document$3;
Document$3.default = Document$3;
var Warning$2 = class Warning {
  constructor(text, opts = {}) {
    this.type = "warning";
    this.text = text;
    if (opts.node && opts.node.source) {
      var range = opts.node.rangeBy(opts);
      this.line = range.start.line;
      this.column = range.start.column;
      this.endLine = range.end.line;
      this.endColumn = range.end.column;
    }
    for (let opt in opts)
      this[opt] = opts[opt];
  }
  toString() {
    if (this.node) {
      return this.node.error(this.text, {
        plugin: this.plugin,
        index: this.index,
        word: this.word
      }).message;
    }
    if (this.plugin) {
      return this.plugin + ": " + this.text;
    }
    return this.text;
  }
};
var warning = Warning$2;
Warning$2.default = Warning$2;
var Warning$1 = warning;
var Result$3 = class Result {
  constructor(processor2, root2, opts) {
    this.processor = processor2;
    this.messages = [];
    this.root = root2;
    this.opts = opts;
    this.css = void 0;
    this.map = void 0;
  }
  toString() {
    return this.css;
  }
  warn(text, opts = {}) {
    if (!opts.plugin) {
      if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
        opts.plugin = this.lastPlugin.postcssPlugin;
      }
    }
    var warning2 = new Warning$1(text, opts);
    this.messages.push(warning2);
    return warning2;
  }
  warnings() {
    return this.messages.filter((i) => i.type === "warning");
  }
  get content() {
    return this.css;
  }
};
var result = Result$3;
Result$3.default = Result$3;
var SINGLE_QUOTE = "'".charCodeAt(0);
var DOUBLE_QUOTE = '"'.charCodeAt(0);
var BACKSLASH = "\\".charCodeAt(0);
var SLASH = "/".charCodeAt(0);
var NEWLINE = "\n".charCodeAt(0);
var SPACE = " ".charCodeAt(0);
var FEED = "\f".charCodeAt(0);
var TAB = "	".charCodeAt(0);
var CR = "\r".charCodeAt(0);
var OPEN_SQUARE = "[".charCodeAt(0);
var CLOSE_SQUARE = "]".charCodeAt(0);
var OPEN_PARENTHESES = "(".charCodeAt(0);
var CLOSE_PARENTHESES = ")".charCodeAt(0);
var OPEN_CURLY = "{".charCodeAt(0);
var CLOSE_CURLY = "}".charCodeAt(0);
var SEMICOLON = ";".charCodeAt(0);
var ASTERISK = "*".charCodeAt(0);
var COLON = ":".charCodeAt(0);
var AT = "@".charCodeAt(0);
var RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
var RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
var RE_BAD_BRACKET = /.[\n"'(/\\]/;
var RE_HEX_ESCAPE = /[\da-f]/i;
var tokenize = function tokenizer(input2, options = {}) {
  var css = input2.css.valueOf();
  var ignore = options.ignoreErrors;
  var code, next, quote, content, escape;
  var escaped, escapePos, prev, n, currentToken;
  var length = css.length;
  var pos = 0;
  var buffer = [];
  var returned = [];
  function position() {
    return pos;
  }
  function unclosed(what) {
    throw input2.error("Unclosed " + what, pos);
  }
  function endOfFile() {
    return returned.length === 0 && pos >= length;
  }
  function nextToken(opts) {
    if (returned.length)
      return returned.pop();
    if (pos >= length)
      return;
    var ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
    code = css.charCodeAt(pos);
    switch (code) {
      case NEWLINE:
      case SPACE:
      case TAB:
      case CR:
      case FEED: {
        next = pos;
        do {
          next += 1;
          code = css.charCodeAt(next);
        } while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);
        currentToken = ["space", css.slice(pos, next)];
        pos = next - 1;
        break;
      }
      case OPEN_SQUARE:
      case CLOSE_SQUARE:
      case OPEN_CURLY:
      case CLOSE_CURLY:
      case COLON:
      case SEMICOLON:
      case CLOSE_PARENTHESES: {
        var controlChar = String.fromCharCode(code);
        currentToken = [controlChar, controlChar, pos];
        break;
      }
      case OPEN_PARENTHESES: {
        prev = buffer.length ? buffer.pop()[1] : "";
        n = css.charCodeAt(pos + 1);
        if (prev === "url" && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE && n !== SPACE && n !== NEWLINE && n !== TAB && n !== FEED && n !== CR) {
          next = pos;
          do {
            escaped = false;
            next = css.indexOf(")", next + 1);
            if (next === -1) {
              if (ignore || ignoreUnclosed) {
                next = pos;
                break;
              } else {
                unclosed("bracket");
              }
            }
            escapePos = next;
            while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
              escapePos -= 1;
              escaped = !escaped;
            }
          } while (escaped);
          currentToken = ["brackets", css.slice(pos, next + 1), pos, next];
          pos = next;
        } else {
          next = css.indexOf(")", pos + 1);
          content = css.slice(pos, next + 1);
          if (next === -1 || RE_BAD_BRACKET.test(content)) {
            currentToken = ["(", "(", pos];
          } else {
            currentToken = ["brackets", content, pos, next];
            pos = next;
          }
        }
        break;
      }
      case SINGLE_QUOTE:
      case DOUBLE_QUOTE: {
        quote = code === SINGLE_QUOTE ? "'" : '"';
        next = pos;
        do {
          escaped = false;
          next = css.indexOf(quote, next + 1);
          if (next === -1) {
            if (ignore || ignoreUnclosed) {
              next = pos + 1;
              break;
            } else {
              unclosed("string");
            }
          }
          escapePos = next;
          while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
            escapePos -= 1;
            escaped = !escaped;
          }
        } while (escaped);
        currentToken = ["string", css.slice(pos, next + 1), pos, next];
        pos = next;
        break;
      }
      case AT: {
        RE_AT_END.lastIndex = pos + 1;
        RE_AT_END.test(css);
        if (RE_AT_END.lastIndex === 0) {
          next = css.length - 1;
        } else {
          next = RE_AT_END.lastIndex - 2;
        }
        currentToken = ["at-word", css.slice(pos, next + 1), pos, next];
        pos = next;
        break;
      }
      case BACKSLASH: {
        next = pos;
        escape = true;
        while (css.charCodeAt(next + 1) === BACKSLASH) {
          next += 1;
          escape = !escape;
        }
        code = css.charCodeAt(next + 1);
        if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
          next += 1;
          if (RE_HEX_ESCAPE.test(css.charAt(next))) {
            while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
              next += 1;
            }
            if (css.charCodeAt(next + 1) === SPACE) {
              next += 1;
            }
          }
        }
        currentToken = ["word", css.slice(pos, next + 1), pos, next];
        pos = next;
        break;
      }
      default: {
        if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
          next = css.indexOf("*/", pos + 2) + 1;
          if (next === 0) {
            if (ignore || ignoreUnclosed) {
              next = css.length;
            } else {
              unclosed("comment");
            }
          }
          currentToken = ["comment", css.slice(pos, next + 1), pos, next];
          pos = next;
        } else {
          RE_WORD_END.lastIndex = pos + 1;
          RE_WORD_END.test(css);
          if (RE_WORD_END.lastIndex === 0) {
            next = css.length - 1;
          } else {
            next = RE_WORD_END.lastIndex - 2;
          }
          currentToken = ["word", css.slice(pos, next + 1), pos, next];
          buffer.push(currentToken);
          pos = next;
        }
        break;
      }
    }
    pos++;
    return currentToken;
  }
  function back(token) {
    returned.push(token);
  }
  return {
    back,
    nextToken,
    endOfFile,
    position
  };
};
var Container$5 = container;
var AtRule$3 = class AtRule extends Container$5 {
  constructor(defaults) {
    super(defaults);
    this.type = "atrule";
  }
  append(...children) {
    if (!this.proxyOf.nodes)
      this.nodes = [];
    return super.append(...children);
  }
  prepend(...children) {
    if (!this.proxyOf.nodes)
      this.nodes = [];
    return super.prepend(...children);
  }
};
var atRule = AtRule$3;
AtRule$3.default = AtRule$3;
Container$5.registerAtRule(AtRule$3);
var Container$4 = container;
var LazyResult$3, Processor$2;
var Root$5 = class Root extends Container$4 {
  constructor(defaults) {
    super(defaults);
    this.type = "root";
    if (!this.nodes)
      this.nodes = [];
  }
  removeChild(child, ignore) {
    var index = this.index(child);
    if (!ignore && index === 0 && this.nodes.length > 1) {
      this.nodes[1].raws.before = this.nodes[index].raws.before;
    }
    return super.removeChild(child);
  }
  normalize(child, sample, type) {
    var nodes = super.normalize(child);
    if (sample) {
      if (type === "prepend") {
        if (this.nodes.length > 1) {
          sample.raws.before = this.nodes[1].raws.before;
        } else {
          delete sample.raws.before;
        }
      } else if (this.first !== sample) {
        for (let node2 of nodes) {
          node2.raws.before = sample.raws.before;
        }
      }
    }
    return nodes;
  }
  toResult(opts = {}) {
    var lazy = new LazyResult$3(new Processor$2(), this, opts);
    return lazy.stringify();
  }
};
Root$5.registerLazyResult = (dependant) => {
  LazyResult$3 = dependant;
};
Root$5.registerProcessor = (dependant) => {
  Processor$2 = dependant;
};
var root = Root$5;
Root$5.default = Root$5;
Container$4.registerRoot(Root$5);
var list$2 = {
  split(string, separators, last) {
    var array = [];
    var current = "";
    var split = false;
    var func = 0;
    var inQuote = false;
    var prevQuote = "";
    var escape = false;
    for (let letter of string) {
      if (escape) {
        escape = false;
      } else if (letter === "\\") {
        escape = true;
      } else if (inQuote) {
        if (letter === prevQuote) {
          inQuote = false;
        }
      } else if (letter === '"' || letter === "'") {
        inQuote = true;
        prevQuote = letter;
      } else if (letter === "(") {
        func += 1;
      } else if (letter === ")") {
        if (func > 0)
          func -= 1;
      } else if (func === 0) {
        if (separators.includes(letter))
          split = true;
      }
      if (split) {
        if (current !== "")
          array.push(current.trim());
        current = "";
        split = false;
      } else {
        current += letter;
      }
    }
    if (last || current !== "")
      array.push(current.trim());
    return array;
  },
  space(string) {
    var spaces = [" ", "\n", "	"];
    return list$2.split(string, spaces);
  },
  comma(string) {
    return list$2.split(string, [","], true);
  }
};
var list_1 = list$2;
list$2.default = list$2;
var Container$3 = container;
var list$1 = list_1;
Rule$3 = class Rule extends Container$3 {
  constructor(defaults) {
    super(defaults);
    this.type = "rule";
    if (!this.nodes)
      this.nodes = [];
  }
  get selectors() {
    return list$1.comma(this.selector);
  }
  set selectors(values) {
    var match = this.selector ? this.selector.match(/,\s*/) : null;
    var sep2 = match ? match[0] : "," + this.raw("between", "beforeOpen");
    this.selector = values.join(sep2);
  }
};
var rule = Rule$3;
Rule$3.default = Rule$3;
Container$3.registerRule(Rule$3);
var Declaration$2 = declaration;
var tokenizer2 = tokenize;
var Comment$2 = comment;
var AtRule$2 = atRule;
var Root$4 = root;
var Rule$2 = rule;
var SAFE_COMMENT_NEIGHBOR = {
  empty: true,
  space: true
};
function findLastWithPosition(tokens) {
  for (let i = tokens.length - 1; i >= 0; i--) {
    var token = tokens[i];
    var pos = token[3] || token[2];
    if (pos)
      return pos;
  }
}
var Parser$1 = class Parser {
  constructor(input2) {
    this.input = input2;
    this.root = new Root$4();
    this.current = this.root;
    this.spaces = "";
    this.semicolon = false;
    this.customProperty = false;
    this.createTokenizer();
    this.root.source = {
      input: input2,
      start: {
        offset: 0,
        line: 1,
        column: 1
      }
    };
  }
  createTokenizer() {
    this.tokenizer = tokenizer2(this.input);
  }
  parse() {
    var token;
    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken();
      switch (token[0]) {
        case "space":
          this.spaces += token[1];
          break;
        case ";":
          this.freeSemicolon(token);
          break;
        case "}":
          this.end(token);
          break;
        case "comment":
          this.comment(token);
          break;
        case "at-word":
          this.atrule(token);
          break;
        case "{":
          this.emptyRule(token);
          break;
        default:
          this.other(token);
          break;
      }
    }
    this.endFile();
  }
  comment(token) {
    var node2 = new Comment$2();
    this.init(node2, token[2]);
    node2.source.end = this.getPosition(token[3] || token[2]);
    var text = token[1].slice(2, -2);
    if (/^\s*$/.test(text)) {
      node2.text = "";
      node2.raws.left = text;
      node2.raws.right = "";
    } else {
      var match = text.match(/^(\s*)([^]*\S)(\s*)$/);
      node2.text = match[2];
      node2.raws.left = match[1];
      node2.raws.right = match[3];
    }
  }
  emptyRule(token) {
    var node2 = new Rule$2();
    this.init(node2, token[2]);
    node2.selector = "";
    node2.raws.between = "";
    this.current = node2;
  }
  other(start) {
    var end = false;
    var type = null;
    var colon = false;
    var bracket = null;
    var brackets = [];
    var customProperty = start[1].startsWith("--");
    var tokens = [];
    var token = start;
    while (token) {
      type = token[0];
      tokens.push(token);
      if (type === "(" || type === "[") {
        if (!bracket)
          bracket = token;
        brackets.push(type === "(" ? ")" : "]");
      } else if (customProperty && colon && type === "{") {
        if (!bracket)
          bracket = token;
        brackets.push("}");
      } else if (brackets.length === 0) {
        if (type === ";") {
          if (colon) {
            this.decl(tokens, customProperty);
            return;
          } else {
            break;
          }
        } else if (type === "{") {
          this.rule(tokens);
          return;
        } else if (type === "}") {
          this.tokenizer.back(tokens.pop());
          end = true;
          break;
        } else if (type === ":") {
          colon = true;
        }
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop();
        if (brackets.length === 0)
          bracket = null;
      }
      token = this.tokenizer.nextToken();
    }
    if (this.tokenizer.endOfFile())
      end = true;
    if (brackets.length > 0)
      this.unclosedBracket(bracket);
    if (end && colon) {
      if (!customProperty) {
        while (tokens.length) {
          token = tokens[tokens.length - 1][0];
          if (token !== "space" && token !== "comment")
            break;
          this.tokenizer.back(tokens.pop());
        }
      }
      this.decl(tokens, customProperty);
    } else {
      this.unknownWord(tokens);
    }
  }
  rule(tokens) {
    tokens.pop();
    var node2 = new Rule$2();
    this.init(node2, tokens[0][2]);
    node2.raws.between = this.spacesAndCommentsFromEnd(tokens);
    this.raw(node2, "selector", tokens);
    this.current = node2;
  }
  decl(tokens, customProperty) {
    var node2 = new Declaration$2();
    this.init(node2, tokens[0][2]);
    var last = tokens[tokens.length - 1];
    if (last[0] === ";") {
      this.semicolon = true;
      tokens.pop();
    }
    node2.source.end = this.getPosition(last[3] || last[2] || findLastWithPosition(tokens));
    while (tokens[0][0] !== "word") {
      if (tokens.length === 1)
        this.unknownWord(tokens);
      node2.raws.before += tokens.shift()[1];
    }
    node2.source.start = this.getPosition(tokens[0][2]);
    node2.prop = "";
    while (tokens.length) {
      var type = tokens[0][0];
      if (type === ":" || type === "space" || type === "comment") {
        break;
      }
      node2.prop += tokens.shift()[1];
    }
    node2.raws.between = "";
    var token;
    while (tokens.length) {
      token = tokens.shift();
      if (token[0] === ":") {
        node2.raws.between += token[1];
        break;
      } else {
        if (token[0] === "word" && /\w/.test(token[1])) {
          this.unknownWord([token]);
        }
        node2.raws.between += token[1];
      }
    }
    if (node2.prop[0] === "_" || node2.prop[0] === "*") {
      node2.raws.before += node2.prop[0];
      node2.prop = node2.prop.slice(1);
    }
    var firstSpaces = [];
    var next;
    while (tokens.length) {
      next = tokens[0][0];
      if (next !== "space" && next !== "comment")
        break;
      firstSpaces.push(tokens.shift());
    }
    this.precheckMissedSemicolon(tokens);
    for (let i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];
      if (token[1].toLowerCase() === "!important") {
        node2.important = true;
        var string = this.stringFrom(tokens, i);
        string = this.spacesFromEnd(tokens) + string;
        if (string !== " !important")
          node2.raws.important = string;
        break;
      } else if (token[1].toLowerCase() === "important") {
        var cache = tokens.slice(0);
        var str = "";
        for (let j = i; j > 0; j--) {
          var type = cache[j][0];
          if (str.trim().indexOf("!") === 0 && type !== "space") {
            break;
          }
          str = cache.pop()[1] + str;
        }
        if (str.trim().indexOf("!") === 0) {
          node2.important = true;
          node2.raws.important = str;
          tokens = cache;
        }
      }
      if (token[0] !== "space" && token[0] !== "comment") {
        break;
      }
    }
    var hasWord = tokens.some((i) => i[0] !== "space" && i[0] !== "comment");
    if (hasWord) {
      node2.raws.between += firstSpaces.map((i) => i[1]).join("");
      firstSpaces = [];
    }
    this.raw(node2, "value", firstSpaces.concat(tokens), customProperty);
    if (node2.value.includes(":") && !customProperty) {
      this.checkMissedSemicolon(tokens);
    }
  }
  atrule(token) {
    var node2 = new AtRule$2();
    node2.name = token[1].slice(1);
    if (node2.name === "") {
      this.unnamedAtrule(node2, token);
    }
    this.init(node2, token[2]);
    var type;
    var prev;
    var shift;
    var last = false;
    var open = false;
    var params = [];
    var brackets = [];
    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken();
      type = token[0];
      if (type === "(" || type === "[") {
        brackets.push(type === "(" ? ")" : "]");
      } else if (type === "{" && brackets.length > 0) {
        brackets.push("}");
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop();
      }
      if (brackets.length === 0) {
        if (type === ";") {
          node2.source.end = this.getPosition(token[2]);
          this.semicolon = true;
          break;
        } else if (type === "{") {
          open = true;
          break;
        } else if (type === "}") {
          if (params.length > 0) {
            shift = params.length - 1;
            prev = params[shift];
            while (prev && prev[0] === "space") {
              prev = params[--shift];
            }
            if (prev) {
              node2.source.end = this.getPosition(prev[3] || prev[2]);
            }
          }
          this.end(token);
          break;
        } else {
          params.push(token);
        }
      } else {
        params.push(token);
      }
      if (this.tokenizer.endOfFile()) {
        last = true;
        break;
      }
    }
    node2.raws.between = this.spacesAndCommentsFromEnd(params);
    if (params.length) {
      node2.raws.afterName = this.spacesAndCommentsFromStart(params);
      this.raw(node2, "params", params);
      if (last) {
        token = params[params.length - 1];
        node2.source.end = this.getPosition(token[3] || token[2]);
        this.spaces = node2.raws.between;
        node2.raws.between = "";
      }
    } else {
      node2.raws.afterName = "";
      node2.params = "";
    }
    if (open) {
      node2.nodes = [];
      this.current = node2;
    }
  }
  end(token) {
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon;
    }
    this.semicolon = false;
    this.current.raws.after = (this.current.raws.after || "") + this.spaces;
    this.spaces = "";
    if (this.current.parent) {
      this.current.source.end = this.getPosition(token[2]);
      this.current = this.current.parent;
    } else {
      this.unexpectedClose(token);
    }
  }
  endFile() {
    if (this.current.parent)
      this.unclosedBlock();
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon;
    }
    this.current.raws.after = (this.current.raws.after || "") + this.spaces;
  }
  freeSemicolon(token) {
    this.spaces += token[1];
    if (this.current.nodes) {
      var prev = this.current.nodes[this.current.nodes.length - 1];
      if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
        prev.raws.ownSemicolon = this.spaces;
        this.spaces = "";
      }
    }
  }
  // Helpers
  getPosition(offset) {
    var pos = this.input.fromOffset(offset);
    return {
      offset,
      line: pos.line,
      column: pos.col
    };
  }
  init(node2, offset) {
    this.current.push(node2);
    node2.source = {
      start: this.getPosition(offset),
      input: this.input
    };
    node2.raws.before = this.spaces;
    this.spaces = "";
    if (node2.type !== "comment")
      this.semicolon = false;
  }
  raw(node2, prop, tokens, customProperty) {
    var token, type;
    var length = tokens.length;
    var value = "";
    var clean = true;
    var next, prev;
    for (let i = 0; i < length; i += 1) {
      token = tokens[i];
      type = token[0];
      if (type === "space" && i === length - 1 && !customProperty) {
        clean = false;
      } else if (type === "comment") {
        prev = tokens[i - 1] ? tokens[i - 1][0] : "empty";
        next = tokens[i + 1] ? tokens[i + 1][0] : "empty";
        if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
          if (value.slice(-1) === ",") {
            clean = false;
          } else {
            value += token[1];
          }
        } else {
          clean = false;
        }
      } else {
        value += token[1];
      }
    }
    if (!clean) {
      var raw = tokens.reduce((all, i) => all + i[1], "");
      node2.raws[prop] = {
        value,
        raw
      };
    }
    node2[prop] = value;
  }
  spacesAndCommentsFromEnd(tokens) {
    var lastTokenType;
    var spaces = "";
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0];
      if (lastTokenType !== "space" && lastTokenType !== "comment")
        break;
      spaces = tokens.pop()[1] + spaces;
    }
    return spaces;
  }
  spacesAndCommentsFromStart(tokens) {
    var next;
    var spaces = "";
    while (tokens.length) {
      next = tokens[0][0];
      if (next !== "space" && next !== "comment")
        break;
      spaces += tokens.shift()[1];
    }
    return spaces;
  }
  spacesFromEnd(tokens) {
    var lastTokenType;
    var spaces = "";
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0];
      if (lastTokenType !== "space")
        break;
      spaces = tokens.pop()[1] + spaces;
    }
    return spaces;
  }
  stringFrom(tokens, from) {
    var result2 = "";
    for (let i = from; i < tokens.length; i++) {
      result2 += tokens[i][1];
    }
    tokens.splice(from, tokens.length - from);
    return result2;
  }
  colon(tokens) {
    var brackets = 0;
    var token, type, prev;
    for (let [i, element] of tokens.entries()) {
      token = element;
      type = token[0];
      if (type === "(") {
        brackets += 1;
      }
      if (type === ")") {
        brackets -= 1;
      }
      if (brackets === 0 && type === ":") {
        if (!prev) {
          this.doubleColon(token);
        } else if (prev[0] === "word" && prev[1] === "progid") {
          continue;
        } else {
          return i;
        }
      }
      prev = token;
    }
    return false;
  }
  // Errors
  unclosedBracket(bracket) {
    throw this.input.error("Unclosed bracket", {
      offset: bracket[2]
    }, {
      offset: bracket[2] + 1
    });
  }
  unknownWord(tokens) {
    throw this.input.error("Unknown word", {
      offset: tokens[0][2]
    }, {
      offset: tokens[0][2] + tokens[0][1].length
    });
  }
  unexpectedClose(token) {
    throw this.input.error("Unexpected }", {
      offset: token[2]
    }, {
      offset: token[2] + 1
    });
  }
  unclosedBlock() {
    var pos = this.current.source.start;
    throw this.input.error("Unclosed block", pos.line, pos.column);
  }
  doubleColon(token) {
    throw this.input.error("Double colon", {
      offset: token[2]
    }, {
      offset: token[2] + token[1].length
    });
  }
  unnamedAtrule(node2, token) {
    throw this.input.error("At-rule without name", {
      offset: token[2]
    }, {
      offset: token[2] + token[1].length
    });
  }
  precheckMissedSemicolon() {
  }
  checkMissedSemicolon(tokens) {
    var colon = this.colon(tokens);
    if (colon === false)
      return;
    var founded = 0;
    var token;
    for (let j = colon - 1; j >= 0; j--) {
      token = tokens[j];
      if (token[0] !== "space") {
        founded += 1;
        if (founded === 2)
          break;
      }
    }
    throw this.input.error("Missed semicolon", token[0] === "word" ? token[3] + 1 : token[2]);
  }
};
var parser = Parser$1;
var Container$2 = container;
var Parser2 = parser;
var Input$2 = input;
function parse$3(css, opts) {
  var input2 = new Input$2(css, opts);
  var parser2 = new Parser2(input2);
  try {
    parser2.parse();
  } catch (e) {
    throw e;
  }
  return parser2.root;
}
var parse_1 = parse$3;
parse$3.default = parse$3;
Container$2.registerParse(parse$3);
var {
  isClean,
  my
} = symbols;
var MapGenerator$1 = mapGenerator;
var stringify$2 = stringify_1;
var Container$1 = container;
var Document$2 = document$1;
var Result$2 = result;
var parse$2 = parse_1;
var Root$3 = root;
var TYPE_TO_CLASS_NAME = {
  document: "Document",
  root: "Root",
  atrule: "AtRule",
  rule: "Rule",
  decl: "Declaration",
  comment: "Comment"
};
var PLUGIN_PROPS = {
  postcssPlugin: true,
  prepare: true,
  Once: true,
  Document: true,
  Root: true,
  Declaration: true,
  Rule: true,
  AtRule: true,
  Comment: true,
  DeclarationExit: true,
  RuleExit: true,
  AtRuleExit: true,
  CommentExit: true,
  RootExit: true,
  DocumentExit: true,
  OnceExit: true
};
var NOT_VISITORS = {
  postcssPlugin: true,
  prepare: true,
  Once: true
};
var CHILDREN = 0;
function isPromise(obj) {
  return typeof obj === "object" && typeof obj.then === "function";
}
function getEvents(node2) {
  var key = false;
  var type = TYPE_TO_CLASS_NAME[node2.type];
  if (node2.type === "decl") {
    key = node2.prop.toLowerCase();
  } else if (node2.type === "atrule") {
    key = node2.name.toLowerCase();
  }
  if (key && node2.append) {
    return [type, type + "-" + key, CHILDREN, type + "Exit", type + "Exit-" + key];
  } else if (key) {
    return [type, type + "-" + key, type + "Exit", type + "Exit-" + key];
  } else if (node2.append) {
    return [type, CHILDREN, type + "Exit"];
  } else {
    return [type, type + "Exit"];
  }
}
function toStack(node2) {
  var events;
  if (node2.type === "document") {
    events = ["Document", CHILDREN, "DocumentExit"];
  } else if (node2.type === "root") {
    events = ["Root", CHILDREN, "RootExit"];
  } else {
    events = getEvents(node2);
  }
  return {
    node: node2,
    events,
    eventIndex: 0,
    visitors: [],
    visitorIndex: 0,
    iterator: 0
  };
}
function cleanMarks(node2) {
  node2[isClean] = false;
  if (node2.nodes)
    node2.nodes.forEach((i) => cleanMarks(i));
  return node2;
}
var postcss$1 = {};
var LazyResult$2 = class LazyResult {
  constructor(processor2, css, opts) {
    this.stringified = false;
    this.processed = false;
    var root2;
    if (typeof css === "object" && css !== null && (css.type === "root" || css.type === "document")) {
      root2 = cleanMarks(css);
    } else if (css instanceof LazyResult || css instanceof Result$2) {
      root2 = cleanMarks(css.root);
      if (css.map) {
        if (typeof opts.map === "undefined")
          opts.map = {};
        if (!opts.map.inline)
          opts.map.inline = false;
        opts.map.prev = css.map;
      }
    } else {
      var parser2 = parse$2;
      if (opts.syntax)
        parser2 = opts.syntax.parse;
      if (opts.parser)
        parser2 = opts.parser;
      if (parser2.parse)
        parser2 = parser2.parse;
      try {
        root2 = parser2(css, opts);
      } catch (error) {
        this.processed = true;
        this.error = error;
      }
      if (root2 && !root2[my]) {
        Container$1.rebuild(root2);
      }
    }
    this.result = new Result$2(processor2, root2, opts);
    this.helpers = {
      ...postcss$1,
      result: this.result,
      postcss: postcss$1
    };
    this.plugins = this.processor.plugins.map((plugin2) => {
      if (typeof plugin2 === "object" && plugin2.prepare) {
        return {
          ...plugin2,
          ...plugin2.prepare(this.result)
        };
      } else {
        return plugin2;
      }
    });
  }
  get [Symbol.toStringTag]() {
    return "LazyResult";
  }
  get processor() {
    return this.result.processor;
  }
  get opts() {
    return this.result.opts;
  }
  get css() {
    return this.stringify().css;
  }
  get content() {
    return this.stringify().content;
  }
  get map() {
    return this.stringify().map;
  }
  get root() {
    return this.sync().root;
  }
  get messages() {
    return this.sync().messages;
  }
  warnings() {
    return this.sync().warnings();
  }
  toString() {
    return this.css;
  }
  then(onFulfilled, onRejected) {
    return this.async().then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return this.async().catch(onRejected);
  }
  finally(onFinally) {
    return this.async().then(onFinally, onFinally);
  }
  async() {
    if (this.error)
      return Promise.reject(this.error);
    if (this.processed)
      return Promise.resolve(this.result);
    if (!this.processing) {
      this.processing = this.runAsync();
    }
    return this.processing;
  }
  sync() {
    if (this.error)
      throw this.error;
    if (this.processed)
      return this.result;
    this.processed = true;
    if (this.processing) {
      throw this.getAsyncError();
    }
    for (let plugin2 of this.plugins) {
      var promise = this.runOnRoot(plugin2);
      if (isPromise(promise)) {
        throw this.getAsyncError();
      }
    }
    this.prepareVisitors();
    if (this.hasListener) {
      var root2 = this.result.root;
      while (!root2[isClean]) {
        root2[isClean] = true;
        this.walkSync(root2);
      }
      if (this.listeners.OnceExit) {
        if (root2.type === "document") {
          for (let subRoot of root2.nodes) {
            this.visitSync(this.listeners.OnceExit, subRoot);
          }
        } else {
          this.visitSync(this.listeners.OnceExit, root2);
        }
      }
    }
    return this.result;
  }
  stringify() {
    if (this.error)
      throw this.error;
    if (this.stringified)
      return this.result;
    this.stringified = true;
    this.sync();
    var opts = this.result.opts;
    var str = stringify$2;
    if (opts.syntax)
      str = opts.syntax.stringify;
    if (opts.stringifier)
      str = opts.stringifier;
    if (str.stringify)
      str = str.stringify;
    var map = new MapGenerator$1(str, this.result.root, this.result.opts);
    var data = map.generate();
    this.result.css = data[0];
    this.result.map = data[1];
    return this.result;
  }
  walkSync(node2) {
    node2[isClean] = true;
    var events = getEvents(node2);
    for (let event of events) {
      if (event === CHILDREN) {
        if (node2.nodes) {
          node2.each((child) => {
            if (!child[isClean])
              this.walkSync(child);
          });
        }
      } else {
        var visitors = this.listeners[event];
        if (visitors) {
          if (this.visitSync(visitors, node2.toProxy()))
            return;
        }
      }
    }
  }
  visitSync(visitors, node2) {
    for (let [plugin2, visitor] of visitors) {
      this.result.lastPlugin = plugin2;
      var promise;
      try {
        promise = visitor(node2, this.helpers);
      } catch (e) {
        throw this.handleError(e, node2.proxyOf);
      }
      if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
        return true;
      }
      if (isPromise(promise)) {
        throw this.getAsyncError();
      }
    }
  }
  runOnRoot(plugin2) {
    this.result.lastPlugin = plugin2;
    try {
      if (typeof plugin2 === "object" && plugin2.Once) {
        if (this.result.root.type === "document") {
          var roots = this.result.root.nodes.map((root2) => plugin2.Once(root2, this.helpers));
          if (isPromise(roots[0])) {
            return Promise.all(roots);
          }
          return roots;
        }
        return plugin2.Once(this.result.root, this.helpers);
      } else if (typeof plugin2 === "function") {
        return plugin2(this.result.root, this.result);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }
  getAsyncError() {
    throw new Error("Use process(css).then(cb) to work with async plugins");
  }
  handleError(error, node2) {
    var plugin2 = this.result.lastPlugin;
    try {
      if (node2)
        node2.addToError(error);
      this.error = error;
      if (error.name === "CssSyntaxError" && !error.plugin) {
        error.plugin = plugin2.postcssPlugin;
        error.setMessage();
      } else if (plugin2.postcssVersion) {
        if (false)
          ;
      }
    } catch (err) {
      if (console && console.error)
        console.error(err);
    }
    return error;
  }
  async runAsync() {
    this.plugin = 0;
    for (let i = 0; i < this.plugins.length; i++) {
      var plugin2 = this.plugins[i];
      var promise = this.runOnRoot(plugin2);
      if (isPromise(promise)) {
        try {
          await promise;
        } catch (error) {
          throw this.handleError(error);
        }
      }
    }
    this.prepareVisitors();
    if (this.hasListener) {
      var root2 = this.result.root;
      while (!root2[isClean]) {
        root2[isClean] = true;
        var stack = [toStack(root2)];
        while (stack.length > 0) {
          var promise = this.visitTick(stack);
          if (isPromise(promise)) {
            try {
              await promise;
            } catch (e) {
              var node2 = stack[stack.length - 1].node;
              throw this.handleError(e, node2);
            }
          }
        }
      }
      if (this.listeners.OnceExit) {
        for (let [plugin22, visitor] of this.listeners.OnceExit) {
          this.result.lastPlugin = plugin22;
          try {
            if (root2.type === "document") {
              var roots = root2.nodes.map((subRoot) => visitor(subRoot, this.helpers));
              await Promise.all(roots);
            } else {
              await visitor(root2, this.helpers);
            }
          } catch (e) {
            throw this.handleError(e);
          }
        }
      }
    }
    this.processed = true;
    return this.stringify();
  }
  prepareVisitors() {
    this.listeners = {};
    var add = (plugin2, type, cb) => {
      if (!this.listeners[type])
        this.listeners[type] = [];
      this.listeners[type].push([plugin2, cb]);
    };
    for (let plugin2 of this.plugins) {
      if (typeof plugin2 === "object") {
        for (let event in plugin2) {
          if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
            throw new Error(`Unknown event ${event} in ${plugin2.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`);
          }
          if (!NOT_VISITORS[event]) {
            if (typeof plugin2[event] === "object") {
              for (let filter2 in plugin2[event]) {
                if (filter2 === "*") {
                  add(plugin2, event, plugin2[event][filter2]);
                } else {
                  add(plugin2, event + "-" + filter2.toLowerCase(), plugin2[event][filter2]);
                }
              }
            } else if (typeof plugin2[event] === "function") {
              add(plugin2, event, plugin2[event]);
            }
          }
        }
      }
    }
    this.hasListener = Object.keys(this.listeners).length > 0;
  }
  visitTick(stack) {
    var visit = stack[stack.length - 1];
    var {
      node: node2,
      visitors
    } = visit;
    if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
      stack.pop();
      return;
    }
    if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
      var [plugin2, visitor] = visitors[visit.visitorIndex];
      visit.visitorIndex += 1;
      if (visit.visitorIndex === visitors.length) {
        visit.visitors = [];
        visit.visitorIndex = 0;
      }
      this.result.lastPlugin = plugin2;
      try {
        return visitor(node2.toProxy(), this.helpers);
      } catch (e) {
        throw this.handleError(e, node2);
      }
    }
    if (visit.iterator !== 0) {
      var iterator = visit.iterator;
      var child;
      while (child = node2.nodes[node2.indexes[iterator]]) {
        node2.indexes[iterator] += 1;
        if (!child[isClean]) {
          child[isClean] = true;
          stack.push(toStack(child));
          return;
        }
      }
      visit.iterator = 0;
      delete node2.indexes[iterator];
    }
    var events = visit.events;
    while (visit.eventIndex < events.length) {
      var event = events[visit.eventIndex];
      visit.eventIndex += 1;
      if (event === CHILDREN) {
        if (node2.nodes && node2.nodes.length) {
          node2[isClean] = true;
          visit.iterator = node2.getIterator();
        }
        return;
      } else if (this.listeners[event]) {
        visit.visitors = this.listeners[event];
        return;
      }
    }
    stack.pop();
  }
};
LazyResult$2.registerPostcss = (dependant) => {
  postcss$1 = dependant;
};
var lazyResult = LazyResult$2;
LazyResult$2.default = LazyResult$2;
Root$3.registerLazyResult(LazyResult$2);
(_a = Document$2.registerLazyResult) == null ? void 0 : _a.call(Document$2, LazyResult$2);
var MapGenerator2 = mapGenerator;
var stringify$1 = stringify_1;
var parse$1 = parse_1;
var Result$1 = result;
NoWorkResult$1 = class NoWorkResult {
  constructor(processor2, css, opts) {
    css = css.toString();
    this.stringified = false;
    this._processor = processor2;
    this._css = css;
    this._opts = opts;
    this._map = void 0;
    var root2;
    var str = stringify$1;
    this.result = new Result$1(this._processor, root2, this._opts);
    this.result.css = css;
    var self2 = this;
    Object.defineProperty(this.result, "root", {
      get() {
        return self2.root;
      }
    });
    var map = new MapGenerator2(str, root2, this._opts, css);
    if (map.isMap()) {
      var [generatedCSS, generatedMap] = map.generate();
      if (generatedCSS) {
        this.result.css = generatedCSS;
      }
      if (generatedMap) {
        this.result.map = generatedMap;
      }
    }
  }
  get [Symbol.toStringTag]() {
    return "NoWorkResult";
  }
  get processor() {
    return this.result.processor;
  }
  get opts() {
    return this.result.opts;
  }
  get css() {
    return this.result.css;
  }
  get content() {
    return this.result.css;
  }
  get map() {
    return this.result.map;
  }
  get root() {
    if (this._root) {
      return this._root;
    }
    var root2;
    var parser2 = parse$1;
    try {
      root2 = parser2(this._css, this._opts);
    } catch (error) {
      this.error = error;
    }
    if (this.error) {
      throw this.error;
    } else {
      this._root = root2;
      return root2;
    }
  }
  get messages() {
    return [];
  }
  warnings() {
    return [];
  }
  toString() {
    return this._css;
  }
  then(onFulfilled, onRejected) {
    return this.async().then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return this.async().catch(onRejected);
  }
  finally(onFinally) {
    return this.async().then(onFinally, onFinally);
  }
  async() {
    if (this.error)
      return Promise.reject(this.error);
    return Promise.resolve(this.result);
  }
  sync() {
    if (this.error)
      throw this.error;
    return this.result;
  }
};
var noWorkResult = NoWorkResult$1;
NoWorkResult$1.default = NoWorkResult$1;
var NoWorkResult2 = noWorkResult;
var LazyResult$1 = lazyResult;
var Document$1 = document$1;
var Root$2 = root;
var Processor$1 = class Processor {
  constructor(plugins = []) {
    this.version = "8.4.21";
    this.plugins = this.normalize(plugins);
  }
  use(plugin2) {
    this.plugins = this.plugins.concat(this.normalize([plugin2]));
    return this;
  }
  process(css, opts = {}) {
    if (this.plugins.length === 0 && typeof opts.parser === "undefined" && typeof opts.stringifier === "undefined" && typeof opts.syntax === "undefined") {
      return new NoWorkResult2(this, css, opts);
    } else {
      return new LazyResult$1(this, css, opts);
    }
  }
  normalize(plugins) {
    var normalized = [];
    for (let i of plugins) {
      if (i.postcss === true) {
        i = i();
      } else if (i.postcss) {
        i = i.postcss;
      }
      if (typeof i === "object" && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins);
      } else if (typeof i === "object" && i.postcssPlugin) {
        normalized.push(i);
      } else if (typeof i === "function") {
        normalized.push(i);
      } else if (typeof i === "object" && (i.parse || i.stringify))
        ;
      else {
        throw new Error(i + " is not a PostCSS plugin");
      }
    }
    return normalized;
  }
};
var processor = Processor$1;
Processor$1.default = Processor$1;
Root$2.registerProcessor(Processor$1);
(_b = Document$1.registerProcessor) == null ? void 0 : _b.call(Document$1, Processor$1);
Declaration$1 = declaration;
PreviousMap2 = previousMap;
Comment$1 = comment;
AtRule$1 = atRule;
Input$1 = input;
Root$1 = root;
Rule$1 = rule;
function fromJSON$1(json, inputs) {
  if (Array.isArray(json))
    return json.map((n) => fromJSON$1(n));
  var {
    inputs: ownInputs,
    ...defaults
  } = json;
  if (ownInputs) {
    inputs = [];
    for (let input2 of ownInputs) {
      var inputHydrated = {
        ...input2,
        __proto__: Input$1.prototype
      };
      if (inputHydrated.map) {
        inputHydrated.map = {
          ...inputHydrated.map,
          __proto__: PreviousMap2.prototype
        };
      }
      inputs.push(inputHydrated);
    }
  }
  if (defaults.nodes) {
    defaults.nodes = json.nodes.map((n) => fromJSON$1(n, inputs));
  }
  if (defaults.source) {
    var {
      inputId,
      ...source
    } = defaults.source;
    defaults.source = source;
    if (inputId != null) {
      defaults.source.input = inputs[inputId];
    }
  }
  if (defaults.type === "root") {
    return new Root$1(defaults);
  } else if (defaults.type === "decl") {
    return new Declaration$1(defaults);
  } else if (defaults.type === "rule") {
    return new Rule$1(defaults);
  } else if (defaults.type === "comment") {
    return new Comment$1(defaults);
  } else if (defaults.type === "atrule") {
    return new AtRule$1(defaults);
  } else {
    throw new Error("Unknown node type: " + json.type);
  }
}
var fromJSON_1 = fromJSON$1;
fromJSON$1.default = fromJSON$1;
var CssSyntaxError2 = cssSyntaxError;
var Declaration2 = declaration;
var LazyResult2 = lazyResult;
var Container2 = container;
var Processor2 = processor;
var stringify = stringify_1;
var fromJSON = fromJSON_1;
var Document2 = document$1;
var Warning2 = warning;
var Comment2 = comment;
var AtRule2 = atRule;
var Result2 = result;
var Input2 = input;
var parse = parse_1;
var list = list_1;
var Rule2 = rule;
var Root2 = root;
var Node22 = node;
function postcss(...plugins) {
  if (plugins.length === 1 && Array.isArray(plugins[0])) {
    plugins = plugins[0];
  }
  return new Processor2(plugins);
}
postcss.plugin = function plugin(name, initializer) {
  var warningPrinted = false;
  function creator(...args) {
    if (console && console.warn && !warningPrinted) {
      warningPrinted = true;
      console.warn(name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration");
      if ({}.LANG && {}.LANG.startsWith("cn")) {
        console.warn(name + ": \u91CC\u9762 postcss.plugin \u88AB\u5F03\u7528. \u8FC1\u79FB\u6307\u5357:\nhttps://www.w3ctech.com/topic/2226");
      }
    }
    var transformer = initializer(...args);
    transformer.postcssPlugin = name;
    transformer.postcssVersion = new Processor2().version;
    return transformer;
  }
  var cache;
  Object.defineProperty(creator, "postcss", {
    get() {
      if (!cache)
        cache = creator();
      return cache;
    }
  });
  creator.process = function(css, processOpts, pluginOpts) {
    return postcss([creator(pluginOpts)]).process(css, processOpts);
  };
  return creator;
};
postcss.stringify = stringify;
postcss.parse = parse;
postcss.fromJSON = fromJSON;
postcss.list = list;
postcss.comment = (defaults) => new Comment2(defaults);
postcss.atRule = (defaults) => new AtRule2(defaults);
postcss.decl = (defaults) => new Declaration2(defaults);
postcss.rule = (defaults) => new Rule2(defaults);
postcss.root = (defaults) => new Root2(defaults);
postcss.document = (defaults) => new Document2(defaults);
postcss.CssSyntaxError = CssSyntaxError2;
postcss.Declaration = Declaration2;
postcss.Container = Container2;
postcss.Processor = Processor2;
postcss.Document = Document2;
postcss.Comment = Comment2;
postcss.Warning = Warning2;
postcss.AtRule = AtRule2;
postcss.Result = Result2;
postcss.Input = Input2;
postcss.Rule = Rule2;
postcss.Root = Root2;
postcss.Node = Node22;
LazyResult2.registerPostcss(postcss);
var postcss_1 = postcss;
postcss.default = postcss;
var htmlparser = lib$5;
var escapeStringRegexp = escapeStringRegexp$1;
var {
  isPlainObject
} = isPlainObject$2;
var deepmerge = cjs;
var parseSrcset = parseSrcsetExports;
var {
  parse: postcssParse
} = postcss_1;
var mediaTags = ["img", "audio", "video", "picture", "svg", "object", "map", "iframe", "embed"];
vulnerableTags = ["script", "style"];
function each(obj, cb) {
  if (obj) {
    Object.keys(obj).forEach(function(key) {
      cb(obj[key], key);
    });
  }
}
function has(obj, key) {
  return {}.hasOwnProperty.call(obj, key);
}
function filter(a, cb) {
  var n = [];
  each(a, function(v) {
    if (cb(v)) {
      n.push(v);
    }
  });
  return n;
}
function isEmptyObject(obj) {
  for (var key in obj) {
    if (has(obj, key)) {
      return false;
    }
  }
  return true;
}
function stringifySrcset(parsedSrcset) {
  return parsedSrcset.map(function(part) {
    if (!part.url) {
      throw new Error("URL missing");
    }
    return part.url + (part.w ? ` ${part.w}w` : "") + (part.h ? ` ${part.h}h` : "") + (part.d ? ` ${part.d}x` : "");
  }).join(", ");
}
var sanitizeHtml_1 = sanitizeHtml;
var VALID_HTML_ATTRIBUTE_NAME = /^[^\0\t\n\f\r /<=>]+$/;
function sanitizeHtml(html, options, _recursing) {
  if (html == null) {
    return "";
  }
  if (typeof html === "number") {
    html = html.toString();
  }
  var result2 = "";
  var tempResult = "";
  function Frame(tag, attribs) {
    var that = this;
    this.tag = tag;
    this.attribs = attribs || {};
    this.tagPosition = result2.length;
    this.text = "";
    this.mediaChildren = [];
    this.updateParentNodeText = function() {
      if (stack.length) {
        var parentFrame = stack[stack.length - 1];
        parentFrame.text += that.text;
      }
    };
    this.updateParentNodeMediaChildren = function() {
      if (stack.length && mediaTags.includes(this.tag)) {
        var parentFrame = stack[stack.length - 1];
        parentFrame.mediaChildren.push(this.tag);
      }
    };
  }
  options = Object.assign({}, sanitizeHtml.defaults, options);
  options.parser = Object.assign({}, htmlParserDefaults, options.parser);
  var tagAllowed = function(name) {
    return options.allowedTags === false || (options.allowedTags || []).indexOf(name) > -1;
  };
  vulnerableTags.forEach(function(tag) {
    if (tagAllowed(tag) && !options.allowVulnerableTags) {
      console.warn(`
  
  \u26A0\uFE0F Your \`allowedTags\` option includes, \`${tag}\`, which is inherently
  vulnerable to XSS attacks. Please remove it from \`allowedTags\`.
  Or, to disable this warning, add the \`allowVulnerableTags\` option
  and ensure you are accounting for this risk.
  
  `);
    }
  });
  var nonTextTagsArray = options.nonTextTags || ["script", "style", "textarea", "option"];
  var allowedAttributesMap;
  var allowedAttributesGlobMap;
  if (options.allowedAttributes) {
    allowedAttributesMap = {};
    allowedAttributesGlobMap = {};
    each(options.allowedAttributes, function(attributes, tag) {
      allowedAttributesMap[tag] = [];
      var globRegex = [];
      attributes.forEach(function(obj) {
        if (typeof obj === "string" && obj.indexOf("*") >= 0) {
          globRegex.push(escapeStringRegexp(obj).replace(/\\\*/g, ".*"));
        } else {
          allowedAttributesMap[tag].push(obj);
        }
      });
      if (globRegex.length) {
        allowedAttributesGlobMap[tag] = new RegExp("^(" + globRegex.join("|") + ")$");
      }
    });
  }
  var allowedClassesMap = {};
  var allowedClassesGlobMap = {};
  var allowedClassesRegexMap = {};
  each(options.allowedClasses, function(classes, tag) {
    if (allowedAttributesMap) {
      if (!has(allowedAttributesMap, tag)) {
        allowedAttributesMap[tag] = [];
      }
      allowedAttributesMap[tag].push("class");
    }
    allowedClassesMap[tag] = classes;
    if (Array.isArray(classes)) {
      var globRegex = [];
      allowedClassesMap[tag] = [];
      allowedClassesRegexMap[tag] = [];
      classes.forEach(function(obj) {
        if (typeof obj === "string" && obj.indexOf("*") >= 0) {
          globRegex.push(escapeStringRegexp(obj).replace(/\\\*/g, ".*"));
        } else if (obj instanceof RegExp) {
          allowedClassesRegexMap[tag].push(obj);
        } else {
          allowedClassesMap[tag].push(obj);
        }
      });
      if (globRegex.length) {
        allowedClassesGlobMap[tag] = new RegExp("^(" + globRegex.join("|") + ")$");
      }
    }
  });
  var transformTagsMap = {};
  var transformTagsAll;
  each(options.transformTags, function(transform, tag) {
    var transFun;
    if (typeof transform === "function") {
      transFun = transform;
    } else if (typeof transform === "string") {
      transFun = sanitizeHtml.simpleTransform(transform);
    }
    if (tag === "*") {
      transformTagsAll = transFun;
    } else {
      transformTagsMap[tag] = transFun;
    }
  });
  var depth;
  var stack;
  var skipMap;
  var transformMap;
  var skipText;
  var skipTextDepth;
  var addedText = false;
  initializeState();
  var parser2 = new htmlparser.Parser({
    onopentag: function(name, attribs) {
      if (options.enforceHtmlBoundary && name === "html") {
        initializeState();
      }
      if (skipText) {
        skipTextDepth++;
        return;
      }
      var frame = new Frame(name, attribs);
      stack.push(frame);
      var skip = false;
      var hasText = !!frame.text;
      var transformedTag;
      if (has(transformTagsMap, name)) {
        transformedTag = transformTagsMap[name](name, attribs);
        frame.attribs = attribs = transformedTag.attribs;
        if (transformedTag.text !== void 0) {
          frame.innerText = transformedTag.text;
        }
        if (name !== transformedTag.tagName) {
          frame.name = name = transformedTag.tagName;
          transformMap[depth] = transformedTag.tagName;
        }
      }
      if (transformTagsAll) {
        transformedTag = transformTagsAll(name, attribs);
        frame.attribs = attribs = transformedTag.attribs;
        if (name !== transformedTag.tagName) {
          frame.name = name = transformedTag.tagName;
          transformMap[depth] = transformedTag.tagName;
        }
      }
      if (!tagAllowed(name) || options.disallowedTagsMode === "recursiveEscape" && !isEmptyObject(skipMap) || options.nestingLimit != null && depth >= options.nestingLimit) {
        skip = true;
        skipMap[depth] = true;
        if (options.disallowedTagsMode === "discard") {
          if (nonTextTagsArray.indexOf(name) !== -1) {
            skipText = true;
            skipTextDepth = 1;
          }
        }
        skipMap[depth] = true;
      }
      depth++;
      if (skip) {
        if (options.disallowedTagsMode === "discard") {
          return;
        }
        tempResult = result2;
        result2 = "";
      }
      result2 += "<" + name;
      if (name === "script") {
        if (options.allowedScriptHostnames || options.allowedScriptDomains) {
          frame.innerText = "";
        }
      }
      if (!allowedAttributesMap || has(allowedAttributesMap, name) || allowedAttributesMap["*"]) {
        each(attribs, function(value, a) {
          var _a2, _b2;
          if (!VALID_HTML_ATTRIBUTE_NAME.test(a)) {
            delete frame.attribs[a];
            return;
          }
          if (value === "" && (((_a2 = options.nonBooleanAttributes) == null ? void 0 : _a2.includes(a)) || ((_b2 = options.nonBooleanAttributes) == null ? void 0 : _b2.includes("*")))) {
            delete frame.attribs[a];
            return;
          }
          var passedAllowedAttributesMapCheck = false;
          if (!allowedAttributesMap || has(allowedAttributesMap, name) && allowedAttributesMap[name].indexOf(a) !== -1 || allowedAttributesMap["*"] && allowedAttributesMap["*"].indexOf(a) !== -1 || has(allowedAttributesGlobMap, name) && allowedAttributesGlobMap[name].test(a) || allowedAttributesGlobMap["*"] && allowedAttributesGlobMap["*"].test(a)) {
            passedAllowedAttributesMapCheck = true;
          } else if (allowedAttributesMap && allowedAttributesMap[name]) {
            for (var o of allowedAttributesMap[name]) {
              if (isPlainObject(o) && o.name && o.name === a) {
                passedAllowedAttributesMapCheck = true;
                var newValue = "";
                if (o.multiple === true) {
                  var splitStrArray = value.split(" ");
                  for (var s of splitStrArray) {
                    if (o.values.indexOf(s) !== -1) {
                      if (newValue === "") {
                        newValue = s;
                      } else {
                        newValue += " " + s;
                      }
                    }
                  }
                } else if (o.values.indexOf(value) >= 0) {
                  newValue = value;
                }
                value = newValue;
              }
            }
          }
          if (passedAllowedAttributesMapCheck) {
            if (options.allowedSchemesAppliedToAttributes.indexOf(a) !== -1) {
              if (naughtyHref(name, value)) {
                delete frame.attribs[a];
                return;
              }
            }
            if (name === "script" && a === "src") {
              var allowed = true;
              try {
                var parsed = parseUrl(value);
                if (options.allowedScriptHostnames || options.allowedScriptDomains) {
                  var allowedHostname = (options.allowedScriptHostnames || []).find(function(hostname) {
                    return hostname === parsed.url.hostname;
                  });
                  var allowedDomain = (options.allowedScriptDomains || []).find(function(domain) {
                    return parsed.url.hostname === domain || parsed.url.hostname.endsWith(`.${domain}`);
                  });
                  allowed = allowedHostname || allowedDomain;
                }
              } catch (e) {
                allowed = false;
              }
              if (!allowed) {
                delete frame.attribs[a];
                return;
              }
            }
            if (name === "iframe" && a === "src") {
              var allowed = true;
              try {
                var parsed = parseUrl(value);
                if (parsed.isRelativeUrl) {
                  allowed = has(options, "allowIframeRelativeUrls") ? options.allowIframeRelativeUrls : !options.allowedIframeHostnames && !options.allowedIframeDomains;
                } else if (options.allowedIframeHostnames || options.allowedIframeDomains) {
                  var allowedHostname = (options.allowedIframeHostnames || []).find(function(hostname) {
                    return hostname === parsed.url.hostname;
                  });
                  var allowedDomain = (options.allowedIframeDomains || []).find(function(domain) {
                    return parsed.url.hostname === domain || parsed.url.hostname.endsWith(`.${domain}`);
                  });
                  allowed = allowedHostname || allowedDomain;
                }
              } catch (e) {
                allowed = false;
              }
              if (!allowed) {
                delete frame.attribs[a];
                return;
              }
            }
            if (a === "srcset") {
              try {
                var parsed = parseSrcset(value);
                parsed.forEach(function(value2) {
                  if (naughtyHref("srcset", value2.url)) {
                    value2.evil = true;
                  }
                });
                parsed = filter(parsed, function(v) {
                  return !v.evil;
                });
                if (!parsed.length) {
                  delete frame.attribs[a];
                  return;
                } else {
                  value = stringifySrcset(filter(parsed, function(v) {
                    return !v.evil;
                  }));
                  frame.attribs[a] = value;
                }
              } catch (e) {
                delete frame.attribs[a];
                return;
              }
            }
            if (a === "class") {
              var allowedSpecificClasses = allowedClassesMap[name];
              var allowedWildcardClasses = allowedClassesMap["*"];
              var allowedSpecificClassesGlob = allowedClassesGlobMap[name];
              var allowedSpecificClassesRegex = allowedClassesRegexMap[name];
              var allowedWildcardClassesGlob = allowedClassesGlobMap["*"];
              var allowedClassesGlobs = [allowedSpecificClassesGlob, allowedWildcardClassesGlob].concat(allowedSpecificClassesRegex).filter(function(t) {
                return t;
              });
              if (allowedSpecificClasses && allowedWildcardClasses) {
                value = filterClasses(value, deepmerge(allowedSpecificClasses, allowedWildcardClasses), allowedClassesGlobs);
              } else {
                value = filterClasses(value, allowedSpecificClasses || allowedWildcardClasses, allowedClassesGlobs);
              }
              if (!value.length) {
                delete frame.attribs[a];
                return;
              }
            }
            if (a === "style") {
              if (options.parseStyleAttributes) {
                try {
                  var abstractSyntaxTree = postcssParse(name + " {" + value + "}");
                  var filteredAST = filterCss(abstractSyntaxTree, options.allowedStyles);
                  value = stringifyStyleAttributes(filteredAST);
                  if (value.length === 0) {
                    delete frame.attribs[a];
                    return;
                  }
                } catch (e) {
                  if (typeof window !== "undefined") {
                    console.warn('Failed to parse "' + name + " {" + value + `}", If you're running this in a browser, we recommend to disable style parsing: options.parseStyleAttributes: false, since this only works in a node environment due to a postcss dependency, More info: https://github.com/apostrophecms/sanitize-html/issues/547`);
                  }
                  delete frame.attribs[a];
                  return;
                }
              } else if (options.allowedStyles) {
                throw new Error("allowedStyles option cannot be used together with parseStyleAttributes: false.");
              }
            }
            result2 += " " + a;
            if (value && value.length) {
              result2 += '="' + escapeHtml(value, true) + '"';
            }
          } else {
            delete frame.attribs[a];
          }
        });
      }
      if (options.selfClosing.indexOf(name) !== -1) {
        result2 += " />";
      } else {
        result2 += ">";
        if (frame.innerText && !hasText && !options.textFilter) {
          result2 += escapeHtml(frame.innerText);
          addedText = true;
        }
      }
      if (skip) {
        result2 = tempResult + escapeHtml(result2);
        tempResult = "";
      }
    },
    ontext: function(text) {
      if (skipText) {
        return;
      }
      var lastFrame = stack[stack.length - 1];
      var tag;
      if (lastFrame) {
        tag = lastFrame.tag;
        text = lastFrame.innerText !== void 0 ? lastFrame.innerText : text;
      }
      if (options.disallowedTagsMode === "discard" && (tag === "script" || tag === "style")) {
        result2 += text;
      } else {
        var escaped = escapeHtml(text, false);
        if (options.textFilter && !addedText) {
          result2 += options.textFilter(escaped, tag);
        } else if (!addedText) {
          result2 += escaped;
        }
      }
      if (stack.length) {
        var frame = stack[stack.length - 1];
        frame.text += text;
      }
    },
    onclosetag: function(name, isImplied) {
      if (skipText) {
        skipTextDepth--;
        if (!skipTextDepth) {
          skipText = false;
        } else {
          return;
        }
      }
      var frame = stack.pop();
      if (!frame) {
        return;
      }
      if (frame.tag !== name) {
        stack.push(frame);
        return;
      }
      skipText = options.enforceHtmlBoundary ? name === "html" : false;
      depth--;
      var skip = skipMap[depth];
      if (skip) {
        delete skipMap[depth];
        if (options.disallowedTagsMode === "discard") {
          frame.updateParentNodeText();
          return;
        }
        tempResult = result2;
        result2 = "";
      }
      if (transformMap[depth]) {
        name = transformMap[depth];
        delete transformMap[depth];
      }
      if (options.exclusiveFilter && options.exclusiveFilter(frame)) {
        result2 = result2.substr(0, frame.tagPosition);
        return;
      }
      frame.updateParentNodeMediaChildren();
      frame.updateParentNodeText();
      if (
        // Already output />
        options.selfClosing.indexOf(name) !== -1 || // Escaped tag, closing tag is implied
        isImplied && !tagAllowed(name) && ["escape", "recursiveEscape"].indexOf(options.disallowedTagsMode) >= 0
      ) {
        if (skip) {
          result2 = tempResult;
          tempResult = "";
        }
        return;
      }
      result2 += "</" + name + ">";
      if (skip) {
        result2 = tempResult + escapeHtml(result2);
        tempResult = "";
      }
      addedText = false;
    }
  }, options.parser);
  parser2.write(html);
  parser2.end();
  return result2;
  function initializeState() {
    result2 = "";
    depth = 0;
    stack = [];
    skipMap = {};
    transformMap = {};
    skipText = false;
    skipTextDepth = 0;
  }
  function escapeHtml(s, quote) {
    if (typeof s !== "string") {
      s = s + "";
    }
    if (options.parser.decodeEntities) {
      s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if (quote) {
        s = s.replace(/"/g, "&quot;");
      }
    }
    s = s.replace(/&(?![a-zA-Z0-9#]{1,20};)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (quote) {
      s = s.replace(/"/g, "&quot;");
    }
    return s;
  }
  function naughtyHref(name, href) {
    href = href.replace(/[\x00-\x20]+/g, "");
    while (true) {
      var firstIndex = href.indexOf("<!--");
      if (firstIndex === -1) {
        break;
      }
      var lastIndex = href.indexOf("-->", firstIndex + 4);
      if (lastIndex === -1) {
        break;
      }
      href = href.substring(0, firstIndex) + href.substring(lastIndex + 3);
    }
    var matches = href.match(/^([a-zA-Z][a-zA-Z0-9.\-+]*):/);
    if (!matches) {
      if (href.match(/^[/\\]{2}/)) {
        return !options.allowProtocolRelative;
      }
      return false;
    }
    var scheme = matches[1].toLowerCase();
    if (has(options.allowedSchemesByTag, name)) {
      return options.allowedSchemesByTag[name].indexOf(scheme) === -1;
    }
    return !options.allowedSchemes || options.allowedSchemes.indexOf(scheme) === -1;
  }
  function parseUrl(value) {
    value = value.replace(/^(\w+:)?\s*[\\/]\s*[\\/]/, "$1//");
    if (value.startsWith("relative:")) {
      throw new Error("relative: exploit attempt");
    }
    var base = "relative://relative-site";
    for (let i = 0; i < 100; i++) {
      base += `/${i}`;
    }
    var parsed = new URL(value, base);
    var isRelativeUrl = parsed && parsed.hostname === "relative-site" && parsed.protocol === "relative:";
    return {
      isRelativeUrl,
      url: parsed
    };
  }
  function filterCss(abstractSyntaxTree, allowedStyles) {
    if (!allowedStyles) {
      return abstractSyntaxTree;
    }
    var astRules = abstractSyntaxTree.nodes[0];
    var selectedRule;
    if (allowedStyles[astRules.selector] && allowedStyles["*"]) {
      selectedRule = deepmerge(allowedStyles[astRules.selector], allowedStyles["*"]);
    } else {
      selectedRule = allowedStyles[astRules.selector] || allowedStyles["*"];
    }
    if (selectedRule) {
      abstractSyntaxTree.nodes[0].nodes = astRules.nodes.reduce(filterDeclarations(selectedRule), []);
    }
    return abstractSyntaxTree;
  }
  function stringifyStyleAttributes(filteredAST) {
    return filteredAST.nodes[0].nodes.reduce(function(extractedAttributes, attrObject) {
      extractedAttributes.push(`${attrObject.prop}:${attrObject.value}${attrObject.important ? " !important" : ""}`);
      return extractedAttributes;
    }, []).join(";");
  }
  function filterDeclarations(selectedRule) {
    return function(allowedDeclarationsList, attributeObject) {
      if (has(selectedRule, attributeObject.prop)) {
        var matchesRegex = selectedRule[attributeObject.prop].some(function(regularExpression) {
          return regularExpression.test(attributeObject.value);
        });
        if (matchesRegex) {
          allowedDeclarationsList.push(attributeObject);
        }
      }
      return allowedDeclarationsList;
    };
  }
  function filterClasses(classes, allowed, allowedGlobs) {
    if (!allowed) {
      return classes;
    }
    classes = classes.split(/\s+/);
    return classes.filter(function(clss) {
      return allowed.indexOf(clss) !== -1 || allowedGlobs.some(function(glob) {
        return glob.test(clss);
      });
    }).join(" ");
  }
}
var htmlParserDefaults = {
  decodeEntities: true
};
sanitizeHtml.defaults = {
  allowedTags: [
    // Sections derived from MDN element categories and limited to the more
    // benign categories.
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element
    // Content sectioning
    "address",
    "article",
    "aside",
    "footer",
    "header",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hgroup",
    "main",
    "nav",
    "section",
    // Text content
    "blockquote",
    "dd",
    "div",
    "dl",
    "dt",
    "figcaption",
    "figure",
    "hr",
    "li",
    "main",
    "ol",
    "p",
    "pre",
    "ul",
    // Inline text semantics
    "a",
    "abbr",
    "b",
    "bdi",
    "bdo",
    "br",
    "cite",
    "code",
    "data",
    "dfn",
    "em",
    "i",
    "kbd",
    "mark",
    "q",
    "rb",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "s",
    "samp",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "time",
    "u",
    "var",
    "wbr",
    // Table content
    "caption",
    "col",
    "colgroup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr"
  ],
  // Tags that cannot be boolean
  // nonBooleanAttributes: [
  //   "abbr",
  //   "accept",
  //   "accept-charset",
  //   "accesskey",
  //   "action",
  //   "allow",
  //   "alt",
  //   "as",
  //   "autocapitalize",
  //   "autocomplete",
  //   "blocking",
  //   "charset",
  //   "cite",
  //   "class",
  //   "color",
  //   "cols",
  //   "colspan",
  //   "content",
  //   "contenteditable",
  //   "coords",
  //   "crossorigin",
  //   "data",
  //   "datetime",
  //   "decoding",
  //   "dir",
  //   "dirname",
  //   "download",
  //   "draggable",
  //   "enctype",
  //   "enterkeyhint",
  //   "fetchpriority",
  //   "for",
  //   "form",
  //   "formaction",
  //   "formenctype",
  //   "formmethod",
  //   "formtarget",
  //   "headers",
  //   "height",
  //   "hidden",
  //   "high",
  //   "href",
  //   "hreflang",
  //   "http-equiv",
  //   "id",
  //   "imagesizes",
  //   "imagesrcset",
  //   "inputmode",
  //   "integrity",
  //   "is",
  //   "itemid",
  //   "itemprop",
  //   "itemref",
  //   "itemtype",
  //   "kind",
  //   "label",
  //   "lang",
  //   "list",
  //   "loading",
  //   "low",
  //   "max",
  //   "maxlength",
  //   "media",
  //   "method",
  //   "min",
  //   "minlength",
  //   "name",
  //   "nonce",
  //   "optimum",
  //   "pattern",
  //   "ping",
  //   "placeholder",
  //   "popover",
  //   "popovertarget",
  //   "popovertargetaction",
  //   "poster",
  //   "preload",
  //   "referrerpolicy",
  //   "rel",
  //   "rows",
  //   "rowspan",
  //   "sandbox",
  //   "scope",
  //   "shape",
  //   "size",
  //   "sizes",
  //   "slot",
  //   "span",
  //   "spellcheck",
  //   "src",
  //   "srcdoc",
  //   "srclang",
  //   "srcset",
  //   "start",
  //   "step",
  //   "style",
  //   "tabindex",
  //   "target",
  //   "title",
  //   "translate",
  //   "type",
  //   "usemap",
  //   "value",
  //   "width",
  //   "wrap",
  //   // Event handlers
  //   "onauxclick",
  //   "onafterprint",
  //   "onbeforematch",
  //   "onbeforeprint",
  //   "onbeforeunload",
  //   "onbeforetoggle",
  //   "onblur",
  //   "oncancel",
  //   "oncanplay",
  //   "oncanplaythrough",
  //   "onchange",
  //   "onclick",
  //   "onclose",
  //   "oncontextlost",
  //   "oncontextmenu",
  //   "oncontextrestored",
  //   "oncopy",
  //   "oncuechange",
  //   "oncut",
  //   "ondblclick",
  //   "ondrag",
  //   "ondragend",
  //   "ondragenter",
  //   "ondragleave",
  //   "ondragover",
  //   "ondragstart",
  //   "ondrop",
  //   "ondurationchange",
  //   "onemptied",
  //   "onended",
  //   "onerror",
  //   "onfocus",
  //   "onformdata",
  //   "onhashchange",
  //   "oninput",
  //   "oninvalid",
  //   "onkeydown",
  //   "onkeypress",
  //   "onkeyup",
  //   "onlanguagechange",
  //   "onload",
  //   "onloadeddata",
  //   "onloadedmetadata",
  //   "onloadstart",
  //   "onmessage",
  //   "onmessageerror",
  //   "onmousedown",
  //   "onmouseenter",
  //   "onmouseleave",
  //   "onmousemove",
  //   "onmouseout",
  //   "onmouseover",
  //   "onmouseup",
  //   "onoffline",
  //   "ononline",
  //   "onpagehide",
  //   "onpageshow",
  //   "onpaste",
  //   "onpause",
  //   "onplay",
  //   "onplaying",
  //   "onpopstate",
  //   "onprogress",
  //   "onratechange",
  //   "onreset",
  //   "onresize",
  //   "onrejectionhandled",
  //   "onscroll",
  //   "onscrollend",
  //   "onsecuritypolicyviolation",
  //   "onseeked",
  //   "onseeking",
  //   "onselect",
  //   "onslotchange",
  //   "onstalled",
  //   "onstorage",
  //   "onsubmit",
  //   "onsuspend",
  //   "ontimeupdate",
  //   "ontoggle",
  //   "onunhandledrejection",
  //   "onunload",
  //   "onvolumechange",
  //   "onwaiting",
  //   "onwheel"
  // ],
  disallowedTagsMode: "discard",
  // allowedAttributes: {
  //   a: ["href", "name", "target"],
  //   // We don't currently allow img itself by default, but
  //   // these attributes would make sense if we did.
  //   img: ["src", "srcset", "alt", "title", "width", "height", "loading"]
  // },
  // Lots of these won't come up by default because we don't allow them
  selfClosing: ["img", "br", "hr", "area", "base", "basefont", "input", "link", "meta"],
  // URL schemes we permit
  allowedSchemes: ["http", "https", "ftp", "mailto", "tel"],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowProtocolRelative: true,
  enforceHtmlBoundary: false,
  parseStyleAttributes: true
};
sanitizeHtml.simpleTransform = function(newTagName, newAttribs, merge) {
  merge = merge === void 0 ? true : merge;
  newAttribs = newAttribs || {};
  return function(tagName, attribs) {
    var attrib;
    if (merge) {
      for (attrib in newAttribs) {
        attribs[attrib] = newAttribs[attrib];
      }
    } else {
      attribs = newAttribs;
    }
    return {
      tagName: newTagName,
      attribs
    };
  };
};
var sanitize = sanitizeHtml_1;
var sanitizeHtmlOptions = {
  // allowedTags: [
  //   "h1",
  //   "h2",
  //   "h3",
  //   "h4",
  //   "h5",
  //   "h6",
  //   "u",
  //   "b",
  //   "i",
  //   "em",
  //   "strong",
  //   "small",
  //   "sup",
  //   "sub",
  //   "div",
  //   "span",
  //   "p",
  //   "article",
  //   "blockquote",
  //   "section",
  //   "details",
  //   "summary",
  //   "pre",
  //   "code",
  //   "ul",
  //   "ol",
  //   "li",
  //   "dd",
  //   "dl",
  //   "table",
  //   "th",
  //   "tr",
  //   "td",
  //   "thead",
  //   "tbody",
  //   "tfood",
  //   "fieldset",
  //   "legend",
  //   "figure",
  //   "figcaption",
  //   "img",
  //   "picture",
  //   "video",
  //   "audio",
  //   "source",
  //   "iframe",
  //   "progress",
  //   "br",
  //   "p",
  //   "hr",
  //   "label",
  //   "abbr",
  //   "a",
  //   "svg",
  // ],
  // allowedAttributes: {
  //   h1: ["id"],
  //   h2: ["id"],
  //   h3: ["id"],
  //   h4: ["id"],
  //   h5: ["id"],
  //   h6: ["id"],
  //   a: ["href", "target", "title"],
  //   abbr: ["title"],
  //   progress: ["value", "max"],
  //   img: ["src", "srcset", "alt", "title","width","height"],
  //   picture: ["media", "srcset"],
  //   video: ["controls", "width", "height", "autoplay", "muted", "loop", "src"],
  //   audio: ["controls", "width", "height", "autoplay", "muted", "loop", "src"],
  //   source: ["src", "srcset", "data-srcset", "type", "media", "sizes"],
  //   iframe: ["src", "frameborder", "height", "width", "scrolling", "allow"],
  //   svg: ["width", "height"]
  //   // sanitize-html does not support svg fully yet
  // },
  // allowedIframeDomains: [
  //   "youtube.com",
  //   "vimeo.com",
  //   "odysee.com",
  //   "soundcloud.com",
  //   "audius.co",
  //   "github.com",
  //   "codepen.com",
  //   "twitter.com",
  //   "facebook.com",
  //   "instagram.com"
  // ],
  disallowedTagsMode: "discard",
  allowVulnerableTags: false,
  parseStyleAttributes: false,
  enforceHtmlBoundary: false
};
var getSanitizeHtmlOptions = () => {
  return clone(sanitizeHtmlOptions);
};
var WS_REGEXP = /^[\s\f\n\r\t\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff\x09\x0a\x0b\x0c\x0d\x20\xa0]+$/;
var stripMultiLinebreaks = (str) => {
  return str.replace(/(\r\n|\n|\u2424){2,}/g, "\n").split("\n").map((line) => {
    return WS_REGEXP.test(line) ? line.trim() : line;
  }).filter((line) => {
    return line.length > 0;
  }).join("\n");
};
var stripMultispaces = (str) => {
  return str.replace(WS_REGEXP, " ").trim();
};
var cleanify = (inputHtml, opts) => {
  var doc = new DOMParser().parseFromString(inputHtml, "text/html");
  var html = doc.documentElement.innerHTML;
  try {
    return pipe((input2) => opts.sanitize ? sanitize(input2, getSanitizeHtmlOptions()) : input2, (input2) => stripMultiLinebreaks(input2), (input2) => stripMultispaces(input2))(html);
  } catch (e) {
    return "";
  }
};
var areArgsValid = (mainString, targetStrings) => {
  return isString(mainString) && isArray(targetStrings) && targetStrings.length > 0 && targetStrings.every((s) => isString(s));
};
var compareTwoStrings = (first, second) => {
  first = first.replace(/\s+/g, "");
  second = second.replace(/\s+/g, "");
  if (first === second)
    return 1;
  if (first.length < 2 || second.length < 2)
    return 0;
  var firstBigrams = /* @__PURE__ */ new Map();
  for (let i = 0; i < first.length - 1; i++) {
    var bigram = first.substring(i, i + 2);
    var count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
    firstBigrams.set(bigram, count);
  }
  var intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    var bigram = second.substring(i, i + 2);
    var count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }
  return 2 * intersectionSize / (first.length + second.length - 2);
};
var findBestMatch = (mainString, targetStrings) => {
  if (!areArgsValid(mainString, targetStrings)) {
    throw new Error("Bad arguments: First argument should be a string, second should be an array of strings");
  }
  var ratings = [];
  var bestMatchIndex = 0;
  for (let i = 0; i < targetStrings.length; i++) {
    var currentTargetString = targetStrings[i];
    var currentRating = compareTwoStrings(mainString, currentTargetString);
    ratings.push({
      target: currentTargetString,
      rating: currentRating
    });
    if (currentRating > ratings[bestMatchIndex].rating) {
      bestMatchIndex = i;
    }
  }
  var bestMatch = ratings[bestMatchIndex];
  return {
    ratings,
    bestMatch,
    bestMatchIndex
  };
};
var isValid = (url = "") => {
  try {
    var ourl = new URL(url);
    return ourl !== null && ourl.protocol.startsWith("http");
  } catch (err) {
    return false;
  }
};
var chooseBestUrl = (candidates = [], title = "") => {
  var ranking = findBestMatch(title, candidates);
  return ranking.bestMatch.target;
};
var absolutify = (fullUrl = "", relativeUrl = "") => {
  try {
    var result2 = new URL(relativeUrl, fullUrl);
    return result2.toString();
  } catch (err) {
    return "";
  }
};
var blacklistKeys = ["CNDID", "__twitter_impression", "_hsenc", "_openstat", "action_object_map", "action_ref_map", "action_type_map", "amp", "fb_action_ids", "fb_action_types", "fb_ref", "fb_source", "fbclid", "ga_campaign", "ga_content", "ga_medium", "ga_place", "ga_source", "ga_term", "gs_l", "hmb_campaign", "hmb_medium", "hmb_source", "mbid", "mc_cid", "mc_eid", "mkt_tok", "referrer", "spJobID", "spMailingID", "spReportId", "spUserID", "utm_brand", "utm_campaign", "utm_cid", "utm_content", "utm_int", "utm_mailing", "utm_medium", "utm_name", "utm_place", "utm_pubreferrer", "utm_reader", "utm_social", "utm_source", "utm_swu", "utm_term", "utm_userid", "utm_viz_id", "wt_mc_o", "yclid", "WT.mc_id", "WT.mc_ev", "WT.srch", "pk_source", "pk_medium", "pk_campaign"];
purify = (url) => {
  try {
    var pureUrl = new URL(url);
    blacklistKeys.forEach((key) => {
      pureUrl.searchParams.delete(key);
    });
    return pureUrl.toString().replace(pureUrl.hash, "");
  } catch (err) {
    return null;
  }
};
var normalize = (html, url) => {
  var doc = new DOMParser().parseFromString(html, "text/html");
  Array.from(doc.getElementsByTagName("a")).forEach((element) => {
    var href = element.getAttribute("href");
    if (href) {
      element.setAttribute("href", absolutify(url, href));
      element.setAttribute("target", "_blank");
    }
  });
  Array.from(doc.getElementsByTagName("img")).forEach((element) => {
    var src = element.getAttribute("data-src") ?? element.getAttribute("src");
    if (src) {
      element.setAttribute("src", absolutify(url, src));
    }
  });
  return Array.from(doc.childNodes).map((element) => element.outerHTML).join("");
};
var getDomain = (url) => {
  var host = new URL(url).host;
  return host.replace("www.", "");
};
var extractMetaData = (html) => {
  var _a2;
  var entry = {
    url: "",
    shortlink: "",
    amphtml: "",
    canonical: "",
    title: "",
    description: "",
    image: "",
    author: "",
    source: "",
    published: "",
    favicon: ""
  };
  var sourceAttrs = ["application-name", "og:site_name", "twitter:site", "dc.title"];
  var urlAttrs = ["og:url", "twitter:url", "parsely-link"];
  var titleAttrs = ["title", "og:title", "twitter:title", "parsely-title"];
  var descriptionAttrs = ["description", "og:description", "twitter:description", "parsely-description"];
  var imageAttrs = ["image", "og:image", "og:image:url", "og:image:secure_url", "twitter:image", "twitter:image:src", "parsely-image-url"];
  var authorAttrs = ["author", "creator", "og:creator", "article:author", "twitter:creator", "dc.creator", "parsely-author"];
  var publishedTimeAttrs = ["article:published_time", "article:modified_time", "og:updated_time", "dc.date", "dc.date.issued", "dc.date.created", "dc:created", "dcterms.date", "datepublished", "datemodified", "updated_time", "modified_time", "published_time", "release_date", "date", "parsely-pub-date"];
  var document2 = new DOMParser().parseFromString(html, "text/html");
  entry.title = (_a2 = document2.querySelector("head > title")) == null ? void 0 : _a2.innerText;
  Array.from(document2.getElementsByTagName("link")).forEach((node2) => {
    var rel = node2.getAttribute("rel");
    var href = node2.getAttribute("href");
    if (rel && href) {
      entry[rel] = href;
      if (rel === "icon" || rel === "shortcut icon") {
        entry.favicon = href;
      }
    }
  });
  Array.from(document2.getElementsByTagName("meta")).forEach((node2) => {
    var _a22, _b2, _c;
    var content = node2.getAttribute("content");
    if (!content) {
      return false;
    }
    var property = ((_a22 = node2.getAttribute("property")) == null ? void 0 : _a22.toLowerCase()) ?? ((_b2 = node2.getAttribute("itemprop")) == null ? void 0 : _b2.toLowerCase());
    var name = (_c = node2.getAttribute("name")) == null ? void 0 : _c.toLowerCase();
    if (sourceAttrs.includes(property) || sourceAttrs.includes(name)) {
      entry.source = content;
    }
    if (urlAttrs.includes(property) || urlAttrs.includes(name)) {
      entry.url = content;
    }
    if (titleAttrs.includes(property) || titleAttrs.includes(name)) {
      entry.title = content;
    }
    if (descriptionAttrs.includes(property) || descriptionAttrs.includes(name)) {
      entry.description = content;
    }
    if (imageAttrs.includes(property) || imageAttrs.includes(name)) {
      entry.image = content;
    }
    if (authorAttrs.includes(property) || authorAttrs.includes(name)) {
      entry.author = content;
    }
    if (publishedTimeAttrs.includes(property) || publishedTimeAttrs.includes(name)) {
      entry.published = content;
    }
  });
  return entry;
};
var ReadabilityExports = {};
var Readability$1 = {
  get exports() {
    return ReadabilityExports;
  },
  set exports(v) {
    ReadabilityExports = v;
  }
};
(function(module) {
  function Readability2(doc, options) {
    if (options && options.documentElement) {
      doc = options;
      options = arguments[2];
    } else if (!doc || !doc.documentElement) {
      throw new Error("First argument to Readability constructor should be a document object.");
    }
    options = options || {};
    this._doc = doc;
    this._docJSDOMParser = this._doc.firstChild.__JSDOMParser__;
    this._articleTitle = null;
    this._articleByline = null;
    this._articleDir = null;
    this._articleSiteName = null;
    this._attempts = [];
    this._debug = !!options.debug;
    this._skipGrabArticle = !!options.skipGrabArticle;
    this._maxElemsToParse = options.maxElemsToParse || this.DEFAULT_MAX_ELEMS_TO_PARSE;
    this._nbTopCandidates = options.nbTopCandidates || this.DEFAULT_N_TOP_CANDIDATES;
    this._charThreshold = options.charThreshold || this.DEFAULT_CHAR_THRESHOLD;
    this._classesToPreserve = this.CLASSES_TO_PRESERVE.concat(options.classesToPreserve || []);
    this._keepClasses = !!options.keepClasses;
    this._serializer = options.serializer || function(el) {
      return el.innerHTML;
    };
    this._disableJSONLD = !!options.disableJSONLD;
    this._allowedVideoRegex = options.allowedVideoRegex || this.REGEXPS.videos;
    this._flags = this.FLAG_STRIP_UNLIKELYS | this.FLAG_WEIGHT_CLASSES | this.FLAG_CLEAN_CONDITIONALLY;
    if (this._debug) {
      var logNode = function(node2) {
        if (node2.nodeType == node2.TEXT_NODE) {
          return `${node2.nodeName} ("${node2.textContent}")`;
        }
        var attrPairs = Array.from(node2.attributes || [], function(attr) {
          return `${attr.name}="${attr.value}"`;
        }).join(" ");
        return `<${node2.localName} ${attrPairs}>`;
      };
      this.log = function() {
        if (typeof console !== "undefined") {
          var args = Array.from(arguments, (arg) => {
            if (arg && arg.nodeType == this.ELEMENT_NODE) {
              return logNode(arg);
            }
            return arg;
          });
          args.unshift("Reader: (Readability)");
          console.debug.apply(console, args);
        } else if (typeof dump !== "undefined") {
          var msg = Array.prototype.map.call(arguments, function(x2) {
            return x2 && x2.nodeName ? logNode(x2) : x2;
          }).join(" ");
          dump("Reader: (Readability) " + msg + "\n");
        }
      };
    } else {
      this.log = function() {
      };
    }
  }
  Readability2.prototype = {
    FLAG_STRIP_UNLIKELYS: 1,
    FLAG_WEIGHT_CLASSES: 2,
    FLAG_CLEAN_CONDITIONALLY: 4,
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    // Max number of nodes supported by this parser. Default: 0 (no limit)
    DEFAULT_MAX_ELEMS_TO_PARSE: 0,
    // The number of top candidates to consider when analysing how
    // tight the competition is among candidates.
    DEFAULT_N_TOP_CANDIDATES: 5,
    // Element tags to score by default.
    DEFAULT_TAGS_TO_SCORE: "section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),
    // The default number of chars an article must have in order to return a result
    DEFAULT_CHAR_THRESHOLD: 500,
    // All of the regular expressions in use within readability.
    // Defined up here so we don't instantiate them repeatedly in loops.
    REGEXPS: {
      // NOTE: These two regular expressions are duplicated in
      // Readability-readerable.js. Please keep both copies in sync.
      unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
      okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
      positive: /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,
      negative: /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,
      extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,
      byline: /byline|author|dateline|writtenby|p-author/i,
      replaceFonts: /<(\/?)font[^>]*>/gi,
      normalize: /\s{2,}/g,
      videos: /\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,
      shareElements: /(\b|_)(share|sharedaddy)(\b|_)/i,
      nextLink: /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,
      prevLink: /(prev|earl|old|new|<|«)/i,
      tokenize: /\W+/g,
      whitespace: /^\s*$/,
      hasContent: /\S$/,
      hashUrl: /^#.+/,
      srcsetUrl: /(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,
      b64DataUrl: /^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,
      // See: https://schema.org/Article
      jsonLdArticleTypes: /^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/
    },
    UNLIKELY_ROLES: ["menu", "menubar", "complementary", "navigation", "alert", "alertdialog", "dialog"],
    DIV_TO_P_ELEMS: /* @__PURE__ */ new Set(["BLOCKQUOTE", "DL", "DIV", "IMG", "OL", "P", "PRE", "TABLE", "UL"]),
    ALTER_TO_DIV_EXCEPTIONS: ["DIV", "ARTICLE", "SECTION", "P"],
    PRESENTATIONAL_ATTRIBUTES: ["align", "background", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "hspace", "rules", "style", "valign", "vspace"],
    DEPRECATED_SIZE_ATTRIBUTE_ELEMS: ["TABLE", "TH", "TD", "HR", "PRE"],
    // The commented out elements qualify as phrasing content but tend to be
    // removed by readability when put into paragraphs, so we ignore them here.
    PHRASING_ELEMS: [
      // "CANVAS", "IFRAME", "SVG", "VIDEO",
      "ABBR",
      "AUDIO",
      "B",
      "BDO",
      "BR",
      "BUTTON",
      "CITE",
      "CODE",
      "DATA",
      "DATALIST",
      "DFN",
      "EM",
      "EMBED",
      "I",
      "IMG",
      "INPUT",
      "KBD",
      "LABEL",
      "MARK",
      "MATH",
      "METER",
      "NOSCRIPT",
      "OBJECT",
      "OUTPUT",
      "PROGRESS",
      "Q",
      "RUBY",
      "SAMP",
      "SCRIPT",
      "SELECT",
      "SMALL",
      "SPAN",
      "STRONG",
      "SUB",
      "SUP",
      "TEXTAREA",
      "TIME",
      "VAR",
      "WBR"
    ],
    // These are the classes that readability sets itself.
    CLASSES_TO_PRESERVE: ["page"],
    // These are the list of HTML entities that need to be escaped.
    HTML_ESCAPE_MAP: {
      "lt": "<",
      "gt": ">",
      "amp": "&",
      "quot": '"',
      "apos": "'"
    },
    /**
     * Run any post-process modifications to article content as necessary.
     *
     * @param Element
     * @return void
    **/
    _postProcessContent: function(articleContent) {
      this._fixRelativeUris(articleContent);
      this._simplifyNestedElements(articleContent);
      if (!this._keepClasses) {
        this._cleanClasses(articleContent);
      }
    },
    /**
     * Iterates over a NodeList, calls `filterFn` for each node and removes node
     * if function returned `true`.
     *
     * If function is not passed, removes all the nodes in node list.
     *
     * @param NodeList nodeList The nodes to operate on
     * @param Function filterFn the function to use as a filter
     * @return void
     */
    _removeNodes: function(nodeList, filterFn) {
      if (this._docJSDOMParser && nodeList._isLiveNodeList) {
        throw new Error("Do not pass live node lists to _removeNodes");
      }
      for (var i = nodeList.length - 1; i >= 0; i--) {
        var node2 = nodeList[i];
        var parentNode = node2.parentNode;
        if (parentNode) {
          if (!filterFn || filterFn.call(this, node2, i, nodeList)) {
            parentNode.removeChild(node2);
          }
        }
      }
    },
    /**
     * Iterates over a NodeList, and calls _setNodeTag for each node.
     *
     * @param NodeList nodeList The nodes to operate on
     * @param String newTagName the new tag name to use
     * @return void
     */
    _replaceNodeTags: function(nodeList, newTagName) {
      if (this._docJSDOMParser && nodeList._isLiveNodeList) {
        throw new Error("Do not pass live node lists to _replaceNodeTags");
      }
      for (var node2 of nodeList) {
        this._setNodeTag(node2, newTagName);
      }
    },
    /**
     * Iterate over a NodeList, which doesn't natively fully implement the Array
     * interface.
     *
     * For convenience, the current object context is applied to the provided
     * iterate function.
     *
     * @param  NodeList nodeList The NodeList.
     * @param  Function fn       The iterate function.
     * @return void
     */
    _forEachNode: function(nodeList, fn) {
      Array.prototype.forEach.call(nodeList, fn, this);
    },
    /**
     * Iterate over a NodeList, and return the first node that passes
     * the supplied test function
     *
     * For convenience, the current object context is applied to the provided
     * test function.
     *
     * @param  NodeList nodeList The NodeList.
     * @param  Function fn       The test function.
     * @return void
     */
    _findNode: function(nodeList, fn) {
      return Array.prototype.find.call(nodeList, fn, this);
    },
    /**
     * Iterate over a NodeList, return true if any of the provided iterate
     * function calls returns true, false otherwise.
     *
     * For convenience, the current object context is applied to the
     * provided iterate function.
     *
     * @param  NodeList nodeList The NodeList.
     * @param  Function fn       The iterate function.
     * @return Boolean
     */
    _someNode: function(nodeList, fn) {
      return Array.prototype.some.call(nodeList, fn, this);
    },
    /**
     * Iterate over a NodeList, return true if all of the provided iterate
     * function calls return true, false otherwise.
     *
     * For convenience, the current object context is applied to the
     * provided iterate function.
     *
     * @param  NodeList nodeList The NodeList.
     * @param  Function fn       The iterate function.
     * @return Boolean
     */
    _everyNode: function(nodeList, fn) {
      return Array.prototype.every.call(nodeList, fn, this);
    },
    /**
     * Concat all nodelists passed as arguments.
     *
     * @return ...NodeList
     * @return Array
     */
    _concatNodeLists: function() {
      var slice = Array.prototype.slice;
      var args = slice.call(arguments);
      var nodeLists = args.map(function(list2) {
        return slice.call(list2);
      });
      return Array.prototype.concat.apply([], nodeLists);
    },
    _getAllNodesWithTag: function(node2, tagNames) {
      if (node2.querySelectorAll) {
        return node2.querySelectorAll(tagNames.join(","));
      }
      return [].concat.apply([], tagNames.map(function(tag) {
        var collection = node2.getElementsByTagName(tag);
        return Array.isArray(collection) ? collection : Array.from(collection);
      }));
    },
    /**
     * Removes the class="" attribute from every element in the given
     * subtree, except those that match CLASSES_TO_PRESERVE and
     * the classesToPreserve array from the options object.
     *
     * @param Element
     * @return void
     */
    _cleanClasses: function(node2) {
      var classesToPreserve = this._classesToPreserve;
      var className = (node2.getAttribute("class") || "").split(/\s+/).filter(function(cls) {
        return classesToPreserve.indexOf(cls) != -1;
      }).join(" ");
      if (className) {
        node2.setAttribute("class", className);
      } else {
        node2.removeAttribute("class");
      }
      for (node2 = node2.firstElementChild; node2; node2 = node2.nextElementSibling) {
        this._cleanClasses(node2);
      }
    },
    /**
     * Converts each <a> and <img> uri in the given element to an absolute URI,
     * ignoring #ref URIs.
     *
     * @param Element
     * @return void
     */
    _fixRelativeUris: function(articleContent) {
      var baseURI = this._doc.baseURI;
      var documentURI = this._doc.documentURI;
      function toAbsoluteURI(uri) {
        if (baseURI == documentURI && uri.charAt(0) == "#") {
          return uri;
        }
        try {
          return new URL(uri, baseURI).href;
        } catch (ex) {
        }
        return uri;
      }
      var links = this._getAllNodesWithTag(articleContent, ["a"]);
      this._forEachNode(links, function(link) {
        var href = link.getAttribute("href");
        if (href) {
          if (href.indexOf("javascript:") === 0) {
            if (link.childNodes.length === 1 && link.childNodes[0].nodeType === this.TEXT_NODE) {
              var text = this._doc.createTextNode(link.textContent);
              link.parentNode.replaceChild(text, link);
            } else {
              var container2 = this._doc.createElement("span");
              while (link.firstChild) {
                container2.appendChild(link.firstChild);
              }
              link.parentNode.replaceChild(container2, link);
            }
          } else {
            link.setAttribute("href", toAbsoluteURI(href));
          }
        }
      });
      var medias = this._getAllNodesWithTag(articleContent, ["img", "picture", "figure", "video", "audio", "source"]);
      this._forEachNode(medias, function(media) {
        var src = media.getAttribute("src");
        var poster = media.getAttribute("poster");
        var srcset = media.getAttribute("srcset");
        if (src) {
          media.setAttribute("src", toAbsoluteURI(src));
        }
        if (poster) {
          media.setAttribute("poster", toAbsoluteURI(poster));
        }
        if (srcset) {
          var newSrcset = srcset.replace(this.REGEXPS.srcsetUrl, function(_, p1, p2, p3) {
            return toAbsoluteURI(p1) + (p2 || "") + p3;
          });
          media.setAttribute("srcset", newSrcset);
        }
      });
    },
    _simplifyNestedElements: function(articleContent) {
      var node2 = articleContent;
      while (node2) {
        if (node2.parentNode && ["DIV", "SECTION"].includes(node2.tagName) && !(node2.id && node2.id.startsWith("readability"))) {
          if (this._isElementWithoutContent(node2)) {
            node2 = this._removeAndGetNext(node2);
            continue;
          } else if (this._hasSingleTagInsideElement(node2, "DIV") || this._hasSingleTagInsideElement(node2, "SECTION")) {
            var child = node2.children[0];
            for (var i = 0; i < node2.attributes.length; i++) {
              child.setAttribute(node2.attributes[i].name, node2.attributes[i].value);
            }
            this.log("SimplifyNestedElements: <" + node2.tagName + "> -> <" + child.tagName + ">", {
              out: child.outerHTML
            });
            node2.parentNode.replaceChild(child, node2);
            node2 = child;
            continue;
          }
        }
        node2 = this._getNextNode(node2);
      }
    },
    /**
     * Get the article title as an H1.
     *
     * @return string
     **/
    _getArticleTitle: function() {
      var doc = this._doc;
      var curTitle = "";
      var origTitle = "";
      try {
        curTitle = origTitle = doc.title.trim();
        if (typeof curTitle !== "string")
          curTitle = origTitle = this._getInnerText(doc.getElementsByTagName("title")[0]);
      } catch (e) {
      }
      var titleHadHierarchicalSeparators = false;
      function wordCount(str) {
        return str.split(/\s+/).length;
      }
      if (/ [\|\-\\\/>»] /.test(curTitle)) {
        titleHadHierarchicalSeparators = / [\\\/>»] /.test(curTitle);
        curTitle = origTitle.replace(/(.*)[\|\-\\\/>»] .*/gi, "$1");
        if (wordCount(curTitle) < 3)
          curTitle = origTitle.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi, "$1");
      } else if (curTitle.indexOf(": ") !== -1) {
        var headings = this._concatNodeLists(doc.getElementsByTagName("h1"), doc.getElementsByTagName("h2"));
        var trimmedTitle = curTitle.trim();
        var match = this._someNode(headings, function(heading) {
          return heading.textContent.trim() === trimmedTitle;
        });
        if (!match) {
          curTitle = origTitle.substring(origTitle.lastIndexOf(":") + 1);
          if (wordCount(curTitle) < 3) {
            curTitle = origTitle.substring(origTitle.indexOf(":") + 1);
          } else if (wordCount(origTitle.substr(0, origTitle.indexOf(":"))) > 5) {
            curTitle = origTitle;
          }
        }
      } else if (curTitle.length > 150 || curTitle.length < 15) {
        var hOnes = doc.getElementsByTagName("h1");
        if (hOnes.length === 1)
          curTitle = this._getInnerText(hOnes[0]);
      }
      curTitle = curTitle.trim().replace(this.REGEXPS.normalize, " ");
      var curTitleWordCount = wordCount(curTitle);
      if (curTitleWordCount <= 4 && (!titleHadHierarchicalSeparators || curTitleWordCount != wordCount(origTitle.replace(/[\|\-\\\/>»]+/g, "")) - 1)) {
        curTitle = origTitle;
      }
      return curTitle;
    },
    /**
     * Prepare the HTML document for readability to scrape it.
     * This includes things like stripping javascript, CSS, and handling terrible markup.
     *
     * @return void
     **/
    _prepDocument: function() {
      var doc = this._doc;
      this._removeNodes(this._getAllNodesWithTag(doc, ["style"]));
      if (doc.body) {
        this._replaceBrs(doc.body);
      }
      this._replaceNodeTags(this._getAllNodesWithTag(doc, ["font"]), "SPAN");
    },
    /**
     * Finds the next node, starting from the given node, and ignoring
     * whitespace in between. If the given node is an element, the same node is
     * returned.
     */
    _nextNode: function(node2) {
      var next = node2;
      while (next && next.nodeType != this.ELEMENT_NODE && this.REGEXPS.whitespace.test(next.textContent)) {
        next = next.nextSibling;
      }
      return next;
    },
    /**
     * Replaces 2 or more successive <br> elements with a single <p>.
     * Whitespace between <br> elements are ignored. For example:
     *   <div>foo<br>bar<br> <br><br>abc</div>
     * will become:
     *   <div>foo<br>bar<p>abc</p></div>
     */
    _replaceBrs: function(elem) {
      this._forEachNode(this._getAllNodesWithTag(elem, ["br"]), function(br) {
        var next = br.nextSibling;
        var replaced = false;
        while ((next = this._nextNode(next)) && next.tagName == "BR") {
          replaced = true;
          var brSibling = next.nextSibling;
          next.parentNode.removeChild(next);
          next = brSibling;
        }
        if (replaced) {
          var p = this._doc.createElement("p");
          br.parentNode.replaceChild(p, br);
          next = p.nextSibling;
          while (next) {
            if (next.tagName == "BR") {
              var nextElem = this._nextNode(next.nextSibling);
              if (nextElem && nextElem.tagName == "BR")
                break;
            }
            if (!this._isPhrasingContent(next))
              break;
            var sibling = next.nextSibling;
            p.appendChild(next);
            next = sibling;
          }
          while (p.lastChild && this._isWhitespace(p.lastChild)) {
            p.removeChild(p.lastChild);
          }
          if (p.parentNode.tagName === "P")
            this._setNodeTag(p.parentNode, "DIV");
        }
      });
    },
    _setNodeTag: function(node2, tag) {
      this.log("_setNodeTag", node2, tag);
      if (this._docJSDOMParser) {
        node2.localName = tag.toLowerCase();
        node2.tagName = tag.toUpperCase();
        return node2;
      }
      var replacement = node2.ownerDocument.createElement(tag);
      while (node2.firstChild) {
        replacement.appendChild(node2.firstChild);
      }
      node2.parentNode.replaceChild(replacement, node2);
      if (node2.readability)
        replacement.readability = node2.readability;
      for (var i = 0; i < node2.attributes.length; i++) {
        try {
          replacement.setAttribute(node2.attributes[i].name, node2.attributes[i].value);
        } catch (ex) {
        }
      }
      return replacement;
    },
    /**
     * Prepare the article node for display. Clean out any inline styles,
     * iframes, forms, strip extraneous <p> tags, etc.
     *
     * @param Element
     * @return void
     **/
    _prepArticle: function(articleContent) {
      this._cleanStyles(articleContent);
      this._clean(articleContent, "footer");
      this._clean(articleContent, "input");
      this._clean(articleContent, "textarea");
      this._clean(articleContent, "select");
      this._cleanHeaders(articleContent);
    },
    /**
     * Initialize a node with the readability object. Also checks the
     * className/id for special names to add to its score.
     *
     * @param Element
     * @return void
    **/
    _initializeNode: function(node2) {
      node2.readability = {
        "contentScore": 0
      };
      switch (node2.tagName) {
        case "DIV":
          node2.readability.contentScore += 5;
          break;
        case "PRE":
        case "TD":
        case "BLOCKQUOTE":
          node2.readability.contentScore += 3;
          break;
        case "ADDRESS":
        case "OL":
        case "UL":
        case "DL":
        case "DD":
        case "DT":
        case "LI":
        case "FORM":
          node2.readability.contentScore -= 3;
          break;
        case "H1":
        case "H2":
        case "H3":
        case "H4":
        case "H5":
        case "H6":
        case "TH":
          node2.readability.contentScore -= 5;
          break;
      }
      node2.readability.contentScore += this._getClassWeight(node2);
    },
    _removeAndGetNext: function(node2) {
      var nextNode = this._getNextNode(node2, true);
      node2.parentNode.removeChild(node2);
      return nextNode;
    },
    /**
     * Traverse the DOM from node to node, starting at the node passed in.
     * Pass true for the second parameter to indicate this node itself
     * (and its kids) are going away, and we want the next node over.
     *
     * Calling this in a loop will traverse the DOM depth-first.
     */
    _getNextNode: function(node2, ignoreSelfAndKids) {
      if (!ignoreSelfAndKids && node2.firstElementChild) {
        return node2.firstElementChild;
      }
      if (node2.nextElementSibling) {
        return node2.nextElementSibling;
      }
      do {
        node2 = node2.parentNode;
      } while (node2 && !node2.nextElementSibling);
      return node2 && node2.nextElementSibling;
    },
    // compares second text to first one
    // 1 = same text, 0 = completely different text
    // works the way that it splits both texts into words and then finds words that are unique in second text
    // the result is given by the lower length of unique parts
    _textSimilarity: function(textA, textB) {
      var tokensA = textA.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
      var tokensB = textB.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
      if (!tokensA.length || !tokensB.length) {
        return 0;
      }
      var uniqTokensB = tokensB.filter((token) => !tokensA.includes(token));
      var distanceB = uniqTokensB.join(" ").length / tokensB.join(" ").length;
      return 1 - distanceB;
    },
    _checkByline: function(node2, matchString) {
      if (this._articleByline) {
        return false;
      }
      if (node2.getAttribute !== void 0) {
        var rel = node2.getAttribute("rel");
        var itemprop = node2.getAttribute("itemprop");
      }
      if ((rel === "author" || itemprop && itemprop.indexOf("author") !== -1 || this.REGEXPS.byline.test(matchString)) && this._isValidByline(node2.textContent)) {
        this._articleByline = node2.textContent.trim();
        return true;
      }
      return false;
    },
    _getNodeAncestors: function(node2, maxDepth) {
      maxDepth = maxDepth || 0;
      var i = 0, ancestors = [];
      while (node2.parentNode) {
        ancestors.push(node2.parentNode);
        if (maxDepth && ++i === maxDepth)
          break;
        node2 = node2.parentNode;
      }
      return ancestors;
    },
    /***
     * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
     *         most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
     *
     * @param page a document to run upon. Needs to be a full document, complete with body.
     * @return Element
    **/
    _grabArticle: function(page) {
      this.log("**** grabArticle ****");
      var doc = this._doc;
      var isPaging = page !== null;
      page = page ? page : this._doc.body;
      if (!page) {
        this.log("No body found in document. Abort.");
        return null;
      }
      var pageCacheHtml = page.innerHTML;
      while (true) {
        this.log("Starting grabArticle loop");
        var stripUnlikelyCandidates = this._flagIsActive(this.FLAG_STRIP_UNLIKELYS);
        var elementsToScore = [];
        var node2 = this._doc.documentElement;
        var shouldRemoveTitleHeader = true;
        while (node2) {
          if (node2.tagName === "HTML") {
            this._articleLang = node2.getAttribute("lang");
          }
          var matchString = node2.className + " " + node2.id;
          if (!this._isProbablyVisible(node2)) {
            this.log("Removing hidden node - " + matchString);
            node2 = this._removeAndGetNext(node2);
            continue;
          }
          if (node2.getAttribute("aria-modal") == "true" && node2.getAttribute("role") == "dialog") {
            node2 = this._removeAndGetNext(node2);
            continue;
          }
          if (this._checkByline(node2, matchString)) {
            node2 = this._removeAndGetNext(node2);
            continue;
          }
          if (shouldRemoveTitleHeader && this._headerDuplicatesTitle(node2)) {
            this.log("Removing header: ", node2.textContent.trim(), this._articleTitle.trim());
            shouldRemoveTitleHeader = false;
            node2 = this._removeAndGetNext(node2);
            continue;
          }
          if (stripUnlikelyCandidates) {
            if (this.REGEXPS.unlikelyCandidates.test(matchString) && !this.REGEXPS.okMaybeItsACandidate.test(matchString) && !this._hasAncestorTag(node2, "table") && !this._hasAncestorTag(node2, "code") && node2.tagName !== "BODY" && node2.tagName !== "A") {
              this.log("Removing unlikely candidate - " + matchString, this.REGEXPS.unlikelyCandidates.test(matchString));
              node2 = this._removeAndGetNext(node2);
              continue;
            }
            if (this.UNLIKELY_ROLES.includes(node2.getAttribute("role"))) {
              this.log("Removing content with role " + node2.getAttribute("role") + " - " + matchString);
              node2 = this._removeAndGetNext(node2);
              continue;
            }
          }
          if ((node2.tagName === "DIV" || node2.tagName === "SECTION" || node2.tagName === "HEADER" || node2.tagName === "H1" || node2.tagName === "H2" || node2.tagName === "H3" || node2.tagName === "H4" || node2.tagName === "H5" || node2.tagName === "H6") && this._isElementWithoutContent(node2)) {
            node2 = this._removeAndGetNext(node2);
            continue;
          }
          if (this.DEFAULT_TAGS_TO_SCORE.indexOf(node2.tagName) !== -1) {
            elementsToScore.push(node2);
          }
          if (node2.tagName === "DIV") {
            var p = null;
            var childNode = node2.firstChild;
            while (childNode) {
              var nextSibling = childNode.nextSibling;
              if (this._isPhrasingContent(childNode)) {
                if (p !== null) {
                  p.appendChild(childNode);
                } else if (!this._isWhitespace(childNode)) {
                  p = doc.createElement("p");
                  node2.replaceChild(p, childNode);
                  p.appendChild(childNode);
                }
              } else if (p !== null) {
                while (p.lastChild && this._isWhitespace(p.lastChild)) {
                  p.removeChild(p.lastChild);
                }
                p = null;
              }
              childNode = nextSibling;
            }
            if (this._hasSingleTagInsideElement(node2, "P") && this._getLinkDensity(node2) < 0.25) {
              var newNode = node2.children[0];
              node2.parentNode.replaceChild(newNode, node2);
              node2 = newNode;
              elementsToScore.push(node2);
            } else if (!this._hasChildBlockElement(node2)) {
              node2 = this._setNodeTag(node2, "P");
              elementsToScore.push(node2);
            }
          }
          node2 = this._getNextNode(node2);
        }
        var candidates = [];
        this._forEachNode(elementsToScore, function(elementToScore) {
          if (!elementToScore.parentNode || typeof elementToScore.parentNode.tagName === "undefined")
            return;
          var innerText2 = this._getInnerText(elementToScore);
          if (innerText2.length < 25)
            return;
          var ancestors2 = this._getNodeAncestors(elementToScore, 5);
          if (ancestors2.length === 0)
            return;
          var contentScore = 0;
          contentScore += 1;
          contentScore += innerText2.split(",").length;
          contentScore += Math.min(Math.floor(innerText2.length / 100), 3);
          this._forEachNode(ancestors2, function(ancestor, level) {
            if (!ancestor.tagName || !ancestor.parentNode || typeof ancestor.parentNode.tagName === "undefined")
              return;
            if (typeof ancestor.readability === "undefined") {
              this._initializeNode(ancestor);
              candidates.push(ancestor);
            }
            if (level === 0)
              var scoreDivider = 1;
            else if (level === 1)
              scoreDivider = 2;
            else
              scoreDivider = level * 3;
            ancestor.readability.contentScore += contentScore / scoreDivider;
          });
        });
        var topCandidates = [];
        for (var c = 0, cl = candidates.length; c < cl; c += 1) {
          var candidate = candidates[c];
          var candidateScore = candidate.readability.contentScore * (1 - this._getLinkDensity(candidate));
          candidate.readability.contentScore = candidateScore;
          this.log("Candidate:", candidate, "with score " + candidateScore);
          for (var t = 0; t < this._nbTopCandidates; t++) {
            var aTopCandidate = topCandidates[t];
            if (!aTopCandidate || candidateScore > aTopCandidate.readability.contentScore) {
              topCandidates.splice(t, 0, candidate);
              if (topCandidates.length > this._nbTopCandidates)
                topCandidates.pop();
              break;
            }
          }
        }
        var topCandidate = topCandidates[0] || null;
        var neededToCreateTopCandidate = false;
        var parentOfTopCandidate;
        if (topCandidate === null || topCandidate.tagName === "BODY") {
          topCandidate = doc.createElement("DIV");
          neededToCreateTopCandidate = true;
          while (page.firstChild) {
            this.log("Moving child out:", page.firstChild);
            topCandidate.appendChild(page.firstChild);
          }
          page.appendChild(topCandidate);
          this._initializeNode(topCandidate);
        } else if (topCandidate) {
          var alternativeCandidateAncestors = [];
          for (var i = 1; i < topCandidates.length; i++) {
            if (topCandidates[i].readability.contentScore / topCandidate.readability.contentScore >= 0.75) {
              alternativeCandidateAncestors.push(this._getNodeAncestors(topCandidates[i]));
            }
          }
          var MINIMUM_TOPCANDIDATES = 3;
          if (alternativeCandidateAncestors.length >= MINIMUM_TOPCANDIDATES) {
            parentOfTopCandidate = topCandidate.parentNode;
            while (parentOfTopCandidate.tagName !== "BODY") {
              var listsContainingThisAncestor = 0;
              for (var ancestorIndex = 0; ancestorIndex < alternativeCandidateAncestors.length && listsContainingThisAncestor < MINIMUM_TOPCANDIDATES; ancestorIndex++) {
                listsContainingThisAncestor += Number(alternativeCandidateAncestors[ancestorIndex].includes(parentOfTopCandidate));
              }
              if (listsContainingThisAncestor >= MINIMUM_TOPCANDIDATES) {
                topCandidate = parentOfTopCandidate;
                break;
              }
              parentOfTopCandidate = parentOfTopCandidate.parentNode;
            }
          }
          if (!topCandidate.readability) {
            this._initializeNode(topCandidate);
          }
          parentOfTopCandidate = topCandidate.parentNode;
          var lastScore = topCandidate.readability.contentScore;
          var scoreThreshold = lastScore / 3;
          while (parentOfTopCandidate.tagName !== "BODY") {
            if (!parentOfTopCandidate.readability) {
              parentOfTopCandidate = parentOfTopCandidate.parentNode;
              continue;
            }
            var parentScore = parentOfTopCandidate.readability.contentScore;
            if (parentScore < scoreThreshold)
              break;
            if (parentScore > lastScore) {
              topCandidate = parentOfTopCandidate;
              break;
            }
            lastScore = parentOfTopCandidate.readability.contentScore;
            parentOfTopCandidate = parentOfTopCandidate.parentNode;
          }
          parentOfTopCandidate = topCandidate.parentNode;
          while (parentOfTopCandidate.tagName != "BODY" && parentOfTopCandidate.children.length == 1) {
            topCandidate = parentOfTopCandidate;
            parentOfTopCandidate = topCandidate.parentNode;
          }
          if (!topCandidate.readability) {
            this._initializeNode(topCandidate);
          }
        }
        var articleContent = doc.createElement("DIV");
        if (isPaging)
          articleContent.id = "readability-content";
        var siblingScoreThreshold = Math.max(10, topCandidate.readability.contentScore * 0.2);
        parentOfTopCandidate = topCandidate.parentNode;
        var siblings = parentOfTopCandidate.children;
        for (var s = 0, sl = siblings.length; s < sl; s++) {
          var sibling = siblings[s];
          var append2 = false;
          this.log("Looking at sibling node:", sibling, sibling.readability ? "with score " + sibling.readability.contentScore : "");
          this.log("Sibling has score", sibling.readability ? sibling.readability.contentScore : "Unknown");
          if (sibling === topCandidate) {
            append2 = true;
          } else {
            var contentBonus = 0;
            if (sibling.className === topCandidate.className && topCandidate.className !== "")
              contentBonus += topCandidate.readability.contentScore * 0.2;
            if (sibling.readability && sibling.readability.contentScore + contentBonus >= siblingScoreThreshold) {
              append2 = true;
            } else if (sibling.nodeName === "P") {
              var linkDensity = this._getLinkDensity(sibling);
              var nodeContent = this._getInnerText(sibling);
              var nodeLength = nodeContent.length;
              if (nodeLength > 80 && linkDensity < 0.25) {
                append2 = true;
              } else if (nodeLength < 80 && nodeLength > 0 && linkDensity === 0 && nodeContent.search(/\.( |$)/) !== -1) {
                append2 = true;
              }
            }
          }
          if (append2) {
            this.log("Appending node:", sibling);
            if (this.ALTER_TO_DIV_EXCEPTIONS.indexOf(sibling.nodeName) === -1) {
              this.log("Altering sibling:", sibling, "to div.");
              sibling = this._setNodeTag(sibling, "DIV");
            }
            articleContent.appendChild(sibling);
            siblings = parentOfTopCandidate.children;
            s -= 1;
            sl -= 1;
          }
        }
        if (this._debug)
          this.log("Article content pre-prep: " + articleContent.innerHTML);
        this._prepArticle(articleContent);
        if (this._debug)
          this.log("Article content post-prep: " + articleContent.innerHTML);
        if (neededToCreateTopCandidate) {
          topCandidate.id = "readability-page-1";
          topCandidate.className = "page";
        } else {
          var div = doc.createElement("DIV");
          div.id = "readability-page-1";
          div.className = "page";
          while (articleContent.firstChild) {
            div.appendChild(articleContent.firstChild);
          }
          articleContent.appendChild(div);
        }
        if (this._debug)
          this.log("Article content after paging: " + articleContent.innerHTML);
        var parseSuccessful = true;
        var textLength = this._getInnerText(articleContent, true).length;
        if (textLength < this._charThreshold) {
          parseSuccessful = false;
          page.innerHTML = pageCacheHtml;
          if (this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) {
            this._removeFlag(this.FLAG_STRIP_UNLIKELYS);
            this._attempts.push({
              articleContent,
              textLength
            });
          } else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
            this._removeFlag(this.FLAG_WEIGHT_CLASSES);
            this._attempts.push({
              articleContent,
              textLength
            });
          } else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
            this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY);
            this._attempts.push({
              articleContent,
              textLength
            });
          } else {
            this._attempts.push({
              articleContent,
              textLength
            });
            this._attempts.sort(function(a, b) {
              return b.textLength - a.textLength;
            });
            if (!this._attempts[0].textLength) {
              return null;
            }
            articleContent = this._attempts[0].articleContent;
            parseSuccessful = true;
          }
        }
        if (parseSuccessful) {
          var ancestors = [parentOfTopCandidate, topCandidate].concat(this._getNodeAncestors(parentOfTopCandidate));
          this._someNode(ancestors, function(ancestor) {
            if (!ancestor.tagName)
              return false;
            var articleDir = ancestor.getAttribute("dir");
            if (articleDir) {
              this._articleDir = articleDir;
              return true;
            }
            return false;
          });
          return articleContent;
        }
      }
    },
    /**
     * Check whether the input string could be a byline.
     * This verifies that the input is a string, and that the length
     * is less than 100 chars.
     *
     * @param possibleByline {string} - a string to check whether its a byline.
     * @return Boolean - whether the input string is a byline.
     */
    _isValidByline: function(byline) {
      if (typeof byline == "string" || byline instanceof String) {
        byline = byline.trim();
        return byline.length > 0 && byline.length < 100;
      }
      return false;
    },
    /**
     * Converts some of the common HTML entities in string to their corresponding characters.
     *
     * @param str {string} - a string to unescape.
     * @return string without HTML entity.
     */
    _unescapeHtmlEntities: function(str) {
      if (!str) {
        return str;
      }
      var htmlEscapeMap = this.HTML_ESCAPE_MAP;
      return str.replace(/&(quot|amp|apos|lt|gt);/g, function(_, tag) {
        return htmlEscapeMap[tag];
      }).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi, function(_, hex, numStr) {
        var num = parseInt(hex || numStr, hex ? 16 : 10);
        return String.fromCharCode(num);
      });
    },
    /**
     * Try to extract metadata from JSON-LD object.
     * For now, only Schema.org objects of type Article or its subtypes are supported.
     * @return Object with any metadata that could be extracted (possibly none)
     */
    _getJSONLD: function(doc) {
      var scripts = this._getAllNodesWithTag(doc, ["script"]);
      var metadata;
      this._forEachNode(scripts, function(jsonLdElement) {
        if (!metadata && jsonLdElement.getAttribute("type") === "application/ld+json") {
          try {
            var content = jsonLdElement.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, "");
            var parsed = JSON.parse(content);
            if (!parsed["@context"] || !parsed["@context"].match(/^https?\:\/\/schema\.org$/)) {
              return;
            }
            if (!parsed["@type"] && Array.isArray(parsed["@graph"])) {
              parsed = parsed["@graph"].find(function(it) {
                return (it["@type"] || "").match(this.REGEXPS.jsonLdArticleTypes);
              });
            }
            if (!parsed || !parsed["@type"] || !parsed["@type"].match(this.REGEXPS.jsonLdArticleTypes)) {
              return;
            }
            metadata = {};
            if (typeof parsed.name === "string" && typeof parsed.headline === "string" && parsed.name !== parsed.headline) {
              var title = this._getArticleTitle();
              var nameMatches = this._textSimilarity(parsed.name, title) > 0.75;
              var headlineMatches = this._textSimilarity(parsed.headline, title) > 0.75;
              if (headlineMatches && !nameMatches) {
                metadata.title = parsed.headline;
              } else {
                metadata.title = parsed.name;
              }
            } else if (typeof parsed.name === "string") {
              metadata.title = parsed.name.trim();
            } else if (typeof parsed.headline === "string") {
              metadata.title = parsed.headline.trim();
            }
            if (parsed.author) {
              if (typeof parsed.author.name === "string") {
                metadata.byline = parsed.author.name.trim();
              } else if (Array.isArray(parsed.author) && parsed.author[0] && typeof parsed.author[0].name === "string") {
                metadata.byline = parsed.author.filter(function(author) {
                  return author && typeof author.name === "string";
                }).map(function(author) {
                  return author.name.trim();
                }).join(", ");
              }
            }
            if (typeof parsed.description === "string") {
              metadata.excerpt = parsed.description.trim();
            }
            if (parsed.publisher && typeof parsed.publisher.name === "string") {
              metadata.siteName = parsed.publisher.name.trim();
            }
            return;
          } catch (err) {
            this.log(err.message);
          }
        }
      });
      return metadata ? metadata : {};
    },
    /**
     * Attempts to get excerpt and byline metadata for the article.
     *
     * @param {Object} jsonld — object containing any metadata that
     * could be extracted from JSON-LD object.
     *
     * @return Object with optional "excerpt" and "byline" properties
     */
    _getArticleMetadata: function(jsonld) {
      var metadata = {};
      var values = {};
      var metaElements = this._doc.getElementsByTagName("meta");
      var propertyPattern = /\s*(dc|dcterm|og|twitter)\s*:\s*(author|creator|description|title|site_name)\s*/gi;
      var namePattern = /^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title|site_name)\s*$/i;
      this._forEachNode(metaElements, function(element) {
        var elementName = element.getAttribute("name");
        var elementProperty = element.getAttribute("property");
        var content = element.getAttribute("content");
        if (!content) {
          return;
        }
        var matches = null;
        var name = null;
        if (elementProperty) {
          matches = elementProperty.match(propertyPattern);
          if (matches) {
            name = matches[0].toLowerCase().replace(/\s/g, "");
            values[name] = content.trim();
          }
        }
        if (!matches && elementName && namePattern.test(elementName)) {
          name = elementName;
          if (content) {
            name = name.toLowerCase().replace(/\s/g, "").replace(/\./g, ":");
            values[name] = content.trim();
          }
        }
      });
      metadata.title = jsonld.title || values["dc:title"] || values["dcterm:title"] || values["og:title"] || values["weibo:article:title"] || values["weibo:webpage:title"] || values["title"] || values["twitter:title"];
      if (!metadata.title) {
        metadata.title = this._getArticleTitle();
      }
      metadata.byline = jsonld.byline || values["dc:creator"] || values["dcterm:creator"] || values["author"];
      metadata.excerpt = jsonld.excerpt || values["dc:description"] || values["dcterm:description"] || values["og:description"] || values["weibo:article:description"] || values["weibo:webpage:description"] || values["description"] || values["twitter:description"];
      metadata.siteName = jsonld.siteName || values["og:site_name"];
      metadata.title = this._unescapeHtmlEntities(metadata.title);
      metadata.byline = this._unescapeHtmlEntities(metadata.byline);
      metadata.excerpt = this._unescapeHtmlEntities(metadata.excerpt);
      metadata.siteName = this._unescapeHtmlEntities(metadata.siteName);
      return metadata;
    },
    /**
     * Check if node is image, or if node contains exactly only one image
     * whether as a direct child or as its descendants.
     *
     * @param Element
    **/
    _isSingleImage: function(node2) {
      if (node2.tagName === "IMG") {
        return true;
      }
      if (node2.children.length !== 1 || node2.textContent.trim() !== "") {
        return false;
      }
      return this._isSingleImage(node2.children[0]);
    },
    /**
     * Find all <noscript> that are located after <img> nodes, and which contain only one
     * <img> element. Replace the first image with the image from inside the <noscript> tag,
     * and remove the <noscript> tag. This improves the quality of the images we use on
     * some sites (e.g. Medium).
     *
     * @param Element
    **/
    _unwrapNoscriptImages: function(doc) {
      var imgs = Array.from(doc.getElementsByTagName("img"));
      this._forEachNode(imgs, function(img) {
        for (var i = 0; i < img.attributes.length; i++) {
          var attr = img.attributes[i];
          switch (attr.name) {
            case "src":
            case "srcset":
            case "data-src":
            case "data-srcset":
              return;
          }
          if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
            return;
          }
        }
        img.parentNode.removeChild(img);
      });
      var noscripts = Array.from(doc.getElementsByTagName("noscript"));
      this._forEachNode(noscripts, function(noscript) {
        var tmp = doc.createElement("div");
        tmp.innerHTML = noscript.innerHTML;
        if (!this._isSingleImage(tmp)) {
          return;
        }
        var prevElement = noscript.previousElementSibling;
        if (prevElement && this._isSingleImage(prevElement)) {
          var prevImg = prevElement;
          if (prevImg.tagName !== "IMG") {
            prevImg = prevElement.getElementsByTagName("img")[0];
          }
          var newImg = tmp.getElementsByTagName("img")[0];
          for (var i = 0; i < prevImg.attributes.length; i++) {
            var attr = prevImg.attributes[i];
            if (attr.value === "") {
              continue;
            }
            if (attr.name === "src" || attr.name === "srcset" || /\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
              if (newImg.getAttribute(attr.name) === attr.value) {
                continue;
              }
              var attrName = attr.name;
              if (newImg.hasAttribute(attrName)) {
                attrName = "data-old-" + attrName;
              }
              newImg.setAttribute(attrName, attr.value);
            }
          }
          noscript.parentNode.replaceChild(tmp.firstElementChild, prevElement);
        }
      });
    },
    /**
     * Removes script tags from the document.
     *
     * @param Element
    **/
    _removeScripts: function(doc) {
      this._removeNodes(this._getAllNodesWithTag(doc, ["script", "noscript"]));
    },
    /**
     * Check if this node has only whitespace and a single element with given tag
     * Returns false if the DIV node contains non-empty text nodes
     * or if it contains no element with given tag or more than 1 element.
     *
     * @param Element
     * @param string tag of child element
    **/
    _hasSingleTagInsideElement: function(element, tag) {
      if (element.children.length != 1 || element.children[0].tagName !== tag) {
        return false;
      }
      return !this._someNode(element.childNodes, function(node2) {
        return node2.nodeType === this.TEXT_NODE && this.REGEXPS.hasContent.test(node2.textContent);
      });
    },
    _isElementWithoutContent: function(node2) {
      return node2.nodeType === this.ELEMENT_NODE && node2.textContent.trim().length == 0 && (node2.children.length == 0 || node2.children.length == node2.getElementsByTagName("br").length + node2.getElementsByTagName("hr").length);
    },
    /**
     * Determine whether element has any children block level elements.
     *
     * @param Element
     */
    _hasChildBlockElement: function(element) {
      return this._someNode(element.childNodes, function(node2) {
        return this.DIV_TO_P_ELEMS.has(node2.tagName) || this._hasChildBlockElement(node2);
      });
    },
    /***
     * Determine if a node qualifies as phrasing content.
     * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
    **/
    _isPhrasingContent: function(node2) {
      return node2.nodeType === this.TEXT_NODE || this.PHRASING_ELEMS.indexOf(node2.tagName) !== -1 || (node2.tagName === "A" || node2.tagName === "DEL" || node2.tagName === "INS") && this._everyNode(node2.childNodes, this._isPhrasingContent);
    },
    _isWhitespace: function(node2) {
      return node2.nodeType === this.TEXT_NODE && node2.textContent.trim().length === 0 || node2.nodeType === this.ELEMENT_NODE && node2.tagName === "BR";
    },
    /**
     * Get the inner text of a node - cross browser compatibly.
     * This also strips out any excess whitespace to be found.
     *
     * @param Element
     * @param Boolean normalizeSpaces (default: true)
     * @return string
    **/
    _getInnerText: function(e, normalizeSpaces) {
      normalizeSpaces = typeof normalizeSpaces === "undefined" ? true : normalizeSpaces;
      var textContent2 = e.textContent.trim();
      if (normalizeSpaces) {
        return textContent2.replace(this.REGEXPS.normalize, " ");
      }
      return textContent2;
    },
    /**
     * Get the number of times a string s appears in the node e.
     *
     * @param Element
     * @param string - what to split on. Default is ","
     * @return number (integer)
    **/
    _getCharCount: function(e, s) {
      s = s || ",";
      return this._getInnerText(e).split(s).length - 1;
    },
    /**
     * Remove the style attribute on every e and under.
     * TODO: Test if getElementsByTagName(*) is faster.
     *
     * @param Element
     * @return void
    **/
    _cleanStyles: function(e) {
      if (!e || e.tagName.toLowerCase() === "svg")
        return;
      for (var i = 0; i < this.PRESENTATIONAL_ATTRIBUTES.length; i++) {
        e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[i]);
      }
      if (this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName) !== -1) {
        e.removeAttribute("width");
        e.removeAttribute("height");
      }
      var cur = e.firstElementChild;
      while (cur !== null) {
        this._cleanStyles(cur);
        cur = cur.nextElementSibling;
      }
    },
    /**
     * Get the density of links as a percentage of the content
     * This is the amount of text that is inside a link divided by the total text in the node.
     *
     * @param Element
     * @return number (float)
    **/
    _getLinkDensity: function(element) {
      var textLength = this._getInnerText(element).length;
      if (textLength === 0)
        return 0;
      var linkLength = 0;
      this._forEachNode(element.getElementsByTagName("a"), function(linkNode) {
        var href = linkNode.getAttribute("href");
        var coefficient = href && this.REGEXPS.hashUrl.test(href) ? 0.3 : 1;
        linkLength += this._getInnerText(linkNode).length * coefficient;
      });
      return linkLength / textLength;
    },
    /**
     * Get an elements class/id weight. Uses regular expressions to tell if this
     * element looks good or bad.
     *
     * @param Element
     * @return number (Integer)
    **/
    _getClassWeight: function(e) {
      if (!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))
        return 0;
      var weight = 0;
      if (typeof e.className === "string" && e.className !== "") {
        if (this.REGEXPS.negative.test(e.className))
          weight -= 25;
        if (this.REGEXPS.positive.test(e.className))
          weight += 25;
      }
      if (typeof e.id === "string" && e.id !== "") {
        if (this.REGEXPS.negative.test(e.id))
          weight -= 25;
        if (this.REGEXPS.positive.test(e.id))
          weight += 25;
      }
      return weight;
    },
    /**
     * Clean a node of all elements of type "tag".
     * (Unless it's a youtube/vimeo video. People love movies.)
     *
     * @param Element
     * @param string tag to clean
     * @return void
     **/
    _clean: function(e, tag) {
      var isEmbed = ["object", "embed", "iframe"].indexOf(tag) !== -1;
      this._removeNodes(this._getAllNodesWithTag(e, [tag]), function(element) {
        if (isEmbed) {
          for (var i = 0; i < element.attributes.length; i++) {
            if (this._allowedVideoRegex.test(element.attributes[i].value)) {
              return false;
            }
          }
          if (element.tagName === "object" && this._allowedVideoRegex.test(element.innerHTML)) {
            return false;
          }
        }
        return true;
      });
    },
    /**
     * Check if a given node has one of its ancestor tag name matching the
     * provided one.
     * @param  HTMLElement node
     * @param  String      tagName
     * @param  Number      maxDepth
     * @param  Function    filterFn a filter to invoke to determine whether this node 'counts'
     * @return Boolean
     */
    _hasAncestorTag: function(node2, tagName, maxDepth, filterFn) {
      maxDepth = maxDepth || 3;
      tagName = tagName.toUpperCase();
      var depth = 0;
      while (node2.parentNode) {
        if (maxDepth > 0 && depth > maxDepth)
          return false;
        if (node2.parentNode.tagName === tagName && (!filterFn || filterFn(node2.parentNode)))
          return true;
        node2 = node2.parentNode;
        depth++;
      }
      return false;
    },
    /**
     * Return an object indicating how many rows and columns this table has.
     */
    _getRowAndColumnCount: function(table) {
      var rows = 0;
      var columns = 0;
      var trs = table.getElementsByTagName("tr");
      for (var i = 0; i < trs.length; i++) {
        var rowspan = trs[i].getAttribute("rowspan") || 0;
        if (rowspan) {
          rowspan = parseInt(rowspan, 10);
        }
        rows += rowspan || 1;
        var columnsInThisRow = 0;
        var cells = trs[i].getElementsByTagName("td");
        for (var j = 0; j < cells.length; j++) {
          var colspan = cells[j].getAttribute("colspan") || 0;
          if (colspan) {
            colspan = parseInt(colspan, 10);
          }
          columnsInThisRow += colspan || 1;
        }
        columns = Math.max(columns, columnsInThisRow);
      }
      return {
        rows,
        columns
      };
    },
    /**
     * Look for 'data' (as opposed to 'layout') tables, for which we use
     * similar checks as
     * https://searchfox.org/mozilla-central/rev/f82d5c549f046cb64ce5602bfd894b7ae807c8f8/accessible/generic/TableAccessible.cpp#19
     */
    _markDataTables: function(root2) {
      var tables = root2.getElementsByTagName("table");
      for (var i = 0; i < tables.length; i++) {
        var table = tables[i];
        var role = table.getAttribute("role");
        if (role == "presentation") {
          table._readabilityDataTable = false;
          continue;
        }
        var datatable = table.getAttribute("datatable");
        if (datatable == "0") {
          table._readabilityDataTable = false;
          continue;
        }
        var summary = table.getAttribute("summary");
        if (summary) {
          table._readabilityDataTable = true;
          continue;
        }
        var caption = table.getElementsByTagName("caption")[0];
        if (caption && caption.childNodes.length > 0) {
          table._readabilityDataTable = true;
          continue;
        }
        var dataTableDescendants = ["col", "colgroup", "tfoot", "thead", "th"];
        var descendantExists = function(tag) {
          return !!table.getElementsByTagName(tag)[0];
        };
        if (dataTableDescendants.some(descendantExists)) {
          this.log("Data table because found data-y descendant");
          table._readabilityDataTable = true;
          continue;
        }
        if (table.getElementsByTagName("table")[0]) {
          table._readabilityDataTable = false;
          continue;
        }
        var sizeInfo = this._getRowAndColumnCount(table);
        if (sizeInfo.rows >= 10 || sizeInfo.columns > 4) {
          table._readabilityDataTable = true;
          continue;
        }
        table._readabilityDataTable = sizeInfo.rows * sizeInfo.columns > 10;
      }
    },
    /* convert images and figures that have properties like data-src into images that can be loaded without JS */
    _fixLazyImages: function(root2) {
      this._forEachNode(this._getAllNodesWithTag(root2, ["img", "picture", "figure"]), function(elem) {
        if (elem.src && this.REGEXPS.b64DataUrl.test(elem.src)) {
          var parts = this.REGEXPS.b64DataUrl.exec(elem.src);
          if (parts[1] === "image/svg+xml") {
            return;
          }
          var srcCouldBeRemoved = false;
          for (var i = 0; i < elem.attributes.length; i++) {
            var attr = elem.attributes[i];
            if (attr.name === "src") {
              continue;
            }
            if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
              srcCouldBeRemoved = true;
              break;
            }
          }
          if (srcCouldBeRemoved) {
            var b64starts = elem.src.search(/base64\s*/i) + 7;
            var b64length = elem.src.length - b64starts;
            if (b64length < 133) {
              elem.removeAttribute("src");
            }
          }
        }
        if ((elem.src || elem.srcset && elem.srcset != "null") && elem.className.toLowerCase().indexOf("lazy") === -1) {
          return;
        }
        for (var j = 0; j < elem.attributes.length; j++) {
          attr = elem.attributes[j];
          if (attr.name === "src" || attr.name === "srcset" || attr.name === "alt") {
            continue;
          }
          var copyTo = null;
          if (/\.(jpg|jpeg|png|webp)\s+\d/.test(attr.value)) {
            copyTo = "srcset";
          } else if (/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(attr.value)) {
            copyTo = "src";
          }
          if (copyTo) {
            if (elem.tagName === "IMG" || elem.tagName === "PICTURE") {
              elem.setAttribute(copyTo, attr.value);
            } else if (elem.tagName === "FIGURE" && !this._getAllNodesWithTag(elem, ["img", "picture"]).length) {
              var img = this._doc.createElement("img");
              img.setAttribute(copyTo, attr.value);
              elem.appendChild(img);
            }
          }
        }
      });
    },
    _getTextDensity: function(e, tags) {
      var textLength = this._getInnerText(e, true).length;
      if (textLength === 0) {
        return 0;
      }
      var childrenLength = 0;
      var children = this._getAllNodesWithTag(e, tags);
      this._forEachNode(children, (child) => childrenLength += this._getInnerText(child, true).length);
      return childrenLength / textLength;
    },
    /**
     * Clean an element of all tags of type "tag" if they look fishy.
     * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
     *
     * @return void
     **/
    _cleanConditionally: function(e, tag) {
      if (!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))
        return;
      this._removeNodes(this._getAllNodesWithTag(e, [tag]), function(node2) {
        var isDataTable = function(t) {
          return t._readabilityDataTable;
        };
        var isList = tag === "ul" || tag === "ol";
        if (!isList) {
          var listLength = 0;
          var listNodes = this._getAllNodesWithTag(node2, ["ul", "ol"]);
          this._forEachNode(listNodes, (list2) => listLength += this._getInnerText(list2).length);
          isList = listLength / this._getInnerText(node2).length > 0.9;
        }
        if (tag === "table" && isDataTable(node2)) {
          return false;
        }
        if (this._hasAncestorTag(node2, "table", -1, isDataTable)) {
          return false;
        }
        if (this._hasAncestorTag(node2, "code")) {
          return false;
        }
        var weight = this._getClassWeight(node2);
        this.log("Cleaning Conditionally", node2);
        var contentScore = 0;
        if (weight + contentScore < 0) {
          return true;
        }
        if (this._getCharCount(node2, ",") < 10) {
          var p = node2.getElementsByTagName("p").length;
          var img = node2.getElementsByTagName("img").length;
          var li = node2.getElementsByTagName("li").length - 100;
          var input2 = node2.getElementsByTagName("input").length;
          var headingDensity = this._getTextDensity(node2, ["h1", "h2", "h3", "h4", "h5", "h6"]);
          var embedCount = 0;
          var embeds = this._getAllNodesWithTag(node2, ["object", "embed", "iframe"]);
          for (var i = 0; i < embeds.length; i++) {
            for (var j = 0; j < embeds[i].attributes.length; j++) {
              if (this._allowedVideoRegex.test(embeds[i].attributes[j].value)) {
                return false;
              }
            }
            if (embeds[i].tagName === "object" && this._allowedVideoRegex.test(embeds[i].innerHTML)) {
              return false;
            }
            embedCount++;
          }
          var linkDensity = this._getLinkDensity(node2);
          var contentLength = this._getInnerText(node2).length;
          var haveToRemove = img > 1 && p / img < 0.5 && !this._hasAncestorTag(node2, "figure") || !isList && li > p || input2 > Math.floor(p / 3) || !isList && headingDensity < 0.9 && contentLength < 25 && (img === 0 || img > 2) && !this._hasAncestorTag(node2, "figure") || !isList && weight < 25 && linkDensity > 0.2 || weight >= 25 && linkDensity > 0.5 || embedCount === 1 && contentLength < 75 || embedCount > 1;
          if (isList && haveToRemove) {
            for (var x2 = 0; x2 < node2.children.length; x2++) {
              var child = node2.children[x2];
              if (child.children.length > 1) {
                return haveToRemove;
              }
            }
            var li_count = node2.getElementsByTagName("li").length;
            if (img == li_count) {
              return false;
            }
          }
          return haveToRemove;
        }
        return false;
      });
    },
    /**
     * Clean out elements that match the specified conditions
     *
     * @param Element
     * @param Function determines whether a node should be removed
     * @return void
     **/
    _cleanMatchedNodes: function(e, filter2) {
      var endOfSearchMarkerNode = this._getNextNode(e, true);
      var next = this._getNextNode(e);
      while (next && next != endOfSearchMarkerNode) {
        if (filter2.call(this, next, next.className + " " + next.id)) {
          next = this._removeAndGetNext(next);
        } else {
          next = this._getNextNode(next);
        }
      }
    },
    /**
     * Clean out spurious headers from an Element.
     *
     * @param Element
     * @return void
    **/
    _cleanHeaders: function(e) {
      var headingNodes = this._getAllNodesWithTag(e, ["h1", "h2"]);
      this._removeNodes(headingNodes, function(node2) {
        var shouldRemove = this._getClassWeight(node2) < 0;
        if (shouldRemove) {
          this.log("Removing header with low class weight:", node2);
        }
        return shouldRemove;
      });
    },
    /**
     * Check if this node is an H1 or H2 element whose content is mostly
     * the same as the article title.
     *
     * @param Element  the node to check.
     * @return boolean indicating whether this is a title-like header.
     */
    _headerDuplicatesTitle: function(node2) {
      if (node2.tagName != "H1" && node2.tagName != "H2") {
        return false;
      }
      var heading = this._getInnerText(node2, false);
      this.log("Evaluating similarity of header:", heading, this._articleTitle);
      return this._textSimilarity(this._articleTitle, heading) > 0.75;
    },
    _flagIsActive: function(flag) {
      return (this._flags & flag) > 0;
    },
    _removeFlag: function(flag) {
      this._flags = this._flags & ~flag;
    },
    _isProbablyVisible: function(node2) {
      return (!node2.style || node2.style.display != "none") && !node2.hasAttribute("hidden") && (!node2.hasAttribute("aria-hidden") || node2.getAttribute("aria-hidden") != "true" || node2.className && node2.className.indexOf && node2.className.indexOf("fallback-image") !== -1);
    },
    /**
     * Runs readability.
     *
     * Workflow:
     *  1. Prep the document by removing script tags, css, etc.
     *  2. Build readability's DOM tree.
     *  3. Grab the article content from the current dom tree.
     *  4. Replace the current DOM tree with the new one.
     *  5. Read peacefully.
     *
     * @return void
     **/
    parse: function() {
      if (this._maxElemsToParse > 0) {
        var numTags = this._doc.getElementsByTagName("*").length;
        if (numTags > this._maxElemsToParse) {
          throw new Error("Aborting parsing document; " + numTags + " elements found");
        }
      }
      this._unwrapNoscriptImages(this._doc);
      var jsonLd = this._disableJSONLD ? {} : this._getJSONLD(this._doc);
      this._removeScripts(this._doc);
      this._prepDocument();
      var metadata = this._getArticleMetadata(jsonLd);
      this._articleTitle = metadata.title;
      var articleContent = this._skipGrabArticle ? this._doc.body : this._grabArticle();
      if (!articleContent)
        return null;
      this.log("Grabbed: " + articleContent.innerHTML);
      this._postProcessContent(articleContent);
      if (!metadata.excerpt) {
        var paragraphs = articleContent.getElementsByTagName("p");
        if (paragraphs.length > 0) {
          metadata.excerpt = paragraphs[0].textContent.trim();
        }
      }
      var textContent2 = articleContent.textContent;
      return {
        title: this._articleTitle,
        byline: metadata.byline || this._articleByline,
        dir: this._articleDir,
        lang: this._articleLang,
        content: this._serializer(articleContent),
        textContent: textContent2,
        length: textContent2.length,
        excerpt: metadata.excerpt,
        siteName: metadata.siteName || this._articleSiteName
      };
    }
  };
  {
    module.exports = Readability2;
  }
})(Readability$1);
var ReadabilityReaderableExports = {};
var ReadabilityReaderable = {
  get exports() {
    return ReadabilityReaderableExports;
  },
  set exports(v) {
    ReadabilityReaderableExports = v;
  }
};
(function(module) {
  var REGEXPS = {
    // NOTE: These two regular expressions are duplicated in
    // Readability.js. Please keep both copies in sync.
    unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
    okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i
  };
  function isNodeVisible(node2) {
    return (!node2.style || node2.style.display != "none") && !node2.hasAttribute("hidden") && (!node2.hasAttribute("aria-hidden") || node2.getAttribute("aria-hidden") != "true" || node2.className && node2.className.indexOf && node2.className.indexOf("fallback-image") !== -1);
  }
  function isProbablyReaderable2(doc, options = {}) {
    if (typeof options == "function") {
      options = {
        visibilityChecker: options
      };
    }
    var defaultOptions = {
      minScore: 20,
      minContentLength: 140,
      visibilityChecker: isNodeVisible
    };
    options = Object.assign(defaultOptions, options);
    var nodes = doc.querySelectorAll("p, pre, article");
    var brNodes = doc.querySelectorAll("div > br");
    if (brNodes.length) {
      var set = new Set(nodes);
      [].forEach.call(brNodes, function(node2) {
        set.add(node2.parentNode);
      });
      nodes = Array.from(set);
    }
    var score = 0;
    return [].some.call(nodes, function(node2) {
      if (!options.visibilityChecker(node2)) {
        return false;
      }
      var matchString = node2.className + " " + node2.id;
      if (REGEXPS.unlikelyCandidates.test(matchString) && !REGEXPS.okMaybeItsACandidate.test(matchString)) {
        return false;
      }
      if (node2.matches("li p")) {
        return false;
      }
      var textContentLength = node2.textContent.trim().length;
      if (textContentLength < options.minContentLength) {
        return false;
      }
      score += Math.sqrt(textContentLength - options.minContentLength);
      if (score > options.minScore) {
        return true;
      }
      return false;
    });
  }
  {
    module.exports = isProbablyReaderable2;
  }
})(ReadabilityReaderable);
var Readability = ReadabilityExports;
var isProbablyReaderable = ReadabilityReaderableExports;
var readability = {
  Readability,
  isProbablyReaderable
};
var extractWithReadability = (html, url = "") => {
  let out;
  try {
    if (!isString(html)) {
      return null;
    }
    var doc = new DOMParser().parseFromString(html, "text/html");
    var base = doc.createElement("base");
    base.setAttribute("href", url);
    doc.head.appendChild(base);
    var reader;
    const readableZone = isAKnownSite(doc) && doc.querySelector(getReadableZone());
    if (readableZone) {
      const subdoc = new DOMParser().parseFromString(readableZone.outerHTML, "text/html");
      reader = new readability.Readability(subdoc, {
        keepClasses: true,
        maxElemsToParse: 0,
        // debug:true,
        skipGrabArticle: true
      });
    } else {
      reader = new readability.Readability(doc, {
        keepClasses: true
        // debug:true
      });
    }
    var result2 = reader.parse() ?? {};
    out = result2.textContent ? result2.content : null;
  } catch (e) {
  }
  return out;
};
function extractTitleWithReadability(html) {
  if (!isString(html)) {
    return null;
  }
  var doc = new DOMParser().parseFromString(html, "text/html");
  var reader = new readability.Readability(doc);
  return reader._getArticleTitle() || null;
}
var transformations = [];
var findTransformations = (links) => {
  var urls = !isArray(links) ? [links] : links;
  var tfms = [];
  for (var transformation of transformations) {
    var {
      patterns
    } = transformation;
    var matched = urls.some((url) => patterns.some((pattern) => pattern.test(url)));
    if (matched) {
      tfms.push(clone(transformation));
    }
  }
  return tfms;
};
var execPreParser = (html, links) => {
  var doc = new DOMParser().parseFromString(html, "text/html");
  findTransformations(links).map((tfm) => tfm.pre).filter((fn) => isFunction(fn)).map((fn) => fn(doc));
  preEnrichHtml(doc);
  return Array.from(doc.childNodes).map((it) => it.outerHTML).join("");
};
var execPostParser = (html, links) => {
  var doc = new DOMParser().parseFromString(html, "text/html");
  findTransformations(links).map((tfm) => tfm.post).filter((fn) => isFunction(fn)).map((fn) => fn(doc));
  postEnrichHtml(doc);
  return Array.from(doc.childNodes).map((it) => it.outerHTML).join("");
};
var getTimeToRead = (text, wordsPerMinute) => {
  var words = text.trim().split(/\s+/g).length;
  var minToRead = words / wordsPerMinute;
  var secToRead = Math.ceil(minToRead * 60);
  return secToRead;
};
var summarize = (desc, txt, threshold, maxlen) => {
  return desc.length > threshold ? desc : truncate(txt, maxlen).replace(/\n/g, " ");
};
var parseFromHtml = async (inputHtml, inputUrl = "", parserOptions = {}) => {
  var html = inputHtml;
  var meta = extractMetaData(html);
  var title = meta.title;
  var {
    url,
    shortlink,
    amphtml,
    canonical,
    description: metaDesc,
    image: metaImg,
    author,
    published,
    favicon: metaFav
  } = meta;
  var {
    wordsPerMinute = 300,
    descriptionTruncateLen = 210,
    descriptionLengthThreshold = 180,
    contentLengthThreshold = 200
  } = parserOptions;
  if (!title) {
    title = extractTitleWithReadability(html) ?? inputUrl;
  }
  if (!title) {
    return null;
  }
  var links = unique([url, shortlink, amphtml, canonical, inputUrl].filter(isValid).map(purify));
  if (!links.length) {
    return null;
  }
  var bestUrl = links.length == 0 ? null : chooseBestUrl(links, title);
  var fns = pipe((input2) => {
    const out = normalize(input2, bestUrl);
    return out;
  }, (input2) => {
    const out = execPreParser(input2, links);
    return out;
  }, (input2) => {
    const out = extractWithReadability(input2, bestUrl);
    return out;
  }, (input2) => {
    const out = input2 ? execPostParser(input2, links) : null;
    return out;
  }, (input2) => {
    const out = input2 ? cleanify(input2, {
      sanitize: false
    }) : null;
    return out;
  });
  var content = fns(html);
  if (!content) {
    return null;
  }
  var textContent2 = stripTags(content);
  if (textContent2.length < contentLengthThreshold) {
    return null;
  }
  var description = summarize(metaDesc, textContent2, descriptionLengthThreshold, descriptionTruncateLen);
  var image = metaImg ? absolutify(bestUrl, metaImg) : "";
  var favicon = metaFav ? absolutify(bestUrl, metaFav) : "";
  return {
    url: bestUrl,
    title,
    description,
    links,
    image,
    content,
    author,
    favicon,
    source: getDomain(bestUrl),
    published,
    ttr: getTimeToRead(textContent2, wordsPerMinute)
  };
};
function preEnrichHtml(doc) {
  var images = [...doc.querySelectorAll("img")];
  images.forEach((img) => {
    try {
      const mirrorNode = window.document.querySelector(cssPath(img));
      if (!mirrorNode)
        return;
      var {
        width,
        height
      } = mirrorNode.getBoundingClientRect();
      img.setAttribute("width", width);
      img.setAttribute("height", height);
    } catch (e) {
    }
  });
}
function postEnrichHtml(doc) {
  var svgs = [...doc.querySelectorAll("svg")];
  svgs.forEach((svg) => {
    svg.remove();
  });
}
var cssPath = function(el) {
  var path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    var selector = el.nodeName.toLowerCase();
    var sib = el, nth = 1;
    while (sib = sib.previousElementSibling) {
      if (sib.nodeName.toLowerCase() == selector)
        nth++;
    }
    if (nth != 1)
      selector += ":nth-of-type(" + nth + ")";
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
};
function done(data) {
  var props = {
    asyncId,
    type: "asyncExec",
    ...data
  };
  return new Promise((resolve2) => {
    chrome.runtime.sendMessage(props, function(response) {
      console.log("async exec response:", response);
      resolve2(response);
    });
  });
}
async function parseFromPdf() {
  return {
    url: window.location.href,
    // favicon?: string;
    // author?: string;
    content: `<div><a href="${window.location.href}">${window.location.href}</a></div>`,
    contentText: window.location.href
    // source?: string;
    // published?: string;
    // ttr?: number;
  };
}
async function scanWebpage() {
  if (window.location.href.endsWith(".pdf")) {
    const r2 = await parseFromPdf();
    return r2;
  }
  const r = await parseFromHtml(document.documentElement.outerHTML, window.location.href);
  return r || {};
}
scanWebpage().then(done);
