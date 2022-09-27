import { ApiService } from 'src/app/service/api.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FooterService {

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

    // Set the footer link
    setFooterLinkData(positions: any) {
      localStorage.setItem('footer-link', JSON.stringify(positions));
    }
  
    // Get the footer link
    getFooterLinkData() {
      const footer =  localStorage.getItem('footer-link');
      return footer ? JSON.parse(footer) : [];
    }

  // Get all footer link
  getFooterLink() {
    return this.api.get(`footer/link/get`);
  }

  // Add footer link
  saveFooterLink(token: string, data: any) {
    return this.api.post(`footer/link/save/${token}`, data);
  }

  // Update footer link
  updateFooterLink(token: string, data: any) {
    return this.api.post(`footer/link/update/${token}`, data);
  }

  // Desactivate a footer link
  disableFooterLink(token: string, data: any) {
    return this.api.post(`footer/link/desactive/${token}`, data);
  }

  // Enable a footer link
  enableFooterLink(token: string, data: any) {
    return this.api.post(`footer/link/reactive/${token}`, data);
  }

  // Delete a footer link
  deleteFooterLink(token: string, data: any) {
    return this.api.post(`footer/link/delete/${token}`, data);
  }


}
