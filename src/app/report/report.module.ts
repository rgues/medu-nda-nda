import { RapportService } from './../service/rapport.service';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { UpdateEventReportComponent } from './components/update-event-report/update-event-report.component';
import { ListEventReportComponent } from './components/list-event-report/list-event-report.component';
import { AddEventReportComponent } from './components/add-event-report/add-event-report.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AddEventReportComponent,
    ListEventReportComponent,
    UpdateEventReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'reports', component: ListEventReportComponent },
      { path: 'add-report', component: AddEventReportComponent },
      { path: 'update-report', component: UpdateEventReportComponent},
    ])
  ],
  providers: [
    RapportService
  ]
})
export class ReportModule { }
