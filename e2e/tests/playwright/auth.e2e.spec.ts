import { test } from '@playwright/test'
import { LoginPage } from '../../playwright/pages/LoginPage'

test.describe('Autenticación con POM', () => {
    test('un usuario se registra e inicia sesión exitosamente', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const email = `test-${Date.now()}@example.com`
        const password = 'Password123!'
        
        // 1. Registro
        await loginPage.register(email, password, 'Usuario POM')
        await loginPage.expectRedirectToLogin()
        
        // 2. Login
        await loginPage.login(email, password)
        await loginPage.expectRedirectToProjects()
    })

    test('muestra error con contraseña débil', async ({ page }) => {
        const loginPage = new LoginPage(page)
        
        await loginPage.register('usuario@test.com', '123', 'Nombre')
        
        // El frontend muestra un mensaje genérico si no encuentra .message en la respuesta
        await loginPage.expectErrorMessage('Error al registrarse')
    })

    test('muestra error con credenciales inválidas', async ({ page }) => {
        const loginPage = new LoginPage(page)
        
        await loginPage.login('seed@test.com', 'PasswordEquivocada')
        
        // El error de login incorrecto sí tiene un mensaje legible
        await loginPage.expectErrorMessage('Error al iniciar sesión')
    })
})