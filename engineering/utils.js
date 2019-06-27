/** 
 * 整体工程的服务脚本
**/

const path = require("path");
const fs   = require("fs");
const environmentConfig = require('../config/environmentConfig.js');

// console.log( process.env );

const utils = {
    channels: process.env.npm_config_config || "initialization", // 项目设置： --config=initialization
    envconfig : process.env.npm_config_envconfig || "product",
    PORT: process.env.npm_config_port || 8080,                   // 端口设置： --port=8001
    // 路径文件
    resolve(dir){
        return path.join(__dirname,"..",dir);
    },
    // 对象方法容错
    objectFaultTolerant(path=`config/webpack-config.js`, trycatch={}){
        // 校验文件是否存在
        var prefixurl = utils.resolve(`channels/${utils.channels}/${path}`),
            _fileExists = fs.existsSync( prefixurl );

        // 如果没有找到就返回默认配置
        if( !_fileExists ){
            return trycatch || {};
        };

        return require( prefixurl );
    },
    // 数组方法容错
    arrayFaultTolerant(path, trycatch=[]){
        return utils.objectFaultTolerant(path, trycatch);
    }
    
    // unique(arr){
    //     console.log(process.env.npm_config_port);

    //     var oTemp = {};
    //     arr.map(item=>{
    //         // console.log( item.constructor.toString() );
    //         oTemp[item.constructor.toString().match(/(function|class)\s*([^(]*)\(/)[1]] = item;
    //     });
    //     return Object.values(oTemp);
    // }
};

module.exports = utils;











// const merge = require("webpack-merge");

// function TestMethod(opts){this.name="test name"+opts;};
// class TestMethodClass {
//     constructor(){
//         this.classname = "class test name"
//     }
// }
// console.log( 
//     merge([new TestMethod(1), new TestMethodClass(), new TestMethod(2)])
// );

// return false;