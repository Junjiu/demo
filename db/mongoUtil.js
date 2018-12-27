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
			if(itemInfor['title'] && itemInfor['price'] && itemInfor['description'] && itemInfor['location'] && itemInfor['location']['type'] && itemInfor['location']['coordinates']){
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
			dbo.collection("itemsInfor").insertOne(itemInforJSON, function(err, res) {
    			if (err) throw err;
    			callback("one item has be inserted to db");
			db.close();
  			});
		});
	},
	findAll: (callback)=>{
		 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
                        dbo.collection("itemsInfor").find().toArray(function(e, d){
				db.close();
				console.log(d);
				callback(d);
			});
                });
	},
	 findOne:  (callback, id)=>{
                 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
                        dbo.collection("itemsInfor").find({'_id':new ObjectId(id)} ).toArray(function(e, d){
                                db.close();
                                console.log(d);
                                callback(d);
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
				if(i < (page - 1) * 20) return;
				if(item) result['nearItems'].push(item);
				if(!item || i >= page*20) callback(result);
				i++;
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
			dbo.collection("userInfor").insertOne(userInforJSON, function(err, res) {
                        	if (err) throw err;
                        	callback("one user has be inserted to db");
                        	db.close();
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
	 getFavorite : (openid, callback) =>{
                 MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("items");
                        dbo.collection("favorite").find({'openid':openid} ).toArray(function(e, d){
                                db.close();
                                callback(d);
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
