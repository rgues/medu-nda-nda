import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListDepensesComponent } from './list-depenses/list-depenses.component';
import { AddDepensesComponent } from './add-depenses/add-depenses.component';
import { UpdateDepensesComponent } from './update-depenses/update-depenses.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { MatComponentsModule } from '../mat-components.module';
import { MatNativeDateModule } from '@angular/material';
import { ApiService } from '../service/api.service';
import { DepensesService } from '../service/depenses.service';



@NgModule({
  declarations: [
    ListDepensesComponent, 
    AddDepensesComponent, 
    UpdateDepensesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatComponentsModule,
    MatNativeDateModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'depenses-list', pathMatch: 'full'},
      { path: 'depenses-list', component: ListDepensesComponent}
  ])
  ],
  providers:[
    ApiService,
    DepensesService
  ],entryComponents:[
    AddDepensesComponent, 
    UpdateDepensesComponent
  ]
})
export class DepensesModule { }
