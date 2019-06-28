### mobile fight vue

> 麻雀，一套专为前端开发者准备的基于webpack3.6开源的前端框架
> 麻雀虽小 五脏俱全 此成语完美诠释了此框架的核心理念。

> 我们撰写了该框架特性的PPT文件，请使用者优先阅读

> 麻雀框架是由 同程艺龙国内机票北京'侠客6'团队搭建而成

> '侠客6'团队成员5名
> |  位置  |  姓名  |  雅号  |  概要
>    ADC     左家右    右神    此位置的开发者拥有高超的技术，是整个团队最重要也是最稳定的输出来源
>    MID     刘念      念哥    此位置的开发者拥有较高的综合素质，能有凯瑞队友的能力和较强的支援意识，是队伍中的中流砥柱   
>   JUNGLE   王帅      大帅    此位置的开发者拥有较好的大局观，能够及时支援各条战线的队友带起游戏节奏，并且还必须承担控制地图上各个重要BUFF的责任。     
>    TOP     刘帆      帆姐    此位置的开发者拥有较强的对线能力，包括压制力以及抗压能力；还需要有一定的危险意识，上单是整个队伍基石般的存在。      
>    SUP     左玉星    左队    此位置的开发者拥有极强的团队运营能力，负责为团队提供优秀的视野，是整个团队的重要后盾。 

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
