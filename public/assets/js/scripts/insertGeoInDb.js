const fs = require('fs');
var mysql_fgt = require('../public/assets/js/modules/mysql-fgt') // Call our modules
 
fs.readFile('./geo.json', function read(err, data) {
    if (err) {
        throw err;
    }
    insertData(JSON.parse(data));
});
 
function insertData(json){
	var date = new Date().toLocaleDateString("fr-EU");
	var sql = "INSERT INTO region (name, created_at, updated_at) VALUES "; 
	for(var index=0; index < Object.keys(json).length; index++){
		sql += "('"+Object.keys(json)[index].replace("'", "\\'") +"' , '"+date+"', '"+date+"'),";
	}
		
	mysql_fgt.querySQL(sql.substring(0, sql.length - 1) +";").then(function(){
		mysql_fgt.disconnect();
		var sql = "select * from region";
		mysql_fgt.querySQL(sql).then(function(){
			insertDepartment(result, json);
		})
	});
}
 
function insertDepartment(result, json){
 	//create map of 'key : region' name with 'value : id'
	regions = {};
	for(var index=0; index<result.length; index++){
		regions[result[index].name] = result[index].id;
	}
 
	for(var region in json){
		for(var department in json[region]){
			var date = new Date().toLocaleDateString("fr-EU");
			var region_id = regions[region];
			var sql = "insert into department (name, created_at, updated_at, region_id) VALUES(?,?,?,?)";
			sql = mysql.format(sql, [department, date, date, region_id]);
			mysql_fgt.querySQL(sql);
		}
	}
 
	var sql = "select * from department";
	mysql_fgt.querySQL(sql).then(function(){
		mysql_fgt.disconnect();
		insertCities(result, json);
	});
 }
 
function insertCities(result, json){
	departments = {};
	for(var index=0; index<result.length; index++){
		departments[result[index].name] = result[index].id;
	}
 
	for(var region in json){
		for(var department in json[region]){
			for(var index=0; index< json[region][department].length; index++){
				var date = new Date().toLocaleDateString("fr-EU");
				var department_id = departments[department];
				var city = json[region][department][index];
				var sql = "insert into city (name, created_at, updated_at, department_id) VALUES(?,?,?,?)";
				sql = mysql.format(sql, [city, date, date, department_id]);
				mysql_fgt.querySQL(sql);
			}	
		}
	}
}