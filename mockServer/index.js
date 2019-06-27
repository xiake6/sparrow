/**
 * 业务Mock假数据
*/
var http = require('http');

// 工程脚本通用
const engUtils = require('../engineering/utils');
// 找到对应项目下的mock api
const projectName = engUtils.channels;
const _serverConf = require(`../channels/${projectName}/src/server/mockServer/api`);
var configAPI = _serverConf;

function mockServerAPI(){
	this.createServer();
}
mockServerAPI.prototype.createServer = function createServer(){
	var _server = http.createServer(function(req,res){
		if( req.url != "/favicon.ico" ){
			res.statusCode = 200;
			res.setHeader("Content-Type","text/plain;charset=utf-8");
			res.setHeader("Access-Control-Allow-Origin","*");
			
			// // 详情
			// if( req.url == "/xieke/promotion/ft/info/" ){
			// 	res.write(JSON.stringify(detaileInfo))
			// }
			var url = req.url.split('?')[0];
			// console.log( "req.urlkk:", url );

			// 输出
			res.write(JSON.stringify(configAPI[url]));

		};
		res.end();
	});
	_server.listen(1777,'localhost',function(){
		console.log("开始监听···");
	})
};

new mockServerAPI();

// module.exports = F;