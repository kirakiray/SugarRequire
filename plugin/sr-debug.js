//sr框架用调试增强打印辅助插件
sr.extend(function(baseResources, R, SugarRequire) {
    //暴露关键数据到全局
    window.baseResources = baseResources;
    window.R = R;
    window.SugarRequire = SugarRequire;

    var a = null;
    //旧的函数
    var beforeSugarRequireInit = SugarRequire.fn.init;
    //继承旧方法
    SugarRequire.fn.init = function() {
        //优先继承初始化
        beforeSugarRequireInit.apply(this, arguments);

        //主动触发报错机制
        try {
            a();
        } catch (e) {
            //分组
            var errArr = (e.stack && e.stack.match(/[a-zA-Z]+?:\/\/.+\d/g)) || [];
            //错误后输出结果
            this.fail(function() {
                //辅助打印错误引入的定位
                console.error("fail positioning => ", errArr[3]);
            });
        }
    };
});
