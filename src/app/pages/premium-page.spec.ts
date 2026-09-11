import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PremiumPage } from './premium-page';
import { provideRouter } from '@angular/router';
import { LICENSE_REQUEST, PREMIUM_CONTACT_EMAIL } from '../site-data';

describe('PremiumPage', () => {
  it('demonstrates every licensed capability group with code and a product image', async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PremiumPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent ?? '';

    expect(text).toContain('Every shipped feature.');
    expect(text).toContain('11 / 11');
    for (const capability of [
      'Card view',
      'Advanced row model',
      'Indexed search',
      'Background export',
      'Worker processing',
      'Live data',
      'Server analytics',
      'Spreadsheet formulas',
      'Collaborative editing',
      'Governed editing',
      'Report designer',
    ]) {
      expect(text).toContain(capability);
    }
    expect(element.querySelectorAll('.premium-list > article')).toHaveLength(11);
    expect(element.querySelectorAll('.premium-list img')).toHaveLength(10);
    expect(element.querySelectorAll('.code-block')).toHaveLength(11);
    expect(element.querySelectorAll('.runtime-options')).toHaveLength(11);
    expect(text).toContain('One package, explicit entitlement');
    const licenseLink = element.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
    expect(licenseLink?.textContent).toContain('Email for a license key');
    expect(licenseLink?.getAttribute('href')).toBe(LICENSE_REQUEST);
    expect(LICENSE_REQUEST).toBe(
      'mailto:' +
        PREMIUM_CONTACT_EMAIL +
        '?subject=WTS%20Data%20Table%20premium%20license%20request',
    );
    expect(text).not.toContain(PREMIUM_CONTACT_EMAIL);
  });
});
