import {defineConfig,devices} from '@playwright/test'
export default defineConfig({
  testDir:'./tests/e2e', fullyParallel:false, workers:1, timeout:45000,
  reporter:'list',
  use:{baseURL:'http://127.0.0.1:5173', timezoneId:'America/Sao_Paulo',headless:true, screenshot:'only-on-failure', trace:'retain-on-failure', channel:process.env.PLAYWRIGHT_CHANNEL || undefined},
  projects:[
    {name:'notebook',use:{viewport:{width:1440,height:1000}}},
    {name:'celular',use:{...devices['Pixel 7'],defaultBrowserType:'chromium'}},
  ],
  webServer:{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},
})
