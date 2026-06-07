import { CanActivateChildFn, CanActivateFn } from '@angular/router';

export const therapistRoleGuard: CanActivateFn & CanActivateChildFn = () => {
  // TODO: Confirm therapist/admin role before allowing panel access.
  return true;
};
