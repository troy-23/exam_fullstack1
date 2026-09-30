import { defineConfig, devices } from '@playwright/test';

const php = process.env.PHP_BINARY ?? 'php';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `"${php}" tests/serve.php`,
    url: 'http://127.0.0.1:8001',
    reuseExistingServer: false,
    env: { DB_DATABASE: process.env.TEST_DB_DATABASE ?? 'task_tracker_test' },
    timeout: 30_000,
  },
});
