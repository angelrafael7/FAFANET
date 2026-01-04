const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { app } = require('electron');

class Database {
    constructor() {
        this.dbPath = path.join(app.getPath('userData'), 'ip-tracker.db');
        this.db = new sqlite3.Database(this.dbPath);
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Tabela de usuários
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) reject(err);
                });

                // Tabela de histórico
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS login_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        ip_public TEXT,
                        ip_local TEXT,
                        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                `, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    async registerUser(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                
                this.db.run(
                    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                    [userData.name, userData.email, hashedPassword],
                    function(err) {
                        if (err) {
                            resolve({ success: false, error: 'Email já cadastrado' });
                        } else {
                            resolve({ 
                                success: true, 
                                userId: this.lastID,
                                message: 'Usuário registrado com sucesso!' 
                            });
                        }
                    }
                );
            } catch (error) {
                resolve({ success: false, error: error.message });
            }
        });
    }

    async authenticateUser(email, password) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                async (err, user) => {
                    if (err || !user) {
                        resolve({ success: false, error: 'Usuário não encontrado' });
                        return;
                    }

                    const isValid = await bcrypt.compare(password, user.password);
                    
                    if (!isValid) {
                        resolve({ success: false, error: 'Senha incorreta' });
                        return;
                    }

                    resolve({
                        success: true,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    });
                }
            );
        });
    }

    async getLoginHistory(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM login_history WHERE user_id = ? ORDER BY login_time DESC LIMIT 20',
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    async getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC',
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;