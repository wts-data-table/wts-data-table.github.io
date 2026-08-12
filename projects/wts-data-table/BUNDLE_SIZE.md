# Bundle-size contract

The primary contract uses real minified ESM consumer bundles built with
esbuild after `npm run build`. Gzip uses Node's default settings. These are
repeatable regression measurements, not network-transfer guarantees.

| Consumer import | Minified | Gzip | Gzip budget |
| --- | ---: | ---: | ---: |
| `wts-data-table/base` | 50,090 B | 13,505 B | 14 KB |
| `/base` + selection | — | incremental < 1 KB | 1 KB incremental |
| `/base` + `standardPreset()` | 53,347 B | 14,513 B | 15 KB |
| `/base` + plug-in registry API | 57,033 B | 15,550 B | 2.5 KB incremental |
| `/base` + exact French locale | 58,840 B | 15,845 B | 3 KB incremental |
| `/base` + `completePreset()` | 75,380 B | 21,351 B | 22 KB |
| Compatibility `wts-data-table` | 189,201 B | 49,610 B | ratio reference |

The modular complete composition is below 45% of the compatibility renderer's
gzip size. A bare base consumer is about 26% of the compatibility renderer.
Tests also inspect the generated base bundle to ensure optional selection,
export, and pivot implementation strings cannot leak into it.

Unminified package entries remain useful for diagnosing output growth:

| Entry | Raw | Gzip | Budget |
| --- | ---: | ---: | ---: |
| Compatibility `wts-data-table` | 330,575 B | ~67.28 KB | 332 KB / 70 KB |
| `wts-data-table/base` | 87,267 B | ~18.68 KB | 90 KB / 19 KB |
| `wts-data-table/lite` | 86,474 B | ~18.44 KB | 90 KB / 19 KB |
| `wts-data-table/i18n` | 10,660 B | ~3.12 KB | 12 KB / 4 KB |
| Exact French locale | 12,770 B | ~3.35 KB | 14 KB / 4 KB |
| Aggregate locales | 33,609 B | ~7.69 KB | 35 KB / 9 KB |
| `wts-data-table/plugin` | 13,306 B | ~3.48 KB | 15 KB / 4 KB |
| Full structural CSS | 62,519 B | 9,572 B | Informational |
| `wts-data-table/base.css` | 3,016 B | ~0.86 KB | 4 KB / 1.2 KB; imports `lite.css` |
| `wts-data-table/lite.css` | 2,136 B | ~0.74 KB | 3 KB / 1.2 KB |

Run `npm run bundle:size` locally. Package tests fail if an entry, consumer
budget, or complete-to-compatibility ratio regresses.
