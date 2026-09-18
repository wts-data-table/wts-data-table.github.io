import { InjectionToken } from '@angular/core';
import { connectDataTableLicense, requireDataTablePremiumFeature, type DataTableLicenseSession } from 'wts-data-table/license';

const allowedOrigins = new Set([
  'https://wts-data-table.github.io',
  'http://127.0.0.1:4300', 'http://localhost:4300', 'http://localhost:4200',
]);

/** Public deployment configuration, never an admin credential or offline token. */
export async function loadCardViewDemoLicense(origin: string): Promise<DataTableLicenseSession> {
  if (!allowedOrigins.has(origin)) throw new Error('No demo subscription configured for this origin.');
  const response = await fetch('/license-config.json', { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error('Demo subscription configuration is unavailable.');
  const config = await response.json();
  const licenseKey = config?.deployments?.[origin];
  if (typeof licenseKey !== 'string' || !licenseKey.trim()) throw new Error('Demo subscription has not been configured.');
  const license = await connectDataTableLicense({ licenseKey, domain: origin });
  try {
    requireDataTablePremiumFeature(license, 'card-view', 'Official card-view demo', origin);
    return license;
  } catch (error) {
    license.destroy();
    throw error;
  }
}

export const CARD_VIEW_LICENSE_LOADER = new InjectionToken<
  (origin: string) => Promise<DataTableLicenseSession>
>('Card-view demo license loader', {
  providedIn: 'root',
  factory: () => loadCardViewDemoLicense,
});
