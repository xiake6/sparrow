/**
 * @Date:   2019-06-13
 * @Last modified by:   liufan
 * @Last modified time: 2019-06-13
 */

 //fetch
import isomorphicFetch from 'isomorphic-fetch';

//axios
import axios from 'axios';
import qs from 'qs';
import esPromise from 'es6-promise';

esPromise.polyfill();

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = response.statusText && new Error(response.statusText)
        error.response = response
        throw error
    }
}

/**
* @method
* @param {object} args 
* 入参 例： 对照参数options
* {
*     url: '/miflightapi/json/touch/searchHotCity.html',
*     method: 'GET',
*     data: {category:1},
* }
* @return {arraybuffer|blob|document|json|text|stream} iresponseType: 'json'配置
* @desc axios方式请求接口 
**/
export function unifyAxios(args){
    //没值直接输出
    if(!args && JSON.stringify(args)== '{}' && !args.url){
        return;
    }
    //默认参数
    let options = {
        url: '',   //服务器url地址
        baseRUL: '',//自动加载到url前面，除非是绝对地址
        method: 'GET',  //使用的方法
        data: {},  //传参
        headers: {  //即将被发送的请求头
            'Content-Type': 'application/x-www-form-urlencoded',
            "Accept" : "application/json; charset=utf-8",
            "X-Requested-With" : "XMLHttpRequest",
        },
        responseType: 'json',    //响应数据类型    'arraybuffer' 'blob' 'document' 'json' 'text' 'stream'
        timeout: 2500,   //请求最大毫秒数
        withCredentials: false, // 表示跨域请求时是否需要使用凭证 (cookie、HTTP认证及客户端SSL证明等)  注意：为true时，需要'Access-Control-Allow-Credentials: true'
    };
    //转换成大写的方法名
    if(args.method) args.method = args.method.toUpperCase();   

    if(args.method == 'POST' || args.method == 'PUT'){
        // post 和 put 请求 赋值data
        options['data'] = args.data
    }
    else if(args.method == 'GET' || args.method == 'DELETE'){  
        // get 和 delete 请求 赋值params
        options['params'] = args.data
    }
    //header头赋值
    options['headers'] = Object.assign(options.headers,args.headers);
    //移除data，header 已赋值
    delete args.data; 
    delete args.header;
    //赋值参数
    options = Object.assign(options,args);
    //创建一个axios的实例
    const Axios = axios.create({});

    // //添加请求拦截器
    // Axios.interceptors.request.use( request => {
    //     console.log("请求拦截器request：",request);
    //     return request;
    // },err => {
    //     return Promise.reject(err);
    //
    // })
    //添加响应拦截器
    Axios.interceptors.response.use( response=>{
        return response.data
    })

    return Axios(options);
};


export function unifyFetch(args){
    //没值直接输出
    if(!args && JSON.stringify(args)== '{}' && !args.url){
        return;
    }
    //默认参数
    let options = {
        url: '',
        method: 'GET',
        body: {},
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        mode: 'cors',
        timeout: 2500,
        responseType: 'json',    //响应数据类型    'arraybuffer' 'blob' 'json' 'text'
    }

    //转换成大写的方法名
    if(args.method) args.method = args.method.toUpperCase();   
    //设置url地址
    if(args.method == 'GET' && args.body && JSON.stringify(args.body)!= '{}'){
        //拼接URL参数
        var _url = args.url + '?' + qs.stringify(args.body);
        //get方法 不能有body
        delete options.body;

    }else{
        var _url = args.url;
        //设置body 
        options['body'] = args.body;
    }

    //header头赋值
    options['headers'] = Object.assign(options.headers,args.headers);
    //删除已赋值的
    delete args.headers; 
    delete args.body;
    //赋值参数
    options = Object.assign(options,args);

    delete options.url; 

    //设置timeout 系列
    let abort = null;
    let abortPromise = new Promise((resolve,reject) =>{
        abort = ()=>{
            return reject({
                code: 504,
                message: '请求超时!'
            })
        }
    })

    let timeout = setTimeout(()=>{
        abort();
    },options.timeout);

    let _fetch = new Promise((resolve,reject) =>{
        isomorphicFetch( _url, options)
            .then(response => {
                clearTimeout(timeout);
                return response
            })
            .then(res =>{
                //以什么方式输出数据
                switch(options.responseType){
                    case 'arraybuffer':
                        resolve(res.arrayBuffer());
                        break;
                    case 'blob':
                        resolve(res.blob());
                        break;
                    case 'text':
                        resolve(res.text());
                        break;
                    default:
                        resolve(res.json());
                }
            })
            .then(checkStatus)
            .then((data) => ({ data }))
            .catch((err) => ( reject(err) ));
    })

    return Promise.race([ _fetch, abortPromise]);
};


