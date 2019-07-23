/** 
 * 添加之前请先查看基础配置 避免重复
 * 有特俗需求除外
 * path: build/
**/

const utils = require("../../../engineering/utils.js");
const environmentConfig = require("../../../config/environmentConfig.js");

module.exports = {
    // 生产环境插件 production
    prodPlugins : [],
    // 开发环境插件 development
    devPlugins: [],
    // 代理配置
    proxyTable: {
        // //代理请求到线上环境
        // "/test/home/**": {
        //     target: environmentConfig["www.xiake666.com"][utils.envconfig],
        //     changeOrigin: true,
        // }
    },
    // potscss设置
    postcss: [
        // 将px转换为rem
        require('postcss-plugin-super-px2rem')({ //postcss-pxtorem
            // font-size 默认值
            rootValue: 20,
            // 需转换的最小数值
            minPixelValue: 2,
            // 转换单位设置
            customadaption: "px",
            // 屏蔽转换名单
            selectorBlackList: ['html'],
            // 需转换css 属性列表，留空默认全部转换
            propWhiteList: []
        }),
        require('autoprefixer')({
            browsers: ['last 2 versions']
        })
    ],
    // 配置雪碧图
    eachSprites:[{
        icons: 'icons',
        sprite: 'icon_sprite.png',
        file: 'sprite_icon.less',
        length : 1
    }],
    // 雪碧图是否放在本地。true则放在本地，false则上传到efs上。
    // 若要上传到efs，在打包雪碧图后，需要执行npm run upload --config=[name]。
    spritesIsLocal: true
}