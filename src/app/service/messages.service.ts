import { Subject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  defaultLang: string;
  subject = new Subject<any>();

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

  getUpdateMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  // Set the messages
  setMessageData(videos: any) {
    localStorage.setItem('messages', JSON.stringify(videos));
  }

  // Get the messages
  getMessagesData() {
    const position = localStorage.getItem('messages');
    return position ? JSON.parse(position) : [];
  }

  // Remove the messages
  removeVideosData() {
    localStorage.removeItem('messages');
  }


  // create a message
  createMessage(token: string, data: any) {
    return this.api.post(`message/member/create/${token}`, data);
  }


  // Get all messages
  getAllMessages(token: string) {
    return this.api.get(`message/member/get/all/${token}`);
  }


  // Update a message
  updateMessage(token: string, data: any) {
    return this.api.post(`message/member/update/${token}`, data);
  }

  // Get list of active and observator member
  getMembers() {
    return this.api.get(`get/member/liste/${this.defaultLang}`);
  }

  // get all rpn members
  getRpnMembers(token: string) {
    return this.api.get(`rpn/get/all/members/${token}`);
  }

  // send message to active or observator member 
  sendMessageMembers(token: string, data: any) {
    return this.api.post(`message/send/to/member/actif/or/observateur/${token}`, data);
  }

  // send message to active or observator member 
  sendMessageRpnMembers(token: string, data: any) {
    return this.api.post(`message/send/to/member/rpn/${token}`, data);
  }
 

}
