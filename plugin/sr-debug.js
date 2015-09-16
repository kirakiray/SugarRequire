//SugarRequire调试用插件
//同于暴露内部变量到全局
//添加路径错误提示
sr.extend(function(baseResources, R, Require, GatherEvent) {
    //暴露参数
    var Global = window;
    Global.BindEvent = GatherEvent;
    Global.GatherEvent = GatherEvent;
    Global.Require = Require;
    Global.R = R;
    Global.baseResources = baseResources;

    var oldRequire = R.require;
    R.require = function() {
        var reObj = oldRequire.apply(window, arguments);
        var inputPosition = "";
        try {
            a();
        } catch (err) {
            var errStack = err.stack;
            if (!errStack) {
                return reObj
            }
            var errArr = errStack.match(/\w+?:\/\/\/.+\d/g);
            inputPosition = errArr[2];
        }
        reObj._rEvent.one('error', function() {
            console.log('error Paths: ' + inputPosition);
        });
        return reObj;
    };

    var RequireOldRequire = Require.fn.require;
    Require.fn.require = function() {
        var reObj = RequireOldRequire.apply(this, arguments);
        var inputPosition = "";
        try {
            a();
        } catch (err) {
            var errStack = err.stack;
            if (!errStack) {
                return reObj
            }
            var errArr = errStack.match(/\w+?:\/\/\/.+\d/g);
            inputPosition = errArr[1];
        }
        reObj._rEvent.one('error', function() {
            console.log('error Paths: ' + inputPosition);
        });
        return reObj;
    };
});