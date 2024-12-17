import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 
import { RecipeDiscoveryComponent } from './recipe-discovery.component';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule, RecipeDiscoveryComponent], 
})
export class DiscoveryModule {}