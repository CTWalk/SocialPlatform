import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Role, SessionService } from './session.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as Role[] | undefined;

  if (!allowedRoles?.length) {
    return true;
  }

  return allowedRoles.includes(session.activeRole()) ? true : router.parseUrl('/dashboard');
};
