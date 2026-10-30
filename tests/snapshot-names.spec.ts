// Repro: locator.ariaSnapshot({ mode: 'ai' }) (used by playwright-cli `snapshot` and MCP browser_snapshot)
// drops a container's accessible name when the name comes from a VISIBLE DESCENDANT, while
// ariaSnapshot() in default mode and getByRole(role, { name }) both see it.
// Each case is isolated in its own page so the snapshot of one can't affect another.
import { test, expect } from '@playwright/test';
import { CASES } from './cases';

for (const c of CASES) {
  test(`${c.id}: ${c.role} named by ${c.source}`, async ({ page }) => {
    await page.setContent(`<!doctype html><main>${c.html}</main>`);

    // The browser computes the name: getByRole finds the element by it.
    await expect(page.getByRole(c.role as any, { name: c.name, exact: true })).toHaveCount(1);

    const main = page.getByRole('main');
    const defaultMode = await main.ariaSnapshot();
    const aiMode = await main.ariaSnapshot({ mode: 'ai' });
    await test.info().attach('snapshots', { body: `default:\n${defaultMode}\n\nai:\n${aiMode}`, contentType: 'text/plain' });

    // Default mode keeps the name.
    expect(defaultMode).toContain(`${c.role} "${c.name}"`);
    // AI mode should keep it too (this is what fails for names from a visible descendant).
    expect(aiMode, `AI-mode snapshot:\n${aiMode}`).toContain(`${c.role} "${c.name}"`);
  });
}
