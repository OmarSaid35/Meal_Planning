import { Routes } from '@angular/router';
import { PlanningMealComponent } from './features/planning/planning-meal/planning-meal.component'; // تأكد من استيراد المكون بشكل صحيح

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/myprofile/myprofile.component').then(
        (m) => m.MyprofileComponent
      ),
  },
  { path: '', redirectTo: '/auth/register', pathMatch: 'full' }, // Default route

  {
    path: 'meal-planning',
    loadComponent: () =>
      import('./features/planning/planning-meal/planning-meal.component').then(
        (m) => m.PlanningMealComponent
      ),
  },
  {
    path: 'planning',
    component: PlanningMealComponent,
  },
  { path: '', redirectTo: '/planning', pathMatch: 'full' }, // تأكد من أن هذه المسار هو المسار الافتراضي
];






