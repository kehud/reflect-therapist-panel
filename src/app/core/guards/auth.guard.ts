import { CanActivateChildFn, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn & CanActivateChildFn = () => {
  // TODO: Check Firebase auth state before allowing protected routes.
  return true;
};
