const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imageController = require('../controllers/imageController');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件！'));
    }
  }
});

// 标签管理相关路由 - 放在具体 id 路由之前
router.get('/tags', imageController.getTags);
router.post('/tags', imageController.createTag);
router.put('/tags/:id', imageController.updateTag);
router.delete('/tags/:id', imageController.deleteTag);

// 上传路由
router.post('/upload', upload.single('image'), imageController.uploadImage);

// 其他路由
router.get('/', imageController.getImages);
router.get('/search', imageController.searchImages);

// 具体 id 的路由放在最后
router.get('/:id', imageController.getImage);
router.delete('/:id', imageController.deleteImage);
router.put('/:id', imageController.updateImage);

module.exports = router;