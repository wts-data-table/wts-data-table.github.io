import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadCardViewDemoLicense } from './card-view-demo-license';
import { testSubscription } from './license-test-fixture';
afterEach(() => vi.unstubAllGlobals());

describe('renewable card-view demo license', () => {
  it('rejects unconfigured origins before a service request', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    await expect(loadCardViewDemoLicense('https://customer.example')).rejects.toThrow('this origin');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not unlock premium when deployment configuration is empty', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ deployments: {} })));
    await expect(loadCardViewDemoLicense('https://wts-data-table.github.io')).rejects.toThrow('not been configured');
  });
  it('connects to the service using the configured key and has no forever-cached token', async () => {
    const actual = 'http://localhost:4300';
    vi.stubGlobal('document', { location: new URL(actual), addEventListener() {}, removeEventListener() {} });
    const fetcher = vi.fn(async (url: string | URL | Request) => String(url) === '/license-config.json'
      ? Response.json({ deployments: { [actual]: 'test-deployment-key' } })
      : Response.json(testSubscription({ domain: actual })));
    vi.stubGlobal('fetch', fetcher);
    const first = await loadCardViewDemoLicense(actual);
    const second = await loadCardViewDemoLicense(actual);
    expect(first).not.toBe(second);
    expect(first.has('card-view')).toBe(true);
    first.destroy(); second.destroy();
  });
});
