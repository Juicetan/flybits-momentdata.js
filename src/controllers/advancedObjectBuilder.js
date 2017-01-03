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
