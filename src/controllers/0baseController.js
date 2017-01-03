/**
 * @classdesc Abstract Base controller from which all other Moment controllers will extend.
 * @class
 * @abstract
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
var BaseController = (function(){
  var Deferred = Fmd.Deferred;
  var ApiUtil = Fmd.util.Api;
  var Validation = Fmd.Validation;

  var BaseController = function(zmi){
    if(this.constructor.name === 'Object'){
      throw new Error('Abstract classes cannot be instantiated');
    }

    /**
     * @instance
     * @memberof BaseController
     * @member {external:ZoneMomentInstance} zmi Core ZoneMomentInstance model for which this controller will act as an API wrapper for.
     */
    this.zmi = zmi;
    /**
     * @instance
     * @memberof BaseController
     * @member {string} host Moment API base path.
     */
    this.host = zmi.moment.clientURL;
    /**
     * @instance
     * @memberof BaseController
     * @member {string} type Registered Moment unique key name to indicate type.
     */
    this.type = zmi.moment.androidPkg || zmi.moment.iosPkg;
    /**
     * @instance
     * @memberof BaseController
     * @member {boolean} isValidated Flag to indicate whether or not a valid session has been established between library and Moment server.
     */
    this.isValidated = false;
  };

  BaseController.prototype = {
    /**
     * Resource mapping of Moment API endpoints
     * @namespace BaseController.res {Object}
     * @constant
     * @property {string} VALIDATE Standard conventional endpoint in all Moment APIs to allow for session establishment with an authorization claim from Flybits core.
     */
    res:{
      VALIDATE: '/validate'
    },
    /**
     * Convenience function that retrieves Moment content from `ZoneMomentInstance` supplied to main {@link Fmd.use|factory method}.  This function performs the validation and data retrieval all together.
     * @memberof BaseController
     * @function getData
     * @instance
     * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with Moment content obtained from `ZoneMomentInstance`. Promise rejects with possible errors.
     */
    getData: function(){
      var con = this;

      if(!this.isValidated){
        var def = new Deferred();
        this.validate().then(function(){
          con.isValidated = true;
          return con.getMainData();
        }).then(function(resp){
          def.resolve(resp);
        }).catch(function(e){
          def.reject(e);
        });
        return def.promise;
      }

      return this.getMainData();
    },
    /**
     * Establishes an authorized session between library and Moment server.  Should never have to call this function directly as {@link BaseController.getData} will do this automatically.
     * @memberof BaseController
     * @function validate
     * @instance
     * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with raw Moment validation response. Promise rejects with errors that caused authorization to fail.
     */
    validate: function(){
      var def = new Deferred();
      var url = this.host + this.res.VALIDATE;

      this.zmi.getAccessToken().then(function(token){
        url += "?signature="+token;
        return fetch(url,{
          method: 'GET',
          credentials: 'include'
        });
      }).then(ApiUtil.checkResult).then(function(resp){
        def.resolve(resp);
      }).catch(function(resp){
        ApiUtil.getResultStr(resp).then(function(resultStr){
          def.reject(new Validation().addError('Authorization failed.',resultStr,{
            serverCode: resp.status
          }));
        });
      });

      return def.promise;
    },
    /**
     * Actual function that retrieves data directly from Moment, children of this class will override this function to meet their custom API endpoints.  Should never have to call this function directly as {@link BaseController.getData} will do this automatically.
     * @abstract
     * @memberof BaseController
     * @function getMainData
     * @instance
     * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves with raw Moment data. Promise rejects with errors that might have occurred.
     */
  };

  return BaseController;
})();
