/** 
 * 模块用于使用一些轻量型 业务组件
 * 只能加入一些公共的轻量级组件
*/

import 'mint-ui/lib/style.css';
// 按需引入部分组件
import { Button, Indicator, Toast} from 'mint-ui';


export default {
    install(Vue) {

        // 按钮，提供几种基础样式和尺寸，可自定义图标
        Vue.component('mtButton', Button);

        // 吐丝组件
        Vue.prototype.$toast = Toast;

        //loading组件
        Vue.prototype.$indicator = Indicator;
    }
};