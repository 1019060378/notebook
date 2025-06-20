代码
1.js实现文件读取，监听input的change事件，获取文件size等信息备用
import axios from 'axios';
const input = document.getElementById('input');
const upload = document.getElementById('upload');
// 创建一个对象存储文件数据
let files = null;
// 存放切片的数据
let chunkList = [];
// 一个切片大小10MB，单位是Byte
const CHUNK_SIZE = 10 * 1024 *1024;
// 最大并发任务为5个
const MAX_CONCURRENT_UPLOADS = 5;
// 监听文件选择
input.addEventListener('change', (e) => {
  files = e.target.files[0];
  // 调用创建切片
  chunkList = createChunk(files);
})
2.创建切片
function createChunk(file){ 
  const chunkList = [];
  let cur = 0;
  while(cur < file.size){ // file.size有给定值，就进行替换，单位需要统一
    chunkList.push({
      file: file.slice(cur, cur + CHUNK_SIZE)
    })
    cur += CHUNK_SIZE;
  }
  return chunkList;
}
3.上传切片（并发控制、断点上传）,添加逻辑过滤掉已上传的切片
async function uploadFile(list){
  return new Promise(async(resolve,reject) => {
  const fileKey = generateFileKey(files);
  const total = list.length;
  // 请求服务端确认哪些分片已经上传过了
  const serverUploaded = await checkExistingChunks(fileKey, total);
  // 获取localstorage本地存储的已上传切片
  const localUploaded = getUploadedChunks(fileKey);
  // 合并去重
  const uploadedSet = new Set([...serverUploaded, ...localUploaded]);
  // 过滤出需要上传的切片
  const needUploadList = list.filter((_, index) => !uploadedSet.has(index));
  if(needUploadList.length === 0){
    alert('文件已全部上传完成');
    mergeChunks(fileKey);
    return;
  }
  console.log(`共上传${total}个切片，已上传${uploadedSet.size}，还需要上传${needUploadList.length}个切片`)
    
  let activeTask = 0;
  let succeedTask = 0;
  let failedTask = 0;
  let currentIndex = 0;
  processTask();
  // 执行并发任务
  function processTask(){
    while(activeTask < MAX_CONCURRENT_UPLOADS && currentIndex < list.length){
    const chunk = list[currentIndex];
    const index = chunk.index;
      // 跳过已上传的切片
    if(uploadedSet.has(index)){
      currentIndex ++;
      succeedTask ++;
      continue;
    }
    activeTask++;
    currentIndex++;

    const maxRetries = 3; // 最大重试次数
    retryUpload(); // 开始上传或重试
    async function retryUpload(){
      try {
        await uploadChunk(chunk);
        succeedTask ++;
        setUploadedChunk(fileKey, index); // 标记为已上传
        localStorage.removeItem(`chunkRetry-${fileKey}-${index}`); // 成功后清除重传记录
      } catch(err){
        const currentRetry = getChunkRetry(fileKey, index);
        if(currentRetry < maxRetries){
          console.warn(`第${index}切片上传失败，正在尝试第${currentRetry+1}次重试`);
          setChunkRetry(fileKey, index, currentRetry+1);
          setTimeout(retryUpload, 2000); // 2秒后重试
        }else{
           console.warn(`第${index}切片上传失败，已达到最大重试次数`);
           failedTask ++;
        }
      } finally {
       activeTask --;
       if(succeedTask + failedTask === list.length){
       // 所有请求成功完成
      console.log('所有切片上传成功')
      // 调用合并接口，通知服务端合并切片
       mergeChunks(fileKey);
     }else{
       processTask();
     }
    }
  }
  }
// 上传单个分片
async function uploadChunk(chunk){
    const formData = new FormData();//创建表单类型数据
    formData.append('file', chunk.file);
    formData.append('fileName', chunk.fileName);
    formData.append('chunkName', chunk.chunkName);
try{
  await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // 让 axios 自动设置 boundary
      }
});
  console.log(`第${chunk.index}切片上传成功`)
  return true;
}
 catch(error){
  console.log(`第${chunk.index}切片上传失败`)
  return false;
 }
}
}
})
}

