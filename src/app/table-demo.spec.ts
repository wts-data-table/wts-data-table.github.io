import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TABLE_DEMOS } from './site-data';
import { TableDemo } from './table-demo';
import { CARD_VIEW_LICENSE_LOADER } from './card-view-demo-license';
import { testCardLicense, testSubscription } from './license-test-fixture';
const licenseProvider = { provide: CARD_VIEW_LICENSE_LOADER, useValue: () => testCardLicense() };
import { createDemoRuntimeOptions } from './example-config';

describe('TableDemo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('.wts-data-table').forEach((node) => node.remove());
  });

  it('renders real cards and preserves selection when switching layouts without remounting', async () => {
    await TestBed.configureTestingModule({ imports: [TableDemo], providers: [licenseProvider] }).compileComponents();
    const fixture = TestBed.createComponent(TableDemo);
    let options = createDemoRuntimeOptions('card-view');
    fixture.componentRef.setInput('demo', TABLE_DEMOS.find(({ id }) => id === 'card-view'));
    fixture.componentRef.setInput('runtimeOptions', options);
    fixture.componentInstance.viewModeChange.subscribe(viewMode => {
      options = { ...options, viewMode };
      fixture.componentRef.setInput('runtimeOptions', options);
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const root = element.querySelector<HTMLElement>('.wts-data-table')!;
    expect(root.dataset['wtsView']).toBe('cards');
    expect(root.querySelectorAll('.wts-data-table-card-view__card')).toHaveLength(8);
    expect(root.querySelector('.wts-data-table-card-view')?.textContent).toContain('Partner portal');
    expect(root.querySelector('.wts-data-table-card-view')?.textContent).toContain('Cobalt Inc.');
    root.querySelector<HTMLInputElement>('.wts-data-table-card-view__selection')!.click();
    await fixture.whenStable();
    expect(element.querySelector('.demo-readout')?.textContent).toContain('1 selected');

    const buttons = [...element.querySelectorAll<HTMLButtonElement>('.view-controls button')];
    buttons.find(button => button.textContent?.trim() === 'Table')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('.wts-data-table')).toBe(root);
    expect(root.dataset['wtsView']).toBe('table');
    expect(root.querySelector('.wts-data-table-card-view')).toBeNull();
    expect(root.querySelector('.wts-data-table__viewport')?.hasAttribute('hidden')).toBe(false);
    expect(element.querySelector('.demo-readout')?.textContent).toContain('1 selected');

    buttons.find(button => button.textContent?.trim() === 'Cards')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector<HTMLInputElement>('.wts-data-table-card-view__selection')?.checked).toBe(true);
    expect(root.querySelectorAll('.wts-data-table-card-view')).toHaveLength(1);
    fixture.destroy();
    expect(root.querySelector('.wts-data-table-card-view')).toBeNull();
  });

  it('uses container width for Auto view and responds to resize', async () => {
    let width = 600;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0, y: 0, top: 0, left: 0, width, right: width,
      height: 400, bottom: 400, toJSON: () => ({})
    }));
    await TestBed.configureTestingModule({ imports: [TableDemo], providers: [licenseProvider] }).compileComponents();
    const fixture = TestBed.createComponent(TableDemo);
    fixture.componentRef.setInput('demo', TABLE_DEMOS.find(({ id }) => id === 'card-view'));
    fixture.componentRef.setInput('runtimeOptions', { ...createDemoRuntimeOptions('card-view'), viewMode: 'auto' });
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('.wts-data-table') as HTMLElement;
    expect(root.dataset['wtsView']).toBe('cards');
    width = 1000;
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();
    await vi.waitFor(() => expect(root.dataset['wtsView']).toBe('table'));
    fixture.destroy();
  });

  it('keeps filtering and pagination synchronized between cards and the table', async () => {
    await TestBed.configureTestingModule({ imports: [TableDemo], providers: [licenseProvider] }).compileComponents();
    const fixture = TestBed.createComponent(TableDemo);
    const options = createDemoRuntimeOptions('card-view');
    fixture.componentRef.setInput('demo', TABLE_DEMOS.find(({ id }) => id === 'card-view'));
    fixture.componentRef.setInput('runtimeOptions', options);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('.wts-data-table') as HTMLElement;
    root.querySelector<HTMLButtonElement>('button[aria-label="Next page"]')!.click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(root.querySelectorAll('.wts-data-table-card-view__card')).toHaveLength(6));
    const pageIds = [...root.querySelectorAll<HTMLElement>('.wts-data-table-card-view__card')].map(card => card.dataset['wtsRowId']);
    fixture.componentRef.setInput('runtimeOptions', { ...options, viewMode: 'table' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentRef.setInput('runtimeOptions', options);
    fixture.detectChanges();
    await fixture.whenStable();
    expect([...root.querySelectorAll<HTMLElement>('.wts-data-table-card-view__card')].map(card => card.dataset['wtsRowId'])).toEqual(pageIds);

    const search = root.querySelector<HTMLInputElement>('.wts-data-table__search')!;
    search.value = 'Partner portal';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await vi.waitFor(() => expect(root.querySelectorAll('.wts-data-table-card-view__card')).toHaveLength(1));
    expect(root.querySelector('.wts-data-table-card-view')?.textContent).toContain('Partner portal');
    fixture.componentRef.setInput('runtimeOptions', { ...options, viewMode: 'table' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector<HTMLInputElement>('.wts-data-table__search')?.value).toBe('Partner portal');
    expect(root.querySelector('tbody')?.textContent).toContain('Partner portal');
    expect(root.querySelector('tbody')?.textContent).not.toContain('Identity refresh');
    fixture.destroy();
  });

  it('keeps the standard table available when license verification fails', async () => {
    await TestBed.configureTestingModule({
      imports: [TableDemo],
      providers: [{ provide: CARD_VIEW_LICENSE_LOADER, useValue: () => Promise.reject(new Error('Wrong origin')) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(TableDemo);
    fixture.componentRef.setInput('demo', TABLE_DEMOS.find(demo => demo.id === 'card-view'));
    fixture.componentRef.setInput('runtimeOptions', createDemoRuntimeOptions('card-view'));
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.wts-data-table-card-view')).toBeNull();
    expect(root.querySelector('.wts-data-table__viewport')?.hasAttribute('hidden')).toBe(false);
    expect(root.textContent).toContain('Standard table view remains available');
    expect([...root.querySelectorAll<HTMLButtonElement>('.view-controls button')].find(button => button.textContent?.trim() === 'Cards')?.disabled).toBe(true);
    fixture.destroy();
  });

  it('restores cards after renewal without replacing the standard table or selection', async () => {
    let denied = false;
    const session = await testCardLicense(async () => Response.json(
      denied ? { valid: false, status: 'SUBSCRIPTION_EXPIRED' } : testSubscription(),
      { status: denied ? 403 : 200 },
    ));
    await TestBed.configureTestingModule({
      imports: [TableDemo], providers: [{ provide: CARD_VIEW_LICENSE_LOADER, useValue: () => Promise.resolve(session) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(TableDemo);
    fixture.componentRef.setInput('demo', TABLE_DEMOS.find(demo => demo.id === 'card-view'));
    fixture.componentRef.setInput('runtimeOptions', createDemoRuntimeOptions('card-view'));
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const root = element.querySelector('.wts-data-table');
    element.querySelector<HTMLInputElement>('.wts-data-table-card-view__selection')!.click();
    denied = true;
    await expect(session.refresh()).rejects.toMatchObject({ reason: 'expired' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('.wts-data-table-card-view')).toBeNull();
    expect(element.querySelector('.wts-data-table')).toBe(root);
    expect(element.textContent).toContain('Standard table view remains available');
    denied = false;
    [...element.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent?.includes('Retry license verification'))!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('.wts-data-table')).toBe(root);
    expect(element.querySelector<HTMLInputElement>('.wts-data-table-card-view__selection')?.checked).toBe(true);
    fixture.destroy();
    expect(session.status.state).toBe('destroyed');
  });

  it('does not attach a card controller if destroyed during verification', async () => {
    const license = await testCardLicense();
    let resolve!: (value: typeof license) => void;
    const pending = new Promise<typeof license>(done => { resolve = done; });
    await TestBed.configureTestingModule({
      imports: [TableDemo],
      providers: [{ provide: CARD_VIEW_LICENSE_LOADER, useValue: () => pending }],
    }).compileComponents();
    const fixture = TestBed.createComponent(TableDemo);
    fixture.componentRef.setInput('demo', TABLE_DEMOS.find(demo => demo.id === 'card-view'));
    fixture.componentRef.setInput('runtimeOptions', createDemoRuntimeOptions('card-view'));
    fixture.detectChanges();
    fixture.destroy();
    resolve(license);
    await pending;
    await Promise.resolve();
    expect(fixture.nativeElement.querySelector('.wts-data-table-card-view')).toBeNull();
  });

  it('mounts a real package renderer for a selected example', async () => {
    await TestBed.configureTestingModule({ imports: [TableDemo], providers: [licenseProvider] }).compileComponents();
    const fixture = TestBed.createComponent(TableDemo);
    fixture.componentRef.setInput('demo', TABLE_DEMOS[0]);
    fixture.componentRef.setInput('runtimeOptions', createDemoRuntimeOptions('portfolio'));
    fixture.detectChanges();
    await fixture.whenStable();

    const table = fixture.nativeElement.querySelector('.wts-data-table__table') as HTMLTableElement;
    expect(table).toBeTruthy();
    expect(table.caption?.textContent).toContain('Complete portfolio table');
    expect(table.querySelector('tbody')?.textContent).toContain('Partner portal');
  });

  it('remounts the renderer when a live option changes', async () => {
    await TestBed.configureTestingModule({ imports: [TableDemo], providers: [licenseProvider] }).compileComponents();
    const fixture = TestBed.createComponent(TableDemo);
    fixture.componentRef.setInput('demo', TABLE_DEMOS[0]);
    fixture.componentRef.setInput('runtimeOptions', createDemoRuntimeOptions('portfolio'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.wts-data-table__search')).toBeTruthy();

    fixture.componentRef.setInput('runtimeOptions', { ...createDemoRuntimeOptions('portfolio'), globalFilter: false });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.wts-data-table__search')).toBeFalsy();
  });
});
