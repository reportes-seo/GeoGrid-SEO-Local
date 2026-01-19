#!/bin/bash

# Test script for GeoGrid API

BASE_URL="http://localhost:3000"

echo "🧪 Testing GeoGrid Server API"
echo "================================"
echo ""

# Test 1: Root endpoint
echo "📍 Test 1: Root endpoint"
curl -s "$BASE_URL/" | jq .
echo ""

# Test 2: Health check
echo "📍 Test 2: Health check"
curl -s "$BASE_URL/health" | jq .
echo ""

# Test 3: Preview presets
echo "📍 Test 3: Preview presets"
curl -s "$BASE_URL/api/preview/presets" | jq .
echo ""

# Test 4: Render image
echo "📍 Test 4: Render image (saving to output.png)"
curl -X POST "$BASE_URL/api/render" \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  -o output.png \
  -w "\nStatus: %{http_code}\nRender Time: %{header_x-render-time}\nGeoRank: %{header_x-georank}\n"
echo ""

# Test 5: Render base64
echo "📍 Test 5: Render base64"
curl -X POST "$BASE_URL/api/render/base64" \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  | jq '{success, metadata, metrics}'
echo ""

echo "✅ All tests completed!"
