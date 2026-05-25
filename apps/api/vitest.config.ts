import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: false,
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
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
