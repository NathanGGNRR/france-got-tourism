const fetch = require('node-fetch');
const fs = require('fs');


var scale = 1000;
var current = 0;
var total;
var geo = {}; 



//set total of types

fetch('http://vps.cours-diiage.com:8080', {
	method: 'POST',
	headers: {
	  'Content-Type': 'application/json',
	  'Accept': 'application/json',
	},
	body: JSON.stringify({query: "{poi { total }}"})
  })
	.then(r => r.json())
	.then(data=>total = data.data.poi.total)
	.then(ProcessData);



function ProcessData(data){

	if(total-current<scale) scale = total-current+1;
	if(current >= total) {
		ProcessData = null;
		saveData();
	}
	fetch('http://vps.cours-diiage.com:8080', {
		method: 'POST',
		headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		},
		body: JSON.stringify({query: "{poi(from:"+current+",size:"+scale+"){results{isLocatedAt{schema_address{hasAddressCity{rdfs_label{value}isPartOfDepartment{rdfs_label{value}isPartOfRegion{rdfs_label{value}}}}}}}}}"})
	})
	.then(r => r.json())
	.then(function(data){
			//console.log(data.data.poi.results[0].rdf_type);
			storeData(data.data.poi.results);
			current+=scale;
	})
	.then(ProcessData);

}

function storeData(json){ // json is an array of results
	for(var resultIndex=0; resultIndex < json.length; resultIndex++){
		var city = null;
		var department = null;
		var region = null;
		try{
			region = json[resultIndex].isLocatedAt[0].schema_address[0].hasAddressCity[0].isPartOfDepartment[0].isPartOfRegion[0].rdfs_label[0].value;
			department = json[resultIndex].isLocatedAt[0].schema_address[0].hasAddressCity[0].isPartOfDepartment[0].rdfs_label[0].value;
			city = json[resultIndex].isLocatedAt[0].schema_address[0].hasAddressCity[0].rdfs_label[0].value;
		}
		catch(error){
			console.log(error);
		}
		
		if(region != null && !Object.keys(geo).includes(region)) geo[region] = {};
		if(department != null && !Object.keys(geo[region]).includes(department)) geo[region][department] = [];
		if(city != null && !geo[region][department].includes(city)) geo[region][department].push(city);
	}
}

function saveData(){
	fs.writeFile("./scripts/geo.json", JSON.stringify(geo), function(err) {

		if(err) {
			return console.log(err);
		}
	
		console.log("The types file was saved!");
	}); 
}