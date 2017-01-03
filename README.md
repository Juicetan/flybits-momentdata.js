![alt tag](http://flybits.com/images/logo_flybitscorporate_RGB.png)

# Flybits-momentdata.js

Flybits-momentdata.js is an isomorphic JavaScript helper library for the consumption of content from Flybits core Moments.

## Table of Contents
1. [Compatibility](#compatibility)
2. [Getting Started](#getting-started)
3. [Fundamentals](#fundamentals)
    1. [Promises](#promises)
    2. [Standardized Errors](#standardized-errors)
4. [Basic Data Consumption](#basic-data-consumption)
5. [Roadmap](#roadmap)

## Compatibility

To achieve client/server agnosticism, this library utilizes the new [ES6 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) [(spec)](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects) object and the upcoming standard [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) [(spec)](https://fetch.spec.whatwg.org/).  Both have polyfill support readily available for platforms who have yet to implement them.

To maintain compatibility until all modern browsers and node environments catch up, it is recommended to include the polyfills below by default.

Browser:
* Promise Polyfill: [stefanpenner/es6-promise](https://github.com/stefanpenner/es6-promise)
* Fetch Polyfill: [github/fetch](https://github.com/github/fetch)

Node:
* Promise Polyfill: [stefanpenner/es6-promise](https://github.com/stefanpenner/es6-promise)
* Fetch Polyfill: [matthew-andrews/isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
* Fetch Cookie Support Polyfill: [juicetan/fetch-cookie](https://github.com/Juicetan/fetch-cookie) (npm package: [fetch-cookie-es5](https://www.npmjs.com/package/fetch-cookie-es5))

    Note: The Flybits Moment Data library relies on the native AJAX request mechanism to handle cookies for session management.  This polyfill decorates the `fetch` API with automatic cookie handling functionality.  Below is an example of how to use it assuming you already have `fetch` support or have first required the isomorphic-fetch polyfill.
    ```javascript
    if(global.fetch){
      global.fetch = require('fetch-cookie-es5')(global.fetch);
    }
    ```

## Getting Started

**Fetch and Include**

1. Fetch the library

    The library is available using the [Node Package Manager(npm)](https://www.npmjs.com/package/flybits-momentdata)
    ```shell
    $ npm install flybits-momentdata --save
    ```

2. Include the library

    Browser:
    ```html
    <script src="node_modules/flybits/dist/flybits-momentdata.js"></script>
    <!-- note that Fmd will be available in the global namespace -->
    ```
    Node:
    ```javascript
    var Fmd = require('flybits-momentdata');
    ```

## Fundamentals
The library is comprised of a controller for each Flybits core Moment and a main factory method that will return a corresponding controller.

#### Promises

A `Promise` represents an operation that has yet to be completed but will in the future.

All asynchronous operations in the library, including the main factory method, returns a `Promise` which give developers full power and flexibility to manage chained operations, parallel model retrieval and deferred actions.

Below is an example of the power of using `Promises` in managing asynchronous operations in the flybits-momentdata library.

#### Standardized Errors

All handled errors in the flybits-momentdata library can be caught by appending a `.catch()` callback onto any promise and will invoke the callback with an instance of the `Flybits.Validation` class.
```javascript
controller.getData().catch(function(validation){
  //handle error
});
```
The `Flybits.Validation` class comprises of a `state` property an `errors` array containing any and all errors that has been incurred by a library operation, and a `type` static property holding error code constants. The `state` property indicates the result of an operation. In the case of a `.catch()` callback it will always be false.

Each error object found in the `errors` array will have the properties below:

| Key | Type | Description |
| :-- | :--: | :---------- |
| header | String | Generally a short and broad error message |
| message | String | A more in depth explanation of the error. |
| code | Number | An internal error code indicating error type. This property is only populated when errors that can be discerned by the library occur. Errors that occur server side and cannot be discerned by the library will populate an HTTP status code in the `serverCode` property.  For instance, if you forget to supply required property the `code` property would be populated with `Fmd.Validation.type.MISSINGARG`.  On the other hand if there's a server outage, the `serverCode` would be populated with a 404 or 500. |
| serverCode | Number | This is populated with an HTTP status code when a server side error occurs that cannot be discerned by the library. |
| context | String | This is populated if an error occurs that relates to one of the input properties of an operation and will be the property's key. |

Below are the internal error code constants found in the static object of `Fmd.Validation.type`:

| Key | Value | Description |
| :-- | :---: | :----------- |
| MALFORMED | 1000 | This error is usually thrown when an input property supplied to an SDK operation is incorrectly formatted, or sometimes a server response is not recognized by the library. |
| INVALIDARG | 1001 | This error is thrown when an input property supplied to an library operation is semantically incorrect. |
| MISSINGARG | 1002 | This error is thrown when a required property is not supplied to an SDK operation. |
| NOTFOUND | 1003 | Usually thrown when model retrieval has yielded no results with provided input parameters. |
| CONNECTIONERROR | 1004 | Error thrown when the library loses connection to particular resources. |
| UNAUTHENTICATED | 1005 | Error is thrown when library operation requires authentication and current session is not found or expired. |
| RETRIEVALERROR | 1006 | This error is thrown when any retrieval library operation fails to complete. |
| NOTSUPPORTED | 1007 | Error is thrown when an operation or entity is not supported by the library. |

## Basic Data Consumption

```javascript
var zmi; //previously fetched ZoneMomentInstance using flybits.js

//pass ZoneMomentInstance model straight into factory method to obtain appropriate controller;
var controller = Fbm.use(zmi);
if(controller){
  controller.getData().then(function(data){
    //consume moment data
    //to determine the type of Moment data in order to render custom UI, access the following properties:
    var momentType = controller.type;
    //this can also be done
    momentType = zmi.moment.iosPkg || zmi.moment.androidPkg;
  });
} else{
  //zmi is not a Moment type that is supported by library;
}
```

## Roadmap

Currently Moment controllers simply retrieve data from a Moment.  In the future each Moment type's controller will also have convenience functions for contributing data such as creating events, voting in poll, or even contributing to a shared photo gallery.
