import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-author-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './author-profile.component.html',
  styleUrls: ['./author-profile.component.css']
})
export class AuthorProfileComponent implements OnInit, OnDestroy {
  authorData: any = null;
  currentUserId: string = '';  // Track the logged-in user ID
  isFollowing: boolean = false; // Track if the user is following the author
  private subscription: Subscription = new Subscription(); // For unsubscribing from HTTP requests

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    this.currentUserId = localStorage.getItem('userId') || ''; // Assuming the logged-in user ID is stored in localStorage

    if (!userId) {
      console.error('No userId provided in the route!');
      return;
    }

    this.fetchAuthorProfile(userId);
  }

  fetchAuthorProfile(userId: string): void {
    const fetchSubscription = this.http.get(`http://localhost:3000/author-profile/${userId}`).subscribe(
      (response: any) => {
        this.authorData = response;
        this.isFollowing = response.followers.includes(this.currentUserId); // Check if the current user is following the author
      },
      (error) => {
        console.error('Error fetching profile:', error);
      }
    );
    this.subscription.add(fetchSubscription); // Add the subscription to manage it later
  }

  followUser(): void {
    const followUserId = this.route.snapshot.paramMap.get('userId'); // The user being followed
    const userId = this.currentUserId; // The logged-in user

    // Update the URL to include userId and followUserId in the path
    const url = `http://localhost:3000/follow/${userId}/${followUserId}`;

    // Send the request to follow the user
    this.http.post(url, {}).subscribe(
      (response: any) => {
        console.log('Followed successfully:', response);
        this.isFollowing = true;
        this.authorData.stats.followersCount++;
        this.authorData.followers.push(userId);
        //this.authorData.stats.followingCount++;
      },
      (error) => {
        console.error('Error following user:', error);
      }
    );
  }


  unfollowUser(): void {
    const followUserId = this.route.snapshot.paramMap.get('userId'); // The user being unfollowed
    const userId = this.currentUserId; // The logged-in user

    // Update the URL to include userId and followUserId in the path
    const url = `http://localhost:3000/unfollow/${userId}/${followUserId}`;

    // Send the request to unfollow the user
    this.http.post(url, {}).subscribe(
      (response: any) => {
        console.log('Unfollowed successfully:', response);
        this.isFollowing = false;
        this.authorData.stats.followersCount--;
        this.authorData.followers = this.authorData.followers.filter(
          (followerId: string) => followerId !== userId
        );
        //this.authorData.stats.followingCount--;
      },
      (error) => {
        console.error('Error unfollowing user:', error);
      }
    );
  }


  ngOnDestroy(): void {
    // Unsubscribe from all HTTP requests when the component is destroyed
    this.subscription.unsubscribe();
  }
}
