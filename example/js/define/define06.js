define(function(require, exports) {
    exports.val = "I am module06";
    //可依赖多个模块
    require('define/define02').done(function(data) {
        exports.define02 = data;
    });
    require('define/define01').done(function(data) {
        exports.define01 = data;
    });
});
