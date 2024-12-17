import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Import routes from app.routes.ts

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)], // Use routes from app.routes.ts
}).catch((err) => console.error(err));