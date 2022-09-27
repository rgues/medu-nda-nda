import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from 'src/app/service/api.service';
import { TestimonyService } from 'src/app/service/testimony.service';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-list-testimony',
  templateUrl: './list-testimony.component.html',
  styleUrls: ['./list-testimony.component.scss']
})
export class ListTestimonyComponent implements OnInit {
  listTestis: any;
  defaultListTestis: any;
  activelistTestis: any;
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
    private testimony: TestimonyService,
    private errorService: ErrorService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.listTestis = [];
    this.defaultListTestis = [];
    this.activelistTestis = [];
    this.loadingShow = false;

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 10;
    this.currentPage = 1;
    this.numero = 1;
    this.user = this.member.getUserSession();
    this.testimony.getUpdateMessage().subscribe(data => {
          if (data && data.message === 'update') {
            this.getFooterTestimony();
          }
    });
  }


  ngOnInit() {
    this.getFooterTestimony();
  }

  // Get testimony list
  getFooterTestimony() {
    this.loadingShow = true;
    this.testimony.getTestimony().subscribe((ans: any) => {
      this.loadingShow = false;
      if (ans && ans.thought.length > 0) {
        this.defaultListTestis = ans.thought;
        this.listTestis = this.api.formatArrayToMatrix(this.defaultListTestis, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.listTestis.length;
        this.nbItems = this.defaultListTestis.length;
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
    this.listTestis = this.api.formatArrayToMatrix(this.defaultListTestis, this.nbItemsByPage);
    this.totalPages = this.listTestis.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listTestis[id - 1] && this.listTestis[id - 1].length > 0) ?
      this.activelistTestis = this.listTestis[id - 1] : this.activelistTestis = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listTestis[this.numero - 1] && this.listTestis[this.numero - 1].length > 0) ?
        this.activelistTestis = this.listTestis[this.numero - 1] : this.activelistTestis = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listTestis.length ? this.numero = position : this.numero = currentId;
      (this.listTestis[this.numero - 1] && this.listTestis[this.numero - 1].length > 0) ?
        this.activelistTestis = this.listTestis[this.numero - 1] : this.activelistTestis = [];
      this.currentPage = this.numero;
    }
  }


  // Add a new testimony
  addTesti() {
    this.router.navigate(['/testimony/add-testimony']);
  }

  // Update a testimony
  updateTesti(testi: any) {
    this.testimony.setTestimonyData(testi);
    this.router.navigate(['/testimony/update-testimony']);
  }

  // Delete testimony
  deleteTesti(thought: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {

    this.loadingShow = true;
    this.spinner.show('delete-testi');
    const member = this.member.getUserSession();

    const param = {
      thought_id: thought.thought_id
    };

    this.testimony.deleteMemberThought(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('TESTI_DELETE_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activelistTestis.splice(index, 1);
        this.getFooterTestimony();
      }
      this.spinner.hide('delete-testi');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-testi');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.thought_id_not_exist) {
          this.translate.get('THOUGHT_NOT_EXIST').subscribe(trans => {
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
    activateTesti(thought: any) {

      this.loadingShow = true;
      this.spinner.show('delete-testi');
      const member = this.member.getUserSession();
  
      const param = {
        thought_id: thought.thought_id
      };
  
      this.testimony.enableMemberThought(member.remenber_token, param).subscribe(reponse => {
  
        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('TESTI_ENABLE_MSG').subscribe(trans => {
            this.toast.success(trans);
          });
          this.getFooterTestimony();
        }
        this.spinner.hide('delete-testi');
  
      }, error => {
        this.loadingShow = false;
        this.spinner.hide('delete-testi');
        if (error && error.error && error.error.message === 'error') {
  
          if (error.error.thought_id_not_exist) {
            this.translate.get('THOUGHT_NOT_EXIST').subscribe(trans => {
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

      // Desactivate testimony
      desactivateTesti(thought: any) {

    this.loadingShow = true;
    this.spinner.show('delete-testi');
    const member = this.member.getUserSession();

    const param = {
      thought_id: thought.thought_id
    };

    this.testimony.disableMemberThought(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('TESTI_DISABLE_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.getFooterTestimony();
      }
      this.spinner.hide('delete-testi');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-testi');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.thought_id_not_exist) {
          this.translate.get('THOUGHT_NOT_EXIST').subscribe(trans => {
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
