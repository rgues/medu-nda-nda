import { ApiService } from 'src/app/service/api.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestimonyService {
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
  
    getUpdateMessage(): Observable<any>  {
      return this.subject.asObservable();
    }

   // Set the testimony link
   setTestimonyData(positions: any) {
    localStorage.setItem('testimony', JSON.stringify(positions));
  }

  // Get the testimony link
  getTestimonyData() {
    const footer =  localStorage.getItem('testimony');
    return footer ? JSON.parse(footer) : [];
  }

  // Get all testimonies
  getTestimony() {
    return this.api.get(`thought/get/${this.defaultLang}`);
  }

  // Save Testimony
  saveTestimony(token: string, data: any) {
    return this.api.post(`thought/save/${token}`, data);
  }

  // Update testimony
  updateTestimony(token: string, data: any) {
    return this.api.post(`thought/update/${token}`, data);
  }

  // Desactivate a member thought
  disableMemberThought(token: string, data: any) {
    return this.api.post(`thought/desactive/${token}`, data);
  }

  // Enable a member thought
  enableMemberThought(token: string, data: any) {
    return this.api.post(`thought/reactive/${token}`, data);
  }

  // Delete a member thought
  deleteMemberThought(token: string, data: any) {
    return this.api.post(`thought/delete/${token}`, data);
  }

}
