/**
 * Created by guma on 2016. 12. 4..
 */

'use strict';

// app/entity/BeaconT.js
// load the things we need

// define the schema for our user model

function PartnerT(partnerNo, partnerName, loginId) {
    this.PartnerNo = partnerNo;
    this.Name = partnerName;
    this.LoginId = loginId;
}

// create the model for users and expose it to our app
module.exports = PartnerT;