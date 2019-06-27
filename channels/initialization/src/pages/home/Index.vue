<template lang="html">
    <section class="f32 inc_wrap home_wrap">
        hello world
        <div class="rank_logo1"></div>
        <calendar></calendar>
    </section>
</template>

<script type="text/javascript">
import {verifyType,iDate} from "@/utilsEntry.js";
import calendar from "@components/demoComponents/index.vue";

export default {
    name: "Home",
    data(){
        return{ }
    },
    methods: {
        searchCityLetter(){
            let params = {
                category: 0,
                putIn: 'B',
                _t: 1556099434707
            }
            this.$server.searchCity(params).then( res=>{
                console.log('searchCity:',res);
            }).catch(err =>{
                console.log('searchCity接口失败:',err);
            })
        },
    },
    created() {
        this.searchCityLetter();
    },

    mounted() {
        // var _iDate = iDate();
        var text = verifyType("测试");
        console.log( "home:", text );
    },
    components: {
        calendar
    }
}
</script>

<style lang="less">
.home_wrap{
}
</style>