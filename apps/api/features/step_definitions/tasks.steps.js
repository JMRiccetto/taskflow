// features/step_definitions/tasks.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const axios = require('axios');

const BASE_URL = process.env.TASKFLOW_URL || 'http://localhost:3001';
const api = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

let currentUser = null;
let currentProject = null;
let currentTask = null;

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

function mapColumnToStatus(col) {
  switch (col) {
    case 'To Do': return 'TODO';
    case 'In Progress': return 'IN_PROGRESS';
    case 'In Review': return 'IN_PROGRESS'; // SQLite enums maps In Review to IN_PROGRESS
    case 'Done': return 'DONE';
    default: return col.toUpperCase().replace(' ', '_');
  }
}

function mapStatusToColumn(status) {
  switch (status) {
    case 'TODO': return 'To Do';
    case 'IN_PROGRESS': return 'In Progress';
    case 'DONE': return 'Done';
    default: return status;
  }
}

Given('existe un proyecto {string} con un miembro autenticado', async function (projectName) {
  const user = await getOrCreateUser('member@test.com');
  currentUser = { email: 'member@test.com', token: user.token, id: user.id };

  const projRes = await api.post('/api/projects', {
    name: projectName,
    description: 'Project for tasks'
  }, {
    headers: { Authorization: `Bearer ${currentUser.token}` }
  });
  currentProject = projRes.data;
});

Given('que existe la tarea {string} en la columna {string}', async function (taskTitle, column) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const status = mapColumnToStatus(column);

  currentTask = await prisma.task.create({
    data: {
      title: taskTitle,
      status: status,
      projectId: currentProject.id
    }
  });

  await prisma.$disconnect();
});

Given('existe el miembro {string} en el proyecto', async function (email) {
  const user = await getOrCreateUser(email);

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  // Agregar miembro al proyecto
  await prisma.projectMember.create({
    data: {
      projectId: currentProject.id,
      userId: user.id,
      role: 'MEMBER'
    }
  });

  await prisma.$disconnect();
});

When('el miembro crea una tarea con:', async function (dataTable) {
  const data = dataTable.rowsHash();
  const headers = {};
  if (currentUser && currentUser.token) {
    headers.Authorization = `Bearer ${currentUser.token}`;
  }
  this.response = await api.post(`/api/projects/${currentProject.id}/tasks`, {
    title: data.title,
    priority: data.priority ? data.priority.toUpperCase() : 'MEDIUM'
  }, { headers });

  if (this.response.status === 201) {
    currentTask = this.response.data;
  }
});

When('el miembro mueve la tarea a la columna {string}', async function (column) {
  const headers = {};
  if (currentUser && currentUser.token) {
    headers.Authorization = `Bearer ${currentUser.token}`;
  }

  const status = mapColumnToStatus(column);
  this.response = await api.patch(`/api/tasks/${currentTask.id}`, {
    status: status
  }, { headers });
});

When('el miembro asigna la tarea a {string}', async function (email) {
  const user = await getOrCreateUser(email);

  const headers = {};
  if (currentUser && currentUser.token) {
    headers.Authorization = `Bearer ${currentUser.token}`;
  }

  this.response = await api.patch(`/api/tasks/${currentTask.id}`, {
    assignedTo: user.id
  }, { headers });
});

Then('la tarea aparece en la columna {string}', function (column) {
  const status = this.response.data.status;
  const col = mapStatusToColumn(status);
  expect(col).to.equal(column);
});

Then('la tarea tiene prioridad {string}', function (priority) {
  expect(this.response.data.priority.toLowerCase()).to.equal(priority.toLowerCase());
});

Then('el estado de la tarea es {string}', function (status) {
  expect(this.response.data.status.toLowerCase()).to.equal(status.toLowerCase().replace(' ', '_'));
});

Then('la tarea está asignada a {string}', function (email) {
  expect(this.response.data.assignee.email).to.equal(email);
});