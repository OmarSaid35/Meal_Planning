import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bookmarked',
  templateUrl: './bookmarked.component.html',
  styleUrls: ['./bookmarked.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class BookmarkedComponent implements OnInit {
  bookmarkedPosts: any[] = [];
  userId: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || ''; // Retrieve userId from localStorage
    console.log('User ID:', this.userId); // Debugging to ensure userId is valid
    this.fetchBookmarkedPosts();
  }
  

  fetchBookmarkedPosts() {
    this.http.get(`http://localhost:3000/bookmarked/${this.userId}`).subscribe(
      (response: any) => {
        this.bookmarkedPosts = response;
      },
      (error) => {
        console.error('Error fetching bookmarked posts:', error);
        alert('Failed to fetch bookmarked posts. Please try again.');
      }
    );
  }
  unsavePost(postId: string) {
    console.log('Unsave Post:', postId, 'User ID:', this.userId); // Debugging IDs
    this.http.post(`http://localhost:3000/unsave-recipe/${this.userId}/${postId}`, {}).subscribe(
      (response: any) => {
        alert(response.message);
        // Remove the unsaved post from the local list
        this.bookmarkedPosts = this.bookmarkedPosts.filter((post) => post.postId !== postId);
      },
      (error) => {
        console.error('Error unsaving post:', error);
        alert('Failed to unsave post. Please try again.');
      }
    );
  }
  
  
}
