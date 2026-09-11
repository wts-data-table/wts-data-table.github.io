# Bundle-size contract

The primary contract uses real minified ESM consumer bundles built with
esbuild after `npm run build`. Gzip uses Node's default settings. These are
repeatable regression measurements, not network-transfer guarantees.

| Consumer import | Minified | Gzip | Gzip budget |
| --- | ---: | ---: | ---: |
| `wts-data-table/base` | 52,785 B | 14,259 B | 14.4 KB |
| `/base` + selection | — | incremental < 1 KB | 1 KB incremental |
| `/base` + `standardPreset()` | 56,042 B | 15,284 B | 15.4 KB |
| `/base` + plug-in registry API | 59,728 B | 16,296 B | 2.5 KB incremental |
| `/base` + exact French locale | 61,529 B | 16,582 B | 3 KB incremental |
| `/base` + `completePreset()` | 78,073 B | 22,044 B | 22.4 KB |
| Compatibility `wts-data-table` | 204,301 B | 53,745 B | ratio reference |

The modular complete composition is below 45% of the compatibility renderer's
gzip size. A bare base consumer is about 27% of the compatibility renderer.
Tests also inspect the generated base bundle to ensure optional selection,
export, and pivot implementation strings cannot leak into it.

Readable package entries (syntax-folded, without identifier/whitespace
minification) remain useful for diagnosing output growth:

| Entry | Raw | Gzip | Budget |
| --- | ---: | ---: | ---: |
| Compatibility `wts-data-table` | 327,974 B | 70,551 B | 334 KB / 71 KB |
| `wts-data-table/base` | 85,361 B | 19,158 B | 90 KB / 19.3 KB |
| `wts-data-table/lite` | 84,273 B | 18,906 B | 90 KB / 19 KB |
| `wts-data-table/i18n` | 10,454 B | 3,090 B | 12 KB / 4 KB |
| Exact French locale | 12,640 B | 3,299 B | 14 KB / 4 KB |
| Aggregate locales | 33,483 B | 7,606 B | 35 KB / 9 KB |
| `wts-data-table/plugin` | 12,759 B | 3,431 B | 15 KB / 4 KB |
| `wts-data-table/base.css` | 3,016 B | ~0.86 KB | 4 KB / 1.2 KB; imports `lite.css` |
| `wts-data-table/lite.css` | 2,136 B | ~0.74 KB | 3 KB / 1.2 KB |

Run `npm run bundle:size` locally. Package tests fail if an entry, consumer
budget, or complete-to-compatibility ratio regresses.

## Full package archive

The npm archive includes standard APIs and all licensed advanced feature
subpaths, together with ESM, CommonJS, declarations, source maps, examples, and
linked developer guides. At the 2026-09-02 integration checkpoint it contains
659 files, 2,203,042 packed bytes, and 10,713,756 unpacked bytes. The enforced
budgets are 700 files, 2,400,000 packed bytes, and 11,500,000 unpacked bytes.

Archive size and consumer bundle size are separate contracts. Advanced modules
are reached through exact feature imports such as `wts-data-table/remote` and
`wts-data-table/report-designer`; they are not re-exported by the root,
`/complete`, `/base`, or `/lite` renderer entries. Consequently, shipping all
features in one npm archive does not add those implementations to a normal
consumer bundle unless the application imports them.

The earlier unreleased scroll optimization added 3,093 raw bytes to the compatibility
renderer versus the previous measurement, and 574 gzip bytes to its minified
consumer. Its raw diagnostic cap moves from 332,000 to 334,000 bytes; **all gzip
budgets, modular consumer budgets and the 45% ratio were unchanged**. This was
an explicit code-size trade-off for avoiding full-dataset work during scrolling.

The 2026-08-31 additive remote-window API adds 728 gzip bytes to the base consumer
and 2,464 to the full renderer consumer relative to the preceding table. Native
window geometry, validated externally supplied display rows and commit-only
remote editing are available in the standard renderer; advanced cache/state code
is available only through exact feature subpaths. Syntax folding keeps the full entry inside its unchanged
334 KB / 70 KB limits. The shared base diagnostic gzip cap changes from 19,000
to 19,300 bytes, and base/standard/complete consumer caps each rise by 400 bytes
to accommodate their shared-core increase. Raw limits, lite limits, optional
feature incremental limits and the 45% ratio are unchanged. These are explicit
development budget revisions, not claims that the old caps passed.

The 2026-09-11 UI fixes add overflow-safe column-menu positioning, native
top-layer rendering, a legacy-browser fallback, and lifecycle cleanup. The
readable full entry increases by 5,287 raw bytes and 1,461 gzip bytes from the
previous checkpoint. Its diagnostic gzip cap is explicitly revised from 70,000
to 71,000 bytes; the old cap does not pass. The minified consumer increases by
3,539 raw bytes and 1,097 gzip bytes. The 334,000-byte raw cap, modular consumer
budgets, optional-feature budgets, and 45% ratio are unchanged.
