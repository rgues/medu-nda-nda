import { Subject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobService {
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

  // Set the current job
  setCurrentJob(job: any) {
    localStorage.setItem('current-job', JSON.stringify(job));
  }

  // Get the current job
  getCurrentJob() {
    const emploi = localStorage.getItem('current-job');
    return emploi ? JSON.parse(emploi) : null;
  }

  // Remove the current job
  removeCurrentJob() {
    localStorage.removeItem('current-job');
  }

  // Create a job
  registerJob(token: string, data: any) {
    return this.api.post(`guichet/emploi/save/${token}`, data);
  }

  // Get a all jobs
  getAlljobs() {
    return this.api.get(`guichet/emploi/getAll/${this.defaultLang}`);
  }

  // Update all jobs
  updateAllJobs(token: string, data: any) {
    return this.api.post(`guichet/emploi/update/${token}`, data);
  }

  // Delete a job
  deleteAjob(token: string, data: any) {
    return this.api.post(`guichet/emploi/delete/${token}`, data);
  }

  // expired a job
  expireAjob(token: string, data: any) {
    return this.api.post(`guichet/emploi/expire/${token}`, data);
  }

}
