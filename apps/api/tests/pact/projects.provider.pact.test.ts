import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { generateTestJWT } from '../helpers/auth.helper';
import type { AddressInfo } from 'net';
import { beforeAll, afterAll, describe, it } from 'vitest';

// Para ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createApp();
const prisma = new PrismaClient();

describe('Provider verification — taskflow-api', () => {
  let server: ReturnType<typeof app.listen>;
  let port: number;

  beforeAll(async () => {
    // Seed mínimo: crear el usuario que usará el stateHandler
    // Limpiamos primero por si acaso
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: { id: 'pact-user-1', email: 'pact@test.com', passwordHash: 'hash' }
    });
    
    server = app.listen(0);
    port = (server.address() as AddressInfo).port;
  });

  it('verifica el contrato del consumer taskflow-frontend', async () => {
    await new Verifier({
      provider: 'taskflow-api',
      providerBaseUrl: `http://localhost:${port}`,
      pactUrls: [
        path.resolve(__dirname, '../../../../pacts/taskflow-frontend-taskflow-api.json'),
      ],
      requestFilter: (req, _res, next) => {
        // Inyectamos el token para todas las peticiones
        req.headers['authorization'] = `Bearer ${generateTestJWT('pact-user-1')}`;
        next();
      },
      stateHandlers: {
        'usuario autenticado con token válido': async () => {
          // El estado ya está preparado por beforeAll
          return {};
        },
      },
    }).verifyProvider();
  });

  afterAll(async () => {
    if (server) server.close();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });
});
