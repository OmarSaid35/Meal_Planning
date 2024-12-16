import { Routes } from '@angular/router';
import { PostRecipeComponent } from './features/posts/post-recipe/post-recipe.component';
import { RecipesComponent } from './features/posts/recipes/recipes.component';
import { BookmarkedComponent } from './features/posts/bookmarked/bookmarked.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication-routing.module').then(
        (m) => m.AuthenticationRoutingModule
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/myprofile/myprofile.component').then(
        (m) => m.MyprofileComponent
      ),
  },  { path: 'post-recipe', component: PostRecipeComponent },
  { path: 'recipes', component: RecipesComponent },  { path: 'bookmarked', component: BookmarkedComponent },
  { path: '', redirectTo: '/profile', pathMatch: 'full' }, // Default route
];
