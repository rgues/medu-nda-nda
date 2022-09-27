import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDepensesComponent } from './add-depenses.component';

describe('AddDepensesComponent', () => {
  let component: AddDepensesComponent;
  let fixture: ComponentFixture<AddDepensesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDepensesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDepensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
