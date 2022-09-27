import { TranslateService } from '@ngx-translate/core';
import { PdfViewerComponent } from './../../../shared/components/pdf-viewer/pdf-viewer.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventsService } from './../../../service/events.service';
import { RapportService } from './../../../service/rapport.service';
import { ApiService } from './../../../service/api.service';
import { Router } from '@angular/router';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-report',
  templateUrl: './event-report.component.html',
  styleUrls: ['./event-report.component.scss']
})
export class EventReportComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  reports: any;
  activeReports: any;
  defaultReports: any;
  user: any;
  currentEvent: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private router: Router,
    private api: ApiService,
    private report: RapportService,
    private eventService: EventsService,
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
    this.currentEvent = this.eventService.getEventSession();
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
  }

  // Add report
  addReport() {
    this.router.navigate(['/report/add-report']);
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
    this.report.getEventReports(this.token, this.currentEvent.event_id).subscribe(reponse => {
      if (reponse && reponse.report) {
        this.loadingShow = false;
        this.defaultReports = reponse.report;
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

    const param = {
      report_id: report.id
    };

    this.loadingShow = true;
    this.spinner.show('delete-report');
    this.report.deleteReports(this.token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EVENT_DELETE_REPORT_SUCCESS').subscribe(trans => {
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

        if (error.error.report_id_not_exist) {
          this.translate.get('EVENT_REPORT_NOT_EXIST').subscribe(trans => {
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
