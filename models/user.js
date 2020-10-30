var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = mongoose.Schema({
	usrname: String,
	password: String,
	email: String,
	phone: String,
	fullName: String,
	image: String,
	imageId: String,
	joind: { type: Date, default: Date.now }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
