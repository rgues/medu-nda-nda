import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorService } from 'src/app/service/error.service';
import { ApiService } from 'src/app/service/api.service';
import { MembreService } from 'src/app/service/membre.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SurveyService } from 'src/app/service/survey.service';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-survey-answer-update',
  templateUrl: './survey-answer-update.component.html',
  styleUrls: ['./survey-answer-update.component.scss'],
  animations:[
    slideInLeft
  ]
})
export class SurveyAnswerUpdateComponent implements OnInit {

  formSurvey: FormGroup;
  loadingShow: boolean;
  user: any;
 
  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private api: ApiService,
    private member: MembreService,
    private router: Router,
    private toast: ToastrService,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private survey: SurveyService
  ) {
    this.loadingShow = false;
  }
 
  // Init the form
  ngOnInit() {
    this.initFormSurvey();
  }
 
  // Init the survey form
  initFormSurvey() {
    const surveys = this.survey.getCurrentSurvey();
    let dataEn = null, dataFr =null ;
    surveys.forEach(survey => {
        if (survey.language_code === 'fr') {
          dataFr = survey;
        } else if (survey.language_code === 'en') {
          dataEn = survey;
        }
    });

    this.formSurvey = this.fb.group({
      survey_id: [surveys[0].survey_id, Validators.required],
      answer_id: [surveys[0].answer_id, Validators.required],
      answer_description_fr: [dataFr ? dataFr.answer_desc : '', Validators.required],
      answer_description_en: [dataEn ? dataEn.answer_desc : '', Validators.required]
    });
  }


 
  // form getters 
  get descriptionEn() {
    return this.formSurvey.get('answer_description_en');
  }
 
  get descriptionFr() {
   return this.formSurvey.get('answer_description_fr');
 }
 
 
  // Update a survey answer
  updateAnswerSurvey() {
    this.loadingShow = true;
    this.spinner.show('add-survey');
    const member = this.member.getUserSession();
 
    this.survey.updateSurveyAnswer(member.remenber_token, this.formSurvey.value).subscribe(reponse => {
      this.loadingShow = false;
      this.spinner.hide('add-survey');
      if (reponse && reponse.message === 'success') {
        this.translate.get('SURVEY_UPDATE_ANSWER_SUCCESS_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.survey.sendUpdateMessage('update');
      }
 
    }, error => {
      this.loadingShow = false;
      this.spinner.hide('add-survey');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
          this.translate.get('TOKEN_EXPIRED').subscribe(trans => {
            this.toast.error(trans);
          });
        }
        if (error.error.survey_id_not_exist) {
          this.translate.get('SURVEYS_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

        if (error.error.answer_id_not_exist) {
          this.translate.get('SURVEYS_ANSWERS_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
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
}
