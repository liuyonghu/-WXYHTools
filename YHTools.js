const config = require("../config.js");

class YHTools {
        // struct func

        constructor(options) {
                // this.options = options;
        }
        //-----------------------
        getFixedNumber(options) {
                var value = options.value,
                        length = options.length;
                var aNumber = new Number(value);
                var aNumberString = aNumber.toFixed(length);
                return aNumberString;
        }
        // check phone number
        chenckPhone(options) {
                var sMobile = options.phone;

                if (!(/^1[0-9][0-9]\d{8}$/.test(sMobile))) {
                        // // console.log(typeof(sMobile.length) + "  " + typeof(11));
                        return false;
                } else {
                        return true;
                }
        }
        // storge
        saveLocalData(options, asyncBol) {
                if (asyncBol) {
                        try {
                                for (var key in options) {
                                        wx.setStorage({
                                                key: key,
                                                data: options[key],
                                        });
                                }
                                return true;
                        } catch (err) {
                                return false;
                        }

                } else {
                        try {
                                for (var key in options) {
                                        wx.setStorageSync(key, options[key]);
                                }
                                return true;
                        } catch (err) {
                                return false;
                        }
                }
                

        }

        removeLocalData(options, asyncBol) {
                if (asyncBol){
                        try {
                                // // console.log(" removeLocalData(options) { = "+ options);
                                wx.removeStorage({
                                        key: 'options',
                                        success: function(res) {},
                                });
                                return true;
                        } catch (err) {
                                return false;
                        }

                }else{
                        try {
                                // // console.log(" removeLocalData(options) { = "+ options);
                                wx.removeStorageSync(options);
                                return true;
                        } catch (err) {
                                return false;
                        }
                }
              
        }

        getLocalData(options) {

                try {
                        var value = wx.getStorageSync(options);
                        if (value && value != "") {
                                return value;
                        } else {
                                return false;
                        }

                } catch (err) {
                        return false;
                }
        }

        delay(options) {
                setTimeout(options.func, options.time);
        }

        systemInfo() {
                var systemInfo = this.getLocalData("systemInfo");
                if (!systemInfo) {
                        systemInfo = wx.getSystemInfoSync();
                        this.saveLocalData({
                                "systemInfo": systemInfo
                        });
                }
                return systemInfo;
        }
        refreshLoginCode() { //待优化
                var that = this;
                // // console.log("tool refreshLoginCode()  = " + JSON.stringify(that.getLocalData("code")));
                // return;
                // 登录

                wx.login({
                        success: function(data) {
                                // // console.log('data ===== ' + JSON.stringify(data)); 
                                var code = data.code;
                                var now = new Date();
                                var codeTime = now.getTime();

                                that.saveLocalData({
                                        "code": code,
                                        "codeTime": codeTime,
                                        "appId": config.Config.appId,
                                        "appSecret": config.Config.appSecret
                                });

                                console.log("code  = " + that.getLocalData("code"));
                        },
                        fail: function(fail) {
                                console.log("fail  = " + JSON.stringify(fail));

                        }
                })

                return that.getLocalData("code");
        }

        netErr(msg) {

                wx.hideLoading();
                wx.showModal({
                        title: '提示',
                        content: msg || '请检查网络后重试！',
                        showCancel: false,
                        confirmColor: "#287fe8"
                })
        }

        initLocalData() {

                var initLocalData = config.Config.initLocalData;
                var hasInitLocalData = initLocalData.every(this.removeLocalData);
                return hasInitLocalData;
        }

        checkRes(options) {
                // // console.log("checkRes = "+JSON.stringify(options));
                var httpCode = options.statusCode;
                if (httpCode == "401") {
                        wx.showModal({
                                title: '提示',
                                content: '登录状态失效，请重新登录！',
                                showCancel: false,
                                confirmColor: "#287fe8",
                                success: function() {
                                        wx.clearStorageSync();
                                        wx.reLaunch({
                                                url: "/pages/SMSCodePage/SMSCodePage",
                                        })
                                }
                        })
                        return false;
                } else {
                        return true;
                }
        }
        // 日期补零
        checkDateFormatter(dateNum) {
                return (dateNum > 9 ? dateNum : "0" + dateNum);
        }
        // 获得日期
        getDateStr(date, fullMonth) {
                var monthonFlag = fullMonth ? 0 : 1;
                // console.log("monthonFlag = " + monthonFlag);
                return date.getFullYear() + "-" + this.checkDateFormatter(date.getMonth() + monthonFlag) + "-" + this.checkDateFormatter(date.getDate()) + " " + this.checkDateFormatter(date.getHours()) + ":" + this.checkDateFormatter(date.getMinutes());
        }
        // 显示提示框
        showModal(options) {
                // 无取消键、无动作的提示
                var onlyTips = options.onlyTips;
                if (onlyTips) {
                        wx.showModal({
                                title: options.title,
                                content: options.content,
                                showCancel: false,
                                confirmColor: "#287fe8",
                                success: function(res) {},
                                fail: function(res) {}
                        })
                        return;
                }

                wx.showModal({
                        title: options.title,
                        content: options.content,
                        showCancel: options.showCancel,
                        confirmColor: "#287fe8",
                        success: function(res) {
                                if (options.success) {
                                        options.success(res)
                                }

                        },
                        fail: function(res) {
                                if (options.fail) {
                                        options.fail(res)
                                }
                        }
                })
        }



        returnFloatNum(num) {
                var strArr = (typeof(num) + "").toUpperCase() == "string" ? num.split(".") : num.toString().split(".");
                var strVal = strArr.pop();
                return strVal.length;

        }

