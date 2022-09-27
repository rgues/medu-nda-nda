import { RapportService } from './../service/rapport.service';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListReportDocComponent } from './components/list-report-doc/list-report-doc.component';
import { AddReportDocComponent } from './components/add-report-doc/add-report-doc.component';
import { UpdateReportDocComponent } from './components/update-report-doc/update-report-doc.component';
import { ListTypeReportDocComponent } from './components/list-type-report-doc/list-type-report-doc.component';

@NgModule({
  declarations: [
    AddReportDocComponent,
    ListReportDocComponent,
    UpdateReportDocComponent,
    ListTypeReportDocComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'list-docs', component: ListReportDocComponent },
      { path: 'list-docs/:typeDoc', component: ListTypeReportDocComponent },
      { path: 'add-doc', component: AddReportDocComponent },
      { path: 'update-doc', component: UpdateReportDocComponent},
    ])
  ],
  providers: [
    RapportService
  ]
})
export class ReportDocModule { }
