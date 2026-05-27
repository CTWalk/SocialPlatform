import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { captureClientError } from './error-monitoring';

export const errorMonitoringInterceptor: HttpInterceptorFn = (req, next) => next(req).pipe(
  catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
      captureClientError(error, {
        source: 'http-interceptor',
        method: req.method,
        url: req.urlWithParams,
        status: error.status,
      });
    }

    return throwError(() => error);
  }),
);
