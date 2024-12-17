import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: any = null;

  setUser(user: any) {
    this.user = user;
    localStorage.setItem('loggedInUser', JSON.stringify(user)); // Persist user in localStorage
  }

  getUser() {
    if (!this.user) {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        this.user = JSON.parse(storedUser); // Retrieve user from localStorage
      }
    }
    return this.user;
  }

  clearUser() {
    this.user = null;
    localStorage.removeItem('loggedInUser'); // Clear user from localStorage
  }
}