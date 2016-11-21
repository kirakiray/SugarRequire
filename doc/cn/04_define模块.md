# define模块

## 教程前说明

后面每个案例讲解前，会对所在案例的目录结构和相关文件说明，请按目录结构和代码参照阅读；

其他*教程前说明* 请参照 *01基础使用和说明* 内容。

------

说到define模块，会想到CMD和AMD规范的模块。SugarRequire也有静态模块，但是模块间的依赖关系，没有遵循CMD或AMD的规范。

### 如何创建define模块

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `define1.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('define1').done(function(data){
	printlog(data);
});
```

```javascript
//define1.js
define(function(){
	return "define1 good";
});
```

运行结果如下：

```
define1 good
```

说明：

`define01.js`定义了模块内容，并通过`return`返回模块内容，跟AMD模块一样；

`define01.js`的内容还可以被替换为以下的写法；

```javascript
//define1.js
define("define1 good");
```

如上，因为没有模块内依赖，所以可以直接定义模块内容；

也可以写成像CMD的模块，如下；

```javascript
//define1.js
define(function(require,exports,module){
	module.exports = "define1 good";
});
```

SugarRequire也能使用没有模块依赖的AMD和CMD规范的模块。

### 有依赖的define模块

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `define1.js`
    * `define2.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('define1').done(function(data){
	printlog(data.d1);
	printlog(data.d2);
});
```

```javascript
//define1.js
define(function(require,exports){
	exports.d1 = "I am define1";
	require('define2').done(function(data){
		exports.d2 = data;
	});
});
```

```javascript
//define2.js
define(function(require,exports){
	return "I am define2 ye";
});
```

运行结果如下：

```
I am define1
I am define2 ye
```

说明：

define内定义函数的第一个参数是`require`方法，给模块内使用的`require`函数，辅助识别依赖模块；

main调用`define1`模块，而`define1`模块依赖了`define2`模块，整个流程将会变成：

- main.js请求加载define1
- define1加载完成后，请求加载define2；
- define2加载完成后，由于没有其他模块依赖，模块完成，并返回模块数据；
- define1获取到define2的数据，由于只依赖了define2，模块完成，并设定模块数据；
- 在main中因为define1模块完成，触发done内的函数，并得到define1设定的数据；

### 使用多个模块

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `define1.js`
    * `define2.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('define1','define2').done(function(data1,data2){
	printlog(data1.d1);
	printlog(data1.d2);
	printlog(data2);
});
```

```javascript
//define1.js
define(function(require,exports){
	exports.d1 = "I am define1";
	require('define2').done(function(data){
		exports.d2 = data;
	});
});
```

```javascript
//define2.js
define(function(require,exports){
	return "I am define2 ye";
});
```

运行结果如下：

```
I am define1
I am define2 ye
I am define2 ye
```

关于多个模块的使用，就像*多样化加载*里介绍的，将模块名写在`require`方法里，当里面模块都加载完毕后，就会将模块数据对应着(arguments)传回done的函数内。

**关于静态模块的复用性：**和defer模块一样，模块文件只会被载入一次，但是define定义函数只会执行一次（defer模块定义函数会重复执行）；

define模块不需要`resolve`返回值，define模块会进行智能判断，获取**同步线程**内的依赖模块。

关于**同步线程**依赖

define模块依赖其他模块，必须在同步进程内使用`require`；模块内异步进程`require`将不对当前模块产生依赖；比如下：

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `define1.js`
    * `define2.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('define1').done(function(data){
	printlog(data.d1);
	printlog(data.d2);
});
```

```javascript
//define1.js
define(function(require,exports){
	exports.d1 = "I am define1";
	setTimeout(function(){
		require('define2').done(function(data){
			exports.d2 = data;
		});
	},1);
});
```

```javascript
//define2.js
define(function(require,exports){
	return "I am define2 ye";
});
```

运行结果如下：

```
I am define1
undefined
```

因为`define1`中引用`define2`是在异步过程中执行的，那么`define1`对`define2`没有产生依赖；`define1`在载入后将会模块封装完成，`main.js`内的done内的函数将会立刻执行，所以d2属性的值是`undefine`；

当`define1`中的引用`define2`完成后，执行done的函数，才会修改`define1`模块的内容；

### 模块内的混合依赖

SugarRequire的模块可以使用多样化的加载方式，组合成更优化性能的框架加载模式。

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `define1.js`
    * `define2.js`
    * `define3.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('define1','define3').done(function(data,define3data){
	printlog(data == define3data.define1data);
	printlog(data.d2 == define3data.d2);
	printlog(define3data.d3);
});
```

```javascript
//define1.js
define(function(require,exports){
	exports.d1 = "I am define1";
	require('define2').done(function(data){
		exports.d2 = data;
	});
});
```

```javascript
//define2.js
define(function(require,exports){
	return "I am define2 ye";
});
```

```javascript
//define3.js
define(function(require,exports){
	require('define1','define2').done(function(d1data,d2data){
		exports.define1data = d1data;
		exports.d2 = d2data;
		exports.d3 = 'I am define3';
	});
});
```

运行结果如下：

```
true
true
I am define3
```

静态模块内也能使用多样化的加载方式依赖别的模块；