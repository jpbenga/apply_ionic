import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';

export const redirectLoggedInToHomeGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router); // Inject Router
  return authState(auth).pipe(
    map(user => {
      if (!user) {
        return true;
      } else {
        // Utiliser router.createUrlTree
        return router.createUrlTree(['/tabs/dashboard']);
      }
    })
  );
};
