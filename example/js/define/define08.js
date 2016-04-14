define(function(require, exports, module) {
    var val = 'get define08 module';
    require('define/define02', 'define/define03').done(function(data02, data03) {
        var getdata = function() {
            return {
                define02: data02,
                define03: data03,
                val: val
            };
        };
        module.exports = getdata;
    });
});
