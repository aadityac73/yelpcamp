var express = require('express'),
	router = express.Router({ mergeParams: true }),
	methodOverride = require('method-override'),
	passport = require('passport'),
	YelpCamp = require('../models/campground'),
	Comment = require('../models/comments'),
	middleware = require('../middleware');

router.use(methodOverride('_method'));

router.get('/new', middleware.isLoggedIn, function(req, res) {
	YelpCamp.findById(req.params.id, function(err, campground) {
		if (err) {
			console.log(err);
		} else {
			res.render('comments/new', {
				campground: campground
			});
		}
	});
});

router.post('/', middleware.isLoggedIn, async (req, res) => {
	try {
		const campground = await YelpCamp.findById(req.params.id);
		if (!(campground instanceof YelpCamp)) {
			req.flash('error', 'Something went wrong!');
			return res.redirect('/components');
		}
		const rated = campground.hasRated.map((id) => String(id));
		if (rated.includes(String(req.user._id))) {
			req.flash(
				'error',
				"You've already reviewd this campgronud, please edit your review instead."
			);
			return res.redirect('back');
		}
		const comment = await Comment.create(req.body.comment);
		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		await comment.save();
		const comments = await Comment.find().where('_id').in(campground.comments).exec();
		if (comments.length === 0) {
			campground.rateAvg = req.body.comment.rating;
			campground.rateCount = 1;
		} else {
			let rateTotal = parseInt(req.body.comment.rating);
			comments.forEach((comment) => (rateTotal += comment.rating));
			campground.rateAvg = rateTotal / (comments.length + 1);
			campground.rateCount = comments.length + 1;
		}
		campground.hasRated.push(req.user._id);
		campground.comments.push(comment);
		await campground.save();
		req.flash('success', 'Comment Added Successfully');
		res.redirect('/components/' + campground._id);
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('back');
	}
});

router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
	YelpCamp.findById(req.params.id, function(err, foundCamp) {
		if (err || !foundCamp) {
			req.flash('error', 'No campground found!');
			res.redirect('back');
		} else {
			Comment.findById(req.params.comment_id, function(err, foundComment) {
				if (err) {
					console.log(err);
					res.redirect('/components' + req.params.id);
				} else {
					res.render('comments/edit', {
						camp: foundCamp,
						comment: foundComment
					});
				}
			});
		}
	});
});

router.put('/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
	try {
		const campground = await YelpCamp.findById(req.params.id);
		if (!(campground instanceof YelpCamp)) {
			req.flash('error', 'Something went wrong!');
			return res.redirect('/components');
		}
		const ids = campground.comments.map((id) => {
			if (id != req.params.comment_id) return String(id);
		});
		const comment = await Comment.findByIdAndUpdate(
			req.params.comment_id,
			req.body.comment
		);
		await comment.save();
		const comments = await Comment.find().where('_id').in(ids).exec();
		if (comments.length === 0) {
			campground.rateAvg = req.body.comment.rating;
			campground.rateCount = 1;
		} else {
			let rateTotal = parseInt(req.body.comment.rating);
			comments.forEach((comment) => (rateTotal += comment.rating));
			campground.rateAvg = rateTotal / (comments.length + 1);
			campground.rateCount = comments.length + 1;
		}
		await campground.save();
		req.flash('success', 'Comment Updated Successfully');
		res.redirect('/components/' + campground._id);
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('back');
	}
});

router.delete('/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
	try {
		const comment = await Comment.findByIdAndRemove(req.params.comment_id);
		if (comment === undefined || comment === null) {
			req.flash('error', 'Something went wrong!');
			return res.redirect('/components/' + req.params.id);
		}
		const camp = await YelpCamp.findById(req.params.id);
		if (camp === undefined || camp === null) {
			req.flash('error', 'Something went wrong!');
			return res.redirect('/components/' + req.params.id);
		}
		camp.comments = [
			...camp.comments.filter((comment) => comment != req.params.comment_id)
		];
		camp.hasRated = [ ...camp.hasRated.filter((user) => user != String(req.user._id)) ];
		if (camp.rateCount === 1) {
			camp.rateAvg = 0;
		} else {
			camp.rateAvg =
				(camp.rateAvg * camp.rateCount - comment.rating) / (camp.rateCount - 1);
		}
		camp.rateCount = camp.rateCount - 1;
		await camp.save();
		req.flash('success', 'Comment removed successfully!');
		res.redirect('back');
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('back');
	}
});

module.exports = router;
