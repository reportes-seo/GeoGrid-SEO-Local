"""
Example Python client for GeoGrid Server
"""

import requests
import json

BASE_URL = 'http://localhost:3000'

def test_geogrid_api():
    print('🧪 Testing GeoGrid Server API')
    print('================================\n')

    try:
        # Test 1: Root endpoint
        print('📍 Test 1: Root endpoint')
        response = requests.get(f'{BASE_URL}/')
        print(json.dumps(response.json(), indent=2))
        print()

        # Test 2: Health check
        print('📍 Test 2: Health check')
        response = requests.get(f'{BASE_URL}/health')
        print(json.dumps(response.json(), indent=2))
        print()

        # Test 3: Preview presets
        print('📍 Test 3: Preview presets')
        response = requests.get(f'{BASE_URL}/api/preview/presets')
        print(json.dumps(response.json(), indent=2))
        print()

        # Test 4: Render image
        print('📍 Test 4: Render image (saving to output.png)')
        with open('examples/request-example.json', 'r') as f:
            request_data = json.load(f)

        response = requests.post(f'{BASE_URL}/api/render', json=request_data)

        with open('output.png', 'wb') as f:
            f.write(response.content)

        print(f'Status: {response.status_code}')
        print(f'Render Time: {response.headers.get("X-Render-Time")}')
        print(f'GeoRank: {response.headers.get("X-GeoRank")}')
        print(f'Grid Points: {response.headers.get("X-Grid-Points")}')
        print(f'Image size: {len(response.content)} bytes')
        print('✅ Image saved to output.png')
        print()

        # Test 5: Render base64
        print('📍 Test 5: Render base64')
        response = requests.post(f'{BASE_URL}/api/render/base64', json=request_data)
        data = response.json()

        print(f'Success: {data["success"]}')
        print(f'Metadata: {json.dumps(data["metadata"], indent=2)}')
        print(f'Metrics: {json.dumps(data["metrics"], indent=2)}')
        print(f'Base64 length: {len(data["data"])} characters')
        print()

        print('✅ All tests completed!')

    except Exception as e:
        print(f'❌ Error: {str(e)}')
        if hasattr(e, 'response'):
            print(f'Response: {e.response.text}')

if __name__ == '__main__':
    test_geogrid_api()
