import { DOCUMENT, Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEVELOPER_GUIDES } from '../developer-guides';
import { DocCode } from '../doc-code';
import { DOC_SECTIONS, DocsNavigation, featureId } from '../docs-navigation';
import { DocsSidebar } from '../docs-sidebar';
import { DocsReadingPosition } from '../docs-reading-position';
import {
  FRAMEWORKS,
  FRAMEWORK_NOTES,
  INSTALL_COMMANDS,
  SNIPPETS,
  STARTER_FILES,
  TABLE_DATA,
  type Framework,
} from '../docs-quickstart';
import {
  ADVANCED_FEATURES,
  BASE_RENDERER_EXAMPLE,
  FEATURE_GROUPS,
  LICENSE_EXAMPLE,
  RENDERERS,
  STARTER_CONFIG,
  STATE_EXAMPLE,
} from '../documentation-content';

const DEMO_FEATURES: Record<string, string> = {
  Sorting: 'filtering',
  'Global search': 'filtering',
  'Column filters': 'filtering',
  'Advanced filters': 'filtering',
  SearchPanes: 'filtering',
  Grouping: 'grouping',
  Aggregates: 'grouping',
  'Row selection': 'selection',
  'Bulk actions': 'selection',
  'Cell and range selection': 'selection',
  'Inline editing': 'editing',
  'AutoFill and paste': 'editing',
  'Tree and detail rows': 'portfolio',
  'Ordering and pinning': 'portfolio',
  'Column layout': 'portfolio',
  'Card view': 'card-view',
  'Responsive details': 'responsive',
  'Sticky sections': 'portfolio',
  'Grouped and temporal columns': 'portfolio',
  Buttons: 'portfolio',
  'Adaptive pagination': 'portfolio',
  Accessibility: 'portfolio',
};
const GUIDE_FEATURES: Record<string, string> = {
  'Themes and tokens': 'themes',
  'Localization and RTL': 'internationalization',
  'Database adapters': 'database-adapters',
  'Feature plug-ins': 'plugins',
  'Custom content': 'framework-wrappers',
  'Web Component': 'framework-wrappers',
  Virtualization: 'bundle-size',
};

@Component({
  imports: [RouterLink, DocCode, DocsNavigation, DocsSidebar],
  providers: [DocsReadingPosition],
  templateUrl: './docs-page.html',
  styleUrl: './docs-page.scss',
})
export class DocsPage {
  protected readonly reading = inject(DocsReadingPosition);
  protected readonly frameworks = FRAMEWORKS;
  protected readonly snippets = SNIPPETS;
  protected readonly installs = INSTALL_COMMANDS;
  protected readonly frameworkNotes = FRAMEWORK_NOTES;
  protected readonly framework = signal<Framework>('Angular');
  protected readonly starterFiles = STARTER_FILES;
  protected readonly tableData = TABLE_DATA;
  protected readonly hostCode = '<div id="project-table"></div>';
  protected readonly stylesCode = "@import 'wts-data-table/styles.css';";
  protected readonly renderers = RENDERERS;
  protected readonly advancedFeatures = ADVANCED_FEATURES;
  protected readonly baseRendererExample = BASE_RENDERER_EXAMPLE;
  protected readonly starterConfig = STARTER_CONFIG;
  protected readonly stateExample = STATE_EXAMPLE;
  protected readonly licenseExample = LICENSE_EXAMPLE;
  protected readonly developerGuides = DEVELOPER_GUIDES;
  protected readonly sections = DOC_SECTIONS;
  protected readonly featureId = featureId;
  protected readonly featureQuery = signal('');
  protected readonly filteredGroups = computed(() => {
    const terms = this.featureQuery().trim().toLowerCase().split(/\s+/);
    return FEATURE_GROUPS.map((group) => ({
      ...group,
      features: group.features.filter((feature) =>
        terms.every((term) =>
          [feature.name, feature.api, feature.use].join(' ').toLowerCase().includes(term),
        ),
      ),
    })).filter((group) => group.features.length);
  });
  protected readonly featureCount = computed(() =>
    this.filteredGroups().reduce((total, group) => total + group.features.length, 0),
  );
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const match = FRAMEWORKS.find(
        (item) => item.toLowerCase() === params.get('framework')?.toLowerCase(),
      );
      if (match) this.framework.set(match);
    });
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => {
      if (fragment?.startsWith('feature-')) this.featureQuery.set('');
    });
  }

  protected sidebarNavigate(): void {
    this.featureQuery.set('');
  }

  protected selectFramework(framework: Framework): void {
    this.framework.set(framework);
    const url = this.router.parseUrl(this.location.path(true) || '/docs');
    url.queryParams = { ...url.queryParams, framework: framework.toLowerCase() };
    this.location.replaceState(this.router.serializeUrl(url));
  }

  protected frameworkKey(event: KeyboardEvent, current: Framework): void {
    const index = FRAMEWORKS.indexOf(current);
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % FRAMEWORKS.length
        : event.key === 'ArrowLeft'
          ? (index + FRAMEWORKS.length - 1) % FRAMEWORKS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? FRAMEWORKS.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    this.selectFramework(FRAMEWORKS[next]);
    this.document.getElementById('framework-' + FRAMEWORKS[next])?.focus();
  }

  protected featureLink(name: string): { route: string; label: string; fragment?: string } {
    if (DEMO_FEATURES[name])
      return { route: '/examples/' + DEMO_FEATURES[name], label: 'Live example' };
    if (GUIDE_FEATURES[name])
      return { route: '/docs/guides/' + GUIDE_FEATURES[name], label: 'Read guide' };
    if (/server|data source|Cursor|Transactions|Remote/.test(name))
      return { route: '/docs/guides/server-integration', label: 'Read guide' };
    return { route: '/docs', fragment: featureId(name), label: 'Section link' };
  }

  protected advancedDemo(entitlement: string): string {
    return entitlement === 'advanced-row-model'
      ? 'remote-viewport'
      : entitlement === 'spreadsheet-formulas'
        ? 'formula-editor'
        : entitlement;
  }
}
