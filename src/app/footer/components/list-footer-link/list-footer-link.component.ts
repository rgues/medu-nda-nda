import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { FooterService } from 'src/app/service/footer.service';
import { ApiService } from 'src/app/service/api.service';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-footer-link',
  templateUrl: './list-footer-link.component.html',
  styleUrls: ['./list-footer-link.component.scss']
})
export class ListFooterLinkComponent implements OnInit {

  listLinks: any;
  defaultListLinks: any;
  activelistLinks: any;
  loadingShow: boolean;
  user: any;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private api: ApiService,
    private router: Router,
    private member: MembreService,
    private modalService: NgbModal,
    private footer: FooterService,
    private errorService: ErrorService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.listLinks = [];
    this.defaultListLinks = [];
    this.activelistLinks = [];
    this.loadingShow = false;

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 10;
    this.currentPage = 1;
    this.numero = 1;
    this.user = this.member.getUserSession();
    this.footer.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getFooterLink();
      }
    });
  }


  ngOnInit() {
    this.getFooterLink();
  }

  // Get foter link list
  getFooterLink() {
    this.loadingShow = true;
    this.footer.getFooterLink().subscribe((links: any) => {
      this.loadingShow = false;
      if (links && links.footer_link.length > 0) {
        this.defaultListLinks = links.footer_link;
        this.listLinks = this.api.formatArrayToMatrix(this.defaultListLinks, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.listLinks.length;
        this.nbItems = this.defaultListLinks.length;
      }
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }

  // Pagination function

  // get number items by page
  getNumberItems() {
    let i = 5;
    const nbItemsByPage = [];
    while (i < this.nbItems) {
      nbItemsByPage.push(i);
      i *= 2;
    }
    return nbItemsByPage;
  }

  // Update the number of pages
  updateNumberItems(nbItems: number) {
    this.nbItemsByPage = nbItems;
    this.listLinks = this.api.formatArrayToMatrix(this.defaultListLinks, this.nbItemsByPage);
    this.totalPages = this.listLinks.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listLinks[id - 1] && this.listLinks[id - 1].length > 0) ?
      this.activelistLinks = this.listLinks[id - 1] : this.activelistLinks = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listLinks[this.numero - 1] && this.listLinks[this.numero - 1].length > 0) ?
        this.activelistLinks = this.listLinks[this.numero - 1] : this.activelistLinks = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listLinks.length ? this.numero = position : this.numero = currentId;
      (this.listLinks[this.numero - 1] && this.listLinks[this.numero - 1].length > 0) ?
        this.activelistLinks = this.listLinks[this.numero - 1] : this.activelistLinks = [];
      this.currentPage = this.numero;
    }
  }


  // Add a new link
  addLink() {
    this.router.navigate(['/footer/add-footer-link']);
  }

  // Update a footer link
  updateLink(link: any) {
    this.footer.setFooterLinkData(link);
    this.router.navigate(['/footer/update-footer-link']);
  }

  // Delete footer link
  deleteLink(footer: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {

      if (ans === 'confirm') {

    this.loadingShow = true;
    this.spinner.show('delete-footer');
    const member = this.member.getUserSession();

    const param = {
      link_id: footer.footer_link_id
    };

    this.footer.deleteFooterLink(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('FOOTER_DELETE_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activelistLinks.splice(index, 1);
        this.getFooterLink();
      }
      this.spinner.hide('delete-footer');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-footer');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.link_id_not_exist) {
          this.translate.get('LINK_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

        if (error.error.invalid_token) {
            this.member.logoutMember();
        }

      } else {
        this.errorService.manageError(error);
      }
    });
    }
  });
  }

    // Activate footer link
    activateLink(footer: any) {

      this.loadingShow = true;
      this.spinner.show('delete-footer');
      const member = this.member.getUserSession();
  
      const param = {
        link_id: footer.footer_link_id
      };
  
      this.footer.enableFooterLink(member.remenber_token, param).subscribe(reponse => {
  
        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('FOOTER_ENABLE_MSG').subscribe(trans => {
            this.toast.success(trans);
          });
          this.getFooterLink();
        }
        this.spinner.hide('delete-footer');
  
      }, error => {
        this.loadingShow = false;
        this.spinner.hide('delete-footer');
        if (error && error.error && error.error.message === 'error') {
  
          if (error.error.link_id_not_exist) {
            this.translate.get('LINK_NOT_EXIST').subscribe(trans => {
              this.toast.success(trans);
            });
          }
  
          if (error.error.invalid_token) {
              this.member.logoutMember();
          }
  
        } else {
          this.errorService.manageError(error);
        }
      });
    }

      // Desactivate footer link
      desactivateLink(footer: any) {

    this.loadingShow = true;
    this.spinner.show('delete-footer');
    const member = this.member.getUserSession();

    const param = {
      link_id: footer.footer_link_id
    };

    this.footer.disableFooterLink(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('FOOTER_DISABLE_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.getFooterLink();
      }
      this.spinner.hide('delete-footer');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-footer');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.link_id_not_exist) {
          this.translate.get('LINK_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

        if (error.error.invalid_token) {
            this.member.logoutMember();
        }

      } else {
        this.errorService.manageError(error);
      }
    });
  }


}
