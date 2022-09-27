import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerComponent } from '../../../shared/components/pdf-viewer/pdf-viewer.component';
import { ApiService } from '../../../service/api.service';
import { Router } from '@angular/router';
import { ErrorService } from '../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RapportService } from '../../../service/rapport.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';

@Component({
  selector: 'app-list-report-doc',
  templateUrl: './list-report-doc.component.html',
  styleUrls: ['./list-report-doc.component.scss']
})
export class ListReportDocComponent implements OnInit {

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
  searchTerm: string;
  typeDocs: any[];
  typeFilterId: number;

  constructor(
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private router: Router,
    private api: ApiService,
    private report: RapportService,
    private modalSevice: NgbModal
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
    this.typeFilterId = -1;
    this.typeDocs = [];
    this.report.getUpdateMessage().subscribe(data => {
        if (data && data.message === 'update') {
          this.getReports();
        }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getReports();
    this.getTypeReports();
  }

      // Filter by name
      filterByKeyword(keyword: string) {
        let resultFilter = [];
        let words = '';
        let key = '';
        this.defaultReports.forEach(doc => {
          if (doc) {
            words = doc.document_name;
            words = words.toLowerCase();
            key = keyword.trim().toLowerCase();
            if (words.match(key)) {
              resultFilter.push(doc);
            }
          }
        });
        this.reports = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.reports.length;
        this.nbItems = resultFilter.length;
        
      }

  // Filter by type
  filterByType(docTypeId) {
    const resultFilter = [];
    this.defaultReports.forEach(doc => {
      if (doc.type_file_id === docTypeId || docTypeId === -1 ) {
          resultFilter.push(doc); 
      }
    });
    this.reports = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.updateActiveList(1);
    this.totalPages = this.reports.length;
    this.nbItems = resultFilter.length;
  }

        // get type reports list
  getTypeReports() {
    this.report.getAllTypeFiles(this.token).subscribe(reponse => {
      if (reponse && reponse.type_document) {
          this.typeDocs = reponse.type_document;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Add report
  addReport() {
    this.router.navigate(['/doc/add-doc']);
  }

   // Add report
   updateReport(report) {
     this.report.setCurrentDoc(report);
     this.router.navigate(['/doc/update-doc']);
   }

  // show the report
  showReport(report) {
      // open the pdf
      this.report.setCurrentDoc(report);
      this.modalSevice.open(PdfViewerComponent, { centered: true, size: 'lg', windowClass: 'modal-xl'});
  }

  // get the family list
  getReports() {
    this.loadingShow = true;
    this.report.getAllFiles(this.token).subscribe(reponse => {
      if (reponse && reponse.files) {
       const docs = [];
        reponse.files.forEach(report => {
            if( report.type_file_id === 3 && (this.user.executive_id===5 || this.user.executive_id === 3 
              || this.user.executive_id === 4 || this.user.executive_id===2 
              || this.user.executive_id===6 || this.user.executive_id===1) || report.type_file_id !== 3) {
                docs.push(report);
            }
        });
        this.loadingShow = false;
        this.defaultReports = this.api.oderByDateCreated(docs);
        this.reports = this.api.formatArrayToMatrix(this.defaultReports, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.reports.length;
        this.nbItems = this.defaultReports.length;
      }
    }, error => {
      this.loadingShow = false;
      this.error.manageError(error);
    });
  }



  // delete report
  deleteReport(report: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {

    const param = {
      file_id: report.file_id
    };

    this.loadingShow = true;
    this.spinner.show('delete-report');
    this.report.deleteFile(this.token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('REPORT_DELETE_SUCCESS_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activeReports.splice(index, 1);
        this.getReports();
      }
      this.spinner.hide('delete-report');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-report');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.file_id_not_exist) {
          this.translate.get('REPORT_NOT_EXIST').subscribe(trans => {
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

   // disable report
   desactivateReport(report: any) {

    const param = {
      file_id: report.file_id
    };

    this.loadingShow = true;
    this.spinner.show('delete-report');
    this.report.disableFile(this.token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('REPORT_DELETE_SUCCESS_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.getReports();
      }
      this.spinner.hide('delete-report');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-report');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logout(this.token);
        }

        if (error.error.file_id_not_exist) {
          this.translate.get('REPORT_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
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
