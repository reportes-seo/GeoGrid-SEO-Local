/**
 * Example Node.js client for GeoGrid Server
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

async function testGeoGridAPI() {
  console.log('🧪 Testing GeoGrid Server API');
  console.log('================================\n');

  try {
    // Test 1: Root endpoint
    console.log('📍 Test 1: Root endpoint');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log(JSON.stringify(rootResponse.data, null, 2));
    console.log('');

    // Test 2: Health check
    console.log('📍 Test 2: Health check');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(JSON.stringify(healthResponse.data, null, 2));
    console.log('');

    // Test 3: Preview presets
    console.log('📍 Test 3: Preview presets');
    const presetsResponse = await axios.get(`${BASE_URL}/api/preview/presets`);
    console.log(JSON.stringify(presetsResponse.data, null, 2));
    console.log('');

    // Test 4: Render image
    console.log('📍 Test 4: Render image (saving to output.png)');
    const requestData = require('./request-example.json');

    const imageResponse = await axios.post(`${BASE_URL}/api/render`, requestData, {
      responseType: 'arraybuffer'
    });

    fs.writeFileSync('output.png', imageResponse.data);

    console.log('Status:', imageResponse.status);
    console.log('Render Time:', imageResponse.headers['x-render-time']);
    console.log('GeoRank:', imageResponse.headers['x-georank']);
    console.log('Grid Points:', imageResponse.headers['x-grid-points']);
    console.log('Image size:', imageResponse.data.length, 'bytes');
    console.log('✅ Image saved to output.png');
    console.log('');

    // Test 5: Render base64
    console.log('📍 Test 5: Render base64');
    const base64Response = await axios.post(`${BASE_URL}/api/render/base64`, requestData);

    console.log('Success:', base64Response.data.success);
    console.log('Metadata:', base64Response.data.metadata);
    console.log('Metrics:', base64Response.data.metrics);
    console.log('Base64 length:', base64Response.data.data.length, 'characters');
    console.log('');

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testGeoGridAPI();
