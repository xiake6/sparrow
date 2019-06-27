//引入封装的axios方法
import {unifyAxios} from "@/scripts/http.js";

export default {
    searchCity(params){
        return unifyAxios({
            url: "/xieke/json/city",
            method: 'GET',
            data: params
        })

    },
};