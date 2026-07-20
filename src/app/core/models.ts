export type EntryType = 'income' | 'expense';

export type FinanceSection = 'actuals' | 'forecast';

export interface Category {
  id: string;
  name: string;
  type: EntryType;
  color: string;
}

export interface Entry {
  id: string;
  name: string;
  categoryId: string;
  date: string; // 'YYYY-MM-DD'
  amount: number;
}

export interface MonthData {
  key: string; // 'YYYY-MM'
  entries: Entry[];
}

export interface HouseTarget {
  targetPrice: number;
  depositSaved: number;
  depositTargetPct: number;
  mortgageRateApr: number;
  termYears: number;
  maxComfortablePayment: number;
}

export interface FinanceState {
  version: 1;
  categories: Category[];
  actuals: Record<string, MonthData>;
  forecast: Record<string, MonthData>;
  houseTarget: HouseTarget;
}

export interface MonthTotals {
  income: number;
  expense: number;
  net: number;
}

export interface CategoryAmount {
  category: Category;
  amount: number;
}
