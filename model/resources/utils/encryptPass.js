module.exports = function(genHash) {
	return function(next) {
		var self = this;
		if(self.next) return next();
		genHash(self.password,function(err,hash) {
			if(err) return next(err);
			self.password = hash;
			next();
		});
	};//end encryptPass

};
