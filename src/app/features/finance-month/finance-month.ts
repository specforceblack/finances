import { Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { FinanceStoreService } from '../../core/finance-store.service';
import { Entry, EntryType, FinanceSection } from '../../core/models';
import { defaultEntryDate } from '../../core/util';

@Component({
  selector: 'app-finance-month',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    BaseChartDirective,
  ],
  templateUrl: './finance-month.html',
  styleUrl: './finance-month.scss',
})
export class FinanceMonthComponent {
  private readonly store = inject(FinanceStoreService);

  readonly section = input.required<FinanceSection>();
  readonly monthKey = input.required<string>();

  readonly month = computed(() => this.store.getMonth(this.section(), this.monthKey()));
  readonly totals = computed(() => this.store.monthTotals(this.month()));

  readonly incomeCategories = computed(() => this.store.categories().filter((c) => c.type === 'income'));
  readonly expenseCategories = computed(() => this.store.categories().filter((c) => c.type === 'expense'));

  private entriesOfType(type: EntryType): Entry[] {
    const catIds = new Set(this.store.categories().filter((c) => c.type === type).map((c) => c.id));
    return this.month()
      .entries.filter((e) => catIds.has(e.categoryId))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  readonly incomeEntries = computed(() => this.entriesOfType('income'));
  readonly expenseEntries = computed(() => this.entriesOfType('expense'));

  categoryName(categoryId: string): string {
    return this.store.categories().find((c) => c.id === categoryId)?.name ?? '';
  }

  addEntry(type: EntryType): void {
    const categories = type === 'income' ? this.incomeCategories() : this.expenseCategories();
    if (!categories.length) return;
    this.store.addEntry(this.section(), this.monthKey(), {
      name: '',
      categoryId: categories[0].id,
      date: defaultEntryDate(this.monthKey()),
      amount: 0,
    });
  }

  updateEntryName(id: string, name: string): void {
    this.store.updateEntry(this.section(), this.monthKey(), id, { name });
  }

  updateEntryCategory(id: string, categoryId: string): void {
    this.store.updateEntry(this.section(), this.monthKey(), id, { categoryId });
  }

  updateEntryDate(id: string, date: string): void {
    this.store.updateEntry(this.section(), this.monthKey(), id, { date });
  }

  updateEntryAmount(id: string, value: string): void {
    this.store.updateEntry(this.section(), this.monthKey(), id, { amount: Math.max(0, Number(value) || 0) });
  }

  removeEntry(id: string): void {
    this.store.removeEntry(this.section(), this.monthKey(), id);
  }

  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: { legend: { display: false } },
  };

  readonly incomeChart = computed<ChartConfiguration<'doughnut'>['data']>(() => this.chartFor('income'));
  readonly expenseChart = computed<ChartConfiguration<'doughnut'>['data']>(() => this.chartFor('expense'));

  private chartFor(type: EntryType): ChartConfiguration<'doughnut'>['data'] {
    const amounts = this.store.categoryAmounts(this.month(), type);
    return {
      labels: amounts.map((a) => a.category.name),
      datasets: [
        {
          data: amounts.map((a) => a.amount),
          backgroundColor: amounts.map((a) => a.category.color),
          borderWidth: 0,
        },
      ],
    };
  }
}
