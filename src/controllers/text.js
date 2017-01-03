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
