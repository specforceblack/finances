import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withHashLocation, withPreloading } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler } from 'chart.js';

import { routes } from './app.routes';

// Explicitly register the line-chart pieces — withDefaultRegisterables() should
// cover these, but registering directly avoids relying on registration order.
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation(), withPreloading(PreloadAllModules)),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
  ],
};
