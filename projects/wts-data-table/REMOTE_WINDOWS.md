# External row windows

These APIs are included in `wts-data-table` 1.0.2 and later.

The complete `wts-data-table` renderer can display a bounded, externally owned
window inside a larger remote result. It keeps the existing table renderer,
column controls, custom cells, selection, themes, summaries, and actions. It does
not allocate a placeholder record for every unloaded row.

These are public, free APIs. No additional package is required. Your application
owns fetching, caching, cancellation, query execution, and the global display
order. Use `wts-data-table` or its `wts-data-table/complete` alias for the DOM
methods described here; the modular/base and lite renderers do not expose these
same DOM window methods.

Load `wts-data-table/styles.css`. Remote windows require its fixed-height content
clipping rules as well as a fixed-height `virtualization` configuration.

## Window contract

The following shapes are exported from `wts-data-table`; import the types rather
than redeclaring them in application code.

```ts
interface DataTableRowWindow<T> {
  readonly rows: readonly DataTableDisplayRow<T>[];
  readonly startIndex: number;
  readonly virtualRowCount: number;
  readonly totalRowCount?: number;
  readonly scrollBaseIndex?: number;
  readonly scrollRowCount?: number;
}

interface DataTableViewportRange {
  readonly startIndex: number;
  readonly endIndex: number;
}
```

| Field | Meaning |
| --- | --- |
| `rows` | Only loaded display slots, in contiguous global display order. A slot is a data row or group header. |
| `startIndex` | Global, zero-based index of the first supplied slot. |
| `virtualRowCount` | Current navigable global extent, including any provisional tail. It is not an allocation size. |
| `totalRowCount` | Exact global display-slot count, when known. If supplied, it must equal `virtualRowCount`. |
| `scrollBaseIndex` | Global start of the physical scrollbar segment; defaults to `0`. |
| `scrollRowCount` | Slots represented by that physical segment; defaults to `virtualRowCount - scrollBaseIndex`. |

Indexes and counts must be nonnegative safe integers. The loaded window and
physical segment must each fit within the global extent. Empty loaded windows
are valid, including while a request is pending. The loaded window need not
overlap the current viewport; unloaded space keeps its scroll geometry.

Each data slot supplies an existing `DataTableRow<T>` shape:

```ts
const slot = {
  id: 'person:42',       // stable application identity, not a window position
  index: 125_042,       // supplied row index; may be global
  original: { id: '42', name: 'Ada' },
};
```

IDs must be unique, nonempty strings across the supplied data and group slots.
Use stable IDs across refetches and separate namespaces for group and data IDs.
The renderer uses the supplied ID, rather than regenerating it with `getRowId`.
The array position plus `startIndex` determines the display-slot index;
`DataTableRow.index` is preserved as row metadata and need not equal that slot
index when groups are present. Supply children as separate flattened slots, not
nonempty data-row `subRows` arrays.

`totalRowCount` counts display slots, including visible group headers and
expanded descendants. It is distinct from the existing core `rowCount`, which
describes records for manual pagination/count-dependent features. Without an
exact display count the table uses `aria-rowcount="-1"`; rendered slots retain
global, one-based `aria-rowindex` values.

## Public methods and notifications

Both `DataTableCore<T>` and `DataTable<T>` accept `rowWindow` in their constructor
options. `data` is still required; use `data: []` when the window owns the rows.

```ts
// DOM-free core: also exported from 'wts-data-table/core'.
core.getRowWindow();                // DataTableRowWindow<T> | undefined
core.setRowWindow(window);          // void; updates rows, not the DOM

// Complete DOM renderer.
table.getRowWindow();               // DataTableRowWindow<T> | undefined
table.setRowWindow(window);         // replace loaded slots and render
table.setRowWindow(window, { resetScroll: true });
table.getViewportRange();           // { startIndex, endIndex }
table.scrollToRow(globalIndex);     // void
```

Use `table.setRowWindow`, not just `table.core.setRowWindow`, when an existing
DOM table needs updating. Updates preserve query state, selected row IDs, and
scroll position by default; native scrolling can clamp if the extent shrinks.
`resetScroll: true` moves to the start of the current physical segment, not
necessarily global row zero.

