import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal<boolean>(this.read());

  private read(): boolean {
    try {
      return localStorage.getItem('finances-theme') === 'dark';
    } catch {
      return false;
    }
  }

  init(): void {
    this.apply(this.dark());
  }

  toggle(): void {
    const next = !this.dark();
    this.dark.set(next);
    this.apply(next);
    try {
      localStorage.setItem('finances-theme', next ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }

  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('dark-theme', dark);
  }
}
