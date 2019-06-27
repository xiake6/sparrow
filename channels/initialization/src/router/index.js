import Index from "@this/App.vue";

const home = () => import ( /* webpackChunkName: "Common-Home" */ "../pages/home/Index.vue");


export default [{
    // 默认进入 home 页
    name: 'index',
    path: '/',
    redirect: '/xiake/home',
    component: Index
},{
    name: "home",
    path: "/xiake/home",
    component: home
}];