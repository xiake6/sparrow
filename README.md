### mobile fight vue

> Touch端麻雀框架
> 麻雀虽小 五脏俱全 
> 我们撰写了该框架特性的PPT文件，请使用者优先阅读

###### 文件目录说明：

| 文件名 | 目录 | 描述 |
|:------:|:----------:|:------------:|
| build         | / | 框架启动打包等相关配置，具体细节请移步该目录内的README |
| channels      | / | 存放框架支持的多项目，具体细节请移步该目录内的README |
| common        | / | 存放框架公共工具、样式、脚本等内容，具体细节请移步该目录内的README |
| components    | / | 存放框架的公共组件，具体细节请移步该目录内的README |
| config        | / | 存放框架相关环境配置，具体细节请移步该目录内的README |
| engineering   | / | 存放框架工程脚本函数，具体细节请移步该目录内的README |
| mockServer        | / | 存放框架支持的mock函数等，具体细节请移步该目录内的README |
| static        | / | 存放框架的静态文件|
| test          | / | 存放框架的unit test相关，暂未启用 |

### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:--config=initialization --port=8001
# initialization 项目名
# port 端口 默认8080，端口可不填，框架会自动寻找可用端口并启用
npm run dev --config=initialization --port=8001

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test

# run sprite images
npm run sprite

# run sprite upload data
npm run upload
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

###### 栏目设计

+ 模块化设计
+ 代码重用性强
+ 代码解耦性强
+ 严格遵守按需加载原则
+ 支持多项目并行
+ 项目启动占用资源少
+ 热更新速度快


###### PS

+ 写注释
+ 写文档说明
