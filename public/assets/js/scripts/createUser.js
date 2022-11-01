var mysql = require('mysql');
var passwordHash = require('password-hash');

var con = mysql.createConnection({
	host: "nico.cours-diiage.com",
	user: "web2",
	password: "D2019",
	database: "web2"
  });

var login = "admin";
var password = "azerty123";
var hashedPassword = passwordHash.generate(password);

createUser();


function createUser(){
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		var date = new Date().toLocaleDateString("fr-EU");
		var sql = "INSERT INTO user (login, password, created_at, updated_at) VALUES (?, ?, '"+date+"', '"+date+"')";
		sql = mysql.format(sql, [login, hashedPassword])
		con.query(sql, function (err, result) {
		  	if (err) throw err;
		});
		
		console.log("insertion terminé");
		
	});
	
}