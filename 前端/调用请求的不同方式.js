1.原生的ajax  
get不需要设置请求头
const xsl = new XMLHttpRequest();  
xsl.open('GET', 'http://test.com/get?name=test&&id=1');    
xsl.send();  
xsl.onreadystatechange = function(){  
    if(xhr.readyState === XMLHttpRequest.Done && xhr.state === 200){  
        console.log(JSON.parse(xhr.responseText));  
    }  
}  
  
xsl.open('POST', 'http://test.com/post');  
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
xsl.send('name=test&&id=1');  
xsl.onreadystatechange = function(){  
    if(xhr.readyState === XMLHttpRequest.Done && xhr.state === 200){  
        console.log(JSON.parse(xhr.responseText));  
    }  
}  
  
2.axios请求  
npm install axios安装依赖，js文件里直接import引入  
async fuction request(){
    const ins = axios.create({
        baseURL: 'http://test.com'
    })
    const res = await ins.get('/get', {  
      params:{  
        name: 'test',  
        id: '1'  
      }  
    });  
    console.log(res.data)  
      
    //post方法不用写params，直接写  
    ins.post('/post', {  
        name: 'test',  
        id: '1'  
      }).then(data =>   
         console.log(data)  
      ).catch(error =>   
         console.log(error));  

    // 拦截器
    // 1.request 中断请求
    ins.interceptors.request.use(config => {
        // 处理鉴权等
        // 继续发送
        return config;
    })
    // 2.response 对响应内容预处理
    ins.interceptors.response.use(res => {
        // 预处理
        // 发送处理后的结果
        return res;
    })
}

3.Fetch API
fetch('http://test.com/get?name=test&&id=1').then(response => response.json()).then(res => {
    console.log(res);
})

fetch('http://test.com/post',{
    methods: 'POST',
    headers: {
        'Content-Type', 'application/json'
    },
    body: JSON.stringify({
        name: 'test',
        id: '1'
    })
}).then(response => response.json()).then(res => {
    console.log(res);
})
