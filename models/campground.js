var mongoose = require('mongoose');

var campground = new mongoose.Schema({
	name: String,
	price: Number,
	image: String,
	imageId: String,
	description: String,
	location: String,
	createdAt: {
		type: Date,
		default: Date.now
	},
	tags: Array,
	booking: {
		start: String,
		end: String
	},
	phone: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
		}
	],
	rateAvg: Number,
	rateCount: Number,
	hasRated: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	]
});

module.exports = mongoose.model('YelpCamp', campground);
