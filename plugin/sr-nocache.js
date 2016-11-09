//缓存版本控制器
// 有srentry入口标记存在会自动设置版本号
sr.extend(function(baseResources, R, SugarRequire) {
    var beforeGetPath = R.getPath;
    //获取页面元素版本
    var v = new Date().getTime();
    if (document.querySelector) {
        var entryScript = document.querySelector('[srentry]');
        if (!entryScript) {
            return;
        }
        //获取版本号key
        var nocacheKey = entryScript.getAttribute('srentry') || "v";
        var verreg = new RegExp(nocacheKey + "=(\\d+)");
        //根据key设置版本号
        var verarr = entryScript.src.match(verreg);
        v = verarr[1];
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
