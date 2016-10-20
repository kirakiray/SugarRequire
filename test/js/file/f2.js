(function() {
    console.log('I am F22');

    //判断全局是否有函数，有则运行
    if ((typeof window.f2).toLowerCase() == "function") {
        window.f2();
    }
})();
