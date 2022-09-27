import { VisiteService } from './../service/visite.service';
import { UpdateVisiteComponent } from './components/update-visite/update-visite.component';
import { AddVisiteComponent } from './components/add-viste/add-visite.component';
import { FileUploadModule } from 'ng2-file-upload';

import { MembreService } from 'src/app/service/membre.service';
import { ArticlesService } from 'src/app/service/articles.service';
import { RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatComponentsModule } from '../mat-components.module';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from './../shared/shared.module';
import { VisiteListComponent } from './components/visite-list/visite-list.component';

@NgModule({
  declarations: [
    VisiteListComponent,
    UpdateVisiteComponent,
    AddVisiteComponent
  ],
  imports: [
    CommonModule,
    MatComponentsModule,
    FileUploadModule,
    MatNativeDateModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'visite-list', pathMatch: 'full' },
      { path: 'visite-list', component: VisiteListComponent },
      { path: 'add-visite', component: AddVisiteComponent },
      { path: 'update-visite', component: UpdateVisiteComponent},
    ])
  ], providers: [
    ArticlesService,
    MembreService,
    VisiteService
  ]
})
export class VisiteModule { }
