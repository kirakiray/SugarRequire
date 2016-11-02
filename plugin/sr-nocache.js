//缓存版本控制器
sr.extend(function(baseResources, R, SugarRequire) {
    var beforeGetPath = R.getPath;
    sr.Nocache = {
        v: new Date().getTime()
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
