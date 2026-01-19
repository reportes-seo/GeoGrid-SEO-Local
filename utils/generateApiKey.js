/**
 * API Key Generator
 * Utility to generate secure API keys for authentication
 */

const crypto = require('crypto');

/**
 * Generate a secure API key
 * @param {string} prefix - Optional prefix for the key (e.g., 'equiposeo')
 * @param {number} length - Length of random bytes (default: 32)
 * @returns {string} Generated API key
 */
function generateApiKey(prefix = '', length = 32) {
  const randomBytes = crypto.randomBytes(length).toString('hex');
  return prefix ? `${prefix}_${randomBytes}` : randomBytes;
}

/**
 * Generate multiple API keys
 * @param {number} count - Number of keys to generate
 * @param {string} prefix - Optional prefix
 * @returns {Array<string>} Array of generated keys
 */
function generateMultipleKeys(count, prefix = '') {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generateApiKey(prefix));
  }
  return keys;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 1;
  const prefix = args[1] || 'equiposeo';

  console.log('\n🔐 GeoGrid API Key Generator\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (count === 1) {
    const key = generateApiKey(prefix);
    console.log('Generated API Key:');
    console.log(`\n  ${key}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Add to your .env file:');
    console.log(`\n  API_KEY_ENABLED=true`);
    console.log(`  API_KEYS=${key}\n`);
  } else {
    const keys = generateMultipleKeys(count, prefix);
    console.log(`Generated ${count} API Keys:\n`);
    keys.forEach((key, index) => {
      console.log(`  ${index + 1}. ${key}`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Add to your .env file:');
    console.log(`\n  API_KEY_ENABLED=true`);
    console.log(`  API_KEYS=${keys.join(',')}\n`);
  }

  console.log('Usage in requests:');
  console.log('\n  # Header');
  console.log(`  curl -H "X-API-Key: ${generateApiKey(prefix)}"`);
  console.log('\n  # Bearer Token');
  console.log(`  curl -H "Authorization: Bearer ${generateApiKey(prefix)}"`);
  console.log('\n  # Query Parameter');
  console.log(`  curl "http://localhost:3000/api/render?api_key=${generateApiKey(prefix)}"\n`);
}

module.exports = {
  generateApiKey,
  generateMultipleKeys
};
