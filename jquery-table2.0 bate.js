var createTable = (function() {
    /**
     * 为一个元素绑定onsize事件
     */
    function bindReSize(element, callback) {
        var wResize = window.onresize;
        element.bindWidth = element.offsetWidth;
        element.bindHeight = element.offsetHeight;
        var resizeCallback = function resizeCallback(even) {
            if (element) {
                let contWidth = element.offsetWidth;
                let contHeight = element.offsetHeight;
                if (contWidth + contHeight === 0) {
                    var isElement = element;
                    var type = document.defaultView.getComputedStyle(isElement, null).display;
                    while (type !== 'none') {
                        isElement = isElement.parentNode;
                        if (!isElement || isElement === document) break;
                        type = document.defaultView.getComputedStyle(isElement, null).display;
                    }
                    return;
                }
                if (element.bindWidth !== contWidth || element.bindHeight !== contHeight) {
                    element.bindWidth = contWidth;
                    element.bindHeight = contHeight;
                    callback.call(element, {
                        bubbles: false,
                        composed: false,
                        isTrusted: true,
                        cancelable: false,
                        returnValue: true,
                        cancelBubble: false,
                        defaultPrevented: false,
                        target: element,
                        srcElement: element,
                        currentTarget: element,
                        path: [window, element],
                        eventPhase: 2,
                        type: 'resize',
                        timeStamp: even.timeStamp
                    });
                }
            }
        };
        window.addEventListener('resize', resizeCallback);
        return resizeCallback;
    };

    /**
     * 为一个元素解绑onsize事件
     */
    function cancelReSize(callback) {
        window.removeEventListener('resize', callback);
    };
    var data = [];
    var scrollWidth = getScrollbarWidth();

    function changeStyle(option) {
        var oldStyle = document.querySelector('style[loadingStyle]');
        oldStyle && document.querySelector('head').removeChild(oldStyle);
        var newStyle = document.createElement('style');
        option.height || (option.height = '100%');
        option.background || (option.background = '#fff');
        newStyle.setAttribute('loadingStyle', '');
        newStyle.innerHTML =
            `[table-flag=head]:not(.noscrool)::after {content: "";
            position: absolute;
            top: 0;
            right: -${scrollWidth}px;
            height: ${option.height}px;
            background: ${option.background};
            width: ${scrollWidth}px;}
            [table-flag=head] tr:nth-child(n + 2) td{
            	border-color: rgba(0,0,0,0) !important;
            }`;
        document.querySelector('head').appendChild(newStyle);
    }

    // 获取dom 获取真实的配置使用 getData(dom)[0].option
    function getData(elem) {
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].elem === elem) return [data[i], i];
        }
        return null;
    };

    // 设置dom
    function setData(elem, opt) {
        var _rtn = getData(elem);
        if (!_rtn) {
            data.push({
                elem: elem,
                option: opt
            });
        } else {
            data[_rtn[1]] = {
                elem: elem,
                option: opt
            };
        };
    };

    // 获取界面滚动条宽度
    function getScrollbarWidth() {
        var $box = $('<div style="width :100px;height:80px;overflow:auto;"></div>');
        $box.appendTo('body').append('<div style="height:200px;"></div>');
        var scrollbarWidth = $box[0].offsetWidth - $box[0].scrollWidth;
        $box.remove();
        return (scrollbarWidth || 17);
    };

    function onScroll(e) {
        var trig = this.parentNode.querySelector('[table-flag=head]');
        trig.style.marginLeft = -this.scrollLeft + 'px';
    };

    // 初始化事件
    function initTable(option = {}) {
        // 初始化option
        formattingOption(option);

        // 检查是否重复初始化结构
        var mainElement = option.main;
        if (!mainElement) return;
        if (mainElement.querySelector('[table-flag=main]') &&
            mainElement.querySelector('[table-flag=body]') &&
            mainElement.querySelector('[table-flag=head]'))
        {
            update(mainElement);
            return;
        }

        // 检查是否满足创建结构
        var mainTable = mainElement.children[0];
        if (mainTable.nodeName.toLowerCase() !== 'table')
            return false;

        // 创建tbody内容到界面
        var tableMain = document.createElement('div');
        var tableHead = document.createElement('div');
        var mainPosition = window.getComputedStyle(mainElement, null).position;
        var style = {};

        tableMain.setAttribute('table-flag', 'main');
        mainTable.setAttribute('table-flag', 'body');
        tableHead.setAttribute('table-flag', 'head');

        tableMain.style.position = 'absolute';
        tableMain.style.bottom = 0;
        tableMain.style.left = 0;
        tableMain.style.right = 0;
        tableMain.style.overflow = 'auto';

        tableHead.style.position = 'absolute';
        tableHead.style.top = 0;
        tableHead.style.left = 0;

        style.overflow = mainElement.style.overflow;
        style.bottom = mainElement.style.bottom;
        style.marginTop = mainTable.style.marginTop;
        style.width = mainTable.style.width;

        mainElement.style.overflow = 'hidden';

        tableMain.appendChild(mainTable);
        mainElement.appendChild(tableHead);
        mainElement.appendChild(tableMain);

        var conf = {
            mainElement,
            mainTable,
            tableMain,
            tableHead,
            style,
            mask: {
                background: option.background
            }
        };

        if (mainPosition === 'static') {
            mainElement.style.position = 'relative';
            conf.style.position = 'static';
        }

        // 绑定conf
        setData(mainElement, conf);
        // 更新
        update(mainElement);
        // 绑定事件
        tableMain.addEventListener('scroll', onScroll);
        conf.bind = bindReSize(mainElement, function(even) {
            update(this);
        });
    };

    function update(mainElement) {
        try {
            var conf = getData(mainElement)[0].option;
        } catch (error) {
            return false;
        }
        var {mainTable, tableMain, tableHead} = conf;
        tableHead.innerHTML = '';
        mainTable.style.width = '100%';
        var theadHeight = mainTable.querySelector('thead').offsetHeight + 1;
        changeStyle({
            background: conf.mask.background,
            height: theadHeight
        });
        var newTable = mainTable.cloneNode(true);
        newTable.style.marginTop = 0;
        newTable.querySelector('tbody').style.visibility = 'hidden';
        var trys = newTable.querySelector('tr');
        tableHead.appendChild(newTable);

        mainTable.style.marginTop = (-theadHeight) + 'px';
        tableMain.style.top = theadHeight + 'px';
        tableHead.style.height = theadHeight + 'px';
        // 增加滚动条判断
        if (mainTable.offsetHeight - tableMain.offsetHeight > theadHeight) {
            tableHead.style.right = `${scrollWidth}px`;
            tableHead.classList.remove('noscrool');
        } else {
            tableHead.style.right = '0px';
            tableHead.classList.add('noscrool');
        }
    };

    function instableUpdate(mainElement) {
        if (typeof mainElement === 'string') {
            mainElement = document.querySelector(mainElement);
        }
        if (!mainElement) return false;

        var tableHead = mainElement.querySelector('[table-flag="head"]');
        var tableMain = mainElement.querySelector('[table-flag="main"]');
        var mainTable = tableMain.querySelector('[table-flag="body"]');

        tableHead.innerHTML = '';
        mainTable.style.width = '100%';
        var theadHeight = mainTable.querySelector('thead').offsetHeight + 1;
        changeStyle({
            height: theadHeight
        });
        var newTable = mainTable.cloneNode(true);
        newTable.style.marginTop = 0;
        newTable.querySelector('tbody').style.visibility = 'hidden';
        var trys = newTable.querySelector('tr');
        tableHead.appendChild(newTable);

        mainTable.style.marginTop = (-theadHeight) + 'px';
        tableMain.style.top = theadHeight + 'px';
        tableHead.style.height = theadHeight + 'px';
        // 增加滚动条判断
        if (mainTable.offsetHeight - tableMain.offsetHeight > theadHeight) {
            tableHead.style.right = `${scrollWidth}px`;
            tableHead.classList.remove('noscrool');
        } else {
            tableHead.style.right = '0px';
            tableHead.classList.add('noscrool');
        }        

    };

    function removeTable(mainElement) {
        if (typeof mainElement === 'string')
            mainElement = document.querySelector(mainElement);
        var data = getData(mainElement);
        if (!data) return;
        var dataOption = data[0].option;
        var dataIndex = data[1];
        var {mainTable, tableMain, tableHead} = dataOption;
        var parentMain = tableMain.parentNode;
        var style = dataOption.style;

        // 解除事件
        tableMain.removeEventListener('scroll', onScroll);
        cancelReSize(dataOption.bind);

        // 解除结构
        tableHead.parentNode.removeChild(tableHead);
        parentMain.appendChild(mainTable);
        parentMain.removeChild(tableMain);

        // 解除样式
        style.position && (parentMain.position = style.style.position);
        parentMain.style.overflow = style.overflow;
        parentMain.style.bottom = style.bottom;
        mainTable.style.marginTop = style.marginTop;
        mainTable.style.width = style.width;
        mainTable.removeAttribute('table-flag');

        // 解绑conf
        data.splice(dataIndex, 1);
    };

    //初始化option
    function formattingOption(option = {}) {
        typeof option === 'string' && (option = {main: document.querySelector(option)});
        option.nodeName && (option = {main: option});
        var {main, background} = option;
        typeof main === 'string' && (option.main = document.querySelector(main));
        background || (option.background = '#fff');
        return option;
    };

    function main(option = {}) {
        switch (option.type) {
            case 'update':
                update(option.main);
                break;
            case 'remove':
                removeTable(option);
                break;
            case 'instableUpdate':
                instableUpdate(option.main);
                break;
            case 'create':
            default:
                initTable(option);
                break;
        }
    };
    
    jQuery &&
    (jQuery.fn.createTable = function(option = {}) {
        var conf = option;
        if (typeof option === 'string') {
            option = {
                type: conf,
                main: this[0]
            };
        } else {
            option.main || (conf.main = this[0]);
        }
        main(option);
    });

    return main;
})();
