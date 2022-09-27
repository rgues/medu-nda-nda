import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from './../../../service/api.service';
import { Router } from '@angular/router';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RapportService } from './../../../service/rapport.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';

@Component({
  selector: 'app-list-type-report',
  templateUrl: './list-type-report.component.html',
  styleUrls: ['./list-type-report.component.scss']
})
export class ListTypeReportComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  reports: any;
  activeReports: any;
  defaultReports: any;
  user: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private router: Router,
    private api: ApiService,
    private report: RapportService
  ) {
    this.loadingShow = false;
    this.reports = [];
    this.activeReports = [];
    this.defaultReports = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.report.getUpdateMessage().subscribe(data => {
        if (data && data.message === 'update') {
          this.getTypeReports();
        }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getTypeReports();
  }

  // Add type report
  addTypeReport() {
    this.router.navigate(['/report-type/add-type']);
  }

   // Update type report
   updateTypeReport(report) {
     this.report.setCurrentDoc(report);
     this.router.navigate(['/report-type/update-type']);
   }

  // get type reports list
  getTypeReports() {
    this.loadingShow = true;
    this.report.getAllTypeFiles(this.token).subscribe(reponse => {
      if (reponse && reponse.type_document) {
        this.loadingShow = false;
        this.defaultReports = reponse.type_document;
        this.reports = this.api.formatArrayToMatrix(this.defaultReports, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.reports.length;
        this.nbItems = this.defaultReports.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // delete type of report
  deleteTypeReport(report: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {

    const param = {
      type_file_id: report.type_file_id
    };

    this.loadingShow = true;
    this.spinner.show('delete-report');
    this.report.deleteTypeFile(this.token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('REPORT_TYPE_DELETE_SUCCESS_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activeReports.splice(index, 1);
        this.getTypeReports();
      }
      this.spinner.hide('delete-report');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-report');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.type_file_id_not_exist) {
          this.translate.get('FILE_TYPE_NOT_EXIT').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
   }
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
    this.reports = this.api.formatArrayToMatrix(this.defaultReports, this.nbItemsByPage);
    this.totalPages = this.reports.length;
    this.updateActiveList(this.currentPage);
  }

  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.reports[id - 1] && this.reports[id - 1].length > 0) ?
      this.activeReports = this.reports[id - 1] : this.activeReports = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.reports[this.numero - 1] && this.reports[this.numero - 1].length > 0) ?
        this.activeReports = this.reports[this.numero - 1] : this.activeReports = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.reports.length ? this.numero = position : this.numero = currentId;
      (this.reports[this.numero - 1] && this.reports[this.numero - 1].length > 0) ?
        this.activeReports = this.reports[this.numero - 1] : this.activeReports = [];
      this.currentPage = this.numero;
    }
  }

}
