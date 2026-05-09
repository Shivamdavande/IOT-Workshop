# Arduino Libraries Required

## For ESP8266 Development

Copy these library names to install in Arduino IDE:
**Sketch → Include Library → Manage Libraries**

### Required Libraries
1. **DHT sensor library**
   - Author: Adafruit
   - Search: "DHT"
   - Install: Adafruit DHT Unified Library

2. **LiquidCrystal I2C**
   - Author: Frank de Brabander
   - Search: "LiquidCrystal I2C"
   - Install the one with I2C support

3. **ArduinoJson**
   - Author: Benoit Blanchon
   - Search: "ArduinoJson"
   - Version: 6.x or 7.x

### Built-in Libraries (Already in ESP8266)
- ESP8266WiFi
- ESP8266HTTPClient
- Wire (I2C)

## Arduino IDE Board Setup

1. **Add ESP8266 Board Manager**
   - File → Preferences
   - Additional Board Manager URLs: 
     ```
     https://arduino.esp8266.com/stable/package_esp8266com_index.json
     ```

2. **Install Board**
   - Tools → Board → Board Manager
   - Search: "ESP8266"
   - Install: "esp8266 by ESP8266 Community"

3. **Select Board**
   - Tools → Board → ESP8266 Boards → "NodeMCU 1.0 (ESP-12E Module)"

4. **Select COM Port**
   - Tools → Port → COM3 (or your device port)

5. **Upload Speed**
   - Tools → Upload Speed → 115200

## Library Installation Steps

### Via Arduino IDE
1. Open Arduino IDE
2. Go to Sketch → Include Library → Manage Libraries
3. Search for each library name
4. Click Install for each one

### Via Command Line (Arduino CLI)
```bash
arduino-cli lib install "DHT sensor library"
arduino-cli lib install "LiquidCrystal I2C"
arduino-cli lib install "ArduinoJson"
```

## Verify Installation

In Arduino IDE, try compiling the sketch:
- Sketch → Verify/Compile

If no errors, all libraries are installed correctly.

## Troubleshooting

### "DHT.h not found"
- Install Adafruit DHT Unified Library
- Restart Arduino IDE

### "Wire.h not found"
- Wire is built-in; restart Arduino IDE

### "ArduinoJson.h not found"
- Search for "ArduinoJson" in Library Manager
- Install version 6.18.0 or higher

### "LiquidCrystal_I2C.h not found"
- Install "LiquidCrystal I2C" by Frank de Brabander
- Alternative: "LiquidCrystal PCF8574"

## Code Compilation

Once all libraries are installed:

1. Open `ESP8266_SISTec_IoT.ino`
2. Update WiFi credentials
3. Update server URL
4. Sketch → Verify/Compile (should show ✓)
5. Sketch → Upload (to send to ESP8266)

## Serial Monitor

To see ESP8266 debug messages:

1. Tools → Serial Monitor
2. Baud Rate: 115200
3. Watch for output:
   ```
   Starting WiFi connection...
   WiFi connected!
   IP address: 192.168.x.x
   ```

## Documentation Links

- DHT Sensor: https://www.adafruit.com/product/386
- LiquidCrystal I2C: https://github.com/johnrickman/LiquidCrystal_I2C
- ArduinoJson: https://arduinojson.org/
- ESP8266 Core: https://github.com/esp8266/Arduino
