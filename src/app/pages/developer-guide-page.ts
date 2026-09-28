import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DEVELOPER_GUIDES, getDeveloperGuide } from '../developer-guides';
import { DocCode } from '../doc-code';
import { DocsNavigation } from '../docs-navigation';
import { DocsSidebar } from '../docs-sidebar';
import { DocsReadingPosition } from '../docs-reading-position';

@Component({
  imports: [RouterLink, DocCode, DocsNavigation, DocsSidebar],
  providers: [DocsReadingPosition],
  templateUrl: './developer-guide-page.html',
  styleUrl: './developer-guide-page.scss',
})
export class DeveloperGuidePage {
  protected readonly reading = inject(DocsReadingPosition);
  protected readonly frameworks = ['Angular', 'React', 'Vue'];
  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug'))),
    { initialValue: 'framework-wrappers' },
  );
  protected readonly guide = computed(() => getDeveloperGuide(this.slug()));
  protected readonly previousGuide = computed(
    () => DEVELOPER_GUIDES[DEVELOPER_GUIDES.indexOf(this.guide()) - 1],
  );
  protected readonly nextGuide = computed(
    () => DEVELOPER_GUIDES[DEVELOPER_GUIDES.indexOf(this.guide()) + 1],
  );
  protected readonly readingMinutes = computed(() =>
    Math.max(
      1,
      Math.ceil(
        [
          this.guide().intro,
          ...this.guide().sections.flatMap((s) => [s.body, ...(s.points ?? [])]),
          this.guide().code,
        ]
          .join(' ')
          .split(/\s+/).length / 180,
      ),
    ),
  );
  protected sectionId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-$/, '');
  }
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const guide = this.guide();
      const title = guide.title + ' | WTS Data Table';
      const url = 'https://wts-data-table.github.io/docs/guides/' + guide.slug + '/';
      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: guide.summary });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: guide.summary });
      this.meta.updateTag({ property: 'og:url', content: url });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: guide.summary });
      const canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical) canonical.href = url;
    });
  }
}
