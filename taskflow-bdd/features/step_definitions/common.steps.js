const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('la respuesta tiene código de estado {int}', function (expectedStatus) {
  if (!this.response) {
    throw new Error('No hay respuesta para verificar. ¿Te olvidaste de ejecutar un When?');
  }
  expect(this.response.status).to.equal(expectedStatus);
});

Then('el cuerpo contiene {string} con valor {string}', function (field, value) {
  if (!this.response || !this.response.data) {
    throw new Error('No hay datos en la respuesta para verificar.');
  }
  
  const data = this.response.data;
  let actualValue;

  // Si el campo está en la raíz, usarlo. Si no, buscar dentro de 'user'
  if (field in data) {
    actualValue = data[field];
  } else if (data.user && field in data.user) {
    actualValue = data.user[field];
  }

  expect(String(actualValue)).to.equal(value);
});
