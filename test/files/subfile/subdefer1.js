defer(function(require, resolve, reject) {
    require('./subdefine1').done(function(subdefine1data) {
        resolve({
            subdefine1data: subdefine1data
        });
    });
});