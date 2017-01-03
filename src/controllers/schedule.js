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
