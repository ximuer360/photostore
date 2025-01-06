const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/photostore.db');

// 确保数据目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 初始化数据库表
function initDatabase(db) {
  return new Promise((resolve, reject) => {
    console.log('Initializing database...');
    const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    const statements = initSql.split(';').filter(stmt => stmt.trim());

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      for (const statement of statements) {
        if (statement.trim()) {
          db.run(statement, (err) => {
            if (err) {
              console.error('Error executing statement:', err);
              console.error('Statement:', statement);
              reject(err);
            }
          });
        }
      }

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err);
          reject(err);
        } else {
          console.log('Database tables initialized successfully');
          resolve();
        }
      });
    });
  });
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    throw err;
  }
  console.log('Connected to database at:', dbPath);
  
  // 验证数据库表
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error checking tables:', err);
    } else {
      console.log('Available tables:', tables);
    }
  });
});

// 添加错误处理
db.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = db; 