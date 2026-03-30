// tests/unit/task.service.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { TaskService } from '../../src/services/task.service'

// ── Stub del repositorio (sin levantar DB) ───────────────────────
const mockDb = {
    task: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
    statusHistory: { create: vi.fn() },
    projectMember: { findUnique: vi.fn() },
}

const taskService = new TaskService(mockDb as any)

// EJERCICIO 1: Validaciones del título de una tarea

describe('TaskService.validateTitle — Ejercicio 1', () => {

    // Caso 1: título con menos de 3 caracteres → error
    it('lanza error si el título tiene menos de 3 caracteres', () => {
        expect(() => taskService.validateTitle('ab')).toThrow(
            'El título debe tener al menos 3 caracteres'
        )
    })

    // Caso 2: título con más de 100 caracteres → error
    it('lanza error si el título tiene más de 100 caracteres', () => {
        const longTitle = 'a'.repeat(101)
        expect(() => taskService.validateTitle(longTitle)).toThrow(
            'El título no puede superar los 100 caracteres'
        )
    })

    // Caso 3: título vacío o solo espacios → error
    it('lanza error si el título está vacío o es solo espacios en blanco', () => {
        expect(() => taskService.validateTitle('   ')).toThrow(
            'El título no puede estar vacío'
        )
    })

    // Caso 4: título válido → sin error
    it('acepta títulos válidos sin lanzar error', () => {
        expect(() => taskService.validateTitle('Mi tarea')).not.toThrow()
    })

    // Caso 5: exactamente 3 caracteres (valor límite inferior) → sin error
    it('acepta título con exactamente 3 caracteres (valor límite)', () => {
        expect(() => taskService.validateTitle('abc')).not.toThrow()
    })

    // Caso 6: exactamente 100 caracteres (valor límite superior) → sin error
    it('acepta título con exactamente 100 caracteres (valor límite)', () => {
        const title100 = 'a'.repeat(100)
        expect(() => taskService.validateTitle(title100)).not.toThrow()
    })
})