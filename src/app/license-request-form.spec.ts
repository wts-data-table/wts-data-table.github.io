import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LicenseRequestForm, REQUEST_TIMEOUT_MS } from './license-request-form';
import { PricingPage } from './pages/pricing-page';

function mockDialog(dialog: HTMLDialogElement) {
  const show = vi.fn(() => {
    dialog.open = true;
    dialog.querySelector<HTMLInputElement>('[autofocus]')?.focus();
  });
  Object.defineProperty(dialog, 'showModal', { configurable: true, value: show });
  Object.defineProperty(dialog, 'close', {
    configurable: true,
    value: () => {
      dialog.open = false;
      dialog.dispatchEvent(new Event('close'));
    },
  });
  return show;
}

async function setup() {
  await TestBed.configureTestingModule({ imports: [LicenseRequestForm] }).compileComponents();
  const fixture = TestBed.createComponent(LicenseRequestForm);
  fixture.detectChanges();
  const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
  mockDialog(dialog);
  return { fixture, dialog, component: fixture.componentInstance };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('Pricing request form', () => {
  it('starts closed and offers direct submission without mailto or credential fields', async () => {
    const { fixture, dialog, component } = await setup();
    expect(dialog.open).toBe(false);
    component.open();
    fixture.detectChanges();
    expect(dialog.open).toBe(true);
    expect(fixture.nativeElement.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="password"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('#request-package')).toBeNull();
    expect(fixture.nativeElement.querySelector('.request-footer .button--primary').disabled).toBe(
      false,
    );
    expect(fixture.nativeElement.querySelector('#submission-notice')).toBeNull();
    expect(component.form.controls.requestType.value).toBe('PRICE_QUOTE');
  });

  it('sets the request type and resets personal details when closed', async () => {
    const { component, dialog } = await setup();
    component.open('RENEWAL');
    expect(component.form.controls.requestType.value).toBe('RENEWAL');
    component.form.controls.name.setValue('Synthetic Tester');
    component.close();
    expect(dialog.open).toBe(false);
    expect(component.form.controls.name.value).toBe('');
    component.open('NEW_ACCESS');
    expect(component.form.controls.requestType.value).toBe('NEW_ACCESS');
  });

  it('updates the dialog heading for each request type', async () => {
    const { component, fixture } = await setup();
    component.open('PRICE_QUOTE');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#request-heading').textContent).toContain(
      'Request Premium pricing',
    );
    component.form.controls.requestType.setValue('NEW_ACCESS');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#request-heading').textContent).toContain(
      'Request Premium access',
    );
    component.form.controls.requestType.setValue('RENEWAL');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#request-heading').textContent).toContain(
      'Renew Premium access',
    );
  });

  it('does not expose required-field errors when the dialog opens or initial focus moves', async () => {
    const { component, fixture } = await setup();
    component.open();
    fixture.detectChanges();

    expect(document.activeElement?.id).toBe('request-type');
    (document.activeElement as HTMLElement).blur();
    fixture.detectChanges();

    expect(component.checked()).toBe(false);
    expect(fixture.nativeElement.querySelector('#request-name-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('#request-email-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('#request-message-error')?.textContent.trim()).toBe(
      '',
    );
  });

  it('shows accessible errors and focuses the first invalid field', async () => {
    const { component, fixture } = await setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    component.open();
    component.form.patchValue({ name: '   ', email: 'not-an-email', message: '   ' });
    await component.submit();
    fixture.detectChanges();
    expect(component.form.invalid).toBe(true);
    expect(document.activeElement?.id).toBe('request-name');
    expect(fixture.nativeElement.querySelector('#request-name').getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(fixture.nativeElement.querySelector('#request-email-error')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#request-message-error')).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('submits the correct payload to a mocked endpoint without a storage write', async () => {
    const { component, fixture } = await setup();
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetchSpy);
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    component.open();
    component.form.patchValue({
      name: 'Synthetic Tester',
      email: 'tester@example.com',
      website: 'https://app.example.com\nhttp://localhost:4200',
      message: 'I want premium access for this package.',
    });
    await component.submit();
    fixture.detectChanges();
    expect(component.form.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'request was sent',
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://package-portal.dedicateddevelopers.us/api/public/premium-requests',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify({
          npmName: 'wts-data-table',
          name: 'Synthetic Tester',
          email: 'tester@example.com',
          company: '',
          website: 'https://app.example.com, http://localhost:4200',
          message: 'I want premium access for this package.',
          requestType: 'PRICE_QUOTE',
          period: 'ONE_MONTH',
        }),
      }),
    );
    expect(storageSpy).not.toHaveBeenCalled();
    expect(component.submissionState()).toBe('success');
  });

  it('shows a safe retry message when the request service fails', async () => {
    const { component, fixture } = await setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    component.open();
    component.form.patchValue({
      name: 'Synthetic Tester',
      email: 'tester@example.com',
      message: 'I want premium access for this package.',
    });
    await component.submit();
    fixture.detectChanges();
    expect(component.submissionState()).toBe('error');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'temporarily unavailable',
    );
  });

  it('validates origins without requiring a deployment before an inquiry', async () => {
    const { component } = await setup();
    const websites = component.form.controls.website;
    for (const value of [
      '',
      'https://app.example.com/',
      'http://127.0.0.1:3101',
      'https://a.example, https://b.example',
    ]) {
      websites.setValue(value);
      expect(websites.valid, value).toBe(true);
    }
    for (const value of [
      'invalid',
      'javascript:alert(1)',
      'https://user:pass@example.com',
      'https://app.example.com/login',
      'https://app.example.com/?key=secret',
      'http://app.example.com',
      Array.from({ length: 21 }, (_, i) => `https://app${i}.example`).join('\n'),
    ]) {
      websites.setValue(value);
      expect(websites.invalid, value).toBe(true);
    }
  });

  it('creates the exact submission payload and normalizes multiple websites', async () => {
    const { component } = await setup();
    component.form.patchValue({
      requestType: 'NEW_ACCESS',
      name: ' Synthetic Tester ',
      email: ' tester@example.com ',
      company: ' Acme Inc. ',
      website: 'https://app.example.com\nhttps://admin.example.com, https://staging.example.com',
      message: ' I want premium access for this package. ',
    });
    expect(component.payload()).toEqual({
      npmName: 'wts-data-table',
      name: 'Synthetic Tester',
      email: 'tester@example.com',
      company: 'Acme Inc.',
      website: 'https://app.example.com, https://admin.example.com, https://staging.example.com',
      message: 'I want premium access for this package.',
      requestType: 'NEW_ACCESS',
      period: 'ONE_MONTH',
    });
  });

  it('offers monthly and yearly billing and restores the monthly default when reopened', async () => {
    const { component, fixture } = await setup();
    component.open();
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('#request-period') as HTMLSelectElement;
    expect(select.labels?.[0].textContent).toBe('Billing cycle');
    expect(Array.from(select.options, (option) => [option.value, option.text])).toEqual([
      ['ONE_MONTH', 'Monthly'],
      ['ONE_YEAR', 'Yearly'],
    ]);
    expect(select.value).toBe('ONE_MONTH');
    select.value = 'ONE_YEAR';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(component.form.controls.period.value).toBe('ONE_YEAR');
    component.close();
    component.open('RENEWAL');
    fixture.detectChanges();
    expect(select.value).toBe('ONE_MONTH');
    expect(component.payload().period).toBe('ONE_MONTH');
  });

  it.each(['ONE_MONTH', 'ONE_YEAR'] as const)(
    'sends the selected %s cycle for pricing, access, and renewal requests',
    async (period) => {
      const { component, fixture } = await setup();
      const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
      vi.stubGlobal('fetch', fetcher);
      for (const requestType of ['PRICE_QUOTE', 'NEW_ACCESS', 'RENEWAL'] as const) {
        component.open(requestType);
        fixture.detectChanges();
        const select = fixture.nativeElement.querySelector('#request-period') as HTMLSelectElement;
        select.value = period;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        component.form.patchValue({
          name: 'Synthetic Tester',
          email: 'tester@example.com',
          message: 'Subscription inquiry.',
        });
        await component.submit();
        expect(component.submissionState()).toBe('success');
        expect(JSON.parse(fetcher.mock.lastCall![1].body)).toMatchObject({
          npmName: 'wts-data-table',
          period,
          requestType,
        });
        component.close();
      }
      expect(fetcher).toHaveBeenCalledTimes(3);
    },
  );

  it('does not ask for a framework or feature selection', async () => {
    const { fixture, component } = await setup();
    component.open();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#request-framework')).toBeNull();
    expect(fixture.nativeElement.querySelector('.request-features')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Primary framework');
    expect(fixture.nativeElement.textContent).not.toContain('What do you need?');
  });

  it('restores focus and clears personal details on native close (including Escape)', async () => {
    const { component, dialog } = await setup();
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    component.open();
    component.form.controls.email.setValue('tester@example.com');
    dialog.close();
    expect(document.activeElement).toBe(trigger);
    expect(component.form.controls.email.value).toBe('');
    trigger.remove();
  });

  it('opens the same dialog from both pricing and evaluation buttons', async () => {
    await TestBed.configureTestingModule({
      imports: [PricingPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PricingPage);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const show = mockDialog(dialog);
    (fixture.nativeElement.querySelector('.premium-plan button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(show).toHaveBeenCalledTimes(1);
    expect((dialog.querySelector('#request-type') as HTMLSelectElement).value).toBe('PRICE_QUOTE');
    dialog.close();
    (fixture.nativeElement.querySelector('#evaluation button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(show).toHaveBeenCalledTimes(2);
    expect((dialog.querySelector('#request-type') as HTMLSelectElement).value).toBe('NEW_ACCESS');
    dialog.close();
    (fixture.nativeElement.querySelector('#renewal button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(show).toHaveBeenCalledTimes(3);
    expect((dialog.querySelector('#request-type') as HTMLSelectElement).value).toBe('RENEWAL');
  });
});

describe('Request lifecycle protection', () => {
  function fill(component: LicenseRequestForm) {
    component.form.patchValue({
      name: 'Synthetic Tester',
      email: 'tester@example.com',
      message: 'Pricing inquiry.',
    });
  }

  it('does not submit a closed form', async () => {
    const { component } = await setup();
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    fill(component);
    await component.submit();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('prevents duplicate requests while pending and after success', async () => {
    const { component } = await setup();
    let finish!: (response: Response) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetcher);
    component.open();
    fill(component);
    const pending = component.submit();
    expect(component.form.disabled).toBe(true);
    await component.submit();
    expect(fetcher).toHaveBeenCalledTimes(1);
    finish(new Response(null, { status: 201 }));
    await pending;
    await component.submit();
    expect(fetcher).toHaveBeenCalledTimes(1);
    component.close();
    component.open();
    expect(component.form.enabled).toBe(true);
    expect(component.form.controls.name.value).toBe('');
  });

  it('aborts on close and ignores a late result after reopening', async () => {
    const { component, dialog } = await setup();
    let finish!: (response: Response) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetcher);
    component.open();
    fill(component);
    const pending = component.submit();
    const signal = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal!;
    component.close();
    expect(signal.aborted).toBe(true);
    component.open('RENEWAL');
    component.form.controls.name.setValue('New request');
    dialog.dispatchEvent(new Event('close')); // stale queued native event
    finish(new Response(null, { status: 201 }));
    await pending;
    expect(component.submissionState()).toBe('idle');
    expect(component.form.controls.requestType.value).toBe('RENEWAL');
    expect(component.form.controls.name.value).toBe('New request');
  });

  it('times out without claiming that the service did not receive the request', async () => {
    const { component } = await setup();
    vi.useFakeTimers();
    let finish!: (response: Response) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetcher);
    component.open();
    fill(component);
    const pending = component.submit();
    const signal = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal!;
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    expect(signal.aborted).toBe(true);
    expect(component.submissionState()).toBe('error');
    expect(component.submissionMessage()).toContain('may have arrived');
    expect(component.form.enabled).toBe(true);
    finish(new Response(null, { status: 201 }));
    await pending;
    expect(component.submissionState()).toBe('error');
  });

  it('aborts and clears its timeout on component destruction', async () => {
    const { component, fixture } = await setup();
    vi.useFakeTimers();
    const timerSpy = vi.spyOn(globalThis, 'setTimeout');
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    let finish!: (response: Response) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetcher);
    component.open();
    fill(component);
    const pending = component.submit();
    const signal = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal!;
    fixture.destroy();
    expect(signal.aborted).toBe(true);
    const timeoutIndex = timerSpy.mock.calls.findIndex((call) => call[1] === REQUEST_TIMEOUT_MS);
    expect(timeoutIndex).toBeGreaterThanOrEqual(0);
    expect(clearSpy).toHaveBeenCalledWith(timerSpy.mock.results[timeoutIndex].value);
    finish(new Response(null, { status: 201 }));
    await pending;
    expect(component.submissionState()).not.toBe('success');
  });

  it.each([
    [429, 'wait and try again'],
    [503, 'temporarily unavailable'],
    [400, 'could not confirm'],
  ])('reports HTTP %s and allows a corrected retry', async (status, message) => {
    const { component } = await setup();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetcher);
    component.open('RENEWAL');
    fill(component);
    await component.submit();
    expect(component.submissionState()).toBe('error');
    expect(component.submissionMessage()).toContain(message);
    expect(component.form.enabled).toBe(true);
    await component.submit();
    expect(component.submissionState()).toBe('success');
    expect(JSON.parse(fetcher.mock.calls[1][1].body).requestType).toBe('RENEWAL');
  });

  it('handles a network failure without losing entered details', async () => {
    const { component } = await setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network error')));
    component.open();
    fill(component);
    await component.submit();
    expect(component.submissionState()).toBe('error');
    expect(component.submissionMessage()).toContain('Check your connection and email');
    expect(component.form.controls.email.value).toBe('tester@example.com');
  });
});
