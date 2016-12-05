/**
 * Created by guma on 2016. 12. 3..
 */

'use strict';

// app/entity/BeaconT.js
// load the things we need

// define the schema for our user model

function BeaconT(partnerNo, major, minor) {
  this.PartnerNo = partnerNo;
  this.Major = major;
  this.Minor = minor;
}

// create the model for users and expose it to our app
module.exports = BeaconT;
