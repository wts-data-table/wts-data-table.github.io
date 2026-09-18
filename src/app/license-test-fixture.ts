import { afterEach } from 'vitest';
import { connectDataTableLicense, type DataTableLicenseSession } from 'wts-data-table/license';
import { DATA_TABLE_PACKAGE_VERSION } from 'wts-data-table/plugin';
const sessions: DataTableLicenseSession[] = [];
afterEach(() => sessions.splice(0).forEach(session => session.destroy()));
export function testSubscription(overrides: Record<string, unknown> = {}) {
  const now = Date.now();
  return {
    valid: true, status: 'ACTIVE', licenseModel: 'SUBSCRIPTION', versionAllowed: true,
    tier: 'premium', domain: window.location.origin, features: ['card-view'],
    package: { npmName: 'wts-data-table', version: DATA_TABLE_PACKAGE_VERSION, premiumEnabled: true },
    verifiedAt: new Date(now).toISOString(), refreshAfter: new Date(now + 60_000).toISOString(),
    leaseExpiresAt: new Date(now + 300_000).toISOString(), subscriptionEndsAt: new Date(now + 86_400_000).toISOString(),
    ...overrides,
  };
}
export async function testCardLicense(fetcher: typeof fetch = async () => Response.json(testSubscription())) {
  const session = await connectDataTableLicense({ licenseKey: 'unit-test-only-key', fetch: fetcher });
  sessions.push(session);
  return session;
}
