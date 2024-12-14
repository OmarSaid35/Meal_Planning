import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsRoutingModule } from './posts-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PostsRoutingModule // Import the routing module
  ],
})
export class PostsModule {}
