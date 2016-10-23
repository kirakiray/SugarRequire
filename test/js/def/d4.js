define(function(require) {
    var reobj = {
        val: "I am d4"
    };

    require('def/d3').done(function(d3) {
        reobj.d3 = d3;
    });

    return reobj;
});

console.log('d4');