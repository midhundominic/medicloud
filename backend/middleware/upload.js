const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'ddrazuqb0',
  api_key: '762961636815798',
  api_secret: process.env.CLOUDINARY_SECRET,
  timeout: 120000 // 2 minutes timeout for Cloudinary
});

const createStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      resource_type: 'auto', // Allow auto-detection of file type
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      transformation: [{ quality: "auto:good" }] // Remove size limit for PDFs
    }
  });
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Please upload a PDF or image file.'), false);
  }
};

const createUploadMiddleware = (folderName) => {
  const storage = createStorage(folderName);
  
  return multer({
    storage: storage,
    limits: {
      fileSize: 15 * 1024 * 1024, // 15MB limit
      fieldSize: 20 * 1024 * 1024 
    },
    fileFilter: fileFilter
  }).single('file');
};
  

module.exports = {
  doctorProfileUpload: createUploadMiddleware('doctor-profiles'),
  patientProfileUpload: createUploadMiddleware('patient-profiles'),
  testResultUpload: createUploadMiddleware('test-results'),
  prescriptionUpload: createUploadMiddleware('prescriptions')
};