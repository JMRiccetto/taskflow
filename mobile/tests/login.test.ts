describe('Login Screen', () => {
  it('dado formato válido, navega a la pantalla Home', async () => {
    await browser.$('~input-email').setValue('test@taskflow.com');
    await browser.$('~input-password').setValue('Password123!');
    await browser.$('~button-LOGIN').click();

    // En esta App, el login exitoso muestra una alerta. La cerramos para no bloquear el siguiente test.
    await browser.acceptAlert();

    const homeElement = await browser.$('~Home');
    await expect(homeElement).toBeDisplayed();
  });

  it('dado email con formato inválido, muestra mensaje de error', async () => {
    await browser.$('~input-email').setValue('esto-no-es-un-email');
    await browser.$('~input-password').setValue('Password123!');
    await browser.$('~button-LOGIN').click();

    // El mensaje de error de email
    const errorMsg = await browser.$('~input-error-message');
    await expect(errorMsg).toBeDisplayed();
    await expect(errorMsg).toHaveText('Please enter a valid email address');
  });

  it('dado password menor a 8 caracteres, muestra mensaje de error', async () => {
    // Nos aseguramos de limpiar el campo de email del test anterior
    await browser.$('~input-email').setValue('test@taskflow.com');
    await browser.$('~input-password').setValue('corta'); 
    await browser.$('~button-LOGIN').click();

    // El mensaje de error de password usa el mismo ID de error
    const errorMsg = await browser.$('~input-error-message');
    await expect(errorMsg).toBeDisplayed();
    await expect(errorMsg).toHaveText('Please enter at least 8 characters');
  });
});