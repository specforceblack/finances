import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'actuals' },
  { path: 'actuals', loadComponent: () => import('./features/actuals/actuals').then((m) => m.Actuals) },
  { path: 'forecast', loadComponent: () => import('./features/forecast/forecast').then((m) => m.Forecast) },
  { path: 'settings', loadComponent: () => import('./features/settings/settings').then((m) => m.Settings) },
  { path: '**', redirectTo: 'actuals' },
];
