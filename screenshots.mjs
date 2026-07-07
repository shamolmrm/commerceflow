import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'

const OUT = 'd:/devloper/CommerceFlow/portfolio_screenshots'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

async function shot(name, waitFor) {
  if (waitFor) await page.waitForSelector(waitFor, { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(1800)
  await page.screenshot({ path: path.join(OUT, name), fullPage: false })
  console.log('✓', name)
}

// 1. Homepage
console.log('\n📸 Capturing public pages...')
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await shot('01_homepage.png', 'h1,h2')

// 2. Products page
await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle' })
await shot('02_products.png', '.grid')

// 3. Single product (first one from products page)
const firstProduct = await page.$('a[href^="/products/"]')
if (firstProduct) {
  await firstProduct.click()
  await page.waitForLoadState('networkidle')
  await shot('03_product_detail.png', 'h1')
}

// 4. Login page
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' })
await shot('04_login_page.png', 'form')

// 5. Login as admin
await page.fill('input[type="email"]', 'admin@commerceflow.com')
await page.fill('input[type="password"]', 'admin123')
await page.click('button[type="submit"]')
await page.waitForLoadState('networkidle')
await page.waitForTimeout(2000)

// 6. Admin Dashboard
console.log('\n📸 Capturing admin pages...')
await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })
await shot('05_admin_dashboard.png', 'h1')

// 7. Admin Products
await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle' })
await shot('06_admin_products.png', 'table')

// 8. Admin Orders
await page.goto('http://localhost:3000/admin/orders', { waitUntil: 'networkidle' })
await shot('07_admin_orders.png', 'table')

// 9. Admin Customers
await page.goto('http://localhost:3000/admin/customers', { waitUntil: 'networkidle' })
await shot('08_admin_customers.png', 'table')

// 10. Admin Reports
await page.goto('http://localhost:3000/admin/reports', { waitUntil: 'networkidle' })
await shot('09_admin_reports.png', 'h1')

// 11. Admin Inventory
await page.goto('http://localhost:3000/admin/inventory', { waitUntil: 'networkidle' })
await shot('10_admin_inventory.png', 'table')

await browser.close()
console.log('\n✅ All screenshots saved to:', OUT)
