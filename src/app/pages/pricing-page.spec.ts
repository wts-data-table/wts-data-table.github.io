import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { LICENSE_REQUEST, PREMIUM_CONTACT_EMAIL } from '../site-data';
import { PricingPage } from './pricing-page';

describe('PricingPage', () => {
  it('provides the confirmed licensing email without exposing it as page text', async () => {
    await TestBed.configureTestingModule({
      imports: [PricingPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PricingPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const licenseLink = element.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');

    expect(licenseLink?.textContent).toContain('Email for a license key');
    expect(licenseLink?.getAttribute('href')).toBe(LICENSE_REQUEST);
    expect(LICENSE_REQUEST).toContain(PREMIUM_CONTACT_EMAIL);
    expect(element.textContent).not.toContain(PREMIUM_CONTACT_EMAIL);
  });
});
