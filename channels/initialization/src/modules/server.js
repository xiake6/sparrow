/** 
 * @autor liufan 
 * @desc 定义接口配置文件
 * @return {function} this.$server.方法名()
 * 
**/

//引入接口方法文件名
import commonServer from './common-server';
import homeServer from './home-server';

//注入接口方法 以解构赋值的方式
const Server = {
    ...commonServer,
    ...homeServer,

}

export default {
	install(Vue){
		//直接在Vue对象上定义新的属性或修改现有属性 并返回该对象
	    Object.defineProperties(Vue.prototype,{
	        $server : {
	            value : Server,
	            writable : false
	        }
	    });
	}
};
