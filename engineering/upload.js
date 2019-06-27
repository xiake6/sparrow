// var request = require('request-promise'); http://stackabuse.com/node-js-async-await-in-es7/

const path = require('path');
const fs   = require( 'fs' );
// 命令交互 比如：confirm之类的
const inquirer = require('inquirer');
// 工具方法
const utils = require('./Tools.js');
//用户登录信息 （自己配置）
const userSignIn = require( './userSignIn.js' );
// 项目配置   
// const prodConfig = require('./prod.cofig.js');
// setting log
// const LogSystem = require("./SetLogs.js");
const prodConfig = require('./config.js');
// 异步接口代理
const needle = require( "needle" );
// 对象转key=val格式之类    cnpm i querystring -D
const queryString = require('queryString');

/** 
 * node: 资源上传的脚本ing
 * 
 * @url            {string}         请求接口的地址
 * @params         {object}         参数对象 ( params object )
 * @assetsPath     {string}         标记的资源路径
 * @prodname       {string}         标记的项目名称
 * @folderPath     {string}         标记的文件夹路径
 * @rename         {boolean}        是否重命名 ( setting rename )
 * @protocol       {string}         协议头设置
 * @multiplerename {boolean}        已重命名时候需要再重命名
 * @isInquirer     {boolean}        是否开始询问模式
 * @logSta         {boolean}        是否开始日志监控
 * 
 * @params list: 
*/
class UploadAssets {
    constructor(obj){
        this.opts = {
            "url"   : "http://efs.corp.xiake.com",
            "params": {
                "domainId": "xiake.com"
            },
            "assetsPath"    : "xiake/static/webapp/wxprogramstaticassets/",
            // "prodname"      : "wxprogram",
            // "assetsPath"    : `xiake/static/webapp/${prodConfig.assetsPath}/`,
            "prodname"      : `${prodConfig.prodname}`,
            "folderPath"    : "",
            "protocol"      : "http",
            "rename"        : false,
            "multiplerename": false,
            "isInquirer"    : true,
            "logSta"        : true
        };
        for(let x in obj) this.opts[x] = obj[x];
        
        this.BaseConfig();
        this.initiation();
    }
    // initiation method script.
    // 初始化方法的脚本
    initiation(){
        if( !this.validateConfigOptions() ) return false;

        this.setAssetsPath();
        this.inquirerAdminConfirm();

        // log
        // LogSystem.setUploadLog(`upload工具被执行,上传路径前缀是:${this.opts["assetsPath"]}`);
    }
    // inquirer admin confirm implement.
    // 询问管理员是否执行
    inquirerAdminConfirm(){
        var opts = this.opts,
            path = opts["protocol"] + opts["assetsPath"];
        
        if(opts["isInquirer"]){
            // inquirer prompt
            inquirer.prompt([{
                type: "confirm",
                name: "status",     //上传文件到efs站点
                message: `请确认上传地址：${path}`
            }]).then(answers => {
                console.log('then', answers);

                console.log( 'answers.status', answers.status );
                if ( !!answers.status ) {
                    this.log("准备上传");
                    this.log(` 上传地址 :  ${path}`);
                    this.uploadStart(opts);
                } else {
                    this.log("停止上传文件");
                };
            });

        }else{
            this.uploadStart(opts);
        };
        // console.log(opts, path);
    }

