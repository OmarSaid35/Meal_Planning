import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css'],
})
export class MyprofileComponent implements OnInit {
  username: string = localStorage.getItem('username') || 'Guest';
  email: string = localStorage.getItem('email') || 'Not available';
  profilePic: string = localStorage.getItem('profilePic') || '';

  // Default background image URL
  backgroundImage: string = `url(${this.profilePic})`;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  followersCount: number = 0;
  followingCount: number = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const userId = this.getLoggedInUserId(); // Replace with the actual method to get the logged-in user's ID
    this.fetchUserStats(userId);
  }

  // Method to trigger the file input click event
  triggerFileInput() {
    this.fileInput.nativeElement.click(); // Trigger the click on file input
  }

  // Method to handle the selected file and change the background image
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.backgroundImage = `url(${reader.result})`; // Set the background image to the selected file
      };
      reader.readAsDataURL(file);

      // Send the file to the backend to update the profile picture in Firestore
      const formData = new FormData();
      formData.append('profilePic', file);

      const userId = this.getLoggedInUserId();
      this.http.post('http://localhost:3000/uploadProfilePic/${userId}', formData).subscribe(
        (response: any) => {
          console.log('Profile picture updated successfully', response);
          // Update localStorage with the new profile picture URL
          localStorage.setItem('profilePic', response.profilePic);
        },
        (error) => {
          console.error('Error updating profile picture', error);
          alert('Failed to update profile picture');
        }
      );
    }
  }

  fetchUserStats(userId: string) {
    this.http.get(`http://localhost:3000/userStats/${userId}`).subscribe({
      next: (response: any) => {
        this.followersCount = response.followersCount;
        this.followingCount = response.followingCount;
      },
      error: (error) => {
        console.error('Error fetching user stats:', error);
      },
    });
  }

  getLoggedInUserId(): string {
    // Mock example - Replace this with the actual logic to get the logged-in user's ID
    return localStorage.getItem('userId') || '';
  }
}