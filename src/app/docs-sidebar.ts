import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

@Directive({
  selector: 'details[appDocsSidebar]',
  host: { '(click)': 'closeAfterNavigation($event)' },
})
export class DocsSidebar {
  private readonly document = inject(DOCUMENT);
  private readonly element = inject(ElementRef<HTMLDetailsElement>);
  private query?: MediaQueryList;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.query = this.document.defaultView?.matchMedia?.('(max-width: 850px)');
      if (!this.query) return;
      const update = () => {
        this.element.nativeElement.open = !this.query!.matches;
      };
      update();
      this.query.addEventListener('change', update);
      destroyRef.onDestroy(() => this.query?.removeEventListener('change', update));
    });
  }

  protected closeAfterNavigation(event: MouseEvent): void {
    if (this.query?.matches && (event.target as Element)?.closest('a')) {
      this.element.nativeElement.open = false;
    }
  }
}
