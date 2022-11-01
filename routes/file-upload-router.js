var express = require('express');
var router = express.Router();
var formidable = require("formidable");
var fs = require("fs");

router.post('/', function(req, res) {
    var form =  new formidable.IncomingForm();
    form.parse(req,(err, fields, files) => {
        if(err) throw err;
    }).on('fileBegin', function(name, file){
    
        if (!fs.existsSync('./public/assets/img/type/' + file.name)) {
            file.path = './public/assets/img/type/' + file.name;
        }
        
    }).on('file', function (name, file){
        console.log("File uploaded")
    }).on('progress', function(bytesReceived, bytesExpected) {
        var percent = (bytesReceived / bytesExpected * 100) | 0;
        console.log('Uploading: %' + percent + '\r')
    })
})

module.exports = router;