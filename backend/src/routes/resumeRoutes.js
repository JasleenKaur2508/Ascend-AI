const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type '${ext}'. Please upload a valid PDF (.pdf), Word (.docx), or Text (.txt) file.`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Middleware to handle multer file upload errors gracefully
const handleUpload = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'The uploaded file exceeds the 10MB file size limit. Please upload a smaller file.'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: `File upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    next();
  });
};

router.post('/upload', protect, handleUpload, resumeController.uploadAndAnalyze);
router.get('/history', protect, resumeController.getResumeHistory);
router.get('/latest', protect, resumeController.getLatestResume);
router.get('/:id', protect, resumeController.getResumeById);

module.exports = router;
