import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorService } from 'src/app/service/error.service';
import { ApiService } from 'src/app/service/api.service';
import { MembreService } from 'src/app/service/membre.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SurveyService } from 'src/app/service/survey.service';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-survey-answer-add',
  templateUrl: './survey-answer-add.component.html',
  styleUrls: ['./survey-answer-add.component.scss'],
  animations:[
    slideInLeft
  ]
})
export class SurveyAnswerAddComponent implements OnInit {

  formSurvey: FormGroup;
  loadingShow: boolean;
  user: any;
  surveyId: any;
 
  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private api: ApiService,
    private activateRoute: ActivatedRoute,
    private member: MembreService,
    private router: Router,
    private toast: ToastrService,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private survey: SurveyService
  ) {
    this.loadingShow = false;
    this.surveyId = this.activateRoute.snapshot.params.surveyId;
  }
 
  // Init the form
  ngOnInit() {
    this.initFormSurvey();
  }
 
  // Init the survey form
  initFormSurvey() {
    this.formSurvey = this.fb.group({
      survey_id: [this.surveyId, Validators.required],
      liste_answers: [[],Validators.required],
      answer_description_fr: [''],
      answer_description_en: ['']
    });
  }

  // update the answers list
  updateAnswer() {
      if (this.formSurvey.value.answer_description_fr && this.formSurvey.value.answer_description_en) {
        let answers = [];
        answers =  this.formSurvey.value.liste_answers;
        answers.push({answer_description_fr: this.formSurvey.value.answer_description_fr,
                      answer_description_en: this.formSurvey.value.answer_description_en
                    });
        this.formSurvey.get('liste_answers').setValue(answers);
        this.formSurvey.get('answer_description_fr').setValue('');
        this.formSurvey.get('answer_description_en').setValue('');
      }
  }

  // delete answer
  deleteAns(index) {
    let answers = [];
    answers =  this.formSurvey.value.liste_answers;
    answers.splice(index, 1);
    this.formSurvey.get('liste_answers').setValue(answers);
  }
 
  // form getters 
  get descriptionEn() {
    return this.formSurvey.get('answer_description_en');
  }
 
  get descriptionFr() {
   return this.formSurvey.get('answer_description_fr');
 }
 
 
  // Add a survey answer
  addAnswerSurvey() {
    this.updateAnswer();
    this.loadingShow = true;
    this.spinner.show('add-survey');
    const member = this.member.getUserSession();
 
    this.survey.addSurveyAnswer(member.remenber_token, this.formSurvey.value).subscribe(reponse => {
      this.loadingShow = false;
      this.spinner.hide('add-survey');
      if (reponse && reponse.message === 'success') {
        this.translate.get('SURVEY_ADD_ANSWER_SUCCESS_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.formSurvey.get('answer_description_fr').setValue('');
        this.formSurvey.get('answer_description_en').setValue('');
        this.formSurvey.get('liste_answers').setValue([]);
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
