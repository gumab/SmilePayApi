/**
 * Created by guma on 2016. 12. 3..
 */
'use strict';

// get modules
var config = require('./config');
var express = require('express');
var app = express();

// set express config
require('./config/express')(app);

// use routing rules
require('./routes')(app);

// start listening
app.listen(config.webServer.port, config.webServer.ip, function () {
    console.log('Express server listening on %s:%d', config.webServer.ip, config.webServer.port);
});
