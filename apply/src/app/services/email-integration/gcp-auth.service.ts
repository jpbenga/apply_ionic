import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GcpAuthService {

  constructor() { }

  connectGoogleAccount(): Observable<any> {
    // Placeholder for Google OAuth 2.0 flow
    console.log('Connecting Google Account...');
    return of(null);
  }

  disconnectGoogleAccount(): Observable<any> {
    // Placeholder for disconnecting Google Account
    console.log('Disconnecting Google Account...');
    return of(null);
  }
}
