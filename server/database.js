const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

function initDB() {
    db.serialize(() => {
        // Tabela de usuários
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )`);

        // Tabela de imóveis
        db.run(`CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            type TEXT NOT NULL,
            location TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            area INTEGER,
            bedrooms INTEGER,
            bathrooms INTEGER,
            suites INTEGER,
            parking INTEGER,
            amenities TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabela de imagens
        db.run(`CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id INTEGER,
            url TEXT NOT NULL,
            alt TEXT,
            FOREIGN KEY(property_id) REFERENCES properties(id)
        )`);

        // Tabela de leads
        db.run(`CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            property_id INTEGER,
            message TEXT,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(property_id) REFERENCES properties(id)
        )`);

        // Tabela de configurações
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            data TEXT
        )`);

        // Inserir usuário admin padrão
        db.get("SELECT * FROM users WHERE email = 'admin@example.com'", [], (err, row) => {
            if (!row) {
                db.run(`INSERT INTO users (name, email, password, role) 
                       VALUES (?, ?, ?, ?)`, 
                       ['Admin', 'admin@example.com', 'senha123', 'admin']);
            }
        });
    });
}

module.exports = { db, initDB }; 