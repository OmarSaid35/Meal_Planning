import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
  {
    path: 'post',
    loadChildren: () =>
      import('./features/posts/posts-routing.module').then(
        (m) => m.PostsRoutingModule
      ),
  },
  {
    path: 'posts',
    loadChildren: () => import('./features/posts/posts.module').then(m => m.PostsModule),
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
