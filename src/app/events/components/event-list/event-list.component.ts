import { TranslateService } from '@ngx-translate/core';
import { EventsService } from './../../../service/events.service';
import { ApiService } from 'src/app/service/api.service';
import { Router } from '@angular/router';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit } from '@angular/core';
import { slidePage, slideBlock } from 'src/app/animations';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  animations: [
    slidePage,
    slideBlock
  ]
})
export class EventListComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  events: any;
  activeEvents: any;
  defaultEvents: any;
  user: any;
  eventsTypeList: any;
  eventPlaceList: any;
  yearList: any[];

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  listMembers: any;
  eventTypeFilter: any;
  eventYearFilter: any;
  searchTerm: string;
  filterData: any[];

  constructor(
    private spinner: NgxSpinnerService,
    private member: MembreService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private toast: ToastrService,
    private error: ErrorService,
    private router: Router,
    private api: ApiService,
    private eventService: EventsService
  ) {
    this.loadingShow = false;
    this.events = [];
    this.activeEvents = [];
    this.defaultEvents = [];
    this.eventsTypeList = [];
    this.eventPlaceList = [];
    this.filterData = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.eventYearFilter = -1;
    this.eventTypeFilter = -1;
    this.numero = 1;
    this.listMembers = [];
    this.searchTerm = '';
    this.yearList = [];
    const currentYear = new Date().getFullYear();
    for (let i=0; i < 10; i++) {
      this.yearList.push(currentYear - i);
    }

    this.eventService.getUpdateMessage().subscribe(data => {
        if (data && data.message === 'update') {
          this.getEventsType();
          this.getEventsLocation();
          this.getEvents();
        }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getEventsType();
    this.getEventsLocation();
    this.getEvents();
    this.getMembers();
  }

  // get the family list
  getEvents() {
    this.loadingShow = true;
    this.eventService.getEvents().subscribe(events => {
      if (events && events.events) {
        this.loadingShow = false;
        this.defaultEvents = this.api.oderByEventsDate(events.events);
        this.events = this.api.formatArrayToMatrix(this.defaultEvents, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.events.length;
        this.nbItems = this.defaultEvents.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

    // Filter by name
    filterByKeyword(keyword: string) {
      const resultFilter = [];
      let words = '';
      let key = '';
      this.defaultEvents.forEach(event => {
        if (event) {
          words = event.description;
          words = words.toLowerCase();
          key = keyword.trim().toLowerCase();
          if (words.match(key)) {
            resultFilter.push(event);
          }
        }
      });
      this.events = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages =  this.events.length;
      this.nbItems = resultFilter.length;
    }

    filterByTypeAndYear(eventTypeId, year) {
      let resultFilter = [];
      this.defaultEvents.forEach(event => {
        if (event.event_type_id === eventTypeId || eventTypeId === -1) {
            resultFilter.push(event); 
        }
      });
      this.filterData = resultFilter;
      resultFilter = [];
      this.filterData.forEach(event => {
        if (event && event.event_date) {
          const currentYear = new Date(event.event_date).getFullYear();
          if (currentYear === year || year === -1 ) {
              resultFilter.push(event); 
          }
        }
    
      });
      this.events = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages =  this.events.length;
      this.nbItems = resultFilter.length;

    }
  
    // Filter by type
    filterByType(eventTypeId) {
      const resultFilter = [];
      this.defaultEvents.forEach(event => {
        if (event.event_type_id === eventTypeId || eventTypeId === -1) {
            resultFilter.push(event); 
        }
      });
      this.events = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages =  this.events.length;
      this.nbItems = resultFilter.length;
    }
  
    // Get all active article
    filterByYear(year) {
      const resultFilter = [];
      this.defaultEvents.forEach(event => {
        if (event && event.event_date) {
          const currentYear = new Date(event.event_date).getFullYear();
          if (currentYear === year || year === -1 ) {
              resultFilter.push(event); 
          }
        }
    
      });
      this.events = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages =  this.events.length;
      this.nbItems = resultFilter.length;
    }

    // Update the event location
    updateEvent(event: any) {
      // open update modal
      this.eventService.setEventSession(event);
      this.router.navigate(['/events/update-event']);
    }

  // Add Event
  createEvent() {
      this.router.navigate(['/events/create-event']);
  }

  // Get the list of transaction
  getTransaction(event: any) {
    this.router.navigate(['/events/transactions-events', event.event_id]);
  }

  // get the event pictures
  getPicture(event: any) {
    this.router.navigate(['/picture-event/list-picture',  event.event_id]);
  }

  // get list of attendance
  getAttendance(event: any) {
    this.eventService.setEventsSession(event);
    this.router.navigate(['/events/attendance-events', event.event_id]);
  }

  // Get the list of lateness
  getLateness(event: any) {
    this.eventService.setEventsSession(event);
    this.router.navigate(['/events/lateness-events', event.event_id]);
  }

  // Get the list of members
   getMembers() {
    this.member.getListOfMembers().subscribe(members => {
      this.listMembers = members.membres;
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the members the name
  getMemberName(members: any, memberId: number) {
    let memberName = '';
    members.forEach(member => {
        if (member && member.member_id === memberId) {
          memberName = member.Fname + '' + member.Lname;
        }
    });
    return memberName;
  }

  // get the events type list
  getEventsType() {
    this.eventService.getEventType().subscribe(events => {
      if (events && events.events) {
        this.eventsTypeList = events.events;
        console.log(this.eventsTypeList);
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the event type name
  getTypeEventName(eventTypeId: number) {
    return this.eventService.getEventName(eventTypeId, this.eventsTypeList);
  }


   // get the events type list
   getEventsLocation() {
    this.eventService.getEventLocation().subscribe(events => {
      if (events && events.places) {
        this.eventPlaceList = events.places;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the event type name
  getLocationEventName(eventPlaceId: number) {
    return this.eventService.getLocationName(eventPlaceId, this.eventPlaceList);
  }


  // delete events
  deleteEvents(events: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {

      if (ans === 'confirm') {

    const param = {
      event_id: events.event_id
    };

    this.loadingShow = true;
    this.spinner.show('delete-event');
    this.eventService.deleteEvent(this.token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EVENT_DELETE_EVENT_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activeEvents.splice(index, 1);
        this.getEvents();
      }
      this.spinner.hide('delete-event');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-event');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.event_id_not_exist) {
          this.translate.get('EVENT_NOT_EXIST').subscribe(trans => {
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
