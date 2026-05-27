import { ErrorHandler } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/auth.interceptor';
import { errorMonitoringInterceptor } from './app/error-monitoring.interceptor';
import { GlobalErrorMonitoringHandler, initErrorMonitoring } from './app/error-monitoring';
import { environment } from './environments/environment';

initErrorMonitoring();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorMonitoringInterceptor])),
    provideServiceWorker('ngsw-worker.js', { enabled: environment.production }),
    { provide: ErrorHandler, useClass: GlobalErrorMonitoringHandler },
  ],
}).catch((err) => console.error(err));
