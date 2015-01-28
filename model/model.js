var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var _      = require('underscore');

mongoose.connect('mongodb://localhost/MEAN',function(err,res){
	if(err) console.log(err);
	else 		console.log("Conect at: MEAN");
});

var schema = new Schema({
	name:{type:String,unique:true},
	pass:{type:String,unique:true},
	pic:String,
	email:String,
	createAt:{type:Date,default:Date.now},
	media:{
		video:[],
		audio:[],
		docs:{pdf:[]}
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
    if (err) return next(err);
    bcrypt.hash(self.pass,salt, function(err, hash) {
      if (err) return next(err);
      // override the textplain password with the hashed one
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

schema.pre("save",encryptPass);
schema.statics.Auth = Auth;

module.exports = function(key,jwt) {

	schema.methods.getProfile = function(query,token,cb) {
  	var self = this;
	  jwt.verify(token,key,function(err,decode) {
	  	if(decode || token === 'undefined') {
		  	self.model('user').findOne(query,function(error,docs) {
			 		if(decode && docs && String(docs["_id"]) === decode["ID"] ) {
			 			return cb(null,docs);
			 		}else if(error){
			 			return cb(error,null);
			 		}else{ 
			 			console.log('VISTA LIMITADA changes ');
			 			return cb(null,{name:docs.name,email:docs.email});				 		
			 		};
			 	});//end find with token	  		
	  	}
	  });	

	}//end getProfile

	return mongoose.model('user',schema);

};



