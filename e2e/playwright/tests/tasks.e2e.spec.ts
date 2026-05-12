import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { TaskPage } from '../pages/TaskPage'

test.describe('Flujo de tareas con POM', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page)
        
        // Login con el usuario del seed que ya tiene un proyecto "seed-project"
        await loginPage.login('seed@test.com', 'Password1')
        await loginPage.expectRedirectToProjects()
        
        // Ir directamente al proyecto del seed
        // Nota: asumiendo que la URL sigue el patrón /projects/:id
        // En el seed.ts el id del proyecto suele ser generado, pero el nombre es fijo
        await page.goto('/projects')
        await page.getByText('seed-project').click()
    })

    test('crear tarea y verificar estado inicial TODO', async ({ page }) => {
        const taskPage = new TaskPage(page)
        const title = `Tarea POM ${Date.now()}`
        
        await taskPage.createTask(title, 'HIGH')
        await taskPage.expectTaskVisible(title)
        
        const status = await taskPage.getTaskStatus(title)
        expect(status).toBe('TODO')
    })

    test('mover tarea de TODO a IN_PROGRESS', async ({ page }) => {
        const taskPage = new TaskPage(page)
        const title = `Mover esta tarea ${Date.now()}`
        
        // 1. Crear la tarea en TODO
        await taskPage.createTask(title, 'LOW')
        await taskPage.expectTaskVisible(title)
        
        // 2. Abrirla y cambiar estado
        await taskPage.openTask(title)
        await taskPage.changeStatus('IN_PROGRESS')
        
        // 3. Verificar en la lista
        await page.goBack() 
        await page.reload() // Asegurar que la lista se refresque
        const status = await taskPage.getTaskStatus(title)
        expect(status).toBe('IN_PROGRESS')
    })
})
