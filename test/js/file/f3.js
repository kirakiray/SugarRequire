(function() {
    console.log('I am F3');

    //判断全局是否有函数，有则运行
    if ((typeof window.f3).toLowerCase() == "function") {
        window.f3();
    }
})();
