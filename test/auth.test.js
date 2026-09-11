/**
 * Tests for middleware/auth.middleware.js
 *
 * La API key es lo unico que separa a un desconocido de arrancar un Chromium
 * por peticion. Estos tests fijan las tres formas de enviarla y, sobre todo,
 * que un endpoint protegido NUNCA pase sin clave estando la auth activada.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { validateApiKey, optionalApiKey } = require('../middleware/auth.middleware');
const envConfig = require('../config/env.config');

const VALID_KEY = 'k'.repeat(40);

/**
 * Fake request
 */
function mockReq({ headers = {}, query = {} } = {}) {
  return { headers, query, ip: '127.0.0.1', path: '/api/preview', method: 'GET' };
}

/**
 * Fake response capturing status + json
 */
function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

/**
 * Run the middleware and report whether it let the request through
 */
function run(middleware, req) {
  const res = mockRes();
  let passed = false;

  middleware(req, res, () => {
    passed = true;
  });

  return { passed, res };
}

/**
 * Enable auth for a test and restore the previous config afterwards
 */
function withAuth(enabled, keys, fn) {
  const prevEnabled = envConfig.security.apiKeyEnabled;
  const prevKeys = envConfig.security.apiKeys;

  envConfig.security.apiKeyEnabled = enabled;
  envConfig.security.apiKeys = keys;

  try {
    fn();
  } finally {
    envConfig.security.apiKeyEnabled = prevEnabled;
    envConfig.security.apiKeys = prevKeys;
  }
}

test('sin API key devuelve 401 y no deja pasar la peticion', () => {
  withAuth(true, [VALID_KEY], () => {
    const { passed, res } = run(validateApiKey, mockReq());

    assert.equal(passed, false, 'la peticion NO debe llegar al controlador');
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'AUTHENTICATION_REQUIRED');
  });
});

test('con una API key invalida devuelve 401', () => {
  withAuth(true, [VALID_KEY], () => {
    const { passed, res } = run(validateApiKey, mockReq({ headers: { 'x-api-key': 'noesvalida' } }));

    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.error.message, /Invalid API key/);
  });
});

test('acepta la clave por cabecera X-API-Key', () => {
  withAuth(true, [VALID_KEY], () => {
    const req = mockReq({ headers: { 'x-api-key': VALID_KEY } });
    const { passed } = run(validateApiKey, req);

    assert.equal(passed, true);
    assert.equal(req.apiKeyValidated, true);
  });
});

test('acepta la clave por Authorization: Bearer', () => {
  withAuth(true, [VALID_KEY], () => {
    const { passed } = run(validateApiKey, mockReq({ headers: { authorization: `Bearer ${VALID_KEY}` } }));

    assert.equal(passed, true);
  });
});

test('acepta la clave por query param api_key (uso desde navegador en /preview)', () => {
  withAuth(true, [VALID_KEY], () => {
    const { passed } = run(validateApiKey, mockReq({ query: { api_key: VALID_KEY } }));

    assert.equal(passed, true);
  });
});

test('soporta varias claves configuradas a la vez', () => {
  const otherKey = 'z'.repeat(40);

  withAuth(true, [VALID_KEY, otherKey], () => {
    assert.equal(run(validateApiKey, mockReq({ headers: { 'x-api-key': otherKey } })).passed, true);
  });
});

test('con la autenticacion desactivada deja pasar sin clave', () => {
  withAuth(false, [], () => {
    assert.equal(run(validateApiKey, mockReq()).passed, true);
  });
});

test('optionalApiKey deja pasar siempre, pero marca la peticion si la clave es valida', () => {
  withAuth(true, [VALID_KEY], () => {
    const anonimo = mockReq();
    assert.equal(run(optionalApiKey, anonimo).passed, true);
    assert.equal(anonimo.apiKeyValidated, undefined);

    const identificado = mockReq({ headers: { 'x-api-key': VALID_KEY } });
    assert.equal(run(optionalApiKey, identificado).passed, true);
    assert.equal(identificado.apiKeyValidated, true);
  });
});
