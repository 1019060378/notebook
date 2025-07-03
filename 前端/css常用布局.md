一、flexbox弹性布局  一维布局，适用于行列

父容器属性

display: flex 

flex-direction：row/colum/row-reverse/colum-reverse 主轴方向

justify-content：flex-start/center/space-between(两边贴边、中间等距)/space-around（子元素两侧间距相等） 主轴（默认水平）

align-items：stretch(默认拉伸填满)/flex-start/flex-end/center/baseline（基线对齐） 交叉轴（默认垂直）

子元素属性：

flex: 1（简写flex-grow放大 flex-shrink缩小 flex-basis 基准尺寸）

aglin-self: 子元素自身在交叉轴（默认垂直）的对齐方式

二、grid网格布局  二维布局，适用于行列网格

父 display: grid 

grid-template-columns/ grid-template-rows 定义列/行的尺寸

gap行列间距

justify-items： start/center/end 水平

align-items垂直

子 grid-column/ grid-row： 1/3(从1到3前，即1、2） 指定元素占列/行范围

三、浮动布局

float: left/right/none 

clear: left/right/both清除浮动影响

四、流式布局

display: block(块级）/inline（行内，无法设置宽高、margin、padding）/inline-block（行内块，可以设置）/none 

五、position定位布局

static（默认值） 、fixed（固定定位，相对浏览器视口）、relative（相对定位，相对于自身位置偏移）、absolute（绝对定位，参考最近的已定位祖先元素，position不为static的祖先，若没有参考浏览器窗口）sticky(粘性定位，滚动页面时固定的标题栏) 

结合偏移量 top、left相对于定位祖先元素、transform(translate(X,Y))相对于子元素自身

六、响应式布局 结合媒体查询（@media）和弹性布局，不同设备自动调整样式

max-width % em

常用 实现元素水平垂直居中的5种方法

①设置子元素line-height和父元素高度一样垂直居中，text-align: center水平居中

②display: flex 设置justify-content: center水平 align-items: center垂直

③display: grid设置 justify-items: center水平 align-items: center垂直

④position设置父容器relative，子元素absolute，设置偏移量top:50%; left:50%; tranform: translate(-50%,-50%);

⑤父元素display: table-cell；text-align: center;水平 vertical-aglin: middle 垂直 子元素 display: inline-block
