#define BLYNK_PRINT Serial

#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <DHT.h>

#define DHTPIN D5
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

char ssid[] = "EC Audi- 02";
char pass[] = "Sistec@0187";

// RENDER URL
String serverName = "https://iot-workshop-tvc4.onrender.com";

// APIs
String lcdApi = serverName + "/api/lcd-text";
String saveApi = serverName + "/api/save-data";

WiFiClientSecure client;

void setup()
{
  Serial.begin(115200);
  delay(100);

  lcd.init();
  lcd.backlight();

  dht.begin();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("CONNECTING TO");
  lcd.setCursor(0, 1);
  lcd.print("WiFi");

  Serial.println("\n\nConnecting to WiFi");

  WiFi.begin(ssid, pass);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20)
  {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  Serial.println("");
  Serial.println("WiFi Connected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("CONNECTED TO");
  lcd.setCursor(0, 1);
  lcd.print("WiFi");

  delay(2000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("-- WELCOME --");

  delay(2000);

  client.setInsecure();
}

void loop()
{
  // Read sensor data
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Check for valid readings
  if (isnan(temperature) || isnan(humidity))
  {
    Serial.println("Failed to read from DHT sensor!");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("SENSOR ERROR");

    delay(2000);
    return;
  }

  // Display TEMPERATURE
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("TEMPERATURE");

  lcd.setCursor(0, 1);
  lcd.print(temperature);
  lcd.print(" C");

  Serial.print("Temperature: ");
  Serial.println(temperature);

  delay(2000);

  // Display HUMIDITY
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("HUMIDITY");

  lcd.setCursor(0, 1);
  lcd.print(humidity);
  lcd.print("%");

  Serial.print("Humidity: ");
  Serial.println(humidity);

  delay(2000);

  // FETCH LCD TEXT from server
  String lcdText = getLCDText();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SISTec DISPLAY");

  lcd.setCursor(0, 1);

  if (lcdText.length() > 16)
  {
    lcdText = lcdText.substring(0, 16);
  }

  lcd.print(lcdText);

  Serial.print("LCD Text: ");
  Serial.println(lcdText);

  delay(3000);

  // Display SENDING DATA
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SENDING DATA");
  lcd.setCursor(0, 1);
  lcd.print("TO SERVER....");

  // SEND DATA to server
  bool dataSent = sendData(temperature, humidity);

  // Display result
  if (dataSent)
  {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("DATA SENT!!");
    lcd.setCursor(0, 1);
    lcd.print("Success");

    Serial.println("Data sent successfully!");
  }
  else
  {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("SEND FAILED");
    lcd.setCursor(0, 1);
    lcd.print("Retrying...");

    Serial.println("Failed to send data!");
  }

  delay(1000);
}

String getLCDText()
{
  String result = "WELCOME";

  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient https;

    Serial.print("Fetching LCD text from: ");
    Serial.println(lcdApi);

    https.begin(client, lcdApi);
    https.addHeader("Content-Type", "application/json");

    int httpCode = https.GET();

    Serial.print("LCD API Response Code: ");
    Serial.println(httpCode);

    if (httpCode == HTTP_CODE_OK)
    {
      String payload = https.getString();

      Serial.print("LCD API Response: ");
      Serial.println(payload);

      // Parse JSON response
      DynamicJsonDocument doc(256);
      DeserializationError error = deserializeJson(doc, payload);

      if (!error)
      {
        if (doc.containsKey("text"))
        {
          result = doc["text"].as<String>();
          Serial.print("Extracted text: ");
          Serial.println(result);
        }
      }
      else
      {
        Serial.print("JSON Parse Error: ");
        Serial.println(error.c_str());
      }
    }
    else
    {
      Serial.print("HTTP Error: ");
      Serial.println(httpCode);
    }

    https.end();
  }
  else
  {
    Serial.println("WiFi not connected!");
  }

  return result;
}

bool sendData(float temp, float hum)
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("WiFi not connected!");
    return false;
  }

  HTTPClient https;

  // Correct API parameters: temp and humidity (not hum)
  String url = saveApi + "?temp=" + String(temp) + "&humidity=" + String(hum);

  Serial.print("Sending to: ");
  Serial.println(url);

  https.begin(client, url);
  https.addHeader("Content-Type", "application/json");

  int httpCode = https.GET();

  Serial.print("Send API Response Code: ");
  Serial.println(httpCode);

  if (httpCode > 0)
  {
    String payload = https.getString();

    Serial.print("Send API Response: ");
    Serial.println(payload);

    // Parse response
    DynamicJsonDocument doc(256);
    DeserializationError error = deserializeJson(doc, payload);

    if (!error && doc.containsKey("success"))
    {
      bool success = doc["success"];
      https.end();
      return success;
    }

    https.end();
    return (httpCode == HTTP_CODE_OK);
  }

  Serial.println("HTTP request failed!");
  https.end();
  return false;
}
