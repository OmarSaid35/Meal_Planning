import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningRoutingModule } from './planning-routing.module';
import { FormsModule } from '@angular/forms';  


import { PlanningMealComponent } from './planning-meal/planning-meal.component';

@NgModule({
  imports: [
    CommonModule,
    PlanningRoutingModule,
    FormsModule,  
    PlanningMealComponent 
  ]
})
export class PlanningModule { }
