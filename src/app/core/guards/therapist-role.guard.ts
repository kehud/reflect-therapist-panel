import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/firebase/auth.service';

export const therapistRoleGuard: CanActivateFn & CanActivateChildFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.waitForSession();

  return authService.isTherapistOrAdmin() ? true : router.createUrlTree(['/login']);
};
