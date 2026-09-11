import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEVELOPER_GUIDES } from './developer-guides';
import { ADVANCED_FEATURES, FEATURE_GROUPS } from './documentation-content';

export const DOC_SECTIONS = [
  { id: 'install', title: 'Installation' },
  { id: 'integrate', title: 'Framework quick start' },
  { id: 'renderers', title: 'Choose a renderer' },
  { id: 'features', title: 'Feature guide' },
  { id: 'configure', title: 'Table configuration' },
  { id: 'lifecycle', title: 'State & lifecycle' },
  { id: 'advanced', title: 'Licensed features' },
  { id: 'reference', title: 'Developer guides' },
];

export function featureId(name: string): string {
  return (
    'feature-' +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-$/, '')
  );
}

const SEARCH_ENTRIES = [
  ...DOC_SECTIONS.map((s) => ({
    title: s.title,
    detail: 'Getting started',
    route: '/docs',
    fragment: s.id,
    text: s.title,
  })),
  ...FEATURE_GROUPS.flatMap((g) =>
    g.features.map((f) => ({
      title: f.name,
      detail: f.api,
      route: '/docs',
      fragment: featureId(f.name),
      text: [f.name, f.api, f.use, g.title].join(' '),
    })),
  ),
  ...ADVANCED_FEATURES.map((f) => ({
    title: f.name,
    detail: 'Licensed feature',
    route: '/docs',
    fragment: featureId(f.name),
    text: [f.name, f.import, f.entitlement, f.use].join(' '),
  })),
  ...DEVELOPER_GUIDES.map((g) => ({
    title: g.title,
    detail: 'Developer guide',
    route: '/docs/guides/' + g.slug,
    fragment: undefined,
    text: [
      g.title,
      g.summary,
      g.intro,
      g.code,
      ...g.sections.map((s) => s.title + ' ' + s.body),
    ].join(' '),
  })),
];

