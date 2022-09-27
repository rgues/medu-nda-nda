import { RapportService } from '../service/rapport.service';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { UpdateMemberDocComponent } from './components/update-member-doc/update-member-doc.component';
import { ListMemberDocComponent } from './components/list-member-doc/list-member-doc.component';
import { AddMemberDocComponent } from './components/add-member-doc/add-member-doc.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AddMemberDocComponent,
    ListMemberDocComponent,
    UpdateMemberDocComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'add-doc', pathMatch: 'full' },
      { path: 'list-docs/:memberId', component: ListMemberDocComponent },
      { path: 'add-doc', component: AddMemberDocComponent },
      { path: 'update-doc/:memberId', component: UpdateMemberDocComponent},
    ])
  ],
  providers: [
    RapportService
  ]
})
export class MemberDocModule { }
