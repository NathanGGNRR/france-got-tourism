const express = require('express');
const fetch = require('node-fetch');
var router = express.Router();
var fgt = require('../public/assets/js/modules/fgt') // Call our modules
var mysql_fgt = require('../public/assets/js/modules/mysql-fgt') // Call our modules


/**
 * -- Doing --
 * Display activities page to the client.
 */
router.post('/:activitiesType', async function (req, res, next) {
 
    var data = await fgt.returnData(req.body.namePage, req.body.filterQuery) //Wait the returning value of returnData function
    var localization = await fgt.retrieveDataFilter(); //Wait the returning value of retrieveDataFilter function
    var sql = "SELECT contentHTML from page WHERE nomPage = '" + req.body.namePage + "'";
    mysql_fgt.querySQL(sql).then(function(result){
        res.render('layout/activities', { data: JSON.stringify(data), contentHTML:  result[0].contentHTML.replace("/r/n",""), title: req.body.libellePage, city: localization.city, department: localization.department, region: localization.region}) //Display the view activities with all poi, title, libelle, city, department and region
    })
    
});
  
module.exports = router; //Must export router module.
