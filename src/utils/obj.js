Fmd.util.Obj = (function(){
  var obj = {
    extend: function(destination,source){
      if(typeof $ === 'function' && typeof $.extend === 'function'){
        return $.extend(true,destination,source);
      }
      if(typeof _ === 'function' && typeof _.extend === 'function'){
        return _.extend(destination,source);
      }

      for (var property in source) {
        if (source[property] && source[property].constructor &&
            source[property].constructor === Object) {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
        } else {
          destination[property] = source[property];
        }
      }
      return destination;
    },
    guid:function(){
      var s4 = function(){
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
      };

      return 'j' + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
    },
  };

  return obj;
})();