        hasEmojiCharacter(substring) {
                for (var i = 0; i < substring.length; i++) {
                        var hs = substring.charCodeAt(i);
                        if (0xd800 <= hs && hs <= 0xdbff) {
                                if (substring.length > 1) {
                                        var ls = substring.charCodeAt(i + 1);
                                        var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
                                        if (0x1d000 <= uc && uc <= 0x1f77f) {
                                                return true;
                                        }
                                }
                        } else if (substring.length > 1) {
                                var ls = substring.charCodeAt(i + 1);
                                if (ls == 0x20e3) {
                                        return true;
                                }
                        } else {
                                if (0x2100 <= hs && hs <= 0x27ff) {
                                        return true;
                                } else if (0x2B05 <= hs && hs <= 0x2b07) {
                                        return true;
                                } else if (0x2934 <= hs && hs <= 0x2935) {
                                        return true;
                                } else if (0x3297 <= hs && hs <= 0x3299) {
                                        return true;
                                } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030 ||
                                        hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b ||
                                        hs == 0x2b50) {
                                        return true;
                                }
                        }
                }
        }


        checkAppVersion(callBack) {
                // console.log("--- checkAppVersion--- ");
                const that = this;
                wx.showLoading({
                        title: '正在检查版本',
                        mask: true
                })
                const updateManager = wx.getUpdateManager();
                updateManager.onCheckForUpdate(function(res) {
                        // 请求完新版本信息的回调
                        if (res.hasUpdate) {
                                // console.log("--- hasUpdate  checkAppVersion--- ");
                                wx.hideLoading();
                                updateManager.onUpdateReady(function() {
                                        wx.hideLoading()
                                        wx.showToast({
                                                title: '更新完成，即将重启',
                                                duration: "1000",
                                                icon: "success",
                                                mask: true,
                                                complete: function() {
                                                        if (callBack) {
                                                                callBack();
                                                        }
                                                        updateManager.applyUpdate();
                                                }

                                        })

                                });

                                updateManager.onUpdateFailed(function() {
                                        wx.hideLoading();
                                        wx.showModal({
                                                title: '更新失败',
                                                content: '请检查网络！',
                                                confirmColor: "#287fe8",
                                                showCancel: false,
                                                success: function(res) {
                                                        if (res.confirm) {
                                                                //     wx.reLaunch({
                                                                //         url: "/pages/SMSCodePage/SMSCodePage",
                                                                //     })

                                                        }
                                                }
                                        })
                                });
                        } else {

                                wx.hideLoading();
                                const typeValue = typeof(callBack);
                                const upperCase = typeValue.toUpperCase();
                                // console.log("--- else  checkAppVersion--- " + upperCase);
                                // console.log("checkAppVersion  -  callBack");
                                if (callBack && upperCase == "FUNCTION") {
                                        callBack();

                                } else if (callBack && upperCase == "STRING") {
                                        // console.log("--- showToast  checkAppVersion--- ");
                                        that.showModal({
                                                title: '提示',
                                                content: callBack,
                                                showCancel: false,
                                        })
                                }

                        }

                })
        }

        checkSDKVersion() {
                const that = this;
                const res = wx.getSystemInfoSync();
                // console.log("res = " + JSON.stringify(res));
                const sdkVersion = res.SDKVersion;
                const configVersion = config.Config.SDKVersion;
                if (sdkVersion < configVersion) {
                        // console.log("update wx !");
                        that.showModal({
                                title: '提示',
                                content: '微信版本过低，请更新微信！',
                                showCancel: false
                        })
                        return false;
                } else {
                        return true;
                        // console.log(" wx ok!");  
                }

        }

        // c s k x app tool func
        getStartEndPointFunc(peice) {
                var ftGetOnLocationFtSiteId = peice.ftGetOnLocationFtSiteId || peice.getOnLocationFtSiteId;
                var ftGetOffLocationFtSiteId = peice.ftGetOffLocationFtSiteId || peice.getOffLocationFtSiteId;
                var ftReSitesOfLine = peice.ftReSitesOfLine || peice.siteIdList;

                ftReSitesOfLine.forEach(function(point, index) {
                        if (point.siteId == ftGetOnLocationFtSiteId) {
                                peice.realyMemberStartPoint = point;
                        }

                        if (point.siteId == ftGetOffLocationFtSiteId) {
                                peice.realyMemberEndPoint = point;
                        }
                });
                return peice;
        }

        findObjFromArrByProperty(arrary, property, propertyBol) {

                if (propertyBol) {
                        var key;
                        for (var i in property) {
                                key = i;
                        }

                        for (var i = 0; i < arrary.length; i++) {
                                let item = arrary[i];
                                if (item[key] == property[key]) {
                                        return item;
                                }
                        }
                } else {
                        for (var i = 0; i < arrary.length; i++) {
                                let item = arrary[i];
                                if (item == property) {
                                        return item;
                                }
                        }
                }

        }


        saveCurrentPageToStack() {
                let [...pageStack] = getCurrentPages();
                this.saveLocalData({
                        "ppage": pageStack.pop().route
                });
        }

        getStackPage() {
                return this.getLocalData("ppage");
        }

        getUrlParsByObj(obj) {
                var urPar = '';
                for (var key in obj) {
                        // console.log(key);
                        urPar = urPar + key + "=" + obj[key] + "&"
                }
                return urPar.substr(0, urPar.length - 1);
        }

        cUrlToJsonStr(urlC) {
                let urlComponents = decodeURIComponent(urlC).split("&");
                var obj = {};
                urlComponents.forEach(function(item) {
                        let itemComponents = item.split("=");
                        obj[itemComponents[0]] = itemComponents[1];
                });
                return obj;
        }
}

module.exports = YHTools;