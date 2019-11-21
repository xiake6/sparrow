// 文件路径配置
const localPath = require('./localPath');
module.exports = {
    ...localPath,
    envOperator:{
	    //被拷贝目录配置
        copyDirectory: [
            {
                name: "static/",            //目录名
                isReplace: true,            //目录中存在相同文件，是否覆盖，true是，false否
            }
        ],
        //被拷贝文件配置
        copyFile: [
            "index.html"
        ]
    }
}
