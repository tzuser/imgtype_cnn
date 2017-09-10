var convnetjs = require('convnetjs');
var fs = require('fs');
let {join,extname}=require('path');
const readline = require('readline');


var layer_defs = [];
layer_defs.push({ type: 'input', out_sx: 32, out_sy: 32, out_depth: 3 }); // declare size of input
// output Vol is of size 32x32x3 here
layer_defs.push({ type: 'conv', sx: 5, filters: 16, stride: 1, pad: 2, activation: 'relu' });
// the layer will perform convolution with 16 kernels, each of size 5x5.
// the input will be padded with 2 pixels on all sides to make the output Vol of the same size
// output Vol will thus be 32x32x16 at this point
layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
// output Vol is of size 16x16x16 here
layer_defs.push({ type: 'conv', sx: 5, filters: 20, stride: 1, pad: 2, activation: 'relu' });
// output Vol is of size 16x16x20 here
layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
// output Vol is of size 8x8x20 here
layer_defs.push({ type: 'conv', sx: 5, filters: 20, stride: 1, pad: 2, activation: 'relu' });
// output Vol is of size 8x8x20 here
layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
// output Vol is of size 4x4x20 here
layer_defs.push({ type: 'softmax', num_classes: 10 });
// output Vol is of size 1x1x10 here

let types=['色情','全裸','美穴','美胸','美臀','美腿','性感','美女','正常','推荐']
const getNet= async ()=>{
  let net = new convnetjs.Net();
  net.makeLayers(layer_defs);
  if(fs.existsSync('data.json')){
    var jsonTxt = fs.readFileSync('data.json','utf-8');
    let jsonData=JSON.parse(jsonTxt);
    net.fromJSON(jsonData);
  }
  return net;
}


const test=async (imgPath)=>{
  let net=await getNet();
  let xData;
  try{
    xData=await getX(imgPath)
  }catch(err){
    console.log('图片错误',err);
    return;
  }
  let {x,image}=xData
  var prob =net.forward(x);
  res=prob.w;
  let keyList=Object.keys(res).sort(function(a,b){return res[b]-res[a]});
  let tagList=[];
  for(var i=0;i<3;i++){
    let key=keyList[i];
    let bl=parseInt(res[key]*100);
    if(bl>5){
      tagList.push({type:types[key],w:bl})
    }
  }

  return {list:tagList,image};
  //await image.
}



const getX = async (path) => {
    let {list,image}=await getImageData(path);
    var x = new convnetjs.Vol(list);
    x.sx = 32;
    x.sy = 32;
    x.depth = 3;
    return {x,image};
}

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


const testFiles=async (path)=>{
  let files=findSync(path)
  for(let i in files){
    let filepath=files[i];
    let ext=extname(filepath);
    if(ext=='.jpg' || ext=='.png'){
      let testData=await test(filepath);
      if(!testData){continue;}
      let {list,image}=testData;
      console.log(filepath);
      for(let p in list){
        let wdata=list[p];
        if(wdata.w<=20){continue};
        let testPath=`./test/${wdata.type}/`;
        if (!fs.existsSync(testPath)) {
             fs.mkdirSync(testPath);
        }
        let timeStr=new Date().getTime();
        image.write(`${testPath}${wdata.w}__${timeStr}${ext}`)
      }
    }
  }
}

/**
 * 
 * @param startPath  起始目录文件夹路径
 * @returns {Array}
 */
function findSync(startPath) {
    let result=[];
    function finder(path) {
        let files=fs.readdirSync(path);
        files.forEach((val,index) => {
            let fPath=join(path,val);
            let stats=fs.statSync(fPath);
            if(stats.isDirectory()) finder(fPath);
            if(stats.isFile()) result.push(fPath);
        });

    }
    finder(startPath);
    return result;
}


/*testFiles('C:/Users/Administrator/Desktop/杂').then(()=>{
  console.log('完成')
})*/
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (imagePath) => {
  test(imagePath).then(data=>{
    console.log(data)
    let ext=extname(imagePath);
    let name=new Date().getTime();
    console.log(name)
    data.image.write(`./onetest/${name}${ext}`)
  })
  console.log('请输入图片地址:')
});


