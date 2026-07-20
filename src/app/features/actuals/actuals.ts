import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FinanceMonthComponent } from '../finance-month/finance-month';
import { monthKey, monthLabel, shiftMonthKey } from '../../core/util';

@Component({
  selector: 'app-actuals',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, FinanceMonthComponent],
  templateUrl: './actuals.html',
})
export class Actuals {
  readonly selectedMonth = signal(monthKey(new Date()));

  readonly monthLabel = monthLabel;

  prev(): void {
    this.selectedMonth.update((k) => shiftMonthKey(k, -1));
  }

  next(): void {
    this.selectedMonth.update((k) => shiftMonthKey(k, 1));
  }

  today(): void {
    this.selectedMonth.set(monthKey(new Date()));
  }
}
