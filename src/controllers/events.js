/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Events = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var EventsController = function(zmi){
    BaseController.call(this,zmi);
  };

  EventsController.prototype = Object.create(BaseController.prototype);
  EventsController.prototype.constructor = EventsController;
  EventsController.prototype.res = EventsController.res = ObjUtil.extend({
    EVENTS: '/events'
  },BaseController.prototype.res);

  var remapShareMsgs = function(obj){
    var localeKeys = Object.keys(obj.locales);
    var localeKeyCount = localeKeys.length;
    var firstLocale = obj.locales['en']?obj.locales['en']:obj.locales[localeKeys[0]];
    obj.shareMessages = {
      facebook: firstLocale.facebookShareMessage,
      instagram: firstLocale.instagramShareMessage,
      linkedin: firstLocale.linkedInShareMessage,
      twitter: firstLocale.twitterShareMessage
    };
    delete obj.facebookShareMessage;
    delete obj.instagramShareMessage;
    delete obj.linkedInShareMessage;
    delete obj.twitterShareMessage;
    while(localeKeyCount--){
      var curLocale = obj.locales[localeKeys[localeKeyCount]];
      delete curLocale.facebookShareMessage;
      delete curLocale.instagramShareMessage;
      delete curLocale.linkedInShareMessage;
      delete curLocale.twitterShareMessage;
    }

    return obj;
  };

  var remapGalleryMeta = function(obj){
    var localeKeys = Object.keys(obj.locales);
    var localeKeyCount = localeKeys.length;
    var firstLocale = obj.locales['en']?obj.locales['en']:obj.locales[localeKeys[0]];
    obj.galleryTitle = firstLocale.galleryTitle;
    obj.galleryDescription = firstLocale.galleryDescription;
    while(localeKeyCount--){
      var curLocale = obj.locales[localeKeys[localeKeyCount]];
      delete curLocale.galleryTitle;
      delete curLocale.galleryDescription;
      delete curLocale.title;
    }
  };

  var sanitizeMeta = function(data){
    var retObj = {
      events:[]
    };

    if(data.length > 0){
      retObj.events = data.map(function(obj){
        remapShareMsgs(obj);
        remapGalleryMeta(obj);
        obj.images = obj.images.map(function(img){
          img = remapShareMsgs(img);
          var localeKeys = Object.keys(img.locales);
          img = ObjUtil.extend(img,img.locales[localeKeys[0]]);
          delete img.locales;
          delete img.locale;
          delete img.fileExtension;
          delete img.fileName;
          return img;
        });
        obj.videos = obj.videos.map(function(vid){
          vid = remapShareMsgs(vid);
          var localeKeys = Object.keys(vid.locales);
          vid = ObjUtil.extend(vid,vid.locales[localeKeys[0]]);
          delete vid.locales;
          delete vid.locale;
          delete vid.fileExtension;
          delete vid.fileName;
          return vid;
        });
        delete obj.eventName;
        delete obj.description;
        delete obj.title;
        delete obj.location;
        delete obj.phoneNumber;

        return obj;
      });
    }

    return retObj;
  };

  EventsController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.EVENTS;

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
        def.reject(new Validation().addError('Events retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return EventsController;
})();
