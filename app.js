var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var MONGODB_URI = 'mongodb://localhost:27017/sourcefiles';

app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '\\public\\index.html');
});

function saveSearch(query) {
	MongoClient.connect(MONGODB_URI, function(err, db) {
		db.collection('searches').insertOne({ query: query }, function(err, result) {
			if (err) throw err;
			db.close();			
		});
	});
}

app.get('/files', function(req, res) {
	if (req.query.q)
		saveSearch(req.query.q);
	var q = req.query.q.split(' ').join('.*');
	MongoClient.connect(MONGODB_URI, function(err, db) {
		var m = { name: new RegExp(q, 'i'), isDir: { $eq: true }};
		db.collection('files').find(m).limit(100).toArray(function(err, result) {
			res.send(result);
			db.close();
		});
	});
});
app.get('/folder', function(req, res) {
	var q = req.query.q;
	MongoClient.connect(MONGODB_URI, function(err, db) {
		var m = { path: q };
		db.collection('files').find(m).limit(100).toArray(function(err, result) {
			res.send(result);
			db.close();
		});
	});
});

app.get('/recent', function(req, res) {
	MongoClient.connect(MONGODB_URI, function(err, db) {
		db.collection('searches').find({}).limit(5).toArray(function(err, result) {
			res.send(result);
			db.close();
		});
	});
});

app.use(express.static('public'));

app.listen(8080, function() {
	console.log('Listening on port 8080');
});
