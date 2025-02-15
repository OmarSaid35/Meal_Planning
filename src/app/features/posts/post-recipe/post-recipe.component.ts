import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-post-recipe',
  templateUrl: './post-recipe.component.html',
  styleUrl: './post-recipe.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
})

export class PostRecipeComponent {
  title: string = '';
  instructions: string = '';
  isLoading: boolean = false;
  ingredients: string = ''; // Comma-separated ingredients
  imageFile: File | null = null; // File for image upload
  imageUrl: string = ''; // Uploaded image URL
  constructor(private http: HttpClient, private router: Router) {}

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
  
    this.http.post('http://localhost:3000/upload-image', formData).subscribe(
      (response: any) => {
        this.imageUrl = response.imageUrl;
        console.log('Image uploaded successfully:', this.imageUrl);
      },
      (error) => {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
      }
    );
  }
  
  
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadImage(file);
    }
  }

  // Submit the recipe
  onSubmit() {
    if (!this.title || !this.instructions) {
      alert('Title and instructions are required!');
      return;
    }

    this.isLoading = true;

    const recipeData = {
      title: this.title,
      instructions: this.instructions,
      ingredients: this.ingredients.split(',').map((ing) => ing.trim()), // Convert string to array
      imageUrl: this.imageUrl,
      authorId: localStorage.getItem('userId'), // Replace with actual user ID (if applicable)
    };

    this.http.post('http://localhost:3000/post-recipe', recipeData).subscribe(
      (response: any) => {
        console.log('Recipe posted successfully:', response);
        alert('Recipe posted successfully!');
        this.router.navigate(['/recipes']); // Redirect to recipe list or dashboard
      },
      (error) => {
        console.error('Error posting recipe:', error);
        alert('Failed to post the recipe. Please try again.');
      },
      () => {
        this.isLoading = false;
      }
    );
  }
  
}