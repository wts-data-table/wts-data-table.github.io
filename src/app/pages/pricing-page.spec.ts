import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { PricingPage, PRICING_CAPABILITIES } from './pricing-page';

describe('PricingPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [PricingPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PricingPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('compares Standard and all 11 licensed Premium capability groups', async () => {
    const element = await render();
    expect(element.querySelector('h1')?.textContent).toBe('Pricing & licensing');
    expect(element.querySelectorAll('.plan')).toHaveLength(2);
    expect(element.querySelectorAll('tbody tr[data-tier="premium"]')).toHaveLength(11);
    expect(element.querySelectorAll('tbody tr[data-tier="standard"]')).toHaveLength(8);
    for (const capability of PRICING_CAPABILITIES.filter((item) => item.premium)) {
      const link = element.querySelector<HTMLAnchorElement>(
        'a[href="/premium#' + capability.fragment + '"]',
      );
      expect(link?.textContent).toContain(capability.name);
    }
    expect(element.textContent).toContain('Contact for pricing');
    expect(element.textContent).toContain('All 11 Premium capability groups are included');
    expect(element.textContent).toContain('The package defines the features');
    expect(element.querySelectorAll('a[href="/docs/guides/advanced-features"]')).toHaveLength(2);
    expect(element.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it('explains renewal, expiry, online verification, and inquiry-only commercial terms', async () => {
    const element = await render();
    const content = element.textContent ?? '';
    expect(element.querySelectorAll('#questions details')).toHaveLength(8);
    for (const wording of [
      'not a perpetual Premium license',
      'Standard features are unaffected',
      'requires online verification',
      'not a purchase or a guaranteed trial',
      'Final commercial terms must be approved before sale',
      'Previously published MIT releases retain their original terms',
      'Monthly or yearly subscription',
      'choose monthly or yearly billing',
      'rather than a one-time purchase of a package version',
      'Premium access is subscription-based, not tied to a package release',
    ])
      expect(content.replace(/\s+/g, ' ')).toContain(wording);
    expect(content).not.toContain('one-year subscription request');
    for (const link of element.querySelectorAll<HTMLAnchorElement>('.pricing-jumps a')) {
      expect(new URL(link.href).pathname).toBe('/pricing');
      expect(element.querySelector(link.hash)).not.toBeNull();
    }
  });
});
