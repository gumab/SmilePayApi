/**
 * Created by guma on 2016. 12. 3..
 */
'use strict';

var configDB = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(configDB.mysql);
var UserT = require('../entity/UserT');


module.exports = {
  selectUser: function (loginId, callback) {
    connection.query('select USER_NO,USER_NM,LOGIN_ID,HP_1,HP_2,HP_3,REG_DT from USER where LOGIN_ID=' +
      mysql.escape(loginId), function (err, result) {
      if (err) {
        callback(err);
      } else {
        if (result && result.length > 0) {
          result = result[0];
          var user = new UserT(result.USER_NO,
            result.LOGIN_ID,
            result.USER_NM,
            result.HP_1,
            result.HP_2,
            result.HP_3,
            result.REG_DT)
          callback(null, user);
        } else {
          callback(null, null);
        }
      }
    });
  },

  deleteUserToken: function (userNo, token, callback) {
    connection.query('delete from USER_TOKEN where USER_NO=' + mysql.escape(userNo) +
      ' or DEVICE_TOKEN=' + mysql.escape(token), function (err, result) {
      callback(err)
    });
  },

  insertUserToken: function (userNo, token, callback) {
    var newRow = {
      'USER_NO': userNo,
      'DEVICE_TOKEN': token
    };

    connection.query('insert into USER_TOKEN set ?', newRow, function (err, result) {
      callback(err)
    })
  },

  selectUserToken: function (userNo, callback) {
    connection.query('select DEVICE_TOKEN from USER_TOKEN where USER_NO='+mysql.escape(userNo), function (err, result) {
      if(err){
        callback(err)
      } else {
        if(result && result.length>0){
          console.log(result[0]);
          callback(null, result[0].DEVICE_TOKEN);
        } else {
          callback('no token');
        }
      }
    });
  }
};