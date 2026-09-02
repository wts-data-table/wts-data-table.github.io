import { describe, expect, it } from 'vitest';
import { DEVELOPER_GUIDES, getDeveloperGuide } from './developer-guides';

describe('developer guides', () => {
  it('provides ten unique internal guides with substantive content', () => {
    expect(DEVELOPER_GUIDES).toHaveLength(10);
    expect(new Set(DEVELOPER_GUIDES.map(({ slug }) => slug)).size).toBe(10);
    expect(DEVELOPER_GUIDES.every(({ sections, code }) => sections.length >= 3 && code.length > 40)).toBe(true);
  });

  it('resolves a guide by slug and falls back safely', () => {
    expect(getDeveloperGuide('database-adapters').title).toBe('Database adapters');
    expect(getDeveloperGuide('missing').slug).toBe('framework-wrappers');
  });
});
