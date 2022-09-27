import { ApiService } from 'src/app/service/api.service';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FamilleService {

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

  // Set the member session
  setFamilySession(data: any) {
    localStorage.setItem('familySession', JSON.stringify(data));
  }

  // Get the member session
  getFamilySession() {
    return JSON.parse(localStorage.getItem('familySession'));
  }

  // Remove the member session
  removeFamilySession() {
    localStorage.removeItem('familySession');
  }

  // Get the familly list
  getFamily() {
    return this.api.get('familles/get/familles');
  }

  // Save a familly
  saveFamily(token: string, data: any) {
    return this.api.post(`familles/save/family/${token}`, data);
  }

  // Update a familly
  updateFamily(token: string, data: any) {
    return this.api.post(`familles/update/family/${token}`, data);
  }


  // delet a familly
  deleteFamily(token: string, data: any) {
    return this.api.post(`familles/delete/family/${token}`, data);
  }

  // Add family member's
  addFamilyMember(token: string, data: any) {
    return this.api.post(`familles/assign/member/${token}`, data);
  }

  // Get Family member's
  getFamilyMembers(familyId: number, token: string) {
    return this.api.get(`familles/get/members/${familyId}/${token}`);
  }

  // Get the list of family reception
  getFamilyReception(token: string) {
    return this.api.get(`reception/get/famille/nayant/pas/recu/${token}`);
  }

  // Add family reception
  addfamilyReception(token: string, data: any) {
    return this.api.post(`reception/create/${token}`, data);
  }


  // Get the family name
  getFamilyName(familyId: number, listFamilies: any) {
    let name = '';
    listFamilies.forEach(family => {
      if (family.famille_id === familyId) {
        name = family.family_name;
      }
    });
    return name;
  }


}
