import { Routes } from '@angular/router';
import { LoginComponent } from './features/authentication/login/login.component';
import { RecipeDiscoveryComponent } from './features/discovery/recipe-discovery.component';
import { RegisterComponent } from './features/authentication/register/register.component'; // Import Register Component

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Default route
  { path: 'login', component: LoginComponent },         // Login page
  { path: 'auth/login', component: LoginComponent },  
  { path: 'auth/register', component: RegisterComponent }, // Register page under "auth"
  { path: 'discover', component: RecipeDiscoveryComponent }, // Discovery page
];