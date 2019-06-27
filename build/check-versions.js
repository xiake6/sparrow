'use strict'
//chalk是一个颜色的插件，针对麻雀框架build、启动、上传等命令行输出日志进行颜色区分
const chalk = require('chalk')
//一个版本控制的node的插件semver
const semver = require('semver')
const packageConfig = require('../package.json')
//Shell是linux下的脚本语言解析器，拥有丰富且强大的底层操作权限
//Shelljs就是基于node的一层命令封装插件，让前端开发者可以不依赖linux也不依赖类似于cmder的转换工具，而是直接在我们最熟悉不过的javascript代码中编写shell命令实现功能
const shell = require('shelljs')

//require('child_process')创建子进程，使其可以在进程中执行操作，应用系统命令等
//execSync用于同步的exec方法
function exec (cmd) {
  return require('child_process').execSync(cmd).toString().trim()
}

//semver.clean(process.version) 返回一个标准的版本号，且去掉两边的空格
const versionRequirements = [
  {
    name: 'node',
    currentVersion: semver.clean(process.version),  //node当前版本
    versionRequirement: packageConfig.engines.node  //读取配置，获取框架对node版本要求
  }
]

if (shell.which('npm')) {
  versionRequirements.push({
    name: 'npm',
    currentVersion: exec('npm --version'),          //npm当前版本
    versionRequirement: packageConfig.engines.npm   //读取配置，获取框架对npm版本要求
  })
}

//判断当前安装版本是否符合框架要求
//如果不符合给出对应提示，并退出
module.exports = function () {
  const warnings = []

  for (let i = 0; i < versionRequirements.length; i++) {
    const mod = versionRequirements[i]

    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      warnings.push(mod.name + ': ' +
        chalk.red(mod.currentVersion) + ' should be ' +
        chalk.green(mod.versionRequirement)
      )
    }
  }

  if (warnings.length) {
    console.log('')
    console.log(chalk.yellow('To use this template, you must update following to modules:'))
    console.log()

    for (let i = 0; i < warnings.length; i++) {
      const warning = warnings[i]
      console.log('  ' + warning)
    }

    console.log()
    process.exit(1)
  }
}
