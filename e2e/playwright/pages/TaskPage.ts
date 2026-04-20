import { Page, expect } from '@playwright/test'

export class TaskPage {
    constructor(private page: Page) { }

    async createTask(title: string, priority: string = 'MEDIUM') {
        await this.page.getByTestId('create-task-btn').click()
        await this.page.getByTestId('task-title-input').fill(title)
        await this.page.selectOption('select', priority)
        await this.page.getByTestId('task-submit').click()
    }

    async expectTaskVisible(title: string) {
        await expect(this.page.getByText(title)).toBeVisible()
    }

    async getTaskStatus(title: string) {
        const taskCard = this.page.locator(`[data-testid="task-card"]:has-text("${title}")`)
        return await taskCard.getByTestId('status-badge').innerText()
    }

    async openTask(title: string) {
        await this.page.getByText(title).click()
    }

    async changeStatus(status: 'IN_PROGRESS' | 'DONE') {
        const buttonName = status === 'IN_PROGRESS' ? 'Iniciar' : 'Completar'
        await this.page.getByRole('button', { name: buttonName }).click()
    }
}
