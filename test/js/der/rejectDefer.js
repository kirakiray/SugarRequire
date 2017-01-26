defer(function(require, resolve, reject) {
    setTimeout(function() {
        reject('拒绝了');
    }, 1000);
});
