


import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatComponentsModule } from '../mat-components.module';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from './../shared/shared.module';

import { MemberWalletComponent } from './components/member-wallet/member-wallet.component';
import { MemberEventPaymentComponent } from './components/member-event-payment/member-event-payment.component';
import { CreditMemberWalletComponent } from './components/credit-member-wallet/credit-member-wallet.component';
import { WalletTransactionComponent } from './components/wallet-transaction/wallet-transaction.component';

import { WalletService } from './../service/wallet.service';
import { ApiService } from '../service/api.service';
import { BalanceComponent } from './components/balance/balance.component';
import { PaidEventComponent } from './components/paid-event/paid-event.component';
import { DebitWalletComponent } from './components/debit-wallet/debit-wallet.component';


@NgModule({
  declarations: [
    MemberWalletComponent,
    CreditMemberWalletComponent,
    MemberEventPaymentComponent,
    WalletTransactionComponent,
    BalanceComponent,
    PaidEventComponent,
    DebitWalletComponent
  ],
  imports: [
    CommonModule,
    MatComponentsModule,
    MatNativeDateModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'member-wallet', pathMatch: 'full'},
      { path: 'member-wallet', component: MemberWalletComponent}
  ])
], providers: [
  WalletService,
  ApiService
],entryComponents:[
  DebitWalletComponent
]
})

export class WalletModule { }
