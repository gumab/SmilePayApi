/**
 * Created by guma on 2016. 12. 5..
 */
'use strict';


var apn = require('apn');
var config = require('../config');

var options = {
  gateway : "gateway.sandbox.push.apple.com",
  cert: config.root + '/keys/cert.pem',
  key: config.root + '/keys/key.pem',
  production:false
};

var userDac = require('../dac/userDac');

module.exports = {
  sendPayRequestPush: function (payRequest, callback) {
    //TODO: Push 전송..
    console.log('Push Send ');
    console.log(payRequest);

    var apnConnection = new apn.Connection(options);
    
    userDac.selectUserToken(payRequest.TargetUserNo, function (err, token) {
      if(err){
        callback(err)
      } else {
        var myDevice = new apn.Device(token);

        var note = new apn.Notification();
        note.badge = 1;
        note.sound = "chime.aiff";
        note.alert = payRequest.PartnerName + " : " + commify(payRequest.RequestMoney)+"원 결제요청" ;
        //note.payload = {'message': '안녕하세요'};

        var pushErr = null
        try {
          var res = apnConnection.pushNotification(note, myDevice);
          console.log(res)
        } catch (e){
          pushErr = e
        }

        console.log(pushErr);
        callback(pushErr);
      }
    });

    //callback()

  }
};

function commify(n) {
  var reg = /(^[+-]?\d+)(\d{3})/;   // 정규식
  n += '';                          // 숫자를 문자열로 변환

  while (reg.test(n))
    n = n.replace(reg, '$1' + ',' + '$2');

  return n;
}
