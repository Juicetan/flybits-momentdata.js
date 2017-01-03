// @author Justin Lam
// @version master:e2ee368
;(function(undefined) {

/**
 * ES6 Promise object.
 * @external Promise
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise|Promise API}
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects|Promise spec}
 */

/**
 * Core Flybits model found in the Flybits.js SDK.
 * @external ZoneMomentInstance
 */

/**
 * This is the root namespace for the Flybits Moment Data library.  If included in a browser environment it will be accessible from the `window` object.
 * @namespace
 */
var Fmd = {
  init: {},
  util: {},
};

//defaults
Fmd.cfg = {
  coreMoments: {
    "com.flybits.moments.gallery": "Gallery",
    "com.flybits.moments.website": "Website",
    "com.flybits.moments.jsonBuilder": "AdvancedObjectBuilder",
    "com.flybits.moments.jsonbuilder": "AdvancedObjectBuilder",
    "com.flybits.moments.youtube": "YouTube",
    "com.flybits.moments.users": "Users",
    "com.flybits.moments.user": "Users",
    "com.flybits.moments.twitter": "Twitter",
    "com.flybits.moments.text": "Text",
    "com.flybits.moments.speedial": "SpeedDial",
    "com.flybits.moments.poll": "Poll",
    "com.flybits.moments.location": "Location",
    "com.flybits.moments.nativeapp": "NativeApp",
    "com.flybits.moments.event": "Events",
    "com.flybits.moments.schedule": "Schedule"
  }
};

Fmd.VERSION = "master:e2ee368";

/**
 *
 * @memberof Fmd
 * @function use
 * @param {external:ZoneMomentInstance} flybitsZMIObj ZoneMomentInstance model for which Moment content is to be consumed.
 * @returns {BaseController} Controller for Moment content consumption associated with supplied {@link external:ZoneMomentInstance}.
 * @returns {undefined} `undefined` if supplied {@link external:ZoneMomentInstance} is not supported by library.
 */
Fmd.use = function(flybitsZMIObj){
  if(!(flybitsZMIObj instanceof Flybits.ZoneMomentInstance)){
    throw new Fmd.Validation().addError('Invalid Argument','Must use valid Flybits.ZoneMomentInstance object',{
      context: 'flybitsZMIObj',
      code: Fmd.Validation.type.INVALIDARG
    });
  }
  if(!flybitsZMIObj.moment){
    throw new Fmd.Validation().addError('Malformed Argument','Flybits.ZoneMomentInstance object moment property not found',{
      context: 'flybitsZMIObj.moment',
      code: Fmd.Validation.type.MALFORMED
    });
  }

  var pkg = flybitsZMIObj.moment.androidPkg || flybitsZMIObj.moment.iosPkg;
  var Controller = Fmd[Fmd.cfg.coreMoments[pkg]];
  return Controller? new Controller(flybitsZMIObj):undefined;
};

var initBrowserFileConfig = function(url){
  var def = new Fmd.Deferred();

  fetch(url).then(function(resp){
    if(resp.status !== 200){
      throw new Fmd.Validation().addError("Configuration file not found","Reverting to default configuration. No configuration found at:"+url,{
        code: Fmd.Validation.type.INVALIDARG,
        context: 'url'
      });
    }
    return resp.json();
  }).then(function(json){
    Fmd.util.Obj.extend(Fmd.cfg,json);
    def.resolve(Fmd.cfg);
  }).catch(function(ex){
    if(ex instanceof Fmd.Validation){
      def.reject(ex);
    } else{
      def.reject(new Fmd.Validation().addError("Failed to read configuration file.","Reverting to default configuration. Configuration format incorrect at:"+url,{
        code: Fmd.Validation.type.MALFORMED,
        context: 'url'
      }));
    }
  });

  return def.promise;
};

var initServerFileConfig = function(filePath){
  if(!filePath){
    console.log('> config file path not provided: using defaults');
    return false;
  }

  try{
    var data = fs.readFileSync(filePath);
  } catch(e){
    throw new Error("Config file read failed: "+filePath);
  }
  try{
    Fmd.util.Obj.extend(Fmd.cfg,JSON.parse(data));
  } catch(e){
    throw new Error("Malformed Config file: "+filePath);
  }
};

Fmd.init.server = function(configFileURL){
  initServerFileConfig(configFileURL);
};

Fmd.init.browser = function(configFileURL){
  return initBrowserFileConfig(configFileURL);
};

Fmd.initObj = function(configObj){
  Fmd.util.Obj.extend(Fmd.cfg,configObj);
};

Fmd.util.Api = (function(){
  var api = {
    checkResult: function(resp){
      if(resp.status >= 200 && resp.status < 300){
        return resp;
      }
      throw resp;
    },
    getResultStr: function(resp){
      return resp && resp.text?resp.text():new Promise(function(resolve,reject){
        resolve("");
      });
    },
    getResultJSON: function(resp){
      return resp.json();
    },
    toURLParams: function(obj){
      var keys = Object.keys(obj);
      var keyLength = keys.length;
      var str = "";
      while(keyLength--){
        var key = keys[keyLength];
        if(str !== ""){
          str += "&";
        }
        str += key + "=" + encodeURIComponent(obj[key]);
      }

      return str;
    },
    htmlEncode:function(value){
      /*global encodeURIComponent*/
      return encodeURIComponent(value);
    },
    htmlDecode:function(str){
      return str.replace(/&#?(\w+);/g, function(match, dec) {
        if(isNaN(dec)) {
          chars = {quot: 34, amp: 38, lt: 60, gt: 62, nbsp: 160, copy: 169, reg: 174, deg: 176, frasl: 47, trade: 8482, euro: 8364, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, permil: 8240, lsaquo: 8249, rsaquo: 8250, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830, oline: 8254, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, hellip: 133, ndash: 150, mdash: 151, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, brkbar: 166, sect: 167, uml: 168, die: 168, ordf: 170, laquo: 171, not: 172, shy: 173, macr: 175, hibar: 175, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Alpha: 913, alpha: 945, Beta: 914, beta: 946, Gamma: 915, gamma: 947, Delta: 916, delta: 948, Epsilon: 917, epsilon: 949, Zeta: 918, zeta: 950, Eta: 919, eta: 951, Theta: 920, theta: 952, Iota: 921, iota: 953, Kappa: 922, kappa: 954, Lambda: 923, lambda: 955, Mu: 924, mu: 956, Nu: 925, nu: 957, Xi: 926, xi: 958, Omicron: 927, omicron: 959, Pi: 928, pi: 960, Rho: 929, rho: 961, Sigma: 931, sigma: 963, Tau: 932, tau: 964, Upsilon: 933, upsilon: 965, Phi: 934, phi: 966, Chi: 935, chi: 967, Psi: 936, psi: 968, Omega: 937, omega: 969}
          if (chars[dec] !== undefined){
            dec = chars[dec];
          }
        }
        return String.fromCharCode(dec);
      });
    },
    parseResponse: function(rawResponse){
      return JSON.parse(rawResponse,function(key,val){
        if(typeof val === "string"){
          return api.htmlDecode(val);
        }
        return val;
      });
    },
    parseErrorMsg: function(rawResponse){
      try{
        var resp = this.parseResponse(rawResponse);
      } catch(e){
        return "Malformed server response";
      }
      var msg = null;

      if(resp){
        return resp.messageJSON || resp.exceptionMessage || resp.message || "Unexpected error has occurred";
      }

      return msg;
    },
    parsePaging: function(jsonResp){
      return {
        offset: jsonResp.pagination.offset,
        limit: jsonResp.pagination.limit,
        total: jsonResp.pagination.totalRecords
      };
    },
    createNextPageCall: function(requestFunction,reqParams,paging){
      if(paging.offset + paging.limit >= paging.total){
        return null;
      }

      return function(){
        reqParams.paging = {
          limit: paging.limit,
          offset: paging.offset + paging.limit
        };
        return requestFunction(reqParams);
      };
    }
  };

  return api;
})();

Fmd.util.Obj = (function(){
  var obj = {
    extend: function(destination,source){
      if(typeof $ === 'function' && typeof $.extend === 'function'){
        return $.extend(true,destination,source);
      }
      if(typeof _ === 'function' && typeof _.extend === 'function'){
        return _.extend(destination,source);
      }

      for (var property in source) {
        if (source[property] && source[property].constructor &&
            source[property].constructor === Object) {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
        } else {
          destination[property] = source[property];
        }
      }
      return destination;
    },
    guid:function(){
      var s4 = function(){
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
      };

      return 'j' + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
    },
  };

  return obj;
})();

/**
 * @classdesc A helper class for ES6 Promises which allows for deferred asynchronous task management.  Not all asynchronous operations can be wrapped in a promise callback.  Sometimes the resolution of a promise needs to be deferred for another entity to resolve or reject, hence the paradigm of the deferred `Object`.
 * @class
 * @memberof Fmd
 */
Fmd.Deferred = (function(){
  Promise.settle = function(promisesArr){
    var reflectedArr = promisesArr.map(function(promise){
      return promise.then(function(successResult){
        return {
          result: successResult,
          status: 'resolved'
        };
      },function(errorResult){
        return {
          result: errorResult,
          status: 'rejected'
        };
      });
    });
    return Promise.all(reflectedArr);
  };

  var Deferred = function(){
    var def = this;
    /**
     * @instance
     * @memberof Flybits.Deferred
     * @member {external:Promise} promise Instance of an ES6 Promise to be fulfilled.
     */
    this.promise = new Promise(function(resolve,reject){
      /**
       * @instance
       * @memberof Flybits.Deferred
       * @member {function} resolve Callback to be invoked when the asychronous task that initiated the promise is successfully completed.
       */
      def.resolve = resolve;
      /**
       * @instance
       * @memberof Flybits.Deferred
       * @member {function} reject Callback to be invoked when the asychronous task that initiated the promise has failed to complete successfully.
       */
      def.reject = reject;
    });

    this.then = this.promise.then.bind(this.promise);
    this.catch = this.promise.catch.bind(this.promise);
  };

  return Deferred;
})();

/**
 * @classdesc Standard class used across the library to indicate the state of an asynchronous validation event or error.  It is comprised of a `state` which indicates the result of an operation and also an `errors` array should the `state` be `false`.  This class is often used as the error object returned from API operations and also as the result of model based validation which can incur multiple errors at once.
 * @class
 * @memberof Fmd
 */
Fmd.Validation = (function(){
  /**
   * @typedef ValidationError
   * @memberof Fmd.Validation
   * @type Object
   * @property {string} header Generally a short and broad error message
   * @property {string} message A more in depth explanation of the error.
   * @property {string} context This is populated if an error occurs that relates to one of the input properties of an operation and will be the property's key.
   * @property {number} code An internal error code indicating error type. This property is only populated when errors that can be discerned by the library occur. Errors that occur server side and cannot be discerned by the library will populate an HTTP status code in the `serverCode` property.  For instance, if you forget to supply required property the `code` property would be populated with `Fmd.Validation.type.MISSINGARG`.  On the other hand if there's a server outage, the `serverCode` would be populated with a 404 or 500.
   * @property {number} serverCode This is populated with an HTTP status code when a server side error occurs that cannot be discerned by the library.
   */

  var Validation = function(){
    /**
     * @instance
     * @memberof Fmd.Validation
     * @member {boolean} state Indicates the resultant state of an asynchronous task.
     */
    this.state = true;
    /**
     * @instance
     * @memberof Fmd.Validation
     * @member {Fmd.Validation.ValidationError[]} errors An array of errors that have accumulated because of an asynchronous task.
     */
    this.errors = [];
  };

  /**
   * @memberof Fmd.Validation
   * @member {Object} type A mapping of library error codes.
   * @constant
   * @property {number} MALFORMED This error is usually thrown when an input property supplied to an library operation is incorrectly formatted, or sometimes a server response is not recognized by the library.
   * @property {number} INVALIDARG This error is thrown when an input property supplied to an library operation is semantically incorrect.
   * @property {number} MISSINGARG This error is thrown when a required property is not supplied to an library operation.
   * @property {number} NOTFOUND Usually thrown when model retrieval has yielded no results with provided input parameters.
   * @property {number} CONNECTIONERROR Error thrown when the library loses connection to particular resources.
   * @property {number} UNAUTHENTICATED Error is thrown when library operation requires authentication and current session is not found or expired.
   * @property {number} RETRIEVALERROR This error is thrown when any retrieval library operation fails to complete.
   * @property {number} NOTSUPPORTED Error is thrown when an operation or entity is not supported by the library.
   */
  Validation.prototype.type = Validation.type = {};
  Validation.prototype.type.MALFORMED = Validation.type.MALFORMED = 1000;
  Validation.prototype.type.INVALIDARG = Validation.type.INVALIDARG = 1001;
  Validation.prototype.type.MISSINGARG = Validation.type.MISSINGARG = 1002;
  Validation.prototype.type.NOTFOUND = Validation.type.NOTFOUND = 1003;
  Validation.prototype.type.CONNECTIONERROR = Validation.type.CONNECTIONERROR = 1004;
  Validation.prototype.type.UNAUTHENTICATED = Validation.type.UNAUTHENTICATED = 1005;
  Validation.prototype.type.RETRIEVALERROR = Validation.type.RETRIEVALERROR = 1006;
  Validation.prototype.type.NOTSUPPORTED = Validation.type.NOTSUPPORTED = 1007;

  Validation.prototype = {
    /**
     * Used to add error objects to the `Validation` instance.
     * @function
     * @instance
     * @memberof Fmd.Validation
     * @param {string} header Generally a short and broad error message
     * @param {string} message A more in depth explanation of the error.
     * @param {Object} detailsObj Optional extra details about the error.
     * @param {string} detailsObj.context This is populated if an error occurs that relates to one of the input properties of an operation and will be the property's key.
     * @param {number} detailsObj.code An internal error code indicating error type. This property is only populated when errors that can be discerned by the library occur. Errors that occur server side and cannot be discerned by the library will populate an HTTP status code in the `serverCode` property.  For instance, if you forget to supply required property the `code` property would be populated with `Fmd.Validation.type.MISSINGARG`.  On the other hand if there's a server outage, the `serverCode` would be populated with a 404 or 500.
     * @param {number} detailsObj.serverCode This is populated with an HTTP status code when a server side error occurs that cannot be discerned by the library.
     * @return {Fmd.Validation} The `Validation` instance the method has been invoked upon to allow for method chaining.
     */
    addError: function(header,message,detailsObj){
      this.state = false;
      var retObj = {
        header: header,
        message: message
      };
      if(detailsObj){
        retObj.context = detailsObj.context;
        retObj.code = detailsObj.code;
        retObj.serverCode = detailsObj.serverCode
      }
      this.errors.push(retObj);

      return this;
    },
    /**
     * Used to retrieve the first available error if available.
     * @function
     * @instance
     * @memberof Fmd.Validation
     * @return {Fmd.Validation.ValidationError} First available error if validation state is `false` and errors have been found.
     * @return {null} `null` if no errors are available.
     */
    firstError: function(){
      if(this.errors.length > 0){
        return this.errors[0];
      }
      return null;
    }
  };

  return Validation;
})();

/**
 * @classdesc Abstract Base controller from which all other Moment controllers will extend.
 * @class
 * @abstract
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
var BaseController = (function(){
  var Deferred = Fmd.Deferred;
  var ApiUtil = Fmd.util.Api;
  var Validation = Fmd.Validation;

  var BaseController = function(zmi){
    if(this.constructor.name === 'Object'){
      throw new Error('Abstract classes cannot be instantiated');
    }

    /**
     * @instance
     * @memberof BaseController
     * @member {external:ZoneMomentInstance} zmi Core ZoneMomentInstance model for which this controller will act as an API wrapper for.
     */
    this.zmi = zmi;
    /**
     * @instance
     * @memberof BaseController
     * @member {string} host Moment API base path.
     */
    this.host = zmi.moment.clientURL;
    /**
     * @instance
     * @memberof BaseController
     * @member {string} type Registered Moment unique key name to indicate type.
     */
    this.type = zmi.moment.androidPkg || zmi.moment.iosPkg;
    /**
     * @instance
     * @memberof BaseController
     * @member {boolean} isValidated Flag to indicate whether or not a valid session has been established between library and Moment server.
     */
    this.isValidated = false;
  };

  BaseController.prototype = {
    /**
     * Resource mapping of Moment API endpoints
     * @namespace BaseController.res {Object}
     * @constant
     * @property {string} VALIDATE Standard conventional endpoint in all Moment APIs to allow for session establishment with an authorization claim from Flybits core.
     */
    res:{
      VALIDATE: '/validate'
    },
    /**
     * Convenience function that retrieves Moment content from `ZoneMomentInstance` supplied to main {@link Fmd.use|factory method}.  This function performs the validation and data retrieval all together.
     * @memberof BaseController
     * @function getData
     * @instance
     * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with Moment content obtained from `ZoneMomentInstance`. Promise rejects with possible errors.
     */
    getData: function(){
      var con = this;

      if(!this.isValidated){
        var def = new Deferred();
        this.validate().then(function(){
          con.isValidated = true;
          return con.getMainData();
        }).then(function(resp){
          def.resolve(resp);
        }).catch(function(e){
          def.reject(e);
        });
        return def.promise;
      }

      return this.getMainData();
    },
    /**
     * Establishes an authorized session between library and Moment server.  Should never have to call this function directly as {@link BaseController.getData} will do this automatically.
     * @memberof BaseController
     * @function validate
     * @instance
     * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with raw Moment validation response. Promise rejects with errors that caused authorization to fail.
     */
    validate: function(){
      var def = new Deferred();
      var url = this.host + this.res.VALIDATE;

      this.zmi.getAccessToken().then(function(token){
        url += "?signature="+token;
        return fetch(url,{
          method: 'GET',
          credentials: 'include'
        });
      }).then(ApiUtil.checkResult).then(function(resp){
        def.resolve(resp);
      }).catch(function(resp){
        ApiUtil.getResultStr(resp).then(function(resultStr){
          def.reject(new Validation().addError('Authorization failed.',resultStr,{
            serverCode: resp.status
          }));
        });
      });

      return def.promise;
    },
    /**
     * Actual function that retrieves data directly from Moment, children of this class will override this function to meet their custom API endpoints.  Should never have to call this function directly as {@link BaseController.getData} will do this automatically.
     * @abstract
     * @memberof BaseController
     * @function getMainData
     * @instance
     * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with raw Moment data. Promise rejects with errors that might have occurred.
     */
  };

  return BaseController;
})();

