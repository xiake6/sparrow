var fs = require('fs');
const uniCopyConfig = require('./copyConfig.js');
let filrFloaderList = [
    {
        name: "static",             //目录名
        isReplace: true,           //目录中存在相同文件，是否覆盖，true是，false否
    }];

let filrFileList = ['index.html'];

// 粘贴的目标文件路径
let pastePath = '';
let projectName = 'env';    //命令行输入要拷贝的项目名（mp-baidu，mp-toutiao），默认mp-baidu

var configParam = process.argv;
//命令行传入的参数env
if (configParam && configParam.length >= 2) {
    let configParamName = configParam.slice(2)[0];
    if(configParamName && configParamName == 'env'){
        projectName = configParamName;
    }
}

// 匹配路径
function matchUrl () {
    // 被复制路径，即uniapp文件的路径
    var copyPath = `${uniCopyConfig.targetOperator.orignPath}`

    copyPath = copyPath + `${projectName}/`;

    // console.log('被复制路径 copyPath',copyPath);
    // 粘贴路径
    filrFloaderList = uniCopyConfig.envOperator.copyDirectory;
    pastePath = uniCopyConfig.targetOperator.targetPath;


    console.log('复制路径', copyPath);
    filrFloaderList.forEach((itemFloder)=> {
        console.log("itemFloder:",itemFloder,pastePath);
        loopFloader(copyPath, itemFloder, pastePath);
    })

    filrFileList = uniCopyConfig.envOperator.copyFile;
    // toutiaoMoveFile ();
    filrFileList.forEach((itemFile)=> {
        console.log("itemFile:",copyPath, pastePath+itemFile, pastePath);
        copyFile(copyPath, pastePath,itemFile, null);
    })
}

// 遍历文件夹
/**
 *
 * @param {*} copyPath  复制路径
 * @param {*} itemFloder
 * @param {*} pastePath
 */
function loopFloader (copyPath, itemFloder, pastePath) {
    // 文件夹名称
    let folderName = itemFloder.name;
    // 最终复制文件的绝对路径：复制路径 + 文件夹名称
    let dir = copyPath + folderName;
    // folderName = specialHandel(itemFloder.name);
    folderName = itemFloder.name;
    // 最终粘贴文件的绝对路径
    let finalPastPath = pastePath+folderName;
    console.log("迁移文件：",dir, finalPastPath, folderName, itemFloder);
    copyFile(dir, finalPastPath, folderName, itemFloder);

}
/**
 *
 * @param {*} dir 被复制的路径，及nuiapp-miniprogram路径
 * @param {*} finalPastPath 最终粘贴的路径
 * @param {*} folderName 文件夹的名称，例common/
 * @param {*} itemFloder
 */
async function copyFile(dir, finalPastPath, folderName, itemFloder){
    // console.log("copyFile:",dir,finalPastPath);
    let realFinalPastPath = finalPastPath.substring(0,finalPastPath.lastIndexOf("/"));
    let result = await exits(realFinalPastPath);
    // console.log("copyFile:",dir,finalPastPath);
    fs.readdir(dir, function (err, paths) {
        if (err) {
            console.log(err);

            return;
        }
        // console.log("文件夹:",paths);
        // paths 是文件或者文件夹名称
        paths.forEach((path)=> {
            fs.stat(dir + path, (err, stats) => {
                if (err) {
                    console.log(err);
                    return;
                }
                // console.log("文件:", path);
                // console.log("是否是文件:", stats.isFile());
                let originPath = dir + path;
                // 粘贴的文件具体路径
                let targetPath = finalPastPath + path;
                // 如果是文件
                if (stats.isFile()) {
                    // 不能覆盖的文件列表
                    if(itemFloder){
                        var list = itemFloder.notCoverList || [];
                        // 找出当前的path是否能覆盖

                        if (list && list.length) {
                            var index = list.findIndex((n) => {
                                return n == path;
                            })
                        } else {
                            var index = -1;
                        }

                        // 有同名文件且不能覆盖
                        if (index >= 0 && !itemFloder.isReplace) {
                            // 新名字
                            var newName = itemFloder.renamePrefix + path;
                            // 复制文件，newName为新的文件名称
                            writeFile(dir,finalPastPath ,path, newName);
                        } else {
                            writeFile(dir,finalPastPath ,path);
                        }
                    }else{
                        writeFile(dir,finalPastPath ,path);
                    }
                }

                if (stats.isDirectory()) {
                    // console.log('递归处理文件夹:', originPath, targetPath);
                    if(result){
                        copyFile(originPath + "/", targetPath + "/",path ,itemFloder);
                    }

                }
            })
        })
    })
}
/**
 *
 * @param {*} dir               复制的路径
 * @param {*} finalPastPath     粘贴的路径
 * @param {*} path              文件的名称，一版读取文件的名称和写入的文件名称一致
 * @param {*} newPath           写入文件的名称，在特殊情况下读取的文件名和写入的文件名称不一致
 */
async function writeFile (dir, finalPastPath, path, newPath) {
    if (newPath) {
        var writePath = finalPastPath + newPath;
    } else {
        var writePath = finalPastPath + path
    }
    let readStream = fs.createReadStream(dir + path);
    let writeStream = fs.createWriteStream(writePath);
    readStream.pipe(writeStream);
}

function specialHandel(name){
    let resultName = name;
    console.log("存在subpackages:",name.indexOf("subpackages"));
    if(projectName == 'mp-toutiao' && name.indexOf("subpackages") >= 0){
        resultName = "pages/" + name;
    }
    return resultName;
}

// 复制目录
/**
 *
 * @param {*} pasteUrl   需要粘贴的文件路径，
 * @param {*} url        复制的文件路径
 */
async function exits (pastePath) {
    fs.exists(pastePath, function (exit) {
        // console.log('是否存在', pastePath);
        if (exit) {
            // console.log('存在',pastePath);
            return true;
        } else {
            let lastIndex = pastePath.lastIndexOf("/");
            let realPastePath = pastePath.substring(0,lastIndex);
            // console.log("先判断上级目录：",realPastePath);
            if(exits(realPastePath)){
                fs.mkdir(pastePath,function (err) {
                    if (err) {
                        exits(pastePath);
                    }
                })
                return exits(pastePath);
            }
        }
    })
    return true;
}

matchUrl();
