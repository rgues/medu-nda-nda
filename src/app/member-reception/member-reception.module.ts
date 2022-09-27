import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignReceptionComponent } from './assign-reception/assign-reception.component';
import { MemberAttendaceComponent } from './member-attendace/member-attendace.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [AssignReceptionComponent, MemberAttendaceComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'assign', pathMatch: 'full' },
      { path: 'assign', component: AssignReceptionComponent },
      { path: 'attendance', component: MemberAttendaceComponent },
    ]),
  ]
})
export class MemberReceptionModule { }
