import { test, expect } from '@playwright/test'
import { LoginPage } from '../../playwrig../../playwright/pages/LoginPage'
import { ProjectListPage } from '../../playwrig../../playwright/pages/ProjectListPage'

test.describe('Gestión de proyectos con POM', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page)
        const email = `user_${Date.now()}@test.com`
        const password = 'Password123!'
        
        await loginPage.register(email, password, 'Test User')
        await loginPage.expectRedirectToLogin()
        await loginPage.login(email, password)
        await loginPage.expectRedirectToProjects()
    })

    test('crear proyecto aparece en la lista', async ({ page }) => {
        const projectsPage = new ProjectListPage(page)
        const name = `Mi Proyecto POM ${Date.now()}`
        
        await projectsPage.createProject(name)
        await projectsPage.expectProjectVisible(name)
    })

    test('nombre vacío no crea el proyecto', async ({ page }) => {
        const projectsPage = new ProjectListPage(page)
        
        await projectsPage.createProject('')
        
        // El atributo 'required' del navegador bloquea el submit, el form sigue visible
        await projectsPage.expectFormVisible()
    })
})
