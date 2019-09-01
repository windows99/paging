# 原生js实现分页插件
2019/09/01

### 前言

工作之余，写写东西提升自己，有问题或者建议，可以联系我的邮箱wsk_web@163.com。（一起学习也可以）
[仓库地址](http:)
[在线预览](jjj)

### 使用

1.引入paging.js、paging.css;（文件中base是重置样式文件，根据项目自行引入）
2.指定一个容器的id，比如

``` 
<div id='page-list'>
```
3.调用js，配置参数。比如

``` 
new PagingPlugIn("#page-list",{
	total: 100, 
	showNum: 30, 
	showPage: 5, 
	pageIndex: 2, 
})
```
| 参数名    | 参数类型 | 默认值 | 参数说明             |
| --------- | -------- | ------ | -------------------- |
| total     | number   | 100    | 数据总数             |
| showNum   | number   |    30   | 一页显示多少数据     |
| showPage  | number   |     5   | 页面最多显示多少页码 |
| pageIndex | number   |     1   | 初始化加载显示的页码 |

### 结尾

这是第一次编写插件，借鉴了很多文章，有兴趣可以点下方连接，如有其他功能建议，可以联系我的邮箱
https://juejin.im/post/5b592635e51d4533d2043e15#heading-5
https://www.jianshu.com/p/e65c246beac1
http://geocld.github.io/2016/03/10/javascript_plugin/
