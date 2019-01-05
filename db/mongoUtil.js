var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;
var url = "mongodb://localhost:27017/";
 function extend(target, source) {
        for (var [key, value]  of source) {
            target[key] = value;
	}
        return target;
    }
module.exports ={
	insertItem: (itemInfor, callback ) => {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
 			if (err) throw err;
			console.log(itemInfor);
  			var dbo = db.db("items");
			var itemInforJSON = {};
		/*	
			if(itemInfor['title'] && itemInfor['price'] && itemInfor['description'] && itemInfor['location'] && itemInfor['location']['type'] && itemInfor['location']['coordinates'] && itemInfor['DajiId']  && itemInfor['openid']){
			}else{
				callback("illegal input");
				db.close();
				return; 
			}
	*/
			itemInforJSON['title'] = itemInfor['title'];
			itemInforJSON['price'] = itemInfor['price'];
			itemInforJSON['description'] = itemInfor['description'];
			itemInforJSON['location'] = {};
			itemInforJSON['location']['type'] = itemInfor['location']['type'];
			itemInforJSON['location']['coordinates'] = itemInfor['location']['coordinates'];			
			itemInforJSON['openid'] = itemInfor['openid'];
			itemInforJSON['image'] = itemInfor['image'];
			itemInforJSON['viewerCount'] = 0;
			itemInforJSON['DajiId'] = itemInfor['DajiId'];
			itemInforJSON['date'] =  new Date().toISOString().slice(0, 10); 
			dbo.collection("itemsInfor").insertOne(itemInforJSON, function(err, res) {
    			if (err) throw err;
    			callback("one item has be inserted to db");
			db.close();
  			});
		});
	},
	editItem: (itemInfor, callback) =>{
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
			var viewFliter ={'_id':new ObjectId(itemInfor['itemId'])};
			itemInfor['date'] =  new Date().toISOString().slice(0, 10); 
			var viewToChange = {$set:itemInfor};
			dbo.collection("itemsInfor").update(viewFliter, viewToChange, function(err, res){
				if (err) throw err;
				db.close();
				callback("one item has be edited");
			});
		});

	},
	deleteItem: (itemId,openid,callback) =>{
		MongoClient.connect(url, function(err, db) {
 			if (err) throw err;
  			var dbo = db.db("items");
  			var myquery = { "_id": new ObjectId(itemId)};
  			myquery['openid'] = openid;
			console.log(myquery);
			dbo.collection("itemsInfor").deleteOne(myquery, function(err, obj) {
    				if (err) throw err;
				dbo.collection("favorite").deleteMany({'itemId':itemId},(e, d) =>{
					if(e) throw e;
				});
    				callback(itemId + "one item has be delete");
    				db.close();
  			});
		});		
	},
	getDistance : (lat1, lon1, lat2, lon2) =>{
		var R = 6371; // km
     		var dLat = module.exports.toRad(lat2-lat1);
     		var dLon = module.exports.toRad(lon2-lon1);
      	   	var lat1 = module.exports.toRad(lat1);
     		var lat2 = module.exports.toRad(lat2);
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      		var d = R * c;
      		return d.toFixed(1);	
	},
	toRad: (Value) => {
		return Value * Math.PI / 180;	
	},
	getItemsByDajiId: (DajiId, latitude, longitude, callback) =>{
			MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
                        dbo.collection("itemsInfor").find({'DajiId' : DajiId}).toArray(function(e, d){
				db.close();
				d.forEach((item) => {
					delete item.openid;
					var coordinates = item.location.coordinates;
				 	item.distance = module.exports.getDistance(latitude, longitude, coordinates[0],  coordinates[1]);
				});
				callback(d);
			});
                });
	
	},
	findAll: (callback)=>{
		 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
                        dbo.collection("itemsInfor").find().toArray(function(e, d){
				db.close();
				callback(d);
			});
                });
	},
	 findOne:  (callback, id)=>{
         	if(id.length != 24){
			callback('illegal id');
			return;
		}
        	MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
	                        dbo.collection("itemsInfor").find({'_id':new ObjectId(id)} ).toArray(function(e, d){
				var viewFliter ={'_id':new ObjectId(id)};
				var viewerCount = d[0].viewerCount +1;
				var viewToChange = {$set:{'viewerCount':viewerCount}};
				dbo.collection("itemsInfor").update(viewFliter, viewToChange, function(err, res){
					if (err) throw err;
					db.close();
					callback(d);
				});
                	});
		});
        },
	getNearItems : (callback, latitude, longitude, page) =>{
		MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
			if(err) throw err;
			var location =[parseInt(latitude), parseInt(longitude)];
			var dbo =  db.db("items");
			var cursor = dbo.collection("itemsInfor").aggregate([
				 {
					 $geoNear: {
						 near: {
							 type: "Point", coordinates: location
							},
								 distanceField: "distance",
								 spherical: true 
					}
				 }
			]);
			var result = {};
			result['nearItems'] = [];
			var i = 0;
			cursor.each(function(err, item){
			console.log(item);	
			if(i < (page - 1) * 20) return;
				if(item){
					result['nearItems'].push(item);

					
				}
				if(!item || i >= page*20) {
					var j = 0;
					var count = 0;
					result.nearItems.forEach(function(element){
							module.exports.getDajiIdByOpenId(result.nearItems[j].openid,(DajiId) => {	
								element['DajiId'] = DajiId;
								delete element.openid;
								var coordinates = element.location.coordinates;
								element.distance = module.exports.getDistance(latitude, longitude, coordinates[0],  coordinates[1]);
								count++;
								if(count == result.nearItems.length) callback(result);
							});
					});
				}
				i++;
			});
			
		});
	},
	insertUserWeChatId : (WeChatId, openid, callback) =>{
       		if(!WeChatId){
			callback("illegal WeChatId");
		}
            	 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("users");
			var fliter = {};
			fliter['openid'] = openid;
			var toChange ={$set:{'WeChatId':WeChatId}};
                        dbo.collection("userInfor").update(fliter, toChange, function(err, res) {
                                if (err) throw err;
                                callback("one user's WeChantId has be changed");
                                db.close();
                        });
                });
        },
	insertUserPhone : (phone, openid, callback) =>{
                if(!phone){
			callback("illegal phone"); 
			return;
		} 
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("users");
                        var fliter = {};
                        fliter['openid'] = openid;
                        var toChange ={$set:{'phone':parseInt(phone)}};
                        dbo.collection("userInfor").update(fliter, toChange, function(err, res) {
                                if (err) throw err;
                                callback("one user's phone has be changed");
                                db.close();
                        });
                });
        },
	insertUserQQ : (QQ, openid, callback) =>{
                  	if(!QQ){
				callback("illegal QQ"); 
				return;
			}                
			MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("users");
                        var fliter = {};
                        fliter['openid'] = openid;
                        var toChange ={$set:{'QQ':QQ}};
                        dbo.collection("userInfor").update(fliter, toChange, function(err, res) {
                                if (err) throw err;
                                callback("one user's QQ has be changed");
                                db.close();
                        });
                });
        },
	insertUserEmail : (Email, openid, callback) =>{
                        if(!Email){
				callback("illegal Email"); 
				return;
			}
			MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("users");
                        var fliter = {};
                        fliter['openid'] = openid;
                        var toChange ={$set:{'Email':Email}};
                        dbo.collection("userInfor").update(fliter, toChange, function(err, res) {
                                if (err) throw err;
                                callback("one user's Email has be changed");
                                db.close();
                        });
                });
        },
	insertUser : (userInfor, openid, callback) =>{
		   MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("users");
                	var userInforJSON = {};	 
                	userInforJSON['openid'] = openid;
			userInforJSON['avatarUrl'] = userInfor.avatarUrl;
			userInforJSON['city'] = userInfor.city;
			userInforJSON['country'] = userInfor.country;
			userInforJSON['gender'] = userInfor.gender;
			userInforJSON['language'] = userInfor.language;
			userInforJSON['nickName'] = userInfor.nickName;
			userInforJSON['province'] = userInfor.province;
			var copied = JSON.parse(JSON.stringify(userInforJSON));	
			dbo.collection("userInfor").find({'openid':openid }).toArray(function(err, result){
				
				if(result.length != 1){
					copied['weChatId'] = '';
					copied['QQ'] = '';
					copied['Email'] = '';
					copied['phone']= '';
					dbo.collection("userInfor").insertOne(copied, function(err, res) {
                        			if (err) throw err;
                        			db.close();
					});
					callback(copied);
				}else{
					 callback(result[0]);
					 var myquery = { 'openid' : openid };
					 dbo.collection("userInfor").updateOne(myquery,{$set: userInforJSON}, function(err, res) {
   					 	if (err) throw err;
						db.close();
 					 });			
				}	
                        });
		});		
	},
	getDajiIdByOpenId : (openid, callback) => {
		MongoClient.connect(url, function(err, db) {
  			if (err) throw err;
  			var dbo = db.db("users");
  			dbo.collection("userInfor").findOne({'openid' : openid}, function(e, d){
				console.log("aaaaaa");
				console.log(d);
				callback(d._id);
			});
		});	
	},
	getUserByDajiId : (DajiId, callback) => {
			 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("users");
                        dbo.collection("userInfor").findOne({'_id': new ObjectId(DajiId)} ,function(e, d){
                                db.close();
             			delete d.openid;
	                        callback(d);
                        });
                });	
	},
	
	getUser : (openid, callback) =>{
		 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("users");
                        dbo.collection("userInfor").find({'openid':openid} ).toArray(function(e, d){
                                db.close();
                                callback(d);
                        });
                });	
	},
	isFavorite: (openid, itemId, callback) =>{
		MongoClient.connect(url, function(err, db) {
  			if (err) throw err;
  			var dbo = db.db("items");
  			var favoriteJSON = {};
			favoriteJSON['openid'] = openid;
			favoriteJSON['itemId'] = itemId;
			dbo.collection("favorite").find(favoriteJSON).toArray(function(err, result) {
   				if (err) throw err;
				if(result.length == 0){
					callback('0');
				}else{
					callback('1');
				}
   			 	db.close();
  			});
		});
	},
	setFavorite : (openid, itemId, callback) =>{
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
			var favoriteJSON = {};
			favoriteJSON['openid'] = openid;
			favoriteJSON['itemId'] = itemId;
                        var dbo = db.db("items");
                        dbo.collection("favorite").insertOne(favoriteJSON, function(err, res) {
                                if (err) throw err;
                                callback("added a favorte");
                                db.close();
                        });
                });
	},
	unSetFavorite :(openid, itemId, callback) =>{
		MongoClient.connect(url, function(err, db) {
  			if (err) throw err;
 			var dbo = db.db("items");
			var myquery ={};
			myquery['openid'] = openid;
			myquery['itemId'] = itemId;
  			dbo.collection("favorite").deleteOne(myquery, function(err, obj) {
    				if (err) throw err;
    				callback("a item has be unfavorite");
				db.close();
  			});
		});
	},
	 getFavorite : (openid, callback) =>{
                 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
                        dbo.collection("favorite").find({'openid':openid} ).toArray(function(e, d){
                                db.close();
                                var items = [];
				var i = 0;
				d.forEach((element) => {
					console.log(element.itemId);
					module.exports.findOne((result) => {
						items.push(result);
						i++;
						if(i == d.length) callback(items);	
					}, element.itemId);
				});
                        });
                });
        },
	 getFavoriteCount : (itemId, callback) =>{
                 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
                        dbo.collection("favorite").find({'itemId':itemId} ).toArray(function(e, d){
                                db.close();
                                callback({'favoriteCount' : d.length});
                        });
                });
        },

	getItemsByUser : (openid, callback) =>{
                 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
                        dbo.collection("itemsInfor").find({'openid':openid} ).toArray(function(e, d){
                                db.close();
                                callback(d);
                        });
                });
        }
}
