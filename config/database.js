/**
 * Created by guma on 2016. 12. 3..
 */
'use strict';

// config/database.js
var host = 'mysql01';
if (process.env.NODE_ENV !== 'production') {
    host = 'chabae01.japaneast.cloudapp.azure.com';
}

module.exports = {
    mysql: {
        host: host,
        port: 3306,
        user: 'spay',
        password: 'spay1!',
        database: 'spaydb'
    }
};