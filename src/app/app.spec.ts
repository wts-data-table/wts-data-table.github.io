import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('App shell', () => {
  it('renders product navigation and footer links', async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('WTS Data Table');
    expect(text).toContain('Examples');
    expect(text).toContain('Documentation');
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
    const tracker = fixture.nativeElement.querySelector('footer a[href="https://github.com/wts-data-table/wts-data-table.github.io/issues"]') as HTMLAnchorElement;
    expect(tracker?.textContent).toContain('Issue tracker');
    expect(tracker?.rel).toContain('noreferrer');
  });
});
