((glo) => {
    "use strict";
    //common
    const windowHead = document.head;

    const
    //模块处理中 
        PENDING = "pending",
        //模块加载成功
        RESOLVED = "resolved",
        //模块加载失败
        REJECTED = "rejected",
        //js加载完成，但是模块定义未完成
        LOADED = "loaded";

    //映射资源
    var paths = {};

    //映射目录
    var dirpaths = {};

    //载入模块用的map对象
    var dataMap = {};

    //基础数据对象
    var baseResources = {
        paths: paths,
        dirpaths: dirpaths,
        //js模块相对路径
        baseUrl: "",
        dataMap: dataMap,
        //临时挂起的模块对象
        tempM: {}
    };

    //function
    //转换成array类型
    var arrayslice = Array.prototype.slice;
    var makeArray = arrobj => arrayslice.call(arrobj);

    //获取类型
    var objectToString = Object.prototype.toString;
    var getType = value => objectToString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');

    //array类型的遍历
    var arrayEach = (arr, func) => {
        !(arr instanceof Array) && (arr = makeArray(arr));
        arr.some((e, i) => func(e, i) === false);
        return arr;
    };

    //obj类型的遍历
    var objEach = (obj, func) => {
        for (let i in obj) {
            if (func(i, obj[i]) === false) {
                break;
            }
        }
        return obj;
    };

    //合并对象
    var extend = def => {
        let args = makeArray(arguments).slice(1);
        arrayEach(args, (opt) => {
            for (let key in opt) {
                def[key] = opt[key];
            }
        });
        return def;
    };

    //合并数组
    var merge = (arr1, arr2) => {
        let fakeArr2 = makeArray(arr2);
        fakeArr2.unshift(arr1.length, 0);
        arr1.splice.apply(arr1, fakeArr2);
        return arr1;
    };

    //获取目录名
    var getDir = (url) => {
        let urlArr = url.match(/(.+\/).+/);
        return urlArr && urlArr[1];
    };

    //修正字符串路径
    var removeParentPath = (url) => {
        let urlArr = url.split(/\//g);
        let newArr = [];
        arrayEach(urlArr, (e) => {
            if (e == '..' && newArr.length && (newArr.slice(-1)[0] != "..")) {
                newArr.pop();
                return;
            }
            newArr.push(e);
        });
        return newArr.join('/');
    };

    //改良异步方法
    var nextTick = (() => {
        let isTick = false;
        let nextTickArr = [];
        return (fun) => {
            if (!isTick) {
                isTick = true;
                setTimeout(() => {
                    for (let i = 0; i < nextTickArr.length; i++) {
                        nextTickArr[i]();
                    }
                    nextTickArr = [];
                    isTick = false;
                }, 0);
            }
            nextTickArr.push(fun);
        };
    })();

    //是否空对象
    var isEmptyObj = (obj) => {
        for (let i in obj) {
            return 0;
        }
        return 1;
    }

    //是否undefined
    var isUndefined = val => val === undefined;

    //返回Promise实例
    var promise = func => new Promise(func);

    //main
    //主业务逻辑
    var R = {
        //加载script的方法
        loadScript: url => {
            let script = document.createElement('script');

            //填充相应数据
            script.type = 'text/javascript';
            script.async = true;
            script.src = url;

            //ie10对 async支持差的修正方案
            nextTick(() => {
                windowHead.appendChild(script);
            });

            return script;
        },
        //根据数组内的路径进行封装返回Promise对象
        toProm: (args, relatePath) => {
            let pendFun;

            let pms = promise((res, rej) => {
                let arr = [];
                let len = args.length;

                //确认返回数据的方法
                let monitFun = () => {
                    len--;
                    if (!len) {
                        pendFun = null;
                        if (arr.length == 1) {
                            res(arr[0]);
                        } else {
                            res(arr);
                        };
                    }
                };

                arrayEach(args, (e, i) => {
                    //获取实际路径
                    let path = R.getPath(e, relatePath);

                    //获取promise模块
                    let p = R.agent(path);

                    p.then((data) => {
                        arr[i] = data;
                        pendFun && pendFun(data, i);
                        monitFun();
                    }).catch((err) => {
                        rej(err);
                    });
                });
            });

            //加入pend事件
            pms.pend = (func) => {
                pendFun = func;
                return pms;
            };

            return pms;
        },
        //载入单个资源的代理方法
        agent: path => promise((res, rej) => {
            let tar = dataMap[path];
            if (tar) {
                switch (tar.state) {
                    case LOADED:
                    case PENDING:
                        tar.res.push(res);
                        tar.rej.push(rej);
                        break;
                    case RESOLVED:
                        nextTick(() => {
                            if (tar.get) {
                                tar.get((data) => {
                                    res(data);
                                });
                            } else {
                                res();
                            }
                        });
                        break;
                    case REJECTED:
                        nextTick(() => {
                            rej();
                        });
                        break;
                }
            } else {
                dataMap[path] = tar = {
                    //模块类型
                    // type: "file",
                    state: PENDING,
                    res: [res],
                    rej: [rej]
                };

                let script = R.loadScript(path);

                script.onload = () => {
                    tar.state = LOADED;
                    R.setTemp(path);
                    baseResources.tempM = {};
                };
                script.onerror = () => {
                    while (0 in tar.rej) {
                        tar.rej.shift()();
                    }
                    baseResources.tempM = {};
                    tar.state = REJECTED;
                    delete tar.res;
                    delete tar.rej;
                }
            }
        }),
        //设定temp的方法
        setTemp: path => {
            //获取模块数据
            let { tempM } = baseResources;
            let data = tempM.d;
            let { ids } = tempM;

            //查看是否有设定ids
            (ids && getType(ids) == "string") && (ids = [ids]);

            let tar = dataMap[path];

            //默认模块为普通文件类型
            let type = tar.type = (tempM.type || "file");

            //运行成功
            let runFunc = (d) => {
                //响应队列resolve函数
                while (0 in tar.res) {
                    tar.res.shift()(d);
                }
                //设置完成
                tar.state = RESOLVED;
                //清除无用数据
                delete tar.res;
                delete tar.rej;
            }

            //根据类型做不同的处理
            switch (type) {
                case "file":
                    runFunc();
                    break;
                case "define":
                    //判断是否是函数
                    if (getType(data).search('function') > -1) {
                        let exports = {},
                            module = {
                                exports: exports
                            };
                        //判断返回值是否promise
                        let p = data(function() {
                            return R.require(makeArray(arguments), path);
                        }, exports, module);
                        if (p instanceof Promise) {
                            p.then((d) => {
                                if (isUndefined(d) && getType(module.exports) == "object" && !isEmptyObj(module.exports)) {
                                    d = module.exports;
                                }
                                runFunc(d);

                                //设置返回数据的方法
                                tar.get = (callback) => {
                                    callback(d);
                                };

                                //判断是否有自定义id
                                if (ids) {
                                    arrayEach(ids, (e) => {
                                        dataMap[e] = tar;
                                    });
                                }
                            });
                        } else {
                            //数据类型
                            runFunc(p);
                            //设置返回数据的方法
                            tar.get = (callback) => {
                                callback(p);
                            };
                        }
                    } else {
                        runFunc(data);
                        //设置返回数据的方法
                        tar.get = (callback) => {
                            callback(data);
                        };
                    }
                    break;
            };
        },
        //转换路径
        getPath: (target, relatePath) => {
            //判断是否已经注册了路径
            if (paths[target]) {
                target = paths[target];
            } else {
                let tarreg, res;
                //判断是否注册目录
                for (let i in dirpaths) {
                    tarreg = new RegExp('^' + i);
                    res = tarreg.test(target);
                    if (res) {
                        target = target.replace(tarreg, dirpaths[i]);
                        break
                    }
                }
            }

            //判断是否带协议头部
            //没有协议
            if (!/^.+?\/\//.test(target)) {
                //是否带参数
                if (!/\?.+$/.test(target) && !/.js$/.test(target)) {
                    //没有js的话加上js后缀
                    target += ".js";
                }

                //判断是否有相对路径字样
                let rePath = target.match(/^\.\/(.+)/);
                if (rePath) {
                    //获取相对目录
                    target = getDir(relatePath) + rePath[1];
                } else {
                    //加上根目录
                    target = baseResources.baseUrl + target;
                }

                //去除相对上级目录
                target = removeParentPath(target);
            }
            return target;
        },
        //引用模块
        require: (args, relatePath) => {
            return R.toProm(args, relatePath);
        },
        //定义模块
        define: (d, ids) => {
            baseResources.tempM = {
                type: "define",
                d: d,
                ids: ids
            };
        },
        //定义进程
        task: (d, ids) => {
            baseResources.tempM = {
                type: "task",
                d: d,
                ids: ids
            };
        }
    };

    //主体require
    var require = function() {
        return R.require(makeArray(arguments));
    };
    var oDefine = (d, ids) => {
        R.define(d, ids);
    };

    var sr = {
        config: data => {
            //配置baseurl
            baseResources.baseUrl = data.baseUrl || "";

            //配置paths
            for (let i in data.paths) {
                if (/\/$/.test(i)) {
                    //属于目录类型
                    dirpaths[i] = data.paths[i];
                } else {
                    //属于资源类型
                    paths[i] = data.paths[i];
                }
            }
        },
        remove: url => {
            //获取路径
            let path = R.getPath(url);

            //获取寄存对象
            let tarData = dataMap[path];

            if (tarData) {
                delete dataMap[path];
                //告示删除成功
                return true;
            }
        },
        //扩展函数
        extend: fun => {
            fun(baseResources, R);
        },
        require: require,
        define: oDefine
    };


    //init
    glo.require || (glo.require = require);
    glo.define || (glo.define = oDefine);
    glo.sr = sr;

    window.baseResources = baseResources;

})(window);