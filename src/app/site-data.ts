export interface TableDemoDefinition {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly highlights: readonly string[];
}

// Keep licensing contact in one place so every commercial CTA follows the same flow.
export const PREMIUM_CONTACT_EMAIL = 'suman.mandal@webskitters.com';
export const LICENSE_REQUEST = PREMIUM_CONTACT_EMAIL
  ? 'mailto:' + PREMIUM_CONTACT_EMAIL + '?subject=WTS%20Data%20Table%20premium%20license%20request'
  : '';

export const TABLE_DEMOS: readonly TableDemoDefinition[] = [
  {
    id: 'portfolio',
    title: 'Complete portfolio table',
    eyebrow: 'Start here',
    description:
      'A production-style view combining search, filters, selection, responsive details, pagination, and summaries.',
    highlights: [
      'Global and column filters',
      'Responsive row details',
      'Pagination and summary rows',
    ],
  },
  {
    id: 'card-view',
    title: 'Card view',
    eyebrow: 'Licensed layout',
    description:
      'A licensed responsive card layout, enabled here with an origin-bound demo key. Explore projects as responsive cards. Switch between Table, Cards, and Auto without losing search, pagination, or row selection. Auto uses cards when the table container is 720px wide or smaller.',
    highlights: ['Table / Cards / Auto', 'Shared search and selection', 'Responsive card grid'],
  },
  {
    id: 'selection',
    title: 'Selection and bulk work',
    eyebrow: 'Workflow',
    description:
      'Select individual projects or the filtered result set and respond to state changes from your application.',
    highlights: ['Multiple row selection', 'Bulk action toolbar', 'Stable application row IDs'],
  },
  {
    id: 'filtering',
    title: 'Search and column filters',
    eyebrow: 'Find anything',
    description:
      'Combine quick global search with type-aware filters and collapsible column controls.',
    highlights: ['Global search', 'Select and number filters', 'Clear, inspectable state'],
  },
  {
    id: 'grouping',
    title: 'Grouping and totals',
    eyebrow: 'Understand the data',
    description:
      'Group rows by status and keep aggregate budget totals visible as the view changes.',
    highlights: ['Interactive group controls', 'Expandable groups', 'Filtered aggregate totals'],
  },
  {
    id: 'responsive',
    title: 'Responsive details',
    eyebrow: 'Every viewport',
    description:
      'Keep priority fields visible and move supporting fields into accessible inline details when space gets tight.',
    highlights: [
      'Priority-based columns',
      'Inline detail disclosure',
      'Keyboard-accessible controls',
    ],
  },
  {
    id: 'editing',
    title: 'Inline editing',
    eyebrow: 'Update in context',
    description:
      'Double-click editable cells, validate changes, and connect commits to your own persistence layer.',
    highlights: ['Keyboard edit flow', 'Optimistic commit hook', 'Dirty-cell tracking'],
  },
];

export const FEATURE_GROUPS = [
  {
    label: 'Explore',
    title: 'Find the signal',
    items: [
      'Global search',
      'Column filters',
      'Advanced filter builder',
      'Faceted search panes',
      'Multi-column sorting',
      'Grouping and aggregation',
    ],
  },
  {
    label: 'Operate',
    title: 'Act on the data',
    items: [
      'Row and cell selection',
      'Bulk actions',
      'Inline editing',
      'Column resizing and pinning',
      'Row pinning and ordering',
      'Clipboard and export buttons',
    ],
  },
  {
    label: 'Scale',
    title: 'Stay fast and adaptable',
    items: [
      'Virtualized rendering',
      'Server-driven data',
      'Responsive details',
      'Sticky headers and totals',
      'Framework wrappers',
      'Theme adapters and CSS variables',
    ],
  },
] as const;
