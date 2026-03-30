// tests/unit/task.validate-transition.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { TaskService, TaskStatus } from '../../src/services/task.service'

// ── Stub mínimo del repositorio ────────────────────────────────
const mockDb = {
    task: { findUnique: vi.fn(), update: vi.fn() },
    statusHistory: { create: vi.fn() },
    projectMember: { findUnique: vi.fn() },
}

const taskService = new TaskService(mockDb as any)

// EJERCICIO 2: Máquina de estados

describe('TaskService.validateStatusTransition — Ejercicio 2', () => {

    // Transiciones VÁLIDAS

    // Caso 1: TODO → IN_PROGRESS
    it('permite la transición TODO → IN_PROGRESS', () => {
        expect(() =>
            taskService.validateStatusTransition(TaskStatus.TODO, TaskStatus.IN_PROGRESS)
        ).not.toThrow()
    })

    // Caso 2: IN_PROGRESS → DONE
    it('permite la transición IN_PROGRESS → DONE', () => {
        expect(() =>
            taskService.validateStatusTransition(TaskStatus.IN_PROGRESS, TaskStatus.DONE)
        ).not.toThrow()
    })

    // Transiciones INVÁLIDAS

    // Caso 3: TODO → DONE (salto de estado)
    it('rechaza TODO → DONE (salto de estado)', () => {
        expect(() =>
            taskService.validateStatusTransition(TaskStatus.TODO, TaskStatus.DONE)
        ).toThrow('Transición de estado inválida: TODO → DONE')
    })

    // Caso 4: IN_PROGRESS → TODO (retroceso)
    it('rechaza IN_PROGRESS → TODO (retroceso)', () => {
        expect(() =>
            taskService.validateStatusTransition(TaskStatus.IN_PROGRESS, TaskStatus.TODO)
        ).toThrow('Transición de estado inválida: IN_PROGRESS → TODO')
    })

    // Caso 5: DONE → cualquier estado (estado final)
    it('rechaza DONE → TODO (estado final, sin transiciones)', () => {
        expect(() =>
            taskService.validateStatusTransition(TaskStatus.DONE, TaskStatus.TODO)
        ).toThrow('Transición de estado inválida: DONE → TODO')
    })

    // Caso 6: misma transición (mismo estado)
    it('rechaza transición al mismo estado (TODO → TODO)', () => {
        expect(() =>
            taskService.validateStatusTransition(TaskStatus.TODO, TaskStatus.TODO)
        ).toThrow('Transición de estado inválida: TODO → TODO')
    })
})
