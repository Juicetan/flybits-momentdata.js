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
