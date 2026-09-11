import { InjectionToken } from '@angular/core';
import { verifyDataTableLicense, requireDataTablePremiumFeature, type DataTableLicenseGrant } from 'wts-data-table/license';

// Public signed entitlements, not signing secrets. Renew before 2027-09-11 UTC.
// The production token allows ONLY the official HTTPS origin and card-view.
// Local preview has its own loopback-only entitlement; no hostname bypass.
export const CARD_VIEW_DEMO_TOKEN = 'eyJhbGciOiJFZERTQSIsImtpZCI6Ind0cy1kYXRhLXRhYmxlLXByb2R1Y3Rpb24tMDIiLCJ0eXAiOiJXVFMtTElDRU5TRSJ9.eyJpc3MiOiJ3dHMtZGF0YS10YWJsZS1saWNlbnNlIiwiYXVkIjoid3RzLWRhdGEtdGFibGUtdjEiLCJzdWIiOiJ3dHMtZGF0YS10YWJsZS1vZmZpY2lhbC1kZW1vIiwianRpIjoiY2FyZC12aWV3LWdpdGh1Yi1wYWdlcy0yMDI2LTA5IiwiaWF0IjoxNzg5MDg0ODAwLCJleHAiOjE4MjA2MjA4MDAsInRpZXIiOiJwcmVtaXVtIiwiZmVhdHVyZXMiOlsiY2FyZC12aWV3Il0sIm9yaWdpbnMiOlsiaHR0cHM6Ly93dHMtZGF0YS10YWJsZS5naXRodWIuaW8iXX0.Ax0-RgQMZns1Se4gmQI_mCoALMCNxvl3e8MEkLbC6rDCwwQbHLMyIZF9r2dDpt1bRu5vuD7nVwHNW-1UpSGuCQ';
const LOCAL_PREVIEW_TOKEN = 'eyJhbGciOiJFZERTQSIsImtpZCI6Ind0cy1kYXRhLXRhYmxlLXByb2R1Y3Rpb24tMDIiLCJ0eXAiOiJXVFMtTElDRU5TRSJ9.eyJpc3MiOiJ3dHMtZGF0YS10YWJsZS1saWNlbnNlIiwiYXVkIjoid3RzLWRhdGEtdGFibGUtdjEiLCJzdWIiOiJ3dHMtZGF0YS10YWJsZS1sb2NhbC1wcmV2aWV3IiwianRpIjoiY2FyZC12aWV3LWxvY2FsLXByZXZpZXctMjAyNi0wOSIsImlhdCI6MTc4OTA4NDgwMCwiZXhwIjoxODIwNjIwODAwLCJ0aWVyIjoicHJlbWl1bSIsImZlYXR1cmVzIjpbImNhcmQtdmlldyJdLCJvcmlnaW5zIjpbImh0dHA6Ly8xMjcuMC4wLjE6NDMwMCIsImh0dHA6Ly9sb2NhbGhvc3Q6NDMwMCIsImh0dHA6Ly9sb2NhbGhvc3Q6NDIwMCJdfQ.q0zYNJ2lJ1t9Op7iFOHMCjsM1xhxl-ZwAOa1PVckyCHYfSk1TS-tluHMN3ptZ0Ssi_qBjAd_XNGVJMKS29BHCA';
const localOrigins = new Set(['http://127.0.0.1:4300', 'http://localhost:4300', 'http://localhost:4200']);
const grants = new Map<string, Promise<DataTableLicenseGrant>>();

export function loadCardViewDemoLicense(origin: string): Promise<DataTableLicenseGrant> {
  const token = origin === 'https://wts-data-table.github.io'
    ? CARD_VIEW_DEMO_TOKEN : localOrigins.has(origin) ? LOCAL_PREVIEW_TOKEN : undefined;
  if (!token) return Promise.reject(new Error('Card view requires a license valid for this origin.'));
  let pending = grants.get(origin);
  if (!pending) {
    pending = verifyDataTableLicense(token).catch(error => {
      grants.delete(origin);
      throw error;
    });
    grants.set(origin, pending);
  }
  return pending.then(license => {
    requireDataTablePremiumFeature(license, 'card-view', 'Official card-view demo', origin);
    return license;
  });
}

export const CARD_VIEW_LICENSE_LOADER = new InjectionToken<
  (origin: string) => Promise<DataTableLicenseGrant>
>('Card-view demo license loader', {
  providedIn: 'root',
  factory: () => loadCardViewDemoLicense,
});
