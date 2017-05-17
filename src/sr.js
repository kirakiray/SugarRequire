(function(glo) {
    "use strict";
    //common
    //执行中
    var PENDING = 'pending';
    //执行完成
    var FULFILLED = 'fulfilled';
    //执行失败
    var REJECTED = 'rejected';
    //后代链全部触发完成
    var FIRE = 'fire';

    //function
    var emptyFun = function() {};
    //转换成数组
    var transToArray = function(args) {
        return Array.prototype.slice.call(args, 0);
    };
    //获取类型
    var getType = function(value) {
        return Object.prototype.toString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');
    };
    //遍历
    var each = (function() {
        if ([].forEach) {
            return function(arr, fun) {
                return arr.forEach(fun);
            }
        } else {
            return function(arr, fun) {
                for (var i = 0, len = arr.length; i < len; i++) {
                    fun(arr[i], i);
                };
            };
        }
    })();
    //合并对象
    var extend = function(def, opt) {
        for (var i in opt) {
            def[i] = opt[i];
        }
        return def;
    };
    //改良异步方法
    var nextTick = (function() {
        var isTick = false;
        var nextTickArr = [];
        return function(fun) {
            if (!isTick) {
                isTick = true;
                setTimeout(function() {
                    for (var i = 0; i < nextTickArr.length; i++) {
                        nextTickArr[i]();
                    }
                    nextTickArr = [];
                    isTick = false;
                }, 0);
            }
            nextTickArr.push(fun);
        };
    })();
    //获取目录地址方法
    var getDir = function(url) {
        var urlArr = url.match(/(.+\/).+/);
        return urlArr && urlArr[1];
    };
    //修正字符串路径
    var removeParentPath = function(url) {
        var urlArr = url.split(/\//g);
        var newArr = [];
        each(urlArr, function(e) {
            if (e == '..' && newArr.length && (newArr.slice(-1)[0] != "..")) {
                newArr.pop();
                return;
            }
            newArr.push(e);
        });
        return newArr.join('/');
    };

    //class
    //定制轻量低占内存事件机
    function SimpleEvent() {
        this._eves = {};
    };
    SimpleEvent.fn = SimpleEvent.prototype;
    SimpleEvent.prototype = {
        //获取相应事件对象数据
        _get: function(eventName) {
            return this._eves[eventName] || (this._eves[eventName] = { e: [], o: [] });
        },
        //注册事件
        on: function(eventName, fun) {
            this._get(eventName).e.push(fun);
        },
        //定义一次性事件
        one: function(eventName, fun) {
            this._get(eventName).o.push(fun);
        },
        //定义优先执行函数
        // first: function(eventName, fun) {
        //     this._get(eventName).f = fun;
        // },
        //定义最后执行函数
        last: function(eventName, fun) {
            this._get(eventName).l = fun;
        },
        //注销事件
        off: function(eventName) {
            delete this._eves[eventName];
        },
        //触发事件
        emit: function(eventName, data) {
            var eveObj = this._get(eventName);
            //触发first
            // var firstFun = eveObj.f;
            // firstFun && firstFun({
            //     name: eventName,
            //     type: 'first'
            // }, data);
            // delete eveObj.f;
            //触发事件队列
            var oneArr = eveObj.o;
            while (oneArr.length) {
                oneArr.shift()({
                    name: eventName,
                    type: "one"
                }, data);
            }
            each(eveObj.e, function(e) {
                e({
                    name: eventName,
                    type: "on"
                }, data);
            });
            //触发last
            var lastFun = eveObj.l;
            lastFun && lastFun({
                name: eventName,
                type: 'last'
            }, data);
            delete eveObj.l;
        }
    };

    function SugarPromise() {
        var _this = this;

        //事件寄托对象
        _this._e = new SimpleEvent();

        //函数寄宿对象
        _this._funs = [];

        //总函数数量寄宿属性
        _this._fCou = 0;

        //id递增器
        _this._id = 0;

        //成功数据寄宿对象
        _this.datas = [];

        //错误后数据寄宿对象
        _this.errs = [];

        //是否已经开始跑
        _this._r = 0;

        //后代寄宿对象
        _this._next = [];

        //后代数量寄宿属性
        _this._nCou = 0;

        //hold 是否挂起不执行后代链
        _this._h = 0;
    };
    SugarPromise.prototype = {
        //开始执行的函数
        _run: function() {
            var _this = this;
            _this._r = 1;

            //当完成后执行后代
            _this._e.last(FULFILLED, function() {
                if (_this._next.length) {
                    if (!_this._h) {
                        each(_this._next, function(n) {
                            n._run();
                        });
                    }
                } else {
                    //判断是否有后代，没有后代则直接出发fire事件
                    _this._e.emit(FIRE);
                }
            });

            if (0 in _this._funs) {
                //开始执行内部函数
                each(_this._funs, function(e) {
                    e();
                });
            } else {
                //直接触发运行成功
                _this._e.emit(FULFILLED);
            }

            //回收
            _this._run = _this._funs = null;
        },
        //callPending
        _cp: function(data, state, index) {
            var _this = this;
            var eve = _this._e;
            eve.emit(PENDING, {
                //数据
                data: data,
                //状态
                state: state,
                //序号
                no: index
            });

            //等待call的函数数量为0
            if (!--_this._fCou) {
                //判断执行成功或失败
                if (0 in _this.errs) {
                    eve.emit(REJECTED);
                } else {
                    eve.emit(FULFILLED);
                }

                //回收
                eve.off(PENDING);
                eve.off(REJECTED);
                eve.off(FULFILLED);
                _this.errs = _this.datas = null;
            }
        },
        add: function(fun) {
            var _this = this;

            //添加数据
            _this._fCou++;
            var index = _this._id++;

            //resolve或reject其中只能运行一个
            var iscall = 0;
            var runfun = function() {
                fun.call(_this, function(data) {
                    //resolve
                    if (iscall) return;
                    iscall = 1;

                    //载入数据
                    _this.datas[index] = data;

                    //执行callPending
                    _this._cp(data, FULFILLED, index);
                }, function(data) {
                    //reject
                    if (iscall) return;
                    iscall = 1;

                    _this.errs.push({
                        no: index,
                        data: data
                    });

                    //执行callPending
                    _this._cp(data, REJECTED, index);
                });
            };

            //确认开始了的话就直接开跑
            if (_this._r) {
                runfun();
            } else {
                _this._funs.push(runfun);
            }
        },
        //完成时触发
        then: function(fun) {
            var _this = this;
            _this._e.one(FULFILLED, function(e) {
                //把数据带过去
                fun.apply(_this, _this.datas);
            });
            return _this;
        },
        //拒绝时触发
        "catch": function(fun) {
            var data = this.errs;
            this._e.one(REJECTED, function(e) {
                fun(data);
            });
            return this;
        },
        //过程中
        pend: function(fun) {
            this._e.on(PENDING, function(e, data) {
                fun(data);
            });
            return this;
        },
        //后续链
        prom: function() {
            var sp = new SugarPromise();
            each(transToArray(arguments), function(e) {
                sp.add(e);
            });

            var _this = this;

            //增加后代计数
            _this._nCou++;

            //加入后代
            _this._next.push(sp);

            //收集后代的fire
            sp._e.last(FIRE, function() {
                if (!--_this._nCou) {
                    _this._e.emit(FIRE);
                    _this._e = _this._next = null;
                }
            });

            return sp;
        },
        //传递数据
        send: function(data) {
            this.data = data;
            return this;
        },
        //握手给下一级数据
        gift: function(data) {
            each(this._next, function(e) {
                e.send(data);
            });
        },
        //后代链全部完成
        fire: function(fun) {
            this._e.one(FIRE, fun);
            return this;
        },
        //挂起方法
        lock: function() {
            this._h = 1;
        },
        unlock: function() {
            var _this = this;
            //确认是上锁状态
            if (_this._h) {
                _this._h = 0;
                if (!_this.datas) {
                    _this._next && each(_this._next, function(n) {
                        n._run();
                    });
                }
            }
        }
    };
    //main
    var prom = function() {
        var sp = new SugarPromise();
        each(transToArray(arguments), function(e) {
            sp.add(e);
        });
        nextTick(function() {
            sp._run();
        });
        return sp;
    };

    var Promise = glo.Promise;

    //SugarRequire
    function SugarRequire() {
        var redata = this.init.apply(this, arguments);
        if (redata) return redata;

    };
    SugarRequire.fn = SugarRequire.prototype;
    SugarRequire.fn.init = function(args, pubData, p) {
        this._args = args;

        //添加共享数据对象
        this._pub = pubData || {};

        var promRunArr = R.toProm(args, this);
        if (p) {
            this._p = p.prom.apply(p, promRunArr);
        } else {
            this._p = prom.apply(glo, promRunArr);
        }
    };
    SugarRequire.fn.require = function() {
        var srObj = new SugarRequire(transToArray(arguments), this._pub, this._p);
        return srObj;
    };
    SugarRequire.fn.pend = function(fun) {
        var _this = this;
        _this._p.pend(function(e) {
            var redata;
            if (e.state != FULFILLED) {
                redata = extend({
                    val: _this._args[e.no],
                    no: e.no
                }, e.data);
            } else {
                redata = extend({
                    val: _this._args[e.no]
                }, e);
            }
            fun.call(_this, redata);
        });
        return _this;
    };
    SugarRequire.fn.fail = function(fun) {
        var _this = this;
        //兼容低坂本IE操作
        _this._p["catch"](function(e) {
            var reDataArr = [];
            each(e, function(e2) {
                reDataArr.push(extend({
                    no: e2.no
                }, e2.data));
            });
            fun(reDataArr);
        });
        return _this;
    };
    SugarRequire.fn.done = function(fun) {
        var _this = this;
        _this._p.then(function() {
            var p = fun.apply(_this, arguments);
            if (p && Promise && p instanceof Promise) {
                var promiseArr = _this._pa;
                if (!promiseArr) {
                    _this._p.lock();
                    promiseArr = _this._pa = [];
                    nextTick(function() {
                        Promise.all.call(Promise, promiseArr).then(function() {
                            _this._p.unlock();
                        });
                    });
                }
                promiseArr.push(p);
            }
        });
        return _this;
    };
    SugarRequire.fn.post = function(data) {
        this._p.send(data);
        return this;
    };
    SugarRequire.fn.hand = function(data) {
        this._p.gift(data);
        return this;
    };

    var require = function() {
        var srObj = new SugarRequire(transToArray(arguments));
        return srObj;
    };

    //相应的字符串常量
    //define模块类型
    var DEFINE = "define";
    //defer模块类型
    var DEFER = "defer";
    //加载中的状态
    var LOADING = "loading";
    //加载完毕的状态
    var LOADED = "loaded";
    var FINISH = "finish";
    //错误的东西
    var ERROR = "error";

    //main
    var windowHead = document.head;
    //映射资源
    var paths = {};
    //映射目录
    var dirpaths = {};
    //载入模块用的map对象
    var dataMap = {};
    var baseResources = {
        paths: paths,
        dirpaths: dirpaths,
        //js模块相对路径
        baseUrl: "",
        dataMap: dataMap,
        //临时挂起的模块对象
        tempM: {}
    };
    //主要业务逻辑对象
    var R = {
        //将地址数组转换成prom callback arguments
        toProm: function(args, sugarRequire) {
            var promRunArr = [];
            each(args, function(e) {
                var path = R.getPath(e, sugarRequire);
                promRunArr.push(R.agent(path, sugarRequire));
            });
            return promRunArr;
        },
        //转换路径
        getPath: function(pathStr, sugarRequire) {
            //判断是否已经注册了路径
            if (paths[pathStr]) {
                pathStr = paths[pathStr];
            } else {
                var tarreg, res;
                //判断是否注册目录
                for (var i in dirpaths) {
                    tarreg = new RegExp('^' + i);
                    res = tarreg.test(pathStr);
                    if (res) {
                        pathStr = pathStr.replace(tarreg, dirpaths[i]);
                        break
                    }
                }
                // console.log(res);
            }

            //判断是否带协议头部
            //没有协议
            if (!/^.+?\/\//.test(pathStr)) {
                //是否带参数
                if (!/\?.+$/.test(pathStr) && !/.js$/.test(pathStr)) {
                    //没有js的话加上js后缀
                    pathStr += ".js";
                }

                //判断是否有相对路径字样
                var rePath = pathStr.match(/^\.\/(.+)/);
                if (rePath) {
                    //获取相对目录
                    pathStr = getDir(sugarRequire._pub.rel) + rePath[1];
                } else {
                    //加上根目录
                    pathStr = baseResources.baseUrl + pathStr;
                }

                //去除相对上级目录
                pathStr = removeParentPath(pathStr);
            }
            return pathStr;
        },
        //载入前的中介，判断文件类型和缓存状态
        agent: function(url, sugarRequire) {
            return function(resolve, reject) {
                //判断库存内是否有资源
                var tarData = dataMap[url];

                if (!tarData) {
                    //第一次载入这个资源
                    var proms = [];
                    //没有这个资源则载入这个资源
                    tarData = dataMap[url] = {
                        // type: "",
                        // m: "",
                        // script: "",
                        state: LOADING,
                        //需要执行的resolve函数
                        proms: proms
                    }

                    //第一次加载
                    tarData.script = R.loadScript(url, function() {
                        var tempData = baseResources.tempM;
                        var tempType = tempData.type || "file";

                        //设置加载的类型
                        tarData.type = tempType;

                        //加载状态
                        tarData.state = LOADED;

                        //如果是define类型
                        switch (tempType) {
                            case DEFINE:
                                //define模块
                                R.setDefine(url, function(moduleData) {
                                    //设置完成
                                    tarData.state = FINISH;
                                    each(proms, function(e) {
                                        //返回完成
                                        e.res(moduleData);
                                    });
                                    delete tarData.proms;
                                });
                                break;
                            case DEFER:
                                tarData.state = FINISH;
                                //defer模块
                                var deferFun = tarData.m = tempData.val;
                                each(proms, function(e) {
                                    //代理传送门
                                    R.runDefer(url, e.d, e.res, e.rej);
                                });
                                delete tarData.proms;
                                break;
                            default:
                                tarData.state = FINISH;
                                //是普通文件
                                each(proms, function(e) {
                                    //返回完成
                                    e.res();
                                });
                                delete tarData.proms;
                                break;
                        }

                        //设定模块id
                        var ids = tempData.ids;
                        if (ids) {
                            if (getType(ids) == "string") {
                                dataMap[ids] = tarData;
                            } else if (getType(ids) == "array") {
                                each(ids, function(e) {
                                    dataMap[e] = tarData;
                                });
                            }
                        }

                        //清空信息
                        baseResources.tempM = {};
                    }, function() {
                        tarData.state = ERROR;
                        each(proms, function(e) {
                            e.rej({
                                // type: ERROR,
                                state: ERROR,
                                url: url
                            });
                        });
                        //触发全局error
                        sr.error(url, sugarRequire);
                        //清空信息
                        baseResources.tempM = {};
                    });
                }

                switch (tarData.state) {
                    case FINISH:
                        //加载完成了
                        switch (tarData.type) {
                            case DEFINE:
                                resolve(tarData.m);
                                break;
                            case DEFER:
                                R.runDefer(url, this.data, resolve, reject);
                                break;
                            default:
                                resolve();
                        }
                        break;
                    case LOADING:
                    case LOADED:
                        //加载中的
                        tarData.proms.push({
                            res: resolve,
                            rej: reject,
                            d: this.data
                        });
                        break;
                    case ERROR:
                        reject();
                        break;
                }
            };
        },
        //加载script的方法
        loadScript: function(url, callback, errcall) {
            var script = document.createElement('script');
            //填充相应数据
            script.type = 'text/javascript';
            script.setAttribute('async', true);
            //填充url
            script.onload = callback;
            script.onerror = errcall;
            script.src = url;
            //ie10对 async支持差的修正方案
            nextTick(function() {
                windowHead.appendChild(script);
            });

            return script;
        },
        //设置define模块
        setDefine: function(url, callback, errcall) {
            //获取目标数据
            var tarData = dataMap[url];

            //获取临时数据
            var tempData = baseResources.tempM;
            var tempVal = tempData.val;
            var innerRequire;
            //根据类型进行模块设定
            if (getType(tempVal) == "function") {
                var exports = {};
                var moduleData = {
                    exports: exports
                };

                innerRequire = require();

                //设置相对路径
                innerRequire._pub.rel = url;

                //是否requre完结
                var isRequireEnd = false;

                var revalue = tempVal.call({ FILE: url }, function() {
                    var inRequire, args = transToArray(arguments);
                    if (isRequireEnd) {
                        inRequire = new SugarRequire(args, {
                            rel: url
                        });
                    } else {
                        inRequire = innerRequire.require.apply(innerRequire, args);
                    }

                    return inRequire;
                }, exports, moduleData);

                revalue && (moduleData.exports = revalue);

                isRequireEnd = true;

                innerRequire._p.fire(function() {
                    var _exports = moduleData.exports;
                    tarData.m = _exports;
                    callback(_exports);
                });
            } else {
                //非函数则是模块直接内容
                tarData.m = tempVal;
                callback(tempVal);
            }

            return innerRequire;
        },
        //运行defer模块
        runDefer: function(url, data, callback, errcall) {
            //获取目标数据
            var tarData = dataMap[url];
            var deferFun = tarData.m;

            deferFun.call({
                FILE: url,
                data: data
            }, function() {
                // require
                return new SugarRequire(transToArray(arguments), {
                    rel: url
                });
            }, callback, function(data) {
                errcall({
                    state: REJECTED,
                    data: data,
                    url: url
                });
            });
        },
        define: function(d, Ids) {
            baseResources.tempM = {
                type: DEFINE,
                val: d,
                ids: Ids
            };
        },
        defer: function(d, Ids) {
            baseResources.tempM = {
                type: DEFER,
                val: d,
                ids: Ids
            };
        }
    };

    var outerDefine = function(d, Ids) {
        R.define.call(R, d, Ids);
    };
    var outerDefer = function(d, Ids) {
        R.defer.call(R, d, Ids);
    };

    //暴露给外部用对象
    var sr = {
        config: function(data) {
            /*var data = {
                //根目录
                baseUrl: "",
                //快捷映射目录
                paths: {}
            };*/
            //配置baseurl
            baseResources.baseUrl = data.baseUrl || "";
            //配置paths
            // extend(paths, data.paths);
            // dirpaths
            for (var i in data.paths) {
                if (/\/$/.test(i)) {
                    //属于目录类型
                    dirpaths[i] = data.paths[i];
                } else {
                    paths[i] = data.paths[i];
                }
            }
        },
        require: require,
        define: outerDefine,
        defer: outerDefer,
        //直接获取模块
        use: function(url) {
            //获取路径
            var path = R.getPath(url);

            //获取寄存对象
            var tarData = dataMap[path] || {};
            var tarType = tarData.type;

            if (tarType == DEFINE) {
                return tarData.m;
            } else {
                return tarType;
            }
        },
        remove: function(url) {
            //获取路径
            var path = R.getPath(url);

            //获取寄存对象
            var tarData = dataMap[path];

            if (tarData) {
                delete dataMap[path];
                //告示删除成功
                return true;
            }
        },
        //扩展函数
        extend: function(fun) {
            fun(baseResources, R, SugarRequire);
        },
        //加载报错响应
        error: emptyFun,
        //版本号
        version: "3.1"
    };

    //异步初始化断定
    var gsr = glo.sr;
    if (gsr) {
        var gConfig = gsr.config;
        gConfig && sr.config(gConfig);
        var gReady = gsr.ready;
        gReady && nextTick(gReady);
    }

    //init
    glo.require || (glo.require = require);
    glo.define || (glo.define = outerDefine);
    glo.defer || (glo.defer = outerDefer);
    glo.sr = sr;

})(window);