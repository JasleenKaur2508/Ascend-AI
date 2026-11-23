const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');

process.env.TEST_PORT = process.env.TEST_PORT || '5055';
const { app, server } = require('../src/server');
const { closeDB } = require('../src/config/db');

const BASE_URL = `http://127.0.0.1:${process.env.TEST_PORT}`;

describe('ASCEND AI Backend API Tests', () => {
  let authToken = '';
  let testEmail = `test_${Date.now()}@example.com`;

  after(async () => {
    server.close();
    await closeDB();
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
    assert.strictEqual(res.data.data.best_model, 'Logistic Regression');
    assert.strictEqual(res.data.data.linear_svm_accuracy, 0.8824);
    assert.strictEqual(res.data.data.logistic_regression_accuracy, 0.8824);
  });
});
