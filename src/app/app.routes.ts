import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'post',
    loadChildren: () =>
      import('./features/posts/posts-routing.module').then(
        (m) => m.PostsRoutingModule
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

  { path: '', redirectTo: '/post/post-recipe', pathMatch: 'full' }, // Default route
];
