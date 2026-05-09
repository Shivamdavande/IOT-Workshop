const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./data.db', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Timezone offset for +5:30 (Asia/Kolkata)
function getIndianDateTime() {
  const now = new Date();
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const indiaTime = new Date(now.getTime() + offsetMs);
  return indiaTime;
}

// API 1: Save Temperature & Humidity (from ESP8266)
app.post('/api/sensor', (req, res) => {
  const { temperature, humidity } = req.body;

  if (temperature === undefined || humidity === undefined) {
    return res.status(400).json({ error: 'Missing temperature or humidity' });
  }

  db.run(
    'INSERT INTO sensor_data (temperature, humidity) VALUES (?, ?)',
    [temperature, humidity],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Data saved successfully' });
    }
  );
});

// API 1 (Alternative: GET method for ESP8266)
app.get('/api/sensor', (req, res) => {
  const { temp, humidity } = req.query;

  if (temp === undefined || humidity === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  db.run(
    'INSERT INTO sensor_data (temperature, humidity) VALUES (?, ?)',
    [parseFloat(temp), parseFloat(humidity)],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Data saved successfully' });
    }
  );
});

// API 2: Fetch text from lcd.txt
app.get('/api/lcd-text', (req, res) => {
  const lcdFilePath = path.join(__dirname, 'lcd.txt');

  fs.readFile(lcdFilePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.json({ text: 'WELCOME' });
      }
      return res.status(500).json({ error: 'File read error' });
    }
    res.json({ text: data.substring(0, 16) });
  });
});

// Authentication Routes
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }
      res.json({ success: true, message: 'Registration successful' });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get(
    'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Login error' });
      }

      if (!row) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({ success: true, user: row });
    }
  );
});

// Get all sensor data
app.get('/api/sensor-data', (req, res) => {
  db.all(
    'SELECT id, temperature, humidity, created_at FROM sensor_data ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const formattedRows = rows.map((row) => {
        const date = new Date(row.created_at);
        const offsetMs = 5.5 * 60 * 60 * 1000;
        const indiaTime = new Date(date.getTime() + offsetMs);

        const time = indiaTime.toLocaleTimeString('en-US', { hour12: true });
        const dateStr = indiaTime.toLocaleDateString('en-GB');

        return {
          id: row.id,
          temperature: row.temperature,
          humidity: row.humidity,
          time: time,
          date: dateStr,
        };
      });

      res.json(formattedRows);
    }
  );
});

// Get latest sensor data
app.get('/api/sensor-latest', (req, res) => {
  db.get(
    'SELECT temperature, humidity, created_at FROM sensor_data ORDER BY created_at DESC LIMIT 1',
    [],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.json({
          temperature: 0,
          humidity: 0,
          time: '',
          date: '',
        });
      }

      const date = new Date(row.created_at);
      const offsetMs = 5.5 * 60 * 60 * 1000;
      const indiaTime = new Date(date.getTime() + offsetMs);

      const time = indiaTime.toLocaleTimeString('en-US', { hour12: true });
      const dateStr = indiaTime.toLocaleDateString('en-GB');

      res.json({
        temperature: row.temperature,
        humidity: row.humidity,
        time: time,
        date: dateStr,
      });
    }
  );
});

// Save LCD text
app.post('/api/lcd-text', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text required' });
  }

  const lcdText = text.substring(0, 16);
  const lcdFilePath = path.join(__dirname, 'lcd.txt');

  fs.writeFile(lcdFilePath, lcdText, 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'File write error' });
    }
    res.json({ success: true, message: 'Text saved' });
  });
});

// Delete sensor data
app.delete('/api/sensor/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM sensor_data WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Delete failed' });
    }
    res.json({ success: true, message: 'Record deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`SISTec IoT Server running on port ${PORT}`);
});
