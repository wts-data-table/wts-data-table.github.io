import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly document = inject(DOCUMENT);
  protected readonly menuOpen = signal(false);
  protected skipToContent(event: MouseEvent): void {
    event.preventDefault();
    const content = this.document.getElementById('content');
    content?.focus({ preventScroll: true });
    content?.scrollIntoView();
  }
}
