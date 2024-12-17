import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Handles HTTP requests
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../app/services/user.service';
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

  // Inject UserService and HttpClient
  constructor(
    private http: HttpClient,
    private userService: UserService, // Inject UserService
    private router: Router // Optional: For navigation after login
  ) {}

  onLogin() {
    // Call the backend API for login
    this.http.post('http://localhost:3000/login', { email: this.email, password: this.password })
      .subscribe(
        (response: any) => {
          console.log('Login successful', response);

          // Store user data for later use
          this.userService.setUser({
            id: response.userId || 'unknown',
            name: response.userName || this.email,
          });

          alert('Welcome back!');
          this.router.navigate(['/discover']);
        },
        (error) => {
          console.error('Login failed', error);
          alert('Invalid email or password. Please try again.');
        }
      );
  }
}