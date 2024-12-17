import { Routes, RouterModule } from '@angular/router';
import { PostRecipeComponent } from './features/posts/post-recipe/post-recipe.component';
import { RecipesComponent } from './features/posts/recipes/recipes.component';
import { BookmarkedComponent } from './features/posts/bookmarked/bookmarked.component';
import { PlanningMealComponent } from './features/planning/planning-meal/planning-meal.component';
import { AuthorProfileComponent } from './features/profile/author-profile/author-profile.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
  {
    path: 'posts',
    loadChildren: () =>
      import('./features/posts/posts.module').then((m) => m.PostsModule),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/myprofile/myprofile.component').then(
        (m) => m.MyprofileComponent
      ),
  },
  { path: 'recipes', component: RecipesComponent },
  { path: 'post-recipe', component: PostRecipeComponent },
  { path: 'bookmarked', component: BookmarkedComponent },
  { path: 'author-profile/:userId', component: AuthorProfileComponent },
  { path: '', redirectTo: '/auth/register', pathMatch: 'full' },
];






