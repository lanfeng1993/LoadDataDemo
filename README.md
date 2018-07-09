### 微信小程序分页加载数据
> 一般小程序做分页加载数据，会做一些下拉加载更多、然后上拉刷新的操作。数据放在一个for循环里去加载，数据源是一个数组对象。在加载下一页数据时，将下一页的数据拼到当前数组后面。这样的确可以实现分页加载数据，但是如果数组中的对象都比较大，那么可能加载个几页数据，这个数组的大小就超过微信的限制了。可能会出现 `VM429:1 appDataChange 数据传输长度为 1203320 已经超过最大长度 1048576` 的异常。

下面分别使用普通的方式和另一种方法解决来处理数据分页加载的问题。完整项目可以在[这里](https://github.com/lanfeng1993/LoadDataDemo)下载到

#### 效果
![程序运行效果](https://upload-images.jianshu.io/upload_images/1782337-141fd5ada2a7903d.gif?imageMogr2/auto-orient/strip)

![普通方式加载](https://upload-images.jianshu.io/upload_images/1782337-26b2809df040f50d.gif?imageMogr2/auto-orient/strip)

![增强方式加载](https://upload-images.jianshu.io/upload_images/1782337-2823c155c08cb0fe.gif?imageMogr2/auto-orient/strip)


#### 说明
这个项目中用来分页的数据都是请求同一段json数据，这段json的数据结构是我自己拼的，实际在应用中，可以根据自己项目需求来分页请求数据。这段[数据](https://raw.githubusercontent.com/lanfeng1993/LoadDataDemo/master/data/data.json)的结构为一个data对象，data对象对应的是一个对象数组。数组中每个对象都是一篇文章的信息，嗯，就是高中语文书里都要背的那种。每页的数据是40条。一段json大小为570K。另外，这个项目是为了表现两种数据加载方式而设计的项目，并不是真实的项目。
```
{
	"data": [{
			"author": "作者",
			"dynasty": "作者朝代",
			"title": "文章题目",
			"article": "文章的具体内容",
			"useless_data": "没什么用的数据，纯粹为了增加数据长度，能更快查看到异常的抛出。",
			"share_times": 0,
			"like_times": 0,
			"id": "0"
		}]
}
```

#### 数据加载页面中的功能简介
不论是普通加载还是增强加载，在页面的onLoad过程中都先调用了一个 `loadInitData`的方法，用来获取第一页数据。

之后点击页面底部的加载更多，可以加载下一页数据，而加载下一页数据使用的是另一个方法`loadMoreData`。

另外页面中还可以点击爱心来增加喜欢次数`likeTap`、点击分享来增加分享次数`shareTap`，这是模拟向服务器请求更新数据。点击作者或文章题目来查看文章的详细信息`viewDetail`。


#### 普通方式分页加载数据
普通、简单的分页加载数据，是将要展示的数据放在一个数组中，通过一个for循环将数据渲染出来。在normalLoading.wxml中，普通加载的模版是这样的：
```
<scroll-view scroll-y="true" style = "height:100%;position: relative;" scroll-into-view="{{toView}}" scroll-with-animation = "true">
  <view id = "top"></view>
  <block wx:for="{{articles}}">
    <template is = "articles" data='{{item:item,index:index}}'/> <!--将item和index都传到模版里去，不然模版中获取不到index-->
  </block>
  <view id = "bottom"></view>
</scroll-view>
```

加载初始数据，推荐放在一个方法中请求，因为如果要做下拉刷新操作的话，只需要在出发下拉刷新操作后，再调用一下这个方法就可以了。
```
/**
   * 加载初始数据,有时候为了提升页面打开速度，会将所有数据合并到一个接口中返回，然后列表中的第二页数据开始，使用其它接口返回，即分页获取数据时，仅获取下一页的数据。（这里仅做示例，因为每一页数据都取一样的。在实际开发中可以考虑这样分开。）
   */
  loadInitData: function () {
    var that = this
    var currentPage = 0;
    var tips = "加载第" + (currentPage+1) + "页";
    console.log("load page " + (currentPage+1));
    wx.showLoading({
      title: tips,
    })
    // 请封装自己的网络请求接口，这里作为示例就直接使用了wx.request.
    wx.request({
      url: 'https://raw.githubusercontent.com/lanfeng1993/LoadDataDemo/master/data/data.json',
      data: {
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        var data = res.data; // 接口相应的json数据
        var articles = data.data; // 接口中的data对应了一个数组，这里取名为 articles
        console.log(articles);
        that.setData({
          articles: articles,
          currentPage: currentPage
        })
      }
    })

  },
```

请求下一页数据后，将本地的数组和新一页的数据拼接起来，让小程序去渲染页面。
```
/**
   * 加载下一页数据
   */
  loadMoreData: function () {
    var that = this
    var currentPage = that.data.currentPage; // 获取当前页码
    currentPage += 1; // 加载当前页面的下一页数据
    var tips = "加载第" + (currentPage+1) + "页";
    console.log("load page " + (currentPage+1));
    wx.showLoading({
      title: tips,
    })
    // 请封装自己的网络请求接口，这里作为示例就直接使用了wx.request.
    wx.request({
      url: 'https://raw.githubusercontent.com/lanfeng1993/LoadDataDemo/master/data/data.json',
      data: {
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        var data = res.data; // 接口相应的json数据
        var articles = data.data; // 接口中的data对应了一个数组，这里取名为 articles

        // 将新一页的数据添加到原数据后面
        var originArticles = that.data.articles;
        var newArticles = originArticles.concat(articles);
        console.log(newArticles);
        that.setData({
          articles: newArticles,
          currentPage: currentPage
        })
      }
    })
  },
```
如果项目中的列表数量是有限、且数据简单且量小的话，使用这种方式是没什么问题的。但是如果数据结构非常复杂，每个对象序列化成json后，对象很大，这种方式可能就不太适合了，数据请求过多甚至会导致小程序没有响应。

以本项目为例，数据加载到第六页，240条数据以后，再加载第七页的数据时，就会抛出`VM429:1 appDataChange 数据传输长度为 1203320 已经超过最大长度 1048576`的异常，因为that.setData({}})一次性set的数据太大了，导致数据无法设置。

#### 更好的分页加载数据的方式
相对于上面的加载方式，只需要在数据存储上做一些小的改变，就能实现加载更多的数据。这个方法就是再增加一个数组，用来存放数据。上一个方法是一个数组中存放所有的数据，数据量很容易就会变大。这个方法，将每一页请求过来的数据的引用放到一个新的数组dataArray内。dataArray[0]存放第一页数据，dataArray[1]存储第二页数据。请求新一页，都只需要更新一组数据，这样set的数据就不会超过微信小程序允许的长度。这个方法首先在loadInitData时，清空dataArray，防止新数据与原数据冲突。然后将这一页数据放到dataArray[0]中即可。
```
loadInitData: function () {
    var that = this
    var currentPage = 0; // 因为数组下标是从0开始的，所以这里用了0
    var tips = "加载第" + (currentPage+1) + "页";
    console.log("load page " + (currentPage + 1));
    wx.showLoading({
      title: tips,
    })
    // 刷新时，清空dataArray，防止新数据与原数据冲突
    that.setData({
      dataArray: []
    })
    // 请封装自己的网络请求接口，这里作为示例就直接使用了wx.request.
    wx.request({
      url: 'https://raw.githubusercontent.com/lanfeng1993/LoadDataDemo/master/data/data.json',
      data: {
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        var data = res.data; // 接口相应的json数据
        var articles = data.data; // 接口中的data对应了一个数组，这里取名为 articles
        var totalDataCount = articles.length;

        // console.log(articles);
        console.log("totalDataCount:"+totalDataCount);
        that.setData({
          ["dataArray["+currentPage+"]"]: articles,
          currentPage: currentPage,
          totalDataCount: totalDataCount
        })
      }
    })

  },
```

在页面的渲染上，与上面的方法也有一些小差别,使用了2个for循环来渲染数据。
```
  <scroll-view scroll-y="true" style = "height:100%;position: relative;" scroll-into-view="{{toView}}" scroll-with-animation = "true">
    <view id = "top"></view>
    <block wx:for="{{dataArray}}" wx:for-item="articles" wx:for-index="dataArrayIndex">
      <block wx:for="{{articles}}" wx:for-item="item" wx:key="{{item.id}}" wx:for-index="index">
        <template is = "articles" data='{{item:item,index:index,dataArrayIndex:dataArrayIndex}}'/> <!--将item和index都传到模版里去，不然模版中获取不到index-->
      </block>
    </block>
    <view id = "bottom"></view>
  </scroll-view>
```

加载下一页数据时，根据这页的下标，将这页的数据放到对应下标的dataArray中。
```
/**
   * 加载下一页数据
   */
  loadMoreData: function () {
    var that = this
    var currentPage = that.data.currentPage; // 获取当前页码
    currentPage += 1; // 加载当前页面的下一页数据
    var tips = "加载第" + (currentPage + 1) + "页";
    console.log("load page " + (currentPage + 1));
    wx.showLoading({
      title: tips,
    })
    // 请封装自己的网络请求接口，这里作为示例就直接使用了wx.request.
    wx.request({
      url: 'https://raw.githubusercontent.com/lanfeng1993/LoadDataDemo/master/data/data.json',
      data: {
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        var data = res.data; // 接口相应的json数据
        var articles = data.data; // 接口中的data对应了一个数组，这里取名为 articles

        // 计算当前共加载了多少条数据，来证明这种方式可以加载更多数据
        var totalDataCount = that.data.totalDataCount;
        totalDataCount = totalDataCount + articles.length;
        console.log("totalDataCount:" + totalDataCount);
        
        // 直接将新一页的数据添加到数组里
        that.setData({
          ["dataArray[" + currentPage + "]"]: articles,
          currentPage: currentPage,
          totalDataCount: totalDataCount
        })
      }
    })
  },
```
这种方式加载同样的数据可以加载到1400条，再往下加载会抛出另一个异常：```Uncaught Dom limit exceeded, please check if there's any mistake you've made.```这个问题是因为小程序在这个页面渲染的dom结构太多了，已经超过了上限，这个问题目前没有找到什么解决方法。毕竟数据也是不能被无限加载的，小程序内也没有app中列表的复用的能力。不过相对于第一种方法，只能加载240条数据来说，这种方法能加载1400条数据，也还是可以的，不过加载了1400条数据后，这个列表滚动起来也是非常卡了。

#### 总结
虽然实际项目中数据可能不会加载这么多条数据，但是因为这里每条数据对应的对象大小实际上不算特别大，实际项目中的数据可能会更复杂，更多。这时候，为了性能和速度，可以考虑和后端同学沟通，将数据封装成一个结构简单一些的数据传输对象，不会直接展示出来的数据结构就不要在列表中直接传输过来，再结合第二种方法加载数据，应该能应对大部分情况了。
