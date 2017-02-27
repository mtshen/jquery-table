var createTable = (function () {
    var data = [];
    var scrollWidth = getScrollbarWidth();
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
            }
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
    
    // 初始化事件
    function initTable(option) {
        formatting_option(option);
        var mainElement = option.main;
        var mainTable = mainElement.children[0];
        if (mainTable.nodeName.toLowerCase() !== 'table') {
            return false;
        }

        // 创建tbody内容到界面
        var tableMain = document.createElement('div');
        var tableHead = document.createElement('div');
        var mainPosition = window.getComputedStyle(mainElement, null).position;

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
        tableHead.style.right = scrollWidth + 'px';

        mainElement.style.overflow = 'hidden';

        tableMain.appendChild(mainTable);
        mainElement.appendChild(tableHead);
        mainElement.appendChild(tableMain);
        mainPosition === 'static' && (mainElement.style.position = 'relative');

        var conf = {
            mainElement,
            mainTable,
            tableMain,
            tableHead
        }

        setData(mainElement, conf);

        update(mainElement);

        tableMain.addEventListener('scroll', onScroll);
    };

    function onScroll(e) {
        var trig = this.parentNode.querySelector('[table-flag=head]');
        trig.style.marginLeft = -this.scrollLeft + 'px';
    }

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

        var newTable = mainTable.cloneNode(true);
        newTable.style.marginTop = 0;
        newTable.querySelector('tbody').style.visibility = 'hidden';
        var trys = newTable.querySelector('tr');
        tableHead.appendChild(newTable);

        mainTable.style.marginTop = (-theadHeight) + 'px';
        tableMain.style.top = theadHeight + 'px';
        tableHead.style.height = theadHeight + 'px';
    }

    //初始化option
    function formatting_option(option = {}) {
        var {main} = option;
        typeof main === 'string' && (option.main = document.querySelector(main));
    };

    function main(option = {}) {
        switch (option.type) {
            case 'update':
                update(option.main);
                break;
            case 'create':
            default:
                initTable(option);
                break;
        }
    };

    return main;
})();
