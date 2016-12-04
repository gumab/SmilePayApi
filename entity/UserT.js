/**
 * Created by guma on 2016. 12. 3..
 */
'use strict';

// app/entity/UserT.js
// load the things we need

// define the schema for our user model

function UserT(userNo, loginId, name, hp1, hp2, hp3, regDate) {
    this.UserNo = userNo;
    this.Name = name;
    this.LoginId = loginId;
    this.HpNo = hp1 + '-' + hp2 + '-' + hp3;
    this.LastHpNo = hp3;
}

// create the model for users and expose it to our app
module.exports = UserT;
