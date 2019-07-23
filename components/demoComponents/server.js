/**
 * @Author: Ryan
 * @Date:   2017-03-01
 * @Last modified by:   Rayn
 * @Last modified time: 2018-06-01
 */
import {unifyAxios} from "@/scripts/http.js";

export default {
    calendarSpecialPrice(params){
        return unifyAxios({
            url: "/xieke/calendarSpecial",
            method: "GET",
            data: params
        })
    },
    calendarOneWaySpecialPrice(params){
        return unifyAxios({
            url: "/xieke/calendarOneWay",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth': 'true'
            },
            data: params,
        })
    },
    calendarRoundWaySpecialPrice(params){
        return unifyAxios({
            url: "/xieke/calendarRoundWay",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth': 'true'
            },
            data: params,
        })
    }
};
