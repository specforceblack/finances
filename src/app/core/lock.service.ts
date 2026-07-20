import { Injectable, signal } from '@angular/core';

const HASH_KEY = 'finances-pin-hash';

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Lightweight client-side PIN gate. This is a deterrent against casual access on
 * a public static-site URL, not real security — the data itself never leaves the
 * browser, and anyone with the URL can view page source / clear localStorage to
 * bypass it. Do not rely on this for genuinely sensitive protection.
 */
@Injectable({ providedIn: 'root' })
export class LockService {
  readonly hasPin = signal<boolean>(!!this.readHash());
  readonly locked = signal<boolean>(this.hasPin());

  private readHash(): string | null {
    try {
      return localStorage.getItem(HASH_KEY);
    } catch {
      return null;
    }
  }

  async setup(pin: string): Promise<void> {
    const hash = await sha256(pin);
    try {
      localStorage.setItem(HASH_KEY, hash);
    } catch {
      /* ignore */
    }
    this.hasPin.set(true);
    this.locked.set(false);
  }

  async unlock(pin: string): Promise<boolean> {
    const hash = await sha256(pin);
    if (hash === this.readHash()) {
      this.locked.set(false);
      return true;
    }
    return false;
  }

  lock(): void {
    if (this.hasPin()) this.locked.set(true);
  }

  removePin(): void {
    try {
      localStorage.removeItem(HASH_KEY);
    } catch {
      /* ignore */
    }
    this.hasPin.set(false);
    this.locked.set(false);
  }
}
