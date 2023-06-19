const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      'PIMG' +
        '.' +
        Date.now() +
        Math.round(Math.random() * 1000000000) +
        '.' +
        file.mimetype.split('/')[1]
    );
  },
});

const fileFilter = (req, file, cb) => {
  console.log('masuk sini', file);
  if (
    file.mimetype.split('/')[1] === 'jpeg' ||
    file.mimetype.split('/')[1] === 'png' ||
    file.mimetype.split('/')[1] === 'jpg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('file format not supported'));
  }
};

exports.multerUpload = multer({ storage: storage, fileFilter: fileFilter });
