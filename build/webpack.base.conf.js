"use strict";
/**
 * webpack的基础配置文件
 * 
**/

//Node.js path 模块提供了一些用于处理文件路径的工具
const path = require("path");

const utils = require("./utils");

//麻雀框架的打包和启动的相关配置
const config = require("../config");
//vue加载插件的配置
const vueLoaderConfig = require("./vue-loader.conf");
// 工程配置文件
const prodConfig = require('../engineering/config.js');
// 工程脚本通用
const engUtils = require('../engineering/utils.js');

// 路径获取的封装
function resolve(dir) {
    return path.join(__dirname, "..", dir);
};

// // 设置全局别名变量
// global["__base"] = resolve("/");
// global["__this"] = resolve(`channels/${engUtils.channels}/config`);
// console.log( "nodejs 全局变量:", global["__base"], process.env.NODE_PATH );

// console.log( "engUtils.process:", engUtils.channels, process.env.npm_config_config );
module.exports = {
    // 基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
    context: path.resolve(__dirname, "../"),
    // 主文件入口 根据--config=channels值动态变化
    entry: {
        app: resolve(`channels/${engUtils.channels}/src/main.js`)
        // "./src/main.js"
    },
    //输出结果
    output: {
        path: config.build.assetsRoot,                  //输出目录
        filename: "[name].js",                          //输出文件名，[name]是指 entry 对象内的key值（例如当前等价于 [name].js == app.js）
        chunkFilename: '[name].[hash:7].chunk.js',      //只用于指定在运行过程中生成的chunk在输出时的文件名称，如：使用CommonChunkPlugin、使用import('path/module')动态加载等
        publicPath:                                     //发布到线上资源的URL前缀
            process.env.NODE_ENV === "production"
                ? config.build.assetsPublicPath
                : config.dev.assetsPublicPath
    },
    //配置寻找模块的规则，针对特定目录，可以避免使用../这种繁琐且易出错的方式
    resolve: {
        extensions: [".js", ".vue", ".json"],
        alias: {
            "vue$": "vue/dist/vue.esm.js",
            "@": resolve("common"),                                             //根目录下common的文件夹可以使用@替代
            "@components": resolve("components"),                               //公共组件的文件夹可以使用@components替代
            "@this": resolve(`channels/${engUtils.channels}/src`)              //具体项目的src目录可以使用@this替代
            // "@config": resolve("config")                                        //根目录下config文件可以使用@config替代
        }
    },
    //配置处理模块的规则
    module: {
        rules: [
            {
                test: /\.vue$/,                                                 //正则匹配.vue文件
                loader: "vue-loader",
                options: vueLoaderConfig
            },
            {
                test: /\.js$/,                                                  //正则匹配.js文件
                // loader: "babel-loader",
                use: ["happypack/loader?id=babel"],
                include: [                                                      //针对特定目录内的js文件
                    resolve(`channels/${engUtils.channels}/src`),               //具体启动项目的src文件夹
                    resolve("test"),                                            //根目录下的test文件夹
                    resolve("node_modules/webpack-dev-server/client")
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,                          //正则匹配图片文件
                loader: "url-loader",
                options: {
                    limit: 10,                                                  //limit: 10,限制 图片大小 10B，小于限制会将图片转换为 base64格式
                    name: utils.assetsPath("img/[name].[hash:7].[ext]")         //图片全部放到assets/img目录下，且图片名称进行hash处理
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,              //正则匹配音频文件
                loader: "url-loader",
                options: {
                    limit: 10,
                    name: utils.assetsPath("media/[name].[hash:7].[ext]")
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,                         //正则匹配字体文件
                loader: "url-loader",
                options: {
                    limit: 10,
                    name: utils.assetsPath("fonts/[name].[hash:7].[ext]")
                }
            }
        ]
    },
    node: {
        // prevent webpack from injecting useless setImmediate polyfill because Vue
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        //node自带的模块，不需要安装，但有时候在实际项目中引入会报错，所以在此设置
        dgram: "empty",
        fs: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty"
    }
};