/**
 * @classdesc 
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.AdvancedObjectBuilder = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var AOBController = function(zmi){
    BaseController.call(this,zmi);
  };

  AOBController.prototype = Object.create(BaseController.prototype);
  AOBController.prototype.constructor = AOBController;
  AOBController.prototype.res = AOBController.res = ObjUtil.extend({
    JSON: '/KeyValuePairs/AsMetadata'
  },BaseController.prototype.res);

  var isEmpty = function(obj){
    var notEmpty = false;
    var jsonStr = JSON.stringify(obj);

    JSON.parse(jsonStr,function(key,val){
      if(key !== "" && (typeof val) !== 'object'){
        notEmpty = notEmpty || (val && val !== "");
      }
    });

    return !notEmpty;
  };

  var sanitizeMeta = function(data){
    if(data.templateId){
      data.structureKey = data.templateId;
      delete data.templateId;
    }
    if(data.localizedKeyValuePairs){
      data.localization = {};
      var localeKeys = Object.keys(data.localizedKeyValuePairs);
      var numKeys = localeKeys.length;
      while(numKeys--){
        var curKey = localeKeys[numKeys];
        var curObj = data.localizedKeyValuePairs[curKey];
        if(curObj && curObj.root && !isEmpty(curObj.root)){
          data.localization[curKey] = curObj.root;
        }
      }
      delete data.localizedKeyValuePairs;
    }
    return data;
  };

  AOBController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.JSON;

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Object retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return AOBController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Events = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var EventsController = function(zmi){
    BaseController.call(this,zmi);
  };

  EventsController.prototype = Object.create(BaseController.prototype);
  EventsController.prototype.constructor = EventsController;
  EventsController.prototype.res = EventsController.res = ObjUtil.extend({
    EVENTS: '/events'
  },BaseController.prototype.res);

  var remapShareMsgs = function(obj){
    var localeKeys = Object.keys(obj.locales);
    var localeKeyCount = localeKeys.length;
    var firstLocale = obj.locales['en']?obj.locales['en']:obj.locales[localeKeys[0]];
    obj.shareMessages = {
      facebook: firstLocale.facebookShareMessage,
      instagram: firstLocale.instagramShareMessage,
      linkedin: firstLocale.linkedInShareMessage,
      twitter: firstLocale.twitterShareMessage
    };
    delete obj.facebookShareMessage;
    delete obj.instagramShareMessage;
    delete obj.linkedInShareMessage;
    delete obj.twitterShareMessage;
    while(localeKeyCount--){
      var curLocale = obj.locales[localeKeys[localeKeyCount]];
      delete curLocale.facebookShareMessage;
      delete curLocale.instagramShareMessage;
      delete curLocale.linkedInShareMessage;
      delete curLocale.twitterShareMessage;
    }

    return obj;
  };

  var remapGalleryMeta = function(obj){
    var localeKeys = Object.keys(obj.locales);
    var localeKeyCount = localeKeys.length;
    var firstLocale = obj.locales['en']?obj.locales['en']:obj.locales[localeKeys[0]];
    obj.galleryTitle = firstLocale.galleryTitle;
    obj.galleryDescription = firstLocale.galleryDescription;
    while(localeKeyCount--){
      var curLocale = obj.locales[localeKeys[localeKeyCount]];
      delete curLocale.galleryTitle;
      delete curLocale.galleryDescription;
      delete curLocale.title;
    }
  };

  var sanitizeMeta = function(data){
    var retObj = {
      events:[]
    };

    if(data.length > 0){
      retObj.events = data.map(function(obj){
        remapShareMsgs(obj);
        remapGalleryMeta(obj);
        obj.images = obj.images.map(function(img){
          img = remapShareMsgs(img);
          var localeKeys = Object.keys(img.locales);
          img = ObjUtil.extend(img,img.locales[localeKeys[0]]);
          delete img.locales;
          delete img.locale;
          delete img.fileExtension;
          delete img.fileName;
          return img;
        });
        obj.videos = obj.videos.map(function(vid){
          vid = remapShareMsgs(vid);
          var localeKeys = Object.keys(vid.locales);
          vid = ObjUtil.extend(vid,vid.locales[localeKeys[0]]);
          delete vid.locales;
          delete vid.locale;
          delete vid.fileExtension;
          delete vid.fileName;
          return vid;
        });
        delete obj.eventName;
        delete obj.description;
        delete obj.title;
        delete obj.location;
        delete obj.phoneNumber;

        return obj;
      });
    }

    return retObj;
  };

  EventsController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.EVENTS;

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Events retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return EventsController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Gallery = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var GalleryController = function(zmi){
    BaseController.call(this,zmi);
  };

  GalleryController.prototype = Object.create(BaseController.prototype);
  GalleryController.prototype.constructor = GalleryController;
  GalleryController.prototype.res = GalleryController.res = ObjUtil.extend({
    GALLERIES: '/Galleries',
    COMMENTS: '/Comments',
    FILES: '/FileEntity'
  },BaseController.prototype.res);

  var sanitizeMeta = function(data){
    delete data.momentId;
    delete data.momentInstanceId;
    delete data.zoneMomentInstanceId;
    delete data.serviceId;
    data.id = data.galleryId;
    delete data.galleryId;
    data.images = data.fileEntities.map(function(img){
      delete img.momentId;
      delete img.momentInstanceId;
      delete img.zoneMomentInstanceId;
      delete img.isApproved;
      delete img.fileName;
      delete img.fileType;
      img.id = img.fileId;
      delete img.fileId;
      return img;
    });
    delete data.fileEntities;

    return data;
  };

  var sanitizeComments = function(data){
    return {
      comments: data.comments
    };
  };

  GalleryController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.GALLERIES + "?getAll=false&isApproved=true";

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Gallery retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };
  
  /**
   * Retrieves user submitted comments on an image.
   * @memberof Fmd.Gallery
   * @function getImageComments
   * @instance
   * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with image comments. Promise rejects with errors if image retrieval fails.  Perhaps when session between the client and Moment server.
   */
  GalleryController.prototype.getImageComments = function(imgID){
    var def = new Deferred();
    var url = this.host + this.res.COMMENTS + '/' + imgID + '?top=1000&isApproved=true';

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeComments(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Gallery image comments retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };

  /**
   * Initiates image upload from file to gallery.
   * @memberof Fmd.Gallery
   * @function uploadImageFromFile
   * @instance
   * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with successfully uploaded image URL. Promise rejects with errors if image upload fails or if user has decided not to select a file.
   */
  GalleryController.prototype.uploadImageFromFile = function(onFileChange){
    var def = new Deferred();
    var url = this.host + this.res.FILES;

    allUpload({
      targetURL: url,
      fileParamName: 'data',
      acceptStr: 'image/*',
      onfilechange: function(filepath){
        if(!filepath){
          onFileChange();
          def.reject(new Validation().addError('File not selected','',{
            code: Validation.type.MISSINGARG,
            context: 'data'
          }));
        } else{
          onFileChange(filepath);
        }
      }
    }).then(function(resp){
      var url = resp.querySelector('FileURL').innerHTML;
      def.resolve(url);
    }).catch(function(e){
      def.reject(new Validation().addError('Image upload failed.',e));
    });

    return def.promise;
  };


  return GalleryController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Location = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var LocationController = function(zmi){
    BaseController.call(this,zmi);
  };

  LocationController.prototype = Object.create(BaseController.prototype);
  LocationController.prototype.constructor = LocationController;
  LocationController.prototype.res = LocationController.res = ObjUtil.extend({
    LOCATION: '/locationbits'
  },BaseController.prototype.res);

  LocationController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.LOCATION + "?alllocales=true";

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Locations retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return LocationController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.NativeApp = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var NativeAppController = function(zmi){
    BaseController.call(this,zmi);
  };

  NativeAppController.prototype = Object.create(BaseController.prototype);
  NativeAppController.prototype.constructor = NativeAppController;
  NativeAppController.prototype.res = NativeAppController.res = ObjUtil.extend({
    APPS: '/apps'
  },BaseController.prototype.res);

  var sanitizeMeta = function(data){
    var retObj = {
      apps: []
    };

    if(data.length > 0){
      retObj.apps = data.map(function(obj){
        delete obj.serviceId;
        return obj;
      });
    }

    return retObj;
  };

  NativeAppController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.APPS;

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('App retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return NativeAppController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Poll = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var PollController = function(zmi){
    BaseController.call(this,zmi);
  };

  PollController.prototype = Object.create(BaseController.prototype);
  PollController.prototype.constructor = PollController;
  PollController.prototype.res = PollController.res = ObjUtil.extend({
    POLLS: '/votingpollbits',
    POLL: '/VotingPolls'
  },BaseController.prototype.res);

  PollController.SINGLESELECT = PollController.prototype.SINGLESELECT = 0;
  PollController.MULTISELECT = PollController.prototype.MULTISELECT = 1;

  var sanitizeMeta = function(data){
    var retObj = {
      id: data.id,
      startEpoch: data.startsAt,
      endEpoch: data.endsAt,
      polls: [],
      allowVoteUpdates: data.allowUpdateVotes
    };

    if(data.votingPolls.length > 0){
      retObj.polls = data.votingPolls.map(function(obj){
        return {
          id: obj.id,
          type: obj.type,
          question: obj.question,
          hasUserVoted: obj.hasUserVoted,
          choices: obj.choices.map(function(choice){
            return {
              id: choice.id,
              text: choice.text,
              votes: choice.votes
            };
          })
        };
      });
    }

    return retObj;
  };

  PollController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.POLLS + "?alllocales=true";

    fetch(url,{
      method: 'GET',
      credentials: 'include',
      headers:{
        'Accept-Language': 'en'
      }
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Poll retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };

  /**
   * This is an `Object` that maps Poll IDs to arrays of Choice IDs.  That is
   * to say it is a simple map of a user's voting choices to poll questions.
   * @example
   * {
   *   340: [111,112,113],
   *   341: [342]
   * }
   * @typedef PollChoiceMap
   * @memberof Fmd.Poll
   * @type Object
   * @property {number[]} {pollID} An array of Choice IDs.
   */


  var vote = function(pollID,choiceIDArr){
    var def = new Deferred();
    var url = this.host + this.res.POLL + "/" + pollID + "/Vote";

    fetch(url,{
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(choiceIDArr)
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      def.resolve();
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Failed to submit vote',resultStr,{
          serverCode: resp.status,
          context: {pollID: pollID,choiceIDArr: choiceIDArr}
        }));
      });
    });

    return def.promise;
  };

  /**
   * Submits a vote to multiple Polls of a Moment instance.
   * @memberof Fmd.Poll
   * @function submitVote
   * @param {Fmd.Poll.PollChoiceMap} pollChoiceMap
   * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves if vote has succeeded. Promise rejects with possible errors regarding each Poll submission.
   */
  PollController.prototype.submitVote = function(pollChoiceMap){
    var def = new Deferred();
    var pollIDs = Object.keys(pollChoiceMap);
    var promises = [];

    for(var i = 0; i < pollIDs.length; i++){
      var votePromise = vote.call(this,pollIDs[i],pollChoiceMap[pollIDs[i]]);
      promises.push(votePromise);
    }

    Promise.settle(promises).then(function(resultArr){
      var rejected = resultArr.filter(function(obj){
        return obj.status === 'rejected';
      });
      var errors = rejected.map(function(obj){
        return obj.result.firstError();
      });
      if(rejected.length > 0){
        var validation = new Validation();
        validation.errors = errors;
        def.reject(validation);
      } else{
        def.resolve();
      }
    });

    return def.promise;
  };


  return PollController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Schedule = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var ScheduleController = function(zmi){
    BaseController.call(this,zmi);
  };

  ScheduleController.prototype = Object.create(BaseController.prototype);
  ScheduleController.prototype.constructor = ScheduleController;
  ScheduleController.prototype.res = ScheduleController.res = ObjUtil.extend({
    SCHEDULES: '/hoursofoperations'
  },BaseController.prototype.res);

  var sanitizeMeta = function(data){
    var retObj = {
      schedules: []
    };

    if(data.length > 0){
      retObj.schedules = data.map(function(obj){
        return {
          oneTimeRange: obj.range,
          weekly:{
            monday: obj.monday,
            tuesday: obj.tuesday,
            wednesday: obj.wednesday,
            thursday: obj.thursday,
            friday: obj.friday,
            saturday: obj.saturday,
            sunday: obj.sunday
          }
        };
      });
    }

    return retObj;
  };

  ScheduleController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.SCHEDULES;

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Schedule retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return ScheduleController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.SpeedDial = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var SpeedDialController = function(zmi){
    BaseController.call(this,zmi);
  };

  SpeedDialController.prototype = Object.create(BaseController.prototype);
  SpeedDialController.prototype.constructor = SpeedDialController;
  SpeedDialController.prototype.res = SpeedDialController.res = ObjUtil.extend({
    PHONENUMBERS: '/phonenumbers'
  },BaseController.prototype.res);

  var sanitizeMeta = function(data){
    var retObj = {
      phonenumbers: []
    };

    if(data.length > 0){
      retObj.phonenumbers = data.map(function(obj){
        return {
          id: obj.id,
          fullNumber: obj.fullPhoneNumber,
          areaCode: obj.areaCode,
          countryCode: obj.countryCode,
          exchangeNumber: obj.exchangeNumber
        };
      });
    }

    return retObj;
  };

  SpeedDialController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.PHONENUMBERS;

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Phone number retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return SpeedDialController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Text = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var TextController = function(zmi){
    BaseController.call(this,zmi);
  };

  TextController.prototype = Object.create(BaseController.prototype);
  TextController.prototype.constructor = TextController;
  TextController.prototype.res = TextController.res = ObjUtil.extend({
    TEXTS: '/texts'
  },BaseController.prototype.res);

  var sanitizeMeta = function(data){
    var retObj = {
      texts: []
    };

    if(data.length > 0){
      retObj.texts = data.map(function(obj){
        var textObj = {
          id: obj.id,
          locales: {}
        };

        var localeKeys = Object.keys(obj.locales);
        localeKeys.forEach(function(key){
          var curObj = obj.locales[key];
          textObj.locales[key] = {
            content: curObj.description
          };
        });

        return textObj;
      });
    }

    return retObj;
  };

  TextController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.TEXTS;

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Texts retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return TextController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Twitter = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var TwitterController = function(zmi){
    BaseController.call(this,zmi);
  };

  TwitterController.prototype = Object.create(BaseController.prototype);
  TwitterController.prototype.constructor = TwitterController;
  TwitterController.prototype.res = TwitterController.res = ObjUtil.extend({
    TWEETS: '/tweets'
  },BaseController.prototype.res);

  TwitterController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.TWEETS;

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Tweets retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return TwitterController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Users = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var UsersController = function(zmi){
    BaseController.call(this,zmi);
  };

  UsersController.prototype = Object.create(BaseController.prototype);
  UsersController.prototype.constructor = UsersController;
  UsersController.prototype.res = UsersController.res = ObjUtil.extend({
    USERS: '/usersbits'
  },BaseController.prototype.res);

  var fromLocaleObj = function(obj){
    return {
      email: obj.email,
      mailTo: {
        subject: obj.emailMeSubject,
        body: obj.emailMeBody
      },
      bio: obj.aboutMe,
      phoneNumber: obj.phoneNumber,
      title: obj.position,
      firstName: obj.firstName,
      lastName: obj.lastName,
      socialURLs: {
        instagram: obj.instagramUrl,
        facebook: obj.facebookUrl,
        twitter: obj.twitterUrl,
        spotify: obj.spotifyUrl,
        iTunes: obj.iTunesUrl,
        googlePlay: obj.googleMusicStoreUrl
      },
      misc: {
        branchTransitNumber: obj.branchTransitNumber
      }
    };
  };

  var sanitizeMeta = function(data){
    var retObj = {
      id: data.id,
      displayBioOnMainView: data.displayBioOnMainView,
      users: []
    };

    retObj.users = data.users.map(function(obj){
      var usr = {
        id: obj.id,
        locales: {},
        profileImg: obj.imageUrl,
        coverImg: obj.backgroundImageUrl,
      };

      if(obj.locales){
        var localeKeys = Object.keys(obj.locales);
        localeKeys.forEach(function(key){
          var curObj = obj.locales[key];
          usr.locales[key] = fromLocaleObj(curObj);
        });
      }

      return usr;
    });

    return retObj;
  };

  UsersController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.USERS + "?alllocales=true";

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Users retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return UsersController;
})();
/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Website = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var WebsiteController = function(zmi){
    BaseController.call(this,zmi);
  };

  WebsiteController.prototype = Object.create(BaseController.prototype);
  WebsiteController.prototype.constructor = WebsiteController;
  WebsiteController.prototype.res = WebsiteController.res = ObjUtil.extend({
    WEBSITES: '/websitebits'
  },BaseController.prototype.res);

  WebsiteController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.WEBSITES;

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Website retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return WebsiteController;
})();

