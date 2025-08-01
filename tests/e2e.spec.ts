import { test, expect } from '@playwright/test';

test.describe('Wage Lookup App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main heading and search box', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Gross Wage Lookup' })).toBeVisible();
    await expect(page.getByPlaceholder(/Type an occupation/)).toBeVisible();
  });

  test('should show suggestions when typing', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Type an occupation/);
    await searchBox.fill('software');
    
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 3000 });
  });

  test('should handle keyboard navigation in suggestions', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Type an occupation/);
    await searchBox.fill('nurse');
    
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 3000 });
    
    await searchBox.press('ArrowDown');
    await expect(page.locator('[aria-selected="true"]')).toBeVisible();
    
    await searchBox.press('Enter');
    await expect(page.locator('.bg-white.dark\\:bg-gray-800.rounded-lg')).toBeVisible({ timeout: 5000 });
  });

  test('should toggle dark mode', async ({ page }) => {
    const darkModeButton = page.getByLabel(/Switch to dark mode/);
    await darkModeButton.click();
    
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    const lightModeButton = page.getByLabel(/Switch to light mode/);
    await lightModeButton.click();
    
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should display search results', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Type an occupation/);
    await searchBox.fill('teacher');
    await searchBox.press('Enter');
    
    await expect(page.locator('text=Searching...')).toBeVisible();
    await expect(page.locator('text=Searching...')).not.toBeVisible({ timeout: 10000 });
  });

  test('should show no results message for invalid search', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Type an occupation/);
    await searchBox.fill('xyz123invalid');
    await searchBox.press('Enter');
    
    await expect(page.locator('text=No results found')).toBeVisible({ timeout: 10000 });
  });

  test('should clear search when clear button is clicked', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Type an occupation/);
    await searchBox.fill('engineer');
    
    const clearButton = page.getByLabel('Clear search');
    await clearButton.click();
    
    await expect(searchBox).toHaveValue('');
  });
});