(function(Global) {
    //baseData
    //自定义的路径
    var paths = {};
    //载入模块用的map对象
    var dataMap = {};
    var baseResources = {
        paths: paths,
        //js模块相对路径
        baseUrl: "",
        dataMap: dataMap,
        //临时挂起的模块对象
        tempM: null,
        //版本号
        version: "sugarRequire 2.0",
    };
    //存放插件方法的统一对象
    var sr = {}

    //COMMON
    var nextTickArr = [],
        isTick = false,
        windowHead = document.getElementsByTagName('head')[0];


    //public function
    var emptyFun = function() {},
        /**
           异步调用方法
           @param {function} callback 异步执行的函数
        */
        nextTick = function(callback) {
            if (!isTick) {
                isTick = true;
                setTimeout(function() {
                    each(nextTickArr, function(e) {
                        e();
                    });
                    nextTickArr = [];
                    isTick = false;
                }, 0);
            }
            nextTickArr.push(callback);
        },
        /**
            判断传入值的类型
            @param {All} value 任意值
            @return {string} 返回当前值的类型的字符串 string|object|number...
        */
        getType = function(value) {
            return Object.prototype.toString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');
        },
        /**
            fix
            继承对象的方法，同Object.create
            @param {object} 需要继承的对象
            @return {object} 继承后的新对象
        */
        create = Object.create || function(obj) {
            var f = emptyFun;
            f.prototype = obj;
            return new f();
        },
        /**
            转换为数组
            @param {arguments} args 函数的arguments对象
            @return {array} arguments转换的数组
        */
        transToArray = function(args) {
            return Array.prototype.slice.call(args);
        },
        /*
            适用于数组的map方法
            @param {array} arr 需要遍历的数组
            @param {function} fun 遍历时的callback
        */
        each = (function() {
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
        })(),
        /**
            合并对象，like jQuery.extend
            @param {Object} def 后面的对象要合并到该对象上
            @param {Object} opt 要向前合并的对象
            @return {Object} 第一个被合并的对象
        */
        extend = function(def, opt) {
            for (var i in opt) {
                def[i] = opt[i];
            }
            return def;
        },
        /**
            给字符串去掉.js后缀
            @param {string} value 传入的文件名（有无带.js后缀都可以）
            @return {string} 返回去掉.js后缀的文件名
        */
        removeJS = function(value) {
            return value.replace(/.js$/g, "");
        },
        /**
            在字符串后面加上.js后缀
            @param {string} value 传入文件名
            @return {string} 添加.js后缀的文件名
        */
        concatJS = function(value) {
            return value.concat('.js');
        },
        /*
            判断对象是否是空对象
            @param {object} obj 传入的对象
        */
        isEmpty = function(obj) {
            for (var i in obj) {
                return false;
            }
            return true;
        };


    //public class
    var BindEvent = function() {
        this._map = {};
        this._sub = [];
    };
    BindEvent.fn = BindEvent.prototype;

    //获取事件组对象
    BindEvent.fn._get = function(eventName) {
        return this._map[eventName] || (this._map[eventName] = {
            eves: []
        });
    };

    //注册事件
    BindEvent.fn.on = function(eventName, callback, data) {
        //获取事件数组
        var evesObj = this._get(eventName);

        //判断是否进入ever状态
        var everData = evesObj.ever;
        if (everData) {
            var callObj = {
                bData: data,
                tData: everData.data,
                name: eventName
            };
            if (everData.type == 1) {
                //状态1为同步执行
                callback(callObj);
            } else if (everData.type == 2) {
                //状态2为异步执行
                nextTick(function() {
                    callback(callObj);
                });
            }
            return;
        }

        //添加事件
        evesObj.eves.push({
            data: data,
            _call: callback
        });
    };

    //注销事件
    BindEvent.fn.off = function(eventName, callback) {
        //获取事件组对象
        var evesObj = this._get(eventName);
        //根据参数进行事件清理
        //清理所有事件
        if (!arguments.length) {
            delete this._map;
            this._map = [];
        }

        //清理指定事件
        if (eventName && !callback) {
            this._map[eventName].eves = [];
        }

        //清理指定callback
        if (eventName && callback) {
            var newEventGroup = [];
            each(evesObj.eves, function(e) {
                if (e._call != callback) {
                    newEventGroup.push(e);
                }
            });
            evesObj.eves = newEventGroup;
        }
    };

    //注册一次性事件
    BindEvent.fn.one = function(eventName, callback, data) {
        //获取事件组对象
        var evesObj = this._get(eventName);

        //添加事件
        evesObj.eves.push({
            one: true,
            data: data,
            _call: callback
        });
    };

    //触发事件
    BindEvent.fn.trigger = function(eventName, tData) {
        //获取事件组对象
        var evesObj = this._get(eventName);

        //如果设置ever，则屏蔽此方法
        if (evesObj.ever) {
            //return;
        }

        //优先执行first call
        var firstEvent = evesObj._first;
        firstEvent && firstEvent._call({
            bData: firstEvent.data,
            tData: tData,
            name: eventName
        });

        //遍历数组内函数
        var newEventGroup = [];
        each(evesObj.eves, function(e) {
            e._call({
                bData: e.data,
                tData: tData,
                name: eventName
            });
            //添加非一次性事件
            if (!e.one) {
                newEventGroup.push(e);
            }
        });

        //重置事件数组
        evesObj.eves = newEventGroup;

        //最后执行last call
        var lastEvent = evesObj._last;
        lastEvent && lastEvent._call({
            bData: lastEvent.data,
            tData: tData,
            name: eventName
        });

        //触发克隆对象
        var subbindevent = this._sub;
        each(subbindevent, function(e) {
            e.trigger(eventName, tData);
        });
    };

    //永久性触发事件
    BindEvent.fn.ever = function(eventName, data, sync) {
        //获取事件组对象
        var evesObj = this._get(eventName);
        //设定即时运行
        if (sync) {
            evesObj.ever = {
                //状态1为同步执行
                type: 1,
                data: data
            };
        } else {
            evesObj.ever = {
                //状态2为异步执行
                type: 2,
                data: data
            };
        }
        //先触发一次相应事件
        this.trigger(eventName, data);
        //清除事件
        this.off(eventName);
    };

    //绝对会在队列第一触发事件
    BindEvent.fn.first = function(eventName, callback, data) {
        //获取事件组对象
        var evesObj = this._get(eventName);
        evesObj._first = {
            data: data,
            _call: callback
        };
    };

    //绝对会在队列最后触发事件
    BindEvent.fn.last = function(eventName, callback, data) {
        //获取事件组对象
        var evesObj = this._get(eventName);
        evesObj._last = {
            data: data,
            _call: callback
        };
    };

    //克隆对象（父对象触发事件，克隆对象也会触发相应事件；克隆对象触发事件，不会影响父对象）
    BindEvent.fn.clone = function() {
        var subEvent = new BindEvent();
        this._sub.push(subEvent);
        return subEvent;
    };

    //分散集合器
    //只有当所有子方法运行，并且init后才会触发ready事件
    //继承BindEvent
    var GatherFunction = function() {
        BindEvent.apply(this, arguments);
        //记录id
        this._cid = 0;
        //记录数据用对象
        this._dMap = [];
        //是否init
        this._isInit = false;
        //是否create
        this._isCreate = false;
    };
    GatherFunction.fn = GatherFunction.prototype = create(BindEvent.prototype);
    //制造子方法
    GatherFunction.fn.create = function() {
        this._isCreate = true;
        var _this = this;
        //当前id并递增
        var id = this._cid++;
        return function(data) {
            //递减id
            _this._cid--;
            //填充写入数据
            _this._dMap[id] = data;
            //判断是否触发
            if (_this._isInit && _this._cid == 0) {
                _this.trigger('chainend', _this._dMap);
            }
        };
    };
    //准备完毕的方法
    GatherFunction.fn.init = function() {
        this._isInit = true;
        if (this._isCreate && this._cid == 0) {
            this.trigger('chainend', this._dMap);
        }
    };

    //business class
    var Require = function(urls, originGather) {
        if (originGather) {
            this._origin = originGather;
            var rEvent = this._rEvent = new BindEvent();
            var subFun = originGather.create();
            rEvent.last('ready', function() {
                subFun();
            });
        } else {
            this._origin = this._rEvent = new GatherFunction;
            this._origin.init();
        }

        var _this = this;
        this.done(function(data) {
            _this.ready(data);
        });
        this.doing(function(data) {
            _this.loading(data);
        });
        this.fail(function(data) {
            _this.error(data);
        });

        //记录需要加载的资源
        this._urls = urls;

        //后续require链
        this._subRequire = [];
    };
    Require.fn = Require.prototype;
    Require.fn.ready = emptyFun;
    Require.fn.error = emptyFun;
    Require.fn.loading = emptyFun;
    Require.fn.done = function(fun) {
        this._rEvent.on('ready', function(e) {
            fun(e.tData);
        });
        return this;
    };
    Require.fn.doing = function(fun) {
        this._rEvent.on('loading', function(e) {
            fun(e.tData);
        });
        return this;
    };
    Require.fn.fail = function(fun) {
        this._rEvent.on('error', function(e) {
            fun(e.tData);
        });
        return this;
    };
    Require.fn.require = function() {
        var urls = transToArray(arguments);
        var subRequire = new Require(urls, this._origin);
        this._subRequire.push(subRequire);
        return subRequire;
    };

    //business function
    //获取script
    var getScriptTag = function(url) {
        var script = document.createElement('script');
        //填充相应数据
        script.type = 'text/javascript';
        script.setAttribute('async', true);
        //填充url
        script.src = url;
        return script;
    };

    //修正目录的相对位置，根目录等
    var getByPath = function(url) {

    };

    //main
    var R = {
        //加载script用函数
        loadScript: function(url, callback) {
            var scriptTag = getScriptTag(concatJS(url));
            scriptTag.onload = function() {
                callback({
                    status: "succeed",
                    script: scriptTag
                });
            };
            scriptTag.onerror = function() {
                callback({
                    status: "error",
                    script: scriptTag
                });
            };
            windowHead.appendChild(scriptTag);
        },
        //根据temM获取相应内容
        getTempData: function() {

        },
        //loadScript前的代理
        scriptAgent: function(url) {
            var scriptData = "";

            //判空并填充相应数据
            if (!dataMap[url]) {
                scriptData = dataMap[url] = {
                    //加载状态
                    status: "wait",
                    //挂载对象
                    event: new BindEvent()
                }
                R.loadScript(removeJS(url), function(sData) {
                    scriptData.event.ever(scriptData.status = sData.status);
                });
            } else {
                scriptData = dataMap[url];
            }

            //返回事件对象
            return scriptData.event;
        },
        //组载入文件
        groupScript: function(urls) {
            var gatherFun = new GatherFunction();
            each(urls, function(e) {
                var scriptEvent = R.scriptAgent(e);
                var subFun = gatherFun.create();
                scriptEvent.on('succeed', function(e2) {
                    var tData = e2.tData;
                    //触发loading函数
                    gatherFun.trigger('loading', tData);
                    //触发子函数并记录数据
                    subFun(tData);
                });
            });
            gatherFun.init();
            return gatherFun;
            /*gatherFun.on('chainend', function(data) {
                callback(data);
            });*/
        },
        //require拆分中转器
        splitter: function(requireObj) {
            //获取urls
            var urls = requireObj._urls;
            var groupScriptGatherFun = R.groupScript(urls);
            groupScriptGatherFun.on('chainend', function(data) {
                requireObj._rEvent.trigger('ready');
                //获取下一组urls并载入
                each(requireObj._subRequire, function(e) {
                    R.splitter(e);
                });
            });
        },
        //暴露给外部用的require
        require: function() {
            var urls = transToArray(arguments);
            var requireObj = new Require(urls);
            //异步抛入require
            nextTick(function() {
                R.splitter(requireObj);
            });
            return requireObj;
        }
    };

    //init

    //test
    Global.BindEvent = BindEvent;
    Global.GatherFunction = GatherFunction;
    Global.Require = Require;
    Global.R = R;
})(window);