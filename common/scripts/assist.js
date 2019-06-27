/** 
 * 一些辅助性的小方法集合
*/


// 一些静态对象
import oStatic from "./static.js";

// 给对象constructor中的对象 设置属性或数据
// @param n {names||keys} : 字符串格式的对象链
// @param v {value} : 值
// @param s {source||{}} : 源对象
export function setData(n = "", v = "", s = oStatic) {
    // 如果n参数没有则不往下执行
    if (!n || typeof n !== 'string') return false;

    var oLength = (/[\.]+/gi.test(n)) ? n.split('.') : [n],
        source = s;

    for (let i = 0; i < oLength.length; i++) {
        let item = oLength[i];
        if (i == oLength.length - 1) {
            source[item] = v;

            // console.log('true -- setData条件: ', n, s);
        } else {
            source = source[item];

            // console.log('false -- setData条件: ', n, s);
        };
    };
    // console.log('source:',s,source);
};
/** 
 * @param opts {Object} 为对象时是属性配置，为数字时是转换适配后的数字
 * @param mode ${String} 适配模式 - transverse:横向 vertical:纵向
*/
export function oAdapt(opts, mode="transverse") {
    var design = {
        "w": 750, 
        "h": 1334,
        "px": 20,
        "fn":function(){}
    };
    for( let x in opts ) design[x] = opts[x];

    var formula = ()=>{
        // transverse ：横向； vertical ：竖向
        return mode === "transverse"
            ? oWinSize().width / design.w
            : (design.w / design.h <
            oWinSize().width / oWinSize().height
                ? (design.w / design.h) * oWinSize().height
                : oWinSize().width) / design.w;
    };

    // 手机翻转时
    orientationChange(name, ()=>{
        design.fn(formula()*design.px);
    });
    design.fn(formula()*design.px);

    return formula;
};
/** 
 * 适配计算
 * @param nums {Number} 适配计算数值
*/
export function autoAdapt(nums, mode="transverse") {
    return oAdapt({
        px: nums
    },mode);
};
/**
 * @param $ {DOM ID} DOM选择器选择元素
**/
export function query($) {
    var o = document.querySelectorAll($);
    if (!o.length) {
        return {};
    } else if (o.length == 1) {
        return document.querySelector($);
    };
    return o;
};
/**
 * 手机翻转是出发回调操作
 * @param name {String} 注册名
 * @param fn {Function} 回调参数
**/
export function orientationChange(name,fn) {
    oStatic["orientationObject"][name] = fn;

    // 如果浏览器不支持 orientation方法  那么使用onresize代替
    if (typeof window.onorientationchange == "undefined") {
        var timer;
        window.onresize = function() {
            if(timer){
                clearTimeout(timer);
                timer=null;
            };
            timer = setTimeout(function() {
                oStatic["orientationObject"][name]();
            }, 200);
        };
    } else {
        window.onorientationchange = function() {
            if (window.orientation == 0 || window.orientation == 180 || window.orientation == 90 || window.orientation == -90) {
                for (var x in obj) {
                    oStatic["orientationObject"][name](window.orientation);
                };
            };
        };
    };
}

/** 
 * 根据客户端窗口计算用户可视区域的尺寸
*/
export function oWinSize(){
    var winWidth = 0,
        winHeight = 0

    //获取窗口宽度
    if (window.innerWidth){
        winWidth = window.innerWidth;
    }else if ((document.body) && (document.body.clientWidth)){
        winWidth = document.body.clientWidth;
    };

    //获取窗口高度
    if (window.innerHeight){
        winHeight = window.innerHeight;
    }else if ((document.body) && (document.body.clientHeight)){
        winHeight = document.body.clientHeight;
    };
    //通过深入Document内部对body进行检测，获取窗口大小
    if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
        winHeight = document.documentElement.clientHeight;
        winWidth = document.documentElement.clientWidth;
    };
    //结果输出至两个文本框
    // console.log(winWidth, winHeight);
    return {
        width : winWidth,
        height : winHeight
    };
};