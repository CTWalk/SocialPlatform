import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from './session.service';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const session = inject(SessionService);
  const cloned = req.clone({
    setHeaders: {
      'x-role': session.activeRole(),
      'x-username': session.activeUser(),
      'x-session-id': session.sessionId(),
    },
  });
  return next(cloned);
};
