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

Fmd.VERSION = "--flbversion";

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
