/**
 * Created by guma on 2016. 12. 4..
 */
'use strict';

var configDB = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(configDB.mysql);
var BeaconT = require('../entity/BeaconT');


module.exports = {
  selectUUID: function (callback) {
    connection.query('select UUID from BEACON_UUID limit 1', function (err, result) {
      if (err || !result || result.length != 1) {
        callback('no uuid');
      } else {
        callback(null, result[0].UUID)
      }
    })
  },

  selectBeacon: function (partnerNo, callback) {
    connection.query('select b.PARTNER_NO, a.MAJOR, a.MINOR from BEACON a ' +
      'join PARTNER_BEACON b on a.BEACON_NO=b.BEACON_NO ' +
      'where b.PARTNER_NO = ' + mysql.escape(partnerNo), function (err, result) {
      if (err) {
        callback(err);
      } else {
        if (result && result.length > 0) {
          result = result[0];
          var beacon = new BeaconT(result.PARTNER_NO,
            result.MAJOR,
            result.MINOR
          )
          callback(null, beacon);
        } else {
          callback(null, null);
        }
      }
    })
  },

  selectBeaconNoByCode: function (major, minor, callback) {
    connection.query('select BEACON_NO from BEACON where MAJOR=' + mysql.escape(major)
      + ' and MINOR=' + mysql.escape(minor), function (err, result) {
      if (err) {
        callback(err);
      } else {
        if (result && result.length > 0) {
          result = result[0];
          callback(null, result.BEACON_NO);
        } else {
          callback('no result');
        }
      }
    })
  },

  insertActiveBeacon: function (userNo, beaconNo, distance, callback) {
    var newRow = {
      'USER_NO': userNo,
      'BEACON_NO': beaconNo,
      'DISTANCE': distance
    };

    connection.query('insert into ACTIVE_BEACON set ?', newRow, function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    })
  },

  selectNearUser: function (partnerNo, interval, callback) {
    connection.query(
      'select c.USER_NO, c.USER_NM, c.HP_1, c.HP_3, a.DISTANCE from ACTIVE_BEACON a ' +
      'join (select USER_NO, MAX(REG_DT) as REG_DT from ACTIVE_BEACON ab ' +
      'join PARTNER_BEACON pb on ab.BEACON_NO=pb.BEACON_NO ' +
      'where pb.PARTNER_NO=' + mysql.escape(partnerNo) + ' ' +
      'and ab.REG_DT > DATE_SUB(NOW(), INTERVAL ' + mysql.escape(interval) + ' SECOND)' +
      'group by `USER_NO`) b on a.USER_NO=b.USER_NO and a.REG_DT=b.REG_DT ' +
      'join USER c on a.USER_NO=c.USER_NO ' +
      'order by a.DISTANCE asc', function (err, result) {
        if (err) {
          callback(err);
        } else {
          var clientResult = result.map(function (item) {
            return {
              UserNo: item.USER_NO,
              UserName: item.USER_NM,
              MaskHpNo: item.HP_1 + '-****-' + item.HP_3,
              Distance: item.DISTANCE
            };
          });
          callback(null, clientResult);
        }
      }
    );
  }
}