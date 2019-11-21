"use strict";
const path = require("path");
const fs   = require("fs");
//系统配置
const systemConfig = require("./systemConfig");

/**
 * 项目名称、资源链接路径、版本号配置  start
 * 将项目的上传地址，按照资源路径、项目名称、版本号，为后期扩展预留拆分
 * 该配置用途：
 *  1、上传插件
 *  2、精灵图插件
 */
const allProjectConfig = {
    "initialization": {
        // 端口
        // port : systemConfig.PORT,
        // 版本号：201801v1代表2018文件夹里的01文件夹下的v1版本
        ver: '/201901v1',
        // 资源链接路径
        assetsPath: `m.xxx.com/static/webapp/sparrow_${systemConfig.projectName}/`,
        // 项目名称配置
        prodname: `sparrow_${systemConfig.projectName}`
    },
    "manage": {
        // 端口
        // port : systemConfig.PORT,
        // 版本号：201801v1代表2018文件夹里的01文件夹下的v1版本
        ver: '/201901v1',
        // 资源链接路径
        assetsPath: `m.xxx.com/static/webapp/sparrow_${systemConfig.projectName}/`,
        // 项目名称配置
        prodname: `sparrow_${systemConfig.projectName}`
    },
};

//默认项目配置 initialization
let projectConfig = allProjectConfig['initialization'];
// 容错提示
try {
    if (!allProjectConfig[systemConfig.projectName]) {
        console.warn(`${systemConfig.projectName}项目不存在，请在${path.join(__filename)}中进行配置！`);
        process.abort();
    }
    // 配置项目信息
    projectConfig = allProjectConfig[systemConfig.projectName];
} catch (e) {
    console.log(e);
}

/**
 * 项目名称、资源链接路径、版本号配置  end
 */


/**
 * 全部代理配置，包括组件代理、项目代理、框架代理   start
 * 将代理按照组件、项目、框架（全局）拆分，实现互不干扰或互相补充
 * 该配置用途：
 * 1、本地开发环境的代理使用
 */
// 总代理配置表
const proxyConfig = {
    ...require("../components/proxy-config.js"),
    ...objectFaultTolerant()["proxyTable"]
    // //代理请求到线上环境
    // "/flight/**": {
    //     // 接口域名
    //     target: "http://m.xxx.com",
    //     // 如果接口跨域，这个参数需要设置成true
    //     changeOrigin: true
    // }
};

function objectFaultTolerant(filePath=`config/webpack-config.js`, trycatch={}){
    // console.log("校验文件是否存在:",path.join);
    // 校验文件是否存在
    var prefixurl = path.join(__dirname,"..",`channels/${systemConfig.projectName}/${filePath}`),
        _fileExists = fs.existsSync( prefixurl );

    // 如果没有找到就返回默认配置
    if( !_fileExists ){
        return trycatch || {};
    };

    return require( prefixurl );
};

/**
 * 全部代理配置，包括组件代理、项目代理、框架代理   end
 */


/**
 * 框架webpack的开发和打包配置   start
 * 将webpack配置按照本地开发环境和打包环境进行拆分
 */
// CDN前缀链接 + 项目名 + 版本管理策略 + 版本号
const assetsPublicPath = () => `//${projectConfig.assetsPath}${projectConfig.prodname}${projectConfig.ver}`;

const webpackConfig = {
    // 开发环境下面的配置
    dev: {
        // 资源子目录，指js，css，img存放的目录
        assetsSubDirectory: "static",
        // 资源目录
        assetsPublicPath: "/",
        // 代理配置表
        proxyTable: proxyConfig,
        // Various Dev Server settings
        // host，默认是localhost,代表本地服务器。'0.0.0.0'代表本机可访问的所有IP地址
        host: "0.0.0.0",        // can be overwritten by process.env.HOST
        // 端口号。读取启动项目对应的端口号
        port: systemConfig.PORT,  // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
        // 是否在编译后自动在浏览器中打开页面
        autoOpenBrowser: false,
        // 是否在浏览器上全屏显示编译的errors
        errorOverlay: true,
        // 跨平台错误提示
        notifyOnErrors: true,
        // 对文件更改的监控。可以配置成数字。表示每多少秒检查文件是否更改。
        // 该操作对于文件系统来说消耗较大。且在某些场景是不起作用的
        poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
        /**
         * eval： 生成代码 每个模块都被eval执行，并且存在@sourceURL
         * cheap-eval-source-map： 转换代码（行内） 每个模块被eval执行，并且sourcemap作为eval的一个dataurl
         * cheap-module-eval-source-map： 原始代码（只有行内） 同样道理，但是更高的质量和更低的性能
         * eval-source-map： 原始代码 同样道理，但是最高的质量和最低的性能
         * cheap-source-map： 转换代码（行内） 生成的sourcemap没有列映射，从loaders生成的sourcemap没有被使用
         * cheap-module-source-map： 原始代码（只有行内） 与上面一样除了每行特点的从loader中进行映射
         * source-map： 原始代码 最好的sourcemap质量有完整的结果，但是会很慢
         */
        devtool: "cheap-module-eval-source-map",
        // If you have problems debugging vue-files in devtools,
        // set this to false - it *may* help
        // https://vue-loader.vuejs.org/en/options.html#cachebusting
        // 开发环境下，使缓存失效（对于浏览器缓存js，html的内容）
        cacheBusting: true,
        // 代码压缩后进行调bug定位将非常困难，于是引入sourcemap记录压缩前后的位置信息记录
        cssSourceMap: true
    },
    // 生产环境下面的配置
    build: {
        // Template for index.html
        // index编译后生成的位置和名字
        index: path.resolve(__dirname, `../dist/${systemConfig.projectName}/index.html`),
        // 编译后存放生成环境代码的位置
        assetsRoot: path.resolve(__dirname, `../dist/${systemConfig.projectName}`),
        // js,css,images存放文件夹名
        assetsSubDirectory: "static",
        // 发布的根目录。如果是上线的文件，可根据文件存放位置进行更改路径
        assetsPublicPath: assetsPublicPath(),   // "/",
        // 在构建生产环境版本时是否开启source map
        productionSourceMap: false,
        // https://webpack.js.org/configuration/devtool/#production
        devtool: "#source-map",
        // Gzip off by default as many popular static hosts such as
        // Surge or Netlify already gzip all static assets for you.
        // Before setting to `true`, make sure to:
        // npm install --save-dev compression-webpack-plugin
        // 是否开启 gzip
        productionGzip: false,
        // 需要使用 gzip 压缩的文件扩展名
        productionGzipExtensions: ["js", "css"],
        // Run the build command with an extra argument to
        // View the bundle analyzer report after build finishes:
        // `npm run build --report`
        // Set to `true` or `false` to always turn it on or off
        // 打包优化开关
        bundleAnalyzerReport: systemConfig.reportSwitch
    }
};
/**
 * 框架webpack的开发和打包配置   end
 */

module.exports = {
    projectConfig,
    webpackConfig,
    proxyConfig
};
