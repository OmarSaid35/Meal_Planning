import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanningMealComponent } from './planning-meal/planning-meal.component'; 

const routes: Routes = [
  { path: 'meal-planning', component: PlanningMealComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningRoutingModule { }
