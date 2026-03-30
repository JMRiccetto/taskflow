import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 40,
        statements: 40,
      },
      exclude: [
        'src/index.ts',
        'src/prisma/**',
        'dist/**',
        '**/*.d.ts',
      ],
    },
    setupFiles: ['./tests/setup.ts'],
  },
})
