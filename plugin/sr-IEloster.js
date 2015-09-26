//兼容低版本ie插件
sr.extend(function(baseResources, R, Require, GatherEvent) {
    //ie9 <= 才能使用此插件
    if ("async" in document.createElement('script')) {
        return;
    }

    var windowHead = document.getElementsByTagName('head')[0];

    //获取script
    var getScriptTag = function(url) {
        var script = document.createElement('script');
        //填充相应数据
        script.type = 'text/javascript';
        script.setAttribute('defer', 'defer');
        //填充url
        script.src = url;
        return script;
    };

    var scriptArr = [];
    var isRun = false;

    //载入的方法
    var appendScript = function(url, callback) {
        var scriptTag = getScriptTag(url);
        scriptTag.onreadystatechange = function(e) {
            if (this.readyState == 'complete') {
                callback({
                    status: "succeed",
                    script: scriptTag
                });
            } else if (this.readyState == "loaded") {
                return;
            } else if (this.readyState == 'loading') {
                callback({
                    status: "error",
                    script: scriptTag
                });
                return;
            }
            //遍历scriptArr
            if (scriptArr.length) {
                var nextScrObj = scriptArr.shift();
                appendScript(nextScrObj.url, nextScrObj.callback);
            } else {
                isRun = false;
            }
        };
        setTimeout(function() {
            windowHead.appendChild(scriptTag);
        }, 1);
    };

    //替换loadScript方法
    R.loadScript = function(url, callback) {
        //加入队列数组
        if (isRun) {
            var scrObj = {
                url: url,
                callback: callback
            };
            scriptArr.push(scrObj);
        } else {
            isRun = true;
            appendScript(url, callback);
        }
    };
});