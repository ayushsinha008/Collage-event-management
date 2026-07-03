import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import app from '../app';
import { User } from '../models/User.model';
import { Event } from '../models/Event.model';
import { Ticket } from '../models/Ticket.model';
import { Role } from '../types';

// Set NODE_ENV to bypass real Firebase verification
process.env.NODE_ENV = 'test';

// Mock UUID to avoid ESM error
jest.mock('uuid', () => ({
  v4: () => '123e4567-e89b-12d3-a456-426614174000'
}));


let mongoServer: MongoMemoryReplSet;
let eventId: string;
let ticketId: string;
let qrCodeValue: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Pre-create admin user
  await User.create({
    uid: 'mock-admin',
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.ADMIN
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('FestFlow Backend E2E Tests', () => {

  describe('1. Health Check', () => {
    it('should return 200 OK on health check', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Root Health check passed');
    });
  });

  describe('2. Authentication Flow', () => {
    it('should authenticate user and create profile in DB on first login', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid_mock_token');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(res.status).toBe(401);
    });
  });

  describe('3. Event Management Flow', () => {
    it('should allow admin to create an event', async () => {
      const eventData = {
        title: 'Tech Fest 2026',
        description: 'Biggest tech fest of the year',
        category: 'Technology',
        venue: 'Main Auditorium',
        date: new Date(Date.now() + 86400000).toISOString(),
        startTime: '09:00',
        endTime: '18:00',
        capacity: 500,
        tags: ['tech', 'fest']
      };

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', 'Bearer admin_mock_token')
        .send(eventData);
      if (res.status !== 201) {
        console.error('EVENT CREATION ERROR TEXT:', res.text);
      }
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Tech Fest 2026');
      
      eventId = res.body.data._id;
    });

    it('should fetch the created event', async () => {
      const res = await request(app).get(`/api/v1/events/${eventId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Tech Fest 2026');
    });
  });

  describe('4. Registration Flow', () => {
    it('should allow a user to register for the event', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${eventId}/register`)
        .set('Authorization', 'Bearer valid_mock_token');
      if (res.status !== 201) console.error('REGISTRATION ERROR:', res.text);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registration).toBeDefined();
      expect(res.body.data.ticket).toBeDefined();

      ticketId = res.body.data.ticket._id;
      qrCodeValue = res.body.data.ticket.qrToken;
    });

    it('should not allow duplicate registrations', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${eventId}/register`)
        .set('Authorization', 'Bearer valid_mock_token');
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already registered');
    });
  });

  describe('5. Check-In Flow', () => {
    it('should allow admin/organizer to scan ticket QR code', async () => {
      const res = await request(app)
        .post('/api/v1/check-in')
        .set('Authorization', 'Bearer admin_mock_token')
        .send({ qrToken: qrCodeValue });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Check-in successful');
      expect(res.body.data.ticket.status).toBe('Used');
    });

    it('should reject already used ticket', async () => {
      const res = await request(app)
        .post('/api/v1/check-in')
        .set('Authorization', 'Bearer admin_mock_token')
        .send({ qrToken: qrCodeValue });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Ticket has already been used');
    });
  });

});
