/*
 * SISTec Smart IoT Dashboard 2026 - ESP8266 Firmware
 * Features: DHT11, Soil Moisture, IR Sensor, I2C LCD
 * Backend: Node.js (Render)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// --- CONFIGURATION ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-app-name.onrender.com/api/save-data";
const char* lcdUrl = "https://your-app-name.onrender.com/api/lcd-text";

// --- PINS ---
#define DHTPIN D5
#define DHTTYPE DHT11
#define SOIL_PIN A0
#define IR_PIN D6

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(115200);
  
  // LCD Init
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("SISTec IoT 2026");
  
  // Sensor Init
  dht.begin();
  pinMode(IR_PIN, INPUT);
  
  // WiFi Connection
  WiFi.begin(ssid, password);
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected");
  lcd.clear();
  lcd.print("WiFi Connected!");
  delay(2000);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    
    // 1. Read Sensors
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int soilRaw = analogRead(SOIL_PIN);
    int soilPercent = map(soilRaw, 1024, 0, 0, 100); // Inverse for typical soil sensors
    int irStatus = digitalRead(IR_PIN);
    String irText = (irStatus == LOW) ? "Object Detected" : "Clear";

    // Check if any reads failed
    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // 2. Display on LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("T:"); lcd.print(t, 1); lcd.print("C H:"); lcd.print(h, 0); lcd.print("%");
    lcd.setCursor(0, 1);
    lcd.print("S:"); lcd.print(soilPercent); lcd.print("% IR:"); lcd.print((irStatus == LOW ? "DET" : "CLR"));
    delay(3000);

    // 3. Fetch LCD Message from API
    fetchLCDMessage();
    delay(3000);

    // 4. Send Data to Server
    sendData(t, h, soilPercent, irText);
    
  }
  
  delay(5000); // Sync every 5 seconds
}

void fetchLCDMessage() {
  WiFiClientSecure client;
  client.setInsecure(); // Required for Render/HTTPS without managing certs
  
  HTTPClient http;
  if (http.begin(client, lcdUrl)) {
    int httpCode = http.GET();
    if (httpCode > 0) {
      String payload = http.getString();
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Server Message:");
      lcd.setCursor(0, 1);
      lcd.print(payload.substring(0, 16));
    }
    http.end();
  }
}

void sendData(float t, float h, int soil, String ir) {
  WiFiClientSecure client;
  client.setInsecure();
  
  HTTPClient http;
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");

  String jsonPayload = "{\"temperature\":" + String(t) + 
                       ",\"humidity\":" + String(h) + 
                       ",\"soil\":" + String(soil) + 
                       ",\"ir\":\"" + ir + "\"}";

  int httpCode = http.POST(jsonPayload);
  
  if (httpCode > 0) {
    Serial.println("Data Sent: " + jsonPayload);
  } else {
    Serial.println("Error sending data: " + http.errorToString(httpCode));
  }
  
  http.end();
}
