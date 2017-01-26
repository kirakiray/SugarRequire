//兼容低版本ie插件
sr.extend(function(baseResources, R, Require, GatherEvent) {
    //ie9 <= 才能使用此插件
    if ("async" in document.createElement('script')) {
        return;
    }

    var windowHead = document.getElementsByTagName('head')[0];

    var scriptArr = [];
    var isRun = false;

    //载入的方法
    var runScript = function(url, callback, errcall) {
        var script = document.createElement('script');
        //填充相应数据
        script.type = 'text/javascript';
        script.setAttribute('defer', 'defer');
        //填充url
        script.src = url;

        script.onreadystatechange = function(e) {
            if (this.readyState == 'complete') {
                callback();
            } else if (this.readyState == "loaded") {
                return;
            } else if (this.readyState == 'loading') {
                errcall();
                // return;
            }
            //遍历scriptArr
            if (scriptArr.length) {
                scriptArr.shift()();
            } else {
                isRun = false;
            }
        };
        setTimeout(function() {
            windowHead.appendChild(script);
        }, 1);
    };

    //替换loadScript方法
    R.loadScript = function(url, callback, errcall) {
        //加入队列数组
        if (isRun) {
            scriptArr.push(function() {
                runScript(url, callback, errcall);
            })
        } else {
            isRun = true;
            runScript(url, callback, errcall);
        }
    };
});
