(function() {
    console.log('I am F1');

    //判断全局是否有函数，有则运行
    if ((typeof window.f1).toLowerCase() == "function") {
        window.f1();
    }
})();
