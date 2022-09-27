import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/service/api.service';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from './../../../service/events.service';
import { ErrorService } from 'src/app/service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

interface Members {
  choice: boolean;
  name: string;
  member_id: number;
  late: number;
}

@Component({
  selector: 'app-event-lateness',
  templateUrl: './event-lateness.component.html',
  styleUrls: ['./event-lateness.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class EventLatenessComponent implements OnInit {
  formEventLateness: FormGroup;
  loadingShow: boolean;
  memberList: Members[];
  tempMember: any;
  token: string;
  startDateSelect: Date;
  eventsList: any;
  eventsTypeList: any;
  eventsTypeListFilter: any;
  eventData: any;
  eventId: number;
  translations: string[];
  tableData: any;
  user: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private eventService: EventsService,
    private activeRoute: ActivatedRoute,
    private api: ApiService
  ) {
    this.memberList = [];
    this.tempMember = [];
    this.startDateSelect = new Date();
    this.eventsList = [];
    this.eventsTypeList = [];
    this.eventsTypeListFilter = [];
    this.eventData = this.eventService.getEventSession();
    this.eventId = this.activeRoute.snapshot.params.eventId;
    this.translations = [];
  }

  ngOnInit() {
    this.initFormEventLateness();
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getMembersLateness();
  }

  initFormEventLateness() {
    this.formEventLateness = this.fb.group({
      event_id: [this.eventId, Validators.required],
      liste_membre: [[], Validators.required]
    });
  }


  // get the lateness member list
  getMembersLateness() {
    this.eventService.membersLatenessStatus(this.token, this.eventId).subscribe(reponse => {
      if (reponse && reponse.members) {
        this.tempMember = reponse.members;
        const members: Members[] = [];
        this.tempMember.forEach(member => {
          members.push({
            choice: member.late === 1 ? true : false,
            member_id: member.member_id,
            name: member.firstname + ' ' + member.lastname,
            late: member.late
          });
        });
        this.memberList = this.api.oderByAlpha(members);
        this.formEventLateness.get('liste_membre').setValue(members);
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Add selected member
  getSelectedMember() {
    const selectMember: Members[] = [];
    this.memberList.forEach(member => {
      if (member.choice) {
        selectMember.push(member);
        selectMember[this.memberList.indexOf(member)].late = 1;
      } else {
        selectMember.push(member);
        selectMember[this.memberList.indexOf(member)].late = 0;
      }
    });

    this.formEventLateness.get('liste_membre').setValue(selectMember);
  }

  // update event lateness
  updateEventLateness() {
    this.loadingShow = true;
    this.spinner.show('event-late');
    this.eventService.updateMemberLateness(this.token, this.formEventLateness.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EVENT_LATENESS_ADD_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormEventLateness();
        this.getMembersLateness();
      }
      this.spinner.hide('event-late');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('event-late');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.event_id_not_exist) {
          this.translate.get('EVENT_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.member_id_not_exist) {
          this.translate.get('EVENT_PARTICIPATION_MEMBER_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

  
 //  ===================================  Impression ================================
    // Construct the table for Impression
    constructTableMembers(data: any[]) {
      this.tableData = [];
      let ligneData = [];
      let index = 1;
      data.forEach(member => {
        if (member.late === 1) {
          ligneData = [];
          ligneData.push(index);
          ligneData.push(member.Fname);
          ligneData.push(member.Lname);
          this.tableData.push(ligneData);
          index++;
        }

      });
      return this.tableData;
    }

    // Generate the Pdf
    imprimerPdf() {
      const doc = new jsPDF('landscape');
      const dateFormat = new Date();
      const dateValue = dateFormat.getFullYear() + '-' + (dateFormat.getMonth() + 1 < 10 ?
        '0' + (dateFormat.getMonth() + 1) : (dateFormat.getMonth() + 1)) + '-' + (dateFormat.getDate() < 10 ?
          '0' + dateFormat.getDate() : dateFormat.getDate());
      const heureValue = (dateFormat.getHours() < 10 ?
        '0' + dateFormat.getHours() : dateFormat.getHours()) + ':' + (dateFormat.getMinutes() < 10 ?
          '0' + dateFormat.getMinutes() : dateFormat.getMinutes()) + ':' + (dateFormat.getSeconds() < 10 ?
            '0' + dateFormat.getSeconds() : dateFormat.getSeconds());
      const userInfos = this.user ? this.user.Fname + ' ' + this.user.Lname : 'Administrator';
  
      doc.setFont('courier');
      doc.setFontType('normal');
      doc.setFontSize(12);
      const img = new Image();
      img.src = 'assets/images/medundanda.png';
      this.translate.get(['EVENT_LIST_LATENESS','FORM_FIRSTNAME','FORM_LASTNAME'
      ,'PRINT_BY','PRINT_ON','PRINT_AT','FORM_EVENT'])
      .subscribe(trans => {
        this.translations.push(trans.EVENT_LIST_LATENESS);
        this.translations.push(trans.FORM_FIRSTNAME);
        this.translations.push(trans.FORM_LASTNAME);
        this.translations.push(trans.PRINT_BY);
        this.translations.push(trans.PRINT_ON);
        this.translations.push(trans.PRINT_AT);
        this.translations.push(trans.FORM_EVENT);
      });
      
      doc.addImage(img, 'png', 230, 10, 50, 20);
  
          doc.text(20, 35, `${this.translations[0]} : ${this.eventData.description}`);
          doc.autoTable({
            theme: 'grid',
            head: [['Nº',  `${this.translations[1]}`,`${this.translations[2]}`]],
            body: this.constructTableMembers(this.tempMember),
            margin: { top: 40 },
            didDrawPage: (data) => {
              doc.text(150, 5, ` ${this.translations[3]} :  ` + userInfos
                +` ${this.translations[4]} ` + dateValue + ' ' + ` ${this.translations[5]} ` + heureValue);
            }
          });
        
      doc.save(`${`${this.translations[6]}`}_${this.api.getTimePrefix()}.pdf`);
    }

}
