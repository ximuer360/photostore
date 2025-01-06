const db = require('../config/db');

class Image {
  static create(imageData) {
    return new Promise((resolve, reject) => {
      const { title, filename, filepath, mimetype, size, is_public } = imageData;
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          db.run(
            `INSERT INTO images (title, filename, filepath, mimetype, size, is_public)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, filename, filepath, mimetype, size, is_public],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              
              // 获取插入的记录
              db.get('SELECT * FROM images WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                
                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                  } else {
                    resolve(row);
                  }
                });
              });
            }
          );
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }

  static update(id, data) {
    return new Promise(async (resolve, reject) => {
      const { title, is_public, tags } = data;
      
      // 开始事务
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          // 更新图片信息
          db.run(
            'UPDATE images SET title = ?, is_public = ? WHERE id = ?',
            [title, is_public, id]
          );

          // 如果提供了标签，先删除旧标签
          if (tags) {
            db.run('DELETE FROM image_tags WHERE image_id = ?', [id]);
            
            // 添加新标签
            for (const tagName of tags) {
              // 尝试插入标签（如果不存在）
              db.run(
                'INSERT OR IGNORE INTO tags (name) VALUES (?)',
                [tagName.trim().toLowerCase()]
              );
              
              // 获取标签ID并添加关联
              db.get(
                'SELECT id FROM tags WHERE name = ?',
                [tagName.trim().toLowerCase()],
                (err, tag) => {
                  if (err) throw err;
                  if (tag) {
                    db.run(
                      'INSERT OR IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)',
                      [id, tag.id]
                    );
                  }
                }
              );
            }
          }

          // 提交事务
          db.run('COMMIT', async (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
            } else {
              // 获取更新后的图片信息
              const updatedImage = await Image.getImageWithTags(id);
              resolve(updatedImage);
            }
          });
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
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
        `SELECT i.*, GROUP_CONCAT(t.name) as tags
         FROM images i
         LEFT JOIN image_tags it ON i.id = it.image_id
         LEFT JOIN tags t ON it.tag_id = t.id
         WHERE i.title LIKE ? OR i.filename LIKE ?
         GROUP BY i.id
         ORDER BY i.created_at DESC`,
        [`%${search}%`, `%${search}%`],
        (err, rows) => {
          if (err) reject(err);
          else {
            rows.forEach(row => {
              row.tags = row.tags ? row.tags.split(',') : [];
            });
            resolve(rows);
          }
        }
      );
    });
  }

  static async addTags(imageId, tagNames) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          for (const tagName of tagNames) {
            // 尝试插入标签（如果不存在）
            db.run(
              'INSERT OR IGNORE INTO tags (name) VALUES (?)',
              [tagName.trim().toLowerCase()]
            );
            
            // 获取标签ID并添加关联
            db.get(
              'SELECT id FROM tags WHERE name = ?',
              [tagName.trim().toLowerCase()],
              (err, tag) => {
                if (err) throw err;
                if (tag) {
                  db.run(
                    'INSERT OR IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)',
                    [imageId, tag.id]
                  );
                }
              }
            );
          }

          // 提交事务
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
            } else {
              resolve();
            }
          });
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }

  static async removeTags(imageId, tagIds) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM image_tags WHERE image_id = ? AND tag_id IN (?)',
        [imageId, tagIds.join(',')],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static async getImageWithTags(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT i.*, GROUP_CONCAT(t.name) as tags
         FROM images i
         LEFT JOIN image_tags it ON i.id = it.image_id
         LEFT JOIN tags t ON it.tag_id = t.id
         WHERE i.id = ?
         GROUP BY i.id`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else {
            if (row) {
              row.tags = row.tags ? row.tags.split(',') : [];
            }
            resolve(row);
          }
        }
      );
    });
  }

  static async getAllWithTags() {
    return new Promise((resolve, reject) => {
      console.log('Fetching all images with tags...');
      
      // 先获取所有图片
      db.all(
        'SELECT * FROM images ORDER BY created_at DESC',
        [],
        async (err, images) => {
          if (err) {
            console.error('Error fetching images:', err);
            reject(err);
            return;
          }

          try {
            // 为每个图片获取标签
            const imagesWithTags = await Promise.all(images.map(async (image) => {
              return new Promise((resolve, reject) => {
                db.all(
                  `SELECT t.name 
                   FROM tags t
                   JOIN image_tags it ON t.id = it.tag_id
                   WHERE it.image_id = ?`,
                  [image.id],
                  (err, tags) => {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve({
                      ...image,
                      tags: tags.map(t => t.name)
                    });
                  }
                );
              });
            }));

            console.log('Images with tags:', imagesWithTags);
            resolve(imagesWithTags);
          } catch (error) {
            console.error('Error processing images:', error);
            reject(error);
          }
        }
      );
    });
  }

  static async getAllTags() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          t.*,
          (SELECT COUNT(*) FROM image_tags WHERE tag_id = t.id) as usage_count
        FROM tags t
        ORDER BY t.created_at DESC
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error getting tags:', err);
          reject(err);
          return;
        }

        const tags = rows.map(row => ({
          id: row.id,
          name: row.name,
          created_at: row.created_at,
          usage_count: parseInt(row.usage_count || '0', 10)
        }));

        console.log('Retrieved tags:', tags);
        resolve(tags);
      });
    });
  }

  static async createTag(name) {
    return new Promise((resolve, reject) => {
      const normalizedName = name.trim().toLowerCase();
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // 先检查标签是否已存在
        db.get(
          'SELECT * FROM tags WHERE name = ?',
          [normalizedName],
          (err, existingTag) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            if (existingTag) {
              db.run('ROLLBACK');
              reject({ code: 'SQLITE_CONSTRAINT', message: '标签已存在' });
              return;
            }

            // 如果标签不存在，创建新标签
            db.run(
              'INSERT INTO tags (name) VALUES (?)',
              [normalizedName],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                
                // 获取新创建的标签
                db.get(
                  'SELECT * FROM tags WHERE id = ?',
                  [this.lastID],
                  (err, newTag) => {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(err);
                    } else {
                      db.run('COMMIT', (err) => {
                        if (err) {
                          db.run('ROLLBACK');
                          reject(err);
                        } else {
                          resolve(newTag);
                        }
                      });
                    }
                  }
                );
              }
            );
          }
        );
      });
    });
  }

  static async updateTag(id, name) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tags SET name = ? WHERE id = ?',
        [name.trim().toLowerCase(), id],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          db.get('SELECT * FROM tags WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      );
    });
  }

  static async deleteTag(id) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // 先检查标签是否在使用
        db.get(
          'SELECT COUNT(*) as count FROM image_tags WHERE tag_id = ?',
          [id],
          (err, result) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            if (result.count > 0) {
              db.run('ROLLBACK');
              reject(new Error('标签正在使用中，无法删除'));
              return;
            }
            
            // 如果没有使用，则删除标签
            db.run('DELETE FROM tags WHERE id = ?', [id], (err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
              } else {
                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }
            });
          }
        );
      });
    });
  }
}

module.exports = Image; 