    // upload start method
    // 开始上传的方法
    uploadStart(){
        // before upload validate is login
        this.userLogin();
    }
    // admin login
    // 管理员登陆
    userLogin(){
        var self = this;
        // // 参数编译成 &key=value模式并且给符号编码
        var params = queryString.stringify(userSignIn);

        needle.post('http://xiake.com/user/login',params,{
            cookies: {},
            headers: {}
        },(err,httpResponse,body)=>{
            console.log('登录状态',err, httpResponse.body);
            if( !httpResponse.body.checkSuccess ){
                console.log(`登录失败body信息：${httpResponse.body}`); 
                return false;
            };
            console.log(`登录成功的cookie信息：${JSON.stringify(httpResponse.cookies)}`); 
            // setting after sign in cookie info.
            // 设置登录后的cookie信息
            self.setData("cookies",httpResponse.cookies);
            // core method, check up path
            self.eachCoreMethod();

        })
    }
    // core method, check up path if not, create or visit.
    // 核心方法，检查路径时没有就执行创建，有就进行访问
    eachCoreMethod(){
        var that = this,
            page = 0,
            opts = this.opts,
            oRoute = opts["assetsPath"],
            oSlipt = oRoute.split("/"),
            sRoute = "",    // 拼接路由
            recursion = function(){
                // 设置递归临界值（结束条件)
                if( page >= oSlipt.length-1 ){
                    // implement upload event
                    // 执行上传事件
                    that.uploadMethod();
                    return false;
                } else {
                    sRoute += `/${oSlipt[page]}`;
                    that.searchCatalog(
                        sRoute,
                        resp =>{    // callback complete.
                            
                            if( oSlipt[page+1] ){
                                // 匹配器 - 匹配请求返回中有没有目录名
                                let oFilter = resp.entity.filter( elem => elem.fileName == oSlipt[page+1] );
                                // console.log( page,oSlipt[page+1],sRoute );
                                // 如果目录里面又需要指定目录，那么就创建目录。
                                if( resp.entity.length == 0 || oFilter.length == 0 ){
                                    that.createCatalog(
                                        sRoute,
                                        oSlipt[page+1],
                                        utils.iDate().mm,
                                        utils.iDate().time,
                                        function(resp){
                                            page++;
                                            recursion();
                                        }
                                    );
                                }else{
                                    page++;
                                    recursion();
                                };
                            };
                        }
                    )
                };
            };
            // implement mthod
            recursion();   
    }
    // upload to server method.
    // 上传到资源服务器方法
    uploadMethod(){
        var opts = this.opts;
        // 指定文件路径上传
        // if( opts['filePath'] ){ };
        // 指定文件夹路径
        
        if( opts['folderPath'] ){
        console.log('zpimeiy', opts['folderPath'])

            this.uploadFiles();
        };
    }
    // submit folder in files.
    // 提交目录内的文件
    uploadFiles(){
        var that = this,
            opts = this.opts,
            assetsPath = opts["assetsPath"],
            folderPath = opts["folderPath"],
            page = 0,
            callPointerSource = function(path){
                var fileStatSync = fs.statSync( path );
                // 如果是目录 -- 说明需要把目录里面的文件都上传
                if ( fileStatSync.isDirectory() ) {
                    var fileData = utils.SearchFile(path,/[*]*/gi);
                    // console.log( "isDirectory:",fileData );
                    return fileData;
                }
                // 如果是文件 -- 说明想直接上传这个文件
                else if( fileStatSync.isFile() ){
                    var fileData = [path];
                    // console.log( "isFile:",fileData );
                    return fileData;
                };
            },
            fileSource = callPointerSource(folderPath).Data,
            // ------- 开始从文件夹内指定上传资源 ------- //
            // 封装一个递归的文件上传方法
            recursionFiles = function(){
                if( page >= fileSource.length ){
                    that.log( "upload files multipart success" );
                    that.log( "上传路径列表" );
                    that.uploadConfigList( fileSource, assetsPath );
                    // 提交文件
                    that.publish();
                    return false;
                };
                
                utils.Service({
                    url : `${opts["url"]}/file/upload?`,
                    params : {
                        'domainId': opts.params.domainId,
                        'filePath': `/${assetsPath}`,    
                        'unzip'   : false
                    },
                    ndeData : {
                        file :{
                            // fileSource 文件路径+资源名
                            'file'         : fileSource[page],
                            'content_type' : 'application/octet-stream'
                        }
                    },
                    ndeOptions : {
                        cookies : that.BaseConfig.cookies,
                        multipart : true
                    },
                    callback : (err,resp)=> {
                        console.log('uploader', err,resp.body, fileSource[page] ,that.BaseConfig.cookies, assetsPath, opts.params.domainId);
                        if( !resp.body.checkSuccess ) return false;
                        page ++;
                        recursionFiles();
                    }
                });
            };

            console.log('fileSource', fileSource);

        recursionFiles();
    }
    // publish method
    // 发布方法
    publish(){
        var opts = this.opts;
        utils.Service({
            url : `${opts["url"]}/file/publish?`,
            params : {
                'domainId' : opts.params.domainId,
                // 发布路径的参数
                'customUrl': opts['assetsPath'],
                'isFolder' : true,  //ture：文件夹
                'publishRemark': utils.iDate().time
            },
            ndeOptions : {
                cookies : this.BaseConfig.cookies,
                json : true
            },
            callback : (err,resp)=> {
                if( !resp.body.checkSuccess ) return false;
                this.log( "publish success" );
                this.log( "程序执行上传任务成功" );
            }
        });
    }
    // validate config options attribute.
    // 校验配置项的属性 
    validateConfigOptions(){
        const opts = this.opts;
        if( !opts["url"] ){
            console.log("---------- 没有配置对象 url 的值 ----------");
            return false;
        };
        if( !opts["prodname"] ){
            console.log("---------- 没有配置对象 prodname 的值 ----------");
            return false;
        };
        if( !opts["assetsPath"] ){
            console.log("---------- 没有配置对象 assetsPath 的值 ----------");
            return false;
        };
        if( !opts["folderPath"] ){
            console.log("---------- 没有配置对象 folderPath 的值  ----------");
            return false;
        };
        return true;
    }
    // setting request assets url path.
    // 设置请求资源的路径
    setAssetsPath(){
        const opts = this.opts;
        // 上传路径 || 上传时接口要接收的参数
        this.opts["assetsPath"] = opts["assetsPath"]+opts["prodname"];
    }
    // search folder is not.
    // 搜索目录是否存在
    searchCatalog( filepath,fn ){
        var opts = this.opts;
        utils.Service({
            url : `${opts["url"]}/file/get/bypath?`,
            params : {
                'domain_id' : opts.params.domainId,
                'file_path' : filepath
            },
            ndeOptions : {
                cookies : this.BaseConfig.cookies
            },
            callback : (err,resp)=> {
                // 返回成功
                // console.log('返回成功', resp.body,`${filepath}`);
                // fn && fn(resp.body);
                if( !!resp.body.checkSuccess ){
                    this.log( `查询到目录: /${filepath}` );
                    fn && fn(resp.body);
                };
            }
        });
    }
    // create folder.
    // 创建目录
    createCatalog(filepath,name,remarks,desc,fn){
        var opts = this.opts;
        utils.Service({
            url : `${opts["url"]}/file/add?`,
            params : {
                'fileId'    : 0,
                'domainName': opts.params.domainId,
                'filePath'  : filepath,
                'fileName'  : name,
                'uploadRemarks'  : remarks,
                'fileDescription': desc,
                'storeType'      : 1
            },
            ndeOptions : {
                cookies : this.BaseConfig.cookies
            },
            callback : ( err,resp )=> {
                // 返回成功
                if( !!resp.body.checkSuccess ){
                    this.log( `创建：/${filepath}/${name}目录` );
                    fn && fn(resp.body);
                };
            }
        });
    }
    // some config.
    // 一些配置项
    BaseConfig(){
        this.BaseConfig = {
            // save ajax in cookies info.
            // 保存ajax请求中的cookies数据
            "cookies": ""
        };
        // setting some options attring
        this.opts["protocol"] = `${this.opts["protocol"]}://`;
    }
    // upload folder show log
    // 上传目录列表路径提示
    uploadConfigList(obj,url){
        var validate = Object.prototype.toString.call(obj);
        // 数组
        if( validate.indexOf('Array') != -1 ){
            // console.log( obj );
            [].forEach.call(obj,(elem,i)=>{
                this.log( url + elem.match(/\/+[A-Za-z0-9\-\_]+\..*/gi)[0] );
            });
        }else if( validate.indexOf('Object') != -1 ){

        };
    }
    // tip console log.
    // 日志日式
    log(text){
        if(!this.opts.logSta) return "";
        return console.log(` -------------------- ${text} -------------------- `);
    }
    setData(n,v,s=this.BaseConfig){
        // 如果n参数没有则不往下执行
        if (!n || typeof n !== 'string') return false;

        var oLength = (/[\.]+/gi.test(n)) ? n.split('.') : [n],
            source = s;
        for (let i = 0; i < oLength.length; i++) {
            let item = oLength[i];
            if (i == oLength.length - 1) {
                source[item] = v;

                // console.log('true -- setData条件: ', n, s);
            } else {
                source = source[item];

                // console.log('false -- setData条件: ', n, s);
            };
        };
    }
}
const proName = process.env.npm_config_config || 'initialization';
// console.log('prodConfig', path.join(__dirname, "..", `channels/${proName}/src/assets/img`));
new UploadAssets({
    "assetsPath" : prodConfig.assetsPath,
    "prodname"   : prodConfig.prodname+prodConfig.ver,
    "folderPath" : path.join(__dirname, "..", `channels/${proName}/src/assets/img`)
});
// new UploadAssets({
//     "assetsPath" : prodConfig.assetsPath,
//     "prodname"   : prodConfig.prodname+prodConfig.ver,
//     "folderPath" : path.join(__dirname, "..", "/logs"),
//     "isInquirer" : false,
//     "logSta"     : false
// });
module.exports = UploadAssets;




// oUploadMethod.init({
//     // 请求的域名
//     'servUrl':'http://efs.corp.xiake.com',
//     // 默认的参数请求
//     'params': {
//         'domainId':'xiake'
//     },
//     // 'xiake/static/webapp/mobileFlightWebsite/'
//     'assetsPath': prodConf.assetsPath + prodConf.prodname+'/',
//     'prodname' : prodConf.prodname,
//     // zip文件的资源路径
//     'zipAssetsPath': 'dist/'+prodConf.prodname+'.zip',
//     'policyVersion': prodConf.ver
// });