import { describe, expect, it } from 'vitest';
import { loadCardViewDemoLicense } from './card-view-demo-license';

describe('official card-view demo license', () => {
  it('uses a card-only key restricted to the exact official HTTPS origin', async () => {
    const license = await loadCardViewDemoLicense('https://wts-data-table.github.io');
    expect(license.claims.features).toEqual(['card-view']);
    expect(license.claims.origins).toEqual(['https://wts-data-table.github.io']);
  });
  it('uses a separate signed key for local preview, with no remote origins', async () => {
    const license = await loadCardViewDemoLicense('http://127.0.0.1:4300');
    expect(license.claims.sub).toBe('wts-data-table-local-preview');
    expect(license.claims.origins?.every(origin => /^http:\/\/(localhost|127\.0\.0\.1):/.test(origin))).toBe(true);
  });
  it('does not silently enable copied demos on other domains', async () => {
    for (const origin of ['https://customer.example', 'http://wts-data-table.github.io', 'https://sub.wts-data-table.github.io']) {
      await expect(loadCardViewDemoLicense(origin)).rejects.toThrow('valid for this origin');
    }
  });
});
