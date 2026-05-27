import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { environment } from '../environments/environment';

type MonitoringContext = Record<string, unknown>;

function monitoringEnabled(): boolean {
  return Boolean(environment.errorMonitoring.enabled && environment.errorMonitoring.dsn);
}

export function initErrorMonitoring(): void {
  if (!monitoringEnabled()) return;

  Sentry.init({
    dsn: environment.errorMonitoring.dsn,
    environment: environment.errorMonitoring.environment,
    release: environment.errorMonitoring.release,
    tracesSampleRate: environment.errorMonitoring.tracesSampleRate,
    tracePropagationTargets: [environment.apiBaseUrl],
  });
}

export function setErrorMonitoringUserContext(username: string, role: string): void {
  if (!monitoringEnabled()) return;

  Sentry.setUser({ username, role });
  Sentry.setTag('role', role);
}

export function clearErrorMonitoringUserContext(): void {
  if (!monitoringEnabled()) return;
  Sentry.setUser(null);
}

export function captureClientError(error: unknown, context: MonitoringContext = {}): void {
  if (!monitoringEnabled()) return;

  Sentry.withScope((scope) => {
    for (const [key, value] of Object.entries(context)) {
      scope.setExtra(key, value);
    }
    Sentry.captureException(error);
  });
}

@Injectable()
export class GlobalErrorMonitoringHandler implements ErrorHandler {
  handleError(error: unknown): void {
    captureClientError(error, { source: 'angular-error-handler' });
    console.error(error);
  }
}
