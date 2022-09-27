import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitWalletComponent } from './debit-wallet.component';

describe('DebitWalletComponent', () => {
  let component: DebitWalletComponent;
  let fixture: ComponentFixture<DebitWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebitWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebitWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
