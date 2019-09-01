// 1.插件自身的作用域与用户当前的作用域相互独立，也就是插件内部的私有变量不能影响使用者的环境变量；
// 2.插件需具备默认设置参数；
// 3.插件除了具备已实现的基本功能外，需提供部分API，使用者可以通过该API修改插件功能的默认参数，从而实现用户自定义插件效果；
// 4.插件需提供监听入口，及针对指定元素进行监听，使得该元素与插件响应达到插件效果；
// 5.插件支持链式调用。
; (function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.PagingPlugIn = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    "use strict";


    //IE8兼容forEach
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback/*, thisArg*/) {
            var T, k;
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            if (arguments.length > 1) {
                T = arguments[1];
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    };

    /**
     * 根据使用者提供的api参数数据，更改默认的参数
     * 参数一样也好，不一样也罢，都给重新赋值
     * @param {Object} d default默认的参数
     * @param {Object} n new新传入的参数
     * @param {boolean} bool 一个bool值,去判断如果默认值不存在新的属性名，是否追加
     */
    function replaceOption(d, n, bool) {
        for (var p in n) {
            // obj.hasOwnProperty(event) 判定对象是否含有event属性值
            if (n.hasOwnProperty(p) && (d.hasOwnProperty(p) || bool)) {
                d[p] = n[p];
            }
        }
    };

    /**
     *  绑定监听事件
     * @param {String} element   元素 
     * @param {String} type      事件类型
     * @param {function} handler   函数
     */
    function addEvent(element, type, handler) {
        // 添加绑定
        if (element.addEventListener) {
            // 使用DOM2级方法添加事件
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            // 使用IE方法添加事件
            element.attachEvent("on" + type, handler);
        } else {
            // 使用DOM0级方法添加事件
            element["on" + type] = handler;
        }
    };


    /**
     *  模仿jQuery $()
     * @param {string} elemgnt 传入元素的id 
     * @param {*} context 
     */
    function $(elemgnt, context) {
        context = arguments.length > 1 ? context : document;
        return context ? context.querySelector(elemgnt) : null
    };


    /**
     * 
     * @param {*} element   要操作的元素节点
     * @param {*} userOption    用户修改的参数
     */
    let PagingPlugIn = function (element, userOption) {
        //获取DOM元素
        this.pageElement = $(element);
        //设置默认参数
        this.options = {
            total: 300,     //数据总数
            showNum: 30,    //一页显示数据量
            showPage: 3,    //页码显示数量
            pageIndex: 1    //初始加载页面显示页码
        };
        //合并参数配置
        replaceOption(this.options, userOption, true);
        //方便调用，提取出来
        this.total = this.options.total;
        this.showNum = this.options.showNum;
        this.showPage = this.options.showPage;
        this.pageIndex = this.options.pageIndex;
        //计算总页数 :  向上取整 ( 数据总量   /  一页显示的数据量 )
        this.pageSum = Math.ceil(+this.total / +this.showNum);
        //调用对象的方法
        this.renderPaging();    // 渲染页面
        this.changePaging();    // 添加监听事件
    };

    PagingPlugIn.prototype = {
        // 定义id以及内容，便于后面使用
        pagingDom: [
            {
                id: 'page-prev',
                content: '上一页'
            }, {
                id: 'page-num-container',
                content: ''
            }, {
                id: 'page-next',
                content: '下一页'
            }, {
                id: 'page-skip',
            }
        ],
        //添加监听事件，有操作时执行
        changePaging: function () {
            // 为了能让其他函数访问到对象的属性，因为在不同的作用域内，this的指向是不同的
            let self = this;
            // 获取DOM节点
            let pageElement = self.pageElement;
            // 绑定点击事件
            addEvent(pageElement, 'click', function (event) {
                // 如果点击的是上一页 
                if (event.target.id == 'page-prev') {
                    //判断如果是第一页点击上一页return
                    if (self.pageIndex - 1 == 0) {
                        return;
                    }
                    //渲染页面。传入  页码
                    self.renderPaging(self.pageIndex - 1);
                    //如果点击的是下一页
                } else if (event.target.id == 'page-next') {
                    // 判断如果是最后一页 return
                    if (self.pageIndex + 1 > self.pageSum) {
                        return;
                    }
                    //渲染页面。传入  页码
                    self.renderPaging(self.pageIndex + 1);
                    //如果点击的是页码 li
                } else if (event.target.nodeName == 'LI') {
                    //渲染页面。传入  页码
                    self.renderPaging(event.target.innerHTML);
                }
            });
            // 给输入框添加 回车 监听事件
            addEvent(pageElement, 'keyup', function (e) {
                var event = e || window.event;
                var key = event.which || event.keyCode || event.charCode;
                // 如果是回车键
                if (key == 13) {
                    // 判断是否小于0，小于0就等于1
                    if (event.target.value < 0) {
                        event.target.value = 1;
                        // 判断输入数是否大于最大页码，大于就等于最大页码
                    } else if (event.target.value > this.pageSum) {
                        event.target.value = pageSum;
                    }
                    //渲染页面。传入  页码
                    self.renderPaging(event.target.value);
                }
            })
        },
        //渲染页面  传入 页码
        renderPaging: function (e) {
            // 为了能让其他函数访问到对象的属性，因为在不同的作用域内，this的指向是不同的
            let self = this;
            let pagingDom = self.pagingDom;
            let pageElement = self.pageElement;
            // 每次渲染先让原来的变为空
            pageElement.innerHTML = "";
            pagingDom.forEach(function (item) {
                let div = document.createElement('div');
                // 判断如果id是ul的，调用另一个函数
                if (item.id == 'page-num-container') {
                    let ul = document.createElement('ul');
                    ul.setAttribute('id', item.id);
                    //传入 ul 节点， e是页码
                    self.pageItem(ul, e);
                    pageElement.appendChild(ul);
                    return;
                }
                // 如果是输入框执行
                if (item.id == 'page-skip') {
                    let input = document.createElement('input');
                    input.setAttribute('type', 'number');
                    input.value = self.pageIndex;
                    let span = document.createElement('span');
                    span.innerHTML = '/' + self.pageSum + '页';
                    pageElement.appendChild(input);
                    pageElement.appendChild(span);
                    return;
                }
                div.setAttribute('id', item.id);
                div.innerHTML = item.content;
                pageElement.appendChild(div);
            })
        },
        /**
         *  渲染页码
         * @param {String} e ul元素，追加
         * @param {Number} index  当前页码
         */
        pageItem: function (e, index) {
            // 首次加载没有传入index，就要去获取配置的页码
            let pageIndex = index ? index : this.pageIndex;
            // 要显示的页码
            let showPage = this.showPage;
            // 总页数
            let pageSum = this.pageSum;

            // 如果页码大于总页数  页码等于最大数
            if (pageIndex > pageSum) {
                pageIndex = pageSum;
                // 如果页码小于0  页码等于1
            } else if (pageIndex < 0) {
                pageIndex = 1;
            }

            // 如果要显示的页码大于总页数
            if (showPage > pageSum) {
                // 循环总页数的数量
                for (var i = 0; i < pageSum; i++) {
                    let li = document.createElement('li');
                    if (i + 1 == pageIndex) {
                        li.setAttribute('class', 'page-num-item page-show');
                        li.innerHTML = i + 1;
                        // 要把新的页码返回回去
                        this.pageIndex = i + 1;
                    } else {
                        li.setAttribute('class', 'page-num-item');
                        li.innerHTML = i + 1;
                    }
                    e.appendChild(li);
                }
                return;
            }

            // 获取要显示页码的中间值
            let middle = Math.ceil(+showPage / 2);

            // 如果 页码 小于一半，场景模拟就 5个页码，显示1 2页码时，页码不需要居中
            if (pageIndex < middle) {
                for (var i = 0; i < showPage; i++) {
                    let li = document.createElement('li');
                    if (i + 1 == pageIndex) {
                        li.setAttribute('class', 'page-num-item page-show');
                        li.innerHTML = i + 1;
                        this.pageIndex = i + 1;
                    } else {
                        li.setAttribute('class', 'page-num-item');
                        li.innerHTML = i + 1;
                    }
                    e.appendChild(li);
                }
                return;
            }

            // 如果 页码 大于 总页数-显示的一般页码， 模拟场景 5个页码， 总共10页，显示9 10时，数据不需要居中
            if (pageIndex > pageSum - middle) {
                for (var i = pageSum - showPage; i < pageSum; i++) {
                    let li = document.createElement('li');
                    if (i + 1 == pageIndex) {
                        li.setAttribute('class', 'page-num-item page-show');
                        li.innerHTML = i + 1;
                        this.pageIndex = i + 1;
                    } else {
                        li.setAttribute('class', 'page-num-item');
                        li.innerHTML = i + 1;
                    }
                    e.appendChild(li);
                }
                return;
            }

            // 正常的中间页码
            for (var i = +pageIndex - middle; i < +pageIndex + middle - 1; i++) {
                let li = document.createElement('li');
                if (i + 1 == pageIndex) {
                    li.setAttribute('class', 'page-num-item page-show');
                    li.innerHTML = i + 1;
                    this.pageIndex = i + 1;
                } else {
                    li.setAttribute('class', 'page-num-item');
                    li.innerHTML = i + 1;
                }
                e.appendChild(li);
            }
        }
    };

    return PagingPlugIn;
}));
