//app.js
App({
  onLaunch: function () {
    
  },
  globalData: {
    
  },
  /**
   * 可能是自己封装的请求接口
   */
  fakeRequest: function (params) {
    console.log("调用接口")
    console.log("参数")
    console.log(params.data)
    var res = { isSuccess: true }; // 假设请求都会成功
    //var res = { isSuccess: false, reason: "XXError" };
    if(res.isSuccess) {
      if (params.success) {
        params.success(res);
      }
    } else {
      if (params.fail) {
        params.fail(res);
      }
    }
    
  },
})