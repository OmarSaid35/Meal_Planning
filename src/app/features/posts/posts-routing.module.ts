import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostRecipeComponent } from './post-recipe/post-recipe.component';
import { AuthorProfileComponent } from '../profile/author-profile/author-profile.component';

const routes: Routes = [
  { path: 'post-recipe', component: PostRecipeComponent },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./recipes/recipes.component').then(m => m.RecipesComponent) // Import standalone component
  },
  { path: 'author-profile/:userId', component: AuthorProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostsRoutingModule { }
