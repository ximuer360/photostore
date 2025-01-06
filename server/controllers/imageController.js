const Image = require('../models/imageModel');
const path = require('path');
const fs = require('fs').promises;

const imageController = {
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '请选择要上传的图片' });
      }

      const imageData = {
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        filepath: '/uploads/' + req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        is_public: req.body.is_public === 'true'
      };

      const image = await Image.create(imageData);

      if (req.body.tags) {
        try {
          const tags = JSON.parse(req.body.tags);
          if (Array.isArray(tags) && tags.length > 0) {
            await Image.addTags(image.id, tags);
          }
        } catch (tagError) {
          console.error('Error adding tags:', tagError);
        }
      }

      const imageWithTags = await Image.getImageWithTags(image.id);
      res.status(201).json(imageWithTags);
    } catch (err) {
      console.error('Upload error:', err);
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
      console.log('Getting images...');
      const { search } = req.query;
      let images;
      
      if (search) {
        console.log('Searching for:', search);
        images = await Image.findByTitle(search);
      } else {
        console.log('Getting all images with tags');
        images = await Image.getAllWithTags();
      }
      
      if (!images) {
        console.error('No images data received');
        throw new Error('No data received from database');
      }

      if (!Array.isArray(images)) {
        console.error('Invalid images data type:', typeof images);
        throw new Error('Invalid data format');
      }

      console.log('Sending images to client:', JSON.stringify(images, null, 2));
      res.json(images);
    } catch (err) {
      console.error('Error in getImages:', err);
      res.status(500).json({ 
        error: '获取图片列表失败',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
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
      const { title, is_public, tags } = req.body;
      
      const image = await Image.findById(id);
      if (!image) {
        return res.status(404).json({ error: '图片不存在' });
      }

      // 开始事务
      await Image.update(id, { title, is_public });
      
      // 如果提供了标签，更新标签
      if (tags && Array.isArray(tags)) {
        await Image.addTags(id, tags);
      }

      // 获取更新后的完整信息
      const imageWithTags = await Image.getImageWithTags(id);
      res.json(imageWithTags);
    } catch (err) {
      console.error('Error updating image:', err);
      res.status(500).json({ error: '更新失败', details: err.message });
    }
  },

  async getTags(req, res) {
    try {
      console.log('Getting all tags...');
      const tags = await Image.getAllTags();
      console.log('Tags retrieved:', tags);
      res.json(tags);
    } catch (err) {
      console.error('Error getting tags:', err);
      res.status(500).json({ error: '获取标签失败' });
    }
  },

  async createTag(req, res) {
    try {
      const { name } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: '标签名称不能为空' });
      }

      const tag = await Image.createTag(name);
      res.status(201).json(tag);
    } catch (err) {
      console.error('Error creating tag:', err);
      if (err.code === 'SQLITE_CONSTRAINT') {
        res.status(409).json({ error: '标签已存在' });
      } else {
        res.status(500).json({ error: '创建标签失败' });
      }
    }
  },

  async updateTag(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const tag = await Image.updateTag(id, name);
      if (!tag) {
        return res.status(404).json({ error: '标签不存在' });
      }
      res.json(tag);
    } catch (err) {
      console.error('Error updating tag:', err);
      res.status(500).json({ error: '更新标签失败' });
    }
  },

  async deleteTag(req, res) {
    try {
      const { id } = req.params;
      await Image.deleteTag(id);
      res.json({ message: '删除成功' });
    } catch (err) {
      console.error('Error deleting tag:', err);
      res.status(500).json({ error: '删除标签失败' });
    }
  }
};

module.exports = imageController; 