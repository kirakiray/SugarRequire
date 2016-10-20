defer(function(require, resolve, reject) {
    console.log('I am defer3');
    var data = this.data;

    setTimeout(function() {
        resolve(data * 100);
    }, 300);
});
