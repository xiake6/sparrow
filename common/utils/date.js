/**
 * @param time {Date||String||Number} 日期对象 || 日期格式 || 时间戳
 * @param diff {Number} 延伸天数
 * @param style {String} 日期返回格式
**/

// export function tesst(){};

export function iDate(time=new Date, diff=0, style="yyyy-mm-dd"){
    var dayTime = (1000*60*60*24),
        _date    = new Date(new Date(time).setHours(0,0,0,0) + diff * dayTime),    // 设置为0点
        _timer   = new Date(new Date(time).getTime() + diff * dayTime),
        weekDay  = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
        dataBase = {
            // 年月日
            y : _date.getFullYear(),
            yyyy: `${_date.getFullYear()}`,
            m : _date.getMonth() + 1,
            mm: ((_date.getMonth()+1)<10?"0":"")+(_date.getMonth()+1),
            d : _date.getDate(),
            dd: (_date.getDate() < 10 ? '0' : '') + _date.getDate(),
            // 时间
            _h : _timer.getHours(),
            _hh: (_timer.getHours()<10?"0":"")+_timer.getHours(),
            _m : _timer.getMinutes(),
            _mm: (_timer.getMinutes()<10?"0":"")+_timer.getMinutes(),
            _s : _timer.getSeconds(),
            _ss: (_timer.getSeconds()<10?"0":"")+_timer.getSeconds(),
            time: _timer.getTime(),
            // 其他
            w   : weekDay[_date.getDay()],          // 返回周几的文字
            widx: _date.getDay(),                   // 周几的下标
            timeInit : _date.getTime(),             // 设置时间初始化0点 setHours(0,0,0,0)
            dayDes: "",                             // 今天、明天、后天的描述
            string: "",                             // 返回日期格式 默认yyyy-mm-dd
            month_day: '',                          // 返回04月05日
            oDate : _date                           // 返回new Date 对象
        };
        
    //月 日展示（例：04月05日）
    dataBase.month_day = `${dataBase.mm}月${dataBase.dd}日`;

    //今天明天后天的描述
    switch( ( _date - dataBase.timeInit ) / dayTime ){
        case 0 :
            dataBase.todayDes = "今天";
            break;
        case 1 :
            dataBase.todayDes = "明天";
            break;
        case 2 :
            dataBase.todayDes = "后天";
            break;
        default :
            dataBase.todayDes = dataBase.w;
    };

    // 本月末 = 下月初1-1000毫秒
    // dataBase.lastDay = (dataBase.m+1>12)?`${new Date((dataBase.y+1))}-01-01`:`${new Date(dataBase.y+"/"+(dataBase.m+1)+"/1")}`;
    // dataBase.lastDay = (new Date(dataBase.lastDay.getTime()-1000)).getDate();
    // 当月最大天数 （当月最后一天是几号）
    dataBase.lastDay = new Date(dataBase.y,dataBase.m,0).getDate();

    // 如果是中文
    if( style.match(/[\u4E00-\u9FA5\uF900-\uFA2D]/gi) ){
        let val = {
            "年": dataBase.y,
            "月": dataBase.mm,
            "日": dataBase.dd
        };
        dataBase.string = [];
        style.split("").map((item,index)=>{
            if( val[item] ) dataBase.string.push( val[item] + item );
        });
        dataBase.string = dataBase.string.join("");
    }else{
        dataBase.string = [];
        // 获得分隔符
        var splitSymbol = style.match(/[^a-z]/gi)[0];
        // 返回日期格式
        style.split(splitSymbol).map(item=>{
            dataBase.string.push(dataBase[item])
        });
        dataBase.string = dataBase.string.join(splitSymbol);
    };

    return dataBase;
};

// 判断是否是闰年
export function isLeapYear(o){
    var _y = iDate(o).y;
    return (0 == _y % 4 && ((_y % 100 != 0) || (_y % 400 == 0)));
}

//日期间隔天数
export function getDateDiff(startDate,endDate){
    console.log("getDateDiff startDate:",startDate);
    console.log("getDateDiff endDate:",endDate);
    var startTime = iDate(startDate).time;
    var endTime = iDate(endDate).time;
    return Math.abs((startTime - endTime))/(1000*60*60*24);
}

//计算年龄
export function computeYear(today,birth){ //传入标准时间格式
    var nowYear = today.getFullYear();
    var nowMonth = today.getMonth() + 1;
    var nowDay = today.getDate();
    var birthYear = birth.getFullYear();
    var birthMonth = birth.getMonth() + 1;
    var birthDay = birth.getDate();
    let returnAge = '';
    if (nowYear == birthYear) {
        returnAge = 0; //同年 则为0岁
    } else {
        var ageDiff = nowYear - birthYear; //年之差
        if (ageDiff > 0) {
            if (nowMonth == birthMonth) {
                var dayDiff = nowDay - birthDay; //日之差
                if (dayDiff < 0) {
                    returnAge = ageDiff - 1;
                } else {
                    returnAge = ageDiff;
                }
            }else{
                var monthDiff = nowMonth - birthMonth; //月之差
                if (monthDiff < 0) {
                    returnAge = ageDiff - 1;
                } else {
                    returnAge = ageDiff;
                }
            }
        }else {
            returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天
        };
    }
    return returnAge;
}