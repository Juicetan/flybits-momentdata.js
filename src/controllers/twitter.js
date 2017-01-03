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
