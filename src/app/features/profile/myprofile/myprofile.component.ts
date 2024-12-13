import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css'],
})
export class MyprofileComponent implements OnInit {
  username: string | null = '';

  ngOnInit() {
    this.username = localStorage.getItem('username'); // Fetch the user's name
  }
}
