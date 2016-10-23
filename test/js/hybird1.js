defer(function(require, resolve, reject) {
    var d4data;
    require('def/d1')
        .require('def/d4')
        .done(function(data) {
            d4data = data;
        })
        .require('der/defer4')
        .done(function(defer4data) {
            resolve({
                d4data: d4data,
                defer4data: defer4data,
                val: "hybird1"
            });
        });
});