/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.YouTube = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var YouTubeController = function(zmi){
    BaseController.call(this,zmi);
  };

  YouTubeController.prototype = Object.create(BaseController.prototype);
  YouTubeController.prototype.constructor = YouTubeController;
  YouTubeController.prototype.res = YouTubeController.res = ObjUtil.extend({
    YOUTUBEBITS: '/youtubebits'
  },BaseController.prototype.res);

  var sanitizeMeta = function(data){
    var localeKeys = Object.keys(data);
    var retObj = {
      id: null,
      videos: []
    };

    if(localeKeys.length > 0 && data[localeKeys[0]].youtubeVideos.length > 0){
      var firstLocaleObj = data[localeKeys[0]];
      retObj.id = firstLocaleObj.id;
      retObj.videos = firstLocaleObj.youtubeVideos.map(function(obj){
        return {
          id: obj.video.id,
          url: obj.videoUrl,
          embedURL: obj.embeddedUrl,
          title: obj.video.snippet.title,
          description: obj.video.snippet.description,
          channelID: obj.video.snippet.channelId,
          channelTitle: obj.video.snippet.channelTitle,
          thumbnails: {
            default: obj.video.snippet.thumbnails.default,
            med: obj.video.snippet.thumbnails.medium ||
                 obj.video.snippet.thumbnails.high ||
                 obj.video.snippet.thumbnails.default,
            high: obj.video.snippet.thumbnails.maxres ||
                  obj.video.snippet.thumbnails.standard ||
                  obj.video.snippet.thumbnails.high ||
                  obj.video.snippet.thumbnails.medium ||
                  obj.video.snippet.thumbnails.default
          }
        };
      });
    }

    return retObj;
  };

  YouTubeController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.YOUTUBEBITS + "?alllocales=true";

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('YouTube video retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return YouTubeController;
})();

/***** Export ******/

if(typeof window === 'object'){
  window.Fmd = Fmd;
  Fmd.init = Fmd.init.browser;
} else if(typeof exports === 'object' && typeof module !== 'undefined'){
  var FS = require('fs');
  Flybits = require('flybits');
  Fmd.init = Fmd.init.server;
  module.exports = Fmd;
} else if(typeof define === 'function' && define.amd){
  define(function(){
    Fmd.init = Fmd.init.server;
    return Fmd;
  });
} else{
  Fmd.init = Fmd.init.server;
  global.Fmd = Fmd;
}

})();