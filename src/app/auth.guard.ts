import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from './session.service';

export const authGuard: CanMatchFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (session.activeUser()) return true;
  return router.parseUrl('/');
};
