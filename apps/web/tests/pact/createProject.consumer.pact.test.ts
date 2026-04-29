import { describe, it, expect } from 'vitest';
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProject } from '../../src/api/projects';

// Para ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const provider = new PactV4({
  consumer: 'taskflow-frontend',
  provider: 'taskflow-api',
  // El contrato se guarda en pacts/ en la raíz del monorepo
  // Ajustamos la ruta para llegar desde apps/web/tests/pact a /pacts
  dir: path.resolve(__dirname, '../../../../pacts'),
});

describe('Consumer Pact — createProject', () => {
  it('POST /api/projects devuelve 201 con id, name y ownerId', async () => {
    await provider
      .addInteraction()
      .given('usuario autenticado con token válido')
      .uponReceiving('una petición para crear proyecto TaskFlow MVP')
      .withRequest('POST', '/api/projects', (builder) => {
        builder.headers({ 
          'Content-Type': 'application/json',
          'Authorization': MatchersV3.like('Bearer token-de-test')
        });
        builder.jsonBody({
          name: MatchersV3.string('TaskFlow MVP'),
          description: MatchersV3.string('desc'),
        });
      })
      .willRespondWith(201, (builder) => {
        builder.jsonBody({
          // Usamos matchers genéricos para los campos que pueden cambiar
          id: MatchersV3.string('abc-123'),
          name: MatchersV3.string('TaskFlow MVP'),
          ownerId: MatchersV3.string('user-456'),
        });
      })
      .executeTest(async (mockServer) => {
        const result = await createProject(
          mockServer.url,
          'TaskFlow MVP',
          'desc',
          'token-de-test'
        );
        expect(result.id).toBeDefined();
        expect(result.name).toBe('TaskFlow MVP');
      });
  });
});
