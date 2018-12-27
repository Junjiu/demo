var express = require('express');
var router = express.Router();
var request = require('request');
var formidable = require('formidable');
    util = require('util');
var multiparty = require('multiparty');
var fs = require('fs');
var db = require('./../db/mongoUtil');
router.post('/update',  function(req, res, next){
	console.log("update!");
	db.insertItem(req.body, (message) =>{
	res.send(message);
	res.end();
	});	
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
		res.send(items);
	}, req.query.latitude, req.query.longitude, req.query.page);
});
router.post('/login', function(req, res){
	var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=wx85ee5650ad5bcb23&secret=ed270ff5dce1d388e94fc603e24b612f&js_code='+ req.body.code + '&grant_type=authorization_code';
	request(url, function (error, response, body) {
		var resJSON = JSON.parse(response.body);
		db.insertUser(req.body.userInfo,resJSON.openid, (result) => {
			console.log(result);
		});
		res.send(response.body);
	});	
});
router.get('/getUser', function(req, res){
	db.getUser(req.query.openid, (result) =>{
		res.send(result);
	});
});
router.get('/getFavorite', function(req, res){
	db.getFavorite(req.query.openid, (result) => {
		res.send(result);
	});
});
router.get('/setFavorite', function(req,res){
	db.setFavorite(req.query.openid, req.query.itemId, (result) =>{
		res.send(result);
	});
});
router.get('/getItemsByUser', function(req, res){
	db.getItemsByUser(req.query.openid, (result)=>{
		res.send(result);
	});
});
module.exports = router;
