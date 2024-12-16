import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningRoutingModule } from './planning-routing.module';
import { FormsModule } from '@angular/forms';  // إضافة FormsModule هنا

// استيراد المكون المستقل
import { PlanningMealComponent } from './planning-meal/planning-meal.component';

@NgModule({
  imports: [
    CommonModule,
    PlanningRoutingModule,
    FormsModule,  // تأكد من إضافة FormsModule هنا
    PlanningMealComponent  // استيراد المكون هنا بدلاً من إضافته إلى declarations
  ]
})
export class PlanningModule { }
