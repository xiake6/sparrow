"use strict";
const utils = require("./utils");

//麻雀框架的打包和启动的相关配置
const config = require("../config");

//声明当前是否是生产环境
const isProduction = process.env.NODE_ENV === "production";

//根据环境是否开启source map
const sourceMapEnabled = isProduction
    ? config.build.productionSourceMap
    : config.dev.cssSourceMap;

// 工程脚本通用
const engUtils = require('../engineering/utils.js');

module.exports = {
    loaders: utils.cssLoaders({
        sourceMap: sourceMapEnabled,
        extract: isProduction
    }),
    cssSourceMap: sourceMapEnabled,
    //Cache busting就是强制浏览器下载新文件的一种方法,俗称缓存破解，做法是给文件名加上hash值
    cacheBusting: config.dev.cacheBusting,
    //webpack4中，transformToRequire (现在改名为 transformAssetUrls)
    //vue的优化，不需要把图片、音频等路径地址写成变量
    transformToRequire: {
        video: ["src", "poster"],
        source: "src",
        img: "src",
        image: "xlink:href"
    },
    postcss: engUtils.arrayFaultTolerant()["postcss"]
};
