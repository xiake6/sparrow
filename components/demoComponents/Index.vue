<template>
    <section v-if="visible" class="pf pn inc_screen f28 c3 calendarWrap" :class="globalClass">

        <section class="pa df inc_wrap bgf Calendar_box">
            <section class="pr inc_wrap headerBox">
                <!--关闭按钮-->
                <a class="pa pm close_icon closePopup" @click="closeTap" href="javascript:;"></a>
                <!--往返时 tab选择-->
                <ul v-if="params.trip" class="df tac roundTripSwitch">
                    <li v-for="(item,i) in switchTabContent" :key="i">
                        <strong @click="switchTap(item,i)" class="f34 fontblod c3 dbl btns" :class="switchTabIndex==i?'selectactive':''" href="javascript:;">{{item.name}}</strong>
                    </li>
                </ul>
                <!--单程时 标题显示-->
                <strong v-else class="inc_wrap fontblod show f34 c3 tac calendarTitle">选择日期</strong>
            </section>
            <!--周情况展示-->
            <section class="df tac f24 weekSituation">
                <li>日</li>
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li>六</li>
            </section>
            
            <section id="CalendarMainContentID" class="inc_wrap oys ofScroling calendarMainContent">

                <!--日历-->
                <div :ref="item.monthID" v-for="(item,i) in dates" :key="i" class="calendarmonths">
                    <strong class="show c3 f50 fontblod monthtitle">{{item.monthTitle}}</strong>
                    <div class="pr tac f26 ullist">
                        <ul class="df">
                            <li class="pr df tac" @click="tap(item,i,val,j)" :class="[!val.disable?'ccc disable':'',val.active,val.activetint]" v-for="(val,j) in dates[i].list" :key="j">
                                <span :class="[val.workdays,val.holiday]" class="f20 tac holiday">{{val.topText}}</span>
                                <span :class="[val.today,val.holiday,(j%7==0||(j+1)%7==0?'hot':'')]" class="num">{{val.num}}</span>
                                <span v-if="val.price&&val.disable" :class="val.lowprice?'specialPrice':''" class="f20 c8 view">&yen;{{val.price}}</span>
                                <!-- <span v-if="!val.price&&val.disable" :class="val.lowprice?'specialPrice':''" class="f20 c8 view">查看</span> -->
                            </li>
                        </ul>
                        <span class="pa pmc tac bg">{{item.monthNumber}}</span>
                    </div>
                </div>

            </section>

            <!--往返时 日历 确认选择-->
            <section v-if="params.trip" class="inc_wrap max_width footerBox">
                <div class="inc_wrap f26 calendarSelectInfoWrap">
                    <span class="fl triptype">
                        <span>去：{{changeParams.depstr.substr(5) || '未选择'}}</span>
                        <span :class="!changeParams.arrstr?'c8':''">返：{{changeParams.arrstr.substr(5) || '未选择'}}</span>
                    </span>
                    <span class="fr price">
                        往返总价：<em class="noStyle">&yen;{{selectViewDate.countPrice}}起</em>
                    </span>
                </div>
                <!--确认按钮-->
                <div @click="comfirmTap" class="cf tac f36 comfirm">确 定</div>
            </section>
        </section>

    </section>
</template>


<script type="text/javascript">
import Vue from "vue";

import 'mint-ui/lib/style.css';
// 假日数据
import HolidayData from "./holidaydata.js";
import calendarServer from './server';
import {autoAdapt} from "@/scripts/assist.js";
import {deepCopy, iDate, isLeapYear} from "@/utilsEntry.js";

