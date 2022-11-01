const fetch = require('node-fetch');
const fs = require('fs');
var mysql_fgt = require('../modules/mysql-fgt') // Call our modules


var scale = 1000;
var current = 0;
var total;
var jsonTypes = [];

/**
 * -- Doing --
 * Synchronous function, retrieve city or departement or region.
 * @param string table
 * -- Returning value(s) --
 * Array containing all city or department or region
 */
function retrieveOneDataFilter(table){
  var arrayData = [];
  var sql = "SELECT name from " + table;
  return mysql_fgt.querySQL(sql).then(rows => {
    rows.forEach(function(element){
      arrayData.push(element.name)
    });
    return arrayData;
  });
}

/**
 * -- Doing --
 * Asynchronous function, retrieve city, departement and region.
 * -- Returning value(s) --
 * Object containing city, department and region
 */
exports.retrieveDataFilter = async function retrieveData(){
  var resultCity;
  var resultDepartment;
  var resultRegion;
  await retrieveOneDataFilter("city").then(function(value){ //Call retrieveDataFilter to retrieve all city from the database
    resultCity = value;
  })
  await retrieveOneDataFilter("department").then(function(value){ //Call retrieveDataFilter to retrieve all department from the database
    resultDepartment = value;
  })
  await retrieveOneDataFilter("region").then(function(value){ //Call retrieveDataFilter to retrieve all region from the database
    resultRegion = value;
  })
  return { city:resultCity, department: resultDepartment, region:  resultRegion};
}


/**
 * -- Doing --
 * Asynchronous function, retrieve all poi with the filter
 * @param string nom
 * @param string filter
 * -- Returning value(s) --
 * Array of all poi of the type
 */
async function recoverData(nom, filter){
    return fetch('http://vps.cours-diiage.com:8080', { //HTTP Request, ask API of VPS with the query in the body.
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        },
        body: JSON.stringify({query: "{poi( filters:["+ filter +"] ) { total }}"}) //Filter is parameter
    })
    .then(r => r.json()) //Wait the result of the API and stringify under JSON format the result
    .then(data=>  { //Affect total variable to result of the query GraphQL, return array of poi
        total = data.data.poi.total;
        current = 0;
        jsonTypes = [];
        return ProcessData(nom, filter); 
    })
}


/**
 * -- Doing --
 * Asynchronous function, return all poi of the type
 * @param string nom
 * @param string filter
 * -- Returning value(s) --
 * Array of all poi of the type
 */
exports.returnData = async function (nom, filter){
    return await recoverData(nom, filter);
}


/**
 * -- Doing --
 * Asynchronous function, return all poi of the type
 * @param string nom
 * @param string filter
 * -- Returning value(s) --
 * Array of all poi of the type
 */
async function ProcessData(nom, filter){
    console.log(nom)
    while (current < total){ 
        if(total-current<scale) scale = total-current+1; //scale = 1000
        try{
            await fetch('http://vps.cours-diiage.com:8080', { //HTTP Request, ask API of VPS with the query in the body.
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                },
                body: JSON.stringify({query: "{poi(from:"+current+",size:"+scale+", filters:["+ filter +"]){results {dc_identifier,rdfs_label {value},isLocatedAt { schema_geo{schema_latitude schema_longitude}},hasDescription {shortDescription {value,lang },dc_description {lang,value}}}}}"})
            })
            .then(r => r.json()) //Wait the result of the API and stringify under JSON format the result
            .then(function(data){ //
                    storeData(data.data.poi.results, nom); //Call storeData with all results and name of the type
                    filterResult(nom); //filterResult to filter result depending on name of the type
            })
        } catch (error) {
            console.error('Error:', error);
        }
    }
    return jsonTypes;
    
}


/**
 * -- Doing --
 * Synchronous function, permit to escape one or more poi if one is broken
 * @param string nom
 */
function filterResult(nom){
    if(nom == "ParcsJardins"){ 
        if(current == 1000){
            current+=scale + 1;
        } else {
            current+=scale;
        }
        if(current == 1000){
            scale = 619;
        } else {
            scale = 1000;
        }
    } else {
        if(current == 1000){
            current+=scale + 1;
        } else {
            current+=scale;
        }
    }
}

/**
 * -- Doing --
 * Synchronous function, at each scale of poi, added all result into array jsonTypes
 * @param string json
 * @param string nom
 */
function storeData(json, nom){
    json.forEach(function(element){ //Foreach result, add it into jsonTypes array
        jsonTypes.push(element)
    })
}
