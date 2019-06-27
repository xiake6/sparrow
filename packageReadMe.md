{
  "name": "mobilefightvue",               //项目名称
  "version": "1.0.0",                     //项目版本
  "description": "H5移动端机票官网代码",    //项目描述
  "author": "github_xiake@163.com",          //项目作者
  "private": true,                        //禁止以任何形式使用私有包或未发布的包
  "scripts": {
    "dev": "npm run start",               //启动项目 npm run dev  --config=initialization
    "build": "node build/build.js",       //打包项目
    "upload": "node utils/upload.js",     //上传
    "sprite": "node engineering/sprite.js",     //打包精灵图  npm run sprite  --config=initialization
    "start": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
    "unit": "cross-env BABEL_ENV=test karma start test/unit/karma.conf.js --single-run",
    "e2e": "node test/e2e/runner.js",
    "test": "npm run unit && npm run e2e",       //运行项目测试
    "mock": "nodemon mockServer/index.js"        //启动项目mock数据 npm run mock  --config=initialization
  },
  "dependencies": {
    "animate.css": "^3.6.1",          //依赖的样式库
    "mint-ui": "^2.2.13",             //依赖的组件库
    "vue": "^2.5.2",                  //项目依赖vue.js
    "vue-resource": "^1.5.1",         //ajax
    "vue-router": "^3.0.1",           //路由
    "vuex": "^3.0.1"                  //中央管理器
  },
  "devDependencies": {
    "autoprefixer": "^7.1.2",             //自动补充浏览器前缀（兼容）
    //es6 转es5  babel
    "babel-core": "^6.22.1",
    "babel-helper-vue-jsx-merge-props": "^2.0.3",
    "babel-loader": "^7.1.1",
    "babel-plugin-istanbul": "^4.1.1",
    "babel-plugin-syntax-jsx": "^6.18.0",
    "babel-plugin-transform-runtime": "^6.22.0",
    "babel-plugin-transform-vue-jsx": "^3.5.0",
    "babel-preset-env": "^1.3.2",
    "babel-preset-stage-2": "^6.22.0",
    "babel-register": "^6.22.0",
    "chai": "^4.1.2",         //chai.js 是一套TDD(测试驱动开发)/BDD(行为驱动开发)的断言库
    "chalk": "^2.0.1",
    "chromedriver": "^2.27.2",          //ChromeDriver是一个独立的服务，它为 Chromium 实现 WebDriver 的 JsonWireProtocol 协议。
    "commander": "^2.15.1",           //node.js命令行界面的完整解决方案
    "copy-webpack-plugin": "^4.0.1",        //将项目中的某单个文件或整个文件夹在打包的时候复制一份到打包后的文件夹中（即复制一份到dist目录下）。
    "cross-env": "^5.0.1",          //能跨平台地设置及使用环境变量
    "cross-spawn": "^5.0.1",
    "css-loader": "^0.28.0",          //在.js文件中引入css文件并让样式生效。
    "extract-text-webpack-plugin": "^3.0.0",    //该插件的主要是为了抽离css样式,防止将样式打包在js中引起页面样式加载错乱的现象
    "file-loader": "^1.1.4",      //生成的文件的文件名就是文件内容的 MD5 哈希值并会保留所引用资源的原始扩展名
    "friendly-errors-webpack-plugin": "^1.6.1",//识别某些类别的webpack错误，并清理，聚合和优先级，以提供更好的开发人员体验。
    "html-webpack-plugin": "^2.30.1",       //它会自动帮你生成一个 html 文件，并且引用相关的 assets 文件(如 css, js)。
    "images": "^3.0.0",
    "inject-loader": "^3.0.0",          //Webpack加载器，用于通过其依赖项将代码注入模块
    "inquirer": "^6.0.0",                   //常用交互式命令行用户界面的集合。
    "karma": "^1.4.1",                  //自动化测试工具
    "karma-coverage": "^1.1.1",
    "karma-mocha": "^1.3.0",
    "karma-phantomjs-launcher": "^1.0.2",
    "karma-phantomjs-shim": "^1.4.0",
    "karma-sinon-chai": "^1.3.1",
    "karma-sourcemap-loader": "^0.3.7",
    "karma-spec-reporter": "0.0.31",
    "karma-webpack": "^2.0.2",
    "less": "^3.9.0",                       //css预处理器
    "less-loader": "^5.0.0",
    "mocha": "^3.2.0",              //mocha是JavaScript的一种单元测试框架
    "needle": "^2.2.1",             //
    "nightwatch": "^0.9.12",        //Nightwatch.js是一个用于Web应用程序和网站的自动化测试框架
    "node-notifier": "^5.1.2",
    "node-sass": "^4.9.0",          //css预处理器
    "optimize-css-assets-webpack-plugin": "^3.2.0",     //样式优化压缩 /配合添加前缀等
    "ora": "^1.2.0",
    "phantomjs-prebuilt": "^2.1.14",
    "portfinder": "^1.0.13",
    "postcss-import": "^11.0.0",            //是一个用 JavaScript 工具和插件转换 CSS 代码的工具
    "postcss-loader": "^2.0.8",
    "postcss-plugin-px2rem": "^0.7.0",
    "postcss-url": "^7.2.1",
    "querystring": "^0.2.0",                //提供用于解析和格式化 URL 查询字符串的实用工具
    "rimraf": "^2.6.0",                     //包的形式包装rm -rf命令，用来删除文件和文件夹的，不管文件夹是否为空，都可删除.
    "sass-loader": "^7.0.3",
    "selenium-server": "^3.0.1",
    "semver": "^5.3.0",                 //语义化版本控制规范（SemVer）
    "shelljs": "^0.7.6",                //Nodejs使用ShellJS操作目录文件
    "sinon": "^4.0.0",                  //Sinon是用来辅助我们进行前端测试的
    "sinon-chai": "^2.8.0",
    "uglifyjs-webpack-plugin": "^1.1.1",        //此插件使用uglify-js进行js文件的压缩。
    "url-loader": "^0.5.8",
    "vue-loader": "^13.3.0",
    "vue-style-loader": "^3.0.1",
    "vue-template-compiler": "^2.5.2",
    "webpack": "^3.6.0",
    "webpack-bundle-analyzer": "^2.9.0",
    "webpack-dev-server": "^2.9.1",
    "webpack-hot-middleware": "^2.22.2",
    "webpack-merge": "^4.1.0",
    "zip-webpack-plugin": "^3.0.0"
  },
  "engines": {
    "node": ">= 6.0.0",
    "npm": ">= 3.0.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not ie <= 8"
  ]
}
