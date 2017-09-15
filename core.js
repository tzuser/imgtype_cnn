/*
* @Author: zuo.tang
* @Date:   2017-09-11 17:21:21
* @Last Modified by:   zuo.tang
* @Last Modified time: 2017-09-11 18:30:56
*/
var convnetjs = require('convnetjs');
var fs = require('fs');
//分类标签 长度10
const types=['色情','全裸','美穴','美胸','美臀','美腿','性感','美女','正常','推荐']
//获取卷积神经
const getNet= async ()=>{
  //卷积层实现
  var layer_defs = [];
  layer_defs.push({ type: 'input', out_sx: 32, out_sy: 32, out_depth: 3 }); // declare size of input
  layer_defs.push({ type: 'conv', sx: 5, filters: 16, stride: 1, pad: 2, activation: 'relu' });
  layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
  layer_defs.push({ type: 'conv', sx: 5, filters: 20, stride: 1, pad: 2, activation: 'relu' });
  layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
  layer_defs.push({ type: 'conv', sx: 5, filters: 20, stride: 1, pad: 2, activation: 'relu' });
  layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
  layer_defs.push({ type: 'softmax', num_classes: 10 });

  let net = new convnetjs.Net();
  net.makeLayers(layer_defs);
  //存在数据则加载
  if(fs.existsSync('data.json')){
    var jsonTxt = fs.readFileSync('data.json','utf-8');
    let jsonData=JSON.parse(jsonTxt);
    net.fromJSON(jsonData);
  }
  return net;
}
//获取图片的输入
const getX = async (path) => {
    let {list,image}=await getImageData(path);
    var vol = new convnetjs.Vol(list);
    vol.sx = 32;
    vol.sy = 32;
    vol.depth = 3;
    return {vol,image};
}
//获取图片像素列表
const getImageData = async (path) => {
    let jimp = require('jimp');
    let image=await jimp.read(path);
    image.resize(32, 32)
    let list = []
    for (let y = 0; y < image.bitmap.height; y++) {
        for (let x = 0; x < image.bitmap.width; x++) {
            let color=jimp.intToRGBA(image.getPixelColor(x, y));
            list.push(color.r/255-0.5)
            list.push(color.g/255-0.5)
            list.push(color.b/255-0.5)
        }
    }
    return {image,list}
}
const learnImage=async (imgPath,type,num=5)=>{
	let net=await getNet();
	var trainer = new convnetjs.SGDTrainer(net, 
        { method:'adadelta', batch_size:4, l2_decay:0.0001 }
        );
	let {vol,image}=await getX(imgPath);
	for(var i=0;i<num;i++){
        await trainer.train(vol,type);
	}
	fs.writeFileSync('data.json', JSON.stringify(net.toJSON()));
	return {net,trainer}
}
//检测图片
const forwardImage=async (imgPath)=>{
  let net=await getNet();
  let xData;
  try{
    xData=await getX(imgPath)
  }catch(err){
    console.log('图片错误',err);
    return;
  }
  let {vol,image}=xData
  var prob =net.forward(vol);
  res=prob.w;
  let keyList=Object.keys(res).sort(function(a,b){return res[b]-res[a]});
  let tagList=[];
  for(var i in keyList){
    let key=keyList[i];
    let bl=parseInt(res[key]*100);
	tagList.push({type:types[key],w:bl})
  }
  return {list:tagList,image};
}

module.exports = {
	types,
	getNet,
	getX,
	getImageData,
	forwardImage,
	learnImage
};