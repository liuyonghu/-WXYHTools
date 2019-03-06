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
        saveLocalData(options) {
                try {
                        for (var key in options) {
                                wx.setStorageSync(key, options[key]);
                        }
                        return true;
                } catch (err) {
                        return false;
                }

        }

        removeLocalData(options) {
                try {
                        // // console.log(" removeLocalData(options) { = "+ options);
                        wx.removeStorageSync(options);
                        return true;
                } catch (err) {
                        return false;
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

        netErr() {
                wx.hideLoading();
                wx.showModal({
                        title: '提示',
                        content: '请检查网络后重试！',
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


        // 获取共多少浮点位
        returnFloatNum(num) {
                var strArr = (typeof(num) + "").toUpperCase() == "string" ? num.split(".") : num.toString().split(".");
                var strVal = strArr.pop();
                return strVal.length;

        }

        // has emoji character
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

}

module.exports = YHTools;