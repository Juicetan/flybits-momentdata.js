/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Gallery = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var GalleryController = function(zmi){
    BaseController.call(this,zmi);
  };

  GalleryController.prototype = Object.create(BaseController.prototype);
  GalleryController.prototype.constructor = GalleryController;
  GalleryController.prototype.res = GalleryController.res = ObjUtil.extend({
    GALLERIES: '/Galleries',
    COMMENTS: '/Comments',
    FILES: '/FileEntity'
  },BaseController.prototype.res);

  var sanitizeMeta = function(data){
    delete data.momentId;
    delete data.momentInstanceId;
    delete data.zoneMomentInstanceId;
    delete data.serviceId;
    data.id = data.galleryId;
    delete data.galleryId;
    data.images = data.fileEntities.map(function(img){
      delete img.momentId;
      delete img.momentInstanceId;
      delete img.zoneMomentInstanceId;
      delete img.isApproved;
      delete img.fileName;
      delete img.fileType;
      img.id = img.fileId;
      delete img.fileId;
      return img;
    });
    delete data.fileEntities;

    return data;
  };

  var sanitizeComments = function(data){
    return {
      comments: data.comments
    };
  };

  GalleryController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.GALLERIES + "?getAll=false&isApproved=true";

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
        def.reject(new Validation().addError('Gallery retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };
  
  /**
   * Retrieves user submitted comments on an image.
   * @memberof Fmd.Gallery
   * @function getImageComments
   * @instance
   * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with image comments. Promise rejects with errors if image retrieval fails.  Perhaps when session between the client and Moment server.
   */
  GalleryController.prototype.getImageComments = function(imgID){
    var def = new Deferred();
    var url = this.host + this.res.COMMENTS + '/' + imgID + '?top=1000&isApproved=true';

    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeComments(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Gallery image comments retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };

  /**
   * Initiates image upload from file to gallery.
   * @memberof Fmd.Gallery
   * @function uploadImageFromFile
   * @instance
   * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with successfully uploaded image URL. Promise rejects with errors if image upload fails or if user has decided not to select a file.
   */
  GalleryController.prototype.uploadImageFromFile = function(onFileChange){
    var def = new Deferred();
    var url = this.host + this.res.FILES;

    allUpload({
      targetURL: url,
      fileParamName: 'data',
      acceptStr: 'image/*',
      onfilechange: function(filepath){
        if(!filepath){
          onFileChange();
          def.reject(new Validation().addError('File not selected','',{
            code: Validation.type.MISSINGARG,
            context: 'data'
          }));
        } else{
          onFileChange(filepath);
        }
      }
    }).then(function(resp){
      var url = resp.querySelector('FileURL').innerHTML;
      def.resolve(url);
    }).catch(function(e){
      def.reject(new Validation().addError('Image upload failed.',e));
    });

    return def.promise;
  };


  return GalleryController;
})();
