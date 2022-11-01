var express = require('express');
var router = express.Router();
var mysql_fgt = require('../public/assets/js/modules/mysql-fgt') // Call our modules

 
/**
 * -- Doing --
 * Display list of activities view to the client.
 */
router.get('/', function(req, res, next) {
  var sql = "select * from page";
  mysql_fgt.querySQL(sql).then(rows =>{
    res.render('layout/list-activities', {data: rows}); //Display list-activities view with all information page.
  });
});

module.exports = router; //Must export router module.
