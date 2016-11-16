//缓存版本控制器
sr.extend(function(baseResources, R, SugarRequire) {
    var beforeGetPath = R.getPath;
    //获取页面元素版本
    var v = new Date().getTime();
    var srnocacheScript = document.currentScript;
    if (srnocacheScript) {
        //获取版本号
        var srnover = srnocacheScript.dataset.ver;
        srnover && (v = srnover);
    }
    sr.Nocache = {
        v: v
    };
    R.getPath = function() {
        var pathStr = beforeGetPath.apply(R, arguments);

        if (pathStr.search(/\?/) > -1) {
            pathStr += '&srnocacheversion=' + sr.Nocache.v;
        } else {
            pathStr += '?srnocacheversion=' + sr.Nocache.v;
        }

        console.log(pathStr);

        return pathStr;
    };
});
