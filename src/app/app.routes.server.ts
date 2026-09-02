import { PrerenderFallback, RenderMode, type ServerRoute } from '@angular/ssr';
import { DEVELOPER_GUIDES } from './developer-guides';
import { TABLE_DEMOS } from './site-data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'docs/guides/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return DEVELOPER_GUIDES.map(({ slug }) => ({ slug }));
    },
  },
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
