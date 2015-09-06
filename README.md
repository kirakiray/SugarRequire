# SugarRequire
It's BrowserRequire 2.0

[BrowserRequire](https://github.com/kirakiray/BrowserRequire) 的2.0版本

## 关于添加功能规则：

开发者通过自带的br.extend函数，来扩展SugarRequire的功能；在此功能受到广泛使用并兼顾安全性，才将在原框架添加此功能。

## 注意事项：

BrowserRequire 1.x中的插件不适用于当前2.0版本。

### 关于为什么更名：

由于1.x版本 [BrowserRequire](https://github.com/kirakiray/BrowserRequire) 名字占用了Browser的字符串，可能会导致以后搜索类似 “浏览器的require” 产生误差，故更名；

在1.2版本中合并了BrowserRequire-sugar插件后，发现编码习惯更偏向用sugar插件提供的方法，故在2.0版本中将BrowserRequire更名为SugarRequire；

### 目录结构

doc   SugarRequire的使用文档；

example   SugarRequire的案例；

plugin   SugarRequire官方提供的简易插件；

src   SugarRequire的源代码；

test   SugarRequire的单元测试目录；