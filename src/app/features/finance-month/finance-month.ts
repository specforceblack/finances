import { Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { FinanceStoreService } from '../../core/finance-store.service';
import { FinanceSection } from '../../core/models';

@Component({
  selector: 'app-finance-month',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatIconModule, MatFormFieldModule, MatInputModule, BaseChartDirective],
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

  amountFor(categoryId: string): number {
    return this.month().entries.find((e) => e.categoryId === categoryId)?.amount ?? 0;
  }

  onAmountChange(categoryId: string, value: string): void {
    const amount = Math.max(0, Number(value) || 0);
    this.store.setEntryAmount(this.section(), this.monthKey(), categoryId, amount);
  }

  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: { legend: { display: false } },
  };

  readonly incomeChart = computed<ChartConfiguration<'doughnut'>['data']>(() => this.chartFor('income'));
  readonly expenseChart = computed<ChartConfiguration<'doughnut'>['data']>(() => this.chartFor('expense'));

  private chartFor(type: 'income' | 'expense'): ChartConfiguration<'doughnut'>['data'] {
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
