import { Routes } from '@angular/router';
import { PostRecipeComponent } from './features/posts/post-recipe/post-recipe.component';
import { RecipesComponent } from './features/posts/recipes/recipes.component';
import { BookmarkedComponent } from './features/posts/bookmarked/bookmarked.component';
import { PlanningMealComponent } from './features/planning/planning-meal/planning-meal.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
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
  {
    path: 'post',
    loadChildren: () =>
      import('./features/authentication/authentication-routing.module').then(
        (m) => m.AuthenticationRoutingModule
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
  { path: 'post-recipe', component: PostRecipeComponent },
  { path: 'recipes', component: RecipesComponent }, { path: 'bookmarked', component: BookmarkedComponent }, // Default route
  { path: '', redirectTo: '/auth/register', pathMatch: 'full' }, // Default route
  { path: '', redirectTo: '/post/post-recipe', pathMatch: 'full' }, // Default route
];






