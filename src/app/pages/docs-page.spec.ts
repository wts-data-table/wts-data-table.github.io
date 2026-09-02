import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DocsPage } from './docs-page';

describe('DocsPage', () => {
  it('links every sidebar item to its section on the docs route', async () => {
    await TestBed.configureTestingModule({ imports: [DocsPage], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(DocsPage);
    fixture.detectChanges();
    await fixture.whenStable();

    const links = [...fixture.nativeElement.querySelectorAll('aside a')] as HTMLAnchorElement[];
    expect(links.map(({ pathname, hash }) => `${pathname}${hash}`)).toEqual([
      '/docs#install',
      '/docs#integrate',
      '/docs#lifecycle',
      '/docs#reference',
    ]);
  });
});
