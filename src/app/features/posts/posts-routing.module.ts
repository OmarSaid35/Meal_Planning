import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostRecipeComponent } from './post-recipe/post-recipe.component';


const routes: Routes = [
{path: 'post-recipe', component:PostRecipeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostsRoutingModule {}
