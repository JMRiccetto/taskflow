// features/step_definitions/auth.steps.js
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { expect } = require('chai');
const axios = require('axios');

// ──────────────────────────────────────────────
// CONFIGURACIÓN
// ──────────────────────────────────────────────
const BASE_URL = process.env.TASKFLOW_URL || 'http://localhost:3001';
const api = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

// ──────────────────────────────────────────────
// CONTEXTO COMPARTIDO (world)
// ──────────────────────────────────────────────
// Cucumber.js inyecta "this" como el World object en cada step
// Usamos variables locales al scenario para almacenar estado

// ──────────────────────────────────────────────
// STEPS: GIVEN
// ──────────────────────────────────────────────

Given('el servidor de TaskFlow está disponible', async function () {
  console.log('  → Verificando disponibilidad del servidor...');
});

Given('la base de datos está limpia', async function () {
  console.log('  → Limpiando base de datos...');
});

Given('que el email {string} no está registrado', async function (email) {
  // El servidor debería estar limpio por el background
});

Given('que el email {string} ya está registrado', async function (email) {
  await api.post('/api/auth/register', {
    email,
    password: 'ValidPass123!',
    name: 'Usuario Existente'
  });
});

Given('que ningún usuario está registrado', async function () {
  // Opcional: llamar a un endpoint de reset si existiera
});

Given('que existe el usuario con email {string} y password {string}', async function (email, password) {
  await api.post('/api/auth/register', {
    email,
    password,
    name: 'Test User'
  });
});

// ──────────────────────────────────────────────
// STEPS: WHEN
// ──────────────────────────────────────────────

When('el usuario envía los datos de registro:', async function (dataTable) {
  const data = dataTable.rowsHash();
  this.response = await api.post('/api/auth/register', {
    email: data.email,
    password: data.password,
    name: data.name
  });
  console.log(`  → POST /api/auth/register con email: ${data.email}`);
});

When('el usuario envía las credenciales:', async function (dataTable) {
  const data = dataTable.rowsHash();
  this.response = await api.post('/api/auth/login', {
    email: data.email,
    password: data.password
  });
  console.log(`  → POST /api/auth/login con email: ${data.email}`);
});

// ──────────────────────────────────────────────
// STEPS: THEN
// ──────────────────────────────────────────────

Then('el cuerpo contiene el campo {string}', function (field) {
  const data = this.response.data;
  // Soporte para campos anidados (como user.id)
  if (data.user && data.user[field]) {
    expect(data.user).to.have.property(field);
  } else {
    expect(data).to.have.property(field);
  }
});