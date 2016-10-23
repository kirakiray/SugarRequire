define(function(require, exports, module) {
    require('./d2').done(function(d2) {
        exports.d2 = d2;
        exports.val = "I am d3";
    });
    setTimeout(function() {
        require('./d2').done(function(d2) {
            console.log('第二次显示d2', d2);
        });
    }, 500);
});

console.log('d3');