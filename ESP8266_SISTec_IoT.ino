#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

// Server configuration (Change to your Render app URL)
const char* server = "your-app.onrender.com";  // Replace with your Render URL
const int httpsPort = 443;

// DHT sensor
#define DHTPIN D5
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// LCD I2C (Address: 0x27)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// WiFi client
WiFiClientSecure client;

// Store current LCD text
String currentLcdText = "WELCOME";

void setup() {
  Serial.begin(115200);
  delay(100);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.print("SISTEC");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");

  delay(2000);
  lcd.clear();

  // Initialize DHT sensor
  dht.begin();

  // Connect to WiFi
  connectToWiFi();

  // Disable SSL verification for Render (Note: Use with caution, better to use certificate in production)
  client.setInsecure();

  // Get initial LCD text
  fetchLcdText();
}

void loop() {
  // Display WiFi status
  displayWiFiStatus();
  delay(2000);

  // Read temperature
  float temperature = dht.readTemperature();
  displayTemperature(temperature);
  delay(2000);

  // Read humidity
  float humidity = dht.readHumidity();
  displayHumidity(humidity);
  delay(2000);

  // Display current LCD text
  displayLcdText();
  delay(3000);

  // Send data to server
  if (WiFi.status() == WL_CONNECTED) {
    displaySendingData();
    delay(1000);

    if (sendDataToServer(temperature, humidity)) {
      displayDataSent();
    } else {
      displayDataFailed();
    }
    delay(1000);
  } else {
    displayDisconnected();
    delay(1000);
  }

  // Fetch latest LCD text
  fetchLcdText();
}

void connectToWiFi() {
  lcd.clear();
  lcd.print("Connecting WiFi");
  Serial.println("\n\nStarting WiFi connection...");
  Serial.print("SSID: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
    lcd.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    lcd.clear();
    lcd.print("Connected!");
    lcd.setCursor(0, 1);
    lcd.print("IP: ");
    lcd.print(WiFi.localIP());
    delay(2000);
  } else {
    Serial.println("\nFailed to connect to WiFi");
    lcd.clear();
    lcd.print("WiFi Failed");
  }
}

void displayWiFiStatus() {
  lcd.clear();
  if (WiFi.status() == WL_CONNECTED) {
    lcd.print("CONNECTED");
  } else {
    lcd.print("CONNECTING...");
  }
  lcd.setCursor(0, 1);
  lcd.print("-- WELCOME --");
}

void displayTemperature(float temp) {
  lcd.clear();
  lcd.print("TEMPERATURE");
  lcd.setCursor(0, 1);
  if (isnan(temp)) {
    lcd.print("Error");
  } else {
    lcd.print(temp);
    lcd.print(" C");
  }
}

void displayHumidity(float humid) {
  lcd.clear();
  lcd.print("HUMIDITY");
  lcd.setCursor(0, 1);
  if (isnan(humid)) {
    lcd.print("Error");
  } else {
    lcd.print(humid);
    lcd.print(" %");
  }
}

void displayLcdText() {
  lcd.clear();
  lcd.print("SISTEC DISPLAY");
  lcd.setCursor(0, 1);
  String displayText = currentLcdText;
  if (displayText.length() > 16) {
    displayText = displayText.substring(0, 16);
  }
  lcd.print(displayText);
}

void displaySendingData() {
  lcd.clear();
  lcd.print("SENDING DATA");
  lcd.setCursor(0, 1);
  lcd.print("TO SERVER....");
}

void displayDataSent() {
  lcd.clear();
  lcd.print("DATA SENT!!");
  lcd.setCursor(0, 1);
  lcd.print("Success");
}

void displayDataFailed() {
  lcd.clear();
  lcd.print("SEND FAILED");
  lcd.setCursor(0, 1);
  lcd.print("Retrying...");
}

void displayDisconnected() {
  lcd.clear();
  lcd.print("WiFi");
  lcd.setCursor(0, 1);
  lcd.print("Disconnected");
}

bool sendDataToServer(float temperature, float humidity) {
  if (!isnan(temperature) && !isnan(humidity)) {
    String url = "/api/sensor?temp=" + String(temperature) + "&humidity=" + String(humidity);

    Serial.print("Connecting to: ");
    Serial.println(server);

    if (!client.connect(server, httpsPort)) {
      Serial.println("Connection failed!");
      return false;
    }

    Serial.println("Connected to server");

    // Send GET request
    String request = String("GET ") + url + " HTTP/1.1\r\n" +
                     "Host: " + server + "\r\n" +
                     "Connection: close\r\n\r\n";

    client.print(request);
    Serial.println("Sent request");

    // Wait for response
    unsigned long timeout = millis() + 5000;
    while (client.connected() && millis() < timeout) {
      if (client.available()) {
        String line = client.readStringUntil('\n');
        if (line.indexOf("200 OK") > 0 || line.indexOf("\"success\":true") > 0) {
          client.stop();
          return true;
        }
      }
    }

    client.stop();
    Serial.println("Request completed");
    return true;
  }
  return false;
}

void fetchLcdText() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  Serial.println("Fetching LCD text...");

  if (!client.connect(server, httpsPort)) {
    Serial.println("Connection to server failed");
    return;
  }

  String request = String("GET /api/lcd-text HTTP/1.1\r\n") +
                   "Host: " + server + "\r\n" +
                   "Connection: close\r\n\r\n";

  client.print(request);

  String response = "";
  unsigned long timeout = millis() + 5000;
  while (client.connected() && millis() < timeout) {
    if (client.available()) {
      response += client.readStringUntil('\n');
    }
  }

  client.stop();

  // Parse JSON response
  int jsonStart = response.indexOf('{');
  if (jsonStart > 0) {
    String jsonStr = response.substring(jsonStart);
    jsonStr = jsonStr.substring(0, jsonStr.indexOf('}') + 1);

    DynamicJsonDocument doc(200);
    deserializeJson(doc, jsonStr);

    if (doc.containsKey("text")) {
      currentLcdText = doc["text"].as<String>();
      Serial.print("LCD text updated: ");
      Serial.println(currentLcdText);
    }
  }
}
