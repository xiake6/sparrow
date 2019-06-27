'use strict'
//版本检查 node的版本号 版本有要求"engines": {"node": ">= 6.0.0","npm": ">= 3.0.0"}
//立即执行
require('./check-versions')()

//声明当前环境并赋值到node服务的环境变量中
process.env.NODE_ENV = 'production'

//主要用来实现node.js命令行环境的loading效果,和显示各种状态的图标等
const ora = require('ora')

//rimraf插件是用来执行UNIX命令rm和-rf，用来删除文件和文件夹的，清空旧文件
const rm = require('rimraf')

//Node.js path 模块提供了一些用于处理文件路径的工具
const path = require('path')

//chalk是一个颜色的插件，针对麻雀框架build、启动、上传等命令行输出日志进行颜色区分
const chalk = require('chalk')

//webpack前端构建工具，引入webpack模块使用内置插件和webpack方法
const webpack = require('webpack')

//麻雀框架的打包和启动的相关配置
const config = require('../config')

//webpack的配置文件
const webpackConfig = require('./webpack.prod.conf')

// 开启转圈圈动画
const spinner = ora('building for production...')
spinner.start()
/**
 * rm: 删除指定目录内容
 * @param path {String} 路径拼接
 * @param err {Function} 回调参数 err错误参数
 */
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
    // 如果删除的过程中出现错误，就抛出这个错误，同时程序终止
    if (err) {
        throw err
    }
    // 没有错误，就执行webpack编译
    webpack(webpackConfig, (err, stats) => {
        // 停止转圈圈动画
        spinner.stop()
        // 如果有错误就抛出错误
        if (err) {
            throw err
        }
        //process.stdout用来控制标准输出，也就是在命令行窗口向用户显示内容。它的write方法等同于console.log
        process.stdout.write(stats.toString({
            // 增加控制台颜色开关
            colors: true,
            //去掉内置模块信息
            modules: false,
            //去掉子模块
            children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
            //增加包信息（设置为 false 能允许较少的冗长输出）
            chunks: false,
            //去除包里内置模块的信息
            chunkModules: false
        }) + '\n\n')

        // 下面是编译失败时输出的信息
        if (stats.hasErrors()) {
            console.log(chalk.red('  Build failed with errors.\n'))
            process.exit(1)
        }
        // 下面是编译成功的消息
        console.log(chalk.cyan('  Build complete.\n'))
        console.log(chalk.yellow(
            '  Tip: built files are meant to be served over an HTTP server.\n' +
            '  Opening index.html over file:// won\'t work.\n'
        ))
    })
})
