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
