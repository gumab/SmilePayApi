/**
 * Created by guma on 2016. 12. 4..
 */
'use strict';

var configDB = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(configDB.mysql);
var PartnerT = require('../entity/PartnerT');


module.exports = {
    selectPartner: function (loginId, callback) {
        connection.query('select PARTNER_NO,PARTNER_NM,LOGIN_ID from PARTNER where LOGIN_ID=' +
            mysql.escape(loginId), function (err, result) {
            if (err) {
                callback(err);
            } else {
                if (result && result.length > 0) {
                    result = result[0];
                    var partner = new PartnerT(result.PARTNER_NO,
                        result.PARTNER_NM,
                        result.LOGIN_ID)
                    callback(null, partner);
                } else {
                    callback(null, null);
                }
            }
        });
    }
}