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
  expect(String(this.response.data[field])).to.equal(value);
});
