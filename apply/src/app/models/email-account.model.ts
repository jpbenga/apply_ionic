export interface EmailAccount {
  emailAddress: string;
  provider: 'google'; // Or a more general string type if other providers are planned
  status: 'connected' | 'disconnected' | 'error'; // Example statuses
}
