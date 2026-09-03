import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ExamplesPage } from './examples-page';

describe('Card view example page', () => {
  it('links the named example and updates the preview and framework code from its view buttons', async () => {
    await TestBed.configureTestingModule({
      imports: [ExamplesPage],
      providers: [
        provideRouter([]),
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
