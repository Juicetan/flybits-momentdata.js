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
