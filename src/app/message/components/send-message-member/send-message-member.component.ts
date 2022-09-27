import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './../../../service/api.service';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';
import { MessagesService } from 'src/app/service/messages.service';
import { ActivatedRoute, Router } from '@angular/router';

interface Members {
  choice: boolean;
  name: string;
  status: number;
  member_id: number;
}

@Component({
  selector: 'app-send-message-member',
  templateUrl: './send-message-member.component.html',
  styleUrls: ['./send-message-member.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class SendMessageMemberComponent implements OnInit {

  formMessage: FormGroup;
  loadingShow: boolean;
  memberList: Members[];
  tempMember: any;
  token: string;
  startDateSelect: Date;
  eventsList: any;
  eventsTypeList: any;
  eventsTypeListFilter: any;
  messageId: number;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private activeRoute: ActivatedRoute,
    private message: MessagesService,
    private translate: TranslateService,
    private router: Router,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private api: ApiService
  ) {
    this.memberList = [];
    this.tempMember = [];
    this.startDateSelect = new Date();
    this.eventsList = [];
    this.eventsTypeList = [];
    this.eventsTypeListFilter = [];
    this.messageId = this.activeRoute.snapshot.params.messageId
  }

  ngOnInit() {
    this.initFormMessage();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getMembersList();
  }

  initFormMessage() {
    this.formMessage = this.fb.group({
      message_id: [this.messageId, Validators.required],
      select:[''],
      mode:[false],
      active:[],
      mode1:[false],
      email_personnel:[1, Validators.required],
      email_medu_nda_nda:[0, Validators.required],
      liste_membre: [[], Validators.required]
    });
  }

    // update de mode
    updateMode(mode: number) {
      mode  ? this.formMessage.get('email_personnel').setValue(1) : this.formMessage.get('email_personnel').setValue(0);
    }

    // update de mode
    updateMode1(mode: number) {
      mode  ? this.formMessage.get('email_medu_nda_nda').setValue(1) : this.formMessage.get('email_medu_nda_nda').setValue(0);
    }
  

  // get the  member list
  getMembersList() {
    this.message.getMembers().subscribe(reponse => {
      if (reponse && reponse.membres) {
        this.tempMember = reponse.membres;
        const members: Members[] = [];
        this.tempMember.forEach(member => {
            members.push({
              choice: false,
              status: member.Status_Id,
              member_id: member.member_id,
              name:  member.Fname + ' ' + member.Lname
            });
        });
        this.memberList = this.api.oderByAlpha(members);
        this.formMessage.get('liste_membre').setValue(members);
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
      } 
    });
    this.formMessage.get('liste_membre').setValue(selectMember);
  }


  // select all the members
  selectAllMembers() {
    const members: Members[] = this.memberList;
    const tempMembers: Members[]  = [];
    members.forEach((member: any) => {
      tempMembers.push({
        choice: true,
        member_id: member.member_id,
        status: member.status,
        name:  member.name
      });
    });
    this.memberList = tempMembers;
    this.formMessage.get('liste_membre').setValue(tempMembers);
  }

  // Deselect all the members
  deselectAllMembers() {
    const members: Members[] = this.memberList;
    const tempMembers: Members[]  = [];
    members.forEach((member: any) => {
      tempMembers.push({
        choice: false,
        member_id: member.member_id,
        status: member.status,
        name:  member.name
      });
    });
    this.memberList = tempMembers;
    this.formMessage.get('liste_membre').setValue(tempMembers);
  }

    // Active  members
    activeMembers() {
      const members: Members[] = this.memberList;
      const tempMembers: Members[]  = [];
      members.forEach((member: any) => {
          tempMembers.push({
            choice: member.status === 2 ? true : false,
            member_id: member.member_id,
            status: member.status,
            name:  member.name
          });
      });
      this.memberList = tempMembers;
      this.formMessage.get('liste_membre').setValue(tempMembers);
    }

      // Observator  members
      observatorMembers() {
        const members: Members[] = this.memberList;
        const tempMembers: Members[]  = [];
        members.forEach((member: any) => {
          
            tempMembers.push({
              choice: member.status !== 2 ? true : false,
              member_id: member.member_id,
              status: member.status,
              name:  member.name
            });
          
       
        });
        this.memberList = tempMembers;
        this.formMessage.get('liste_membre').setValue(tempMembers);
      }

  // Select/Deselect all
  onSelectOrDeselect(select: any) {
    switch(select) {
      case 0 : 
        this.deselectAllMembers();
        break;
      case 1 :
        this.selectAllMembers(); 
        break;
      case 2 :
        this.activeMembers(); 
        break;
      case 3 :
        this.observatorMembers();
        break;
      default:
        break;  
    }
  }

    // send message to members
  sendTomembers() {
    this.loadingShow = true;
    this.spinner.show('send-message');
    this.message.sendMessageMembers(this.token, this.formMessage.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('MESSAGE_SENT_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormMessage();
        this.router.navigate(['/message']);
      }
      this.spinner.hide('send-message');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('send-message');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logout(this.token);
        }

        if (error.error.message_id_not_exist) {
          this.translate.get('MESSAGE_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.member_id_not_exist) {
          this.translate.get(['FORM_MEMBER', 'NOT_EXIST']).subscribe(trans => {
            this.toast.error(`${trans.FORM_MEMBER} ${error.error.value_member_id} ${trans.NOT_EXIST}`);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

}
