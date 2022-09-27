import { EventReportComponent } from './components/event-report/event-report.component';
import { EventAttendanceComponent } from './components/event-attendance/event-attendance.component';
import { EventLatenessComponent } from './components/event-lateness/event-lateness.component';
import { EventTransactionComponent } from './components/event-transaction/event-transaction.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';

import { CreateEventComponent } from './components/create-event/create-event.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { CreateEventTypeComponent } from './components/create-event-type/create-event-type.component';
import { UpdateEventTypeComponent } from './components/update-event-type/update-event-type.component';
import { CreateEventLocationComponent } from './components/create-event-location/create-event-location.component';
import { UpdateEventLocationComponent } from './components/update-event-location/update-event-location.component';
import { EventLocationListComponent } from './components/event-location-list/event-location-list.component';
import { EventTypeListComponent } from './components/event-type-list/event-type-list.component';

import { EventDashboardComponent } from './components/event-dashboard/event-dashboard.component';
import { UpdateEventTransactionComponent } from './components/update-event-transaction/update-event-transaction.component';
import { AddEventAttendanceComponent } from './components/add-event-attendance/add-event-attendance.component';
import { AddEventLatenessComponent } from './components/add-event-lateness/add-event-lateness.component';


@NgModule({
  declarations: [
  CreateEventComponent,
  EventTypeListComponent,
  EventLocationListComponent,
  EventDashboardComponent,
  EventListComponent,
  EventDetailComponent,
  CreateEventTypeComponent,
  UpdateEventTypeComponent,
  CreateEventLocationComponent,
  UpdateEventLocationComponent,
  EventTransactionComponent,
  EventLatenessComponent,
  EventAttendanceComponent,
  UpdateEventTransactionComponent,
  AddEventAttendanceComponent,
  AddEventLatenessComponent,
  EventReportComponent
],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list-events', pathMatch: 'full' },
      { path: 'list-events', component: EventDashboardComponent },
      { path: 'transactions-events/:eventId', component: EventTransactionComponent },
      { path: 'lateness-events/:eventId', component: EventLatenessComponent },
      { path: 'attendance-events/:eventId', component: EventAttendanceComponent },
      { path: 'add-event-attendance', component: AddEventAttendanceComponent },
      { path: 'add-event-lateness', component: AddEventLatenessComponent },
      { path: 'create-event', component: CreateEventComponent },
      { path: 'event-report', component: EventReportComponent },
      { path: 'update-event', component: EventDetailComponent}
    ]),
    RouterModule,
  ], entryComponents: [
    CreateEventTypeComponent,
    UpdateEventTypeComponent,
    CreateEventLocationComponent,
    UpdateEventLocationComponent,
    UpdateEventTransactionComponent
  ]
})
export class EventsModule { }
