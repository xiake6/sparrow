"use strict";
module.exports = {
    projectName: process.env.npm_config_config || "initialization",     // 项目设置： --config=initialization
    envconfig: process.env.npm_config_envconfig || "product",           // 环境设置： --envconfig=dev
    HOST: process.env.HOST,
    PORT: process.env.npm_config_port || 8080,                          // 端口设置： --port=8001
    reportSwitch: process.env.npm_config_report || false,               // build打包优化开关,true or false
    isProduct: process.env.NODE_ENV === 'production',                   // 是否生产环境
    isTest: process.env.NODE_ENV === "testing"                          // 是否测试环境
};
