import { DOCUMENT, ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { SiteTitleStrategy } from './seo.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => {
      const document = inject(DOCUMENT);
      inject(ViewportScroller).setOffset(() => [
        0,
        document.querySelector('.docs-sidebar') &&
        document.defaultView?.matchMedia?.('(max-width: 850px)')?.matches
          ? 150
          : 100,
      ]);
    }),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    { provide: TitleStrategy, useClass: SiteTitleStrategy },
  ],
};
