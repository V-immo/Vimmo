const fs = require('fs');
const path = require('path');

// Simple JSON-based database (no native modules needed)
const DB_PATH = path.join(__dirname, 'users.json');

// Initialize database
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], nextId: 1 }, null, 2));
  }
  console.log('✅ Database initialized');
}

// Read database
function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

// Write database
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Database operations (SQLite-like interface)
const db = {
  prepare: (sql) => {
    return {
      // GET single row
      get: (...params) => {
        const data = readDB();

        if (sql.includes('WHERE email = ?')) {
          return data.users.find(u => u.email === params[0]);
        }
        if (sql.includes('WHERE verification_token = ?')) {
          return data.users.find(u => u.verification_token === params[0]);
        }
        if (sql.includes('WHERE reset_token = ?')) {
          return data.users.find(u => u.reset_token === params[0] && u.reset_token_expires > params[1]);
        }
        return null;
      },

      // RUN (insert/update)
      run: (...params) => {
        const data = readDB();

        if (sql.includes('INSERT INTO users')) {
          const newUser = {
            id: data.nextId++,
            email: params[0],
            password_hash: params[1],
            first_name: params[2],
            last_name: params[3],
            role: params[4],
            verification_token: params[5],
            verified: 0,
            reset_token: null,
            reset_token_expires: null,
            created_at: new Date().toISOString()
          };
          data.users.push(newUser);
          writeDB(data);
          return { lastInsertRowid: newUser.id };
        }

        if (sql.includes('UPDATE users SET verified = 1')) {
          const user = data.users.find(u => u.id === params[0]);
          if (user) {
            user.verified = 1;
            user.verification_token = null;
            writeDB(data);
          }
          return {};
        }

        if (sql.includes('UPDATE users SET reset_token =') && sql.includes('reset_token_expires')) {
          const user = data.users.find(u => u.id === params[2]);
          if (user) {
            user.reset_token = params[0];
            user.reset_token_expires = params[1];
            writeDB(data);
          }
          return {};
        }

        if (sql.includes('UPDATE users SET password_hash =')) {
          const user = data.users.find(u => u.id === params[1]);
          if (user) {
            user.password_hash = params[0];
            user.reset_token = null;
            user.reset_token_expires = null;
            writeDB(data);
          }
          return {};
        }

        if (sql.includes('UPDATE users SET verification_token =') && !sql.includes('verified')) {
          const user = data.users.find(u => u.id === params[1]);
          if (user) {
            user.verification_token = params[0];
            writeDB(data);
          }
          return {};
        }

        return {};
      }
    };
  }
};

// Initialize on require
initDB();

module.exports = db;
