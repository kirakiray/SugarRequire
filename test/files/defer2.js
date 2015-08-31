//defer为控制流模块，执行resolve将返回成功callback
defer(function(require, resolve, reject) {
    setTimeout(function() {
        resolve('IamResolveData2');
    }, 1000);
});