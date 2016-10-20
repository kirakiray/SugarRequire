(function(glo) {
    //function
    var getCallLine = function() {
        try {
            var a = null;
            a();
        } catch (e) {
            if (!e.stack) {
                return null;
            }
            // console.log(e.stack);
            var linkArr = [];
            $.each(e.stack.toString().split(/\n/g), function(i, e) {
                var m_arr = e.match(/\w+?:\/\/\/.+\d/);
                linkArr.push(m_arr && m_arr[0]);
            });
            return linkArr;
        }
    };
    var getType = function(value) {
        return Object.prototype.toString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');
    };

    //class
    //组容器
    var SrGroup = function(title) {
        this.ele = $('<div class="br_test_group"></div>');
        this.title = $('<div class="br_test_g_title"><div class="br_test_g_title_content">' + title + '</div><div class="br_test_g_title_tips"><div class="total_content">0</div><div class="safe_content">0</div><div class="warn_content">0</div><div class="error_content">0</div></div></div>');
        this.ele.append(this.title);
        this.content = $('<div class="br_test_g_content"></div>');
        this.ele.append(this.content);
        this.totalCount = 0;
        this.safeCount = 0;
        this.warnCount = 0;
        this.errorCount = 0;
    };
    SrGroup.fn = SrGroup.prototype;
    SrGroup.fn.changeTotal = function(num) {
        this.ele.find('.total_content').text(num);
    };
    SrGroup.fn.changeSafe = function(num) {
        this.ele.find('.safe_content').text(num);
    };
    SrGroup.fn.changeWarn = function(num) {
        this.ele.find('.warn_content').text(num);
    };
    SrGroup.fn.changeError = function(num) {
        this.ele.find('.error_content').text(num);
    };
    SrGroup.fn._appendLine = function(_cline) {
        var srline = new SrLine();

        //设置输入点
        var calllines = _cline || getCallLine();
        // console.log(calllines);
        srline._callline = calllines[4];

        this.changeTotal(++this.totalCount);
        var _this = this;
        srline.onPrint = function(e) {
            if (e.beforeState == e.nowState) {
                return;
            }
            switch (e.beforeState) {
                case "warn":
                    _this.changeWarn(--_this.warnCount);
                    break;
                case "error":
                    _this.changeError(--_this.errorCount);
                    break;
                case "succeed":
                    _this.changeSafe(--_this.safeCount);
                    break;
            }
            switch (e.nowState) {
                case "warn":
                    _this.changeWarn(++_this.warnCount);
                    break;
                case "error":
                    _this.changeError(++_this.errorCount);
                    break;
                case "succeed":
                    _this.changeSafe(++_this.safeCount);
                    break;
            }

            //根据状态数目，设定组标题颜色   error优先级最高  其次warn 最后succeed
            if (_this.errorCount) {
                _this.title.removeClass('brtest_warntitle');
                _this.title.addClass('brtest_errtitle');
            } else if (_this.warnCount) {
                _this.title.removeClass('brtest_errtitle');
                _this.title.addClass('brtest_warntitle');
            } else {
                _this.title.removeClass('brtest_errtitle');
                _this.title.removeClass('brtest_warntitle');
            }

            _this.onchangestate();
        };
        this.content.append(srline.ele);
        return srline;
    };
    SrGroup.fn.log = function(text) {
        var srline = this._appendLine();
        srline.log(text);
        return srline;
    };
    SrGroup.fn.warn = function(text) {
        var srline = this._appendLine();
        srline.warn(text);
        return srline;
    };
    //给order用的提示
    SrGroup.fn._lineTip = function() {
        var srline = this._appendLine();
        return srline;
    };
    SrGroup.fn.error = function(text) {
        var srline = this._appendLine();
        srline.error(text);
        return srline;
    };
    SrGroup.fn.succeed = function(text) {
        var srline = this._appendLine();
        srline.succeed(text);
        return srline;
    };
    //组内有数量变动
    SrGroup.fn.onchangestate = function() {};
    //设置序列记录器
    SrGroup.fn.setOrder = function() {
        // var data = {
        //     name: "",
        //     descript: "",
        //     count: 1,
        //     max: "",
        //     min: ""
        // };
        var orderMap = this._orderMap || (this._orderMap = {});
        var _this = this;

        var callline = getCallLine()[3];

        //当前开始的id
        this._orderId = 0;
        //order的总数记录
        this._groupCount = 0;
        $.each(arguments, function(i, e) {
            var incall = function(i, e) {
                var logObj = _this._lineTip();
                //强制替换callline
                logObj._callline = callline;
                logObj.warn(e.descript || e.name);


                var orderObj = {
                    id: i,
                    logObj: logObj,
                    max: e.max || e.count || 1,
                    min: e.min || e.count || 1,
                    count: 0
                };
                orderMap[e.name] = orderObj;
                logObj.inContent.addText([{
                    k: "max",
                    v: orderObj.max
                }, {
                    k: "min",
                    v: orderObj.min
                }]);
            };
            if (getType(e) == "array") {
                $.each(e, function(i2, e) {
                    incall(i, e);
                });
            } else {
                incall(i, e);
            }
            incall = null;
        });
        //只能执行一次
        this.setOrder = function() {
            console.warn('setOrder invalid!');
        };
    };
    SrGroup.fn.order = function(name) {
        var orderObj = this._orderMap[name];

        var calllines = getCallLine();
        // console.log(calllines);
        orderObj.logObj._callline = calllines[3];

        //顺序计算
        if (orderObj.id > this._orderId) {
            //当大于id时，更换当前id顺序
            this._orderId = orderObj.id;
        }

        //数量计算
        orderObj.count++;
        this._groupCount++;

        // 在最小值内是警告状态   在范围内是正确状态    超出范围是错误状态
        var logarr = [{
            k: "id",
            v: orderObj.count
        }, {
            k: "groupId",
            v: this._groupCount
        }];

        if (this._orderId > orderObj.id) {
            //小于id属于出错
            logarr.push({
                type: 'error',
                k: "info",
                v: "sequence error"
            });
            orderObj.logObj.error(logarr);
        } else if (orderObj.count > orderObj.max) {
            logarr.push({
                type: 'error',
                k: "info",
                v: "exceed the maximum limit"
            });
            orderObj.logObj.error(logarr);
        } else if (orderObj.count < orderObj.min) {
            orderObj.logObj.warn(logarr);
        } else {
            orderObj.logObj.succeed(logarr);
        }
    };

    //行容器
    var SrLine = function() {
        var ele = this.ele = $('<div class="br_test_g_line"><span class="br_test_g_line_text"></span><span class="more_clicker">more</span></div>');
        var con = this.inContent = new SrLineInner();
        ele.append(this.inContent.ele);
        //点击更多按钮
        ele.find('.more_clicker').click(function() {
            var $this = $(this);
            if ($this.hasClass('more_clicker_shou')) {
                $this.removeClass('more_clicker_shou');
                con.hide();
            } else {
                $this.addClass('more_clicker_shou');
                con.show();
            }
        });
    };
    SrLine.fn = SrLine.prototype;
    SrLine.fn.log = function(text) {
        this.ele.removeClass('br_test_warn').removeClass('br_test_safe').removeClass('br_test_error');
        this._emitPrint('log', text);
    };
    SrLine.fn.warn = function(text) {
        this.ele.removeClass('br_test_safe').removeClass('br_test_error');
        this.ele.addClass('br_test_warn');
        this._emitPrint('warn', text);
    };
    SrLine.fn.error = function(text) {
        this.ele.removeClass('br_test_warn').removeClass('br_test_safe');
        this.ele.addClass('br_test_error');
        this._emitPrint('error', text);
    };
    SrLine.fn.succeed = function(text) {
        this.ele.removeClass('br_test_warn').removeClass('br_test_error');
        this.ele.addClass('br_test_safe');
        this._emitPrint('succeed', text);
    };
    SrLine.fn._emitPrint = function(state, text) {
        var textObj = [{
            type: state,
            k: "state",
            v: state
        }];

        switch (getType(text)) {
            case "string":
                this.ele.find('.br_test_g_line_text').text(text);
                text && textObj.push({
                    k: "text",
                    v: text
                });
                break;
            case "array":
                textObj = textObj.concat(text);
                break;
            case "object":
                textObj.push(text);
                break;
        }

        //获取注册点
        var callline = this._callline;
        if (!callline) {
            callline = getCallLine()[4];
        }
        textObj.push({
            type: "console",
            k: "position",
            v: callline,
            click: function() {
                console.log(callline);
            }
        });
        this._callline = null;

        this.inContent.addText(textObj);

        var beforeState = this._state;
        this._state = state;
        this.onPrint({
            text: text,
            beforeState: beforeState,
            nowState: state
        });
    };
    //改变状态触发的callback
    SrLine.fn.onPrint = function(data) {
        console.log(data);
    };

    //行内部容器
    var SrLineInner = function() {
        this.ele = $('<div class="_gline_incontent _shou"></div>');
    };
    SrLineInner.fn = SrLineInner.prototype;
    SrLineInner.fn.show = function() {
        this.ele.removeClass('_shou');
    };
    SrLineInner.fn.hide = function() {
        this.ele.addClass('_shou');
    };
    SrLineInner.fn.addText = function(datas) {
        // var datas = [{
        //     type: "error",
        //     k: "",
        //     v: "",
        //     click:""
        // }];
        var _gline_incontent_block = $('<div class="_gline_incontent_block"></div>');
        $.each(datas, function(i, e) {
            var _gline_incontent_line = $('<div class="_gline_incontent_line"></div>');

            //根据类型设定
            switch (e.type) {
                case "warn":
                    _gline_incontent_line.addClass('_incontent_line_warn');
                    break;
                case "error":
                    _gline_incontent_line.addClass('_incontent_line_err');
                    break;
                case "succeed":
                    _gline_incontent_line.addClass('_incontent_line_safe');
                    break;
                case "console":
                    _gline_incontent_line.addClass('_canclick');
                    break;
            }

            //设定值
            _gline_incontent_line.append('<div class="_gline_incontent_key">' + e.k + '</div>');
            _gline_incontent_line.append('<div class="_gline_incontent_value">' + e.v + '</div>');

            //设置点击事件
            if (e.click) {
                _gline_incontent_line.find('._gline_incontent_value').click(e.click);
            }

            _gline_incontent_block.append(_gline_incontent_line);
        });
        this.ele.append(_gline_incontent_block);
    };

    //base
    //主体容器
    var $srall = $('<div class="br_test_all"><div class="br_test_title"></div></div>');
    var $container = $('<div class="br_test_container"></div>');
    $srall.append($container);

    var setNarrow = function() {
        $srall.addClass('narrow_all');
        $srall.prepend('<div class="narrow_pop">↑</div>');
        $srall.find('.narrow_pop').click(function(e) {
            if ($srall.hasClass('narrow_open')) {
                $srall.removeClass('narrow_open');
            } else {
                $srall.addClass('narrow_open');
            }
        });
    };

    //main
    function srInit(options) {
        var defaults = {
            title: "SRTEST",
            narrow: false
        };
        $.extend(defaults, options);
        $srall.find('.br_test_title').text(defaults.title);

        //判断是否需要设置narrow模式
        if (defaults.narrow) {
            setNarrow();
        }

        $('body').append($srall);
    };

    function group(title) {
        var srgroup = new SrGroup(title);
        srgroup.onchangestate = function() {
            if ($srall.find('.brtest_errtitle').length) {
                $srall.find('.br_test_title').addClass('errortitle').removeClass('warntitle');
            } else if ($('.brtest_warntitle').length) {
                $srall.find('.br_test_title').addClass('warntitle').removeClass('errortitle');
            } else {
                $srall.find('.br_test_title').removeClass('warntitle').removeClass('errortitle');
            }
        };
        $container.append(srgroup.ele);
        return srgroup;
    }

    //init

    //global
    glo.srtest = {
        init: srInit,
        group: group
    };

})(window);
