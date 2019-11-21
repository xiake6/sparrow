/** 
 * 自动雪碧图工具
 * 优势：
 *  1. 解决传统雪碧图不好管理的问题
 *  2. 减少http请求，优化性能
 *  3. 解决雪碧图因为适配造成的图片被截断问题
 *  4. 结合webpack插件进行开发，自动化监听目录增、删、改，自动打包图片并创建对应css文件
*/

const path   = require('path');
const fs     = require('fs');
const images = require("images");
//rimraf插件是用来执行UNIX命令rm和-rf，用来删除文件和文件夹的，清空旧文件
const rm = require('rimraf');

/**
 * @param config {object} 配置参数：
 * 
 * @param spritepath {string} 样式文件北京图片链接sprite图的路径
 * @param rowcount {number} 第一行最大放几张图 （因为需要利用第一行的总宽度来创建sprite图的场景尺寸）
 * @param listenpath {string} 监听目录
 * @param outfilepath {string} 输出文件到达的目录 （sprite图片和css文件会被输出到这里）
 * @param margin {number} 外边界距离平分到四边 每边=10/2
 * @param quality {number} 图片压缩值 值越小图片质量越小
 * @param suffixname {string} 样式文件扩展名 支持：less sass css等
 * @param name {string} 可以任意添加生成文件的后缀名
 * 
**/

class AutoSprite{
    constructor(opts){
        this.configs = {
            margin: 10,
            rowcount: 5,
            quality: 90,
            name: "",
            suffixname: "less",
            spritepath: "./",
            listenpath: "./common/assets",
            outfilepath: "./common/less/sprites"
        };
        for(let x in opts) this.configs[x] = opts[x];
        // this.addToStage();
    }
    apply(compiler){
        // webpack在入口准备读取entry时触发
        compiler.plugin("entry-option", (compilation)=>{
            this.addToStage();
        });
        // 每次都会执行它 手动加入监听依赖
        compiler.plugin("after-compile", (compilation,callback)=>{
            if(!compilation.contextDependencies) compilation.contextDependencies = [];

            let len = compilation.contextDependencies.filter(item=>item==this.configs.listenpath).length;
            if( !len ){
                // 合并要监听的目录
                compilation.contextDependencies = compilation.contextDependencies.concat(this.aDirectory);
                compilation.contextDependencies.push(this.configs.listenpath);
            };
            // console.log( "compilation.contextDependencies:", compilation.contextDependencies );
            
            callback();
        });

        compiler.plugin("watch-run", (watching, callback)=>{
            this.addToStage();
            callback();
        });
    }

