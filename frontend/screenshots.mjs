import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'

const OUT = 'd:/devloper/CommerceFlow/portfolio_screenshots'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })

async function shot(page, name) {
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(OUT, name), fullPage: false })
  console.log('✓', name)
}

// ─── PUBLIC PAGES ───────────────────────────────────────────────
console.log('\n📸 Capturing public pages...')
const pubCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const pub = await pubCtx.newPage()

await pub.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await shot(pub, '01_homepage.png')

await pub.goto('http://localhost:3000/products', { waitUntil: 'networkidle' })
await shot(pub, '02_products.png')

const firstLink = await pub.$('a[href^="/products/"]')
if (firstLink) {
  await firstLink.click()
  await pub.waitForLoadState('networkidle')
  await shot(pub, '03_product_detail.png')
}

await pub.goto('http://localhost:3000/login', { waitUntil: 'networkidle' })
await shot(pub, '04_login_page.png')

// Login via form
await pub.fill('input[type="email"], input[name="email"]', 'superadmin@supersoft.com')
await pub.fill('input[type="password"], input[name="password"]', 'Admin@1234')
await pub.click('button[type="submit"]')
await pub.waitForTimeout(3000)

// Wait until redirected away from login
await pub.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 15000 }).catch(() => {})
await pub.waitForTimeout(2000)
console.log('After login URL:', pub.url())

// ─── ADMIN PAGES ────────────────────────────────────────────────
console.log('\n📸 Capturing admin pages...')

await pub.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })
// Wait to confirm we're on admin, not login
await pub.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 10000 }).catch(() => {})
await pub.waitForSelector('h1', { timeout: 8000 }).catch(() => {})
await shot(pub, '05_admin_dashboard.png')
console.log('  URL:', pub.url())

await pub.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle' })
await pub.waitForSelector('table, h1', { timeout: 8000 }).catch(() => {})
await shot(pub, '06_admin_products.png')

await pub.goto('http://localhost:3000/admin/orders', { waitUntil: 'networkidle' })
await pub.waitForSelector('table, h1', { timeout: 8000 }).catch(() => {})
await shot(pub, '07_admin_orders.png')

await pub.goto('http://localhost:3000/admin/customers', { waitUntil: 'networkidle' })
await pub.waitForSelector('table, h1', { timeout: 8000 }).catch(() => {})
await shot(pub, '08_admin_customers.png')

await pub.goto('http://localhost:3000/admin/inventory', { waitUntil: 'networkidle' })
await pub.waitForSelector('table, h1', { timeout: 8000 }).catch(() => {})
await shot(pub, '09_admin_inventory.png')

await pub.goto('http://localhost:3000/admin/reports', { waitUntil: 'networkidle' })
await pub.waitForSelector('h1', { timeout: 8000 }).catch(() => {})
await shot(pub, '10_admin_reports.png')

await pub.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle' })
await pub.waitForSelector('h1', { timeout: 8000 }).catch(() => {})
await shot(pub, '11_admin_settings.png')

await pubCtx.close()
await browser.close()
console.log('\n✅ All screenshots saved to:', OUT)
