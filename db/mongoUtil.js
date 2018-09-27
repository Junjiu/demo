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
	insertItem: (itemInfor ) => {
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
 			if (err) throw err;
			console.log(itemInfor);
  			var dbo = db.db("items");
			dbo.collection("itemsInfor").insertOne(itemInfor, function(err, res) {
    			if (err) throw err;
    			console.log("1 item  inserted");
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
			console.log(id);
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
	}		
}
