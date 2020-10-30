const express = require('express'),
	router = express.Router(),
	methodOverride = require('method-override'),
	passport = require('passport'),
	YelpCamp = require('../models/campground'),
	Comment = require('../models/comments'),
	middleware = require('../middleware'),
	upload = require('../config/multer'),
	cloudinary = require('../config/cloudinary');

const moment = require('moment');
const months = [
	'',
	'Jan',
	'Feb',
	'March',
	'April',
	'May',
	'June',
	'July',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

router.use(methodOverride('_method'));

router.get('/', async (req, res) => {
	try {
		const campgrounds = await YelpCamp.find({});
		if (!campgrounds) {
			req.flash('error', 'No campgrouds found!');
			return res.redirect('back');
		}
		res.render('campgrounds/components', { camps: campgrounds });
	} catch (err) {
		next(err);
	}
});

router.post('/', middleware.isLoggedIn, upload.single('image'), (req, res) => {
	cloudinary.v2.uploader.upload(
		req.file.path,
		{
			width: 1500,
			height: 1000,
			gravity: 'center',
			crop: 'scale'
		},
		(err, result) => {
			if (err) {
				req.flash('error', 'Image upload failed!');
				res.redirect('back');
			} else {
				req.body.image = result.secure_url;
				req.body.imageId = result.public_id;
				const campground = {
					name: req.body.name,
					price: req.body.price,
					image: req.body.image,
					imageId: req.body.imageId,
					description: req.body.desc,
					location: req.body.location,
					phone: req.body.phone,
					tags: req.body.tags.split(', '),
					booking: {
						start: months[req.body.start],
						end: months[req.body.end]
					},
					author: {
						id: req.user._id,
						username: req.user.username
					}
				};
				YelpCamp.create(campground, (err) => {
					if (err) {
						req.flash('error', 'Campgronud not added!');
						res.redirect('back');
					} else {
						req.flash('success', 'Campground Added Successfully!');
						res.redirect('/components');
					}
				});
			}
		},
		{
			moderation: 'webpurify'
		}
	);
});

router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

router.get('/:id', (req, res) => {
	YelpCamp.findById(req.params.id).populate('comments').exec((err, camp) => {
		if (err || !camp) {
			req.flash('error', 'Campground not found');
			res.redirect('back');
		} else {
			res.render('campgrounds/show', {
				camp: camp,
				moment: moment
			});
		}
	});
});

router.get('/:id/edit', middleware.checkCapmgroundOwnership, (req, res) => {
	YelpCamp.findById(req.params.id, (err, foundCamp) => {
		if (err || !foundCamp) {
			req.flash('error', 'Campground not found!!');
			res.redirect('back');
		} else {
			res.render('campgrounds/edit', {
				camp: foundCamp,
				months: months
			});
		}
	});
});

router.put(
	'/:id',
	middleware.checkCapmgroundOwnership,
	upload.single('image'),
	(req, res) => {
		YelpCamp.findById(req.params.id, (err, camp) => {
			if (err) {
				console.log(err);
			} else {
				cloudinary.v2.api.delete_resources([ camp.imageId ], (error, result) => {});
			}
		});
		cloudinary.v2.uploader.upload(
			req.file.path,
			{
				width: 1500,
				height: 1000,
				gravity: 'center',
				crop: 'scale'
			},
			(err, result) => {
				if (err) {
					req.flash('error', 'Image upload failed!');
					res.redirect('back');
				} else {
					req.body.image = result.secure_url;
					req.body.imageId = result.public_id;
					const campground = {
						name: req.body.name,
						price: req.body.price,
						image: req.body.image,
						imageId: req.body.imageId,
						description: req.body.desc,
						location: req.body.location,
						phone: req.body.phone,
						tags: req.body.tags.split(', '),
						booking: {
							start: months[req.body.start],
							end: months[req.body.end]
						}
					};
					YelpCamp.findByIdAndUpdate(req.params.id, campground, (err) => {
						if (err) {
							req.flash('error', 'Campgronud updation failed!');
							res.redirect('back');
						} else {
							req.flash('success', 'Campground Updated Successfully!');
							res.redirect('/components');
						}
					});
				}
			},
			{
				moderation: 'webpurify'
			}
		);
	}
);

router.delete('/:id', middleware.checkCapmgroundOwnership, (req, res) => {
	YelpCamp.findByIdAndRemove(req.params.id, (err, campground) => {
		if (err) {
			req.flash('error', 'Something went wrong!');
			res.redirect('/components');
		} else {
			cloudinary.v2.api.delete_resources([ campground.imageId ], (error, result) => {});
			campground.comments.forEach((comment) => {
				Comment.findByIdAndRemove(comment, (err) => {});
			});
			req.flash('success', 'Campground Deleted Successfully');
			res.redirect('/components');
		}
	});
});

module.exports = router;
