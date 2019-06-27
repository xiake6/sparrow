/**
 * @Date:   2017-03-01
 * @Last modified by:   jiayou.zuo
 * @Last modified time: 2019-05-27
**/

/** 
 * 克隆对象 
 * @param o {object} 拷贝对象
 * @param c {object} 拷贝类型 {} || []
*/
export function deepCopy(o, c) {
    var c = c || {}
    for (var i in o) {
        if (typeof o[i] === 'object') {
            //要考虑深复制问题了
            if (o[i].constructor === Array) {
                //这是数组
                c[i] = []
            } else {
                //这是对象
                c[i] = {}
            }
            deepCopy(o[i], c[i]);
        } else {
            c[i] = o[i]
        }
    }
    return c;
};
/* 
 * 简易克隆对象数据 
 * 不能对function date进行copy
 * @param obj {object} 对象
 * 
**/
export function easyCopy(obj){
    try {
        // 对于普通数据对象 没有互相引用的是完全ok的
        return JSON.parse(JSON.stringify( obj ));
    }catch(e){
        console.log(e);
        return deepCopy( obj );
    }
};
/**
 * 高级检验类型
**/
export function verifyType(o){
    var gettype = Object.prototype.toString.call(o),
        methods = {
            isObj   : (gettype == "[object Object]") ,
            isArray : gettype == "[object Array]",
            isNULL  : gettype == "[object Null]",
            isDocument: gettype == "[object Document]" || "[object HTMLDocument]"
        };

    return methods;
};

/** 
 * 获取链接中的参数
 * @param name {String} 参数名
**/
export function getUrlQuery(name){
    var url = window.location.href,                 // .search.substr(1)
        reg = /([^\#\?\=\&]+)\=([^\#\?\=\&]*)/g,    // ？号改成#就获取hash后面的参数
        obj = {};
    while( reg.exec(url) != null ){
        obj[RegExp.$1] = RegExp.$2;
    };
    // 不填写name参数 就是获取所有
    return name?obj[name]:obj;
};


// ======= 本地存储类 start ======= //
/**
 * 封装一套本地存储的方法
 * type=ls(localStorage); type=ss(sessionStorage); 使用不同方法的本地存储方法
 * @type {string} 执行的方法： get、set、remove、clear
 * @key {string} 键值
 * @val {any} 值
 * @registerType {string} 注册方式： localStorage or sessionStorage
*/
export function local(type, key, val, registerType="localStorage"){
    const methods = {
        get(){
            // 如果本地缓存中查询到指定值
            if( window[registerType].getItem(key) ){
                return JSON.parse(window[registerType].getItem(key));
            };
            return "";
        },
        set(){
            return window[registerType].setItem(key, JSON.stringify(val) );
        },
        remove(){
            if( window[registerType].getItem(key) ){
                return window[registerType].removeItem(key);
            };
            return "";
        },
        clear(){
            return window[registerType].clear();
        }
    }
    return methods[type]();
};
// 本地 sessionStorage
export function session(type, key, val, registerType="sessionStorage"){
    // console.log( type, key, val, registerType );
    return this.local(type, key, val, registerType);
};

// 对cookie的操作
export function setcookie(type, key, val, days=30, path="/"){
    const method = {
        // 获取cookies
        get(){
            var arr,reg=new RegExp("(^| )"+key+"=([^;]*)(;|$)");
            if(arr=document.cookie.match(reg)){
                return unescape(arr[2]); 
            }else{ 
                return null; 
            }
        },
        //设置cookies 
        set(){
            var Days = days; 
            var exp = new Date(); 
            var args = "";
            exp.setTime(exp.getTime() + Days*24*60*60*1000); 
            args = key + "="+ escape (val) + ";expires=" + exp.toGMTString();
            if(path) args += ";path="+path;

            document.cookie = args;
        },
        // 删除cookie
        delete(){
            var exp = new Date(); 
            exp.setTime(exp.getTime() - 1); 
            var cval=this.getCookie(key); 
            if(cval!=null) document.cookie= key + "="+cval+";expires="+exp.toGMTString();
        }
    };
    return method[type]();
}

// ======= 本地存储类 end ======= //

/**
 * 封装一套本地存储的方法
 * type=ls(localStorage); type=ss(sessionStorage); 使用不同方法的本地存储方法
 */

export function Storage(name,val,type="ls"){
    // return local(type,name,val,"localStorage");
    var _local = window[(type=="ls"?"localStorage":"sessionStorage")], //localStorage sessionStorage
        _methods = {
            // 读取本地存储数据
            get(){
                // 如果localStorage找到
                if( window["localStorage"].getItem(name) ){
                    return JSON.parse(window["localStorage"].getItem(name));  //JSON.parse 格式化数据
                }else if(window["sessionStorage"].getItem(name)){
                    return JSON.parse(window["sessionStorage"].getItem(name));
                }else{
                    return null;
                };
            },
            // 设置对应本地存储值
            set(){
                return _local.setItem(name,JSON.stringify(val));
            },
            // 删除
            remove(){
                if( window["localStorage"].getItem(name) ){
                    return window["localStorage"].removeItem(name);
                }else if(window["sessionStorage"].getItem(name)){
                    return window["sessionStorage"].removeItem(name);
                };
                return "";
            },
            // 清空本地存储
            clear(){
                return _local.clear();
            }
        };

    return _methods;
}
