defer(function(require, resolve, reject) {
    var num;

    require('./defer3')
        .post(8)
        .done(function(n) {
            num = n;
        })
        .require('./defer2')
        .done(function(defer2Data) {
            resolve({
                num: num,
                defer2Data: defer2Data
            });
        });
});
