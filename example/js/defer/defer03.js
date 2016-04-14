defer(function(require, respone) {
    require('file/file01')
        .done(function() {
            //defer模块不会监控require链，在respone后就等于模块加载完毕
            respone('defer03 ok');
        })
        .require('file/file02');
});
