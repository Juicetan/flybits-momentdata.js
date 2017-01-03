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
