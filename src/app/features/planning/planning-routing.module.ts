import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanningMealComponent } from './planning-meal/planning-meal.component'; // تأكد من الاستيراد هنا

const routes: Routes = [
  { path: 'meal-planning', component: PlanningMealComponent }, // استخدام المكون المستقل هنا
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningRoutingModule { }
