/**
 * 轻量级表格滚动条插件 jquery-table v1.0
 * 参数 border 表格边框宽度 {number} 默认 0
 * 参数 time 默认刷新时间 {number} 默认 100
 * 参数 id 强制转换id {string} 默认 ''
 * 参数 rolling 右侧滚动条滚动时触发 {function} 默认 function(){}
 * 参数 MinWidth { string | number } 默认 'auto' 强制table的最小宽度,如果是auto则最小宽度强制100%
 * 参数 adaption { 布尔 } 默认 true 是否自适应宽度
 *
 * 参数 remove 删除效果
 * 参数 resize 强制刷新
 */
(function ($) {
	var data = [];
	var __tag = null;
	var ifFirefox = navigator.userAgent.indexOf("Firefox") > 0;
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

	/***********************
	 * 函数：判断滚轮滚动方向
	 * 参数：event
	 * 返回：滚轮方向 true：向上 -false：向下
	 *************************/
	function scrollFunc(e) {
		var direct = 0;
		e = e || window.event;
		if (e.wheelDelta) { //IE/Opera/Chrome
			return (e.wheelDelta > 0);
		} else if (e.detail) { //Firefox
			return (e.detail < 0);
		}
	};

	// 注册事件
	function initOnDom(dom) {
		var _data = getData(dom)[0].option;
		_data.scroll.on('scroll', function (e) { // 滚动条事件
			var _h = -_data.headHeight - parseInt(this.scrollTop);
			if (ifFirefox && Math.abs(_h) > parseInt(_data.thead.css('height'))) _h -= _data.scrollWidth;
			_data.tbody.children('table').css('margin-top', _h);
			_data.option.rolling({
				scrollTop: parseInt(this.scrollTop),
				bottom: -(this.scrollTop + this.clientHeight - this.scrollHeight),
				__target: dom,
				target: _data._parent[0],
				scroll: this
			});
		});

		_data._parent.on('mouseleave', function () { // 进入离开事件
			__tag = null;
		}).on('mouseenter', function () {
			__tag = dom;
		});
		// 绑定滚动事件
		$(dom).on('reTableSize', function () {
			resize($(this));
		});
		window.onmousewheel = document.onmousewheel = _wheels; //IE/Opera/Chrome/Safari
		if (document.addEventListener) {
			document.addEventListener('DOMMouseScroll', _wheels, false);
		}//火狐

		// 滚动
		_data.thead.parent().on('scroll', function (e) {
			this.scrollTop = 0;
			return false;
		});
	};

	// 翻页
	function _wheels(e) {
		if (!__tag) {
			return true;
		}
		var f = scrollFunc(e); // 翻页方向
		var m = (f ? -18 : 18);
		var _data = getData(__tag)[0].option;
		var $scrolls = _data.scroll[0];
		var sTop = $scrolls.scrollTop + m;
		var w = m < 0 ? parseInt(sTop / 100) * 100 : (parseInt(sTop / 100) + 1) * 100;
		_wheels_extend(_data, 'wheels_time', function () {
			var t = (w - $scrolls.scrollTop) * 0.5;
			if (m < 0) {
				$scrolls.scrollTop += (t > -5 && -5 || t);
				$scrolls.scrollTop <= w && clearInterval(_data.wheels_time);
			} else {
				$scrolls.scrollTop += (t < 5 && 5 || t);
				$scrolls.scrollTop >= w && clearInterval(_data.wheels_time);
			}
			if ($scrolls.scrollTop == 0 || $scrolls.scrollTop + $scrolls.clientHeight - $scrolls.scrollHeight == 0) {
				clearInterval(_data.wheels_time);
			}
		});
	};

	// 翻页高度延长20%
	function _wheels_extend(obj, timer, fn) {
		obj[timer] && clearInterval(obj[timer]);
		obj[timer] = setInterval(fn, 50);
	}


	// 刷新图表
	function resize($dom) {
		// 检查html内容是否相同
		try {
			// 检查数据
			var conf = getData($dom[0])[0].option;
			var dom_innerhtml = $dom.html();
			var _innerHtml = conf.innerHTML; // 内存

			// 显示的
			var old_innerhtml = conf.tbody.find('table').html();

			if (dom_innerhtml != _innerHtml) { // 原始与内存
				conf.innerHTML = dom_innerhtml;
				// 图表重新覆盖
				conf.tbody.find('table').html(dom_innerhtml);
				conf.thead.find('table').html(dom_innerhtml);

				// 重置参数
				conf.bodyHeight = parseInt(conf.tbody.css('height')) + conf.option.border - conf.scrollWidth;
				conf.headHeight = parseInt(conf.thead.css('height')) - conf.option.border;

				// 重置滚动条
				conf.scroll.children('div').css('height', conf.bodyHeight);
			} else { // 原始 与 $

				var old__headHtml = conf.thead.find('thead').html();
				var old__bodyHtml = conf.tbody.find('tbody').html();

				// 隐藏的
				var _head = $dom.find('thead').html();
				var _tbody = $dom.find('tbody').html();
				var flag = false;

				var $memory = $(document.createElement('div'));
				$memory.html(_innerHtml);

				if (_head != old__headHtml) { // thead
					flag = true;
					$memory.find('thead').html(old__headHtml);
					conf.tbody.find('thead').html(old__headHtml);
				}
				if (_tbody != old__bodyHtml) { // tbody
					flag = true;
					$memory.find('tbody').html(old__bodyHtml);
					conf.thead.find('tbody').html(old__bodyHtml);
				}
				if (flag) {
					conf.innerHTML = $memory.html();
					$dom.html($memory.html());
				}
			}
			var _im = parseInt(conf.tbody.find('tbody').css('height'));
			var _in = parseInt(conf.thead.parent().css('height')) - parseInt(conf.thead.css('height'));
			var _ib = Math.min(_im, _in);
			parseInt(conf.tbody.css('height')) !== _ib && conf.tbody.css('height', _ib);
			// 宽
			var parent_table_w = parseInt(conf.tbody.parent().css('width'));
			var parent_thead_w = parseInt(conf.thead.css('width'));
			var parent_tbody_w = parseInt(conf.tbody.css('width'));
			if( conf.option.adaption && parent_table_w > conf.width){
				parent_table_w !== parent_thead_w && conf.thead.css('width',parent_table_w - 1);
				parent_table_w !== parent_tbody_w && conf.tbody.css('width',parent_table_w - 1);
			}
		} catch (error) {
			console.info('jquery-table -> resize() ERROR : ',error);
		}
	};

	// 初始化事件
	function initTable($dom, option) {
		option = formatting_option(option);
		var conf = { // 所需数据
			headHeight: parseInt($dom.find('thead').css('height')) + option.border, // thead 的高
			bodyHeight: parseInt($dom.find('tbody').css('height')) - option.border, // tbody 的高
			width: parseInt($dom.css('width')), // table 的宽
			scrollWidth: getScrollbarWidth(),
			innerHTML: $dom.html(),
			original: {
				paddingRight: 0,
				postion: undefined,
				id: undefined
			},
			_parent: $dom.parent().eq(0), // 父元素
			scroll: null,
			tag: null,
			thead: null,
			tbody: null,
			option: option,
			times: null
		};

		conf.original.postion = formatting_dom($dom);

		// 搭建结构
		var $structure = $('<div type="table"><div type="thead"></div><div type="tbody"></div></div>');
		conf.thead = $structure.children('[type=thead]').append($dom.clone());
		conf.tbody = $structure.children('[type=tbody]').append($dom.clone());
		conf._parent.append('<div type="scroll"><div></div></div>');

		conf.scroll = conf._parent.children('[type=scroll]').css({ // 滚动条样式
			'width': conf.scrollWidth,
			'top': conf.headHeight,
			'bottom': 0,
			'position': 'absolute',
			'overflow': 'scroll',
			'zIndex': 10,
			'right': 0
		});

		conf.scroll.children('div').css({ // 滚动条内用div撑起来 * 需要监听长度
			'height': conf.bodyHeight,
			'width': '1px'
		});

		$structure.appendTo(conf._parent); // 生成结构

		$dom.hide(); // 隐藏原始dom
		// 到这里就没有原始dom什么事了

		$structure.css({ // 外框架样式
			'width': '100%',
			'height': '100%',
			'overflow-x': 'auto',
			'overflow-y': 'hidden',
			'position': 'relative'
		});

		conf.thead.css({ // thead样式
			'width': conf.width,
			'height': conf.headHeight
		}).find('table').css({'min-width': '100%'});
		conf.thead.find('tbody').css({
			'visibility': 'hidden'
		});
		conf.tbody.css({ // tbody 样式
			'width': conf.width,
			'height': parseInt(conf.scroll.css('height')) - conf.scrollWidth,
			'overflow': 'hidden'
		}).children('table').css({
			'margin-top': -conf.headHeight,
			'min-width': option.minWidth
		});

		conf.original.paddingRight = (parseInt(conf._parent.css('padding-right')) || 0);
		conf._parent.css({
			'paddingRight': (conf.original.paddingRight + conf.scrollWidth)
		});

		// 清除id
		conf.original.id = $dom.attr('id');
		if (!option.id) {
			conf.thead.find('table').removeAttr('id');
			conf.tbody.find('table').removeAttr('id');
		} else {
			$dom.attr('id', option.id);
		}

		// 定时检查
		if (option.time) {
			conf.times = setInterval(function () {
				resize($dom);
			}, option.time);
		}

		setData($dom[0], conf); // 设置
		initOnDom($dom[0]); // 注册事件
	};

	// 为父元素绑定样式
	function formatting_dom($dom) {
		var _parents = $dom.parent();
		var css_position = _parents.css('position');
		css_position === 'static' && _parents.css('position', 'relative');
		return css_position;
	};

	//初始化option
	function formatting_option(option) {
		if (!option) {
			return {
				border: 0, // border
				id: undefined, // id
				minWidth: '100%',
				time: 100,
				adaption : true,
				rolling: function () { }
			};
		}
		option.time = parseInt(option.time >= 0 && option.time || 100);
		option.border = (parseInt(option.border) || 0);
		option.rolling = (option.rolling || function () {});
		option.minWidth = (option.minWidth || '100%');
		option.adaption = (option.adaption === undefined && true || option.adaption);
		return option;
	};

	function remove_table($doms) {
		try {
			var data = getData($doms[0]);
			if (!data || !data[0]) return false;
			$(data[0].elem).show().attr('id', data[0].option.original.id);
			data[0].option._parent.css({
				'padding-right': data[0].option.original.paddingRight,
				'postion': data[0].option.original.postion
			});
			data[0].option.thead.parent().remove();
			data[0].option.scroll.remove();
			data[0].option.times && clearInterval(data[0].option.times);
			setData($doms[0], null);
		} catch (error) { }
	};

	// 主入口函数
	function main($dom, option) {
		if (typeof option === 'string') {
			switch (option) {
				case 'remove': // 删除
					return remove_table($dom);
				case 'resize': // 刷新
					var data = getData($dom[0]);
					if (!data || !data[0]) return false;
					resize($dom);
					return true;
			}
		} else if (typeof option === 'function') {
			initTable($dom, {
				rolling: option
			});
		} else {
			initTable($dom, option);
		}
		return true;
	};

	$.fn.setTableScroll = function (option) {
		this.each(function () {
			main($(this), option);
		});
	};
})(jQuery);
