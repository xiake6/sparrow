"use strict";
/**
 * webpack的生产环境配置文件
 *
 */
//Node.js path 模块提供了一些用于处理文件路径的工具
const path = require("path");

const utils = require("./utils");

//webpack前端构建工具，引入webpack模块使用内置插件和webpack方法
const webpack = require("webpack");

//麻雀框架的打包和启动的相关配置
const config = require("../config");

//合并配置文件的工具,针对webpack的基础配置、开发配置、生产配置、测试配置文件的合并
const merge = require("webpack-merge");

const baseWebpackConfig = require("./webpack.base.conf");

//webpack拷贝插件--在webpack中拷贝文件和文件夹
const CopyWebpackPlugin = require("copy-webpack-plugin");

//因为我们生成的hash是不断变化的，与此同时index.html必须不断更改<script>标签中的src的值
// 解决hash值带来的问题，我们可以使用html-webpack-plugin插件
const HtmlWebpackPlugin = require("html-webpack-plugin");

//该插件的主要是为了抽离css样式,防止将样式打包在js中引起页面样式加载错乱的现象
const ExtractTextPlugin = require("extract-text-webpack-plugin");

//压缩单独的css文件的插件
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");

//此插件使用uglify-js进行js文件的压缩
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

// 分解任务和多线程管理
const HappyPack = require("happypack");
// 创建进程池，分步运算文件
const HappyThreadPool = HappyPack.ThreadPool({size:5});
// 工程脚本通用
const engUtils = require('../engineering/utils.js');
//针对一个项目有多域名请求时，且多域名都允许跨域时。此插件支持build时，将全域名打包进去，
//请根据自己的实际场景应用开启
// const autoAddProxyPrefix = require("../engineering/autoAddProxyPrefix.js");

const env =
    process.env.NODE_ENV === "testing"
        ? require("../config/test.env")
        : require("../config/prod.env");

const webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true,                                              //是否将css和js从vue文件中抽离
            usePostCSS: true                                            //是否使用PostCSS插件
        })
    },
    //Source Maps 类型
    devtool: config.build.productionSourceMap ? config.build.devtool : false,
    //输出管理
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath("js/[name].js"),     // .[chunkhash]
        chunkFilename: utils.assetsPath("js/[id].js")   // .[chunkhash]
    },
    plugins:[
        // new autoAddProxyPrefix(),                    //请阅读引入时的注释
        new HappyPack({
            id: "babel",
            loaders: ["babel-loader?cacheDirectory"],
            threadPool: HappyThreadPool
        }),
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new webpack.DefinePlugin({
            "process.env": env
        }),
        // https://blog.csdn.net/u013884068/article/details/83511343
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    // webpack删除没有用到的代码时不输出警告
                    warnings: false,
                    // 是否删除所有console.log语句
                    drop_console: true
                }
            },
            sourceMap: config.build.productionSourceMap,
            parallel: true                                  //并行，提升压缩效率
        }),
        // extract css into its own file 提取css
        new ExtractTextPlugin({
            filename: utils.assetsPath("css/[name].css"),   //.[contenthash]
            // Setting the following option to `false` will not extract CSS from codesplit chunks.
            // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
            // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
            // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
            allChunks: true
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped. 压缩css
        new OptimizeCSSPlugin({
            cssProcessorOptions: config.build.productionSourceMap
                ? { safe: true, map: { inline: false } }
                : { safe: true }
        }),
        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename:
                process.env.NODE_ENV === "testing"
                    ? engUtils.resolve(`channels/${engUtils.channels}/src/index.html`)
                    : config.build.index,
            template: engUtils.resolve(`channels/${engUtils.channels}/src/index.html`),
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: "dependency"
        }),
        // keep module.id stable when vendor modules does not change
        new webpack.HashedModuleIdsPlugin(),
        // enable scope hoisting  针对闭包模块，进行 作用域提升(scope hoisting) ，提升js性能
        new webpack.optimize.ModuleConcatenationPlugin(),
        // split vendor js into its own file 提取第三方库和公共模块
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks(module) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, "../node_modules")
                    ) === 0
                );
            }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: "manifest",
            minChunks: Infinity
        }),
        // This instance extracts shared chunks from code splitted chunks and bundles them
        // in a separate chunk, similar to the vendor chunk
        // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
        new webpack.optimize.CommonsChunkPlugin({
            name: "app",
            async: "vendor-async",
            children: true,
            minChunks: 3
        }),
        // copy custom static assets
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, "../static"),
            to: config.build.assetsSubDirectory,
            ignore: [".*"]
        }]),
        ...engUtils.arrayFaultTolerant()["prodPlugins"]
    ]
});

if (config.build.productionGzip) {
    const CompressionWebpackPlugin = require("compression-webpack-plugin");

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: new RegExp(
                "\\.(" + config.build.productionGzipExtensions.join("|") + ")$"
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    );
}
//打包文件分析工具,默认false，如改为true，需要对工具进行配置
if (config.build.bundleAnalyzerReport) {

    const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
        .BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
