var express = require('express');
var router = express.Router();
var mysql_fgt = require('../public/assets/js/modules/mysql-fgt') // Call our modules
var passwordHash = require('password-hash');


function sessionChecker(sessionLogin, res){
  if(typeof(sessionLogin) == "undefined"){ // already connected
    res.redirect("/administration/connexion");
  }
}

router.get('/connexion', function(req, res, next) {
  if(typeof(req.session.login) != "undefined"){ // already connected
    res.redirect("/administration");
  }
  else{ // not connected
    res.render("layout/admin/connexionPage");
  }
  //res.render("layout/connexionPage");
});

router.post('/connexion', function (req, res, next) {
  var login = req.param("login");
  var password = req.param("password");
  var data = {};


    var sql = "Select password from user where login = ?";
    sql = mysql_fgt.format(sql, [login])

    mysql_fgt.querySQL(sql).then(function(result){
        if(result.length > 0){
          var trueHashedPassword = result[0].password;
          if(passwordHash.verify(password, trueHashedPassword)){
            req.session.login = login;
          }
          else{
            data.connexionError = "Wrong informations, try again !";
          }
        }
        else{
          data.connexionError = "Wrong informations, try again !";
        }
        if(!data.connexionError){
          res.redirect("/administration");
          data.connexionError = "";
        }
        else{
          res.render("layout/admin/connexionPage", data);
        }
        
    });
});

//Select all page in Database then display Admin page
function goToAdmin(res) {
  mysql_fgt.querySQL("SELECT P.nomPage as nomPage, GROUP_CONCAT(name) name FROM page P INNER JOIN liaisonpagetype L ON L.nomPage = P.nomPage INNER JOIN type T ON T.id = L.idType GROUP by nomPage").then(function (result) {
    res.render('layout/admin/administration', { data: result });
  })
}

router.get('/', async function (req, res, next) {
  sessionChecker(req.session.login, res);
  goToAdmin(res); 
});

router.post('/delete', function (req, res, next) {
 
    var sql = "DELETE FROM `page` WHERE nomPage ='" + req.body.page + "';";// SQL Query
    sql = mysql_fgt.format(sql);//Format the query
    var result = mysql_fgt.querySQL(sql).then(function() {//Execute Query then redirect to admin page
      res.redirect('/administration');
    });
  
});

router.post('/createPage', async function (req, res, next) {
  sessionChecker(req.session.login, res);
  var allTypes = await mysql_fgt.querySQL("SELECT id, name FROM type");
  res.render('layout/admin/createPage', { type: allTypes});
});

router.post('/updatePage', async function (req, res, next) {
  sessionChecker(req.session.login, res);
  var page = await mysql_fgt.querySQL("SELECT P.nomPage, contentHTML, filter, libelle, image, GROUP_CONCAT(DISTINCT idType) idType FROM page P RIGHT JOIN liaisonpagetype L ON L.nomPage = P.nomPage WHERE P.nomPage = '" + req.body.page + "'");
  var arrayTypes = await mysql_fgt.querySQL("SELECT id, name FROM type");
  res.render('layout/admin/updatePage', { data: page, types: arrayTypes});
});

router.post('/createPage/insert', function (req, res, next) {
  console.log(req.body.imgPathHidden)
  var sql = "INSERT INTO page (nomPage, contentHTML, filter, libelle, image) VALUES ('" + req.body.namePage + "','" + req.body.taContentHTML + "','" + req.body.taFilter + "','" + req.body.taLibelle + "','" + req.body.imgPathHidden + "');";
  mysql_fgt.querySQL(sql);
  var sqlInsert = "INSERT INTO liaisonpagetype (nomPage, idType) VALUES ";
  if(!Array.isArray(req.body.selTypes)){
    sqlInsert += "('" + req.body.namePage + "'," + req.body.selTypes + ")"
  } else {
    req.body.selTypes.forEach(function(element){
      sqlInsert += "('" + req.body.namePage + "'," + parseInt(element) + "),"
    }) 
    sqlInsert = sqlInsert.substring(0, sqlInsert.length - 1);
  }
  mysql_fgt.querySQL(sqlInsert).then(function(){
    res.redirect('/administration');
  })
});

const delay = ms => new Promise(res => setTimeout(res, ms));

router.post('/updatePage/update', async function (req, res) {
  var sql = "UPDATE page SET contentHTML = '" + req.body.taContentHTMLU + "', libelle = '" + req.body.taLibelleU + "', image = '" + req.body.imgPathHidden + "', filter = '" + req.body.taFilterU + "' WHERE nomPage = '" + req.body.namePageU + "'";
  mysql_fgt.querySQL(sql);
  var sqlInsert = "INSERT INTO liaisonpagetype (nomPage, idType) VALUES ";
  if(!Array.isArray(req.body.selTypesU)){
    sqlInsert += "('" + req.body.namePage + "'," + req.body.selTypesU + ")"
  } else {
    req.body.selTypesU.forEach(function(element){
      sqlInsert += "('" + req.body.namePage + "'," + parseInt(element) + "),"
    }) 
    sqlInsert = sqlInsert.substring(0, sqlInsert.length - 1);
  }
  mysql_fgt.querySQL(sqlInsert);
  await delay(500);
  res.redirect('/administration');
});

router.get('/logout', function(req, res){
  req.session.destroy(function(){
     console.log("user logged out.")
  });
  res.redirect('/');
});


module.exports = router;