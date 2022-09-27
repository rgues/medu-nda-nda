import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DepensesService {
  defaultLang: string;
  private subjectDepense = new Subject<any>();

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


  // manage message 
  sendMessage(mes: string) {
    this.subjectDepense.next({ message: mes });
  }

  getMessage(): Observable<any>  {
    return this.subjectDepense.asObservable();
  }
 

  // Set the spent session
  setDepenseSession(data: any) {
    localStorage.setItem('depenseSession', JSON.stringify(data));
  }

  // Get the spent session
  getDepenseSession() {
    return JSON.parse(localStorage.getItem('depenseSession'));
  }

  // Get all spent type
  getAllSpentType(token: string) {
    return this.api.get(`spending/get/all/type/${token}`);
  }
  
  // Save a spent
  saveExpense(token: string, data: any) {
    return this.api.post(`spending/save/spent/${token}`, data);
  }

  // Get all spent
  getAllSpents(token: string) {
    return this.api.get(`spending/get/all/spent/${token}`);
  }

  // Edit a spent
  editSpent(token: string, data: any) {
    return this.api.post(`spending/update/spent/${token}`,data);
  }

  // delete a spent
  deleteSpent(token: string, data: any) {
      return this.api.post(`spending/delete/spent/${token}`,data);
  }
  

}
