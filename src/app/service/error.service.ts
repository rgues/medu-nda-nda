import { ConfirmLogoutComponent } from './../shared/components/confirm-logout/confirm-logout.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MembreService } from 'src/app/service/membre.service';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private toastr: ToastrService,
    private membre: MembreService,
    private modalService: NgbModal

  ) { }

  // Renew the user session
  renewSession() {
    const credentials = this.membre.getUserSecret();
    if (credentials) {
      this.membre.login(credentials).subscribe(
        (reponse: any) => {
          if (reponse && reponse.message === 'success') {
            this.membre.setUserSession(reponse.user);
            this.toastr.success('The session has been successfully renewed.');
          }
        }, error => {
          if (error && error.error && error.error.user_not_found) {
            this.membre.logoutMember();
          }
        });
    } else {
      this.membre.logoutMember();
    }
  }

  manageError(error) {

    if (error.status === 0) {
      this.toastr.error('Impossible de se connecter à Internet !');
    } else if (error === 400) {
      this.toastr.error('Vous n\' êtes pas autorisé à effectuer cette action.');
    } else if (error.status === 401) {
      if (this.membre.getUserSecret()) {
        const logoutModal = this.modalService.open(ConfirmLogoutComponent, { centered: true });
        logoutModal.result.then(reponse => {
          if (reponse === 'logout') {
            this.renewSession();
          } else if (reponse === 'cancel') {
            this.membre.logoutMember();
          }
        });
      } else {
        this.membre.logoutMember();
      }
    } else if (error.status === 500) {
      this.toastr.error('Le système est momentannément indisponible !');
    } else {
      this.toastr.error('Le système est en maintenace, ressayer plus tard!');
    }
  }
}
