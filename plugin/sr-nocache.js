//给每个js带上版本号的插件
sr.extend(function(baseResources, R, Require, GatherEvent) {
    //添加设置版本号方法
    //插件对象请用大写字母开头
    var noCacheObj = sr.NoCache = {
        v: new Date().getTime() + ""
    };

    //旧的loadscript
    var oldLoadScript = R.loadScript;

    R.loadScript = function(url, callback) {
        //继承旧的loadScript
        oldLoadScript(url + "?v=" + noCacheObj.v, callback);
    }
});