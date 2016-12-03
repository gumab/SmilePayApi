/**
 * Created by guma on 2016. 12. 3..
 */
'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var port = '80';
if (process.env.NODE_ENV !== 'production') {
    port = '1111';
}

module.exports = {
    root: rootPath,
    webServer: {
        ip: '127.0.0.1',
        port: port
    }
};
