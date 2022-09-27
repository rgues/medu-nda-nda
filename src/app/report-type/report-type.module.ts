import { RapportService } from './../service/rapport.service';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListTypeReportComponent } from './components/list-type-report/list-type-report.component';
import { AddTypeReportComponent } from './components/add-type-report/add-type-report.component';
import { UpdateTypeReportComponent } from './components/update-type-report/update-type-report.component';

@NgModule({
  declarations: [
    AddTypeReportComponent,
    ListTypeReportComponent,
    UpdateTypeReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'list-type', component: ListTypeReportComponent },
      { path: 'add-type', component: AddTypeReportComponent },
      { path: 'update-type', component: UpdateTypeReportComponent},
    ])
  ],
  providers: [
    RapportService
  ]
})
export class ReportTypeModule { }
