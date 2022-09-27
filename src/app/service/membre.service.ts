import { ToastrService } from 'ngx-toastr';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembreService {
  defaultLang: string;
  private subject = new Subject<any>();

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastrService
  ) {
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
  }

  logoutMember() {
    const user = this.getUserSession();
    if (user && user.remenber_token) {
      this.logout(user.remenber_token);
    }
    this.removeMemberSession();
    localStorage.removeItem('user-credentials');
    localStorage.clear();
    localStorage.setItem('langue', 'fr');
    this.toast.error('Votre session a expiré. Veuillez-vous reconnectez');
    this.router.navigate(['/menu/1']);

  }

  // update list message 
  sendUpdateMessage(mes: string) {
    this.subject.next({ message: mes });
  }

  getUpdateMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  // Get the  user credentials
  public getUserSecret(): any {
    const secret = localStorage.getItem('user-credentials');
    return secret ? JSON.parse(atob(secret)) : null;
  }

  // Set the  user credentials
  public setUserSecret(credentials: any) {
    localStorage.setItem('user-credentials', btoa(JSON.stringify(credentials)));
  }

  // Set the member session
  setUserSession(data: any) {
    localStorage.setItem('userSession', JSON.stringify(data));
  }

  // Get the member session
  getUserSession() {
    return JSON.parse(localStorage.getItem('userSession'));
  }

  // Remove the member session
  removeUserSession() {
    localStorage.removeItem('userSession');
  }

  // Set the member session
  setMemberSession(data: any) {
    localStorage.setItem('memberSession', JSON.stringify(data));
  }

  // Get the member session
  getMemberSession() {
    return JSON.parse(localStorage.getItem('memberSession'));
  }

  // Remove the member session
  removeMemberSession() {
    localStorage.removeItem('memberSession');
  }

  sendMessageModalAdmin(modalParams: any) {
    this.subject.next({ modalData: modalParams });
  }

  getMessageModalAdmin(): Observable<any> {
    return this.subject.asObservable();
  }

  sendUpdatePassword(password: any) {
    this.subject.next({ data: password });
  }

  getUpdatePassword(): Observable<any> {
    return this.subject.asObservable();
  }

  // permet de renvoyer toutes les langues
  getLanguages() {
    return this.api.get('get/langue');
  }

  // permet de renvoyer toutes les villes
  getCities() {
    return this.api.get('get/city');
  }

  // permet de renvoyer toutes les provinces
  getProvinces() {
    return this.api.get('get/province');
  }

  // permet de renvoyer toutes les professions
  getProfession() {
    return this.api.get(`get/profession/${this.defaultLang}`);
  }


  // permet de renvoyer tous les status
  getStatut() {
    return this.api.get(`get/status/${this.defaultLang}`);
  }


  // permet de renvoyer tous les rôles
  getRoles() {
    return this.api.get(`get/role/${this.defaultLang}`);
  }


  // permet de renvoyer tous les titles (M,Mme,Mlle,Dr,Prof,...)
  getTitle() {
    return this.api.get(`get/title/${this.defaultLang}`);
  }

  // permet de renvoyer toutes les sources d'infos
  getInfoSources() {
    return this.api.get(`get/info_source/${this.defaultLang}`);
  }

  // permet à un membre de se connecter (login)
  login(member: any) {
    return this.api.post('member/account/v1/auth', member);
  }

  // permet à un membre de se déconnecter (logout)
  logout(token: string) {
    return this.api.get(`member/account/v1/logOut/${token}`);
  }

  // permet d'enregistrer un membre (register)
  createMember(member: any) {
    return this.api.post('member/account/v1/signup', member);
  }

  // permet de renvoyer le profil d'un membre
  getMemberProfil(memberId: number, token: string) {
    return this.api.get(`member/profile/v1/get/${memberId}/${token}`);
  }

  // permet de modifier le profil d'un membre
  updateMemberProfil(member: any, memberId: number, token: string) {
    return this.api.post(`member/profile/v1/edit/${memberId}/${token}`, member);
  }

  // permet d'update le rôle d'un membre
  updateMemberRole(member: any) {
    return this.api.post(`member/role/v1/update`, member);
  }

  // permet d'update le statut d'un membre (Observateur,Exclu,Actif,Suspendu,Donateur)
  updateMemberStatut(member: any) {
    return this.api.post(`member/status/v1/update`, member);
  }


  // permet de renvoyer la liste des membres
  getListOfMembers() {
    return this.api.get(`get/member/liste/${this.defaultLang}`);
  }


  // permet de renvoyer la liste des membres du bureau exécutif
  getMembersBureauExecutif() {
    return this.api.get(`get/member/executive/liste/${this.defaultLang}`);
  }

  // update a member password
  updateMemberpassword(member: any, token: string) {
    return this.api.post(`member/change/password/${token}`, member);
  }

  // Get the list of memebers filtered by city and profession
  getListOfMemberFiltered(cityId: number, profesionId: number) {
    return this.api.get(`get/member/liste/${this.defaultLang}/${profesionId}/${cityId}`);
  }

  // permet d'enregistrer un membre (register)
  addExecutiveMember(member: any, token: string) {
    return this.api.post(`member/add/executive/member/${token}`, member);
  }

  // Manage member files  

  // Save a member file
  saveMemberFile(token: string, data: any) {
    return this.api.post(`member/save/file/${token}`, data);
  }

  // Get all member files
  getAllMemberFiles(token: string, memberId: number) {
    return this.api.get(`member/get/file/${memberId}/${token}`);
  }

  // Update a member file
  updateMemberFiles(token: string, data: any) {
    return this.api.post(`member/update/file/${token}`, data);
  }

  // Delete a member file
  deleteMemberFile(token: string, data: any) {
    return this.api.post(`member/delete/file/${token}`, data);
  }
// ============= reception des membres =========


// Get the list of member that doesn't receive yet
getMemberCanReceive(token: string) {
  return this.api.get(`reception/member/get/members/nayant/pas/ete/designe/${token}`);
}

// Assign member reception
asignMemberReception(token: string, data: any) {
  return this.api.post(`reception/member/create/designation/${token}`, data);
}

//Get the designated member 
getMemberDesignated(token: string, data: any) {
  return this.api.post(`reception/member/get/designated/members/${token}`, data);
}

// Save member attendance
saveMemberAttendance(token: string, data: any) {
  return this.api.post(`reception/member/save/attendance/${token}`, data);
}

// get all events assign to a member
getEventsDesignated(token: string, memberId: number) {
  return this.api.get(`reception/member/get/designated/events/${this.defaultLang}/${memberId}/${token}`);
}


// Send a message to all members
sendMessage(token: string, data: number) {
  return this.api.post(`notification/sendEmail/toAllMembers/${token}`, data);
}
  
}
