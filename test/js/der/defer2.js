defer(function(require, resolve, reject) {
    console.log('I am defer2', this);
    var data = this.data;

    require('der/defer1').done(function(defer1) {
        resolve({
            data: data,
            defer1: defer1,
            val: "I am defer2"
        });
    });

});
