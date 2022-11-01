const fs = require('fs');
var mysql_fgt = require('../public/assets/js/modules/mysql-fgt') // Call our modules


fs.readFile('./scripts/types.json', function read(err, data) {
    if (err) {
        throw err;
    }
    insertData(JSON.parse(data));
});

function insertData(types){
	var date = new Date().toLocaleDateString("fr-EU");
	for(var index=0; index < types.length; index++){
		var sql = "INSERT INTO type (name, created_at, updated_at) VALUES ('"+types[index]+"', '"+date+"', '"+date+"')";
		mysql_fgt.querySQL(sql);
	}
}