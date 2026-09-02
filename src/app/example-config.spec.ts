import { describe, expect, it } from 'vitest';
import { createDemoRuntimeOptions, createFrameworkSnippet } from './example-config';
import { TABLE_DEMOS } from './site-data';

describe('framework example snippets', () => {
  const grouping = TABLE_DEMOS.find(({ id }) => id === 'grouping')!;

  it('generates wrapper-specific imports while retaining example options', () => {
    const runtime = createDemoRuntimeOptions('grouping');
    expect(createFrameworkSnippet('Angular', grouping, runtime)).toContain("from '@wts-data-table/angular'");
    expect(createFrameworkSnippet('React', grouping, runtime)).toContain('<WtsDataTableReact');
    expect(createFrameworkSnippet('Vue', grouping, runtime)).toContain('<WtsDataTableVue');
    expect(createFrameworkSnippet('Vanilla TS', grouping, runtime)).toContain("grouping: ['status']");
  });

  it('reflects live option changes in generated code', () => {
    const runtime = { ...createDemoRuntimeOptions('grouping'), pagination: false, pageSize: 14 as const };
    const code = createFrameworkSnippet('React', grouping, runtime);
    expect(code).toContain('pagination: false');
    expect(code).toContain('pageSize: 14');
  });
});
