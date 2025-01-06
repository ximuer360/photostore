const db = require('../config/db');

class Image {
  static create(imageData) {
    return new Promise((resolve, reject) => {
      const { title, filename, filepath, mimetype, size, is_public } = imageData;
      
      db.run(
        `INSERT INTO images (title, filename, filepath, mimetype, size, is_public)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, filename, filepath, mimetype, size, is_public],
        function(err) {
          if (err) return reject(err);
          
          // 获取插入的记录
          db.get('SELECT * FROM images WHERE id = ?', [this.lastID], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM images ORDER BY created_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM images WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM images WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static findByTitle(search) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM images 
         WHERE title LIKE ? OR filename LIKE ?
         ORDER BY created_at DESC`,
        [`%${search}%`, `%${search}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static update(id, data) {
    return new Promise((resolve, reject) => {
      const { title, is_public } = data;
      db.run(
        'UPDATE images SET title = ?, is_public = ? WHERE id = ?',
        [title, is_public, id],
        function(err) {
          if (err) return reject(err);
          
          db.get('SELECT * FROM images WHERE id = ?', [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
        }
      );
    });
  }
}

module.exports = Image; 