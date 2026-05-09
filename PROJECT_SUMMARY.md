# SISTec IoT Application - Complete Setup & Files

## 📁 Project Files Created

### Backend
1. **server.js** - Express.js backend with all APIs
2. **package.json** - Node.js dependencies

### Frontend (public folder)
1. **index.html** - Login page
2. **register.html** - Registration page
3. **dashboard.html** - Main IoT dashboard

### Hardware
1. **ESP8266_SISTec_IoT.ino** - Arduino firmware for ESP8266

### Configuration
1. **Procfile** - Render deployment configuration
2. **.gitignore** - Git ignore rules
3. **.env.example** - Environment variables template
4. **SETUP.md** - Complete documentation
5. **QUICKSTART.md** - Quick reference guide

## 🚀 How Everything Works Together

```
ESP8266 (Hardware)
    ↓
    ├─→ Sends temp/humidity to /api/sensor
    ├─→ Fetches text from /api/lcd-text
    └─→ Displays on 16x2 LCD I2C
    
Web Dashboard (Browser)
    ↓
    ├─→ Login/Register at /api/login, /api/register
    ├─→ Displays latest readings from /api/sensor-latest
    ├─→ Shows historical data from /api/sensor-data
    ├─→ Saves LCD text to /api/lcd-text
    └─→ Deletes records via /api/sensor/:id
    
Server (Node.js/Express)
    ↓
    ├─→ SQLite Database (data.db)
    │   ├─ users table
    │   └─ sensor_data table
    │
    └─→ File Storage (lcd.txt)
        └─ Current LCD text
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

### Sensor Data Table
```sql
CREATE TABLE sensor_data (
  id INTEGER PRIMARY KEY,
  temperature REAL NOT NULL,
  humidity REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 Hardware Connections (ESP8266)

```
ESP8266 NodeMCU
├─ D5 ──→ DHT11 Data Pin
├─ D1 ──→ LCD I2C SCL (Pin 5)
├─ D2 ──→ LCD I2C SDA (Pin 4)
├─ GND ──→ Common Ground
└─ 3.3V ──→ Power

DHT11
├─ VCC ──→ 3.3V
├─ GND ──→ GND
└─ DATA ──→ D5

I2C LCD (16x2) - Address: 0x27
├─ VCC ──→ 3.3V or 5V
├─ GND ──→ GND
├─ SCL ──→ D1
└─ SDA ──→ D2
```

## ⏱️ LCD Display Sequence (Every 60 seconds)

1. **WiFi Status** (2 sec)
   ```
   CONNECTED
   -- WELCOME --
   ```

2. **Temperature** (2 sec)
   ```
   TEMPERATURE
   25 C
   ```

3. **Humidity** (2 sec)
   ```
   HUMIDITY
   56 %
   ```

4. **Custom Text** (3 sec)
   ```
   SISTEC DISPLAY
   <TEXT FROM API>
   ```

5. **Sending Data** (1 sec)
   ```
   SENDING DATA
   TO SERVER....
   ```

6. **Data Sent** (1 sec)
   ```
   DATA SENT!!
   Success
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - Register user
- `POST /api/login` - Login user

### Sensor Data
- `GET /api/sensor?temp=X&humidity=Y` - Save data (ESP8266)
- `POST /api/sensor` - Save data (JSON)
- `GET /api/sensor-latest` - Get latest reading
- `GET /api/sensor-data` - Get all readings
- `DELETE /api/sensor/:id` - Delete record

### LCD Control
- `GET /api/lcd-text` - Fetch LCD text
- `POST /api/lcd-text` - Save LCD text

## 📈 Data Flow Example

### ESP8266 Sending Data
```
ESP8266 reads: Temp=25.5°C, Humidity=60%
    ↓
Makes request: https://sistec-iot.onrender.com/api/sensor?temp=25.5&humidity=60
    ↓
Server receives and saves to SQLite
    ↓
Dashboard refreshes and shows new data
```

### LCD Text Update
```
User enters "HELLO WORLD" on dashboard
    ↓
Clicks Submit button
    ↓
POST to /api/lcd-text with {"text": "HELLO WORLD"}
    ↓
Server saves to lcd.txt
    ↓
ESP8266 fetches from /api/lcd-text
    ↓
Displays on LCD: "HELLO WORLD   " (16 chars)
```

## 🎯 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] Create new Web Service
- [ ] Connect GitHub repo
- [ ] Get Render URL
- [ ] Update ESP8266 WiFi credentials
- [ ] Update ESP8266 server URL
- [ ] Upload ESP8266 firmware
- [ ] Test dashboard login
- [ ] Test sensor data display
- [ ] Test LCD text control
- [ ] Verify historical data table

## 📱 Testing without Hardware

### Using cURL to simulate ESP8266
```bash
# Send temperature & humidity
curl "https://your-app.onrender.com/api/sensor?temp=23&humidity=45"

# Fetch LCD text
curl "https://your-app.onrender.com/api/lcd-text"
```

### Access Web Dashboard
```
https://your-app.onrender.com/index.html
```

## ⚠️ Important Notes

1. **Timezone**: All timestamps are +5:30 (Asia/Kolkata)
2. **HTTPS**: Render requires HTTPS; ESP8266 code uses `setInsecure()`
3. **LCD Max Chars**: 16 characters per line
4. **Sensor Interval**: ESP8266 sends data every 60 seconds
5. **Database**: SQLite file stored on Render's ephemeral filesystem (data lost on redeploy)
   - For production, consider using PostgreSQL addon
6. **LCD File**: lcd.txt is also ephemeral (will be reset on redeploy)

## 🔐 Security Notes

- Passwords stored as plain text (for beginner level)
- HTTPS verification disabled on ESP8266 (setInsecure())
- For production: Add hashing, use proper certificates, validate inputs

## 📞 Support

Refer to:
- **SETUP.md** - Complete documentation
- **QUICKSTART.md** - Quick reference
- Serial Monitor on ESP8266 for debugging
- Browser Console for frontend errors
- Render logs for server errors
