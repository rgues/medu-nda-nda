import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatComponentsModule } from '../mat-components.module';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from './../shared/shared.module';
import { RouterModule } from '@angular/router';
import { VideosListComponent } from './components/videos-list/videos-list.component';
import { AddVideoComponent } from './components/add-video/add-video.component';
import { UpdateVideoComponent } from './components/update-video/update-video.component';
import { VideosListApprouveComponent } from './components/videos-list-approuve/videos-list-approuve.component';


@NgModule({
  declarations: [
    VideosListComponent,
    AddVideoComponent,
    UpdateVideoComponent,
    VideosListApprouveComponent
  ],
  imports: [
    CommonModule,
    MatComponentsModule,
    MatNativeDateModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list-videos', pathMatch: 'full' },
      { path: 'list-videos', component: VideosListComponent },
      { path: 'list-videos-approuve', component: VideosListApprouveComponent },
      { path: 'add-video', component: AddVideoComponent },
      { path: 'update-video', component: UpdateVideoComponent},
    ])
  ], providers: [
  ]
})
export class VideosModule { }
