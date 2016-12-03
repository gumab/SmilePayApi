/**
 * Created by guma on 2016. 12. 3..
 */
'use strict';

module.exports = function (app) {
    app.use('/api', require('./api'));
};
