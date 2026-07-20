import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FinanceStoreService } from '../../core/finance-store.service';
import { LockService } from '../../core/lock.service';
import { EntryType } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly store = inject(FinanceStoreService);
  readonly lock = inject(LockService);

  readonly categories = this.store.categories;

  readonly newName = signal('');
  readonly newType = signal<EntryType>('expense');

  rename(id: string, name: string): void {
    if (name.trim()) this.store.updateCategory(id, { name: name.trim() });
  }

  setType(id: string, type: EntryType): void {
    this.store.updateCategory(id, { type });
  }

  setColor(id: string, color: string): void {
    this.store.updateCategory(id, { color });
  }

  remove(id: string): void {
    this.store.removeCategory(id);
  }

  add(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.store.addCategory(name, this.newType());
    this.newName.set('');
  }

  // --- PIN lock -----------------------------------------------------------

  readonly pin1 = signal('');
  readonly pin2 = signal('');
  readonly pinError = signal('');

  async savePin(): Promise<void> {
    if (this.pin1().length < 4) {
      this.pinError.set('PIN must be at least 4 digits');
      return;
    }
    if (this.pin1() !== this.pin2()) {
      this.pinError.set("PINs don't match");
      return;
    }
    await this.lock.setup(this.pin1());
    this.pin1.set('');
    this.pin2.set('');
    this.pinError.set('');
  }

  removePin(): void {
    this.lock.removePin();
  }

  // --- Export / import ------------------------------------------------------

  exportData(): void {
    const blob = new Blob([this.store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finances-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  readonly importError = signal('');

  async onImportFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      this.store.importJson(text);
      this.importError.set('');
    } catch (err) {
      this.importError.set(err instanceof Error ? err.message : 'Could not read that file');
    }
    (event.target as HTMLInputElement).value = '';
  }
}
