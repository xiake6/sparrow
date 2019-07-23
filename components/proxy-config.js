const utils = require("../engineering/utils.js");
const environmentConfig = require("../config/environmentConfig.js");
// console.log("process.env.NODE_ENV:",process.env.NODE_ENV);


module.exports = {
    //代理请求到线上环境
    "/xiake/components": {
        target: environmentConfig["www.xiake666.com"][utils.envconfig],
        changeOrigin: true,
    },
};