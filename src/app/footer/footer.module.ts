import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { MatNativeDateModule } from '@angular/material/core';
import { MatComponentsModule } from './../mat-components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddFooterLinkComponent } from './components/add-footer-link/add-footer-link.component';
import { UpdateFooterLinkComponent } from './components/update-footer-link/update-footer-link.component';
import { ListFooterLinkComponent } from './components/list-footer-link/list-footer-link.component';



@NgModule({
  declarations: [AddFooterLinkComponent, UpdateFooterLinkComponent, ListFooterLinkComponent],
  imports: [
    CommonModule,
    MatComponentsModule,
    MatNativeDateModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list-footer-link', pathMatch: 'full' },
      { path: 'add-footer-link', component: AddFooterLinkComponent },
      { path: 'update-footer-link', component: UpdateFooterLinkComponent },
      { path: 'list-footer-link', component: ListFooterLinkComponent }
    ])
  ]
})
export class FooterModule { }
