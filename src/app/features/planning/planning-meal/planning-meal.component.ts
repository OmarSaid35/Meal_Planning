import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-planning-meal',
  templateUrl: './planning-meal.component.html',
  styleUrls: ['./planning-meal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PlanningMealComponent {
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  mealTypes: { [key: string]: string } = {};
  selectedRecipe: { [key: string]: any } = {};
  selectedMeals: { [key: string]: { recipe: any; type: string }[] } = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  // قائمة الوصفات مع الوصف
  recipes = [
    { name: 'Classic Spaghetti Carbonara', description: 'Boil spaghetti, cook pancetta, mix eggs with cheese, and combine.' },
    { name: 'Grilled Chicken Salad', description: 'Grill chicken, chop veggies, and mix with olive oil.' },
    { name: 'Margherita Pizza', description: 'Spread sauce, add mozzarella, bake in oven, and top with basil.' },
    { name: 'Beef Stroganoff', description: 'Cook beef, sauté mushrooms and onions, mix with sour cream, serve with noodles.' },
    { name: 'Vegetable Stir Fry', description: 'Stir fry veggies and tofu in soy sauce until tender.' },
    { name: 'Chicken Parmesan', description: 'Bread chicken, fry it, top with sauce and mozzarella, and bake.' },
    { name: 'Avocado Toast', description: 'Toast bread, mash avocado, top with cherry tomatoes and drizzle with oil.' },
    { name: 'Fish Tacos', description: 'Grill fish, prepare slaw, assemble tacos with lime and mayo.' },
    { name: 'Pancakes with Syrup', description: 'Prepare batter, cook pancakes on a skillet, serve with maple syrup.' },
    { name: 'Shrimp Scampi', description: 'Sauté shrimp in garlic and butter, mix with lemon juice and spaghetti.' },
    { name: 'Chicken Alfredo', description: 'A creamy pasta dish with chicken and Alfredo sauce.' },
    { name: 'Moussaka', description: 'A classic Greek casserole with layers of eggplant and meat.' },
    { name: 'Crispy Chicken Tenders', description: 'Fried chicken strips, perfect for dipping.' },
    { name: 'Vegetable Samosas', description: 'Crispy pastries filled with spiced vegetables.' },
    { name: 'Pasta Primavera', description: 'A light pasta dish with fresh vegetables and herbs.' },
  ];

  constructor() {
    this.days.forEach((day) => {
      this.mealTypes[day] = 'Breakfast'; // النوع الافتراضي
      this.selectedRecipe[day] = null; // الوصفة الافتراضية
    });
  }

  // إضافة وجبة
  addMeal(day: string) {
    const recipe = this.selectedRecipe[day];
    const type = this.mealTypes[day];

    // تحقق من صحة القيم المدخلة
    if (recipe && type) {
      this.selectedMeals[day].push({ recipe, type }); // أضف الوصفة مع النوع والوصف
      this.selectedRecipe[day] = this.recipes[0];// إعادة تعيين الوصفة بعد الإضافة
    } else {
      console.error('Recipe or type is not selected.');
    }
  }

  // إزالة وجبة
  removeMeal(day: string, meal: { recipe: any; type: string }) {
    const index = this.selectedMeals[day].indexOf(meal);
    if (index !== -1) {
      this.selectedMeals[day].splice(index, 1); // حذف الوجبة
    }
  }
}
