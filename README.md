# SugarRequire

It's SugarRequire 3.0

## 为什么要使用SugarRequire

你遇到过开发异常大的web项目而导致加载缓慢而导致体验差的问题吗；

在某个数量级下，使用webpack之类的打包方案不会有问题；但当业务耦合和代码量达到一定程度，过大的文件体积会导致会导致卡顿，严重影响体验，所以需要异步模块方案；

市面上已有web前端模块化方案，更多的是参照一些成熟语言的语法，不可避免的需要同步读取文件，达到模块化的目的，而web前端开发初始并不能快速的获取整个项目的文件（因为同步开发中，引入模块的快慢取决于硬盘的io性能，速度之快基本可以忽略不计）；而requireJS的AMD规范在很多场景下并不是那么完美；

SugarRequire就是为了更适合web浏览器用的模块化方案；

SugarRequire能够极大地提升javascript的数据可复用性和更好的发挥异步特性，降低web前端开发的项目复杂度，优化用户体验；

SugarRequire适合需要异步加载模块的场合；如果你开发的项目的最后，输出是一个包的做法，建议使用AMD、CMD、UMD或es6模块。

比requirejs和seajs强大很多，SugarRequire的打包混淆文件（`.min`）的js文件都比他们小；

精炼，bug少，组合变化多端（3.0版本的`.min`混淆压缩文件才6kb左右）；

可搭配其他的框架（如jquery，vuejs之类），因为SugarRequire只负责资源管理，所以能很好的搭配第三方视图框架或者database库。

## 文档

[中文文档](./doc/cn/readme.md);

## 注意事项：

SugarRequire 3.0 框架不能使用 2.0 和 1.0 版本的插件；

## 目录结构

doc——SugarRequire的使用文档；

plugin——SugarRequire官方提供的简易插件；

src——SugarRequire的源代码；

test——SugarRequire的单元测试目录；
