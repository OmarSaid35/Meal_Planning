import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { MyprofileComponent } from './myprofile/myprofile.component'; // Adjust the path if necessary
import { RouterModule } from '@angular/router'; // Import this!

@NgModule({
  declarations: [
    MyprofileComponent // Declare your component here
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    HttpClientModule, // Already added
    RouterModule
  ],
})
export class ProfileModule {}