Configure `onViewportRangeChange(range)` or listen on the table's host element
for `wts-data-table-viewport-range-change`; the event's `detail` is the same range.
Ranges are global and overscanned, with an inclusive `startIndex` and exclusive
`endIndex`. Notifications are microtask-delivered, coalesced, deduplicated for
unchanged ranges, and suppressed after destruction. The initial render also
requests a range. Delivery requests data; it does not mean that range is loaded.

Keyboard cell navigation can request unloaded boundaries through the same
notification. `getViewportRange()` reports the current physical viewport; an
out-of-segment `scrollToRow()` request can notify a different global range before
the provider rebases the scrollbar.

## Connect your own loader

The following example uses an application-supplied `fetchWindow` transport. It
expects a contiguous flat result and an exact count. A production provider can
add bounded block caching and retry UI without changing the renderer contract.

```ts
import {
  DataTable,
  type DataTableState,
  type DataTableViewportRange,
} from 'wts-data-table';
import 'wts-data-table/styles.css';

type Person = { id: string; name: string; department: string };

// Implement this transport in your application. Apply the supplied state on
// the server, and return rows starting at range.startIndex.
declare function fetchWindow(
  range: DataTableViewportRange,
  state: DataTableState,
  signal: AbortSignal,
): Promise<{ rows: readonly Person[]; totalCount: number }>;

let request = 0;
let abort: AbortController | undefined;

const table = new DataTable<Person>({
  element: '#people-table',
  data: [],
  columns: [
    { accessor: 'name', header: 'Name' },
    { accessor: 'department', header: 'Department' },
  ],
  getRowId: person => `person:${person.id}`,
  manualFiltering: true,
  manualSorting: true,
  manualPagination: true,
  manualRowOrdering: true,
  showPagination: false,
  virtualization: { height: 420, rowHeight: 40, overscan: 6 },
  rowWindow: { rows: [], startIndex: 0, virtualRowCount: 200 },
  onViewportRangeChange: range => { void load(range); },
});

async function load(range: DataTableViewportRange): Promise<void> {
  if (range.endIndex <= range.startIndex) return;
  const version = ++request;
  abort?.abort();
  const controller = new AbortController();
  abort = controller;
  table.setLoading(true);
  try {
    const result = await fetchWindow(range, table.getState(), controller.signal);
    if (version !== request || controller.signal.aborted) return;
    // If a query/count change invalidates this offset, request a valid range
    // in your provider instead of publishing an out-of-bounds window.
    table.setRowWindow({
      rows: result.rows.map((original, offset) => ({
        id: `person:${original.id}`,
        index: range.startIndex + offset,
        original,
      })),
      startIndex: range.startIndex,
      virtualRowCount: result.totalCount,
      totalRowCount: result.totalCount,
    });
  } catch (error) {
    if (version === request && !controller.signal.aborted) {
      console.error('Remote window failed', error); // replace with retry UI
    }
  } finally {
    if (version === request) table.setLoading(false);
  }
}

function destroy(): void {
  request += 1;
  abort?.abort();
  table.destroy();
}
```

External windows already own filtering, sorting, ordering, and display
flattening; the local row pipeline is bypassed. The manual flags communicate
that ownership to the table's other server-facing features. Query changes still
need an explicit provider refresh: subscribe to state changes such as `sorting`,
`global-filter`, `column-filter`, `advanced-filter`, `grouping`,
`group-expansion`, `reset`, and `state-restore`. Do not rely only on range
notifications, since a new query may request the same numeric range.

For unknown counts, leave `totalRowCount` absent and extend `virtualRowCount`
as the server reports more data. Publish the exact count when known. A loading
flag retains remote rows/spacers rather than replacing the body with the local
loading-message row; present request errors and retry controls in your own
status region.

## Bounded physical scrolling and global jumps

Browsers impose practical limits on element/scroll heights. The renderer does
not select or rebase segments automatically. Keep the physical segment's pixel
height (`scrollRowCount * rowHeight`) within a tested bound for your supported
browsers, even when the global result contains far more rows.

