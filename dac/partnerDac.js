/**
 * Created by guma on 2016. 12. 4..
 */
'use strict';

var configDB = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(configDB.mysql);
var PartnerT = require('../entity/PartnerT');
var BeaconT = require('../entity/BeaconT');


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
    },

    selectUUID: function(callback){
      connection.query('select UUID from BEACON_UUID limit 1', function(err, result){
          if(err || !result || result.length != 1){
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
            if(err){
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
    }
}