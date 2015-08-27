define(function(require, exports, modules) {
    require('files/relateDefine1', 'files/define2').done(function(rData1, data2) {
        modules.exports = {
            val: "relateDefineData222",
            data1: rData1,
            data2: data2
        };
    });
});