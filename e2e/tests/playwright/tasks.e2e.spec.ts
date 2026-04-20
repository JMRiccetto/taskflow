import { test, expect } from '@playwright/test'
import { LoginPage } from '../../playwright/pages/LoginPage'
import { TaskPage } from '../../playwright/pages/TaskPage'

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
        // Usamos una de las tareas del seed
        const title = 'Configurar CI/CD'
        
        await taskPage.openTask(title)
        // Esta tarea en el seed ya está en DONE. Vamos a buscar una en TODO.
        // El seed crea: "Optimizar queries" en TODO
        const todoTitle = 'Optimizar queries de la base de datos'
        
        await page.goto('/projects') // refrescar para asegurar
        await page.getByText('seed-project').click()
        
        await taskPage.openTask(todoTitle)
        await taskPage.changeStatus('IN_PROGRESS')
        
        await page.goBack() // Volver a la lista
        const status = await taskPage.getTaskStatus(todoTitle)
        expect(status).toBe('IN_PROGRESS')
    })
})
