const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imageController = require('../controllers/imageController');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    console.log('Upload path:', uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    console.log('Received file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('只能上传图片文件！'), false);
      return;
    }
    cb(null, true);
  }
}).single('image');

// 上传路由
router.post('/upload', (req, res) => {
  console.log('Upload request received');
  
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload middleware error:', err);
      return res.status(400).json({ 
        error: err.message || '上传失败',
        details: err.stack
      });
    }

    try {
      await imageController.uploadImage(req, res);
    } catch (error) {
      console.error('Upload controller error:', error);
      res.status(500).json({ 
        error: '上传失败',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
});

// 其他路由
router.get('/', imageController.getImages);
router.get('/search', imageController.searchImages);
router.get('/:id', imageController.getImage);
router.delete('/:id', imageController.deleteImage);
router.put('/:id', imageController.updateImage);

module.exports = router;