/*
 All data is from practice handouts, and only add an additional app.post to post 
 quiz results which collected by Location-based Quiz App. Therefore,
 it is only need one NodeJS and allow the two apps run. The NodeJS generally could
 be divided into two parts, which are downloading and uploading functions
 in addition to basic technologies introduced.
  															*/

// give variable to express that forms part of the nodejs server
var express = require('express');
var path = require("path");
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({
		extended: true
		}));
app.use(bodyParser.json());

// the function allow cross running by the nodeserver and phonegap, which applied to the two Apps  
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	next();
});

	
// function log the requests AJAX
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});
	

// add an http server to serve files to the Edge browser 
// due to certificate issues it rejects the https files if they are not
// directly called in a typed URL
var http = require('http');
var httpServer = http.createServer(app); 
httpServer.listen(4480);

app.get('/',function (req,res) {
	res.send("hello world from the HTTP server");
});

//GetPoI function to get connection to DB, received data from server	
app.get('/getPOI', function (req,res) {
	pool.connect(function(err,client,done) {
		if(err){
			console.log("not able to get connection "+ err);
			res.status(400).send(err);
		}
// use the inbuilt geoJSON functionality
// and create the required geoJSON format using a query ajusted from: http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018

		var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ";
    		querystring = querystring + "(SELECT 'Feature' As type , ST_AsGeoJSON(lg.geom)::json As geometry, ";
			querystring = querystring + "row_to_json((SELECT l FROM (SELECT id, name, category) As l )) As properties";
			querystring = querystring + " FROM united_kingdom_poi As lg limit 100 ) As f ";
			console.log(querystring);
			client.query(querystring,function(err,result){
	
			done();
			if(err){
			console.log(err);
			res.status(400).send(err);
			}
			res.status(200).send(result.rows);
		});
	});
});
	
//upload questions infromation to the table in database by user setting
app.post('/uploadData',function(req,res){
	//post means upload data
	console.dir(req.body);
	pool.connect(function(err,client,done) {
		if(err){
			console.log("not able to get connection "+ err);
			res.status(400).send(err);
		}
// separate the geometry component together

			var geometrystring = "st_geomfromtext('POINT(" + req.body.longitude + " " + req.body.latitude + ")'";
				
			var querystring = "INSERT into questionform (name,question,answera,answerb,answerc,answerd,ranswer,geom) values ('";
				querystring = querystring + req.body.name + "','" + req.body.question + "','" + req.body.answera + "','"+ req.body.answerb + "','"+ req.body.answerc + "','"+ req.body.answerd + "','"+ req.body.ranswer + "',"+geometrystring+ "))";
				console.log(querystring);
				client.query( querystring,function(err,result) {
					done();
					if(err){
						console.log(err);
						res.status(400).send(err);
						}
						res.status(200).send("Information inserted");
					});
				});
			});

//this function send quiz data to the quiz table in database		
app.post('/uploadQuizData',function(req,res){
	//use different name
		console.dir(req.body);
		pool.connect(function(err,client,done) {
			if(err){
				console.log("not able to get connection "+ err);
				res.status(400).send(err);
			}
				
			var querystring = "INSERT into quizform (name,question,ranswer) values ('";
				querystring = querystring + req.body.name + "','" + req.body.question + "','"+ req.body.ranswer + "')";
				console.log(querystring);
				client.query( querystring,function(err,result) {
					done();
					if(err){
						console.log(err);
						res.status(400).send(err);
						}
						res.status(200).send("Information inserted");
					});
				});
			});
		
		
		
//This allow us to generate GeoJSON from any spatial table
app.get('/getGeoJSON/:tablename/:geomcolumn', function (req,res) {
	pool.connect(function(err,client,done) {
		if(err){
			console.log("not able to get connection "+ err);
			res.status(400).send(err);
		}
		var colnames = "";
		// first get a list of the columns that are in the table
		// use string_gg to process a comma separated text, then paste the list into the next query
		var querystring =" select string_agg(colname,',') from ( select column_name as colname ";
			querystring = querystring + " FROM information_schema.columns as colname ";
			querystring = querystring + " where table_name = '"+ req.params.tablename +"'";
			querystring = querystring + " and column_name <>'"+req.params.geomcolumn+"') as cols ";
			console.log(querystring);
			
			client.query(querystring,function(err,result){
		
				console.log("trying");
				done();
				if(err){
					console.log(err);
					res.status(400).send(err);
				}
		
				thecolnames = result.rows[0].string_agg;
				colnames = thecolnames;
				console.log("the colnames "+thecolnames);
		// Retrieved from here:
		// http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
		// note that query needs to be a single string with no line breaks so built it up bit by bit
				var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ";
					querystring = querystring + "(SELECT 'Feature' As type , ST_AsGeoJSON(lg." + req.params.geomcolumn+")::json As geometry, "
					querystring = querystring + "row_to_json((SELECT l FROM (SELECT "+colnames + ") As l )) As properties";
					querystring = querystring + " FROM "+req.params.tablename+" As lg limit 100 ) As f ";
					console.log(querystring);
		
				client.query(querystring,function(err,result){
		
					done();
					if(err){
						console.log(err);
						res.status(400).send(err);
					}
					res.status(200).send(result.rows);
			});
		});
	});
});
	
// read in the file and force it to be a string by adding “” at the beginning
//connect to PGAdimin
var configtext = ""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
//now convert the configruation file into the correct format 
var configarray = configtext.split(",");
var config = {};
for (var i = 0; i < configarray.length; i++) {
	var split = configarray[i].split(':');
	config[split[0].trim()] = split[1].trim();
}

var pg = require('pg');
var pool = new pg.Pool(config);
app.get('/postgistest', function (req,res) {
	pool.connect(function(err,client,done) {
		if(err){
			console.log("not able to get connection "+ err);
			res.status(400).send(err);
		}
		client.query('SELECT name FROM united_kingdom_counties',function(err,result) {
			done();  //this is used to test the function
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send(result.rows);
		});
	});
});
	
// the / claims the path that you type into the server 
app.get('/:name1', function (req, res) {
// run some server-side code
// the console is the command line of your server, allow console see the log value and have a check on it
  	console.log('request '+req.params.name1);
  	res.sendFile(__dirname + '/'+req.params.name1);
  });

//get from sencond directory
app.get('/:name1/:name2', function (req, res) {

console.log('request '+req.params.name1+"/"+req.params.name2);

// the res is the response that the server sends back to the browser - you will see this text in your browser window
res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2);
});


// get file form the third directory
app.get('/:name1/:name2/:name3', function (req, res) {
console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3); 
res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3);
});
  
 // Add an sub directory of the previous one
 app.get('/:name1/:name2/:name3/:name4', function (req, res) {
  
 	console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3+"/"+req.params.name4); 
  res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3+"/"+req.params.name4);
});



	