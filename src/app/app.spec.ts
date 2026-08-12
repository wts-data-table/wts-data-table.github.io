import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  afterEach(() => document.querySelectorAll('.wts-data-table').forEach((node) => node.remove()));

  it('mounts the published data-table renderer', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const table = fixture.nativeElement.querySelector('.wts-data-table__table') as HTMLTableElement;
    expect(table).toBeTruthy();
    expect(table.caption?.textContent).toContain('Active delivery portfolio');
    expect(table.querySelector('tbody')?.textContent).toContain('Partner portal');
  });

  it('filters rows through Angular-owned quick controls', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const buttons = [
      ...fixture.nativeElement.querySelectorAll('.quick-filters button'),
    ] as HTMLButtonElement[];
    buttons.find((button) => button.textContent?.trim() === 'At risk')?.click();
    fixture.detectChanges();

    const body = fixture.nativeElement.querySelector('.wts-data-table__table tbody') as HTMLElement;
    expect(body.textContent).toContain('Member onboarding');
    expect(body.textContent).not.toContain('Atlas mobile refresh');
    expect(fixture.nativeElement.querySelector('.state-readout')?.textContent).toContain(
      'Column Filter',
    );
  });

  it('sorts through the package column header interaction', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const projectHeader = [...fixture.nativeElement.querySelectorAll('th')].find(
      (header: Element) => header.textContent?.includes('Project'),
    ) as HTMLElement;
    const sortButton = projectHeader.querySelector('button') as HTMLButtonElement;
    sortButton.click();
    fixture.detectChanges();

    const updatedProjectHeader = [
      ...fixture.nativeElement.querySelectorAll('th'),
    ].find((header: Element) => header.textContent?.includes('Project')) as HTMLElement;

    expect(updatedProjectHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(fixture.nativeElement.querySelector('.state-readout')?.textContent).toContain('Sorting');
  });
});
