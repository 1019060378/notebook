代码
1.js实现文件读取，监听input的change事件，获取文件size等信息备用
let input = document.getElementById('input');
// 创建一个对象存储文件数据
let files = {}
// 存放切片的数据
let chunkList = []
input.addEventListener('change', (e) => {
  files = e.target.files[0];
  // 调用创建切片
  chunkList = createChunk(files);
  // 调用上传切片
})
2.创建切片
// size是一个切片大小10MB
let size = 10*1024*1024;
function createChunk(file){ 
  const chunkList = [];
  let cur = 0;
  while(cur < file.size){ // file.size有给定值，就进行替换
    chunkList.push({
      file: file.slice(cur, cur + size)
    })
    cur += size;
  }
  return chunkList;
}
3.上传切片

背景：之前做智能分析助手，基于盘古大模型实现的，会涉及到用户上传自定义模型（1G以上），会遇到的问题：
1.传输时间比较长，网络断开之后，之前传输的没了
2.传输过程中网络波动
3.关机以后，想接着传，做不到

可以支持断点续传、断开重连重传、切片上传

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
