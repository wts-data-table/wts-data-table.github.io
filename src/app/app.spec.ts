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
  });
});
