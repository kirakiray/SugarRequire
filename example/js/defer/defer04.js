defer(function(require, respone) {
    var data = this.data;
    println(data);
    setTimeout(function() {
        respone('I get it , good');
    }, 1000);
});
