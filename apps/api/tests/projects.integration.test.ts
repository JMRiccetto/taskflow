import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = createApp();

describe('Proyectos API — US-03 y US-04', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Registrar un usuario una sola vez para toda la suite
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'tester@test.com', password: 'Test1234!' });
    token = res.body.token;
    userId = res.body.user.id;
  });

  beforeEach(async () => {
    // Limpiar en orden correcto (foreign keys)
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // 1.1 — Happy path: crear proyecto exitosamente
  it('crea un proyecto y devuelve 201 con id (@US-03)', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'TaskFlow MVP', description: 'Primer sprint' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('TaskFlow MVP');
    expect(res.body.ownerId).toBe(userId);
  });

  // 1.2 — Error: nombre vacío
  it('rechaza nombre vacío con 400 (@US-03)', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', description: 'Sin nombre' });

    expect(res.status).toBe(400);
    // El middleware de error devuelve "Validation error" para errores de Zod
    expect(res.body.error).toMatch(/validation|error/i);
  });

  // 1.3 — Error: sin autenticación
  it('rechaza petición sin token con 401 (@US-03)', async () => {
    const res = await request(app)
      .post('/projects')
      .send({ name: 'Proyecto sin auth' });

    expect(res.status).toBe(401);
  });

  // 2.1 — US-04: solo mis proyectos
  it('solo devuelve los proyectos del usuario autenticado (@US-04)', async () => {
    // Crear proyecto del primer usuario
    await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Proyecto de tester1' });

    // Crear un segundo usuario
    const res2 = await request(app)
      .post('/auth/register')
      .send({ email: 'otro@test.com', password: 'Test1234!' });
    const token2 = res2.body.token;

    // El segundo usuario lista SUS proyectos
    const list = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${token2}`);

    expect(list.status).toBe(200);
    // El segundo usuario no debe ver los proyectos del primero
    expect(list.body).toHaveLength(0);
  });
});
