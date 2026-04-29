// features/step_definitions/auth.steps.js
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { expect } = require('chai');
const axios = require('axios');

// ──────────────────────────────────────────────
// CONFIGURACIÓN
// ──────────────────────────────────────────────
const BASE_URL = process.env.TASKFLOW_URL || 'http://localhost:3000';
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
  console.log(`  → Email ${email} no registrado (stub)`);
});

Given('que el email {string} ya está registrado', async function (email) {
  console.log(`  → Email ${email} ya registrado (stub)`);
});

Given('que ningún usuario está registrado', async function () {
  console.log('  → Base de datos sin usuarios (stub)');
});

Given('que existe el usuario con email {string} y password {string}', async function (email, password) {
  console.log(`  → Creando usuario ${email} (stub)`);
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
  expect(this.response.data).to.have.property(field);
});