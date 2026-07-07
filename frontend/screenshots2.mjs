import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'

const OUT = 'd:/devloper/CommerceFlow/portfolio_screenshots'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

// 1. Homepage FULL PAGE
console.log('📸 Homepage full page...')
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.screenshot({
  path: path.join(OUT, '00_homepage_full.png'),
  fullPage: true,
})
console.log('✓ 00_homepage_full.png')

// 2. Categories menu open
console.log('📸 Categories menu open...')
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

// Click the Categories button in navbar
const catBtn = await page.$('button:has-text("Categories"), a:has-text("Categories"), [aria-label*="ategori"]')
if (catBtn) {
  await catBtn.click()
  console.log('  Clicked Categories button')
} else {
  // Try hovering on the nav link
  await page.hover('text=Categories')
  console.log('  Hovered Categories')
}
await page.waitForTimeout(1200)
await page.screenshot({
  path: path.join(OUT, '00_categories_menu.png'),
  fullPage: false,
})
console.log('✓ 00_categories_menu.png')

await browser.close()
console.log('\n✅ Done! Files saved to:', OUT)
