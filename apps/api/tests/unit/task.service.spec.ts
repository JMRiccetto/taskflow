import { describe, it, expect } from 'vitest';
import { TaskService } from '../../src/services/task.service';

describe('TaskService.validateTitle', () => {
    const mockDb = {
        task: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        statusHistory: { create: vi.fn() },
        projectMember: { findUnique: vi.fn() },
    }

    const taskService = new TaskService(mockDb as any)

    it('lanza error si el título tiene menos de 3 caracteres', () => {
        expect(() => taskService.validateTitle('ab')).rejects.toThrowError(
        'Title length must be at least 3 chracters long'
        );
    });

    it('lanza error si el título tiene más de 100 caracteres', () => {
        const longTitle = 'a'.repeat(101);
        expect(() => taskService.validateTitle(longTitle)).rejects.toThrowError(
        'Title length must be no more than 100 chracters long'
        );
    });

    it('lanza error si el título está vacío o es solo espacios', () => {
        expect(() => taskService.validateTitle('   ')).rejects.toThrowError(
        'Title cannot be empty'
        );
    });

    it('acepta títulos válidos sin lanzar error', () => {
        expect(() => taskService.validateTitle('Mi tarea')).not.toThrow();
    });

    it('acepta títulos con exactamente 3 caracteres', () => {
        expect(() => taskService.validateTitle('abc')).not.toThrow();
    });

    it('acepta títulos con exactamente 100 caracteres', () => {
        const title100 = 'a'.repeat(100);
        expect(() => taskService.validateTitle(title100)).not.toThrow();
    });
});