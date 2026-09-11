import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, afterNextRender, inject, signal } from '@angular/core';

@Injectable()
export class DocsReadingPosition {
  readonly active = signal('install');

  constructor() {
    const document = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const view = document.defaultView;
      if (!view) return;
      let frame = 0;
      const update = () => {
        frame = 0;
        const sections = [...document.querySelectorAll<HTMLElement>('[data-doc-section]')];
        const current =
          sections.filter((section) => section.getBoundingClientRect().top <= 170).at(-1) ??
          sections[0];
        if (current) this.active.set(current.id);
      };
      const schedule = () => {
        if (!frame) frame = view.requestAnimationFrame(update);
      };
      view.addEventListener('scroll', schedule, { passive: true });
      view.addEventListener('resize', schedule, { passive: true });
      update();
      destroyRef.onDestroy(() => {
        view.removeEventListener('scroll', schedule);
        view.removeEventListener('resize', schedule);
        view.cancelAnimationFrame(frame);
      });
    });
  }
}
