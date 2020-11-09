require('dotenv').config();
var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	flash = require('connect-flash'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	methodOverride = require('method-override'),
	YelpCamp = require('./models/campground'),
	Comment = require('./models/comments'),
	User = require('./models/user');

var campgroundRoutes = require('./routes/campgrounds'),
	commentsRoutes = require('./routes/comments'),
	indexRoutes = require('./routes/index');

const PORT = process.env.PORT || 3000;
const URI = process.env.DATABASEURL;
mongoose.connect(URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

// var seedDB = require("./seed");
// seedDB();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use(
	require('express-session')({
		secret: 'my name is aditya',
		resave: false,
		saveUninitialized: false
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
	res.locals.currUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use('/', indexRoutes);
app.use('/components', campgroundRoutes);
app.use('/components/:id/comments', commentsRoutes);

app.use(methodOverride('_method'));

app.listen(PORT, function() {
	console.log('The YelpCamp Server Has Started!');
});
