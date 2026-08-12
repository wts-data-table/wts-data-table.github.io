# wts-data-table Angular 22 example

A polished Angular 22 integration for [`wts-data-table`](https://www.npmjs.com/package/wts-data-table), the accessible, dependency-free, framework-agnostic data table.

The example demonstrates typed columns, custom DOM cells, global and column filtering, sorting, multi-row selection, adaptive pagination, responsive column details, summaries, column controls, and lifecycle-safe controller cleanup.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Verify

```bash
npm test -- --watch=false
npm run build
```

## Integration pattern

Angular owns the surrounding page and creates the table after its host element renders. The package controller is destroyed with the component.

```ts
import { afterNextRender, DestroyRef, inject } from '@angular/core';
import { DataTable } from 'wts-data-table';

const destroyRef = inject(DestroyRef);

afterNextRender(() => {
  const table = new DataTable({
    element: '#project-table',
    columns,
    data: projects,
    getRowId: (project) => project.id,
  });

  destroyRef.onDestroy(() => table.destroy());
});
```

The published stylesheet is loaded once in `src/styles.scss`:

```scss
@import 'wts-data-table/styles.css';
```

## Links

- [`wts-data-table` on npm](https://www.npmjs.com/package/wts-data-table)
- [Angular documentation](https://angular.dev/)
