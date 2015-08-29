//defer为控制流模块，执行resolve将返回成功callback
(function() {
    var a = 0;
    defer(function(resolve, reject) {
        setTimeout(function() {
            resolve('IamResolveData3-' + (a++));
        }, 300);
    });
})();