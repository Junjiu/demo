var express = require('express');
var router = express.Router();
var request = require('request');
var formidable = require('formidable');
    util = require('util');
var multiparty = require('multiparty');
var fs = require('fs');
var db = require('./../db/mongoUtil');

router.post('/update',  function(req, res, next){
	db.insertItem(req.body, (message) =>{
	res.send(message);
	res.end();
	});	
});

router.post('/edit',  function(req, res, next){
	db.editItem(req.body, (message) =>{
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

router.get('/getUserByDajiId', function(req, res){
	db.getUserByDajiId(req.query.DajiId, (result) =>{
		res.send(result);
		res.end();
	});
});
router.get('/getItemsByDajiId', function(req, res){
	db.getItemsByDajiId(req.query.DajiId, req.query.latitude, req.query.longitude, (result) =>{
		res.send(result);
		res.end();
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

router.get('/deleteItem', function(req, res){
	db.deleteItem(req.query.itemId, req.query.openid, function(result){
		res.send(result);
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
			var JSONresult = {'userContact' : result, 'keys': JSON.parse(response.body)};	
			res.send(JSONresult);

		});
	});	
});
router.get('/getUser', function(req, res){
	db.getUser(req.query.openid, (result) =>{
		res.send(result);
	});
});
router.get('/isFavorite', function(req,res){
	db.isFavorite(req.query.openid, req.query.itemId, (result) =>{
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
router.get('/unSetFavorite', function(req,res){
	db.unSetFavorite(req.query.openid, req.query.itemId, (result) =>{
		res.send(result);
	});
});
router.get('/getFavoriteCount', function(req,res){
	db.getFavoriteCount(req.query.itemId, (result) =>{
		res.send(result);
	});
});

router.get('/getItemsByUser', function(req, res){
	db.getItemsByUser(req.query.openid, (result)=>{
		res.send(result);
	});
});
router.get('/setUserWechatId', function(req, res){
	db.insertUserWeChatId(req.query.WeChatId, req.query.openid, (result) =>{
		res.send(result);
	}); 
});
router.get('/setUserPhone', function(req, res){
        db.insertUserPhone(req.query.phone, req.query.openid, (result) =>{
                res.send(result);
        });
});
router.get('/setUserQQ', function(req, res){
        db.insertUserQQ(req.query.QQ, req.query.openid, (result) =>{
                res.send(result);
        });
});
router.get('/setUserEmail', function(req, res){
        db.insertUserEmail(req.query.Email, req.query.openid, (result) =>{
                res.send(result);
        });
});
module.exports = router;
