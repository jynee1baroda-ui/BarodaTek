// API Endpoint Tests for Champions Arena
const request = require('supertest');
const express = require('express');

// Import the API handler
const apiHandler = require('../api/index');

describe('API Endpoints', () => {
  
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(apiHandler)
        .get('/api/health')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('platform', 'Champions Arena - BarodaTek.com');
      expect(response.body).toHaveProperty('serverless', true);
    });
  });

  describe('GET /api/contracts', () => {
    it('should return mock contracts list', async () => {
      const response = await request(apiHandler)
        .get('/api/contracts')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/contracts', () => {
    it('should create a new contract', async () => {
      const newContract = {
        title: 'Test Contract',
        client: 'Test Client',
        provider: 'Test Provider',
        amount: 1000,
      };

      const response = await request(apiHandler)
        .post('/api/contracts')
        .send(newContract)
        .expect(201)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', 'Test Contract');
    });
  });

  describe('GET /api/analytics', () => {
    it('should return analytics data', async () => {
      const response = await request(apiHandler)
        .get('/api/analytics')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('responseTime');
      expect(response.body.data).toHaveProperty('requestsPerMinute');
      expect(response.body.data).toHaveProperty('successRate');
    });
  });

  describe('GET /api/stats', () => {
    it('should return stats data with success flag', async () => {
      const response = await request(apiHandler)
        .get('/api/stats')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('totalViews');
      expect(response.body).toHaveProperty('viewsToday');
      expect(response.body).toHaveProperty('apiRequests');
    });
  });

  describe('POST /api/stats/pageview', () => {
    it('should record a page view', async () => {
      const response = await request(apiHandler)
        .post('/api/stats/pageview')
        .send({ page: '/test', sessionId: 'jest-session' })
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Page view recorded');
      expect(response.body.totals).toHaveProperty('totalViews');
    });
  });

  describe('POST /api/errors/log', () => {
    it('should log client errors', async () => {
      const response = await request(apiHandler)
        .post('/api/errors/log')
        .send({
          message: 'Test error',
          type: 'TestError',
          url: 'http://localhost/test'
        })
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /api/monitoring/status', () => {
    it('should return monitoring status data', async () => {
      const response = await request(apiHandler)
        .get('/api/monitoring/status')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('POST /api/chat', () => {
    it('should return assistant reply', async () => {
      const response = await request(apiHandler)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/generate', () => {
    it('should handle code generation request', async () => {
      const response = await request(apiHandler)
        .post('/api/generate')
        .send({ prompt: 'Create a function' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('GET /api/games/questions', () => {
    it('should return game questions', async () => {
      const response = await request(apiHandler)
        .get('/api/games/questions')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.questions)).toBe(true);
    });
  });
});
