/**
 * Created by guma on 2016. 12. 5..
 */
module.exports = {
  EnumPayRequestStatus: {
    //대기
    Wait: '00',

    //결제완료
    PayComplete: '10',

    //가맹점취소
    CancelPartner: '50',

    //고객취소
    CancelUser: '60',

    //결제실패
    PayFailed: '90'
  }
};