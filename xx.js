var  {types,getX,getNet,forwardImage} = require('./core');
var fs = require('fs');
var convnetjs = require('convnetjs');


const start = async () => {
    let net=await getNet();
    var trainer = new convnetjs.SGDTrainer(net, 
        { method:'adadelta', batch_size:4, l2_decay:0.0001 }
        );
    let num=0;

    for(var index=0;index<types.length;index++){
      let type=types[index];
      let dirPath=`./${testPath}/${type}`
      console.log(dirPath)
      let files=fs.readdirSync(dirPath);
        for(var i=0;i<files.length;i++){
          try{
            let item=files[i];
            let imgPath=dirPath+'/'+item
            let x=await getX(imgPath);
            await trainer.train(x,index);
          }catch(err){
            console.log(err)
          }
          console.log(`第${num}张图片`)
          num++
        }
    }
    fs.writeFileSync('data.json', JSON.stringify(net.toJSON()));
}

const startOne = async (testPath,index) => {
    let net=await getNet();
    var trainer = new convnetjs.SGDTrainer(net, 
        { batch_size : 2,momentum:0.9,learning_rate:  0.0001, l2_decay: 0.00001 }
        );
    let num=0;
    let type=types[index];
    let dirPath=`./${testPath}/${type}`
    console.log(dirPath)
    let files=fs.readdirSync(dirPath);
      for(var i=0;i<files.length;i++){
        try{
          let item=files[i];
          let imgPath=dirPath+'/'+item
          let x=await getX(imgPath);
          await trainer.train(x,index);
        }catch(err){
          console.log(err)
        }
        console.log(`第${num}张图片`)
        num++
      }

    fs.writeFileSync('data.json', JSON.stringify(net.toJSON()));
    
}

const start2 = async (testPath) => {
    let net=await getNet();
    var trainer = new convnetjs.SGDTrainer(net, 
        { method:'adadelta', batch_size:4, l2_decay:0.0001 }
        );
    let num=0;
    let dirlist=[];
    for(var index=0;index<types.length;index++){
      let type=types[index];
      let dirPath=`./${testPath}/${type}`
      let files=fs.readdirSync(dirPath);
      dirlist.push(files)
    }
    try{


      for(let n=0;n<20;n++){
        for(let i=0;i<dirlist.length;i++){
          let type=types[i];
          let dirPath=`./${testPath}/${type}`
          if(dirlist[i].length==0){continue}
          let files=dirlist[i];
          var len=dirlist[i].length;
          let key=parseInt(Math.random()*len);
          try{
            let item=files[key];
            let imgPath=dirPath+'/'+item
            let x=await getX(imgPath);
            await trainer.train(x,i);
          }catch(err){
            console.log(err)
          }
          console.log(`${type}_${key} 第${num}张图片 `)
          num++
        }
      }
    }catch(err){
      console.log(err)
    }

    fs.writeFileSync('data.json', JSON.stringify(net.toJSON()));
    await start2();
}


const start3 = async (testPath) => {
    let net=await getNet();
    var trainer = new convnetjs.SGDTrainer(net, 
        { method:'adadelta', batch_size:4, l2_decay:0.0001 }
        );
    let num=0;
    let dirlist=[];
    for(var index=0;index<types.length;index++){
      let type=types[index];
      let dirPath=`./${testPath}/${type}`
      let files=fs.readdirSync(dirPath);
      dirlist.push(files)
    }
    try{
      let nums=new Array(dirlist.length);
      for(let n=0;n<200;n++){
        for(let i=0;i<dirlist.length;i++){
          var len=dirlist[i].length;
          nums[i]=nums[i]>=0?nums[i]+1:0
          if(nums[i]>=len){
            nums[i]=0;
          }
          let type=types[i];
          let dirPath=`./${testPath}/${type}`
          if(dirlist[i].length==0){continue}
          let files=dirlist[i];
          let key=nums[i];//parseInt(Math.random()*len);
          try{
            let item=files[key];
            let imgPath=dirPath+'/'+item
            let x=await getX(imgPath);
            await trainer.train(x,i);
          }catch(err){
            console.log(err)
          }
          console.log(`${type}_${key} 第${num}张图片 `)
          num++
        }
      }
    }catch(err){
      console.log(err)
    }

    fs.writeFileSync('data.json', JSON.stringify(net.toJSON()));
}

const startTest = async (testPath) => {
    let net=await getNet();
    var trainer = new convnetjs.SGDTrainer(net, 
        { method:'adadelta', batch_size:4, l2_decay:0.0001 }
        );
    let num=0;
    let dirlist=[];
    for(var index=0;index<types.length;index++){
      let type=types[index];
      let dirPath=`./${testPath}/${type}`
      let files=fs.readdirSync(dirPath);
      dirlist.push(files)
    }
    try{
      let nums=new Array(dirlist.length);
      for(let n=0;n<40000;n++){
        for(let i=0;i<dirlist.length;i++){
          var len=dirlist[i].length;
          nums[i]=nums[i]>=0?nums[i]+1:0
          if(nums[i]>=len){
            nums[i]=0;
          }
          let type=types[i];
          let dirPath=`./${testPath}/${type}`
          if(dirlist[i].length==0){continue}
          let files=dirlist[i];
          let key=nums[i];//parseInt(Math.random()*len);
          let imgPath;
          try{
            let item=files[key];
            imgPath=dirPath+'/'+item
            let {vol,images}=await getX(imgPath);
            await trainer.train(vol,i);
          }catch(err){
            console.log(err)
          }
          console.log(`${type}_${key} 第${num}张图片 ${imgPath}`)
          num++
          if(num%400==399){
            console.log('===============保存数据=================')
            fs.writeFileSync('data.json', JSON.stringify(net.toJSON()));
          }
        }
      }
    }catch(err){
      console.log(err)
    }
    fs.writeFileSync('data.json', JSON.stringify(net.toJSON()));
    
}


const test=async (imgPath)=>{
  let net=await getNet();
  var prob =net.forward(await getX(imgPath));
  res=prob.w;
  let resList=Object.keys(res).sort(function(a,b){return res[b]-res[a]});
  for(var i=0;i<3;i++){
    let key=resList[i];
    let bl=parseInt(res[key]*100);
    console.log(`${bl}%可能是${types[key]}`)
  }
}



//start3()
startTest('test2')
//test('F:/AI/ConvNet/type/丑女/cover.jpg')
//['色情','全裸','露穴','露胸','美臀','美腿','性感','美女','丑女','推荐']
//startOne('test2',8)