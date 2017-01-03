/**
 * @classdesc Standard class used across the library to indicate the state of an asynchronous validation event or error.  It is comprised of a `state` which indicates the result of an operation and also an `errors` array should the `state` be `false`.  This class is often used as the error object returned from API operations and also as the result of model based validation which can incur multiple errors at once.
 * @class
 * @memberof Fmd
 */
Fmd.Validation = (function(){
  /**
   * @typedef ValidationError
   * @memberof Fmd.Validation
   * @type Object
   * @property {string} header Generally a short and broad error message
   * @property {string} message A more in depth explanation of the error.
   * @property {string} context This is populated if an error occurs that relates to one of the input properties of an operation and will be the property's key.
   * @property {number} code An internal error code indicating error type. This property is only populated when errors that can be discerned by the library occur. Errors that occur server side and cannot be discerned by the library will populate an HTTP status code in the `serverCode` property.  For instance, if you forget to supply required property the `code` property would be populated with `Fmd.Validation.type.MISSINGARG`.  On the other hand if there's a server outage, the `serverCode` would be populated with a 404 or 500.
   * @property {number} serverCode This is populated with an HTTP status code when a server side error occurs that cannot be discerned by the library.
   */

  var Validation = function(){
    /**
     * @instance
     * @memberof Fmd.Validation
     * @member {boolean} state Indicates the resultant state of an asynchronous task.
     */
    this.state = true;
    /**
     * @instance
     * @memberof Fmd.Validation
     * @member {Fmd.Validation.ValidationError[]} errors An array of errors that have accumulated because of an asynchronous task.
     */
    this.errors = [];
  };

  /**
   * @memberof Fmd.Validation
   * @member {Object} type A mapping of library error codes.
   * @constant
   * @property {number} MALFORMED This error is usually thrown when an input property supplied to an library operation is incorrectly formatted, or sometimes a server response is not recognized by the library.
   * @property {number} INVALIDARG This error is thrown when an input property supplied to an library operation is semantically incorrect.
   * @property {number} MISSINGARG This error is thrown when a required property is not supplied to an library operation.
   * @property {number} NOTFOUND Usually thrown when model retrieval has yielded no results with provided input parameters.
   * @property {number} CONNECTIONERROR Error thrown when the library loses connection to particular resources.
   * @property {number} UNAUTHENTICATED Error is thrown when library operation requires authentication and current session is not found or expired.
   * @property {number} RETRIEVALERROR This error is thrown when any retrieval library operation fails to complete.
   * @property {number} NOTSUPPORTED Error is thrown when an operation or entity is not supported by the library.
   */
  Validation.prototype.type = Validation.type = {};
  Validation.prototype.type.MALFORMED = Validation.type.MALFORMED = 1000;
  Validation.prototype.type.INVALIDARG = Validation.type.INVALIDARG = 1001;
  Validation.prototype.type.MISSINGARG = Validation.type.MISSINGARG = 1002;
  Validation.prototype.type.NOTFOUND = Validation.type.NOTFOUND = 1003;
  Validation.prototype.type.CONNECTIONERROR = Validation.type.CONNECTIONERROR = 1004;
  Validation.prototype.type.UNAUTHENTICATED = Validation.type.UNAUTHENTICATED = 1005;
  Validation.prototype.type.RETRIEVALERROR = Validation.type.RETRIEVALERROR = 1006;
  Validation.prototype.type.NOTSUPPORTED = Validation.type.NOTSUPPORTED = 1007;

  Validation.prototype = {
    /**
     * Used to add error objects to the `Validation` instance.
     * @function
     * @instance
     * @memberof Fmd.Validation
     * @param {string} header Generally a short and broad error message
     * @param {string} message A more in depth explanation of the error.
     * @param {Object} detailsObj Optional extra details about the error.
     * @param {string} detailsObj.context This is populated if an error occurs that relates to one of the input properties of an operation and will be the property's key.
     * @param {number} detailsObj.code An internal error code indicating error type. This property is only populated when errors that can be discerned by the library occur. Errors that occur server side and cannot be discerned by the library will populate an HTTP status code in the `serverCode` property.  For instance, if you forget to supply required property the `code` property would be populated with `Fmd.Validation.type.MISSINGARG`.  On the other hand if there's a server outage, the `serverCode` would be populated with a 404 or 500.
     * @param {number} detailsObj.serverCode This is populated with an HTTP status code when a server side error occurs that cannot be discerned by the library.
     * @return {Fmd.Validation} The `Validation` instance the method has been invoked upon to allow for method chaining.
     */
    addError: function(header,message,detailsObj){
      this.state = false;
      var retObj = {
        header: header,
        message: message
      };
      if(detailsObj){
        retObj.context = detailsObj.context;
        retObj.code = detailsObj.code;
        retObj.serverCode = detailsObj.serverCode
      }
      this.errors.push(retObj);

      return this;
    },
    /**
     * Used to retrieve the first available error if available.
     * @function
     * @instance
     * @memberof Fmd.Validation
     * @return {Fmd.Validation.ValidationError} First available error if validation state is `false` and errors have been found.
     * @return {null} `null` if no errors are available.
     */
    firstError: function(){
      if(this.errors.length > 0){
        return this.errors[0];
      }
      return null;
    }
  };

  return Validation;
})();
