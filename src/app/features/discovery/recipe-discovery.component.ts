import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { UserService } from '../../../app/services/user.service'; // Import UserService

@Component({
  selector: 'app-recipe-discovery',
  standalone: true, // Ensure this is a standalone component
  imports: [CommonModule, FormsModule, HttpClientModule], // Import necessary modules
  templateUrl: './recipe-discovery.component.html',
  styleUrls: ['./recipe-discovery.component.css'],
})
export class RecipeDiscoveryComponent {
  recipes = [
    {
      id: '1',
      name: 'Classic Spaghetti Carbonara',
      cuisine: 'Italian',
      ingredients: 'Spaghetti, eggs, pancetta, Parmesan cheese, black pepper.',
      steps: 'Boil spaghetti, cook pancetta, mix eggs with cheese, and combine.',
      nutrition: 'Calories: 400, Protein: 18g, Fat: 12g.',
      image: 'assets/carbonara.jpg',
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      cuisine: 'American',
      ingredients: 'Grilled chicken, lettuce, cherry tomatoes, cucumber, olive oil.',
      steps: 'Grill chicken, chop veggies, and mix with olive oil.',
      nutrition: 'Calories: 350, Protein: 22g, Fat: 10g.',
      image: 'assets/salad.jpg',
    },
    {
      id: '3',
      name: 'Margherita Pizza',
      cuisine: 'Italian',
      ingredients: 'Pizza dough, tomato sauce, mozzarella, fresh basil.',
      steps: 'Spread sauce, add mozzarella, bake in oven, and top with basil.',
      nutrition: 'Calories: 300, Protein: 14g, Carbs: 32g.',
      image: 'assets/pizza.jpg',
    },
    {
      id: '4',
      name: 'Beef Stroganoff',
      cuisine: 'Russian',
      ingredients: 'Beef strips, mushrooms, onions, sour cream, egg noodles.',
      steps: 'Cook beef, sauté mushrooms and onions, mix with sour cream, serve with noodles.',
      nutrition: 'Calories: 500, Protein: 25g, Fat: 15g.',
      image: 'assets/beef-stroganoff.jpg',
    },
    {
      id: '5',
      name: 'Vegetable Stir Fry',
      cuisine: 'Asian',
      ingredients: 'Broccoli, carrots, bell peppers, soy sauce, tofu.',
      steps: 'Stir fry veggies and tofu in soy sauce until tender.',
      nutrition: 'Calories: 250, Protein: 10g, Carbs: 30g.',
      image: 'assets/stir-fry.jpg',
    },
    {
      id: '6',
      name: 'Chicken Parmesan',
      cuisine: 'Italian',
      ingredients: 'Chicken breast, breadcrumbs, tomato sauce, mozzarella cheese.',
      steps: 'Bread chicken, fry it, top with sauce and mozzarella, and bake.',
      nutrition: 'Calories: 480, Protein: 30g, Fat: 18g.',
      image: 'assets/chicken-parmesan.jpg',
    },
    {
      id: '7',
      name: 'Avocado Toast',
      cuisine: 'American',
      ingredients: 'Whole grain bread, ripe avocado, cherry tomatoes, olive oil.',
      steps: 'Toast bread, mash avocado, top with cherry tomatoes and drizzle with oil.',
      nutrition: 'Calories: 220, Protein: 6g, Carbs: 28g.',
      image: 'assets/avocado-toast.jpg',
    },
    {
      id: '8',
      name: 'Fish Tacos',
      cuisine: 'Mexican',
      ingredients: 'Fish fillets, tortillas, cabbage slaw, lime, mayo.',
      steps: 'Grill fish, prepare slaw, assemble tacos with lime and mayo.',
      nutrition: 'Calories: 300, Protein: 20g, Fat: 8g.',
      image: 'assets/fish-tacos.jpg',
    },
    {
      id: '9',
      name: 'Pancakes with Syrup',
      cuisine: 'American',
      ingredients: 'Flour, eggs, milk, baking powder, maple syrup.',
      steps: 'Prepare batter, cook pancakes on a skillet, serve with maple syrup.',
      nutrition: 'Calories: 350, Carbs: 50g, Protein: 8g.',
      image: 'assets/pancakes.jpg',
    },
    {
      id: '10',
      name: 'Shrimp Scampi',
      cuisine: 'Italian',
      ingredients: 'Shrimp, garlic, butter, lemon juice, spaghetti.',
      steps: 'Sauté shrimp in garlic and butter, mix with lemon juice and spaghetti.',
      nutrition: 'Calories: 380, Protein: 22g, Fat: 15g.',
      image: 'assets/shrimp-scampi.jpg',
    },
  ];

