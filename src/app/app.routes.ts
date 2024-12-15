import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication-routing.module').then(
        (m) => m.AuthenticationRoutingModule
      ),
  },
  { path: '', redirectTo: '/auth/register', pathMatch: 'full' }, // Default route
];