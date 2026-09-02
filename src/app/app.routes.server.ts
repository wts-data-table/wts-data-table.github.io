import { PrerenderFallback, RenderMode, type ServerRoute } from '@angular/ssr';
import { TABLE_DEMOS } from './site-data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'examples/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return TABLE_DEMOS.map(({ id }) => ({ id }));
    },
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