  rating: number = 0;   // Holds the selected star rating
  opinion: string = ''; // Holds the user's opinion text
  searchQuery: string = '';
  selectedCuisine: string = '';
  cuisines: string[] = [];
  filteredRecipes = [...this.recipes];
  showReviewForm = false;
  showReviews = false;
  selectedRecipe: any = null;

  currentRecipeId: string = ''; // Add missing property
  loggedInUser: any = null;     // Holds logged-in user data
  selectedRating: number = 0;   // User's star rating
  reviewOpinion: string = '';   // User's review opinion
  reviews: any[] = [];          // Holds fetched reviews

  constructor(private http: HttpClient, private userService: UserService) {
    this.cuisines = this.getUniqueCuisines();
  }

  ngOnInit() {
    // Fetch logged-in user from UserService
    this.loggedInUser = this.userService.getUser();
  
    if (!this.loggedInUser) {
      console.error('No user is logged in. Redirecting to login.');
      alert('Please log in to continue.'); // Notify user
      // Optionally, redirect to login page
      window.location.href = '/login';
    }
  }

  getUniqueCuisines(): string[] {
    return [...new Set(this.recipes.map((recipe) => recipe.cuisine))];
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredRecipes = this.recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(query) &&
        (this.selectedCuisine === '' || recipe.cuisine === this.selectedCuisine)
    );
  }

  closeModal() {
    this.showReviewForm = false;
    this.showReviews = false;
  }

  onSelectCuisine(cuisine: string): void {
    this.selectedCuisine = cuisine;
    this.onSearch();
  }

  resetCuisine(): void {
    this.selectedCuisine = '';
    this.onSearch();
  }

  onRate(recipe: any) {
    console.log('Rate button clicked for:', recipe.name);
    this.selectedRecipe = recipe;
    this.currentRecipeId = recipe.id; // Set current recipe ID
    this.showReviewForm = true;
    this.showReviews = false;
  }

  submitReview() {
  const review = {
    recipeId: this.selectedRecipe.id, // Correct recipe ID
    userId: this.userService.getUser()?.id, // Ensure user ID is retrieved correctly
    userName: this.userService.getUser()?.name, // Ensure user name is retrieved
    rating: this.rating,
    opinion: this.opinion,
  };

  console.log('Submitting review:', review); // Log payload before sending

  this.http.post('http://localhost:3000/add-review', review).subscribe(
    (response) => {
      console.log('Review submitted:', response);
      alert('Your review has been submitted!');
      this.closeModal();
    },
    (error) => {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  );
}

onViewReviews(recipe: any) {
  console.log('View Reviews button clicked for:', recipe.name);
  this.selectedRecipe = recipe;
  this.showReviews = true;
  this.showReviewForm = false;

  this.http
    .get(`http://localhost:3000/get-reviews/${recipe.id}`)
    .subscribe(
      (data: any) => {
        console.log('Reviews fetched:', data);
        this.reviews = data; // Set fetched reviews to the local variable
      },
      (error) => {
        console.error('Error fetching reviews:', error);
        alert('Failed to fetch reviews. Please try again.');
      }
    );
}
}