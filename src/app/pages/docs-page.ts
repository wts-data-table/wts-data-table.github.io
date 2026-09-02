import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type Framework = 'Angular' | 'Core' | 'React' | 'Vue';
const SNIPPETS: Record<Framework, string> = {
  Core: `import { DataTable } from 'wts-data-table';\nimport 'wts-data-table/styles.css';\n\nconst table = new DataTable({\n  element: '#table',\n  data: rows,\n  columns,\n  getRowId: row => row.id\n});\n\n// When the owning view unmounts\ntable.destroy();`,
  Angular: `import { Component } from '@angular/core';\nimport { WtsDataTableAngularComponent } from '@wts-data-table/angular';\n\n@Component({\n  imports: [WtsDataTableAngularComponent],\n  template: \`<wts-data-table-angular\n    [data]="rows"\n    [options]="options"\n  />\`\n})\nexport class ProjectTable {\n  rows = projects;\n  options = { columns, getRowId: (row: Project) => row.id };\n}`,
  React: `import { useMemo } from 'react';\nimport { WtsDataTableReact } from '@wts-data-table/react';\nimport 'wts-data-table/styles.css';\n\nexport function ProjectTable() {\n  const options = useMemo(() => ({\n    columns, getRowId: (row: Project) => row.id\n  }), []);\n  return <WtsDataTableReact data={rows} options={options} />;\n}`,
  Vue: `<script setup lang="ts">\nimport { WtsDataTableVue } from '@wts-data-table/vue';\nimport 'wts-data-table/styles.css';\n\nconst options = { columns, getRowId: (row: Project) => row.id };\n</script>\n\n<template>\n  <WtsDataTableVue :data="rows" :options="options" />\n</template>`,
};

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-hero wrap"><span class="kicker">Documentation</span><h1>From install to<br><em>working table.</em></h1><p>The shortest reliable integration path, with links to the complete package reference.</p></section>
    <section class="docs-layout wrap">
      <aside aria-label="Documentation sections"><a routerLink="/docs" fragment="install">Install</a><a routerLink="/docs" fragment="integrate">Integrate</a><a routerLink="/docs" fragment="lifecycle">Lifecycle</a><a routerLink="/docs" fragment="reference">Reference</a></aside>
      <div class="docs-content">
        <section id="install"><span class="step">01</span><h2>Install the package</h2><p>The main package contains the typed core and complete DOM renderer.</p><pre><code>npm install wts-data-table</code></pre></section>
        <section id="integrate"><span class="step">02</span><h2>Choose your integration</h2><p>Start with the core API, or use the matching wrapper for native framework bindings.</p><div class="tabs" role="tablist">@for(item of frameworks;track item){<button type="button" role="tab" [attr.aria-selected]="framework()===item" [class.active]="framework()===item" (click)="framework.set(item)">{{ item }}</button>}</div><pre class="code"><code>{{ snippets[framework()] }}</code></pre></section>
        <section id="lifecycle"><span class="step">03</span><h2>Own the lifecycle</h2><p>Create the renderer after its host exists. Call <code>destroy()</code> when that view unmounts so observers, listeners, and owned DOM are released.</p><div class="callout"><strong>Server rendering</strong><span>Mount the imperative renderer only in the browser. The Angular example uses <code>afterNextRender</code>.</span></div></section>
        <section id="reference"><span class="step">04</span><h2>Go deeper</h2><p>The package includes focused guides for wrappers, themes, plug-ins, internationalization, server integration, security, and advanced capabilities.</p><div class="resource-grid"><a href="https://www.npmjs.com/package/wts-data-table" target="_blank" rel="noreferrer"><strong>npm package</strong><span>Published files and version ↗</span></a><a href="https://github.com/wts-data-table/wts-data-table.github.io" target="_blank" rel="noreferrer"><strong>Source repository</strong><span>Code, issues, and guides ↗</span></a><a href="https://unpkg.com/wts-data-table@1/README.md" target="_blank" rel="noreferrer"><strong>Full README</strong><span>API and guide index ↗</span></a></div></section>
      </div>
    </section>
  `,
  styles: [`
    .docs-layout{display:grid;grid-template-columns:190px minmax(0,820px);gap:6rem;align-items:start}.docs-layout aside{position:sticky;top:105px;display:grid;border-top:1px solid var(--line)}.docs-layout aside a{padding:.8rem 0;border-bottom:1px solid var(--line);color:var(--muted);font-size:.78rem;text-decoration:none}.docs-content>section{padding:0 0 5rem;scroll-margin-top:110px}.step{color:var(--blue);font:.68rem var(--mono)}h2{margin:.6rem 0 1rem;font-size:clamp(2rem,4vw,3.5rem);letter-spacing:-.055em}.docs-content p{color:var(--muted);line-height:1.75}.docs-content pre{margin:1.5rem 0;padding:1.2rem;overflow:auto;border-radius:10px;background:#121a28;color:#dce5f1;font:.78rem/1.7 var(--mono)}.tabs{display:flex;gap:.35rem;margin-top:1.5rem}.tabs button{padding:.6rem .85rem;border:1px solid var(--line);border-radius:7px;background:white;color:var(--muted);cursor:pointer}.tabs button.active{border-color:var(--blue);background:var(--blue);color:white}.code{margin-top:.5rem!important}.callout{display:grid;gap:.4rem;margin-top:1.5rem;padding:1.2rem;border-left:3px solid var(--blue);background:var(--blue-soft)}.callout span{color:var(--muted);line-height:1.6}.resource-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem;margin-top:1.5rem}.resource-grid a{display:grid;gap:2rem;min-height:140px;padding:1rem;border:1px solid var(--line);border-radius:9px;background:white;color:var(--ink);text-decoration:none}.resource-grid span{color:var(--muted);font-size:.72rem}
    @media(max-width:750px){.docs-layout{grid-template-columns:1fr;gap:3rem}.docs-layout aside{position:static;display:flex;gap:1rem;overflow:auto}.resource-grid{grid-template-columns:1fr}}
  `],
})
export class DocsPage { protected readonly frameworks = Object.keys(SNIPPETS) as Framework[]; protected readonly snippets = SNIPPETS; protected readonly framework = signal<Framework>('Angular'); }
