import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Add this
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Import this

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule], // Include HttpClientModule
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  onLogin() {
    const userData = { email: this.email, password: this.password };
  
    this.http.post('http://localhost:3000/login', userData).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        alert('Welcome! You have successfully logged in.');
  
        // Adjust to use `username` from the API response
        const username = response.username; // Ensure this matches your API response key
        localStorage.setItem('username', username); // Store the username
        this.router.navigate(['/profile']); // Navigate to the profile page
      },
      (error) => {
        console.error('Login failed:', error);
        alert('Invalid credentials. Please try again.');
      }
    );
  }
  
}