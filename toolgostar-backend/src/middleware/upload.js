const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./error');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'featuredImage') {
    // For featured image, allow jpeg, jpg, png, gif
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
      cb(null, true);
    } else {
      cb(new AppError('Only .jpg, .png and .gif images are allowed!', 400), false);
    }
  } else if (file.fieldname === 'catalog') {
    // For catalog, allow only pdf
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only .pdf files are allowed for catalogs!', 400), false);
    }
  } else {
    // For any other file, reject
    cb(new AppError('Invalid file field!', 400), false);
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20 // 20MB file size limit for product images
  },
  fileFilter: fileFilter
});

// Middleware to handle multiple fields
const uploadProductFiles = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'catalog', maxCount: 1 }
]);

module.exports = { uploadProductFiles };
