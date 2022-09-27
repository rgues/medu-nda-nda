import { TranslateService } from '@ngx-translate/core';
import { CreateEventTypeComponent } from './../create-event-type/create-event-type.component';
import { UpdateEventTypeComponent } from '../update-event-type/update-event-type.component';
import { EventsService } from '../../../service/events.service';
import { ApiService } from 'src/app/service/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from '../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from '../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit } from '@angular/core';
import { slidePage, slideBlock } from 'src/app/animations';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';

@Component({
  selector: 'app-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss'],
  animations: [
    slidePage,
    slideBlock
  ]
})
export class EventTypeListComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  events: any;
  activeEvents: any;
  defaultEvents: any;
  user: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private spinner: NgxSpinnerService,
    private member: MembreService,
    private translate: TranslateService,
    private toast: ToastrService,
    private error: ErrorService,
    private modalService: NgbModal,
    private api: ApiService,
    private eventService: EventsService
  ) {
    this.loadingShow = false;
    this.events = [];
    this.activeEvents = [];
    this.defaultEvents = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.eventService.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getEvents();
      }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getEvents();
  }

  // get the family list
  getEvents() {
    this.loadingShow = false;
    this.eventService.getEventType().subscribe(events => {
      if (events && events.events) {
        this.loadingShow = false;
        this.defaultEvents = events.events;
        this.events = this.api.formatArrayToMatrix(this.defaultEvents, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.events.length;
        this.nbItems = this.defaultEvents.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }


  // Update the event type
  updateEventType(event: any) {
    // open update modal
    this.eventService.setEventSession(event);
    this.modalService.open(UpdateEventTypeComponent, { centered: true });
  }

    // Update the event type
    createEventType() {
      // open update modal
     this.modalService.open(CreateEventTypeComponent, { centered: true });
    }



  // delete events type
  deleteEventsType(events: any, index: number) {

   this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {

      if (ans === 'confirm') {

        const param = {
          event_type_id: events.event_type_id
        };
        this.loadingShow = true;
        this.spinner.show('event-type');
        this.eventService.deleteEventType(this.token, param).subscribe(reponse => {
    
          if (reponse && reponse.message === 'success') {
            this.loadingShow = false;
            this.translate.get('EVENT_DELETE_TYPE_SUCCESS').subscribe(trans => {
              this.toast.success(trans);
            });
            this.activeEvents.splice(index, 1);
            this.getEvents();
          }
          this.spinner.hide('event-type');
    
        }, error => {
          this.loadingShow = false;
          this.spinner.hide('event-type');
          if (error && error.error && error.error.message === 'error') {
    
            if (error.error.invalid_token) {
              this.member.logoutMember();
            }
    
            if (error.error.event_type_id_not_exist) {
              this.translate.get('EVENT_TYPE_NOT_EXIST').subscribe(trans => {
                this.toast.success(trans);
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
    this.events = this.api.formatArrayToMatrix(this.defaultEvents, this.nbItemsByPage);
    this.totalPages = this.events.length;
    this.updateActiveList(this.currentPage);
  }



  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.events[id - 1] && this.events[id - 1].length > 0) ?
      this.activeEvents = this.events[id - 1] : this.activeEvents = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.events[this.numero - 1] && this.events[this.numero - 1].length > 0) ?
        this.activeEvents = this.events[this.numero - 1] : this.activeEvents = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.events.length ? this.numero = position : this.numero = currentId;
      (this.events[this.numero - 1] && this.events[this.numero - 1].length > 0) ?
        this.activeEvents = this.events[this.numero - 1] : this.activeEvents = [];
      this.currentPage = this.numero;
    }
  }


}
