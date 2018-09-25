var MongoClient = require('mongodb').MongoClient;
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
	}
}
