#!/bin/bash
# Test script for SISTec IoT endpoints

echo "======================================"
echo "SISTec IoT API Test Script"
echo "======================================"
echo ""

# Wait for server to start
sleep 3

echo "🧪 Testing /api/save-data endpoints..."
echo ""

# Test 1: GET /api/save-data
echo "Test 1: GET /api/save-data?temp=23.5&humidity=65"
curl -s "http://localhost:3000/api/save-data?temp=23.5&humidity=65"
echo -e "\n"

# Test 2: POST /api/save-data
echo "Test 2: POST /api/save-data with JSON"
curl -s -X POST http://localhost:3000/api/save-data \
  -H "Content-Type: application/json" \
  -d '{"temperature": 28.2, "humidity": 58}'
echo -e "\n"

# Test 3: GET latest data
echo "Test 3: GET /api/sensor-latest"
curl -s http://localhost:3000/api/sensor-latest
echo -e "\n"

# Test 4: GET all records
echo "Test 4: GET /api/sensor-data"
curl -s http://localhost:3000/api/sensor-data
echo -e "\n"

echo "======================================"
echo "✅ All tests completed!"
echo "======================================"
