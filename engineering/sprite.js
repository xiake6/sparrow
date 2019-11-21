const path = require('path');
const fs = require('fs');
const images = require("images");
//系统配置
const systemConfig = require("../config/systemConfig");
//项目配置
const {projectConfig} = require('../config');
// 对应项目
const projectName = systemConfig.projectName;

const channelConfig = require(`../channels/${projectName}/config/webpack-config.js`);
const isUpload = channelConfig && channelConfig.spritesIsLocal ? '' : ''

var dealwithPage = 0;

function resolveJoin(dir) {
    return path.join(__dirname, '..', dir)
};

function spriteMethod(obj){
    var opts = {
        icons : "icons",              //文件夹名称
        sprite : "icon_sprite.png",   //打包后的图片名称
        file : "sprite_icon.less",    //打包后的less文件名称
        // bgurl: '../assets/img/',
        // bgurl : `https://${projectConfig.assetsPath}${projectConfig.prodname}${projectConfig.ver}/`,
        bgurl: channelConfig && channelConfig.spritesIsLocal ? '../assets/img/' : `https://${projectConfig.assetsPath}${projectConfig.prodname}${projectConfig.ver}/`,
        ratio: 1,    //比例关系 生成css时做出发运算
        length : 1,
        addSize : 10,    // 给宽度高度增加尺寸 主要是因为rem适配会计算不准
        margin : 20     // 边距距离
    };

    for(let x in obj) opts[x] = obj[x];

    // 间距的处理

    //路径处理
    var icons = resolveJoin(`channels/${projectName}/src/assets/${opts.icons}/`),
        file   = resolveJoin(`channels/${projectName}/src/less/${opts.file}`),
        sprite = resolveJoin(`channels/${projectName}/src/assets/img/${opts.sprite}`);

    // 计数变量
    var countVariable = 0;

    // 一些 sprite框行、列的属性
    var oValue = {
        // 最高高度（px值）
        maxHeight : 0,
        // 最大宽度（px值）
        maxWidth : 0
    };
    // 一些数据
    var DataImage = [],         // 所有图片的数据
        DataImageMaxSize = [],  // 最宽的5张图片的数据
        DataImageSurplus = [],  // 去除5张最宽的图片之后剩余的图片数据
        DataSprite = [];        // 雪碧图数据

    //指定查找图片
    var searchReaddir = fs.readdirSync(icons);
    var regSuffix = /\.(png|jpe?g|gif|svg)(\?.*)?$/;    //匹配图片的正则
    // 创建图片的相关数据到 DataImage 变量中
    searchReaddir.forEach(function(elem,index){
        if( regSuffix.test(elem) ){
            var obj = {
                url : icons+elem,
                name : elem.replace(regSuffix,""),
                w : images(icons+elem).width(),
                h : images(icons+elem).height()
            }
            DataImage.push(obj);
        };
    });

    deepCopy(DataImage,DataImageSurplus);

    // 将最宽的 5(fileLength) 张图片提出去 保留到 DataImageMaxSize 数组中
    // 剩下的数据保存在 DataImageSurplus 数组中
    // var fileLength = files.length>5?5:files.length;
    // console.log( opts.length );
    manageMaxValue( DataImageSurplus, DataImageMaxSize, opts.length );
    // console.log( DataImageSurplus, DataImageMaxSize );
    // console.log('DataImageMaxSize', DataImageMaxSize);
    groupSpriteObject();
    var resultArray = DataImageMaxSize.concat(DataSprite);

    createImage( resultArray );
    createCSSFile( resultArray );
    // console.log( searchReaddir )
    // fs.readdir(icons, function(err, files) {
    //     if (err) {  //出错的时候停止执行并且提示
    //         console.log(err);
    //         return;
    //     };

    // });

    // 组合 sprite 数据 对象
    function groupSpriteObject(fn){
        // 5张的图片的总宽度
        var fiveCountWidth = [];
        // 前5张的图片的高度
        var fiveHeight = [];
        // 剩余数据变化存放数组
        var _getSize = getSize;
        // 前5张图片数据设置坐标位置
        [].forEach.call(DataImageMaxSize,function(ele,i){

            // 设置X坐标值
            if( i === 0 ){
                ele.x = 0;
            }else{

                ele.x = DataImageMaxSize[i-1].x + DataImageMaxSize[i-1].w + opts.margin;
            };
            // 设置Y坐标值
            ele.y = 0;  //ele.h + opts.margin

            fiveHeight.push( ele.h + opts.margin );
            oValue.maxWidth += ( ele.w + opts.margin );
        });

        // oValue.maxWidth = _getSize(fiveCountWidth,'max').val;
        // console.log( DataImageMaxSize );

        // 后面的图开始瀑布流式添加
        function saultFlow(){
            var countNo = 0,    //总数（算图片加起的宽度）
                tempArr = [],
                tempSurplusArray = [];

            if( !DataImageSurplus.length ){
                // fn&&fn();
                return false;
            };

            for( var x in DataImageSurplus ){
                var item = DataImageSurplus[x],
                    i = x-0;
                //最小高度的那个对象
                var objTop = DataImageMaxSize[_getSize(fiveHeight).idx];

                // 计数
                countNo += (item.w + opts.margin);
                // 当前元素总和小于当前最小高度层级的宽度 则设置相应属性
                if( countNo <= objTop.w + opts.margin ){
                    item.x = objTop.x + (countNo - item.w - opts.margin);
                    item.y = fiveHeight[_getSize(fiveHeight).idx];
                    // // 要删除的数组元素下标 赋值给 tempSurplusArray
                    // tempSurplusArray.push(i);
                    // 记录符合条件的循环元素的高度属性
                    tempArr.push( item.h + opts.margin );
                    // 把数据添加到 DataSprite 数组中
                    DataSprite.push(item);
                    DataImageSurplus.splice(i,1,null);
                }else{
                    countNo = countNo - (item.w + opts.margin);
                    // continue;
                };
            };

            // 过滤null数据 -- 剩余数据
            DataImageSurplus = DataImageSurplus.filter(function(val){
                return !!val;
            });

            //填充高度数据
            fiveHeight[_getSize(fiveHeight).idx] += _getSize(tempArr,'max').val;
            //最大高度数据
            oValue.maxHeight = _getSize(fiveHeight,'max').val;

            // console.log("-------  图片生成中  -------",_getSize(fiveHeight,'max') );
            // 递归调用
            // var timer = null;
            // if(timer) clearTimeout(timer);
            // setTimeout(saultFlow,2000);
            saultFlow();
        };
        saultFlow();
    };

    // 剔除图片中的高度最大的值 并保存到
    function manageMaxValue(obj,maxVal,count){
        countVariable ++;
        // 递归调用结束
        if( countVariable > count ){
            countVariable = 0;

        }else{
            //最高的图片的对应下标
            var _maxWidth = 0,
                _Index = 0;
            obj.forEach((e,i)=>{
                if( e.w > _maxWidth ){
                    _maxWidth = e.w;
                    _Index = i;
                };
            });

            maxVal.push( obj[_Index] );

            obj.splice( _Index,1 );

            manageMaxValue(obj,maxVal,count);
        };

    };

    // 创建图片方法
    function createImage(obj){
        //创建 sprite图片舞台
        var createSpriteImageStage = images(oValue.maxWidth,oValue.maxHeight);   //创建雪碧图片场景

        obj.forEach(function(elem,index){
            createSpriteImageStage.draw(
                images(elem.url),
                elem.x,
                elem.y
            );
        });
        //spript图片存放路径

        createSpriteImageStage.save(sprite,{quality : 100});
    };

    //创建css文件和sprite属性
    function createCSSFile( resultArray ){
        var createCSS = function(){
            var cssResult = [],
                incBacksize = [];

            resultArray.forEach(function(elem,index){
                var _w = (elem.w+opts.addSize)/opts.ratio,
                    _h = (elem.h+opts.addSize)/opts.ratio,
                    // _x = elem.x==0?0:(-elem.x+opts.addSize/2/opts.ratio),
                    // _y = elem.y==0?0:(-elem.y+opts.addSize/2/opts.ratio);
                    _x = elem.x==0?opts.addSize/2/opts.ratio:(-elem.x+opts.addSize/2/opts.ratio),
                    _y = elem.y==0?opts.addSize/2/opts.ratio:(-elem.y+opts.addSize/2/opts.ratio);


                incBacksize.push(`.${elem.name}`);
                cssResult.push(
                    `.${elem.name}{width:${_w}px;height:${_h}px; background-position: ${_x}px ${_y}px;}`
                );
            });
            //../src/assets/img/icon_sprite.png //$backSpriteUrl
            var _bgSizeW = oValue.maxWidth/opts.ratio;
            incBacksize += `{background:url(${opts.bgurl}${opts.sprite}) no-repeat; background-size:${_bgSizeW}px auto; display:inline-block;}`;
            return incBacksize + cssResult.join("");
        };

        //scss文件存放路径
        fs.writeFileSync(file, createCSS(), { //appendFile
            encoding: "utf8",
            flags: "a",
            mode: 438
        });

        console.log( '---------- 创建 '+opts.sprite+' 完成 ----------' );
    };

    //封装获取当前最小层和对应坐标
    function getSize(obj,type){
        var maxNo = Math.max.apply(Math,obj),
            minNo = Math.min.apply(Math,obj);

        var result = {};
        if( type === 'max' ){
            [].forEach.call(obj,function(ele,i){
                if( ele == maxNo ){
                    result.idx = i;
                };
            });
            result.val = maxNo;
        }else{
            [].forEach.call(obj,function(ele,i){
                if( ele == minNo ){
                    result.idx = i;
                };
            });
            result.val = minNo;
        };

        return result;
    };

    // 复制对象属性
    function deepCopy(p,c){
        var c = c || {};
        for( let i in p ){
            if( typeof p[i] === 'object' ){
                c[i] = (p[i].constructor == Array)?[]:{};
                deepCopy(p[i],c[i]);
            }else{
                c[i] = p[i];
            };
        };
        return c;
    };

    // log
    // LogSystem.setSpriteLog(`sprite工具被执行,文件路径是:${opts.sprite}||${opts.file}`);
};


function eachSprites(options){
    options.forEach( (e,i)=> {
        spriteMethod(e);
    });
};

console.log('channelConfig', channelConfig.eachSprites);
eachSprites(channelConfig.eachSprites)

// eachSprites(
//     [{
//         icons: 'icons',
//         sprite: 'icon_sprite.png',
//         file: 'sprite_icon.less',
//         length : 1
//         // ratio : 1
//     },
//     // {
//     //     icons: 'books',
//     //     sprite: 'books_sprite.png',
//     //     file: 'sprite_books.less',
//     //     length : 5
//     // },{
//     //     icons: 'bigImgs',
//     //     sprite: 'bigImgs_sprite.png',
//     //     file: 'sprite_bigImgs.less',
//     //     length : 2
//     // },{
//     //     icons: 'details',
//     //     sprite: 'details_sprite.png',
//     //     file: 'sprite_details.less',
//     //     length : 1
//     // }
// ]
// );
