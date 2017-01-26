# defer延时模块

## 教程前说明

后面每个案例讲解前，会对所在案例的目录结构和相关文件说明，请按目录结构和代码参照阅读；

其他*教程前说明* 请参照 *01基础使用和说明* 内容。

------

### 如何创建defer模块

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `defer1.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('defer1').done(function(data){
	printlog(data);
});
```

```javascript
//defer1.js
defer(function(require,resolve){
	resolve('defer1 files ye');
});
```

运行结果如下：

```
defer1 files ye
```

说明：

`defer1`模块载入完毕后，会通过arguments[1]的`resolve`方法返回数据，数据会传送到引用模块的`done`运行的函数内。

### defer模块的延迟性

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `defer1.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('defer1').done(function(data){
	printlog(data);
});
```

```javascript
//defer1.js
defer(function(require,resolve){
    setTimeout(function(){
		resolve('defer1 files ye');
    },1000);
});
```

运行结果如下：

```
defer1 files ye
```

说明：

`defer1`模块载入完后，在一秒后用resolve返回了数据；所以`main.js`显示done内的函数会在一秒后才开始执行，并得到`defer1`返回的数据。

defer模块适合用于控制异步流的模块，比如用ajax获取数据，用defer模块封装相应的模块内容，就能轻松通过require函数获取数据。

### 给defer模块传送数据

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `plusDefer.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('plusDefer')
	.post(8)
	.done(function(data){
		printlog(data);
	});
```

```javascript
//plusDefer.js
defer(function(require,resolve){
	 var data = this.data;
    setTimeout(function(){
		var count = data + 100;
		resolve(count);
    },1000);
});
```

运行结果如下：

```
108
```

说明：

案例中通过`post`方法传送数据到plusDefer模块，plusDefer模块在一秒后计算结果，将结果返回；

只有defer模块才能通过`this.data`获取数据；

### defer模块的重复使用

目录结构:

* `index.html`
* `js`
	* `sr.js`
	* `main.js`
    * `plusDefer.js`

code:

```javascript
sr.config({
	baseUrl : "js/"
});

//main.js
require('plusDefer')
	.post(8)
	.done(function(data){
		printlog(data);
	});

require('plusDefer')
	.post(100)
	.done(function(data){
		printlog(data);
	});
```

运行结果如下：

```
108
200
```

说明：

defer模块文件也只会被加载一次；在加载完成后在使用defer模块，会重新执行defer内定义的函数，而不会重新加载该文件。

当defer定义函数内不执行返回数据方法（`resolve`）时，依赖流程将会被卡死，所以请注意，使用defer模块请做好返回数据操作（后面会讲reject，也是属于返回数据的操作）。