var  {types,getX,getNet,forwardImage} = require('./core');
let {join,extname}=require('path');
const readline = require('readline');
var fs = require('fs');


//测试文件夹下所有图片
const testFiles=async (path)=>{
  let files=findSync(path)
  for(let i in files){
    let filepath=files[i];
    let ext=extname(filepath);
    if(ext=='.jpg' || ext=='.png'){
      let testData=await forwardImage(filepath);
      if(!testData){continue;}
      let {list,image}=testData;
      console.log(filepath);
      for(let p in list){
        let wdata=list[p];
        if(wdata.w<=40){continue};
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


testFiles('D:/TangZuo/user/ConvNet/test2').then(()=>{
  console.log('完成')
})

/*const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (imagePath) => {
  forwardImage(imagePath).then(data=>{
    console.log(data)
    let ext=extname(imagePath);
    let name=new Date().getTime();
    console.log(name)
    data.image.write(`./onetest/${name}${ext}`)
  })
  console.log('请输入图片地址:')
});*/