export default {
    name: "CalendarPopup",
    data(){
        return{
            globalClass: "greenSkin",   //换肤字段
            // 基础入参数据
            baseParams: {
                // 渲染多少个月
                howManyMonth: 12,
                // 从何时开启渲染
                theNow: new Date()
            },
            // 页面交互需要用的参数 从入参copy获取
            changeParams: {},
            // 日历数据
            dates: [{
                monthTitle: "",
                monthNumber: 0,
                monthID: "",
                list: [{
                    str: "2019-01-01",
                    num: 1,
                    week: "",
                    disable: false
                }]
            }],
            // 拷贝一份日历数据
            copydates:[],
            // tab切换数据
            switchTabContent:[{
                name: "选择去程",
                sta : 1
            },{
                name: "选择返程",
                sta : 0
            }],
            switchTabIndex: 0,
            // 选中日期的显示对象集合
            selectViewDate: {
                // 往返价格
                goTrip: {},
                returnTrip: {},
                // 往返总价格
                countPrice: "--"
            },
            // 低价数据
            specialprice: {}
        }
    },
    computed:{
        // 判断是否是闰年
        isLeapNo(state){
            return isLeapYear(new Date())? 366 : 365;
        },
        nowDate(arg){
            return iDate;
        }
    },
    methods:{
        setSkin(){
            switch (this.skinType) {
                case '1':
                    this.globalClass = 'greenSkin';
                    break;
                case '2':
                    this.globalClass = 'blueSkin';
                    break;
                case '3':
                    this.globalClass = 'wxSkin';
                    break;
                default:
                    this.globalClass = 'greenSkin';
                    break;
            }
        },
        // 初始化到舞台
        addToStage(){
            // console.log("入参参数：", this.params, iDate(this.params.depstr) );
            this.handleInitialize();
            // 设置应该出现的月份次数
            this.SetMonthNumber();

            this.renderCalendarBaseData();
            this.renderMergeHolidayData();
            this.insertState();

            this.setPosition();
        },
        // 渲染日历基本数据
        renderCalendarBaseData(){
            var params = {
                // 把基础参数也合并在里面，节省赋值时间
                ...this.baseParams,
                ...this.changeParams
            },
            tempFormatDate = [];   // 计数器

            if( !params.howManyMonth ) return false;

            // console.log("renderCalendarBaseData:", this.nowDate("2017-12-01",30) );
            for( let i=0,len=params.howManyMonth; i<len; i++ ){
                let itemYearNumber  = this.nowDate(params.theNow).y,     // 得到当下是几几年
                    itemMonthNumber = this.nowDate(params.theNow).m + i;   // 得到当下月份是几月
                // 算出循环的月份变化 和 年份变化
                if( itemMonthNumber > 12 ){
                    itemYearNumber++;
                    itemMonthNumber = i-(12-this.nowDate(params.theNow).m);
                };
                
                // 设置月份的数据属性
                tempFormatDate.push({
                    "monthTitle": `${itemMonthNumber}月`,       // ${itemYearNumber}年
                    "monthNumber": (itemMonthNumber-0),
                    "monthID": `ID_${itemYearNumber}${itemMonthNumber}`,
                    "list": []
                });

                // 每月
                let itemString         = this.nowDate(`${itemYearNumber}/${itemMonthNumber}/1`),
                    theMonthLastDay    = itemString["lastDay"],   // 得到当月最后一天是几号
                    theMonthBeginMonth = itemString["widx"];       // 得到周几的下标值 0-6: 0是周日 6是周六
                
                    // console.log( itemString, itemString.string, theMonthLastDay, theMonthBeginMonth );

                // 遍历每月天数 （总天数+周几）
                for( let j=0,size=(theMonthLastDay+theMonthBeginMonth); j<size; j++ ){
                    let idx = (j-theMonthBeginMonth);
                    // 填充1号之前的空位
                    if( idx < 0 ){
                        tempFormatDate[i]["list"].push({
                            // num: this.nowDate(itemString,idx).string, 
                            disable: !1     // false
                        });
                        continue;
                    };

                    // 填充数据
                    let oDate = this.nowDate(`${itemString.y}/${itemString.mm}/${(idx+1)}`);
                    tempFormatDate[i]["list"].push({
                        str : oDate.string,
                        md: oDate.month_day,
                        num : (idx+1),
                        week: oDate.todayDes, 
                        // 大于可用范围内的都是false 默认为true
                        disable: this.isCheckedRange(oDate)     // !0 true
                    });
                };
                
                // this.dates[i].monthTitle = `${itemMonthNumber}月`;
                // console.log( tempFormatDate[i], itemYearNumber, itemMonthNumber, theMonthLastDay );
            };

            this.dates = tempFormatDate;
            // 拷贝一份
            // this.copydates = Vue.Tool.easyCopy(tempFormatDate);

            // console.log( this.dates );
        },
        // 插入一些日历显示的状态和修改数据
        insertState(oArgument=this.changeParams){
            var params = oArgument;
            // console.log("insertState:", params);
            for( let i=0,len=this.dates.length; i<len; i++ ){
                let item = this.dates[i];
                for( let j=0,size=item.list.length; j<size; j++ ){
                    let val = item.list[j];
                    // if(!val.str) continue;
                    // val = this.copydates[i].list[j];
                    if( val.str ){
                        // 入参日期匹配
                        if( val.disable&&this.nowDate(val.str).timeInit===this.nowDate(params.depstr).timeInit ){
                            val.active = "active";
                            val.topText = params.trip?"去程":val.topText; // 只有在往返情况才显示
                            // 赋值选中对象
                            this.selectViewDate["goTrip"] = val;
                        };
                        // 往返类型 并且返程有值 默认赋值参数
                        if( params.trip&&params.arrstr&&this.nowDate(params.arrstr).timeInit==this.nowDate(val.str).timeInit ){
                            this.selectViewDate["returnTrip"] = val;
                        };
                        // 如果有返程 并且 当前选中返程
                        if( val.disable&&params.trip&&params.travel ){
                            // 如果去程大于返程 则清空返程日期
                            if( this.nowDate(params.depstr).timeInit>this.nowDate(params.arrstr).timeInit ){
                                // 清空返程的一些东西
                                this.changeParams.arrstr = "";
                                // this.selectViewDate["returnTrip"] = {}; // 赋值选中对象
                                // break;
                            };
                            // 如果去程和返程是同一天
                            if( this.nowDate(val.str).timeInit==this.nowDate(params.arrstr).timeInit && this.nowDate(val.str).timeInit==this.nowDate(params.depstr).timeInit ){
                                val.active = "active";  // 标记返程样式
                                val.topText = "去/返";
                                // 赋值选中对象
                                this.selectViewDate["returnTrip"] = val;
                                // break;
                            };
                            // 标记从去程到返程之间的日历样式
                            if( this.nowDate(params.depstr).timeInit < this.nowDate(val.str).timeInit && this.nowDate(params.arrstr).timeInit > this.nowDate(val.str).timeInit && this.nowDate(params.depstr).timeInit < this.nowDate(params.arrstr).timeInit ){
                                // 赋值浅色
                                val.activetint = "activetint";
                            };
                            // 返程操作日期不得大于去程
                            if( this.nowDate(val.str).timeInit < this.nowDate(params.depstr).timeInit ){
                                // 选择去程的时候可以选择 <= 今天
                                // 选择去程的时候不可以 > 去程日期
                                val.disable = !this.switchTabIndex;
                            };
                            // 匹配到去程 并且去程不能大于返程
                            if( this.nowDate(val.str).timeInit===this.nowDate(params.arrstr).timeInit && this.nowDate(params.depstr).timeInit < this.nowDate(params.arrstr).timeInit ){
                                val.active = "active";  // 标记返程样式
                                val.topText = "返程";
                                // 赋值选中对象
                                this.selectViewDate["returnTrip"] = val;
                                // break;
                            };
                        };
                        // console.log("abs: ", val.str, params.travel);
                        // 标记今天
                        if(this.nowDate(val.str).timeInit===this.nowDate(new Date).timeInit){
                            // console.log( val.str, this.nowDate(new Date).string  );
                            // val.active = "today";
                            val.num = "今天";
                            val.today = "f22"
                        };
                    };
                    
                    this.hanlderSpecialPrice(item,val);
                };
            };

            // console.log( "this.dates: ", JSON.stringify(params) );
        },
        // 日历中特惠价格的数据处理
        hanlderSpecialPrice(item,val){
            
            try{
                // 数据不存在的时候
                if( !this.specialprice.body&&!this.specialprice.data ) return false;
                // 往返类型 && 只有往返时选中去程不显示价格
                if( this.changeParams.trip&&!this.changeParams.travel ) return false;

                var params = this.params,
                    oData = this.specialprice;
                // 国内
                if( !params.isInter ){
                    let data = oData.body,
                        itemFilter = (!params.trip)?
                        data.filter( item=> item.flydate == val.str ) :
                        data.filter( item=> this.hanlderDate(item.date) == val.str );
                    // 没有匹配的日期
                    if( !itemFilter.length ) return false;
                    
                    val.price = itemFilter[0].price;
                    val.lowprice = (!params.trip)?!!(itemFilter[0].monthlowestprice-0):(!!itemFilter[0].lowest-0);
                }
                // 国际
                else{
                    let data = oData.data?oData.data.RD:[],
                        itemFilter = data.filter( item=> item.DD == val.str);
                    // 没有匹配的日期
                    if( !itemFilter.length ) return false;
                    
                    val.price = itemFilter[0].TP-0;
                    val.lowprice = !!(itemFilter[0].ML-0);

                };

                this.roundGetPrice(val);
            }catch(e){
                console.log("handler special price: ",e);
            };
            
        },

        // ------- 事件操作start ------- //
        // 标签切换
        switchTap(item,i){
            // this.switchTabContent.forEach(item=> item.sta=0 );
            // item.sta = 1;
            this.switchMethodFn(i);

            // console.log( item, i );
            // console.log( this.dates );
            //eventTrack('','机票日历选择','点击头部tab', `点击:${item.name}`);
        },
        // 点击日期
        tap(item,i,val,j){
            // console.log("tap:", JSON.stringify(val), val.disable, this.params.trip);
            // 禁用
            if( !val.disable ) return false;

            // 初始化日历数据
            // this.dates = [];

            var strtype = ["depstr","arrstr"],
                obj = {
                    ...this.changeParams
                };
            // 赋值
            obj[strtype[this.switchTabIndex]] = val.str;
            this.changeParams = obj;

            // console.log( 
            //     JSON.stringify(val), 
            //     JSON.stringify(this.changeParams) 
            // );
            // return false;
            // console.log( val.str,this.params.depstr );
            // 是往返类型 并且 下标选择去程 并且 选择日期不等于传入的去程日期
            if( !this.switchTabIndex && this.changeParams.trip ){   // val.str!=this.params.depstr
                // 清空返程的一些东西
                this.changeParams.arrstr = "";
                // this.selectViewDate["returnTrip"] = {}; // 赋值选中对象
                // break;
            };
            this.SetMonthNumber();
            this.renderCalendarBaseData();
            this.renderMergeHolidayData();
            this.insertState( this.changeParams );
            // this.hanlderCalendarSpecialPrice(this.specialprice);

            // console.log( this.params.trip, !this.params.trip );
            // 如果是单程日历 点击执行回调
            if( !this.params.trip ){
                // 回调函数
                if( this.params.callback ){
                    this.params.callback(val);
                }else{
                    this.$emit("calendarCallback", val);
                }
                this.closeTap();
            }
            // 往返日历
            else{
                // 下标值 0是去程 1是返程
                if( !this.switchTabIndex ){
                    // 赋值选中数据
                    this.selectViewDate["goTrip"] = val;
                    // 点击自动切换到返程
                    this.switchMethodFn(1);
                    // 重新请求数据
                    this.demosticCalendarLowPrice();
                }else{
                    this.selectViewDate["returnTrip"] = val;
                };
            };

            this.roundGetPrice(val);
            
        },
        // 确认按钮
        comfirmTap(){
            try{
                // 如果没有选择返程 则提示
                if( this.changeParams.trip&&!this.changeParams.arrstr ){
                    this.$toast("选择返程日期");
                    return false;
                };

                // 如果去程和返程都有数据 那么在去程选项下 点击【确认按钮】则关闭弹窗
                if( this.changeParams.trip&&!this.changeParams.travel&&this.changeParams.arrstr ){
                    this.switchMethodFn(1);
                };

                // 回调函数
                if( this.params.callback ){
                    this.params.callback( this.selectViewDate["goTrip"], this.selectViewDate["returnTrip"] );
                }else{
                    this.$emit("calendarCallback", this.selectViewDate["goTrip"], this.selectViewDate["returnTrip"]);
                };
                // debugger;
                this.closeTap();
                
                //eventTrack('','机票日历选择','底部确认', '点击:[确认]');
            }catch(e){
                console.log(e);
            }
        },
        // 关闭弹窗
        closeTap(){
            this.$emit("update:visible", false);
            this.resetData();
            // console.log("this.visible: ", this.visible);
        },
        // 往返时标签选中后统一执行的方法
        switchMethodFn(i){
            this.roundTravelStatus(i);
            this.SetMonthNumber();
            this.renderCalendarBaseData();
            this.renderMergeHolidayData();
            this.insertState(); // this.changeParams 

            this.setPosition();
        },
        // ------- 事件操作end ------- //


        // ------- 数据处理start ------- //
        // 处理初始化
        handleInitialize(){
            // 赋值入参参数
            if( this.params ){
                // this.changeParams = Vue.Tool.deepCopy(this.params,{});
                this.changeParams = {
                    ...deepCopy(this.params,{}),
                    ...this.baseParams
                }
            };

            // 默认标签的选中态 只在往返时才生效
            if( this.changeParams.trip ){
                this.roundTravelStatus(this.changeParams.travel);
                // 国内国际往返时显示提示价格
                this.$toast("价格为往返总价");
            };

            // 最大范围的月份
            // console.log( this.nowDate(this.baseParams.theNow).d );
        },
        // 设置应该出现的月份次数
        SetMonthNumber(){
            var params = this.changeParams;

            // console.log( JSON.stringify(this.changeParams) );
            // 如果是单程
            if( !params.trip ){
                //  并且不是当月不是1号 多渲染一个月
                if( this.nowDate(params.theNow).d!=1 ){
                    params.howManyMonth ++;
                };
            }
            // 如果是往返
            else{
                // 并且判断table下标在哪个位置 0单程 1返程
                if( !this.switchTabIndex ){
                    params.howManyMonth = 12;
                    params.theNow = new Date();
                    if( this.nowDate(params.theNow).d!=1 ){
                        params.howManyMonth ++;
                    };
                }else{
                    params.howManyMonth = 3;
                    params.theNow = params.depstr;
                    if( this.nowDate(params.depstr).d!=1 ){
                        params.howManyMonth ++;
                    };
                };
            };

            // console.log( "SetMonthNumber:", params, params.howManyMonth );

        },
        // 判断日历是否可以范围
        isCheckedRange(oTime){
            // 小于今天 && 大于可用范围 (现在是默认的365|366)
            // return !(oTime.timeInit < this.nowDate(this.baseParams["theNow"]).timeInit || oTime.timeInit > this.nowDate(this.baseParams["theNow"],this.isLeapNo).timeInit);
            var params = this.changeParams;
            // 如果是单程
            if( !params.trip ){
                // 小于今天或者大于最大限制都为不可选
                return !(oTime.timeInit < this.nowDate(params["theNow"]).timeInit || oTime.timeInit > this.nowDate(params["theNow"], this.isLeapNo).timeInit);
            }
            // 如果是往返
            else{
                // 并且判断table下标在哪个位置 0单程 1返程
                let daynumber = (!this.switchTabIndex)?this.isLeapNo:90,
                    isday = (!this.switchTabIndex)?params["theNow"]:params["depstr"];
                // console.log( daynumber );
                return !(oTime.timeInit < this.nowDate(params["theNow"]).timeInit || oTime.timeInit > this.nowDate(isday, daynumber).timeInit);
            };
            // if( 
            //     oTime.timeInit < this.nowDate(this.baseParams["theNow"]).timeInit || 
            //     oTime.timeInit > this.nowDate(this.baseParams["theNow"], this.isLeapNo).timeInit  
            // ){
            //     return !1;
            // }else{
            //     return !0;
            // };
            // console.log(oTime.string);
        },
        // 假日数据渲染
        renderMergeHolidayData(){
            for( let i=0,len=this.dates.length; i<len; i++ ){
                let item = this.dates[i];
                for( let j=0,size=item.list.length; j<size; j++ ){
                    let val = item.list[j];
                    // 跟随放假节点的假日 // HolidayData.filter(item=>item==val.str).length
                    if( HolidayData.holidays.indexOf(val.str) != -1 ){
                        val.topText = "休";
                    };
                    // 假日调班
                    if( HolidayData.workdays.filter(item=>item==val.str).length ){
                        val.topText = "班";
                        val.workdays = "workdays";
                    };
                    // 存在对应的放假节点
                    if( HolidayData.festivals[val.str] ){
                        val.topText = HolidayData.festivals[val.str];
                        val.holiday = 'hot';
                    };
                };
            };
        },
        // 往返时标签的选中态
        roundTravelStatus(idx){
            // this.switchTabContent.forEach(item=> item.sta=0 );
            // this.switchTabContent[idx].sta = 1;

            this.switchTabIndex = idx;
            // 触发类型：0去程 1往程
            this.changeParams["travel"] = idx;
        },
        // 往返时获取总价格
        roundGetPrice(val){
            // console.log(
            //     this.changeParams.depstr,
            //     this.changeParams.arrstr
            // );

            // 赋值往返总价格
            var countPrice = this.selectViewDate.countPrice,
                goTrip     = this.selectViewDate.goTrip,
                returnTrip = this.selectViewDate.returnTrip;

            this.selectViewDate["countPrice"] = returnTrip.price || "--";

            // if( goTrip.price&&returnTrip.price ){
            //     countPrice = (goTrip.price+returnTrip.price);
            // }else{
            //     countPrice = "--";
            // };

            // // console.log(
            // //     goTrip.str,goTrip.price,
            // //     returnTrip.str,returnTrip.price,
            // //     countPrice
            // // );

            // this.selectViewDate["countPrice"] = countPrice;
            // this.selectViewDate["goTrip"].price = goTrip.price;
            // this.selectViewDate["returnTrip"].price = returnTrip.price;
             
        },
        // YYYYMMDD日期格式处理
        hanlderDate(val){
            var str = val.toString();
            return `${str.substr(0,4)}-${str.substr(4,2)}-${str.substr(6,2)}`
        },
        // 定位位置
        setPosition(){

            try{
                Vue.nextTick().then(()=>{
                    var timer = null;
                    if( timer ){
                        clearTimeout(timer);
                        timer = null;
                    };
                    timer = setTimeout(()=>{
                        var selectObj = !this.switchTabIndex?this.changeParams.depstr:this.changeParams.arrstr,
                            dom = this.$refs[`ID_${this.nowDate(selectObj).y}${this.nowDate(selectObj).m}`];
                            // topValue = 0;
                        
                        // 判断如果去程不存在
                        if( !dom ){
                            dom = this.$refs[`ID_${this.nowDate(this.changeParams.depstr).y}${this.nowDate(this.changeParams.depstr).m}`];
                        };

                        // console.log(dom);
                        // console.log(this.changeParams);
                        // console.log(`ID_${this.nowDate(this.changeParams.depstr).y}${this.nowDate(this.changeParams.depstr).m}`);
                        // console.log(this.$refs);



                        var offsetTop = dom[0].getBoundingClientRect().top-autoAdapt( 300 );
                        // this.$refs.CalendarMainContentID.scrollTo(0, offsetTop<0?0:offsetTop);
                        document.querySelector("#CalendarMainContentID").scrollTo(0, offsetTop<0?0:offsetTop)
                        
                        

                        // // 如果是单程
                        // if( !this.changeParams.trip ){
                        //     let computed = offsetTop-oAdapt(292);
                        //     topValue = computed<=0?0:computed;
                        // }
                        // // 如果是返程
                        // else{
                        //     let computed = offsetTop-oAdapt(336);
                        //     topValue = computed<=0?0:computed;
                        // };

                        // // 如果下标选中了返程
                        // if( this.changeParams.travel ){
                        //     topValue = 0;
                        // };

                    },200);
                });    
            }catch(e){
                console.log("setPosition:", e);
            };
            
        },
        // 重置数据
        resetData(){
            // 重置数据
            Object.assign(this.$data, this.$options.data());
        },
        // ------- 数据处理end ------- //

        // ------- 接口响应 ------- //

        // 国内低价
        async demosticCalendarLowPrice(){
            var name = "",  // 请求接口方法名
                params = this.params,
                // 天数限制：单程90天 往返15天
                daynums = params.trip?15:90,
                // 参数处理
                now = params.trip?this.nowDate(this.changeParams.depstr):this.nowDate(new Date),
                BeginDay = now.string,          // 开始时间
                EndDay = this.nowDate( now.timeInit + (86400000*daynums) ).string,   // 结束时间

                args = {};      // 入参参数
                // inter = {},     // 国际参数
                // domestic = {};  // 国内参数
            // 不是国内不允许往下执行
            // if( !this.params.isInter ) return false;
            // 国内 单程
            if( !params.isInter && params.trip==0 ){
                name = "calendarOneWaySpecialPrice";
            }
            // 国内 往返
            else if( !params.isInter && params.trip==1 ){
                name = "calendarRoundWaySpecialPrice";
            }
            // 国际
            if( params.isInter ){
                name = "calendarSpecialPrice";
            };

            // 参数判断
            if( !params.isInter ){   // 0：国内
                args = {
                    "departure": params.depcode,     // 起飞机场三字码
                    "arrive": params.arrcode,        // 低达机场三字码
                    "startDate": BeginDay,      // 开始日期
                    "endDate": EndDay           // 结束日期
                };
            }else{  // 1：国际
                args = {
                    D : params.depcode,
                    A : params.arrcode,
                    BD: BeginDay,       // 必填 开始日期
                    ED: EndDay          // 必填 结束日期
                };
            };

            try{
                let ServerData = null;
                switch(name){
                    case "calendarRoundWaySpecialPrice":
                        ServerData = await calendarServer.calendarRoundWaySpecialPrice(args);
                        break;
                    case "calendarOneWaySpecialPrice":
                        ServerData = await calendarServer.calendarOneWaySpecialPrice(args);
                        break;
                    case "calendarSpecialPrice":
                        ServerData = await calendarServer.calendarSpecialPrice(args);
                        break;

                }
                // 赋值返回数据
                this.specialprice = ServerData;
                
                this.renderCalendarBaseData();
                this.renderMergeHolidayData();
                this.insertState();
                
                // this.hanlderCalendarSpecialPrice( ServerData );

                console.log( "ServerData: ", this.specialprice );
            }catch(e){
                console.log(name, ": ", e);
            };

            // fn && fn();
        }
    },
    props: {
        // 控制是否显示
        visible:{
            type: Boolean,
            default: false
        },
        // 主要参数
        params: {
            type: Object,
            default: {
                // 航程类型：0单程 1往返
                trip: 0,
                // 0:国内 or 1:国际
                isInter: 0,
                // 触发类型：0去程 1往程
                travel: 0,
                // 去程日期：YYYY-MM-DD
                depstr: "",
                // 返程日期：YYYY-MM-DD    出行类型：不存在是：单程；存在是：往返
                arrstr: "",
                // 城市三字码 - 去程
                depcode: "SHA",
                // 城市三字码 - 返程
                arrcode: "HKG"
                // 回调参数： arguments：0是单程||去程  1：返程
                // callback(respOneWay, respRountWay){}
            }
        },
        // 日历换肤
        skinType: {
            type: String,
            default: ''
        }
    },
    watch: {
        "visible": {
            handler:function(nval,oval){
                // 关闭的时候不执行
                if( !nval ) return false;

                // 换肤
                this.setSkin();

                this.addToStage();
                this.demosticCalendarLowPrice();

                // console.log( "watch visible this: ", this, nval );
            }
        }
    }
};

