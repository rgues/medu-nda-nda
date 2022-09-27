import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from './../../../animations';
import { Router } from '@angular/router';

interface Members {
  member_id: number;
  name: string;
}

@Component({
  selector: 'app-family-member-add',
  templateUrl: './family-member-add.component.html',
  styleUrls: ['./family-member-add.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class FamilyMemberAddComponent implements OnInit {
  formFamily: FormGroup;
  loadingShow: boolean;
  alreadyFmailyMember: boolean;
  familyNotExist: boolean;
  memberList: Members[];
  memberSelect: Members[];
  familyList: any;
  token: string;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private family: FamilleService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private modalService: NgbActiveModal,
    private router: Router
  ) {
    this.alreadyFmailyMember = false;
    this.familyNotExist = false;
    this.memberList = [];
    this.familyList = [];
    this.memberSelect = [];
  }

  ngOnInit() {
    this.getFamily();
    this.getMembers();
    this.initFormFamily();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormFamily() {
    const familyData = this.family.getFamilySession();
    this.formFamily = this.fb.group({
      family_id: [familyData.famille_id, Validators.required],
      currentMember: [''],
      tableau_membre: [[], Validators.required]
    });
  }

  // get the family list
  getFamily() {
    this.family.getFamily().subscribe(families => {
      if (families && families.familles) {
        this.familyList = families.familles;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // get the list of members
  getMembers() {
    this.member.getListOfMembers().subscribe((reponse: any) => {
      if (reponse && reponse.membres) {
        const memberFormat = [];
        reponse.membres.forEach(member => {
          memberFormat.push({ member_id: member.member_id, name: member.Fname + ' ' + member.Lname });
        });
        this.memberList = memberFormat;
      }

    }, error => {
      this.error.manageError(error);
    });
  }

  // Add selected member
  addSelectedMember() {
    if (this.memberList[this.formFamily.value.currentMember]) {
      this.memberSelect.push(this.memberList[this.formFamily.value.currentMember]);
      this.formFamily.get('tableau_membre').setValue(this.memberSelect);
      this.formFamily.get('currentMember').setValue(' ');
    }
  }

  // remove the member
  removeMember(index: number) {
    this.memberSelect.splice(index, 1);
    this.formFamily.get('tableau_membre').setValue(this.memberSelect);
  }

  get famille() {
    return this.formFamily.get('family_id');
  }

  get membre() {
    return this.formFamily.get('tableau_membre');
  }

  // Create family
  addFamilyMember() {
    this.loadingShow = true;
    this.spinner.show('add-member');

    this.family.addFamilyMember(this.token, this.formFamily.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('CREATE_MEMBER_SUCCESS_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.family.sendUpdateMessage('update');
        this.initFormFamily();
        this.modalService.dismiss();
        this.router.navigate(['/family']);
      }
      this.spinner.hide('add-member');

    }, error => {
      this.modalService.dismiss();
      this.loadingShow = false;
      this.spinner.hide('add-member');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.family_id_not_exist) {
          this.translate.get('FAMILY_NAME_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
          this.familyNotExist = true;
        }

        if (error.error.member_have_already_a_family) {
          const memberData = error.error.member;
          this.translate.get('FAMILY_MEMBER_HAS_FAMILY').subscribe(trans => {
            this.toast.error(`${memberData.Lname} ${memberData.Fname}  ${trans}`);
          });
          this.alreadyFmailyMember = true;
        }

      } else {
        this.error.manageError(error);
      }
    });
  }


}
