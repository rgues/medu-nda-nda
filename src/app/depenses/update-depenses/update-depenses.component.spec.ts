import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDepensesComponent } from './update-depenses.component';

describe('UpdateDepensesComponent', () => {
  let component: UpdateDepensesComponent;
  let fixture: ComponentFixture<UpdateDepensesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateDepensesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDepensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
