import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatComponentsModule } from '../mat-components.module';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';

import { FamilyDetailComponent } from './components/family-detail/family-detail.component';
import { FamilyListComponent } from './components/family-list/family-list.component';
import { FamilyCreateComponent } from './components/family-create/family-create.component';
import { FamilyMemberAddComponent } from './components/family-member-add/family-member-add.component';
import { FamilyMemberListComponent } from './components/family-member-list/family-member-list.component';
import { MembreRpnFamilyComponent } from './components/membre-rpn-family/membre-rpn-family.component';
import { RpnFamilyTransactionComponent } from './components/rpn-family-transaction/rpn-family-transaction.component';
import { FamilyReceptionListComponent } from './components/family-reception-list/family-reception-list.component';
import { FamilyReceptionAddComponent } from './components/family-reception-add/family-reception-add.component';


@NgModule({
  declarations: [
    FamilyDetailComponent,
    FamilyListComponent,
    FamilyCreateComponent,
    FamilyMemberAddComponent,
    FamilyMemberListComponent,
    MembreRpnFamilyComponent,
    RpnFamilyTransactionComponent,
    FamilyReceptionListComponent,
    FamilyReceptionAddComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list-family', pathMatch: 'full' },
      { path: 'list-family', component: FamilyListComponent },
      { path: 'create-family', component: FamilyCreateComponent },
      { path: 'update-family', component: FamilyDetailComponent},
      { path: 'family-reception-list', component: FamilyReceptionListComponent},
      { path: 'family-reception-add', component: FamilyReceptionAddComponent},
      { path: 'add-family-member', component: FamilyMemberAddComponent },
      { path: 'list-family-member', component: FamilyMemberListComponent },
      { path: 'rpn-transcations', component: RpnFamilyTransactionComponent }
    ]),
    MatComponentsModule,
    MatNativeDateModule
  ],
  exports: [
  ],
  entryComponents: [
    MembreRpnFamilyComponent,
    RpnFamilyTransactionComponent
  ]
})
export class FamilyModule { }
