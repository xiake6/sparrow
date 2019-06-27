<template lang="html">
    <!-- keep-alive ：主要是为了保留组件的状态或避免重新渲染 -->
    <router-view></router-view>
</template>

<script type="text/javascript">


import Vue from "vue";
// 全局业务通用脚本 -- 适配算法
// import {oAdapt, query} from "@/scripts/tool.js";
import {iDate} from "@/utilsEntry.js";
import {oAdapt, query} from "@/scripts/assist.js";
import {unifyAxios,unifyFetch} from "@/scripts/http.js";



export default {
    name: "App",
    data(){
        return{ }
    },
    methods: {
        
    },
    beforeCreate() {
        oAdapt({
            "px": 20,
            fn(apx){
                query("html").style.fontSize = `${apx}px`;
            }
        });
        // console.log('组件实例刚刚被创建');
    },
    created() {
        var _iDate = iDate();
        var text = query("title").innerText="app1测试";
        console.log( "app:", _iDate.y, query );

        // console.log('实例已经创建完成');
    },
    beforeMount() {
        // console.log('模板编译之前');
    },
    mounted() {
        // console.log('模板编译完成');
    },
    activated(){
        // console.log('组件激活时触发');
    },
    beforeUpdate() {
        // console.log('组件更新之前');
    },
    updated() {
        // console.log('组件更新完毕');
    },
    beforeDestroy() {
        // console.log('组件销毁之前');
    },
    destroyed() {
        // console.log('组件销毁之后');
    }
}

</script>

<style lang="less">
@import "less/sprite_icon.less";

</style>
