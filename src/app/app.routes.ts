import { Routes } from '@angular/router';

import { LoginComponent } from './features/authentication/login/login.component';
import { RegisterComponent } from './features/authentication/register/register.component'; // Register page
import { RecipeDiscoveryComponent } from './features/discovery/recipe-discovery.component';

import { PostRecipeComponent } from './features/posts/post-recipe/post-recipe.component';
import { RecipesComponent } from './features/posts/recipes/recipes.component';
import { BookmarkedComponent } from './features/posts/bookmarked/bookmarked.component';
import { PlanningMealComponent } from './features/planning/planning-meal/planning-meal.component';

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Authentication routes
  { path: 'login', component: LoginComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // Discovery route
  { path: 'discover', component: RecipeDiscoveryComponent },

  // Post and Recipe routes
  { path: 'post-recipe', component: PostRecipeComponent },
  { path: 'recipes', component: RecipesComponent },
  { path: 'bookmarked', component: BookmarkedComponent },

  // Meal Planning routes
  {
    path: 'meal-planning',
    loadComponent: () =>
      import('./features/planning/planning-meal/planning-meal.component').then(
        (m) => m.PlanningMealComponent
      ),
  },
  { path: 'planning', component: PlanningMealComponent },

  // Lazy-loaded routes for Authentication
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication-routing.module').then(
        (m) => m.AuthenticationRoutingModule
      ),
  },

  // Lazy-loaded profile route
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/myprofile/myprofile.component').then(
        (m) => m.MyprofileComponent
      ),
  },
];