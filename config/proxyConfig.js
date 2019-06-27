// 工程脚本通用
const engUtils = require('../engineering/utils.js');

// 总代理配置表
const proxyConfig = {
    ...require("../components/proxy-config.js"),
    ...engUtils.objectFaultTolerant()["proxyTable"]
    // //代理请求到线上环境
    // // 代理到本地
    // '/xieke/**': {
    //     target: 'http://localhost:1777',
    //     secure: false,  //if you want to verify SSL secure;  如果是HTTPS接口，需要配置此参数为true
    //     changeOrigin: true
    // }
}

module.exports = proxyConfig;