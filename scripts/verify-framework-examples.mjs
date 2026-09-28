import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await readFile(new URL('../src/app/framework-guides.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { PROJECT_DATA, REMOTE_DATA, LOCAL_EXAMPLES, REMOTE_EXAMPLES } =
  await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

// Generated files stay in the existing ignored build cache, never in src.
const scratch = resolve(root, '.angular/cache/framework-guide-checks');
await mkdir(scratch, { recursive: true });
const examples = {
  'table-data.ts': PROJECT_DATA,
  'remote-data.ts': REMOTE_DATA,
  'project-table.component.ts': LOCAL_EXAMPLES.Angular,
  'remote-project-table.component.ts': REMOTE_EXAMPLES.Angular,
  'ProjectTable.tsx': LOCAL_EXAMPLES.React,
  'RemoteProjectTable.tsx': REMOTE_EXAMPLES.React,
  'ProjectTable.vue': LOCAL_EXAMPLES.Vue,
  'RemoteProjectTable.vue': REMOTE_EXAMPLES.Vue,
};
for (const [name, code] of Object.entries(examples)) {
  await writeFile(resolve(scratch, name), code + '\n');
}
const compilerOptions = {
  target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler',
  lib: ['ES2022', 'DOM'], strict: true, skipLibCheck: true, noEmit: true,
  experimentalDecorators: true, jsx: 'react-jsx', types: [],
};
await writeFile(resolve(scratch, 'tsconfig.json'), JSON.stringify({
  compilerOptions,
  angularCompilerOptions: { strictTemplates: true },
  files: Object.keys(examples).filter(name => !name.endsWith('.vue')),
}, null, 2));
await writeFile(resolve(scratch, 'tsconfig.vue.json'), JSON.stringify({
  compilerOptions,
  files: ['table-data.ts', 'remote-data.ts', 'ProjectTable.vue', 'RemoteProjectTable.vue'],
}, null, 2));

const angular = await import('@angular/compiler-cli');
const config = angular.readConfiguration(resolve(scratch, 'tsconfig.json'));
const diagnostics = [...config.errors, ...angular.performCompilation({
  rootNames: config.rootNames, options: config.options,
}).diagnostics];
if (diagnostics.some(item => item.category === ts.DiagnosticCategory.Error)) {
  console.error(angular.formatDiagnostics(diagnostics));
  process.exit(1);
}
const vue = spawnSync(process.execPath, [
  resolve(root, 'node_modules/vue-tsc/bin/vue-tsc.js'),
  '--project', resolve(scratch, 'tsconfig.vue.json'), '--noEmit',
], { cwd: root, stdio: 'inherit' });
if (vue.error) throw vue.error;
if (vue.status !== 0) process.exit(vue.status ?? 1);
console.log('Verified the exact published guide snippets: Angular strict templates, React TSX, Vue SFCs, shared data, and remote transport.');
