/**
 * Created by guma on 2016. 12. 4..
 */
'use strict';

var configDB = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(configDB.mysql);


module.exports = {

  insertPayRequest: function (partnerNo, targetUserNo, reqMoney, callback) {
    var newRow = {
      'PARTNER_NO': partnerNo,
      'TARGET_USER_NO': targetUserNo,
      'REQ_MONEY': reqMoney
    };
    connection.query('insert into PAY_REQUEST set ?', newRow, function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback(null, result.insertId);
      }
    })
  },

  selectPayRequest: function (entity, callback) {
    var queryString = 'select a.SEQ, a.PARTNER_NO, b.PARTNER_NM, a.TARGET_USER_NO, ' +
      'a.REQ_MONEY, a.STATUS, a.PUSH_SENT_YN, a.COMMENT, a.REQ_DT ' +
      'from PAY_REQUEST a join PARTNER b on a.PARTNER_NO=b.PARTNER_NO ';

    if (entity) {
      queryString += 'where ';
      var query = [];
      if (entity.RequestSeq) {
        query.push('a.SEQ=' + entity.RequestSeq);
      }
      if (entity.PartnerNo) {
        query.push('a.PARTNER_NO=' + entity.PartnerNo);
      }
      if (entity.TargetUserNo) {
        query.push('a.TARGET_USER_NO=' + entity.TargetUserNo);
      }
      if (entity.Status) {
        query.push('a.STATUS=\'' + entity.Status + '\'');
      }
      queryString += query.join(' and ');
    }

    connection.query(queryString, function (err, result) {
      if (err) {
        callback(err);
      } else {
        var clientResult = result.map(function (item) {
          return {
            RequestSeq: item.SEQ,
            PartnerNo: item.PARTNER_NO,
            PartnerName: item.PARTNER_NM,
            TargetUserNo: item.TARGET_USER_NO,
            RequestMoney: item.REQ_MONEY,
            Status: item.STATUS,
            IsPushSent: ((item.PUSH_SENT_YN && item.PUSH_SENT_YN === 'Y') ? true : false),
            Comment: item.COMMENT,
            RequestDate: new Date(item.REQ_DT)
          }
        })
        callback(null, clientResult)
      }
    })
  },

  updatePayRequest: function (entity, callback) {

    if (entity && entity.RequestSeq) {
      //var query = 'update PAY_REQUEST set ';
      var query = [];
      if (entity.Status) {
        query.push('STATUS=\'' + entity.Status + '\'');
      }
      if (entity.Comment) {
        query.push('COMMENT=\'' + entity.Comment + '\'');
      }
      if (entity.IsPushSent) {
        query.push('PUSH_SENT_YN=\'Y\'');
      }

      var queryString = 'update PAY_REQUEST set ' + query.join(', ') + ' where SEQ=' + entity.RequestSeq;

      connection.query(queryString,
        function (err, result) {
          if (err) {
            callback(err);
          } else {
            callback();
          }
        });
    } else {
      callback('no request');
    }
  },

  selectNow: function (callback) {
    connection.query('select now() as NOW', function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback(null, result[0].NOW);
      }
    })
  }
}