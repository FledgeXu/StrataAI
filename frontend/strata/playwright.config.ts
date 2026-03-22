import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: "./gradlew :app:bootRun --args='--server.port=8082'",
      cwd: '../../backend/strata',
      url: 'http://localhost:8082/actuator/health',
      reuseExistingServer: false,
      env: {
        APP_AUTH_ACCESS_TOKEN_TTL: 'PT5S',
        SPRING_DEVTOOLS_RESTART_ENABLED: 'false',
        SPRING_PROFILES_ACTIVE: 'dev',
      },
    },
    {
      command: 'npm run dev -- --host localhost --port 4173',
      cwd: '.',
      url: 'http://localhost:4173/login',
      reuseExistingServer: false,
      env: {
        VITE_API_BASE_URL: 'http://localhost:8082',
      },
    },
  ],
})
