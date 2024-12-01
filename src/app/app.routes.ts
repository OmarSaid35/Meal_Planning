import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'auth', loadChildren: () => import('./features/authentication/authentication.module').then(m => m.AuthenticationModule) },
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    { path: 'profile', loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule) },
    { path: 'recipes', loadChildren: () => import('./features/posts/posts.module').then(m => m.PostsModule) },
    { path: 'discovery', loadChildren: () => import('./features/discovery/discovery.module').then(m => m.DiscoveryModule) },
    { path: 'planning', loadChildren: () => import('./features/planning/planning.module').then(m => m.PlanningModule) },
    { path: '', redirectTo: '/auth', pathMatch: 'full' },
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
  })
  export class AppRoutingModule {}
  
  
