import { Subject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisiteService {
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

  // Set the current articles
  setCurrentVisite(job: any) {
    localStorage.setItem('current-visite', JSON.stringify(job));
  }

  // Get the current articles
  getCurrentVisite() {
    const emploi = localStorage.getItem('current-visite');
    return emploi ? JSON.parse(emploi) : null;
  }

  // Remove the current articles
  removeCurrentVisite() {
    localStorage.removeItem('current-visite');
  }

  // Save a visite
  saveAvisite(token: string, data: any) {
    return this.api.post(`visite/save/${token}`, data);
  }

  // Get a all visite reason
  getAllVisiteReasons() {
    return this.api.get(`visite/reasons/getAll/${this.defaultLang}`);
  }

  // Get a all relation type
  getAllRelationType() {
    return this.api.get(`visite/type/relation/getAll/${this.defaultLang}`);
  }

  // Get a all visite reason
  getAllVisites(token: string) {
    return this.api.get(`visite/getAll/${this.defaultLang}/${token}`);
  }

  // Update all visite
  updateViste(token: string, data: any) {
    return this.api.post(`visite/update/${token}`, data);
  }

  // Delete a job
  deleteVisite(token: string, data: any) {
    return this.api.post(`visite/delete/${token}`, data);
  }

}
