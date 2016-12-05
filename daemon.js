/**
 * Created by guma on 2016. 12. 5..
 */
'use strict';

var config = require('./config');
var async = require('async');
var payDac = require('./dac/payDac');
var pushService = require('./service/pushService');
var enums = require('./entity/Enums');

function pushDaemon(callback) {
  async.waterfall([
    function (callback) {
      //대상건 조회
      payDac.selectPayRequest({ Status: enums.EnumPayRequestStatus.Wait }, callback);
    },
    function (payRequest, callback) {
      payDac.selectNow(function (err, nowTime) {
        if (err) {
          nowTime = new Date('2016-01-01');
        }
        callback(null, payRequest, new Date(nowTime));

      })
    },
    function (payRequest, nowTime, callback) {

      //유효 대상건 push
      var tasks = payRequest.map(function (item) {
        if (nowTime - new Date(item.RequestDate) > config.payRequestAvailableTime) {
          //유효시간 초과건 처리
          return function (callback) {
            item.Status = enums.EnumPayRequestStatus.PayFailed;
            item.Comment = '가능결제시간 초과';
            payDac.updatePayRequest(item, function (err) {
              callback(err);
            });
          }
        } else {
          return function (callback) {
            if (!item.IsPushSent) {
              pushService.sendPayRequestPush(item, function (err) {
                if(err){
                  callback(err);
                }else {
                  item.IsPushSent = true;
                  payDac.updatePayRequest(item, function (err) {
                    callback(err);
                  });
                }
              });
            } else {
              callback();
            }
          };
        }
      });
      async.parallel(tasks, function (err) {
        if (err) {
          console.log(err);
        }
        callback();
      });
    }
  ], function (err, result) {
    callback(err);
  });
}

function monitoringDaemon(callback) {
  callback();
}


function startDaemon() {
  async.parallel([
    pushDaemon,
    monitoringDaemon
  ], function (err) {
    if (err) {
      console.log(err);
    }
    setTimeout(startDaemon, config.daemonInterval);
  })
}

startDaemon();


//helper
