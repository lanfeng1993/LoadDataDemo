// pages/normalLoading/normalLoading.js
//获取应用实例
const app = getApp()

Page({
  data: {
    currentPage: 1,
    articles: [] // 存放所有的文章
  },
  onLoad: function () {
    var that = this

    // 加载页面初始化时需要的数据
    that.loadInitData();
  },

  /**
   * 滚动到某个view
   */
  scrollToView: function (e) {
    var that = this
    const dataset = e.currentTarget.dataset;
    var mark = dataset.mark
    console.log("scroll to :" + mark);
    that.setData({
      toView: mark
    })
  },


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

  /**
   * 喜欢被点击
   */
  likeTap: function(e) {
    var that = this;
    const dataset = e.currentTarget.dataset;

    // 获得被点击的文章下标
    var index = dataset.index; // 需要这个下标找到客户端的数据，便于向服务端请求回来后，更新客户端的信息，而不是刷新所有的数据
    var id = dataset.id; // 一般我们需要id向服务端去更新一些信息
    console.log("index:" + index)
    console.log("id:" + id)
    // 向服务端更新喜欢被点击的次数
    app.fakeRequest({
      data:{
        "id":id
      },
      success: function(res) {
        console.log("请求成功")
        console.log(res)
        // 更新客户端的数据，如果请求成功的话。
        var articles = that.data.articles;
        var article = articles[index]
        article.like_times += 1;
        that.setData({
          articles: articles
        })
      },
      fail: function(res) {
        console.log("请求失败")
        console.log(res)
      }
    })
  },

  /**
   * 分享被点击
   */
  shareTap: function(e) {
    var that = this;
    const dataset = e.currentTarget.dataset;

    // 获得被点击的文章下标
    var index = dataset.index;
    var id = dataset.id; // 一般我们需要id向服务端去更新一些信息
    console.log("index:" + index)
    console.log("id:"+id)

    // 向服务端更新分享被点击的次数
    app.fakeRequest({
      data: {
        "id": id
      },
      success: function (res) {
        console.log("请求成功")
        console.log(res)
        // 更新客户端的数据，如果请求成功的话。
        var articles = that.data.articles;
        var article = articles[index]
        article.share_times += 1;
        that.setData({
          articles: articles
        })
      },
      fail: function (res) {
        console.log("请求失败")
        console.log(res)
      }
    })
  },

  /**
   * 查看文章详情
   */
  viewDetail: function(e) {
    var that = this;
    const dataset = e.currentTarget.dataset;

    // 获得被点击的文章下标
    var index = dataset.index;
    var id = dataset.id; // 一般我们需要id向服务端去更新一些信息
    var articles = that.data.articles;
    var article = articles[index]
    /**
     * 将文章存起来，便于之后预览
     */
    wx.setStorageSync("article", article);
    /**
     * 去文章页面预览文章
     */
    wx.navigateTo({
      url: '/pages/article/article',
    })
  },
})
