import { describe, expect, it } from 'vitest';
import { DEVELOPER_GUIDES, getDeveloperGuide } from './developer-guides';

describe('developer guides', () => {
  it('provides thirteen unique internal guides with substantive content', () => {
    expect(DEVELOPER_GUIDES).toHaveLength(13);
    expect(new Set(DEVELOPER_GUIDES.map(({ slug }) => slug)).size).toBe(13);
    expect(DEVELOPER_GUIDES.every(({ sections, code }) => sections.length >= 3 && code.length > 40)).toBe(true);
  });

  it('resolves a guide by slug and falls back safely', () => {
    expect(getDeveloperGuide('database-adapters').title).toBe('Database adapters');
    expect(getDeveloperGuide('missing').slug).toBe('framework-wrappers');
  });

  it('includes complete and distinct framework recipes, lifecycle advice, and troubleshooting', () => {
    for (const framework of ['angular', 'react', 'vue']) {
      const guide = getDeveloperGuide(framework);
      expect(guide.framework?.toLowerCase()).toBe(framework);
      expect(guide.sections.length).toBeGreaterThanOrEqual(8);
      expect(guide.sections.some(section => section.codeTitle === 'table-data.ts')).toBe(true);
      expect(guide.sections.some(section => section.codeTitle === 'remote-data.ts')).toBe(true);
      expect(guide.sections.some(section => section.title.toLowerCase().includes('troubleshoot'))).toBe(true);
      expect(guide.code).toContain('onEditCommit');
      expect(guide.code).toContain('selectionMode');
      expect(guide.code).toContain('columnFilters');
      expect(guide.codeIntro).toContain('Complete local');
    }
  });
});
