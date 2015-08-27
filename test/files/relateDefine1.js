define(function(require, exports, modules) {
    require('files/define1').done(function(data1) {
        modules.exports = {
            val: "relateDefineData",
            d1Data: data1
        };
    });
});