import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { slideInLeft } from 'src/app/animations';
import { ApiService } from 'src/app/service/api.service';
import { DepensesService } from 'src/app/service/depenses.service';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';

@Component({
  selector: 'app-update-depenses',
  templateUrl: './update-depenses.component.html',
  styleUrls: ['./update-depenses.component.scss'],
  animations:[
    slideInLeft
  ]
})
export class UpdateDepensesComponent implements OnInit {

  formData: FormGroup;
  loadingShow: boolean;
  token: string;
  currentData: any;
  typeList: any;
  startDate: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private api: ApiService,
    private member: MembreService,
    private translate: TranslateService,
    private toast: ToastrService,
    private error: ErrorService,
    private modalService: NgbActiveModal,
    private depense: DepensesService
  ) {
    this.loadingShow = false;
    this.currentData = this.depense.getDepenseSession();
    this.startDate = new Date();
  }

  ngOnInit() {
    this.initFormData();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getTypes(this.token);
  }

  // Get the list of status
  getTypes(token: string) {
    this.depense.getAllSpentType(token).subscribe(data => {
      if (data && data.spending_type) {
        this.typeList = data.spending_type;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  initFormData() {
    this.formData = this.fb.group({
      spending_id: [this.currentData ? this.currentData.infos_spent.id : '',Validators.required],
      spending_type_id: [this.currentData ? this.currentData.infos_spent.spending_type_id : '',Validators.required],
      date: [this.currentData.infos_spent && this.currentData.infos_spent.date ? new Date(this.currentData.infos_spent.date) : this.startDate, Validators.required],
      description: [this.currentData ? this.currentData.infos_spent.description : ''],
      amount: [this.currentData ? this.currentData.infos_spent.amount : '', Validators.compose([Validators.required, Validators.pattern('^[.0-9]+$')])]
    });
  }

  // update depense
  updateDepense() {
    this.loadingShow = true;
    this.spinner.show('form-action');
    const data =  this.formData.value;
    data.date  = this.api.formatDateTiret(this.formData.value.date);
    this.depense.editSpent(this.token, data).subscribe(reponse => {
      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EXPENSE_UPDATE_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormData();
        this.depense.sendMessage('update');
        this.modalService.dismiss();
      }
      this.spinner.hide('form-action');

    }, error => {
      this.modalService.dismiss();
      this.loadingShow = false;
      this.spinner.hide('form-action');
      if (error && error.error && error.error.message === 'error') {
        if (error.error.invalid_token) {
          this.member.logoutMember();
        }
        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }
        if (error.error.spending_type_id_not_exist) {
          this.translate.get('EXPENSE_TYPE_NOT_EXIST').subscribe(trans => {
            this.toast.error(`${trans}`);
          });
        }
      } else {
        this.error.manageError(error);
      }
    });
  }

}
