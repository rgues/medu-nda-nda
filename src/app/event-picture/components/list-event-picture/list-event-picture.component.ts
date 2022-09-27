import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../service/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorService } from '../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RapportService } from '../../../service/rapport.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { ImageViewerComponent } from 'src/app/shared/components/image-viewer/image-viewer.component';
import { EventsService } from 'src/app/service/events.service';

@Component({
  selector: 'app-list-event-picture',
  templateUrl: './list-event-picture.component.html',
  styleUrls: ['./list-event-picture.component.scss']
})
export class ListEventPictureComponent implements OnInit {

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
  eventId: number;

  constructor(
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private member: MembreService,
    private acitiveRoute: ActivatedRoute,
    private modalService: NgbModal,
    private event: EventsService,
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
    this.eventId = this.acitiveRoute.snapshot.params.eventId;
    this.event.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getPicture();
      }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getPicture();
  }

  // Add picture
  addPicture() {
    this.router.navigate(['/picture-event/add-picture']);
  }

   // update picture
   updatePicture(picture) {
     this.event.setEventSession(picture);
     this.router.navigate(['/picture-event/update-picture']);
   }

  // show the picture
  showPicture(report) {
      // open the picture
      this.report.setCurrentDoc(report);
      this.modalSevice.open(ImageViewerComponent, { centered: true, size: 'lg', windowClass: 'modal-xl'});
  }

  // get the picture list
  getPicture() {
    this.loadingShow = true;
    this.event.getPictures(this.token, this.eventId).subscribe(reponse => {
      if (reponse && reponse.pictures) {
        this.loadingShow = false;
        this.defaultReports = reponse.pictures;
        this.reports = this.api.formatArrayToMatrix(this.defaultReports, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.reports.length;
        this.nbItems = this.defaultReports.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }



  // delete picture
  deletePicture(report: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {

    const param = {
      picture_id: report.id,
      event_id : this.eventId
    };

    this.loadingShow = true;
    this.spinner.show('delete-picture');
    this.event.deletePicture(this.token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('PICTURE_DELETED_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activeReports.splice(index, 1);
        this.getPicture();
      }
      this.spinner.hide('delete-picture');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-picture');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.event_id_not_exist) {
          this.translate.get('EVENT_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
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
