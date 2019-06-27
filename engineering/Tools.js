
const path = require('path');
const fs   = require( 'fs' );
// 异步接口代理
const needle = require( "needle" );
// 对象转key=val格式之类    cnpm i querystring -D
const queryString = require('queryString');

module.exports = {
    // 封装起来的基于needle服务接口请求方法
    Service(obj){      //Method,URL,Params,needleData,needleMultipart,callback
        // nde => needle
        var opts = {
            compile : true, //是否编码参数
            method : 'POST',
            url : '',
            params : {},
            ndeData : {},
            ndeOptions : {json:true, open_timeout:5000},
            callback : function(){}
        };
        for(var x in obj) opts[x] = obj[x];

        // 参数编译成 &key=value模式并且给符号编码
        opts.params = queryString.stringify(opts.params);

        needle.request(
            opts.method, 
            opts.url+opts.params, 
            opts.ndeData, 
            opts.ndeOptions,
            function(err,resp){
                opts.callback(err,resp);

            }
        );
    },
    // 查找指定后缀的所有文件
    SearchFile: function(fileurl, RegE) {
        var getPath = fileurl || 'assets/',
            RegE = RegE || /\.(css|js|jpe?g|png|gif|svg|mp4|mp3)/gi,
            urljson = [],
            filename = [],
            explorerFile = function(path) {
                // console.log( 'path:',path );
                //读取目录的内容
                var readFile = fs.readdirSync(path);
                // console.log( 'readFile',readFile );
                //遍历文件列表
                readFile.forEach(function(item) {
                    var itemPath = path + "/" + item,
                        // console.log( '.DS_Store',itemPath );
                        //读取目录和文件信息
                        _statSync = fs.statSync(itemPath + ''); //同步模式获取文件信息
                    //如果是文件目录 -- 递归调用
                    if (_statSync.isDirectory()) {
                        explorerFile(itemPath);
                    } else {
                        var isMatch = item.match(RegE);
                        // console.log( 'isMatch:',isMatch );
                        if (!!isMatch) {
                            var pathNatchFile = itemPath;
                            urljson.push(pathNatchFile);
                            filename.push( item );
                        };
                    };
                });
            };
        explorerFile(getPath);
        
        // 过滤网
        var filterTactics = function(obj,value) {
            return obj.filter(function(value) {
                if( value.indexOf('.DS_Store') == -1 ){
                    return value;
                };
            });
        },
        callbackData = filterTactics(urljson),
        callbackFilename = filterTactics(filename);
        // console.log( 'callbackData:',callbackData );

        return {
            Data : callbackData,
            Filename : callbackFilename
        };
    },
    // 检查路径是否存在
    CheckPath(){
        
    },
    // 删除文件夹
    rmdir(url){
        // console.log( url );
        var files = [];
        if( fs.existsSync(url) ) {  //判断给定的路径是否存在
            files = fs.readdirSync(url);   //返回文件和子目录的数组
            files.forEach(function(file,index){
                var curPath = path.join(url,file);
                if(fs.statSync(curPath).isDirectory()) { //同步读取文件夹文件，如果是文件夹，则函数回调
                    rmdir(curPath);
                } else {    
                    fs.unlinkSync(curPath);    //是指定文件，则删除
                }
            });
            fs.rmdirSync(url); //清除文件夹
        }else{
            console.log("给定的路径不存在！");
        };
        // var _readdir = fs.rmdirSync();
        // console.log("_readdir:", _readdir);
    },
    // 写文件 智能创建路径文件夹
    setFileSync(url,val){
        var _potinPath = url.split("/"),
            _newPath   = [];
        // existsFile = path.join(__dirname, url.replace(/(Analysis_)+.+[.a-z]/gi,""));
        
        // 最后一个是文件 所以减去1
        for( let i=0,len=_potinPath.length-1; i<len; i++ ){
            _newPath.push(_potinPath[i]);
            
            let strpath = _newPath.join("/");
            // 预检测的文件路径 or 是否存在
            if( !fs.existsSync( strpath ) && !!strpath ){
                fs.mkdirSync( strpath );
            };
        };
        _newPath = `${ _newPath.join("/") }/${_potinPath[_potinPath.length-1]}`;
        // console.log( _newPath );
        // 检测文件是否存在
        fs.writeFileSync( _newPath, val, { // existsSync
            encoding: "utf8",
            flags: "a",
            mode: 438
        });
    }
};