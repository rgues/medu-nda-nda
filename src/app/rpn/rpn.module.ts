
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatComponentsModule } from '../mat-components.module';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from './../shared/shared.module';

import { MembreRpnComponent } from './components/membre-rpn/membre-rpn.component';
import { MembreRpnAddComponent } from './components/membre-rpn-add/membre-rpn-add.component';
import { MembreRpnUpdateComponent } from './components/membre-rpn-update/membre-rpn-update.component';
import { RpnWalletComponent } from './components/rpn-wallet/rpn-wallet.component';
import { RpnEventPaymentComponent } from './components/rpn-event-payment/rpn-event-payment.component';
import { RpnTransactionComponent } from './components/rpn-transaction/rpn-transaction.component';
import { RpnFamilyCreditComponent } from './components/rpn-family-credit/rpn-family-credit.component';
import { BalanceComponent } from './components/balance/balance.component';
import { DebitWalletComponent } from './components/debit-wallet/debit-wallet.component';


@NgModule({
  declarations: [
    MembreRpnComponent,
    MembreRpnAddComponent,
    MembreRpnUpdateComponent,
    RpnWalletComponent,
    RpnFamilyCreditComponent,
    RpnEventPaymentComponent,
    RpnTransactionComponent,
    BalanceComponent,
    DebitWalletComponent
  ],
  imports: [
    CommonModule,
    MatComponentsModule,
    MatNativeDateModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'rpn-members', pathMatch: 'full'},
      { path: 'rpn-members', component: MembreRpnComponent },
      { path: 'rpn-member-add', component: MembreRpnAddComponent},
      { path: 'rpn-member-update', component: MembreRpnUpdateComponent},
      { path: 'rpn-wallet', component: RpnWalletComponent}
  ])
  ],entryComponents:[
    DebitWalletComponent
  ]
})

export class RpnModule { }
