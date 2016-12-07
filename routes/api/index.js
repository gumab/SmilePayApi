/**
 * Created by guma on 2016. 12. 3..
 */

var config = require('../../config');
var router = require('express').Router();
var userDac = require('../../dac/userDac');
var partnerDac = require('../../dac/partnerDac');
var beaconDac = require('../../dac/beaconDac');
var payDac = require('../../dac/payDac');
var async = require('async');
var enums = require('../../entity/Enums');

router.get('/test', function (req, res) {
  res.json({ value: 'test' });
});

router.get('/user', function (req, res) {
  var id = req.query.id;
  if (!!id) {
    userDac.selectUser(id, function (err, data) {
      if (!err) {
        res.json(getApiResult(data));
      } else {
        res.json(getApiResult(err, '900'));
      }
    })
  } else {
    res.json(getApiResult(null, '200'));
  }
});

router.get('/partner', function (req, res) {
  var id = req.query.id;
  if (!!id) {
    async.waterfall([
        function (callback) {
          partnerDac.selectPartner(id, callback);
        },
        function (partnerInfo, callback) {
          if (partnerInfo) {
            beaconDac.selectBeacon(partnerInfo.PartnerNo, function (err, beaconInfo) {
              if (err || !beaconInfo) {
                callback(err);
              } else {
                partnerInfo.beacon = beaconInfo;
                callback(null, partnerInfo);
              }
            });
          } else {
            callback('no partner');
          }
        },
        function (partnerInfo, callback) {
          beaconDac.selectUUID(function (err, uuid) {
            if (err) {
              callback(err);
            } else {
              partnerInfo.beacon.UUID = uuid;
              callback(null, partnerInfo);
            }
          })
        }
      ],
      function (err, partnerInfo) {
        if (err) {
          res.json(getApiResult(null, '900'));
        } else {
          res.json(getApiResult(partnerInfo));
        }
      }
    );
  } else {
    res.json(getApiResult(null, '200'));
  }
});

router.get('/findbeacon', function (req, res) {
  var userNo = req.query.userno;
  var major = req.query.major;
  var minor = req.query.minor;
  var distance = req.query.distance;

  if (!!userNo && !!major && !!minor && !!distance) {
    async.waterfall([
      function (callback) {
        beaconDac.selectBeaconNoByCode(major, minor, callback);
      },
      function (beaconNo, callback) {
        beaconDac.insertActiveBeacon(userNo, beaconNo, distance, callback);
      }
    ], function (err) {
      if (err) {
        res.json(getApiResult(null, '900'));
      } else {
        res.json(getApiResult());
      }
    });
  } else {
    res.json(getApiResult(null, '200'));
  }
});

router.get('/nearuser', function (req, res) {
  var partnerNo = req.query.partnerno;
  var interval = req.query.interval || 60;
  if (!!partnerNo) {
    beaconDac.selectNearUser(partnerNo, interval, function (err, data) {
      if (err) {
        res.json(getApiResult(err, '900'));
      } else {
        res.json(getApiResult(data));
      }
    });
  } else {
    res.json(getApiResult(null, '200'));
  }
});

router.get('/payrequest', function (req, res) {
  var partnerNo = req.query.partnerno;
  var targetUserNo = req.query.targetno;
  var reqMoney = req.query.money;
  var userNo = req.query.userno;
  var requestSeq = req.query.seq;
  if (!!partnerNo && !!targetUserNo && !!reqMoney) {
    async.waterfall([
      function (callback) {
        payDac.selectPayRequest({
          TargetUserNo: targetUserNo,
          Status: enums.EnumPayRequestStatus.Wait
        }, function (err, result) {
          if (err || (result && result.length > 0)) {
            callback({ ErrCode: '300', Message: 'duplicate request' });
          } else {
            callback();
          }
        })
      },
      function (callback) {
        payDac.insertPayRequest(partnerNo, targetUserNo, reqMoney, function (err, seq) {
          callback(err, seq);
        });
      }
    ], function (err, result) {
      if (err) {
        res.json(getApiResult(err, '900'));
      } else {
        res.json(getApiResult({ RequestSeq: result }));
      }
    });
  } else if (!!userNo) {
    payDac.selectPayRequest({
      TargetUserNo: userNo,
      Status: enums.EnumPayRequestStatus.Wait
    }, function (err, data) {
      if (err) {
        res.json(getApiResult(err, '900'));
      } else {
        if (data && data.length === 1) {
          res.json(getApiResult(data[0]));
        } else {
          res.json((getApiResult(null, '100')));
        }
      }
    });
  } else if (!!requestSeq) {
    payDac.selectPayRequest({
      RequestSeq: requestSeq
    }, function (err, data) {
      if (!err && data && data.length === 1) {
        res.json(getApiResult(data[0]));
      } else {
        res.json(getApiResult(err, '900'));
      }
    })
  } else {
    res.json(getApiResult(null, '200'));
  }
});

router.get('/setpay', function (req, res) {
  var requestSeq = req.query.seq;
  var isPay = req.query.ispay;
  var isPartner = req.query.ispartner;
  if (!!requestSeq) {
    async.waterfall([
      function (callback) {
        payDac.selectPayRequest({
          RequestSeq: requestSeq,
          Status: enums.EnumPayRequestStatus.Wait
        }, function (err, data) {
          if (err || (data && data.length != 1)) {
            callback('not available to pay');
          } else {
            callback();
          }
        })
      }, function (callback) {
        if (!!isPay) {
          payDac.updatePayRequest({
            RequestSeq: requestSeq,
            Status: enums.EnumPayRequestStatus.PayComplete,
            Comment: '결제성공'
          }, callback);
        } else {
          if (!!isPartner) {
            payDac.updatePayRequest({
              RequestSeq: requestSeq,
              Status: enums.EnumPayRequestStatus.CancelPartner,
              Comment: '가맹점 결제요청 취소'
            }, callback);
          } else {
            payDac.updatePayRequest({
              RequestSeq: requestSeq,
              Status: enums.EnumPayRequestStatus.CancelUser,
              Comment: '사용자 결제 취소'
            }, callback);
          }
        }
      }
    ], function (err) {
      if (err) {
        res.json(getApiResult(err, '900'));
      } else {
        res.json(getApiResult({ RequestSeq: requestSeq }));
      }
    })


  } else {
    res.json(getApiResult(null, '900'));
  }
});

router.get('/setpushtoken', function (req, res) {
  var userNo = req.query.userno;
  var token = req.query.token;
  if(!!userNo){
    async.waterfall([
      function (callback) {
        userDac.deleteUserToken(userNo, token, callback)
      },
      function (callback) {
        if(!!token) {
          userDac.insertUserToken(userNo, token, callback)
        } else {
          callback()
        }
      }
    ], function (err) {
      if (err) {
        res.json(getApiResult(err, '900'));
      } else {
        res.json(getApiResult());
      }
    })
  } else {
    res.json(getApiResult(null, '900'))
  }

});

function getApiResult(data, code) {
  var result = {
    ResultCode: code ? code : '000',
    Data: data
  };
  if (data && data.ErrCode) {
    result.ResultCode = data.ErrCode;
    result.Data = data.Message;
  }
  return result
}

module.exports = router;
