var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	User = require('../models/user'),
	upload = require('../config/multer'),
	cloudinary = require('../config/cloudinary');

router.get('/', function(req, res) {
	res.render('index');
});

router.get('/register', function(req, res) {
	res.render('register');
});

router.post(
	'/register',
	upload.single('image'),
	(req, res) => {
		if (req.file === undefined) {
			var newUser = new User({
				username: req.body.username,
				fullName: req.body.fullName,
				email: req.body.email,
				phone: req.body.phone,
				image: '',
				imageId: ''
			});
			User.register(
				newUser,
				req.body.password,
				(err, user) => {
					if (err) {
						req.flash('error', err.message);
						return res.redirect('/register');
					}
					passport.authenticate('local')(req, res, () => {
						req.flash(
							'success',
							'Welcome to YelpCamp ' + user.username
						);
						res.redirect('/components');
					});
				}
			);
		} else {
			cloudinary.v2.uploader.upload(
				req.file.path,
				{
					width: 400,
					height: 400,
					gravity: 'center',
					crop: 'scale'
				},
				(err, result) => {
					if (err) {
						req.flash('error', err.message);
						return res.redirect('back');
					}
					req.body.image = result.secure_url;
					req.body.imageId = result.public_id;
					const newUser = {
						username: req.body.username,
						email: req.body.email,
						fullName: req.body.fullName,
						phone: req.body.phone,
						image: req.body.image,
						imageId: req.body.imageId
					};
					User.register(
						newUser,
						req.body.password,
						(err, user) => {
							if (err) {
								req.flash('error', err.message);
								return res.redirect('back');
							}
							passport.authenticate(
								'local'
							)(req, res, () => {
								req.flash(
									'success',
									'Welcome to YelpCamp ' + user.username
								);
								res.redirect('/components');
							});
						}
					);
				},
				{
					moderation: 'webpurify'
				}
			);
		}
	}
);

router.get('/login', function(req, res) {
	res.render('login');
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/components',
		failureRedirect: '/login',
		failureFlash: 'Invalid Username or Password'
	}),
	function(req, res) {}
);

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!!');
	res.redirect('/components');
});

module.exports = router;
