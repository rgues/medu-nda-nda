import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  defaultLang: string;
  private subject = new Subject<any>();

  constructor(
    private api: ApiService
  ) {
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
  }


  // update list message 
  sendUpdateMessage(mes: string) {
    this.subject.next({ message: mes });
  }

  getUpdateMessage(): Observable<any>  {
    return this.subject.asObservable();
  }
 

  // Set the events session
  setEventsSession(data: any) {
    localStorage.setItem('eventSession', JSON.stringify(data));
  }

  // Get the events session
  getEventsSession() {
    return JSON.parse(localStorage.getItem('eventSession'));
  }

  // Remove the events session
  removeEventsSession() {
    localStorage.removeItem('eventSession');
  }

  // Set the language session
  setLanguagesSession(data: any) {
    localStorage.setItem('languageSession', JSON.stringify(data));
  }

  // Get the language session
  getLanguagesSession() {
    return JSON.parse(localStorage.getItem('languageSession'));
  }

  // Remove the language session
  removeLanguagesSession() {
    localStorage.removeItem('languageSession');
  }

  // Set the language session
  setEventSession(data: any) {
    localStorage.setItem('eventSession', JSON.stringify(data));
  }

  // Get the language session
  getEventSession() {
    const events = localStorage.getItem('eventSession');
    return events ? JSON.parse(events) : null;
  }

  // Remove the language session
  removeEventSession() {
    localStorage.removeItem('eventSession');
  }

  // Get aventlanguages
  getLanguages() {
    return this.api.get('event/get/langues');
  }

  // Get all event type
  getEventType() {
    return this.api.get(`event/get/allType/event/${this.defaultLang}`);
  }

  // Save an event type
  saveEventType(token: string, data: any) {
    return this.api.post(`event/save/type/event/${token}`, data);
  }

  // update an event type
  updateEventType(token: string, data: any) {
    return this.api.post(`event/update/type/event/${token}`, data);
  }

  // delete an event type
  deleteEventType(token: string, data: any) {
    return this.api.post(`event/delete/type/event/${token}`, data);
  }

  // save event location
  saveEventLocation(token: string, data: any) {
    return this.api.post(`event/save/lieu/event/${token}`, data);
  }

  // Get all event location
  getEventLocation() {
    return this.api.get(`event/get/allLieu/event/${this.defaultLang}`);
  }

  // Update an event location
  updateEventLocation(token: string, data: any) {
    return this.api.post(`event/update/lieu/event/${token}`, data);
  }

  // Delete event location
  deleteEventLocation(token: string, data: any) {
    return this.api.post(`event/delete/lieu/event/${token}`, data);
  }

  // Create an event
  createEvent(token: string, data: any) {
    return this.api.post(`event/save/event/${token}`, data);
  }

  // Get all event
  getEvents() {
    return this.api.get(`event/get/all/events/${this.defaultLang}`);
  }

  // Update Events
  updateEvent(token: string, data: any) {
    return this.api.post(`event/update/events/${token}`, data);
  }

  // Delete event
  deleteEvent(token: string, data: any) {
    return this.api.post(`event/delete/events/${token}`, data);
  }

  // Get Fees type event
  getFeesType() {
    return this.api.get(`event/get/fee/description/${this.defaultLang}`);
  }


  // paid  fees event
  paidFeesEvent(token: string, data: any) {
    return this.api.post(`event/save/payment/${token}`, data);
  }

  // Get the event  Type name
  getEventName(eventId: number, listEvents: any) {
    let name = '';
    listEvents.forEach(event => {
      if (event.event_type_id === eventId) {
        name = event.event_type_desc;
      }
    });
    return name;
  }

  // Get the event name
  getLocationName(placeId: number, listEvents: any) {
    let name = '';
    listEvents.forEach(event => {
      if (event.place_id === placeId) {
        name = event.place_address;
      }
    });
    return name;
  }

  /* Lateness services */

  // save a member lateness
  saveMemberLateness(token: string, data: any) {
    return this.api.post(`event/save/late/${token}`, data);
  }

  // Get the status of lateness, absence and presence of a member from an event
  membersLatenessStatus(token: string, eventId: number) {
    return this.api.get(`event/get/status/attendance/${eventId}/${this.defaultLang}/${token}`);
  }

  // update a member lateness
  updateMemberLateness(token: string, data: any) {
    return this.api.post(`event/update/late/${token}`, data);
  }

  // Delete a member lateness
  deleteMemberLateness(token: string, data: any) {
    return this.api.post(`event/delete/late/${token}`, data);
  }


  /* attendance services */

  // save members attendance
  saveMemberAttendance(token: string, data: any) {
    return this.api.post(`event/save/attendance/${token}`, data);
  }

  // Get the state of attendance
  getAttentanceState(token: string, eventId: number) {
    return this.api.get(`event/get/status/attendance/${eventId}/${this.defaultLang}/${token}`);
  }

  // Update attendance
  updateMemberAttendance(token: string, data: any) {
    return this.api.post(`event/update/attendance/${token}`, data);
  }

  // Delete attendance
  deleteAttendance(token: string, data: any) {
    return this.api.post(`event/delete/attendance/${token}`, data);
  }

  
  /* picture events services */

  // save pictures
  savePictures(token: string, data: any) {
    return this.api.post(`event/save/picture/${token}`, data);
  }

  // Get pictures
  getPictures(token: string, eventId: number) {
    return this.api.get(`event/get/picture/${eventId}/${token}`);
  }

  // Update picture
  updatePicture(token: string, data: any) {
    return this.api.post(`event/update/picture/${token}`, data);
  }

  // Delete picture
  deletePicture(token: string, data: any) {
    return this.api.post(`event/delete/picture/${token}`, data);
  }

}
