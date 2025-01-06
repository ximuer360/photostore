const Image = require('../models/imageModel');
const path = require('path');
const fs = require('fs').promises;

const imageController = {
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '请选择要上传的图片' });
      }

      console.log('Uploading file:', {
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      const imageData = {
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        filepath: '/uploads/' + req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        is_public: req.body.is_public === 'true'
      };

      const image = await Image.create(imageData);
      console.log('Image saved to database:', image);
      res.status(201).json(image);
    } catch (err) {
      console.error('Upload error:', err);
      // 如果数据库操作失败，删除已上传的文件
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        try {
          await fs.unlink(filePath);
        } catch (unlinkErr) {
          console.error('Error deleting file:', unlinkErr);
        }
      }
      res.status(500).json({ 
        error: '上传失败',
        details: err.message
      });
    }
  },

  async getImages(req, res) {
    try {
      const { search } = req.query;
      let images;
      
      if (search) {
        // 使用 LIKE 进行模糊搜索
        images = await Image.findByTitle(search);
      } else {
        images = await Image.findAll();
      }
      
      res.json(images);
    } catch (err) {
      console.error('Error fetching images:', err);
      res.status(500).json({ error: '获取图片列表失败' });
    }
  },

  async getImage(req, res) {
    try {
      const image = await Image.findById(req.params.id);
      if (!image) {
        return res.status(404).json({ error: '图片不存在' });
      }
      res.json(image);
    } catch (err) {
      console.error('Error fetching image:', err);
      res.status(500).json({ error: '获取图片失败' });
    }
  },

  async deleteImage(req, res) {
    try {
      const image = await Image.findById(req.params.id);
      if (!image) {
        return res.status(404).json({ error: '图片不存在' });
      }

      // 删除文件
      const filePath = path.join(__dirname, '../uploads', image.filename);
      await fs.unlink(filePath);

      await Image.delete(req.params.id);
      res.json({ message: '删除成功' });
    } catch (err) {
      console.error('Error deleting image:', err);
      res.status(500).json({ error: '删除失败' });
    }
  },

  async searchImages(req, res) {
    try {
      const { title } = req.query;
      const images = await Image.findByTitle(title);
      res.json(images);
    } catch (err) {
      console.error('Error searching images:', err);
      res.status(500).json({ error: '搜索图片失败' });
    }
  },

  async updateImage(req, res) {
    try {
      const { id } = req.params;
      const { title, is_public } = req.body;
      
      const image = await Image.findById(id);
      if (!image) {
        return res.status(404).json({ error: '图片不存在' });
      }

      const updatedImage = await Image.update(id, { title, is_public });
      res.json(updatedImage);
    } catch (err) {
      console.error('Error updating image:', err);
      res.status(500).json({ error: '更新失败', details: err.message });
    }
  }
};

module.exports = imageController; 