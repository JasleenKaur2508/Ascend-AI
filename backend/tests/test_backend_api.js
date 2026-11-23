const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');
const { app, server } = require('../src/server');

const BASE_URL = 'http://localhost:5001';

describe('ASCEND AI Backend API Tests', () => {
  let authToken = '';
  let testEmail = `test_${Date.now()}@example.com`;

  after(() => {
    server.close();
  });

  it('GET /health returns 200 online', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'online');
  });

  it('POST /api/auth/register creates a new user and returns JWT token', async () => {
    const res = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test Student',
      email: testEmail,
      password: 'Password123!',
      role: 'jobseeker'
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.email, testEmail);
    authToken = res.data.token;
  });

  it('POST /api/auth/login authenticates registered user', async () => {
    const res = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testEmail,
      password: 'Password123!'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
  });

  it('GET /api/auth/profile returns authenticated user profile', async () => {
    const res = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.email, testEmail);
  });

  it('PUT /api/auth/profile updates user profile', async () => {
    const res = await axios.put(`${BASE_URL}/api/auth/profile`, {
      headline: 'Full Stack AI Developer',
      targetRole: 'Data Scientist',
      skills: ['Python', 'React', 'FastAPI', 'Node.js']
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.targetRole, 'Data Scientist');
  });

  it('GET /api/analytics/colab-metrics proxies Colab CE-2 trained artifacts metrics', async () => {
    const res = await axios.get(`${BASE_URL}/api/analytics/colab-metrics`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'success');
    assert.strictEqual(res.data.data.best_model, 'Linear SVM');
    assert.strictEqual(res.data.data.linear_svm_accuracy, 1.0);
  });
});
