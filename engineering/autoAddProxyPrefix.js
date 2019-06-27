// 工程脚本通用
// const engUtils = require('./utils.js');
// const envConfig = engUtils.envconfig;
// const environmentConfig = require('../config/environmentConfig.js');

// 对应项目代理
const proxyConfig = require('../config/proxyConfig.js');

class autoAddProxyPrefix{
    constructor(){

    }
    apply(compiler){
        var options = [],
            oFilterProxyConfig = {};
        
        // filter repeat
        for( let x in proxyConfig ){
            oFilterProxyConfig[x.split("/")[1]] = `/${x.split("/").splice(1).join("/")}`;
        };
        // new proxy config object.
        for( let x in oFilterProxyConfig ){
            let item = oFilterProxyConfig[x];
            options.push({
                "proxyKey": item,
                "target": proxyConfig[item].target.replace(/(http|https)+\:/gi,""),
                expstr: ""
            });
        };
        // console.log( "newProxyConfig:", newProxyConfig );
        // for( let x in proxyConfig ){
        //     options.push({
        //         proxyKey: x,
        //         target: proxyConfig[x].target.replace(/(http|https)+\:/gi,""),
        //         expstr: "" //[]
        //     });
        // };
        // console.log( options );

        options.map(item=>{
            let exparr = item.proxyKey.split("**");
            let str = exparr.map((val,index)=>{
                if( !val && index==exparr.length-1 ){
                    return `?(?=\"|\')`;
                };
        
                if( !val ){
                    return "";
                }else{
                    return `(${val})`;
                };
            });
            item.expstr = str.join("+.+"); //.push(str);
        });
        // console.log( options );
        // return false;

        compiler.plugin("emit",(compilation, callback)=>{

            // compilation.chunks是块的集合（构建后将要输出的文件，即编译之后得到的结果）
            compilation.chunks.forEach(function(chunk) {
                // chunk.modules是模块的集合（构建时webpack梳理出的依赖，即import、require的module）
                // 形象一点说：chunk.modules是原材料，下面的chunk.files才是最终的成品
                // chunk.modules.forEach(function(module) {
                //     // module.fileDependencies就是具体的文件，最真实的资源【举例，在css中@import("reset.css")，这里的reset.css就是fileDependencie】
                //     module.fileDependencies.forEach(function(filepath) {
                //         // 到这一步，就可以操作源文件了
                //         // console.log("filepath: ", filepath);
                //     });
                // });

                // 最终生成的文件的集合
                chunk.files.forEach(function(itemFileName) {
                    // source()可以得到每个文件的源码
                    var source = compilation.assets[itemFileName].source();
                    options.map(item=>{
                        let _regexp = new RegExp(item.expstr, "gi"),
                            _match = source.match(_regexp),
                            matchingString = "";
                        
                        if( _match ){
                            matchingString = _match[0].substr(1);
                        };
                        source = source.replace(_regexp, `${item.target}${matchingString}`).replace(/(\/@@)+?(?=\/)/gi,"");
                        // console.log( item.target, matchingString );
                    });

                    compilation.assets[itemFileName] = {
                        source: ()=>{
                            return source
                        },
                        size: () => {
                            return Buffer.byteLength(source, 'utf8')
                        }
                    };
                    // console.log( "source: ", source.indexOf("/pciflightapi/json/calendar") );
                });
            });


            


            callback();
        });
    }
    init(){
        
    }
};


exports.default = autoAddProxyPrefix;
module.exports = autoAddProxyPrefix;