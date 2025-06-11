import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';

export const redirectUnauthorizedToLoginGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router); // Inject Router
  return authState(auth).pipe(
    map(user => {
      if (user) {
        return true;
      } else {
        // Utiliser router.createUrlTree pour retourner un UrlTree
        return router.createUrlTree(['/login']);
      }
    })
  );
};
