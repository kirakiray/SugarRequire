define(function(require) {
    var obj = {
        val: "I am define02"
    };

    //依赖模块也加载完，当前模块才能算加载完
    require('define/define01').done(function(data) {
        obj.define01 = data;
    });

    return obj;
});
