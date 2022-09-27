import { RapportService } from '../service/rapport.service';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddEventPicturecComponent } from './components/add-event-picture/add-event-picture.component';
import { ListEventPictureComponent } from './components/list-event-picture/list-event-picture.component';
import { UpdateEventPictureComponent } from './components/update-event-picture/update-event-picture.component';

@NgModule({
  declarations: [
    AddEventPicturecComponent,
    ListEventPictureComponent,
    UpdateEventPictureComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'add-picture', pathMatch: 'full' },
      { path: 'list-picture/:eventId', component: ListEventPictureComponent },
      { path: 'add-picture', component: AddEventPicturecComponent },
      { path: 'update-picture', component: UpdateEventPictureComponent},
    ])
  ],
  providers: [
    RapportService
  ]
})
export class EventPictureModule { }
