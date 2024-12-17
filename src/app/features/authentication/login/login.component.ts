import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../app/services/user.service';
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule], 
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router
  ) {}

  onLogin() {
    const userData = { email: this.email, password: this.password };

    this.http.post('http://localhost:3000/login', userData).subscribe(
      (response: any) => {
        console.log('API Response:', response);

        if (response && response.username) {

          this.userService.setUser({
            id: response.userId || 'unknown',
            name: response.username,
            email: response.email,
            profilePic: response.profilePic || '',
          });

          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('email', response.email);
          localStorage.setItem('profilePic', response.profilePic || '');

          alert('Welcome back!');
          this.router.navigate(['/discover']); 
        } else {
          alert('Login response did not contain expected data.');
        }
      },
      (error) => {
        console.error('Login failed:', error);
        alert('Invalid email or password. Please try again.');
      }
    );
  }
}