```ts
table.setRowWindow({
  rows: loadedDisplaySlots,
  startIndex: 900_000_000,
  virtualRowCount: 1_000_000_000,
  totalRowCount: 1_000_000_000,
  scrollBaseIndex: 900_000_000,
  scrollRowCount: 100_000,
});
table.scrollToRow(900_000_010); // global index; physical position is segment-local
```

`scrollToRow()` inside the segment moves the native viewport and requests its
range. Outside the segment it only notifies demand for the target's global
range. Your provider must publish a suitable segment, then call `scrollToRow()`
again to perform the movement. Reject obsolete requests during rebasing just
as you would after a query change. No API call allocates an array proportional
to the global count.

## Server-flattened groups

Use `DataTableGroupRow<T>` slots for the existing group renderer:

```ts
import type { DataTableGroupRow } from 'wts-data-table';

const departmentGroup: DataTableGroupRow<Person> = {
  type: 'group',
  id: 'group:department:Engineering',
  columnId: 'department', // must identify an existing column
  value: 'Engineering',
  depth: 0,
  expanded: false,
  rowCount: 12_500,
  aggregates: { name: '12,500 people' },
  rows: [],
  subRows: [],
};
```

`rowCount` provides the displayed descendant count without materializing those
descendants; if omitted, the group label falls back to `rows.length`.
`aggregates` contains server-provided values keyed by column ID. Keep optional
metadata bounded; do not populate every descendant just to render a count.

The server/provider decides which group headers and expanded descendants occupy
the flat display sequence. Toggle clicks update `state.groupExpansion` and emit
the existing `group-expansion` state-change reason. Explicit expansion state
takes precedence over a slot's initial `expanded` value. Send expansion state
with the query and republish the flattened window/extent; the renderer does not
insert or fetch remote descendants itself.

## Editing, selection, and loaded-data scope

Remote editable columns require `onEditCommit`. The callback receives the normal
edit context, including `rowId`, `columnId`, `value`, `previousValue`, and the
original row. Await server persistence there, then refresh or publish the
authoritative window. An example option is:

```ts
onEditCommit: async ({ rowId, columnId, value }) => {
  await saveRemoteCell({ rowId, columnId, value });
  await refreshCurrentWindow();
}
```

Remote commits do **not** optimistically rewrite cached records, use global
indexes to write local arrays, or apply a local rollback. A rejected callback
uses the existing edit-error notification. Successful commits emit the existing
cell-change and edit-commit notifications. The application owns server rollback,
conflict handling, cache invalidation, and any durable drafts.

Selected row IDs survive window replacement, while `getSelectedRows()` returns
only loaded selected records. `getData()`, row lookup, local exports, and local
summary calculations likewise operate on loaded data, not the entire server
result. Supply server summary values or a dedicated server export for global
results. Decide whether selection should reset when query scope changes.

Evicting a row discards its active editor and local edit-presentation state.
It does not cancel an application-owned in-flight save; manage stale save
responses in your provider. Ordinary row actions resolve supplied IDs through
the core and continue to receive the correct loaded row objects.

## Compatibility and returning to local data

Remote slots use a fixed height. Their cell content is clipped to that height,
including group headers, custom content, and editing controls. Choose a height
that fits your UI; wrapping text or a tall custom component cannot expand a
remote slot. This does not change the height behavior of local tables.

The following combinations are rejected or unsupported in external-window mode:

- Disabled virtualization or `virtualization.getRowHeight`.
- Row pinning controls or nonempty top/bottom row-pinning state. Column pinning
  remains available.
- Local `getSubRows`/`loadSubRows` tree providers, or nested data-row children.
  Supply flattened hierarchy metadata/slots instead.
- Local `rowExpansion.renderDetailPanel` content, which would add unaccounted
  height. Use an external detail view when needed.
- Client-owned row reordering or `applyTransaction()` mutations. Change remote
  order/data through your provider and publish a fresh window.
- Editable columns without `onEditCommit`.

Call `table.setData(data, rowCount?, summaryValues?)` to leave external-window
mode. `getRowWindow()` then returns `undefined`, remote range notifications stop,
and the ordinary local/manual-data pipeline resumes with the table's existing
options. This does not automatically change manual flags or other options.
`core.setData()` also leaves core window mode, but use the renderer method when
updating a mounted table so its DOM and presentation state are updated too.
