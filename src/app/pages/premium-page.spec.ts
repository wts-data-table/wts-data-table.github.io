import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PremiumPage } from './premium-page';

describe('PremiumPage', () => {
  it('uses capability-led portal copy and descriptive example captions', async () => {
    await TestBed.configureTestingModule({ imports: [PremiumPage] }).compileComponents();
    const fixture = TestBed.createComponent(PremiumPage);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Complex data.');
    expect(text).toContain('Production workflows.');
    expect(text).toContain('Worker processing · bounded table pages');
    expect(text).toContain('Package and entitlement');
    expect(text).not.toContain('Real screenshots');
    expect(text).not.toContain('no mockup');
  });
});
