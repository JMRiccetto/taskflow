// tests/unit/auth.failed-login.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { AuthService } from '../../src/services/auth.service'

// EJERCICIO 3: Bloqueo de cuenta — handleFailedLogin
// El sistema bloquea la cuenta tras 5 intentos fallidos consecutivos.

describe('AuthService.handleFailedLogin — Ejercicio 3', () => {

    /**
     * Crea un stub de repositorio con el usuario en el estado deseado.
     * update() aplica los cambios al mockUser para poder inspeccionarlos después.
     */
    function makeRepoWithUser(failedAttempts: number, isLocked = false) {
        const mockUser = {
            id: 'u1',
            email: 'test@test.com',
            failedAttempts,
            isLocked,
        }

        const mockUserRepo = {
            user: {
                findUnique: vi.fn().mockResolvedValue(mockUser),
                update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
                    Object.assign(mockUser, data)
                    return mockUser
                }),
            },
        }

        return { mockUser, mockUserRepo }
    }

    // Caso 1: Después del 1er intento fallido → failedAttempts=1, NO bloqueada
    it('después del 1er intento fallido: failedAttempts=1 y cuenta NO bloqueada', async () => {
        const { mockUser, mockUserRepo } = makeRepoWithUser(0)
        const authSvc = new AuthService(mockUserRepo as any)

        await authSvc.handleFailedLogin('u1')

        expect(mockUser.failedAttempts).toBe(1)
        expect(mockUser.isLocked).toBe(false)
    })

    // Caso 2: Después del 4to intento fallido → failedAttempts=4, NO bloqueada
    it('después del 4to intento fallido: failedAttempts=4 y cuenta NO bloqueada', async () => {
        const { mockUser, mockUserRepo } = makeRepoWithUser(3)
        const authSvc = new AuthService(mockUserRepo as any)

        await authSvc.handleFailedLogin('u1')

        expect(mockUser.failedAttempts).toBe(4)
        expect(mockUser.isLocked).toBe(false)
    })

    // Caso 3: Después del 5to intento fallido → failedAttempts=5, SÍ bloqueada
    // 🐛 Este test FALLA con el bug activo (> en lugar de >=)
    it('después del 5to intento fallido: failedAttempts=5 y cuenta SÍ bloqueada (BUG-05)', async () => {
        const { mockUser, mockUserRepo } = makeRepoWithUser(4)
        const authSvc = new AuthService(mockUserRepo as any)

        await authSvc.handleFailedLogin('u1')

        expect(mockUser.failedAttempts).toBe(5)
        expect(mockUser.isLocked).toBe(true) // ← FALLA con el bug: usa > en vez de >=
    })

    // Caso 4: Cuenta ya bloqueada → no modifica failedAttempts
    it('si la cuenta ya está bloqueada, no modifica failedAttempts (el conteo se detiene)', async () => {
        const { mockUser, mockUserRepo } = makeRepoWithUser(5, true)
        const authSvc = new AuthService(mockUserRepo as any)

        await authSvc.handleFailedLogin('u1')

        // El conteo se detiene: no se llama update
        expect(mockUser.failedAttempts).toBe(5)
        expect(mockUserRepo.user.update).not.toHaveBeenCalled()
    })
})
