const fetch = require('node-fetch');
const fs = require('fs');


var scale = 1000;
var current = 0;
var total;
var urlTypeFilter = "https://www.datatourisme.gouv.fr/ontology/core#";
var distinctTypes = [];




//set total of types
fetch('http://vps.cours-diiage.com:8080', {
	method: 'POST',
	headers: {
	  'Content-Type': 'application/json',
	  'Accept': 'application/json',
	},
	body: JSON.stringify({query: "{poi { total }}"})
  })
	.then(r => r.json()/*console.log(r)*/)
	.then(data=>total = data.data.poi.total)
	.then(ProcessData);



function ProcessData(data){
	//console.log(typeof data); //object
	//console.log(Object.keys(data));
	//console.log(JSON.stringify(data.data.poi.results));
	/*dataTypes = data.data.poi.results;
	for(var result=0; result < data.data.poi.results.length; result++){
		for(var index=0; index < dataTypes[result].rdf_type.length; index++){
			console.log(dataTypes[result].rdf_type[index]);
		}
	}*/
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
		body: JSON.stringify({query: "{poi(from:"+ current +"size:"+ scale +") {  results {rdf_type }}}"})
	})
	.then(r => r.json()/*console.log(r)*/)
	.then(function(data){
			//console.log(data.data.poi.results[0].rdf_type);
			storeData(data.data.poi.results);
			current+=scale;
	})
	.then(ProcessData);

}

function storeData(json){
	for(var typeIndex=0; typeIndex < json.length; typeIndex++){
		types = json[typeIndex].rdf_type;
		for(var index=0; index < types.length; index++){
			var type = filterType(types[index]);
			if(type != "" && !distinctTypes.includes(type)) distinctTypes.push(type);
		}
	}
}

function filterType(url){
	if(url.includes(urlTypeFilter)) return url.replace(urlTypeFilter, "");
	return "";
}

function saveData(){
	fs.writeFile("./scripts/types.json", JSON.stringify(distinctTypes), function(err) {

		if(err) {
			return console.log(err);
		}
	
		console.log("The types file was saved!");
	}); 
}


