import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerComponent } from '../../../shared/components/pdf-viewer/pdf-viewer.component';
import { ApiService } from '../../../service/api.service';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from '../../../service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { RapportService } from '../../../service/rapport.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list-type-report-doc',
  templateUrl: './list-type-report-doc.component.html',
  styleUrls: ['./list-type-report-doc.component.scss']
})
export class ListTypeReportDocComponent implements OnInit {

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
  typeFilterId: any;

  constructor(
    private activeRoute: ActivatedRoute,
    private member: MembreService,
    private error: ErrorService,
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
    this.typeDocs = [];
    this.report.getUpdateMessage().subscribe(data => {
        if (data && data.message === 'update') {
          this.getReports(this.typeFilterId);
        }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.typeFilterId = this.activeRoute.snapshot.params.typeDoc;
    this.getReports(parseInt(this.typeFilterId,10));
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


  // show the report
  showReport(report) {
      // open the pdf
      this.report.setCurrentDoc(report);
      this.modalSevice.open(PdfViewerComponent, { centered: true, size: 'lg', windowClass: 'modal-xl'});
  }

  // get the family list
  getReports(typeDoc: number) {
    this.loadingShow = true;
    this.report.getAllFiles(this.token).subscribe(reponse => {
      if (reponse && reponse.files) {
       const docs = [];
        reponse.files.forEach(report => {
            if( (report.type_file_id === typeDoc || (typeDoc === -1 && report.type_file_id !== 1 && report.type_file_id !== 2 && report.type_file_id !== 3 &&
              report.type_file_id !== 5 && report.type_file_id !== 6)) && report.expired === 0 ) {
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
