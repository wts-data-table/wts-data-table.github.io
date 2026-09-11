import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-doc-code',
  template: `
    <div class="code-frame">
      <div class="code-toolbar">
        <span>{{ label() }}</span>
        <div>
          <small>{{ language() }}</small
          ><button type="button" (click)="copy()" [attr.aria-label]="'Copy ' + label()">
            {{ status() === 'copied' ? 'Copied ✓' : 'Copy' }}
          </button>
        </div>
      </div>
      <pre
        tabindex="0"
        [attr.aria-label]="label()"
      ><code>@for(token of tokens(); track $index){<span [class]="token.kind">{{ token.text }}</span>}</code></pre>
    </div>
    <span class="copy-status" role="status">{{
      status() === 'failed'
        ? 'Clipboard unavailable. Select the code and copy it manually.'
        : status() === 'copied'
          ? 'Code copied to clipboard.'
          : ''
    }}</span>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        margin: 1.2rem 0;
      }
      .code-frame {
        overflow: hidden;
        border: 1px solid #2b374c;
        border-radius: 12px;
        background: #111b2d;
        color: #dce6f5;
      }
      .code-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.65rem 1rem;
        border-bottom: 1px solid #2b374c;
        background: #19253a;
        font: 0.75rem var(--mono);
      }
      .code-toolbar > span {
        overflow-wrap: anywhere;
      }
      .code-toolbar > div {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        flex-shrink: 0;
      }
      .code-toolbar small {
        color: #a7b6cb;
        font: 0.65rem var(--sans);
      }
      button {
        min-height: 30px;
        padding: 0.25rem 0.65rem;
        border: 1px solid #53647d;
        border-radius: 6px;
        background: transparent;
        color: #e4edfa;
        font: 0.72rem var(--sans);
        cursor: pointer;
      }
      button:hover {
        background: #2b3c56;
      }
      pre {
        margin: 0;
        padding: 1.15rem 1.25rem;
        overflow: auto;
        tab-size: 2;
        font: 0.78rem/1.85 var(--mono);
      }
      code {
        font: inherit;
      }
      .string {
        color: #a8debd;
      }
      .comment {
        color: #92a4bf;
      }
      .keyword {
        color: #bba9ff;
      }
      .number {
        color: #ffcb8e;
      }
      .copy-status {
        display: block;
        color: var(--muted);
        font-size: 0.75rem;
      }
      .copy-status:not(:empty) {
        margin-top: 0.45rem;
      }
      @media (max-width: 550px) {
        .code-toolbar {
          padding: 0.6rem 0.75rem;
        }
        .code-toolbar small {
          display: none;
        }
        pre {
          padding: 0.85rem;
          font-size: 0.73rem;
        }
      }
    `,
  ],
})
export class DocCode {
  readonly code = input.required<string>();
  readonly label = input('Example');
  readonly language = input('TypeScript');
  protected readonly status = signal<'idle' | 'copied' | 'failed'>('idle');
  private readonly document = inject(DOCUMENT);
  private timer?: ReturnType<typeof setTimeout>;
  protected readonly tokens = computed(() => {
    const source = this.code();
    const tokens: { text: string; kind: string }[] = [];
    const pattern =
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|\b(import|from|export|const|let|type|interface|class|new|return|await|async|readonly|function|true|false|null|undefined)\b|\b(\d+(?:\.\d+)?)\b/g;
    let offset = 0;
    for (const match of source.matchAll(pattern)) {
      if (match.index > offset) tokens.push({ text: source.slice(offset, match.index), kind: '' });
      tokens.push({
        text: match[0],
        kind: match[1] ? 'comment' : match[2] ? 'string' : match[3] ? 'keyword' : 'number',
      });
      offset = match.index + match[0].length;
    }
    if (offset < source.length) tokens.push({ text: source.slice(offset), kind: '' });
    return tokens;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    effect(() => {
      this.code();
      clearTimeout(this.timer);
      this.status.set('idle');
    });
  }

  protected async copy(): Promise<void> {
    clearTimeout(this.timer);
    try {
      const clipboard = this.document.defaultView?.navigator.clipboard;
      if (!clipboard) throw new Error('Clipboard unavailable');
      await clipboard.writeText(this.code());
      this.status.set('copied');
      this.timer = setTimeout(() => this.status.set('idle'), 2500);
    } catch {
      this.status.set('failed');
    }
  }
}
