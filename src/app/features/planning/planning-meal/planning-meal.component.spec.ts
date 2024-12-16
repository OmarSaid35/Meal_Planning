import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningMealComponent } from './planning-meal.component';

describe('PlanningMealComponent', () => {
  let component: PlanningMealComponent;
  let fixture: ComponentFixture<PlanningMealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningMealComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});







