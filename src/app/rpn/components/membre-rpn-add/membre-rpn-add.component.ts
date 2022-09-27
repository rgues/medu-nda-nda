import { ApiService } from './../../../service/api.service';
import { TranslateService } from '@ngx-translate/core';
import { RpnService } from 'src/app/service/rpn.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';

interface Members {
  family_id: number;
  family_member_name: string;
  family_member_status: string;
}

@Component({
  selector: 'app-membre-rpn-add',
  templateUrl: './membre-rpn-add.component.html',
  styleUrls: ['./membre-rpn-add.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class MembreRpnAddComponent implements OnInit {

  formRpnMember: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  familyNameExist: boolean;
  token: string;
  memberList: any;
  familyList: any;
  memberSelect: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private family: FamilleService,
    private member: MembreService,
    private translate: TranslateService,
    private api: ApiService,
    private toast: ToastrService,
    private error: ErrorService,
    private router: Router,
    private modalService: NgbActiveModal,
    private rpn: RpnService
  ) {
      this.fillRequired = false;
      this.familyNameExist = false;
      this.memberList = [];
      this.memberSelect = [];
  }

  ngOnInit() {
    this.getFamily();
    this.initFormRpnMember();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormRpnMember() {
      this.formRpnMember = this.fb.group({
        currentFamily: [''],
        currentMember: [''],
        currentMemberName: [''],
        liste_membre: [[], Validators.required]
      });
  }


  // get the family list
  getFamily() {
    this.family.getFamily().subscribe(families => {
      if (families && families.familles) {
        this.familyList = this.api.oderByFamilyName(families.familles);
      }
    }, error => {
        this.error.manageError(error);
    });
  }

    // get the list of members
    getFamilyMembers(familyId: number, token: string) {
      this.loadingShow = false;
      this.family.getFamilyMembers(familyId, token).subscribe(families => {
        if (families && families.message === 'success') {
          const memberFormat = [];
          console.log(families.membre_famille);
          families.membre_famille.forEach(member => {
            memberFormat.push({family_id: familyId, family_member_name: member.Fname + ' ' + member.Lname, family_member_status: 1});
          });
          this.memberList = memberFormat;
        }
      }, error => {
          this.error.manageError(error);
      });
    }

    // upadte the current family
    updateFamily(indexFamily: any) {
      this.getFamilyMembers(this.familyList[indexFamily].famille_id, this.token);
    }


    // Add selected member
    addSelectedMember() {
      if (this.formRpnMember.value.currentMemberName) {
        this.memberSelect.push({
          family_id:  this.familyList[this.formRpnMember.value.currentFamily].famille_id,
          family_member_name: this.formRpnMember.value.currentMemberName,
          family_member_status: 1
        });
        this.formRpnMember.get('liste_membre').setValue(this.memberSelect);
        this.formRpnMember.get('currentMemberName').setValue('');
      } else {
        if (this.memberList[this.formRpnMember.value.currentMember]) {
          this.memberSelect.push(this.memberList[this.formRpnMember.value.currentMember]);
          this.formRpnMember.get('liste_membre').setValue(this.memberSelect);
          this.formRpnMember.get('currentMember').setValue(' ');
        }
      }
    }

  // remove the member
  removeMember(index: number) {
    this.memberSelect.splice(index, 1);
    this.formRpnMember.get('liste_membre').setValue(this.memberSelect);
  }

    // add rpn family memebre
    addRpnFamilyMember() {
      this.loadingShow = true;
      this.spinner.show('add-member');

      this.rpn.addRPNMember(this.token, this.formRpnMember.value).subscribe(reponse => {

        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('RPN_MEMBER_ADD_SUCCESS_MESSAGE').subscribe(trans => {
            this.toast.success(trans);
          });
          this.initFormRpnMember();
          this.modalService.dismiss();
          this.rpn.sendUpdateMessage('update');
          this.router.navigate(['/rpn']);
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

          if (error.error.remplir_tous_les_champs) {
            this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
              this.toast.error(trans);
            });
            this.fillRequired = true;
          }

          if (error.error.family_id_not_exist) {
            this.translate.get('FAMILY_TEXT', 'FAMILY_TEXT_NOT_EXIST').subscribe(trans => {
              this.toast.error(`${trans.FAMILY_TEXT} ${trans.FAMILY_TEXT_NOT_EXIST}`);
            });
            this.fillRequired = true;
          }

          if (error.error.member_name_already_exist) {
            this.translate.get('FORM_MEMBER', 'FORM_EXIST_TEXTE').subscribe(trans => {
              this.toast.error(`${trans.FORM_MEMBER} ${error.error.value_member_name}  ${trans.FORM_EXIST_TEXTE}`);
            });
            this.familyNameExist = true;
          }

        } else {
          this.error.manageError(error);
        }
      });
    }


}
