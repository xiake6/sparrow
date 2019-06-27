import Vue from "vue";
// Vue路由
import VueRouter from "vue-router";
// Vue路由配置项
import router from "@/router";
// 轻量级组件
import widgetUI from '@/scripts/widget-ui';

// 接口注入 便于调用
import server from './modules/server';

// 主路径模板
import App from './App.vue';

// 安装vueRouter插件到vue实例
Vue.use(VueRouter);
Vue.use(widgetUI);

Vue.use(server);

// 设置Vue对象方法
new Vue({
    el: '#app',
    router,
    // store,
    render: h => h(App)
});

