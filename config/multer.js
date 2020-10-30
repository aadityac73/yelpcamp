const multer = require('multer');

const storage = multer.diskStorage({
	filename: (req, file, cb) => {
		cb(null, file.originalname + '-' + Date.now());
	}
});

const imageFilter = (req, file, cb) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
		return cb(
			new Error('Only image files are allowed'),
			false
		);
	}
	cb(null, true);
};

const upload = multer({
	storage: storage,
	fileFilter: imageFilter
});

module.exports = upload;
