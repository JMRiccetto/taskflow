// features/step_definitions/projects.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const axios = require('axios');

const BASE_URL = process.env.TASKFLOW_URL || 'http://localhost:3001';
const api = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

let currentUser = null;
let currentProject = null;

async function getOrCreateUser(email) {
  const regRes = await api.post('/api/auth/register', {
    email,
    password: 'ValidPass123!',
    name: 'User'
  });
  if (regRes.status === 201) {
    return { token: regRes.data.token, id: regRes.data.user.id };
  }

  const loginRes = await api.post('/api/auth/login', {
    email,
    password: 'ValidPass123!'
  });
  return { token: loginRes.data.token, id: loginRes.data.user.id };
}

Given('existe un usuario autenticado con email {string}', async function (email) {
  const user = await getOrCreateUser(email);
  currentUser = { email, token: user.token, id: user.id };
});

Given('que existe un proyecto {string} del usuario {string}', async function (projectName, ownerEmail) {
  const user = await getOrCreateUser(ownerEmail);
  const projRes = await api.post('/api/projects', {
    name: projectName,
    description: 'BDD Project'
  }, {
    headers: { Authorization: `Bearer ${user.token}` }
  });
  currentProject = projRes.data;
});

Given('existe un usuario con email {string}', async function (email) {
  await getOrCreateUser(email);
});

Given('existe un usuario con email {string} con rol {string}', async function (email, role) {
  await getOrCreateUser(email);
  if (currentProject) {
    const owner = await getOrCreateUser('owner@test.com');
    await api.post(`/api/projects/${currentProject.id}/members`, {
      email,
      role
    }, {
      headers: { Authorization: `Bearer ${owner.token}` }
    });
  }
});

When('el usuario crea un proyecto con:', async function (dataTable) {
  const data = dataTable.rowsHash();
  const headers = {};
  if (currentUser && currentUser.token) {
    headers.Authorization = `Bearer ${currentUser.token}`;
  }
  this.response = await api.post('/api/projects', {
    name: data.name,
    description: data.description || '',
    color: data.color || ''
  }, { headers });

  if (this.response.status === 201) {
    currentProject = this.response.data;
  }
});

When('el propietario invita a {string} como {string}', async function (email, role) {
  const owner = await getOrCreateUser('owner@test.com');
  this.response = await api.post(`/api/projects/${currentProject.id}/members`, {
    email,
    role
  }, {
    headers: { Authorization: `Bearer ${owner.token}` }
  });
});

When('{string} intenta crear una tarea en el proyecto', async function (email) {
  const user = await getOrCreateUser(email);
  this.response = await api.post(`/api/projects/${currentProject.id}/tasks`, {
    title: 'Tarea prohibida',
    priority: 'MEDIUM'
  }, {
    headers: { Authorization: `Bearer ${user.token}` }
  });
});

When('el usuario solicita listar sus proyectos', async function () {
  const headers = {};
  if (currentUser && currentUser.token) {
    headers.Authorization = `Bearer ${currentUser.token}`;
  }
  this.response = await api.get('/api/projects', { headers });
});

Then('el proyecto tiene columnas: {string}, {string}, {string}, {string}', function (c1, c2, c3, c4) {
  const expected = [c1, c2, c3, c4];
  expect(this.response.data.columns).to.deep.equal(expected);
});

Then('el usuario es propietario del proyecto', function () {
  expect(this.response.data.ownerId).to.equal(currentUser.id);
});

Then('el proyecto tiene {int} participantes', async function (count) {
  const owner = await getOrCreateUser('owner@test.com');
  const res = await api.get(`/api/projects/${currentProject.id}`, {
    headers: { Authorization: `Bearer ${owner.token}` }
  });
  expect(res.data.members).to.have.lengthOf(count);
});

Then('la lista contiene el proyecto {string}', function (projectName) {
  const found = this.response.data.some(p => p.name === projectName);
  expect(found).to.be.true;
});

Then('la lista no contiene el proyecto {string}', function (projectName) {
  const found = this.response.data.some(p => p.name === projectName);
  expect(found).to.be.false;
});