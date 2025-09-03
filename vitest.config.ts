import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom', // DOM APIs available for web component testing

    // Test file patterns
    include: ['src/**/*.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      'test/*.html', // Exclude HTML test files (manual browser tests)
      'examples',
    ],

    // Global test configuration
    globals: true, // Enable Jest-like global test functions (describe, it, expect)

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/**/*.{spec,test}.{ts,tsx,js,jsx}',
        'src/**/register.ts', // Web component registration (browser-only)
        'src/types.ts', // Type-only file
        'src/**/types.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Test timeout
    testTimeout: 10000,

    // Setup files
    setupFiles: [],

    // Reporter configuration
    reporter: ['default', 'html'],

    // Mock configuration
    deps: {
      inline: [
        // Inline dependencies that need to be transformed
        'preact',
      ],
    },
  },

  // Vite configuration for test environment
  esbuild: {
    target: 'node18',
  },

  resolve: {
    alias: {
      // Support for TypeScript path mapping in tests
      '@': '/src',
    },
  },
});
