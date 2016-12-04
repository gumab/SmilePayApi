/**
 * Created by guma on 2016. 12. 3..
 */

var config = require('../../config');
var router = require('express').Router();
var userDac = require('../../dac/userDac');
var partnerDac = require('../../dac/partnerDac');
var async = require('async');

router.get('/test', function (req, res) {
    res.json({value: 'test'});
});

router.get('/user', function (req, res) {
    var id = req.query.id;
    if (!!id) {
        userDac.selectUser(id, function (err, data) {
            if (!err) {
                res.json(data);
            } else {
                res.json(err);
            }
        })
    } else {
        res.json(null);
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
                    if(partnerInfo){
                        partnerDac.selectBeacon(partnerInfo.PartnerNo, function (err, beaconInfo) {
                            if(err || !beaconInfo){
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
                    partnerDac.selectUUID(function (err, uuid) {
                        if(err){
                            callback(err);
                        } else {
                            partnerInfo.beacon.UUID=uuid;
                            callback(null, partnerInfo);
                        }
                    })
                }
            ],
            function (err, partnerInfo) {
                if (err) {
                    res.json(null);
                } else {
                    res.json(partnerInfo);
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

    res.status=200;
});

module.exports = router;
