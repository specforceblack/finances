import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { FinanceMonthComponent } from '../finance-month/finance-month';
import { FinanceStoreService } from '../../core/finance-store.service';
import { HouseTarget } from '../../core/models';
import { monthKey, monthLabel, shiftMonthKey } from '../../core/util';

const ROLLING_MONTHS = 12;

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    BaseChartDirective,
    FinanceMonthComponent,
  ],
  templateUrl: './forecast.html',
})
export class Forecast {
  private readonly store = inject(FinanceStoreService);

  readonly rollingMonths = Array.from({ length: ROLLING_MONTHS }, (_, i) => shiftMonthKey(monthKey(new Date()), i));

  readonly selectedIndex = signal(0);
  readonly selectedMonth = computed(() => this.rollingMonths[this.selectedIndex()]);
  readonly monthLabel = monthLabel;

  prev(): void {
    this.selectedIndex.update((i) => Math.max(0, i - 1));
  }

  next(): void {
    this.selectedIndex.update((i) => Math.min(this.rollingMonths.length - 1, i + 1));
  }

  copyFromActuals(): void {
    this.store.copyMonth('actuals', monthKey(new Date()), 'forecast', this.selectedMonth());
  }

  readonly houseTarget = this.store.houseTarget;

  updateTarget(field: keyof HouseTarget, value: string): void {
    const num = Number(value) || 0;
    this.store.updateHouseTarget({ [field]: num });
  }

  readonly monthlyNets = computed(() =>
    this.rollingMonths.map((key) => this.store.monthTotals(this.store.getMonth('forecast', key)).net),
  );

  readonly avgMonthlyNet = computed(() => {
    const nets = this.monthlyNets();
    const sum = nets.reduce((a, b) => a + b, 0);
    return nets.length ? sum / nets.length : 0;
  });

  readonly cumulativeChart = computed<ChartConfiguration<'line'>['data']>(() => {
    let running = 0;
    const data = this.monthlyNets().map((n) => (running += n));
    return {
      labels: this.rollingMonths.map((k) => monthLabel(k).split(' ')[0]),
      datasets: [
        {
          label: 'Cumulative projected savings',
          data,
          borderColor: '#2f9c5a',
          backgroundColor: 'rgba(47,156,90,0.15)',
          fill: true,
          tension: 0.25,
          pointRadius: 2,
        },
      ],
    };
  });

  readonly cumulativeOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  readonly requiredDeposit = computed(() => this.houseTarget().targetPrice * (this.houseTarget().depositTargetPct / 100));
  readonly depositShortfall = computed(() => Math.max(0, this.requiredDeposit() - this.houseTarget().depositSaved));
  readonly monthsToTarget = computed(() => {
    const net = this.avgMonthlyNet();
    if (net <= 0) return null;
    return Math.ceil(this.depositShortfall() / net);
  });

  readonly loanAmount = computed(() => Math.max(0, this.houseTarget().targetPrice - this.requiredDeposit()));

  readonly monthlyMortgage = computed(() => {
    const loan = this.loanAmount();
    const r = this.houseTarget().mortgageRateApr / 100 / 12;
    const n = this.houseTarget().termYears * 12;
    if (loan <= 0 || n <= 0) return 0;
    if (r === 0) return loan / n;
    const factor = Math.pow(1 + r, n);
    return (loan * r * factor) / (factor - 1);
  });

  readonly affordable = computed(() => {
    const cap = this.houseTarget().maxComfortablePayment;
    if (cap > 0) return this.monthlyMortgage() <= cap;
    return this.monthlyMortgage() <= this.avgMonthlyNet();
  });
}
