const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');
// Ensure directory exists
if (!fs.existsSync(path.join(__dirname, 'server'))) {
    fs.mkdirSync(path.join(__dirname, 'server'));
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature REAL,
        humidity REAL,
        soil REAL,
        ir TEXT,
        time TEXT,
        date TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);
});

const LCD_FILE = path.join(__dirname, 'server', 'lcd.txt');

// --- Auth APIs ---
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], function(err) {
        if (err) return res.status(400).json({ success: false, message: 'Email already exists' });
        res.json({ success: true, message: 'Registration successful' });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
        if (err || !user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        res.json({ success: true, user: { name: user.name, email: user.email } });
    });
});

// --- Sensor APIs ---
app.post('/api/save-data', (req, res) => {
    const { temperature, humidity, soil, ir } = req.body;
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    const date = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

    db.run('INSERT INTO records (temperature, humidity, soil, ir, time, date) VALUES (?, ?, ?, ?, ?, ?)', 
    [temperature, humidity, soil, ir, time, date], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

app.get('/api/save-data', (req, res) => {
    const { temperature, humidity, soil, ir, temp, hum } = req.query;
    // Support legacy parameters just in case
    const t = temperature || temp;
    const h = humidity || hum;
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    const date = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

    db.run('INSERT INTO records (temperature, humidity, soil, ir, time, date) VALUES (?, ?, ?, ?, ?, ?)', 
    [t, h, soil || 0, ir || 'Clear', time, date], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

app.get('/api/get-data', (req, res) => {
    db.all('SELECT * FROM records ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(rows);
    });
});

app.get('/api/latest', (req, res) => {
    db.get('SELECT * FROM records ORDER BY id DESC LIMIT 1', [], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(row || {});
    });
});

app.delete('/api/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM records WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });
});

// --- LCD APIs ---
app.get('/api/lcd-text', (req, res) => {
    if (!fs.existsSync(LCD_FILE)) fs.writeFileSync(LCD_FILE, 'Welcome to SISTec');
    const text = fs.readFileSync(LCD_FILE, 'utf8');
    res.send(text);
});

app.post('/api/lcd-save', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).send('No text provided');
    fs.writeFileSync(LCD_FILE, text.substring(0, 16));
    res.json({ success: true, message: 'LCD Message Updated' });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
