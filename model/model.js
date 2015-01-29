var mongoose = require('mongoose')
,		bcrypt   = require('bcrypt')
,		_ 			 = require('underscore')
,		Schema   = mongoose.Schema
,		id       = mongoose.mongo.ObjectID;//call new for create instance


mongoose.connect('mongodb://localhost/MEAN',function(err,res){
	if(err) console.log(err);
	else 		console.log("Conect at: MEAN");
});

var schema = new Schema({
	name:{type:String,unique:true},
	pass:{type:String,unique:true},
	post:[{
		name:String,
		body:String,
		pic :String,
		_id:String,
		starts:Number,
		createAt:{type:Date,default:Date.now},
		images:[{url:String}],
		comments:[{
			name:String,
			body:String,
			pic :String,
			_id:String,
			starts:Number,
			createAt:{type:Date,default:Date.now},
			images:[{url:String}]
		}]
	}],
	pic:String,
	email:String,
	createAt:{type:Date,default:Date.now},
	media:{
		video:[{type:String}],
		audio:[{type:String}],
		docs:{pdf:[{type:String}]}
	},
	isLogin:{type:Boolean,default:true},
	contactos:[{
		name:String,
		message:[{
			text:String,
			createAt:{type:Date,default:Date.now},
			media:{
				video:[],
				audio:[],
				docs:{pdf:[]}
			}
		}]
	}]
});

var encryptPass = function(next) {
	var self = this;
	bcrypt.genSalt(10, function(err, salt) {
		//generate salt = 'fwefe23o2mr3ion12' to mix with the pass
    if (err) return next(err);
    bcrypt.hash(self.pass,salt, function(err, hash) {
     // override the textplain password with the hashed one
      if (err) return next(err);
      self.pass = hash;
      next();
    });
  });
};

var Auth = function(query,cb) {
 	var self = this;
 	self.findOne({name:query.name},function(err,docs) {
 		if(err) return cb(err,null);
	  bcrypt.compare(query.pass,docs.pass,function(err, isMatch) {
	 		if(err) return cb(err,null);
	 		return cb(null,docs);
	  });
 	});
};

var getNews = function(cb) {
	var self = this;
	self.find({},function(err,docs) {
		if(err) return cb({
			success:false,
			message:'He could not consult the database',
			err		 : err
		});	
		if(docs){
			if(_.isArray(docs)) {
				var news = _.map(docs,function(doc) { 
					return {name:doc.name,email:doc.email} 
				});//filter the data for dont show pass an more data
				return cb(null,news);
			}else{
				var doc = docs;
				return cb(null,{name:doc.name,email:doc.email});
			};
		}	
	});
};

schema.pre("save",encryptPass);//hashed the pass before save into the store 
schema.statics.Auth = Auth;//authenticate comparing the password candidate and the pass hashed
schema.statics.getNews = getNews;

module.exports = function(key,jwt) {

	schema.methods.getProfile = function(query,token,cb) {
  	var self = this;
	  jwt.verify(token,key,function(err,decode) {
		  	self.model('user').findOne(query,function(err,docs) {
			 		if(decode && docs && String(docs["_id"]) === decode["ID"] ) {
			 			//complete view
			 			console.log('Complete view');
			 			docs.limit = false;
			 			return cb(null,docs);
			 		}else if(err){
			 			console.log(err);
			 			//something wrong in the query
			 			return cb(err,null);
			 		}else{ 
			 			//Limit view 
			 			console.log('Limit view');
			 			return cb(null,{
			 				name:docs.name,
			 				email:docs.email,
			 				limit:true
			 			});				 		
			 		
			 		}
			 	});//end find with token	  		

	  });//end verify
	  /*
			if the user cannot be authenticate because not have token access
			return the limit view of the user in request
	  */
	}//end getProfile

	return mongoose.model('user',schema);
};



