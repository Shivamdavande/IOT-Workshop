# SISTec Smart IoT Dashboard 2026 🚀

A modern, futuristic, and premium full-stack IoT web application designed for workshop presentations and hackathons. Featuring glassmorphism UI, realtime updates, and hardware integration.

## ✨ Features

- **Futuristic UI**: Glassmorphism, neon glow, and AOS/GSAP animations.
- **Full Stack**: Node.js + Express backend with SQLite database.
- **Realtime Dashboard**: Chart.js analytics and sensor overview cards with 5s polling.
- **LCD Control**: Update physical hardware LCD display from the web dashboard.
- **Auth System**: User registration and login with local session storage.
- **Hardware Ready**: Optimized for ESP8266 + DHT11 + Soil Moisture + IR + LCD.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JS, Chart.js, AOS, GSAP.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite.
- **Hardware**: Arduino (ESP8266).

## 🚀 Getting Started

### 1. Backend Setup

1. Install Node.js if not already installed.
2. Navigate to the project folder:
   ```bash
   cd sistec-iot-dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in your browser.

### 2. Hardware Setup (ESP8266)

1. Open `arduino/esp8266_iot.ino` in Arduino IDE.
2. Install libraries: `DHT sensor library`, `LiquidCrystal I2C`, `ESP8266WiFi`.
3. Update `ssid`, `password`, and `serverUrl` (if deployed) in the code.
4. Upload to your ESP8266.

## 🌐 Deployment (Render)

1. Push this code to a GitHub repository.
2. Create a new "Web Service" on [Render.com](https://render.com).
3. Connect your repository.
4. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variable `PORT` = `3000`.

## 📸 Project Preview

- **Login/Register**: Neon glassmorphism login system.
- **Live Stats**: Realtime Temp, Humidity, Soil, and IR status.
- **Analytics**: Animated line charts showing sensor trends.
- **Control**: LCD text input with success toast notifications.
- **Table**: Historical sensor data with search and delete functionality.

---
**Created for SISTec Workshop 2026**
*By Antigravity AI*