@Component({
  selector: 'app-docs-navigation',
  host: { '(click)': 'navigationClick($event)' },
  imports: [RouterLink],
  template: `
    <aside aria-label="Documentation navigation">
      <div class="nav-heading">
        <a
          routerLink="/docs"
          [queryParams]="framework() ? { framework: framework().toLowerCase() } : {}"
          >Documentation</a
        ><span>v1</span>
      </div>
      <label class="search-label" for="docs-search">Find an option or guide</label>
      <div class="search-field">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          id="docs-search"
          type="search"
          autocomplete="off"
          placeholder="Search documentation…"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          (keydown.escape)="query.set('')"
          aria-controls="doc-search-results"
        />
      </div>
      @if (query().trim()) {
        <div id="doc-search-results" class="search-results">
          <p role="status">
            {{ results().length }} {{ results().length === 1 ? 'result' : 'results' }}
          </p>
          @for (result of results(); track result.route + result.fragment + result.title) {
            <a
              [routerLink]="result.route"
              [queryParams]="framework() ? { framework: framework().toLowerCase() } : {}"
              [fragment]="result.fragment"
              (click)="query.set('')"
              ><strong>{{ result.title }}</strong
              ><small>{{ result.detail }}</small></a
            >
          } @empty {
            <div class="empty">No matching documentation. Try “selection”, “server” or “CSS”.</div>
          }
        </div>
      } @else {
        <details class="nav-sections" open>
          <summary>Getting started</summary>
          <nav aria-label="Getting started">
            @for (section of sections; track section.id) {
              <a
                routerLink="/docs"
                [queryParams]="framework() ? { framework: framework().toLowerCase() } : {}"
                [fragment]="section.id"
                [class.active]="!guideSlug() && activeSection() === section.id"
                [attr.aria-current]="
                  !guideSlug() && activeSection() === section.id ? 'location' : null
                "
                >{{ section.title }}</a
              >
            }
          </nav>
        </details>
        <details class="nav-sections" open>
          <summary>Developer guides</summary>
          <nav aria-label="Developer guides">
            @for (guide of guides; track guide.slug) {
              <a
                [routerLink]="['/docs/guides', guide.slug]"
                [class.active]="guideSlug() === guide.slug"
                [attr.aria-current]="guideSlug() === guide.slug ? 'page' : null"
                >{{ guide.title }}</a
              >
            }
          </nav>
        </details>
        <a class="examples-link" routerLink="/examples/portfolio"
          ><span>Try the live playground</span><span aria-hidden="true">↗</span></a
        >
      }
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        position: sticky;
        top: 96px;
        max-height: calc(100vh - 116px);
        overflow: auto;
        scrollbar-width: thin;
      }
      aside {
        padding-right: 1rem;
      }
      .nav-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 0 1.4rem;
      }
      .nav-heading a {
        color: var(--ink);
        font-size: 0.9rem;
        font-weight: 750;
        text-decoration: none;
      }
      .nav-heading span {
        padding: 0.2rem 0.4rem;
        border: 1px solid var(--line);
        border-radius: 5px;
        color: var(--muted);
        font: 0.65rem var(--mono);
      }
      .search-label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.72rem;
        color: var(--muted);
      }
      .search-field {
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-field svg {
        position: absolute;
        left: 0.7rem;
        width: 15px;
        height: 15px;
        color: var(--muted);
        pointer-events: none;
      }
      input {
        width: 100%;
        min-width: 0;
        height: 40px;
        padding: 0.65rem 0.4rem 0.65rem 2rem;
        border: 1px solid var(--line-dark);
        border-radius: 7px;
        background: white;
        color: var(--ink);
        font-size: 0.75rem;
      }
      input::placeholder {
        color: var(--muted);
      }
      .nav-sections {
        margin-top: 1.5rem;
      }
      summary {
        padding: 0.3rem 0;
        cursor: pointer;
        font-size: 0.68rem;
        font-weight: 750;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ink);
      }
      nav {
        display: grid;
        gap: 2px;
        margin-top: 0.55rem;
      }
      nav a {
        border-left: 2px solid transparent;
        border-radius: 0 6px 6px 0;
        padding: 0.52rem 0.7rem;
        color: var(--muted);
        font-size: 0.77rem;
        line-height: 1.45;
        text-decoration: none;
      }
      nav a:hover {
        color: var(--ink);
        background: #edf1f7;
      }
      nav a.active {
        border-left-color: var(--blue);
        color: var(--blue);
        background: var(--blue-soft);
        font-weight: 650;
      }
      .examples-link {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1.6rem;
        padding: 0.85rem 0.7rem;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: white;
        color: var(--blue);
        font-size: 0.74rem;
        font-weight: 600;
        text-decoration: none;
      }
      .search-results > p {
        color: var(--muted);
        font-size: 0.72rem;
      }
      .search-results > a {
        display: grid;
        gap: 0.3rem;
        padding: 0.8rem 0.5rem;
        border-bottom: 1px solid var(--line);
        text-decoration: none;
      }
      .search-results strong {
        font-size: 0.79rem;
        color: var(--ink);
      }
      .search-results small {
        font: 0.66rem/1.5 var(--mono);
        color: var(--muted);
        overflow-wrap: anywhere;
      }
      .search-results > a:hover {
        background: var(--blue-soft);
      }
      .empty {
        padding: 1rem 0.25rem;
        color: var(--muted);
        font-size: 0.8rem;
        line-height: 1.65;
      }
      @media (max-width: 850px) {
        :host {
          position: static;
          max-height: none;
        }
        aside {
          padding: 0;
        }
        .nav-heading {
          margin-bottom: 0.8rem;
        }
        .nav-sections {
          margin-top: 1rem;
        }
        nav {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .examples-link {
          margin-top: 1rem;
        }
        .search-results {
          max-height: 330px;
          overflow: auto;
        }
      }
    `,
  ],
})
export class DocsNavigation {
  readonly framework = input('');
  readonly navigated = output<void>();
  protected navigationClick(event: MouseEvent): void {
    if ((event.target as Element)?.closest('a')) this.navigated.emit();
  }
  readonly guideSlug = input('');
  readonly activeSection = input('install');
  protected readonly query = signal('');
  protected readonly sections = DOC_SECTIONS;
  protected readonly guides = DEVELOPER_GUIDES;
  protected readonly results = computed(() => {
    const terms = this.query().trim().toLowerCase().split(/\s+/);
    return SEARCH_ENTRIES.filter((entry) =>
      terms.every((term) => entry.text.toLowerCase().includes(term)),
    );
  });
}
