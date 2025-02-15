import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
})
export class RegisterComponent {
  username: string = ''; 
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords don't match.";
      return;
    }
  
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
    };
  
    this.http.post('http://localhost:3000/register', userData).subscribe(
      (response: any) => {
        console.log('Success Response:', response);
        this.errorMessage = ''; 
        alert('Registration successful! Redirecting to login.');
        this.router.navigate(['/auth/login']);
      },
      (error) => {
        console.error('Error Response:', error);

        this.errorMessage =
          error.error?.error || 'Registration failed. Please try again.';
      }
    );
  }
}