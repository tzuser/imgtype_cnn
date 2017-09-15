/*
* @Author: zuo.tang
* @Date:   2017-09-11 17:35:51
* @Last Modified by:   zuo.tang
* @Last Modified time: 2017-09-11 18:20:40
*/
var {types,getX,getNet,learnImage} = require('./core');
let {join,extname}=require('path');
const readline = require('readline');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let action=0;
let type=0;
let path='';
console.log('请输入图片地址:')
rl.on('line',async (data) => {
	switch(action){
		case 0:
			path=data;
			action=1;
			var str="";
			types.forEach((item,key)=>{
				str+=`${item}[${key}] `;
			})
			console.log("请选择类型:")
			console.log(str)
			break
		case 1:
			type=data;
			console.log('请耐心等待...')
			try{
				await learnImage(path,type);
			}catch(err){
				console.log(err)
			}
			console.log('学习完成...')
			action=0;
			break
	}
});


