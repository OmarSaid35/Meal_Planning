import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class RecipesComponent implements OnInit {
  recipes: any[] = [];
  userId: string = 'USER_ID'; // Replace this with the logged-in user's ID

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Replace 'USER_ID' with the actual user ID after login
    this.userId = localStorage.getItem('userId') || 'default_user_id'; // Example to fetch user ID
    console.log('User ID:', this.userId); // Debug user ID
    this.fetchAllRecipes();
  }

  fetchAllRecipes() {
    this.http.get('http://localhost:3000/recipes').subscribe(
      (response: any) => {
        console.log(response); // Check if 'postId' exists in the recipe object
        this.recipes = response;
      },
      (error) => {
        console.error('Error fetching recipes:', error);
        alert('Failed to fetch recipes. Please try again.');
      }
    );
  }
  
  saveRecipe(postId: string) {
    this.http
      .post(`http://localhost:3000/save-recipe/${this.userId}/${postId}`, {})
      .subscribe(
        (response: any) => {
          alert(response.message);
        },
        (error) => {
          console.error('Error saving recipe:', error);
          alert('Failed to save recipe. Please try again.');
        }
      );
  }
}