function mergeChunks(fileKey){
  axios.post('/api/merge', {
    fileName: files.name,
    total: chunkList.length
  }).then(() => {
    console.log('合并成功');
    clearUploadedChunks(fileKey); // 清除本地记录
    clearChunkRetries(fileKey); // 清除重试记录
  }).catch(error => {
    console.log('文件合并失败', error);
  })
}

upload.addEventListener('click', async() => {
  const uploadList = chunkList.map(({file}, index) => ({
    file,
    fileName: file.name,
    chunkName: `${file.name}_${index}`,
    size: file.size,
    index,
    retryCount: 0 //记录切片已重试次数
  }));
  await uploadFile(uploadList);
});

// 添加断点续传
// 1.使用文件名+size做简单标识（生产环境建议用MD5）
function generateFileKey(file){
  return `${file.name}-${file.size}`;
}
// 2.使用localstorage记录已上传的切片索引
function getUploadedChunks(fileKey){
  const saved = localStorage.getItem(`uploadedChunks-${fileKey}`);
  return saved ? JSON.parse(saved) : []
}
function setUploadedChunk(fileKey, index){
  const key = `uploadedChunks-${fileKey}`;
  const list = getUploadedChunks(fileKey);
  if(!list.includes(index)){
    list.push(index);
    localStorage.setItem(key, JSON.stringify(list));
  }
}
function clearUploadedChunks(fileKey){
  localStorage.removeItem(`uploadedChunks-${fileKey}`);
}
// 3.新增服务端接口，获取已上传的切片列表
  async function checkExistingChunks(fileKey,total){
    try{
      const res = await axios.post('/api/check',{
        fileName: fileKey,
        total
      });
      return res.data.uploaded || []; // 返回已上传的切片索引
    }catch(error){
      console.warn(error);
      return [];
    }
  }
  // 获取本地记录的重试次数
  function getChunkRetry(fileKey, index){
    const saved = localStorage.getItem(`chunkRetry-${fileKey}-${index}`);
    return parseInt(saved, 10) || 0;
  }
  // 设置重试次数
  function setChunkRetry(fileKey, index, count){
    localStorage.setItem(`chunkRetry-${fileKey}-${index}`, count);
  }
  // 清除重试记录
  function clearChunkRetries(fileKey){
    for(let i = 0; i< chunkList.length; i++){
      localStorage.removeItem(`chunkRetry-${fileKey}-${i}`);
    }
  }
  
背景：之前做智能分析助手，基于盘古大模型实现的，会涉及到用户上传自定义模型（1G以上），会遇到的问题：
1.传输时间比较长，网络断开之后，之前传输的没了
2.传输过程中网络波动
3.关机以后，想接着传，做不到

可以支持断点续传(文件唯一标识 name+size，使用loacalStorage保存上传进度，通过服务端接口获取已上传切片，只上传未上传或失败的切片，上传完成后清理缓存)、
  断开重连重传（每个切片上传失败时自动重试N次，支持断网恢复后自动继续上传未完成的切片，使用localStorage记录上传状态和重试次数）、切片上传、支持多文件上传

方案：
-前端切片 chunk 2GB(2*1024 = 2048MB),每片10MB,总片数 const size = 2048 / 10
-将切片传递给后端，切的片要取名：hash作为id，包含顺序index
-后端组合切片

优化：
-主进程做卡顿，web-worker开辟多线程处理前端切片，处理完交给主进程，发送给后端
-前端切完后，将blob或者对应文件二进制内容存储到indexDB里（本地存储），下次用户进来以后嗅探一下这个indexDB里面是否存在未完成上传的切片，如果有就尝试继续上传
-引入websocket，可以做实时通知、和请求序列的控制 wss

整体设计：大文件上传器
-组件设计
-props、事件、状态
-上传方式：支持拖拽上传、多文件选择
-通用化不同文件的上传（定义上传的统一协议）
