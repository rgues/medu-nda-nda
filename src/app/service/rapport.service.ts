import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  defaultLang: any;
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

  // Set the current doc
  setCurrentDoc(positions: any) {
    localStorage.setItem('current-doc', JSON.stringify(positions));
  }

  // Get the current doc
  getCurrentDoc() {
    const position = localStorage.getItem('current-doc');
    return position ? JSON.parse(position) : null;
  }

  // Save all report  

  // save a report
  saveReport(token: string, data: any) {
    return this.api.post(`report/save/${token}`, data);
  }

  // Get all reports
  getAllReports(token: string) {
    return this.api.get(`report/getAll/${this.defaultLang}/${token}`);
  }

  // Get event reports
  getEventReports(token: string, eventId: number) {
    return this.api.get(`report/get/${eventId}/${token}`);
  }

  // Update a report
  updateReports(token: string, data: any) {
    return this.api.post(`report/edit/${token}`, data);
  }


  // delete a report
  deleteReports(token: string, data: any) {
    return this.api.post(`report/delete/${token}`, data);
  }

  // Manage Files

  // Save a file
  saveFile(token: string, data: any) {
    return this.api.post(`file/save/${token}`, data);
  }

  // Get all files
  getAllFiles(token: string) {
   // return this.api.get(`file/get/${token}`);
    return this.api.get(`file/get/withLink/${token}`);
  }

  // Update a file
  updateFiles(token: string, data: any) {
    return this.api.post(`file/update/${token}`, data);
  }

  // Delete a file
  deleteFile(token: string, data: any) {
    return this.api.post(`file/delete/${token}`, data);
  }

  // Disable a file
  disableFile(token: string, data: any) {
    return this.api.post(`file/expired/${token}`, data);
  }

  // Manage type of files  

  // Save a type of file
  saveTypeFile(token: string, data: any) {
    return this.api.post(`typedocument/save/${token}`, data);
  }

  // Get al ltype of files
  getAllTypeFiles(token: string) {
    return this.api.get(`typedocument/get/${token}`);
  }

  // Update a type of file
  updateTypeFiles(token: string, data: any) {
    return this.api.post(`typedocument/update/${token}`, data);
  }

  // Delete a type of file
  deleteTypeFile(token: string, data: any) {
    return this.api.post(`typedocument/delete/${token}`, data);
  }

}