    addToStage(){
        this.rmdir(this.configs.outfilepath);

        this.init();

        const oImageSourceStore = this.setImageInfomation( 
            this.extractImageAbsolutePath(this.configs.listenpath)
        );
        const arrayImageInfo = this.markSeated( 
            this.extractClassification(oImageSourceStore)["handlerArrayGroup"]
        );
        this.createStageSpace({
            "main": arrayImageInfo,
            "other": this.extractClassification(oImageSourceStore)["otherArray"]
        });
        // console.log( "this.aDirectory:", this.aDirectory );
    }
    // 创建舞台 和 css img 等
    createStageSpace(obj){
        var main = this.setStageSpaceSize(obj.main),
            other = this.setStageSpaceSize(obj.other),
            concatArray = [ ...main, ...other ];
            // filenamePrefix = Object.keys(this.oImageSourceStore);
        // console.log(this.oImageSourceStore.sort((a,b)=>b.data.length-a.data.length))
        
        concatArray.map((item,i)=>{
            // 创建空间
            let spriteStageSpaceSize = images(item.maxWidth, item.maxHeight),
                childlistConcat = [...item.main, ...item.secondary ],
                styleFile = {
                    "styles": [],
                    "commonstyles": "",
                    "data": ""
                };
                // _name = this.configs.name;
            
            childlistConcat.map(v=>{
                // console.log((v.path))
                spriteStageSpaceSize.draw(
                    images(v.path),
                    v.x,
                    v.y
                );
                
                let x = v.x?`-${v.x}px`:0,
                    y = v.y?`-${v.y}px`:0;

                // styleFile["names"].push(`.${v.name}`);
                styleFile["styles"].push(
                    `.${v.name}{width:${v.swidth}px;height:${v.sheight}px;background-position:${x} ${y}}`
                );
            });

            styleFile["commonstyles"] = childlistConcat.map(v=>`.${v.name}`)+`{background:url(${this.configs.spritepath}sprite_${item.name}.png) no-repeat; background-size:${item.maxWidth}px auto; display:inline-block;}`;
            styleFile["data"] = styleFile["commonstyles"]+styleFile["styles"].join("")

            // 自定义添加文件名
            // _name = _name?`sprite_${item.name}_${_name}`:`sprite_${item.name}`;

            // create file
            this.setFileSync(
                `${this.configs.outfilepath}/sprite_${item.name}.${this.configs.suffixname}`,
                styleFile["data"]
            );
            // create imgage type png
            spriteStageSpaceSize.save(`${this.configs.outfilepath}/sprite_${item.name}.png`,{quality : this.configs.quality});
        });

        console.log( `---------- Sprite图 创建完成 ----------` );
    }
    // 设置尺寸
    setStageSpaceSize(arr=[]){
        arr.map(item=>{

            // 开始写这里
            let maxX = this.getMaxMin( item.main.map(v=>v.x), "max" ),
                maxW = item.main.find( v=> v.x===maxX ),
                maxH = this.getMaxMin( item.main.map(v=>v.columnHeight), "max" );

            item["maxWidth"] = maxW.x+maxW.swidth;
            item["maxHeight"] = maxH;
        });

        return arr;
    }
    // 对号入座
    markSeated(response){
        var page = 0, 
            deeploop = (res)=>{
                var itemObject = res[page],
                    secondaryIndex = [];
                
                var minHeight = this.getMaxMin(itemObject.main.map(v=>v.columnHeight),"min"),   // 队列的符合最小高度
                    // 匹配到符合最小高度的对象
                    minHeightObject = itemObject.main.find(item=>item.columnHeight==minHeight), // filter[0]
                    minIndex = minHeightObject.index,           // 最小高度对象的下标
                    minHeightWidth = minHeightObject.swidth;    // 最小高度对象的宽度
                    // 原始主对象数据
                    // mainSourceIndex = itemObject.main[minIndex];

                // 借助长度做下标值 便于创建对应数据
                var childLen = itemObject.childlist[minIndex].length;
                if(!itemObject.childlist[minIndex][childLen]) itemObject.childlist[minIndex][childLen] = [];

                for( let i=0,len=itemObject.secondary.length; i<len; i++ ){
                    var v = itemObject.secondary[i],
                        // 获得子列里的尺寸
                        childlistWidth = itemObject.childlist[minIndex][childLen].map(item=>item.swidth),
                        // 计算·宽度的和值
                        computedSumValue = this.reduce(childlistWidth);

                    // console.log( i, computedSumValue, v.x, v.swidth, minHeightWidth );
                    // 尺寸和值 = 可容纳空间的时候 进行操作
                    if( (computedSumValue+v.swidth) <= minHeightWidth ){
                        v.x = computedSumValue + minHeightObject.x;
                        v.y = minHeight;

                        itemObject.childlist[minIndex][childLen].push(v);
                        secondaryIndex.push(i);
                        // itemObject.secondary.splice(i,1);
                    }else{
                        break;
                    };

                    // if( i==len-1 && tempnum <= 3 ){
                    //     console.log("循环第n次的时候：", tempnum, v.name, v);
                    // };
                    // 到最后一帧时 
                    // if( i==len-1 ){ };
                };

                
                let dimension = this.flatInfinity(itemObject.childlist[minIndex]),
                    // 拿到子列里的Y值最大的
                    childlistMaxY = this.getMaxMin( dimension.map(v=>v.y), "max" ),
                    // 拿到子列里的高度最大的
                    childlistMaxH = this.getMaxMin( dimension.filter(item=>item.y==childlistMaxY).map(v=>v.sheight), "max"),
                    childlistMaxObject = dimension.find(item=>item.sheight==childlistMaxH);

                // 追加每列的高度
                itemObject.main[minIndex].columnHeight = (childlistMaxObject.y+childlistMaxObject.sheight);

                // 删除使用过的子项
                secondaryIndex.map(i=>{
                    itemObject.secondary.splice(i,1,{});
                });
                itemObject.secondary = itemObject.secondary.filter(item=>!!item.name);
                
                if( !itemObject.secondary.length ){
                    page++;
                    // console.log("end: ", page);
                    if( page >= response.length ){
                        response = this.recoveryDimension(response);
                        // console.log("Mark Seated true end: ", response );
                        // console.log("true end" );
                        
                    }else{
                        // 这里可以设置当前这个数据组的尺寸 从而优化
                        // some code ...

                        // 递归调用
                        deeploop(res);
                    };
                }else{
                    deeploop(res);
                };

            };
        
        deeploop(response);


        return response;
    }
    // 恢复维度
    recoveryDimension(arrays=[]){
        arrays.map(item=>{
            item.secondary = this.flatInfinity(item.childlist);
            item.childlist = [];
        });

        return arrays;
    }
    // 设置主坐标之后分类提取
    extractClassification(resp){
        var handlerArrayGroup = [],
            otherArray = [];
        for( let x in resp ){
            let keys = resp[x],
                itemkeyname = keys.keyname,
                itemdata = keys.data;
            
            // 设置主数据坐标
            for( let i=0,len=this.configs.rowcount; i<len; i++ ){
                if( i < len && i < itemdata.length ){
                    let item = itemdata[i],
                        prev = itemdata[i-1];

                    item.index = i;
                    if( i<this.configs.rowcount ){
                        // item.check = true;
                        item.columnHeight = item.sheight;
                    };

                    if( i==0 ){
                        continue;
                    };
                    item.x = prev.x+prev.swidth;
                };
            };

            // 比rowcount值小的不进行push
            if( itemdata.length > this.configs.rowcount ){
                let data = this.easyCopy(itemdata),
                    head = data.splice(0,this.configs.rowcount),
                    foot = data.sort((a,b)=>a.swidth-b.swidth),
                    opts = {
                        "name": itemkeyname,
                        "main": head,
                        "secondary": foot,
                        "childlist": []
                    };

                head.map(v=>{
                    opts["childlist"].push([]);
                });

                handlerArrayGroup.push(opts);
            }else{
                otherArray.push({
                    "name": itemkeyname,
                    "main": itemdata,
                    "secondary": []
                });
            };
        };


        return {
            handlerArrayGroup,
            otherArray
        };
        // handlerArrayGroup.map(v=>console.log(v));
    }
    // 设置图片的属性和信息 并返回
    setImageInfomation(resp){
        for(let x in resp){
            let item = resp[x];
            
            item["data"].map(val=>{
                // setting attribute value
                val.x      = 0;
                val.y      = 0;
                val.width  = images(val.path).width();
                val.height = images(val.path).height();
                val.name   = path.basename(val.path).replace(/(\.)+.*/gi,"");
                val.swidth = val.width + this.configs.margin;
                val.sheight = val.height + this.configs.margin;
            });
            item["data"] = item["data"].sort((a,b)=>b.swidth-a.swidth);
        };

        return resp;
    }
    // 提取 从第一级目录开始 目录作键名 保存路径和对应图片的绝对路径
    extractImageAbsolutePath(configpath=this.configs.listenpath){
        var readdir = fs.readdirSync( configpath ),
            oDirectory = {};
        readdir.map(item=>{
            let _path = path.join( configpath, item );
            
            if( fs.statSync(_path).isDirectory() ){
                let _keyname = path.basename(_path);
                // if( !oDirectory[_keyname] ) oDirectory[_keyname] = new Array();
                oDirectory[_keyname] = {
                    "keyname": _keyname,
                    "data": this.extractFiles(_path),
                    "$path": _path
                };
                // 收集目录
                this.aDirectory.push(_path);
            };
        });

        return oDirectory;
    }
    // 提取文件（图片）
    extractFiles(configpath){
        var aImgStroe = [],
            deepLoopSearch = (configpath)=>{
                var readdir = fs.readdirSync( configpath ),
                    files = readdir.filter(item=> /\.(png|jpe?g|gif|svg)(\?.*)?$/gi.test(item) );

                files.map(item=>{
                    aImgStroe.push({
                        "path":  path.join(configpath, item) 
                    });
                });

                // 遍历路径 查看条件
                readdir.map(item=>{
                    let _path = path.join( configpath, item );
                    // 如果是目录就继续递归查找 
                    if( fs.statSync(_path).isDirectory() ){
                        deepLoopSearch( _path );
                    };
                });
            };

        deepLoopSearch(configpath);

        return aImgStroe;
    }

