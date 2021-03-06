/*jshint esversion: 6*/
var fs = require('fs');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/sourcefiles';

var dir = 'c:\\temp\\testdir';
var MAX_DEPTH = 5;

myReadDir(dir, function(err, files) {
	if (err) throw err;
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection('files').drop(function(err, result) {
			db.collection('files').insertMany(files, function(err, result) {
				if (err) throw err;
				db.close();
			});
		});
	});
}, 0);

function myReadDir(dir, cb, depth) {
	var list = [];

	fs.readdir(dir, function(err, files) {
		if (err) return cb(err, null);

		files = files.filter(function(f) {
			return (f !== 'System Volume Information');
		});

		var pending = files.length;
		if (pending === 0) {
			return cb(null, list);
		}

		files.forEach(function(file) {
			var filePath = path.join(dir, file);

			fs.stat(filePath, function(err, stats) {
				if (err) return cb(err, null);

				if (stats.isDirectory()) {
					if (depth == MAX_DEPTH) {
						pending--;
						if (pending === 0)
							return cb(null, list);
					} else {
						myReadDir(filePath, function(err, res) {
							if (err) return cb(err, null);
							list = list.concat(res);
							list.push({name: file, path: dir, isDir: true});
							pending--;
							if (pending === 0) {
								return cb(null, list);
							}
						}, depth+1);
					}
				} else { 
					list.push({name: file, path: dir, isDir: false});
					pending--;
					if (pending === 0) {
						return cb(null, list);
					}
				}
			});
		});
	});
}
