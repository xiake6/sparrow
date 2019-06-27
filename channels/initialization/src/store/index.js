import Vue from 'vue';
import Vuex from 'vuex';
import * as types from './types';	// * as types ---- types.CALENDAR_TAP

Vue.use(Vuex);

/* 状态 */
var state = {
	// globleVue : new Vue(),	//在简单的场景下，可以使用一个空的 Vue 实例作为中央事件总线
};

/* 派发一些状态 */
var getters = {
	
};

/* 修改数据的唯一方法 */
var mutations = {
	// 修改state中的data
	[types.SETDATA](state,n,v,s=state){
		
	}
};

/* 操作 */
var actions = {
	// 简化 flux 操作方法
	PublicStore_setData(
		{commit,state}, n,v,s
	){
		commit(types.SETDATA, n,v,s);
	}
};



export default new Vuex.Store({
	state,
	getters,
	mutations,
	actions
});