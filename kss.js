/**
 * Kss Javascript Class Library
 * @Author  Travis(LinYongji)
 * @Contact http://travisup.com/
 * @Version 1.0.0
 */
(function (window, undefined) {

	var rootKss,

	document = window.document,
	location = window.location,
	navigator = window.navigator,

	k_toString = {}.toString,
	k_push = [].push,
	k_indexOf = [].indexOf,
	k_splice = [].splice,
	k_sort = [].sort,
	k_trim = "".trim,

	version = "1.0.0",

	kss = function (selector, context) {
		return new init(selector, context);
	},

	// update at 2012.12.12
	init = function (selector, context) {
		// $(undefined/null)
		if (!selector) {
			return this;
		}
		//$k(node)
		if (selector.nodeType) {
			this[0] = selector;
			this.length = 1;
			return this;
		}

		if (typeof selector === "string") {
			// $k("#id")
			var match = /^#([\w-]+)$/.exec(selector);
			if (match && match[1] && !context) {
				var elem = document.getElementById(match[1]);
				return kss(elem);
			}
			if (context && context.nodeType === 1) {
				this.context = context;
			} else {
				context = document;
			}
			return kss(context).find(selector);
		}
		// exec ready
		else if (typeof selector === "function" && kss.fn.ready) {
			return rootKss.ready(selector);
		}
	};

	kss.fn = {
		constructor : kss,
		selector : "",
		context : document,

		// arrayLike
		length : 0,
		splice : k_splice,
		push : k_push,
		sort : k_sort,

		// add at 2013.02.25
		size : function () {
			return this.length;
		},

		// update at 2012.12.11
		pushStack : function (elems) {
			var ret = kss();
			for (var i = 0; i < elems.length; i++) {
				ret[i] = elems[i];
			}
			ret.length = elems.length;
			return ret;
		},

		// update at 2012.12.11
		find : function (selector) {
			if (typeof selector !== "string")
				return kss();

			var pos = selector.indexOf(" ");
			var children;
			if (pos >= 0) {
				children = selector.substr(pos + 1);
				selector = selector.substring(0, pos);
			}
			if (this.length === 1) {
				var ret = kss.find(selector, this[0]);
			} else {
				var ret = [],
				temp;
				for (var i = 0, len = this.length; i < len; i++) {
					temp = kss.find(selector, this[i]);
					ret = kss.merge(ret, temp);
				}
			}
			var obj = this.pushStack(ret);
			if (children) {
				return obj.find(children);
			}
			return obj;
		},

		// 获取指定子元素（update at 2013.02.28）
		children : function (selector) {
			var temp,
			i = 1,
			len = this.length,
			ret = this[0] ? kss.children(selector, this[0]) : [];
			for (; i < len; i++) {
				temp = kss.children(selector, this[i]);
				ret = kss.merge(ret, temp);
			}
			return this.pushStack(ret);
		},

		// 获取相应下标的元素对象（update at 2013.02.28）
		eq : function (i) {
			var len = this.length,
			j = +i + (i < 0 ? len : 0);
			return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
		},

		// 遍历元素并执行函数（update at 2013.02.19）
		each : function (callback, args) {
			if (kss.isFunction(callback)) {
				return kss.each(this, callback, args);
			} else {
				return this;
			}
		},

		// 处理过滤元素（add at 2013.02.27）
		// callback(index, element)
		map : function (callback) {
			return this.pushStack(kss.map(this, function (elem, i) {
					return callback.call(elem, i, elem);
				}));
		},

		remove : function () {
			for (var i = 0; i < this.length; i++) {
				kss.remove(this[i]);
			}
			return kss();
		}
	};

	init.prototype = kss.fn;

	// 对象继承（update at 2013.02.28）
	kss.fn.extend = kss.extend = function (first, second) {
		// 传入第二个参数则把第二个对象的属性继承到第一个对象中并返回
		if (typeof second === "object") {
			for (var key in second) {
				if (typeof first[key] === "object") {
					first[key] = kss.extend(first[key], second[key]);
				} else {
					first[key] = second[key];
				}
			}
			return first;
			// 只传第一个参数则把对象继承到kss库中
		} else if (typeof first === "object") {
			for (var key in first) {
				this[key] = first[key];
			}
			return this;
		}
	};

	kss.extend({
		// 对对象和数组进行callback操作（update at 2013.02.27）
		map : function (elems, callback) {
			var value,
			i,
			len,
			ret = [];
			// 伪数组和数组采用索引遍历
			if (kss.isKssObject(elems) || kss.isArray(elems)) {
				for (i = 0, len = elems.length; i < len; i++) {
					value = callback(elems[i], i);
					if (value != null) {
						ret.push(value);
					}
				}
				// 遍历对象
			} else {
				for (i in elems) {
					value = callback(elems[i], i);
					if (value != null) {
						ret.push(value);
					}
				}
			}
			return ret;
		},

		// kss对象遍历（update at 2013.02.28）
		each : function (obj, callback, args) {
			var i = 0,
			len = obj.length,
			isKssObj = kss.isKssObject(obj);

			if (typeof args === "undefined") {
				if (isKssObj) {
					for (i = 0; i < len; i++) {
						if (callback.call(obj[i], i, obj[i]) === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						if (callback.call(obj[i], i, obj[i]) === false) {
							break;
						}
					}
				}
			} else if (kss.isArray(args)) {
				if (isKssObj) {
					for (i = 0; i < len; i++) {
						if (callback.apply(obj[i], args) === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						if (callback.apply(obj[i], args) === false) {
							break;
						}
					}
				}
			}

			return obj;
		}
	});

	kss.extend({
		// add at 2012.11.20
		// 判断是否为函数
		isFunction : function (obj) {
			return k_toString.call(obj) === "[object Function]";
		},

		// add at 2012.11.20
		// 判断是否为数组
		isArray : function (obj) {
			return k_toString.call(obj) === "[object Array]";
		},

		// add at 2012.11.20
		// 判断是否为数字（包含只含数字的字符串）
		isNumeric : function (obj) {
			return !isNaN(parseFloat(obj)) && isFinite(obj);
		},

		// add at 2012.11.22
		// 判断是否为空对象
		isEmptyObject : function (obj) {
			for (var name in obj) {
				return false;
			}
			return true;
		},

		// add at 2013.02.27
		// 判断是否为kss封装的对象
		isKssObject : function (obj) {
			return obj.constructor == kss && typeof obj.length === "number";
		},

		// add at 2013.02.19
		// 判断是否为标量
		isScalar : function (obj) {
			return typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean";
		}
	});

	kss.fn.extend({

		html : function (value) {
			// update at 2012.11.20
			if (typeof value === "undefined") {
				return this[0] && this[0].nodeType === 1 ? this[0].innerHTML : null;
			}
			// Remark: bug for ie(innerHTML only read in table elem)
			if (typeof value === "string") {
				return kss.each(this, function () {
					if (this.nodeType === 1)
						this.innerHTML = value;
				}, [value]);
			} else {
				return this;
			}
		},

		text : function (value) {
			// update at 2012.11.20
			// GET: only get the first node text
			// Remark: bug(textContent !== innerText)
			if (typeof value === "undefined") {
				if (this[0] && this[0].nodeType === 1) {
					return this[0].textContent ? this[0].textContent : this[0].innerText;
				} else {
					return "";
				}
			}
			return kss.each(this, function () {
				if (this.nodeType === 1) {
					if (this.textContent) {
						this.textContent = value;
					} else {
						this.innerText = value;
					}
				}
			}, [value]);
		},

		val : function (value) {
			// update at 2012.11.22
			// GET: only get the first node value
			if (typeof value === "undefined") {
				if (this[0] && this[0].nodeType === 1) {
					return this[0].value ? this[0].value : "";
				} else {
					return undefined;
				}
			}
			return kss.each(this, function () {
				if (typeof this.value !== "undefined") {
					this.value = value;
				}
			}, [value]);
		}
	});

	kss.fn.extend({
		// update at 2012.11.21
		// 获取元素父节点
		parent : function () {
			// update at 2012.11.21
			var ret = [],
			parent;
			for (var i = 0, len = this.length; i < len; i++) {
				parent = this[i].parentNode;
				if (parent && parent.nodeType !== 11) {
					ret.push(parent);
				}
				// filter repeat elem
				ret = kss.uniq(ret);
			}
			return this.pushStack(ret);
		},

		// add 2013.02.25
		// 返回元素之后第一个兄弟节点
		next : function () {
			return this[0] ? this.pushStack(kss.dir(this[0], "nextSibling", this[0], true)) : kss();
		},

		// add 2013.02.25
		// 返回元素之后所有兄弟节点
		nextAll : function () {
			return this[0] ? this.pushStack(kss.dir(this[0], "nextSibling", this[0])) : kss();
		},

		// add 2013.02.25
		// 返回元素之前第一个兄弟节点
		prev : function () {
			return this[0] ? this.pushStack(kss.dir(this[0], "previousSibling", this[0], true)) : kss();
		},

		// add 2013.02.25
		// 返回元素之前所有兄弟节点
		prevAll : function () {
			return this[0] ? this.pushStack(kss.dir(this[0], "previousSibling", this[0])) : kss();
		},

		// add 2013.02.25
		// 返回除自身以外所有兄弟节点
		siblings : function () {
			return this[0] ? this.pushStack(kss.dir(this[0].parentNode.firstChild, "nextSibling", this[0])) : kss();
		}
	});

	var rSelectId = /^#([\w-]+)$/,
	rSelectClass = /^([\w-]*)\.([\w-]+)$/,
	rSelectTag = /^\w+$/;

	kss.extend({
		// return array
		find : function (selector, parentNode) {
			// $k("#id")
			var match = rSelectId.exec(selector);
			if (match && match[1]) {
				var elem = document.getElementById(match[1]),
				ret = [];
				if (elem) {
					ret[0] = elem;
				}
				return ret;
			}
			// $k(".class")
			match = rSelectClass.exec(selector);
			if (match && match[2]) {
				var searchClass = match[2],
				tag = match[1] || "*";
				if (document.getElementsByClassName) {
					var elems = parentNode.getElementsByClassName(searchClass),
					ret = [];
					if (tag === "*") {
						return elems;
					}
					for (var i = 0, len = elems.length; i < len; i++) {
						if (elems[i].tagName === tag.toUpperCase()) {
							ret.push(elems[i]);
						}
					}
					return ret;
				} else {
					// for IE
					var elems = (tag === "*" && parentNode.all) ? parentNode.all : parentNode.getElementsByTagName(tag),
					ret = [];
					for (var i = 0; i < elems.length; i++) {
						if (kss.hasClass(elems[i], searchClass)) {
							ret.push(elems[i]);
						}
					}
					return ret;
				}
			}
			// $("tag")
			if (rSelectTag.test(selector)) {
				var elems = parentNode.getElementsByTagName(selector);
				return elems;
			}
		},

		// update at 2013.02.25
		// 获得相应子节点
		children : function (selector, parentNode) {
			var elems = parentNode.childNodes;
			var match = rSelectClass.exec(selector);
			var ret = [];
			if (match && match[2]) {
				var searchClass = match[2],
				tag = match[1] || "*";
				for (var i = 0; i < elems.length; i++) {
					var elem = elems[i];
					if (elem.nodeType == 1) {
						if (tag === "*" || elem.tagName === tag.toUpperCase()) {
							if (elem.className.indexOf(searchClass) >= 0) {
								ret.push(elem);
							}
						}
					}
				}
				return ret;
			}
			if (rSelectTag.test(selector)) {
				for (var i = 0; i < elems.length; i++) {
					var elem = elems[i];
					if (elem.nodeType == 1) {
						if (elem.tagName == selector.toUpperCase()) {
							ret.push(elem);
						}
					}
				}
				return ret;
			}
		},

		// add 2013.02.25
		// 筛选节点
		dir : function (elem, dir, besides, one) {
			var matched = [],
			cur = elem;
			while (cur && cur.nodeType !== 9) {
				if (cur.nodeType === 1 && cur !== besides) {
					matched.push(cur);
					if (one) {
						return matched;
					}
				}
				cur = cur[dir];
			}
			return matched;
		}
	});

	kss.extend({
		// add at 2012.11.25
		now : function () {
			return (new Date()).getTime();
		},
        
		// add at 2013.02.25
		inArray : function (value, arr, fromIndex) {
			if (typeof fromIndex !== "number") {
				fromIndex = 0;
			} else if (fromIndex < 0) {
				fromIndex = Math.max(0, this.length + fromIndex);
			}
			for (var i = fromIndex; i < this.length; i++) {
				if (this[i] === value)
					return i;
			}
			return -1;
		},

		// 清除数组中重复的数据（update at 2013.02.28）
		uniq : function (arr) {
			var ret = [],
			i = 0,
			len;
			if (kss.isArray(arr)) {
				for (len = arr.length; i < len; i++) {
					if (kss.inArray(arr[i], ret) === -1) {
						ret.push(arr[i]);
					}
				}
			}
			return ret;
		},

		// 伪对象转化为数组（update at 2013.02.28）
		makeArray : function (obj) {
			var ret = [];
			if (kss.isKssObject(obj)) {
				ret = kss.merge(ret, obj);
			} else {
				ret.push(obj);
			}
			return ret;
		},

		// 随机生成数（add at 2013.02.20）
		rand : function () {
			return Math.random().toString().substr(2);
		},

		// 数组拼接（update at 2013.02.28）
		merge : function (first, second) {
			var i = first.length,
			j = 0,
			len = second.length;
			for (; j < len; j++) {
				first[i++] = second[j];
			}
			return first;
		},

		// update at 2012.12.24
		trim : function (str) {
			return (str || "").replace(/(^\s*)|(\s*$)/g, "");
		},

		// remove node
		remove : function (elem) {
			var parent = elem.parentNode;
			if (parent && parent.nodeType !== 11) {
				parent.removeChild(elem);
			}
		},

		// json.parse
		// add at 2012.12.14
		parseJSON : function (data) {
			if (!data || typeof data !== "string")
				return null;

			data = kss.trim(data);

			if (window.JSON && window.JSON.parse) {
				return window.JSON.parse(data);
			}

			if (/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
					.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
					.replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
				return (new Function("return " + data))();
			}

			kss.error("Invalid JSON: " + data);
		},

		// throw error
		// add at 2012.12.14
		error : function (msg) {
			throw new Error(msg);
		}
	});

	kss.extend({
		// add at 2013.02.13
		// 全局缓存
		cache : {},

		// add at 2013.02.15
		// 内部Key
		expando : "kss" + Math.random().toString().substr(2),

		// add at 2013.02.15
		// 全局索引
		guid : 1,

		// update at 2013.02.15
		// 缓存数据操作
		data : function (elem, key, value) {
			var id = kss.expando;
			if (typeof value === "undefined") {
				if (elem[id] && kss.cache[elem[id]]) {
					if (typeof kss.cache[elem[id]][key] !== "undefined") {
						return kss.cache[elem[id]][key];
					}
				}
				return undefined;
			}
			if (elem.nodeType) {
				elem[id] = elem[id] || kss.guid++;
				kss.cache[elem[id]] = kss.cache[elem[id]] || {};
				kss.cache[elem[id]][key] = value;
			}
		},

		// add at 2012.12.12
		// 深度复制
		clone : function (obj) {
			if (!obj) {
				return obj;
			} else if (kss.isArray(obj)) {
				var newArr = [],
				i = obj.length;
				while (i--) {
					newArr[i] = arguments.callee.call(null, obj[i]);
				}
				return newArr;
			} else if (kss.isFunction(obj) || obj instanceof Date || obj instanceof RegExp) {
				return obj;
			} else if (typeof obj === "object") {
				var newObj = {};
				for (var i in obj) {
					newObj[i] = arguments.callee.call(null, obj[i]);
				}
				return newObj;
			} else {
				return obj;
			}
		}
	});

	// add at 2013.02.22
	// 事件函数
	kss.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
			"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
			"change select submit keydown keypress keyup error contextmenu").split(" "), function (i, name) {
		kss.fn[name] = function (data, fn) {
			return arguments.length > 0 ?
			this.on(name, null, data, fn) :
			this.trigger(name);
		};
	});

	kss.fn.extend({
		// add 2013.02.15
		// 事件绑定(bind/live/delegate)
		on : function (type, selector, data, fn) {
			if (typeof type !== "string" || type == "") {
				return this;
			}
			// (type, fn)
			if (data == null && fn == null) {
				fn = selector;
				data = selector = undefined;
				// (type, fn)
			} else if (fn == null) {
				if (typeof selector === "string") {
					// (type, selector, fn)
					fn = data;
					data = undefined;
				} else {
					// (type, data, fn)
					fn = data;
					data = selector;
					selector = undefined;
				}
			}
			if (!kss.isFunction(fn)) {
				fn = returnFalse;
			}
			return kss.each(this, function () {
				kss.event.add(this, type, selector, data, fn);
			}, [type, selector, data, fn]);
		},

		// add 2013.02.15
		// 事件解绑(unbind/die/undelegate)
		off : function (type, selector, fn) {
			if (typeof type !== "string" || type == "") {
				return this;
			}

			// (type[, fn])
			if (!selector || kss.isFunction(selector)) {
				fn = selector;
				selector = undefined;
			}

			if (!fn) {
				fn = undefined;
			}
			return kss.each(this, function () {
				kss.event.remove(this, type, selector, fn);
			}, [type, selector, fn]);
		},

		trigger : function (type) {
			return kss.each(this, function () {
				kss.event.trigger(this, type);
			});
		},

		ready : function (fn) {
			// add at 2012.11.18
			kss.bindReady();
			if (kss.isReady) {
				fn.call(document, kss);
			} else if (readyList) {
				readyList.push(fn);
			}
			return this;
		}
	});

	// add at 2013.02.16
	// 返回false函数
	function returnFalse() {
		return false;
	}

	var rTypeNamespace = /^(\w+)\.?(\w*)$/;

	kss.event = {
		// update at 2013.02.20
		// 事件绑定
		add : function (elem, type, selector, data, fn) {
			var handleObj = {},
			handler,
			id = kss.expando;
			// 事件委托
			if (selector) {
				handler = function (e) {
					var elems = $(elem).find(selector),
					evt = window.event ? window.event : e,
					target = evt.target || evt.srcElement;
					// 统一事件阻止
					evt.stopPropagation = evt.stopPropagation || function () {
						window.event.cancelBubble = true;
					};
					evt.data = data;
					for (var i = 0; i < elems.length; i++) {
						if (elems[i] == target) {
							return fn.call(target, evt);
						}
					}
				}
				// 直接绑定
			} else {
				handler = function (e) {
					var evt = window.event ? window.event : e;
					evt.stopPropagation = evt.stopPropagation || function () {
						window.event.cancelBubble = true;
					};
					evt.data = data;
					return fn.call(elem, evt);
				};
			}

			// 事件缓存
			var events = kss.data(elem, "events");
			if (!events) {
				events = {};
			}

			handleObj.handler = handler;
			handleObj.selector = selector;
			handleObj.data = data;
			handleObj.guid = fn[id] = fn[id] || kss.guid++;

			events[type] = events[type] || [];
			events[type].push(handleObj);

			kss.data(elem, "events", events);

			if (window.addEventListener) {
				elem.addEventListener(type, handler, false);
			} else if (document.attachEvent) {
				elem.attachEvent("on" + type, handler);
			} else {
				elem["on" + type] = handler;
			}
		},

		// update at 2013.02.15
		// 事件解绑
		remove : function (elem, type, selector, fn) {
			var handleObj,
			handler,
			id = kss.expando,
			events = kss.data(elem, "events"),
			typeObj = [];
			if (!elem[id] || !events || !events[type]) {
				return;
			}

			if (kss.isFunction(fn) && !fn[id]) {
				return;
			}

			for (var i = 0; i < events[type].length; i++) {
				handleObj = events[type][i];
				if (typeof fn === "undefined" ||
					(typeof selector !== "undefined" && handleObj.selector === selector && fn[id] === handleObj.guid) ||
					(typeof selector === "undefined" && fn[id] === handleObj.guid)) {

					handler = handleObj.handler;

					if (elem.removeEventListener) {
						elem.removeEventListener(type, handler, false);
					} else if (document.detachEvent) {
						elem.detachEvent("on" + type, handler);
					} else {
						elem["on" + type] = null;
					}
				} else {
					typeObj.push(handleObj);
				}
			}
			events[type] = typeObj;
			kss.data(elem, "events", events);
		},

		trigger : function (elem, event) {
			elem[event].call(elem);
			/* if(document.createEventObject) {
			var evt = document.createEventObject();
			return elem.fireEvent("on"+event, evt);
			} else {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(event, true, true);
			return !elem.dispatchEvent(evt);
			} */
		}
	};

	// document ready
	var readyList = [],
	readyBound = false,
	DOMContentLoaded;

	if (document.addEventListener) {
		DOMContentLoaded = function () {
			document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
			kss.ready();
		};
	} else if (document.attachEvent) {
		DOMContentLoaded = function () {
			if (document.readyState === "complete") {
				document.detachEvent("onreadystatechange", DOMContentLoaded);
				kss.ready();
			}
		};
	}

	var doScrollCheck = function () {
		if (kss.isReady) {
			return;
		}
		try {
			document.documentElement.doScroll("left");
		} catch (e) {
			setTimeout(doScrollCheck, 1);
			return;
		}
		kss.ready();
	};

	kss.extend({

		isReady : false,

		bindReady : function () {
			if (readyBound)
				return;
			readyBound = true;

			if (document.readyState === "complete")
				return kss.ready();

			if (document.addEventListener) {
				document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
				window.addEventListener("load", kss.ready, false);
			} else if (document.attachEvent) {
				document.attachEvent("onreadystatechange", DOMContentLoaded);
				window.attachEvent("onload", kss.ready);

				var toplevel = false;
				try {
					toplevel = window.frameElement == null;
				} catch (e) {}
				if (document.documentElement.doScroll && toplevel) {
					doScrollCheck();
				}
			}
		},

		ready : function () {
			if (!kss.isReady) {
				if (!document.body) {
					return setTimeout(kss.ready, 13);
				}
				kss.isReady = true;
				if (readyList) {
					for (var i = 0; i < readyList.length; i++) {
						var fn = readyList[i];
						fn.call(document, kss);
					}
					readyList = [];
				}
			}
		}
	});

	// 属性操作原型链
	kss.fn.extend({
		// update at 2013.02.19
		// 读取或设置元素属性
		attr : function (name, value) {
			if (typeof name !== "string") {
				return this;
			}
			if (typeof value === "undefined") {
				if (this[0] && this[0].nodeType === 1) {
					return this[0].getAttribute(name);
				} else {
					return undefined;
				}
			} else if (kss.isScalar(value)) {
				return kss.each(this, function () {
					kss.setAttr(this, name, value);
				});
			}
			return this;
		},

		// add at 2013.02.19
		// 删除元素指定属性
		removeAttr : function (name) {
			if (typeof name !== "string") {
				return this;
			}
			return kss.each(this, function () {
				kss.removeAttr(this, name);
			});
		},

		// add at 2013.02.19
		// 特殊属性处理
		prop : function (name, value) {
			if (typeof value === "undefined") {
				var prop = this.attr(name);
				if (kss.inArray(name, kss.sepProp) >= 0) {
					return typeof prop === "string" && (prop === name || prop === "");
				}
				return prop;
			}
			if (kss.inArray(name, kss.sepProp) >= 0 && typeof value === "boolean") {
				if (value) {
					value = name;
				} else {
					return this.removeAttr(name);
				}
			}
			return this.attr(name, value);
		}
	});

	// 属性操作
	kss.extend({
		// update at 2013.02.19
		// 设置元素属性（只支持元素）
		setAttr : function (elem, name, value) {
			if (elem.nodeType === 1) {
				elem.setAttribute(name, value);
			}
		},

		// add at 2013.02.19
		// 删除元素指定属性（只支持元素）
		removeAttr : function (elem, name) {
			if (elem.nodeType === 1) {
				elem.removeAttribute(name);
			}
		},

		// add at 2013.02.19
		// 需要特殊处理的属性
		sepProp : ['disabled', 'checked', 'selected', 'multiple', 'readonly', 'async', 'autofocus']
	});

	// 样式操作原型链
	kss.fn.extend({
		// add at 2013.02.19
		// 判断元素是否有对应Class
		hasClass : function (className) {
			if (typeof className !== "string") {
				return false;
			}
			className = " " + className + " ";
			for (var i = 0, len = this.length; i < len; i++) {
				if (this[i].nodeType === 1 && (" " + this[i].className + " ").indexOf(className) >= 0) {
					return true;
				}
			}
			return false;
		},

		// add at 2013.02.19
		// 添加Class
		addClass : function (className) {
			if (typeof className !== "string") {
				return;
			}
			return kss.each(this, function () {
				kss.addClass(this, className);
			});
		},

		// add at 2013.02.19
		// 删除Class
		removeClass : function (className) {
			if (typeof className !== "string") {
				return;
			}
			return kss.each(this, function () {
				kss.removeClass(this, className);
			});
		},

		// update at 2012.11.22
		// GET: only get the first node current css
		css : function (name, value) {
			if (typeof value === "undefined") {
				if (this[0] && this[0].nodeType === 1) {
					return kss.curCss(this[0], name);
				} else {
					return undefined;
				}
			}
			return kss.each(this, function () {
				kss.setCss(this, name, value);
			});
		},

		// add at 2012.11.26
		show : function () {
			return kss.each(this, function () {
				kss.show(this);
			});
		},

		// add at 2012.11.26
		hide : function () {
			return kss.each(this, function () {
				kss.hide(this);
			});
		}
	});

	// 样式操作
	kss.extend({
		// 判断元素是否有对应Class（add at 2013.02.19）
		hasClass : function (elem, className) {
			return elem.nodeType === 1 && (" " + elem.className + " ").indexOf(" " + className + " ") >= 0;
		},

		// 添加Class（add at 2013.02.19）
		addClass : function (elem, className) {
			if (elem.nodeType === 1 && !kss.hasClass(elem, className)) {
				elem.className = kss.trim(elem.className + " " + className + " ");
			}
		},

		// 删除Class（add at 2013.02.19）
		removeClass : function (elem, className) {
			if (elem.nodeType === 1) {
				elem.className = kss.trim((" " + elem.className + " ").replace(" " + className + " ", " "));
			}
		},

		// add at 2012.12.12
		// 显示元素
		show : function (elem) {
			var old = kss.data(elem, "olddisplay");
			elem.style.display = old || "";
			var display = kss.curCss(elem, "display");
			if (display == "none") {
				// 非内联样式中如果设置了display:none，无论是原来是哪种盒子模型，都设置为block（暂定）
				elem.style.display = "block";
			}
		},

		// add at 2012.12.12
		// 隐藏元素
		hide : function (elem) {
			var display = kss.curCss(elem, "display");
			if (display != "none") {
				kss.data(elem, "olddisplay", display);
			}
			elem.style.display = "none";
		},

		// add at 2012.11.22
		// set CSS
		setCss : function (elem, name, value) {
			if (elem.nodeType !== 1 || typeof name !== "string" || typeof value !== "string") {
				return;
			}
			if (elem.style.hasOwnProperty(name)) {
				elem.style[name] = value;
			}
		},

		// update at 2012.11.26
		// current CSS
		curCss : function (elem, name) {
			if (elem.nodeType !== 1) {
				return undefined;
			}

			var ret = null;

			if (window.getComputedStyle) {
				var computed = window.getComputedStyle(elem, null);
				ret = computed.getPropertyValue(name) || computed[name];
				return ret;
			}
			// for ie
			else if (document.documentElement.currentStyle) {
				name = kss.camelCase(name);
				ret = elem.currentStyle && elem.currentStyle[name];

				if (ret == null && elem.style && elem.style[name]) {
					ret = style[name];
				}
				// opacity

				// get width and height on px
				if (/^(height|width)$/.test(name) && !/(px)$/.test(ret)) {
					ret = (name == "width") ? elem.offsetWidth : elem.offsetHeight;
					if (ret <= 0 || ret == null) {
						var pSide = (name == "width") ? ["left", "right"] : ["top", "bottom"];
						var client = parseFloat(elem[kss.camelCase("client-" + name)]),
						paddingA = parseFloat(kss.curCss(elem, "padding-" + pSide[0])),
						paddingB = parseFloat(kss.curCss(elem, "padding-" + pSide[1]));
						ret = (client - paddingA - paddingB);
					}
					ret += "px";
				}

				if (/(em|pt|mm|cm|pc|in|ex|rem|vw|vh|vm|ch|gr)$/.test(ret)) {
					ret = kss.convertPixel(elem, ret);
				}
				return ret;
			}
			return undefined;
		},

		// add at 2012.11.26
		camelCase : function (attr) {
			return attr.replace(/\-(\w)/g, function (all, letter) {
				return letter.toUpperCase();
			});
		},

		// add at 2012.11.27
		// From the awesome hack by Dean Edwards
		// convert em,pc,pt,cm,in,ex to px(no include %)
		convertPixel : function (elem, value) {
			var left,
			rsLeft,
			ret = value,
			style = elem.style;

			// cache left/rsLeft
			left = elem.style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			if (rsLeft)
				elem.runtimeStyle.left = elem.currentStyle.left;

			style.left = value || 0;
			ret = style.pixelLeft + "px";

			style.left = left;
			if (rsLeft)
				elem.runtimeStyle.left = rsLeft;

			return ret === "" ? "auto" : ret;
		}
	});
    
    // 数据请求
	kss.extend({
		// 远程json获取（update at 2013.03.01）
		getJSON : function (url, data, fn) {
			return kss.get(url, data, fn, 'jsonp');
		},

		// 载入远程JS并执行回调（update at 2013.03.01）
		getScript : function (url, data, fn) {
			return kss.get(url, data, fn, 'script');
		},

		// get封装（update at 2013.03.10）
		get : function (url, data, fn, type) {
			// (url, fn, type)
			if (kss.isFunction(data)) {
                type = type || fn;
				fn = data;
				data = undefined;
			}
			return kss.ajax({
				url : url,
				data : data,
				success : fn,
				dataType : type
			});
		},

		// ajax（update at 2013.03.10）
		ajax : function (url, settings) {
			var i,
			s,
            params;
			if (typeof url === "object") {
				settings = url;
				url = undefined;
			}
			// 合并参数项
			s = typeof settings === "object" ? settings : {};

			if (typeof url === "string") {
				s.url = url;
			}

			for (i in ajax.settings) {
				if (typeof s[i] === "undefined") {
					s[i] = ajax.settings[i];
				}
			}
            
            if(s.type !== "POST") {
                params = ajax.buildParams(s.data);

                if (s.cache === false) {
                    params = [params, "_=" + kss.now()].join("&");
                }
                s.url += s.url.indexOf("?") === -1 ? "?" : "&" + params;
            }
            
			if (s.dataType === "script" || s.dataType === "jsonp") {
				transports.script.send(s);
			} else {
				transports.xhr.send(s);
			}
		}
	});

	//
	var ajax = {
		xhr : window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ? function () {
			return new window.XMLHttpRequest();
		}
		 : function () {
			try {
				return new window.ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {}
		},

		settings : {
			url : "",
			type : "GET",
			data : "",
			async : true,
			cache : false,
			timeout : 0,
			contentType : "application/x-www-form-urlencoded",
			parseDate : true,
			dataType : "*",
			context : document,
			beforeSend : function (xhr) {},
			success : function (data, status) {},
			error : function (xhr, status) {},
			complete : function (xhr, status) {}
		},

		// 将Data转换成字符串（update 2013.02.28）
		buildParams : function (obj) {
			var i,
			j,
			k,
			len,
			arr = [];
			// 字符串直接返回
			if (typeof obj === "string") {
				return obj;
			} else if (typeof obj === "object") {
				for (i in obj) {
					// 处理数组 {arr:[1, 2, 3]} => arr[]=1&arr[]=2&arr[]=3
					if (kss.isArray(obj[i])) {
						k = i + i.substr(-2, 2) === "[]" ? "" : "[]";
						for (j = 0, len = obj[i].length; j < len; j++) {
							arr.push(k + "=" + encodeURIComponent(obj[i][j] + ""));
						}
					} else {
						arr.push(i + "=" + encodeURIComponent(obj[i] + ""));
					}
				}
			}
			return arr.join("&");
		},

		// update 2012.12.14
		httpData : function (xhr, type) {
			var ct = xhr.getResponseHeader("content-type") || "";
			if (!type && ct.indexOf("xml") >= 0 || type.toLowerCase() == "xml")
				return xhr.responseXML;
			if (type === "json")
				return kss.parseJSON(xhr.responseText);
			return xhr.responseText;
		}
	};

	// 传送器
	var transports = {
		// ajax发送请求（update 2013.03.10）
		xhr : {
			send : function (s) {
				var xhr = ajax.xhr(),
				params;
				// 发送前执行函数
				s.beforeSend.call(s.context, xhr);
				// 监听返回
				xhr.onreadystatechange = function () {
                    transports.xhr.callback(xhr, s);
				};
				// GET方法处理
				if (s.type === "GET") {
					xhr.open(s.type, s.url, s.async);
					xhr.send();
					// POST方法处理
				} else if (s.type === "POST") {
					xhr.open(s.type, s.url, s.async);
					xhr.setRequestHeader("Content-type", s.contentType);
                    params = ajax.buildParams(s.data)
					xhr.send(params);
				}
			},

			callback : function (xhr, s) {
                if (xhr.readyState === 4) {
                    xhr.onreadystatechange = null;
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                        s.success.call(s.context, ajax.httpData(xhr, s.dataType), xhr.status);
                    } else {
                        s.error.call(s.context, xhr, xhr.status);
                    }
                    s.complete.call(s.context, xhr, xhr.status);
                }
			}
		},
		script : {
			send : function (s) {
				var match,
				name,
				script = document.createElement("script"),
				head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

				if (s.dataType === "jsonp") {
                    s.url = s.url.replace("callback=%3F", "callback=?");
					match = /callback=([\w?]+)/.exec(s.url);
                    
					if (match && match[0]) {
						name = match[1] && match[1] !== "?" ? match[1] : "kss" + kss.rand() + "_" + kss.now();
						s.url = s.url.replace("callback=?", "callback=" + name);
                        
						window[name] = function (json) {
							json = s.parseData ? kss.parseJSON(json) : json;
							s.success.call(s.context, json);
							try {
								window[name] = null;
								delete window[name];
							} catch (e) {}
						};
					}
				}
				script.type = "text/javascript";
				script.defer = true;
				script.src = s.url;  
                
                script.onerror = script.onload = script.onreadystatechange = function(e) {
                    transports.script.callback(e, script, s);
                }

				head.appendChild(script);
			},

			callback : function (event, script, s) {
				if (!script.readyState || /loaded|complete/.test(script.readyState) || event === "error") {
					script.onerror = script.onload = script.onreadystatechange = null;
					kss.remove(script);

					if (s.type === "script" || event !== "error") {
						s.success.call(s.context);
					}
				}
			}
		}
	};

	rootKss = kss(document);
	window.kss = window.$ = kss;

})(window);