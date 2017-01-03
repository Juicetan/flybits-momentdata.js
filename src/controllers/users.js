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