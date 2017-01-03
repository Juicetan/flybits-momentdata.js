/***** Export ******/

if(typeof window === 'object'){
  window.Fmd = Fmd;
  Fmd.init = Fmd.init.browser;
} else if(typeof exports === 'object' && typeof module !== 'undefined'){
  var FS = require('fs');
  Flybits = require('flybits');
  Fmd.init = Fmd.init.server;
  module.exports = Fmd;
} else if(typeof define === 'function' && define.amd){
  define(function(){
    Fmd.init = Fmd.init.server;
    return Fmd;
  });
} else{
  Fmd.init = Fmd.init.server;
  global.Fmd = Fmd;
}
