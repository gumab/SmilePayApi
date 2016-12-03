/**
 * Created by guma on 2016. 12. 3..
 */

var config = require('../../config');
var router = require('express').Router();


router.get('/test', function (req, res, next) {
    res.json({value:'test'});
});

module.exports = router;