    init(){
        // 舞台场景的空间
        // this.stageSpace = [];

        // 收集目录数据
        this.aDirectory = [];

        // 保存分组好的图片组
        // this.arrayImageInfo = [];
        
        // 保存图片数据的仓库 - 处理后做原始数据
        // this.oImageSourceStore = {};

        // 保存当前组最宽的前几张图
        // this.maxStoreSize = [];
    }

    // 获取最大值or最小值
    getMaxMin(arr,param="max"){
        try {
            if( !arr.length ) return 0;
            if (param == 'max') {
                if(typeof Math.max.apply(null, arr) == "number"){
                    return Math.max.apply(null, arr);
                }else{
                    return "Error:element in arr is not a number!";
                };
            }else if (param == 'min') {
                if(typeof Math.min.apply(null, arr) == 'number'){
                    return Math.min.apply(null, arr);
                }else{
                    return "Error:element in arr is not a number!";
                };
            };
            // return "Error:param is unsupported!";
        } catch (e) {
            return "Error:"+e;
        };
    }
    // 简易copy
    easyCopy(obj){
        // 对于普通数据对象 没有互相引用的是完全ok的
        return JSON.parse( JSON.stringify(obj) );
    }
    // 计算
    reduce(obj){
        var value = 0;
        obj.map(item=>{
            value += item;
        });

        return value;
    }
    // 碰撞检测（Collision Detection）
    hitBox(source, target){
        // false = 没有碰撞 （都在范围之外） 
        // true = 碰撞
        return !(
            (source.x+source.swidth)<(target.x)  || 
            (source.x)>(target.x+target.swidth)  ||
            (source.y+source.sheight)<(target.y) ||
            (source.y)>(target.y+target.sheight)
        );
    }
    // flat array
    flatInfinity(arr=[]) {
        return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flatInfinity(val)) : acc.concat(val), []);
    }
    // dev tool
    setFileSync(url,val){
        var _potinPath = url.split("/"),
            _newPath   = [];
        
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
    // custom method rm
    deleteall(path) {
        var files = [];
        if(fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function(file, index) {
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    deleteall(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        };
    }
    // rm dir
    rmdir(pathurl){
        if( !fs.existsSync(pathurl) ){
            return false;
        };
        rm( pathurl, err=>{
            if (err) throw err
            // console.log("err remove:",err);
        });
    }
}

exports.default = AutoSprite;
module.exports  = AutoSprite;