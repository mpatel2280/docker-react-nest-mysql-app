import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AppController', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Authentication', () => {
    let createdUserId: number;

    it('/users (POST) - should create a new user with password', async () => {
      const createUserDto = {
        email: 'e2etest@example.com',
        name: 'E2E Test User',
        password: 'testpassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(createUserDto.email);
      expect(response.body.name).toBe(createUserDto.name);
      expect(response.body).not.toHaveProperty('password');

      createdUserId = response.body.id;
    });

    it('/auth/login (POST) - should login with valid credentials', async () => {
      const loginDto = {
        email: 'e2etest@example.com',
        password: 'testpassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(loginDto.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('/auth/login (POST) - should fail with invalid password', async () => {
      const loginDto = {
        email: 'e2etest@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('/auth/login (POST) - should fail with non-existent email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'testpassword123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('/users (GET) - should return all users without passwords', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('/users/:id (GET) - should return a user by id without password', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200);

      expect(response.body.id).toBe(createdUserId);
      expect(response.body).not.toHaveProperty('password');
    });

    it('/users/:id (PATCH) - should update user with new password', async () => {
      const updateUserDto = {
        name: 'Updated E2E User',
        password: 'newpassword456',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body.name).toBe(updateUserDto.name);
      expect(response.body).not.toHaveProperty('password');

      // Verify login with new password
      const loginDto = {
        email: 'e2etest@example.com',
        password: 'newpassword456',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);
    });

    it('/users/:id (DELETE) - should delete a user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .expect(200);

      // Verify user is deleted - should return null or empty object
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200);

      // Prisma returns null when user not found
      expect(response.body === null || Object.keys(response.body).length === 0).toBe(true);
    });
  });
});
