define(function(require) {
    var redata = {
        val: "Iam hybird2"
    };
    require('file/f3')
        .require('der/defer4', 'def/d4')
        .done(function(defer4data, d4data) {
            redata.defer4data = defer4data;
            redata.d4data = d4data;
        });
    return redata;
});
