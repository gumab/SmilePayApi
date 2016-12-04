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
    }
}