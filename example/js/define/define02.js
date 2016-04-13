define(function(require) {
    var obj = {
        val: "I am define02"
    };

    require('define/define01').done(function(data) {
        obj.define01 = data;
    });

    return obj;
});
