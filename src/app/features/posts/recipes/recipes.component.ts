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
  userId: string = 'USER_ID'; 
  username: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || 'default_user_id';
    this.username = localStorage.getItem('username') || 'Guest'; 
    this.fetchAllRecipes();
    this.fetchRecipes();
  }

  fetchAllRecipes() {
    this.http.get('http://localhost:3000/recipes').subscribe(
      (response: any) => {
        console.log(response); 
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


  likeRecipe(postId: string) {
    this.http
      .post(`http://localhost:3000/like-recipe/${this.userId}/${postId}`, {})
      .subscribe(
        (response: any) => {
          const recipe = this.recipes.find((r) => r.postId === postId);
          if (recipe) {
            recipe.likes = response.updatedLikes; // Ensure real-time update
            console.log('Updated likes:', recipe.likes);
          } else {
            console.warn('Recipe not found locally:', postId);
          }
          alert(response.message);
        },
        (error) => {
          console.error('Error liking recipe:', error);
          alert(error.error.message || 'Failed to like recipe. Please try again.');
        }
      );
  }
  


  fetchRecipes() {
    this.http.get<any[]>('http://localhost:3000/get-comments').subscribe(
      (data) => {
        this.recipes = data;
      },
      (error) => {
        console.error('Error fetching recipes:', error);
      }
    );
  }


  addComment(postId: string, commentText: string) {
    const commentData = { 
      userId: this.userId, 
      comment: commentText, 
      username: this.username // Include username in the comment data
    };
  
    this.http.post(`http://localhost:3000/add-comment/${postId}`, commentData).subscribe(
      (response: any) => {
        alert(response.message);
        // Optionally update the comments list in the frontend after successful addition
        const recipe = this.recipes.find((r) => r.postId === postId);
        if (recipe) {
          recipe.comments.push({
            userId: this.userId, 
            comment: commentText,
            username: this.username // Add username to the new comment
          });
        }
      },
      (error) => {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
      }
    );
  }
  
}
