import { Injectable, computed, effect, signal } from '@angular/core';
import {
  Category,
  CategoryAmount,
  Entry,
  FinanceSection,
  FinanceState,
  MonthData,
  MonthTotals,
} from './models';
import { colorForIndex } from './util';

const STORAGE_KEY = 'finances-app-state-v1';

function defaultState(): FinanceState {
  const names: [string, Category['type']][] = [
    ['Salary', 'income'],
    ['Other income', 'income'],
    ['Housing', 'expense'],
    ['Utilities', 'expense'],
    ['Groceries', 'expense'],
    ['Transport', 'expense'],
    ['Insurance', 'expense'],
    ['Subscriptions', 'expense'],
    ['Savings & investments', 'expense'],
    ['Leisure', 'expense'],
    ['Other', 'expense'],
  ];
  return {
    version: 1,
    categories: names.map(([name, type], i) => ({
      id: crypto.randomUUID(),
      name,
      type,
      color: colorForIndex(i),
    })),
    actuals: {},
    forecast: {},
    houseTarget: {
      targetPrice: 0,
      depositSaved: 0,
      depositTargetPct: 10,
      mortgageRateApr: 4.5,
      termYears: 25,
      maxComfortablePayment: 0,
    },
  };
}

function emptyMonth(key: string): MonthData {
  return { key, entries: [] };
}

@Injectable({ providedIn: 'root' })
export class FinanceStoreService {
  readonly state = signal<FinanceState>(this.load());

  readonly categories = computed(() => this.state().categories);
  readonly houseTarget = computed(() => this.state().houseTarget);

  constructor() {
    effect(() => {
      const value = this.state();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {
        /* storage unavailable (private browsing, quota) — edits stay in-memory for the session */
      }
    });
  }

  private load(): FinanceState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultState(), ...JSON.parse(raw) };
    } catch {
      /* fall through to defaults */
    }
    return defaultState();
  }

  getMonth(section: FinanceSection, key: string): MonthData {
    return this.state()[section][key] ?? emptyMonth(key);
  }

  setEntryAmount(section: FinanceSection, monthKey: string, categoryId: string, amount: number): void {
    this.state.update((s) => {
      const month = s[section][monthKey] ?? emptyMonth(monthKey);
      const entries = month.entries.filter((e) => e.categoryId !== categoryId);
      entries.push({ categoryId, amount });
      return { ...s, [section]: { ...s[section], [monthKey]: { key: monthKey, entries } } };
    });
  }

  copyMonth(fromSection: FinanceSection, fromKey: string, toSection: FinanceSection, toKey: string): void {
    const from = this.getMonth(fromSection, fromKey);
    if (!from.entries.length) return;
    this.state.update((s) => ({
      ...s,
      [toSection]: { ...s[toSection], [toKey]: { key: toKey, entries: from.entries.map((e) => ({ ...e })) } },
    }));
  }

  addCategory(name: string, type: Category['type']): void {
    this.state.update((s) => ({
      ...s,
      categories: [...s.categories, { id: crypto.randomUUID(), name, type, color: colorForIndex(s.categories.length) }],
    }));
  }

  updateCategory(id: string, patch: Partial<Pick<Category, 'name' | 'type' | 'color'>>): void {
    this.state.update((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  removeCategory(id: string): void {
    this.state.update((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }

  updateHouseTarget(patch: Partial<FinanceState['houseTarget']>): void {
    this.state.update((s) => ({ ...s, houseTarget: { ...s.houseTarget, ...patch } }));
  }

  monthTotals(month: MonthData): MonthTotals {
    const byId = new Map(this.categories().map((c) => [c.id, c]));
    let income = 0;
    let expense = 0;
    for (const e of month.entries) {
      const cat = byId.get(e.categoryId);
      if (!cat) continue;
      if (cat.type === 'income') income += e.amount;
      else expense += e.amount;
    }
    return { income, expense, net: income - expense };
  }

  categoryAmounts(month: MonthData, type: Category['type']): CategoryAmount[] {
    const byId = new Map(this.categories().map((c) => [c.id, c]));
    return month.entries
      .filter((e) => e.amount > 0 && byId.get(e.categoryId)?.type === type)
      .map((e) => ({ category: byId.get(e.categoryId)!, amount: e.amount }));
  }

  exportJson(): string {
    return JSON.stringify(this.state(), null, 2);
  }

  importJson(json: string): void {
    const parsed = JSON.parse(json) as FinanceState;
    if (!parsed || !Array.isArray(parsed.categories)) throw new Error('Not a valid finances export file');
    this.state.set({ ...defaultState(), ...parsed });
  }
}
