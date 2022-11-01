var mysql = require('mysql');

var con = mysql.createConnection({ //Create connection with our database
	host: "nico.cours-diiage.com",
	user: "web2",
	password: "D2019",
	database: "web2"
});

/**
 * -- Doing --
 * Asynchronous function, query our database, sql query as parameter
 * @param string sql
 * -- Returning value(s) --
 * Promise, when query sql is finish, return result of the query
 */
exports.querySQL = async function( sql ) {
    return new Promise( ( resolve, reject ) => {
        con.query( sql, ( err, results ) => {
          if ( err )
              return reject( err );
          resolve( results );
        });
    });
}
  

exports.format = function(sql, login){
    return mysql.format(sql, login);
}