define(function(require, exports) {
    exports.val = "I am module09";
    require('file/file01', 'file/file02')
        .require('define/define06')
        .done(function(data) {
            exports.define06 = data;
        });
    require('define/define02')
        .done(function(data) {
            exports.define02 = data;
        })
        .require('define/define01')
        .done(function(data) {
            exports.define01 = data;
        });
});
