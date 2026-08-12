# Host-framework themes

`wts-data-table` theme presets apply classes from a styling framework that the
host application already loads. They do not import, bundle, install, or declare
a dependency on that framework's stylesheet or JavaScript.

## Automatic and named configuration

No adapter import is required for built-in string themes:

```ts
const table = new DataTable({
  columns,
  data,
  element: '#people',
  theme: 'auto', // or 'bootstrap5', 'bulma', 'tailwind', etc.
});
```

`auto` inspects active stylesheet links, framework CSS variables, and guarded
style probes. If nothing supported is present, the table retains its default
theme. Explicit missing themes also fall back rather than rendering a broken
hybrid UI.

```ts
const status = table.getThemeStatus();
// requested, resolved, stylesheetDetected, fallbackUsed, detectedThemes

table.setTheme('bulma');
```

Resolution dispatches `wts-data-table-theme-change`. Missing CSS calls
`onThemeDiagnostic`, and console diagnostics can be disabled with
`themeDiagnostics: false`.

The equivalent Web Component configuration is:

```html
<wts-data-table theme="auto"></wts-data-table>
```

The table's structural and accessible behavior still comes from the standard
package stylesheet:

```ts
import 'wts-data-table/styles.css';
```

That stylesheet is contained in the low-priority `wts-data-table` cascade
layer. Unlayered Bootstrap, Bulma, Foundation, Fomantic UI, and jQuery UI rules
therefore override its visual defaults regardless of stylesheet import order.

## Built-in presets

| Existing host framework | Theme entry point | Export |
| --- | --- | --- |
| Bootstrap 5 | `wts-data-table/themes/bootstrap5` | `bootstrap5Theme` |
| Bulma | `wts-data-table/themes/bulma` | `bulmaTheme` |
| Foundation | `wts-data-table/themes/foundation` | `foundationTheme` |
| Fomantic UI | `wts-data-table/themes/fomantic` | `fomanticTheme` |
| jQuery UI | `wts-data-table/themes/jquery-ui` | `jqueryUiTheme` |
| Tailwind CSS | `wts-data-table/themes/tailwind` | `tailwindTheme` |

For example, when Bootstrap is already loaded globally:

```ts
import { DataTable } from 'wts-data-table';
import { bootstrap5Theme } from 'wts-data-table/themes/bootstrap5';
import 'wts-data-table/styles.css';

new DataTable({
  columns,
  data,
  element: '#people',
  theme: bootstrap5Theme,
});
```

Do not import `bootstrap.min.css` again in this module. The adapter uses the
`.table`, `.btn`, `.form-control`, `.dropdown-menu`, and `.pagination` classes
from the application stylesheet already in the page. The same rule applies to
the other presets.

Card view automatically inherits the table theme. CRUD editors accept the same
adapter explicitly:

```ts
createDataTableCrudEditor({
  controller,
  fields,
  table,
  target: document.body,
  theme: bootstrap5Theme,
  createRow,
  getRowId,
});
```

## Tailwind

Tailwind has no runtime component stylesheet. Its compiler must see the preset's
utility class strings. For Tailwind v4, register the installed entry as a source
and order the WTS layer below Tailwind utilities:

```css
@layer wts-data-table, theme, base, components, utilities;
@import "tailwindcss";
@import "wts-data-table/styles.css";
@source "../node_modules/wts-data-table/dist/themes/tailwind.js";
```

For Tailwind v3, include the same built file in `content`:

```js
export default {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx,vue,svelte}',
    './node_modules/wts-data-table/dist/themes/tailwind.js',
  ],
};
```

This compiles the required utilities into the application's existing Tailwind
output; no separate WTS Tailwind stylesheet is shipped or loaded.

## Custom design systems

Use `defineDataTableTheme` for an internal framework or component library:

```ts
import { defineDataTableTheme } from 'wts-data-table/theme';

export const productTheme = defineDataTableTheme({
  name: 'product',
  classes: {
    root: 'product-data-grid',
    table: 'product-table',
    button: 'product-button product-button--small',
    input: 'product-input',
    pageActive: 'is-active',
    card: 'product-card',
  },
  wrappers: {
    select: { className: 'product-select', tagName: 'div' },
  },
});
```

The public semantic slots cover the table, toolbar, form controls, buttons,
sorting, column menus, pagination, responsive dialog, card view, and CRUD
editor. `applyDataTableTheme` can also apply or replace a theme on an existing
compatible root.

## Setup assistant

```bash
npx wts-data-table setup --theme auto
npx wts-data-table setup --theme bulma --write src/data-table-theme.ts
npx wts-data-table setup --theme bootstrap5 --install --write
```

The assistant reads the application's dependencies and lockfile, selects the
matching package manager, and prints or generates the correct adapter module.
It never installs a missing framework unless `--install` is present. Use
`--json` in CI and `--force` to replace a previously generated module.
