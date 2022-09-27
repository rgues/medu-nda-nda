import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerComponent } from '../../../shared/components/pdf-viewer/pdf-viewer.component';
import { ApiService } from '../../../service/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorService } from '../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RapportService } from '../../../service/rapport.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';

@Component({
  selector: 'app-list-member-doc',
  templateUrl: './list-member-doc.component.html',
  styleUrls: ['./list-member-doc.component.scss']
})
export class ListMemberDocComponent implements OnInit {

  
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
  currentMember: any;
  searchTerm: string;

  constructor(
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private activeRoute: ActivatedRoute,
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
    this.member.getUpdateMessage().subscribe(data => {
        if (data && data.message === 'update') {
          this.getReports();
        }
    });
  }

  ngOnInit() {
    this.currentMember = this.activeRoute.snapshot.params.memberId;
    this.user = this.member.getUserSession();
    this.token = this.user.remenber_token;
    this.getReports();
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

  // Add report
  addReport() {
    this.router.navigate(['/member-doc/add-doc']);
  }

   // update report
   updateReport(report, memberId) {
     this.report.setCurrentDoc(report);
     this.router.navigate(['/member-doc/update-doc', memberId]);
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
    this.member.getAllMemberFiles(this.token,this.currentMember).subscribe(reponse => {
      if (reponse && reponse.files) {
        this.loadingShow = false;
        this.defaultReports = reponse.files;
        this.reports = this.api.formatArrayToMatrix(this.defaultReports, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.reports.length;
        this.nbItems = this.defaultReports.length;
      }
    }, error => {
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
    this.member.deleteMemberFile(this.token, param).subscribe(reponse => {

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
