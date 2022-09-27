import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { MatNativeDateModule } from '@angular/material/core';
import { MatComponentsModule } from './../mat-components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddTestimonyComponent } from './components/add-testimony/add-testimony.component';
import { UpdateTestimonyComponent } from './components/update-testimony/update-testimony.component';
import { ListTestimonyComponent } from './components/list-testimony/list-testimony.component';



@NgModule({
  declarations: [AddTestimonyComponent, UpdateTestimonyComponent, ListTestimonyComponent],
  imports: [
    CommonModule,
    MatComponentsModule,
    MatNativeDateModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list-testimony', pathMatch: 'full' },
      { path: 'add-testimony', component: AddTestimonyComponent },
      { path: 'update-testimony', component: UpdateTestimonyComponent },
      { path: 'list-testimony', component: ListTestimonyComponent }
    ])
  ]
})
export class TestimonyModule { }
