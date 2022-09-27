import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private subject = new Subject<any>();
  constructor(
    private api: ApiService
  ) { }

    // update list message 
    sendUpdateMessage(mes: string) {
      this.subject.next({ message: mes });
    }
  
    getUpdateMessage(): Observable<any>  {
      return this.subject.asObservable();
    }

   // save user feedbacks
   saveContacts(data: any) {
    return this.api.post('contact/us/save', data);
  }

     // save user feedbacks
     getContacts(token: any) {
      return this.api.get(`contact/us/getData/${token}`);
    }

    // answer a member feedbacks
    answerFeedback(token: any, data: any) {
      return this.api.post(`contact/us/save/answer/member/${token}`, data);
    }

}
