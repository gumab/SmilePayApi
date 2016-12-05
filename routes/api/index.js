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
          res.json(getApiResult(null, '200'));
        } else {
          res.json(getApiResult(partnerInfo));
        }
      }
    );
  } else {
    res.json(null);
  }
});

router.get('/findbeacon', function (req, res) {
  var userNo = req.query.userno;
  var major = req.query.major;
  var minor = req.query.minor;
  var distance = req.query.distance;

  if (!!userNo && !!major && !!minor && !!distance)
    async.waterfall([
      function (callback) {
        beaconDac.selectBeaconNoByCode(major, minor, callback);
      },
      function (beaconNo, callback) {
        beaconDac.insertActiveBeacon(userNo, beaconNo, distance, callback);
      }
    ], function (err) {
      if (err) {
        res.json(getApiResult(null, '100'));
      } else {
        res.json(getApiResult());
      }
    });
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
  }
});

router.get('/payrequest', function (req, res) {
  var partnerNo = req.query.partnerno;
  var targetUserNo = req.query.targetno;
  var reqMoney = req.query.money;
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
        res.json(getApiResult({ reqSeq: result }));
      }
    });
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