// function prevenstop(ev){
//     ev.preventDefault();
// }
</script>

<style lang="less" scoped>
@import "~@/less/common.less";
@import "~@/less/widget_ui.less";
@import "./less/skin.less";
@import "./less/sprite_home_icon.less";

@red: #FF5346;
@green: #23BEAE;
.calendarWrap{
    background-color:rgba(0,0,0,0.7);
    .Calendar_box{
        left:0; bottom:0; z-index:1000;
        width:100%;
        height:90%;
        flex-flow:column nowrap;
        border-radius:20px 20px 0 0;
    }
    .calendarMainContent{
        flex:1;
    }

    .weekSituation{
        padding:10px 0;
        flex-flow:row nowrap;
        justify-content:space-around;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        
        li:first-child,li:last-child{
            color:@red;
        }
    }
    .closePopup{
        right:20px;
        // top:45px;
        color:#ccc;
    }
    .headerBox{
        height:112px;
        border-bottom:1px solid #dcdcdc;
    }
    .roundTripSwitch{
        // height:112px;
        justify-content: space-between;
        li{
            width:50%;
            .btns{
                height:106px;
                box-sizing:content-box;
                // padding:20px 0;
            }
            .selectactive{
                border-width:4px !important;
            }
            /*.active{*/
                /*border-bottom:4px solid #50d2c7;*/
            /*}*/
        }
    }
    .calendarTitle{
        // padding:24px 0;
    }
    .roundTripSwitch,.calendarTitle{
        height:112px; line-height:112px;
    }

    .calendarMainContent{
        .calendarmonths{
            padding:20px 0;
            .monthtitle{
                padding-left:40px;
            }
            .ullist{
                // align-content:center;
                align-content:center;
                flex-flow: column nowrap;
                ul{
                    flex-flow:row wrap;
                    justify-content:flex-start;
                    li{
                        width: 14.27%;
                        height:108px;
                        border-radius:10px;
                        margin-bottom: 10px;
                        justify-content:flex-start;
                        flex-flow: column nowrap;
                        align-items:center;

                        .holiday,.num,.specialPrice{
                            line-height:normal;
                        }
                        .holiday{
                            width:100%;
                            height:40px;
                            line-height:40px;
                            color:@red;
                        }
                        .num{
                            display: inline-block;
                            height:30px; line-height:30px;
                            vertical-align: text-bottom;
                            overflow: hidden;
                        }
                        .specialPrice{
                            color:@red;
                        }
                        .hot{
                            color:@red;
                        }
                        .workdays{
                            color:#333;
                        }

                    }
                    .active{
                        /*background-color:@green;*/
                        color:#fff;
                        .holiday,.specialPrice,.view,.hot{
                            color:#fff;
                        }
                    }
                    .activetint{
                        /*background-color:#e9f8f6;*/
                        border-radius:0;
                    }

                    .disable{
                        .holiday,.hot{
                            color:#ccc;
                        }
                    }
                    
                }
                .bg{
                    z-index:-1;
                    color:#f5f5f5;
                    font-size:300px;
                    height:436px;
                    // min-width:194px;
                }
            }
        }
        .today{
            color:#000;
        }
    }


    .footerBox{
        padding:10px 0 20px;
        box-shadow: 0 -3px 2px rgba(0,0,0,0.1);
        width:100%;
        .calendarSelectInfoWrap,.comfirm{
            width:690px;
            margin:0 auto;
        }
        .calendarSelectInfoWrap{
            padding:20px 0;
            .triptype{
                // width:460px;
                span{
                    padding-right:20px;
                }
            }
            .price{
                // width:240px;
                em{
                    color:@red;
                }
            }
        }
        .comfirm{
            height:90px; line-height:90px;
            border-radius:50px;
            /*background-color:@green;*/
        }
    }
    .fontblod{
        font-weight: bold;
    }
}
</style>