/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.YouTube = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var YouTubeController = function(zmi){
    BaseController.call(this,zmi);
  };

  YouTubeController.prototype = Object.create(BaseController.prototype);
  YouTubeController.prototype.constructor = YouTubeController;
  YouTubeController.prototype.res = YouTubeController.res = ObjUtil.extend({
    YOUTUBEBITS: '/youtubebits'
  },BaseController.prototype.res);

  var sanitizeMeta = function(data){
    var localeKeys = Object.keys(data);
    var retObj = {
      id: null,
      videos: []
    };

    if(localeKeys.length > 0 && data[localeKeys[0]].youtubeVideos.length > 0){
      var firstLocaleObj = data[localeKeys[0]];
      retObj.id = firstLocaleObj.id;
      retObj.videos = firstLocaleObj.youtubeVideos.map(function(obj){
        return {
          id: obj.video.id,
          url: obj.videoUrl,
          embedURL: obj.embeddedUrl,
          title: obj.video.snippet.title,
          description: obj.video.snippet.description,
          channelID: obj.video.snippet.channelId,
          channelTitle: obj.video.snippet.channelTitle,
          thumbnails: {
            default: obj.video.snippet.thumbnails.default,
            med: obj.video.snippet.thumbnails.medium ||
                 obj.video.snippet.thumbnails.high ||
                 obj.video.snippet.thumbnails.default,
            high: obj.video.snippet.thumbnails.maxres ||
                  obj.video.snippet.thumbnails.standard ||
                  obj.video.snippet.thumbnails.high ||
                  obj.video.snippet.thumbnails.medium ||
                  obj.video.snippet.thumbnails.default
          }
        };
      });
    }

    return retObj;
  };

  YouTubeController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.YOUTUBEBITS + "?alllocales=true";

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
        def.reject(new Validation().addError('YouTube video retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };


  return YouTubeController;
})();
