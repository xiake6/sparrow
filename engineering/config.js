const path = require("path");
// 工程脚本通用
const engUtils = require('./utils.js');
// 对应项目
const projectName = engUtils.channels;

// 工程启动项配置
const ProjectConfig = {
	"initialization": {
		// 端口
		// port : engUtils.PORT,
		// 版本号：201801v1代表2018文件夹里的01文件夹下的v1版本
		ver  : '/201901v1',
		// 资源链接路径
		assetsPath : `xiake/static/webapp/sparrow_${projectName}/`,
		// 项目名称配置
		prodname: `touch_website_${projectName}`
	}
};
































// 容错提示
try{
	
	if( !ProjectConfig[projectName] ) {
		console.warn(`${projectName}项目不存在，请在${path.join(__filename)}中进行配置！`);
		process.abort();
	};
	// 配置项目信息
	module.exports = ProjectConfig[projectName];
}catch(e){
	console.log(e);
};