// pages/article/article.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '正在获取数据',
    })
    wx.getStorage({
      key: 'article',
      success: function(res) {
        wx.hideLoading();
        if(res != undefined) {
          console.log(res)
          if(res.data != undefined) {
            that.setData({
              article: res.data
            })
          }
        }
      },
    })
  },

})