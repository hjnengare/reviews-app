/**
 * Global setup for Playwright E2E tests
 * Runs before all tests to prepare the environment
 */

import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Launch browser for setup
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('📡 Checking if server is running...');
    
    // Check if the application server is running
    try {
      await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
      console.log('✅ Server is running and accessible');
    } catch (error) {
      console.error('❌ Server is not accessible:', error.message);
      throw new Error('Application server must be running on http://localhost:3002 before running tests');
    }
    
    // Verify critical pages load
    const criticalPages = ['/explore', '/onboarding'];
    
    for (const pagePath of criticalPages) {
      try {
        await page.goto(`http://localhost:3002${pagePath}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        console.log(`✅ ${pagePath} is accessible`);
      } catch (error) {
        console.warn(`⚠️  ${pagePath} is not accessible:`, error.message);
      }
    }
    
    // Set up test data if needed
    console.log('📋 Setting up test data...');
    
    // Clear any existing test data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Set up default test configuration
    await page.evaluate(() => {
      localStorage.setItem('test-mode', 'true');
      localStorage.setItem('test-timestamp', Date.now().toString());
    });
    
    console.log('✅ Test data setup complete');
    
    // Verify JavaScript and CSS resources load
    console.log('🔍 Verifying resource loading...');
    
    const responses = [];
    page.on('response', response => responses.push(response));
    
    await page.goto('http://localhost:3002/explore', { waitUntil: 'networkidle' });
    
    // Check for critical resources
    const jsFiles = responses.filter(r => r.url().includes('.js') && r.status() === 200);
    const cssFiles = responses.filter(r => r.url().includes('.css') && r.status() === 200);
    
    console.log(`✅ Loaded ${jsFiles.length} JavaScript files`);
    console.log(`✅ Loaded ${cssFiles.length} CSS files`);
    
    // Check for failed resources
    const failedResources = responses.filter(r => r.status() >= 400);
    if (failedResources.length > 0) {
      console.warn('⚠️  Some resources failed to load:');
      failedResources.forEach(r => {
        console.warn(`   - ${r.url()} (${r.status()})`);
      });
    }
    
    // Test mobile viewport
    console.log('📱 Testing mobile viewport...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle' });
    
    const mobileElements = await page.locator('[data-mobile-search], [data-nav-toggler]').count();
    if (mobileElements > 0) {
      console.log('✅ Mobile elements detected');
    } else {
      console.warn('⚠️  Mobile elements not found');
    }
    
    // Test desktop viewport
    console.log('🖥️  Testing desktop viewport...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload({ waitUntil: 'networkidle' });
    
    const desktopElements = await page.locator('.input-wrapper, .search-field').count();
    if (desktopElements > 0) {
      console.log('✅ Desktop search elements detected');
    } else {
      console.warn('⚠️  Desktop search elements not found');
    }
    
    // Clean up
    await browser.close();
    
    console.log('🎉 Global setup completed successfully!\n');
    
    return {
      baseURL: 'http://localhost:3002',
      timestamp: Date.now(),
      jsFiles: jsFiles.length,
      cssFiles: cssFiles.length,
      failedResources: failedResources.length
    };
    
  } catch (error) {
    console.error('💥 Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;