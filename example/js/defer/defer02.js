defer(function(require, respone) {
    setTimeout(function() {
        //只有执行了respone才相当于模块加载完毕
        respone('I am defer02');
    }, 1000);
});
