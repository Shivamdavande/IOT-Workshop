# SISTec IoT Application 2026

Complete IoT monitoring system with web dashboard, database, and ESP8266 integration.

## Project Structure

```
IOT/
├── server.js                 # Node.js/Express backend
├── package.json             # Dependencies
├── Procfile                 # Render deployment
├── data.db                  # SQLite database (auto-created)
├── lcd.txt                  # LCD text storage
├── ESP8266_SISTec_IoT.ino  # Arduino/ESP8266 firmware
└── public/
    ├── index.html          # Login page
    ├── register.html       # Registration page
    └── dashboard.html      # Main dashboard
```

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

Server runs on `http://localhost:3000`

### 3. Access Application
- **Login**: http://localhost:3000/index.html
- **Register**: http://localhost:3000/register.html
- **Dashboard**: http://localhost:3000/dashboard.html (after login)

## Features

### Web Dashboard
- User authentication (login/register)
- Real-time temperature & humidity display
- Historical data with delete option
- LCD text control (max 16 chars)
- Responsive design with Tailwind CSS

### Database (SQLite)
- Users table (id, name, email, password)
- Sensor data table (temperature, humidity, timestamp)
- Timezone: +5:30 (Asia/Kolkata)

### APIs

#### 1. Save Sensor Data
- **Endpoint**: `POST /api/sensor` or `GET /api/sensor?temp=X&humidity=Y`
- **Params**: temperature (float), humidity (float)
- **Response**: `{"success": true}`

#### 2. Fetch LCD Text
- **Endpoint**: `GET /api/lcd-text`
- **Response**: `{"text": "Your LCD Text"}`

#### 3. Update LCD Text
- **Endpoint**: `POST /api/lcd-text`
- **Body**: `{"text": "text here"}`
- **Response**: `{"success": true}`

#### 4. Get All Sensor Data
- **Endpoint**: `GET /api/sensor-data`
- **Response**: Array of sensor records

## ESP8266 Setup

### Required Libraries (Arduino IDE)
1. DHT sensor library
2. LiquidCrystal_I2C
3. ArduinoJson
4. ESP8266WiFi (built-in)
5. ESP8266 HTTPClient (built-in)

### Hardware Configuration
- **DHT11**: Connected to D5
- **LCD I2C (16x2)**: Connected to D1 (SCL) and D2 (SDA)
- **LCD Address**: 0x27

### Upload Steps
1. Install ESP8266 board in Arduino IDE
2. Edit WiFi credentials in code (ssid, password)
3. Update server URL (your-app.onrender.com)
4. Select board: "NodeMCU 1.0" or "ESP8266 Generic"
5. Upload to device

### Serial Output Example
```
Connecting WiFi....
WiFi connected!
IP address: 192.168.x.x
Temperature: 25 C
Humidity: 56 %
Sending to server...
Data sent successfully!
```

## Deployment to Render

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Create Render Service
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Runtime: Node
5. Build command: `npm install`
6. Start command: `node server.js`
7. Deploy

### 3. Update ESP8266 Code
- Replace `your-app.onrender.com` with your Render URL
- Render uses HTTPS (port 443)

## API Examples

### Send Temperature/Humidity (ESP8266)
```
GET /api/sensor?temp=25.5&humidity=60
```

### Get Latest Reading (Dashboard)
```
GET /api/sensor-latest
→ {"temperature": 25.5, "humidity": 60, "time": "10:53 AM", "date": "09-05-2026"}
```

### Save LCD Text (Dashboard)
```
POST /api/lcd-text
{"text": "SISTEC IoT"}
```

### Fetch LCD Text (ESP8266)
```
GET /api/lcd-text
→ {"text": "SISTEC IoT"}
```

## Troubleshooting

**ESP8266 can't connect to WiFi**
- Verify SSID and password
- Check WiFi band (2.4GHz only)

**HTTPS connection fails**
- Render requires HTTPS
- Code uses `setInsecure()` for certificate bypass
- For production, implement proper certificate handling

**LCD not displaying**
- Verify I2C address (default: 0x27)
- Check SCL (D1) and SDA (D2) connections
- Use I2C scanner to find address

**Data not saving**
- Check internet connection
- Verify server URL in ESP8266 code
- Check browser console for errors

## Database Queries

### View all users
```sql
SELECT * FROM users;
```

### View all sensor data
```sql
SELECT * FROM sensor_data ORDER BY created_at DESC;
```

### Delete old records
```sql
DELETE FROM sensor_data WHERE created_at < datetime('now', '-7 days');
```

## Notes
- Timezone is +5:30 (Asia/Kolkata)
- LCD refresh every 60 seconds
- Keep-alive for sensor: 60 seconds
- Max LCD text: 16 characters
