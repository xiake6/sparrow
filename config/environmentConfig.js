let domainMap = {
    "www.xxx.com": {
        'dev': 'http://www.xxx.com/',
        'qa': 'http://www.qa.xxx.com/',
        'stage': 'http://www.stage.xxx.com/',
        'product': 'http://wx.17u.cn/',
    },
};
//系统配置
const systemConfig = require("../config/systemConfig");

module.exports = {
    "www.xxx.com": domainMap['www.xxx.com'][systemConfig.envconfig],
}

