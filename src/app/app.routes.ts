import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'post',
    loadChildren: () =>
      import('./features/posts/posts-routing.module').then(
        (m) => m.PostsRoutingModule
      ),
  },
  { path: '', redirectTo: '/post/post-recipe', pathMatch: 'full' }, // Default route
];