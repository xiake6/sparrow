import routerConfig from 'vue-router';
// 各项目下router配置
import channelsRouter from "@this/router/index.js";

/***
 * 拆包写法 import()webpack自带功能
**/

// 公用路由 - 登录页
// const login = () => import ( /* webpackChunkName: "Common-Login" */ "@components/login/Index.vue");

const allRouters = [
    // 默认进入 home 页
    // {
    //     name: 'index',
    //     path: '/',
    //     redirect: '/xiake/home',
    //     component: Index
    // },

    // ======= 公共路由 start ======= //
    // {
    //     name: "Login",
    //     path: "/xieke/login",
    //     component: login
    // }
    // 路由错误页面
    // {
    //     name: "404",
    //     path: "*",
    //     component: Website404
    // }
    // ======= 公共路由 end ======= //

    // 注入channel下路由配置
    ...channelsRouter
];


export default new routerConfig({
    mode: 'history',
    routes: allRouters
});
