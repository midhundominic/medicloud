const multer = require('multer');
const path = require('path');

// Set storage engine for PDFs
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/testResults'); // Destination folder for test results
  },
  filename: function(req, file, cb) {
    cb(null, 'test-result-' + Date.now() + '.pdf');
  }
});

// Check file type
const checkFileType = (file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'));
  }
};

// Create multer upload middleware
const pdfUpload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = pdfUpload;