var express = require('express');
var router = express.Router();
var formidable = require('formidable');
    util = require('util');
var multiparty = require('multiparty');
var fs = require('fs');
var db = require('./../db/mongoUtil');
router.post('/update',  function(req, res, next){
	db.insertItem(req.body);	
	res.send("one item has be inserted to db");
	res.end();
});

router.post('/updateImage', function(req, res){
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {
		var inputFile = files.image[0];
		var avatarName = '/' + Date.now();
		fs.rename(inputFile.path, '/images' + avatarName, function(err){
                                if(err) console.log(err);
				res.send(avatarName);
				res.end();
                });
		
	});
	
});
router.get('/image', function(req, res){
	res.sendFile('/images/' + req.query.id);
});
router.get('/items', function(req, res){
	db.findAll(function( items){
		res.send(items);
		res.end();
	});
});

router.get('/item', function(req, res){
	db.findOne(function(item){
		res.send(item);
		res.end();
	}, req.query.id);
});
router.get('/getNearItems', function(req, res){
	db.getNearItems(function(items){
		console.log(items);
		res.send(items);
	}, req.query.latitude, req.query.longitude, req.query.page);
});
module.exports = router;
