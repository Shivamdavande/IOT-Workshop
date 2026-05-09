# Quick Start Guide

## 1. Local Development (5 min)

```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser
http://localhost:3000/index.html
```

## 2. Create Account & Login

- Register with name, email, password
- Login with credentials
- Access dashboard

## 3. Test APIs with cURL

### Send Temperature Data
```bash
curl "http://localhost:3000/api/sensor?temp=25&humidity=60"
```

### Get Latest Reading
```bash
curl http://localhost:3000/api/sensor-latest
```

### Send LCD Text
```bash
curl -X POST http://localhost:3000/api/lcd-text \
  -H "Content-Type: application/json" \
  -d '{"text":"HELLO"}'
```

### Get LCD Text
```bash
curl http://localhost:3000/api/lcd-text
```

## 4. Deploy to Render

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "SISTec IoT App"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### Step 2: Create Render Service
1. Visit https://render.com
2. New > Web Service
3. Connect your GitHub repository
4. Settings:
   - **Name**: sistec-iot
   - **Runtime**: Node
   - **Build**: `npm install`
   - **Start**: `node server.js`
5. Deploy

### Step 3: Get Your URL
- Render will show: `https://sistec-iot.onrender.com`
- Update ESP8266 code with this URL

## 5. Configure ESP8266

In `ESP8266_SISTec_IoT.ino`, update:

```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* server = "sistec-iot.onrender.com";  // Your Render URL
```

Then upload to ESP8266 using Arduino IDE.

## Database Files
- `data.db` - SQLite database (auto-created)
- `lcd.txt` - LCD text storage (auto-created)

## Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/register | Create new user |
| POST | /api/login | User authentication |
| GET/POST | /api/sensor | Save temperature/humidity |
| GET | /api/sensor-latest | Get latest reading |
| GET | /api/sensor-data | Get all readings |
| GET | /api/lcd-text | Fetch LCD text |
| POST | /api/lcd-text | Save LCD text |
| DELETE | /api/sensor/:id | Delete record |

## Notes
- All times are in +5:30 (Asia/Kolkata)
- Dashboard auto-refreshes every 5 seconds
- ESP8266 sends data every 60 seconds
- LCD updates every 60 seconds
