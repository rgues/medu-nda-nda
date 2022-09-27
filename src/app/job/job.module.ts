import { JobService } from './../service/job.service';

import { JobListComponent } from './components/job-list/job-list.component';
import { FileUploadModule } from 'ng2-file-upload';

import { MembreService } from 'src/app/service/membre.service';
import { ArticlesService } from 'src/app/service/articles.service';
import { RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatComponentsModule } from '../mat-components.module';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from './../shared/shared.module';
import { RegisterJobComponent } from './components/register-job/register-job.component';
import { UpdateJobComponent } from './components/update-job/update-job.component';


@NgModule({
  declarations: [
    JobListComponent,
    RegisterJobComponent,
    UpdateJobComponent
  ],
  imports: [
    CommonModule,
    MatComponentsModule,
    FileUploadModule,
    MatNativeDateModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'job-list', pathMatch: 'full' },
      { path: 'job-list', component: JobListComponent },
      { path: 'register-job', component: RegisterJobComponent },
      { path: 'update-job', component: UpdateJobComponent},
    ])
  ], providers: [
    ArticlesService,
    MembreService,
    JobService
  ]
})
export class JobModule { }
