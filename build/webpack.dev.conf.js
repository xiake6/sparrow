"use strict";
/**
 * webpack 本地开发环境配置
 */
const utils = require("./utils");

//webpack前端构建工具，引入webpack模块使用内置插件和webpack方法
const webpack = require("webpack");

//麻雀框架的打包和启动的相关配置
const config = require("../config");

//合并配置文件的工具,针对webpack的基础配置、开发配置、生产配置、测试配置文件的合并
const merge = require("webpack-merge");
//Node.js path 模块提供了一些用于处理文件路径的工具
const path = require("path");
const baseWebpackConfig = require("./webpack.base.conf");
//webpack拷贝插件--在webpack中拷贝文件和文件夹
const CopyWebpackPlugin = require("copy-webpack-plugin");
//因为我们生成的hash是不断变化的，与此同时index.html必须不断更改<script>标签中的src的值
// 解决hash值带来的问题，我们可以使用html-webpack-plugin插件
const HtmlWebpackPlugin = require("html-webpack-plugin");
//Friendly-errors-webpack-plugin识别某些类别的webpack错误，并清理，聚合和优先级，以提供更好的开发人员体验
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
//获取当前可用的port
const portfinder = require("portfinder");
// 分解任务和多线程管理
const HappyPack = require("happypack");
// 创建进程池，分步运算文件
const HappyThreadPool = HappyPack.ThreadPool({size:5});
// 监听模块方法注入
const signUpModule = require("../engineering/autoSignUpModule.js");

//声明当前系统的host
const HOST = process.env.HOST;
//声明当前系统的端口号
const PORT = process.env.PORT && Number(process.env.PORT);

// 工程脚本通用
const engUtils = require('../engineering/utils.js');


//合并基础配置和当前开发配置，组合为开发配置文件
const devWebpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({             //对项目中的所有样式相关的规则处理
            sourceMap: config.dev.cssSourceMap,
            usePostCSS: true                    //是否使用PostCSS插件
        })
    },
    //Source Maps 类型
    // cheap-module-eval-source-map is faster for development
    devtool: config.dev.devtool,

    // these devServer options should be customized in /config/index.js
    //提供了一个简单的 web 服务器，并且能够实时重新加载(live reloading)
    devServer: {
        clientLogLevel: "warning",                              //客户端日志输出级别
        historyApiFallback: {                                   //当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html
            rewrites: [
                {
                    from: /.*/,                                 //定义源目录
                    to: path.posix.join(                        //定义目标文件，即跳转到指定目录下的index.html
                        config.dev.assetsPublicPath,
                        "index.html"
                    )
                }
            ]
        },
        hot: true,                                              //启动热更新
        contentBase: false,                                     // since we use CopyWebpackPlugin. 使用 CopyWebpackPlugin替代此内置功能
        compress: true,                                         //是否启用gzip 压缩
        host: HOST || config.dev.host,                          //启动服务的host
        port: PORT || config.dev.port,                          //端口号
        open: config.dev.autoOpenBrowser,                       //是否默认打开浏览器
        overlay: config.dev.errorOverlay                        //当存在编译器错误或警告时，在浏览器中显示全屏覆盖
            ? { warnings: false, errors: true }
            : false,
        publicPath: config.dev.assetsPublicPath,                //此路径下的打包文件可在浏览器中访问
        proxy: config.dev.proxyTable,                           //代理
        quiet: true,                                            // necessary for FriendlyErrorsPlugin，启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台
        watchOptions: {                                         //监视文件相关的控制选项
            poll: config.dev.poll
        }
    },
    plugins: [
        // 允许创建一个在编译时可以配置的全局常量
        new webpack.DefinePlugin({
            "process.env": require("../config/dev.env")
        }),
        new webpack.HotModuleReplacementPlugin(),               // HMR shows correct file names in console on update.
        new webpack.NamedModulesPlugin(),                       // 当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境
        new webpack.NoEmitOnErrorsPlugin(),                     // 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: engUtils.resolve(`channels/${engUtils.channels}/src/index.html`),
            inject: true
        }),
        // copy custom static assets
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, "../static"),                                     //定义要拷贝的源文件
            to: config.dev.assetsSubDirectory,                                              //定义要拷贝到的目标文件夹
            ignore: [".*"]                                                                  //忽略拷贝指定的文件
        }]),
        new HappyPack({                                                                     //开启多线程，利用电脑多核优势，提升效率
            id: "babel",
            loaders: ["babel-loader?cacheDirectory"],
            threadPool: HappyThreadPool
        }),
        new signUpModule({                                                                  //自动化工具函数
            path: engUtils.resolve("common/utils"),
            outpath: engUtils.resolve("common"),
            outfilename: "utilsEntry.js"
        }),
        ...engUtils.arrayFaultTolerant()["devPlugins"]                                      //引入具体项目的插件配置
    ]
});

//vue-cli配置好了，一旦端口被占用，报错，再次运行时会打开：8080+1,依次类推...8080+n
module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.dev.port;
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err);
        } else {
            // publish the new Port, necessary for e2e tests
            process.env.PORT = port;
            // add port to devServer config
            devWebpackConfig.devServer.port = port;

            // Add FriendlyErrorsPlugin
            devWebpackConfig.plugins.push(
                new FriendlyErrorsPlugin({
                    compilationSuccessInfo: {
                        messages: [ // ${devWebpackConfig.devServer.host}
                            `Your application is running here: http://localhost:${port}`
                        ]
                    },
                    onErrors: config.dev.notifyOnErrors
                        ? utils.createNotifierCallback()
                        : undefined
                })
            );

            resolve(devWebpackConfig);
        }
    });
})

// require('../apps.js')();
