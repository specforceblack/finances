import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { LockService } from '../../core/lock.service';

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './lock-screen.html',
  styleUrl: './lock-screen.scss',
})
export class LockScreen {
  private readonly lock = inject(LockService);

  readonly pin = signal('');
  readonly error = signal(false);

  async submit(): Promise<void> {
    const ok = await this.lock.unlock(this.pin());
    this.error.set(!ok);
    this.pin.set('');
  }
}
