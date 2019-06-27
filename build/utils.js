'use strict'
//Node.js path 模块提供了一些用于处理文件路径的小工具
const path = require('path')
//麻雀框架的打包和启动的相关配置
const config = require('../config')
//该插件将css模块和js模块分开打包，换句话说把css代码从js文件中抽离出来，单独出一个模块。
//注意：在webpack4中，建议用mini-css-extract-plugin替代
const ExtractTextPlugin = require('extract-text-webpack-plugin')
//Node.js项目遵循模块化的架构，当我们创建了一个Node.js项目，意味着创建了一个模块，package.json就是这个模块的描述文件
const packageConfig = require('../package.json')

//根据当前系统环境声明assets（存放js,css,images）的地址
exports.assetsPath = function (_path) {
    const assetsSubDirectory = process.env.NODE_ENV === 'production'
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory

    return path.posix.join(assetsSubDirectory, _path)
}

//用来返回针对各类型的样式文件的处理方式(方法)
exports.cssLoaders = function (options) {
    options = options || {}

    const cssLoader = {
        loader: 'css-loader',
        options: {  //options是loader的选项配置
            sourceMap: options.sourceMap  //根据参数是否生成sourceMap文件
        }
    }
    /**
     * PostCSS是一个用js插件来自动化进行规范的CSS操作的软件开发工具。
     * 支持PostCSS的js插件可以lint CSS代码、可以支持变量和mixins操作、可以转义未来的CSS语法(future CSS syntax)、内联(inline)图片
     * @type {{loader: string, options: {sourceMap: *}}}
     */
    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: options.sourceMap
        }
    }

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        //PostCSS 一般不单独使用，而是与已有的构建工具进行集成,如cssLoader
        const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            })
        }

        // 如果传入的options存在extract且为true
        /**
         * ExtractTextPlugin.extract基本参数说明：
         * use:指需要什么样的loader去编译文件
         * fallback: 这里表示不提取的时候，使用什么样的配置来处理css
         * publicfile:用来覆盖项目路径,生成该css文件的文件路径
         */
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: loaders, //处理的loader
                fallback: 'vue-style-loader'    //没有被提取分离时使用的loader
            })
        } else {
            return ['vue-style-loader'].concat(loaders)
        }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    //返回css类型对应的loader组成的对象 generateLoaders()来生成loader
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {indentedSyntax: true}),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
}

// Generate loaders for standalone style files (outside of .vue)
// 生成处理单独的.css、.sass、.scss等样式文件的规则
exports.styleLoaders = function (options) {
    //定义返回的数组，数组中保存的是针对各类型的样式文件的处理方式
    const output = []
    // 调用cssLoaders方法返回各类型的样式对象(css: loader)
    const loaders = exports.cssLoaders(options)

    for (const extension in loaders) {
        const loader = loaders[extension]
        output.push({
            test: new RegExp('\\.' + extension + '$'), // 处理的文件类型
            use: loader //用loader来处理，loader来自loaders[extension]
        })
    }

    return output
}

//当遇到错误时，给你推送信息
exports.createNotifierCallback = () => {
    //'node-notifier'是一个跨平台系统通知的页面，当遇到错误时，它能用系统原生的推送方式给你推送信息
    const notifier = require('node-notifier')

    return (severity, errors) => {
        if (severity !== 'error') return

        const error = errors[0]
        const filename = error.file && error.file.split('!').pop()

        notifier.notify({
            title: packageConfig.name,      //框架名称
            message: severity + ': ' + error.name, //消息内容
            subtitle: filename || '',       //消息名称
            icon: path.join(__dirname, 'logo.png')
        })
    }
}
