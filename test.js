const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Opening http://localhost:3000...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Test 1: NL2SQL - Ask input field
  console.log('\n1. Testing NL2SQL...');
  const askInput = await page.locator('input[placeholder*="show revenue"]').count();
  console.log('   Ask input found:', askInput > 0 ? 'YES' : 'NO');

  // Type a query
  await page.fill('input[placeholder*="show revenue"]', 'show revenue by month');
  await page.click('button:has-text("Generate SQL")');
  await page.waitForTimeout(2000);

  // Check SQL was generated
  const sql = await page.locator('textarea').inputValue();
  console.log('   SQL generated:', sql.includes('DATE_TRUNC') ? 'YES' : 'NO');

  // Test 2: YAML Edit button
  console.log('\n2. Testing YAML Edit button...');
  await page.click('text=sem_order_sales.yml');
  await page.waitForTimeout(1000);

  const editBtn = await page.locator('button:has-text("Edit")').count();
  console.log('   Edit button found:', editBtn > 0 ? 'YES' : 'NO');

  // Click Edit
  if (editBtn > 0) {
    await page.click('button:has-text("Edit")');
    await page.waitForTimeout(500);
    const textarea = await page.locator('textarea').count();
    console.log('   Edit mode (textarea):', textarea > 0 ? 'YES' : 'NO');
  }

  console.log('\n✅ Tests completed!');
  await browser.close();
})();
