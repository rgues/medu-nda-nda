import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './../../../service/api.service';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from 'src/app/service/messages.service';

interface Famille {
  choice: boolean;
  name: string;
  famille_id: number;
}

@Component({
  selector: 'app-send-message-family',
  templateUrl: './send-message-family.component.html',
  styleUrls: ['./send-message-family.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class SendMessageFamilyComponent implements OnInit {
  formMessage: FormGroup;
  loadingShow: boolean;
  familleList: Famille[];
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
    this.familleList = [];
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
    this.getFamiliesList();
  }

  initFormMessage() {
    this.formMessage = this.fb.group({
      message_id: [this.messageId, Validators.required],
      select:[''],
      mode:[false],
      mode1:[false],
      email_personnel:[1, Validators.required],
      email_medu_nda_nda:[0, Validators.required],
      liste_famille: [[], Validators.required]
    });
  }

  // Select active users
  onSelectActive() {

  }

  // get the  family list
  getFamiliesList() {
    this.message.getRpnMembers(this.token).subscribe(reponse => {
      if (reponse && reponse.members_rpn) {
        this.tempMember = reponse.members_rpn;
        const familles: Famille[] = [];
        this.tempMember.forEach(fam => {
          if (fam &&fam.family_member_status === 1) {
            familles.push({
              choice: false,
              famille_id: fam.family_id,
              name:  fam.family_member_name
            });
          }
       
        });
        this.familleList = this.api.oderByAlpha(familles);
        this.formMessage.get('liste_famille').setValue(familles);
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Add selected family
  getSelectedFamily() {
    const selectFamilies: Famille[] = [];
    this.familleList.forEach(fam => {
      if (fam.choice) {
        selectFamilies.push(fam);
      } 
    });
    this.formMessage.get('liste_famille').setValue(selectFamilies);
  }

    // update de mode
    updateMode(mode: number) {
      mode  ? this.formMessage.get('email_personnel').setValue(1) : this.formMessage.get('email_personnel').setValue(0);
    }

    // update de mode
    updateMode1(mode: number) {
      mode  ? this.formMessage.get('email_medu_nda_nda').setValue(1) : this.formMessage.get('email_medu_nda_nda').setValue(0);
    }
  

  // select all the families
  selectAllFamilies() {
    const members: Famille[] = this.familleList;
    const tempFamilles: Famille[]  = [];
    members.forEach((fam: any) => {
      tempFamilles.push({
        choice: true,
        famille_id: fam.famille_id,
        name:  fam.name
      });
    });
    this.familleList = tempFamilles;
    this.formMessage.get('liste_famille').setValue(tempFamilles);
  }

  // Deselect all the families
  deselectAllFamilies() {
    const members: Famille[] = this.familleList;
    const tempFamilles: Famille[]  = [];
    members.forEach((fam: any) => {
      tempFamilles.push({
        choice: false,
        famille_id: fam.famille_id,
        name:  fam.name
      });
    });
    this.familleList = tempFamilles;
    this.formMessage.get('liste_famille').setValue(tempFamilles);
  }

  // Select/Deselect all
  onSelectOrDeselect(select: any) {
    select === 1 ? this.selectAllFamilies() : this.deselectAllFamilies();
  }

    // send message to members
  sendTomembers() {
    this.loadingShow = true;
    this.spinner.show('send-message');
    this.message.sendMessageRpnMembers(this.token, this.formMessage.value).subscribe(reponse => {

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
          this.translate.get('FAMILY_NAME_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.famille_id_not_exist) {
          this.translate.get(['FORM_FAMILY', 'NOT_EXIST']).subscribe(trans => {
            this.toast.error(`${trans.FORM_FAMILY} ${error.error.value_famille_id} ${trans.NOT_EXIST}`);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }


}
