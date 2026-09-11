import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ExamplesPage } from './examples-page';
import { CARD_VIEW_LICENSE_LOADER } from '../card-view-demo-license';
import { verifyDataTableLicense } from 'wts-data-table/license';

describe('Card view example page', () => {
  it('links the named example and updates the preview and framework code from its view buttons', async () => {
    await TestBed.configureTestingModule({
      imports: [ExamplesPage],
      providers: [
        provideRouter([]),
        { provide: CARD_VIEW_LICENSE_LOADER, useValue: () => verifyDataTableLicense('eyJhbGciOiJFZERTQSIsImtpZCI6Ind0cy1kYXRhLXRhYmxlLXByb2R1Y3Rpb24tMDIiLCJ0eXAiOiJXVFMtTElDRU5TRSJ9.eyJpc3MiOiJ3dHMtZGF0YS10YWJsZS1saWNlbnNlIiwiYXVkIjoid3RzLWRhdGEtdGFibGUtdjEiLCJzdWIiOiJ3dHMtZGF0YS10YWJsZS1jYXJkLXZpZXctdGVzdHMiLCJqdGkiOiJjYXJkLXZpZXctdGVzdC1maXh0dXJlIiwiaWF0IjoxNzg5MDg0ODAwLCJleHAiOjQxMDI0NDQ4MDAsInRpZXIiOiJwcmVtaXVtIiwiZmVhdHVyZXMiOlsiY2FyZC12aWV3Il0sIm9yaWdpbnMiOlsiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaHR0cDovL2xvY2FsaG9zdCIsImh0dHBzOi8vZGF0YS10YWJsZS50ZXN0Il19.dFmLYWSViWZUx5rUbnHv3eme-oFdegWGUCBu6glVeteptcka2-4v6_N69_-12uZLf2V_PY_IOaO1CvH4QaPDAg') },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'card-view' })) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ExamplesPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h2')?.textContent).toBe('Card view');
    expect(element.querySelector<HTMLSelectElement>('.configurator select')?.value).toBe('8');
    expect(element.querySelector('aside a.active')?.getAttribute('href')).toBe('/examples/card-view');
    expect(element.querySelector('.code-section pre')?.textContent).toContain("mode: 'cards'");
    expect(element.querySelector('.wts-data-table-card-view')).toBeTruthy();
    const tableButton = [...element.querySelectorAll<HTMLButtonElement>('.view-controls button')]
      .find(button => button.textContent?.trim() === 'Table')!;
    tableButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(tableButton.getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelector('.code-section pre')?.textContent).toContain("mode: 'table'");
    expect(element.querySelector('.wts-data-table-card-view')).toBeNull();
    fixture.destroy();
  });
});
