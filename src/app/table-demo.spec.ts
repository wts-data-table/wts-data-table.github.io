import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { TABLE_DEMOS } from './site-data';
import { TableDemo } from './table-demo';
import { createDemoRuntimeOptions } from './example-config';

describe('TableDemo', () => {
  afterEach(() => document.querySelectorAll('.wts-data-table').forEach((node) => node.remove()));

  it('mounts a real package renderer for a selected example', async () => {
    await TestBed.configureTestingModule({ imports: [TableDemo] }).compileComponents();
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
    await TestBed.configureTestingModule({ imports: [TableDemo] }).compileComponents();
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
