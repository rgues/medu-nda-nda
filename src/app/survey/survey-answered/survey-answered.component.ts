import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { SurveyService } from 'src/app/service/survey.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmSurveyComponent } from 'src/app/shared/components/confirm-survey/confirm-survey.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-survey-answered',
  templateUrl: './survey-answered.component.html',
  styleUrls: ['./survey-answered.component.scss']
})
export class SurveyAnsweredComponent implements OnInit {

  listSurveys: any;
  defaultListSurveys: any;
  loadingShow: boolean;
  user: any;
  searchTerm: string;
  activeList: any;
  surveyId: any;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  isActive: number;
  allSurveys: any;
  defaultLang: string;
  answerId: number;
  comment:string;
  currentSurvey: any;
  loading: boolean;

  constructor(
    private api: ApiService,
    private survey: SurveyService,
    private modalService: NgbModal,
    private activate: ActivatedRoute,
    private router: Router,
    private member: MembreService,
    private errorService: ErrorService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
    this.listSurveys = [];
    this.defaultListSurveys = [];
    this.allSurveys = [];
    this.activeList = [];
    this.loadingShow = false;
    this.surveyId = this.activate.snapshot.params.surveyId;

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 10;
    this.currentPage = 1;
    this.numero = 1;
    this.user = this.member.getUserSession();
    // Listen to message and update the list
    this.survey.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getSurveysAnswers();
      }
    });
    this.currentSurvey = this.survey.getCurrentSurvey();
    this.loading = false;
  }


  ngOnInit() {
    this.getSurveysAnswers();
  }

  // get a limit size of articles content
  limitSize(content: string) {
    return content && content.length < 25 ? content : content.substring(0, 25) + '...';
  }


  // Get survey answers list
  getSurveysAnswers() {
    const data = {
      survey_id: this.surveyId
    };
    this.loadingShow = true;
    this.survey.getAllSurveysAnswers(this.user.remenber_token, data).subscribe((surveys: any) => {
      this.loadingShow = false;
      this.defaultListSurveys = [];
      surveys.answers.forEach(element => {
        if (element.language_code === this.defaultLang) {
          this.defaultListSurveys.push(element);
        }
      });

      this.allSurveys = surveys.answers;
      this.activeList = this.defaultListSurveys;

    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }




  // Update survey
  surveyAnswer() {
    this.modalService.open(ConfirmSurveyComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {
        const data = {
          survey_id: this.surveyId,
          answer_id: this.answerId,
          member_id: this.user.member_id,
          comment: this.comment
        };
        this.answerSurvey(data);
      }
    });
   
  }

     // Create a survey
     answerSurvey(params) {
      this.loading = true;
      this.spinner.show('add-survey');
      const member = this.member.getUserSession();
   
      this.survey.answerSurvey(member.remenber_token, params).subscribe(reponse => {
        this.loading = false;
        if (reponse && reponse.message === 'success') {
          this.translate.get('SURVEY_ANSWER_SUCCESS_MSG').subscribe(trans => {
            this.toast.success(trans);
          });
          this.answerId = 0;
          this.comment = '';
          this.survey.sendUpdateMessage('update');
        }
        this.spinner.hide('add-survey');
   
      }, error => {
        this.loading = false;
        this.spinner.hide('add-survey');
        if (error && error.error && error.error.message === 'error') {
          if (error.error.invalid_token) {
           this.member.logoutMember();
            this.translate.get('TOKEN_EXPIRED').subscribe(trans => {
              this.toast.error(trans);
            });
          }
 
          if (error.error.remplir_tous_les_champs) {
            this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
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
 
         if (error.error.member_id_not_exist) {
           this.translate.get('PROFILE_MEMBER_NOT_EXIST').subscribe(trans => {
             this.toast.success(trans);
           });
         } 

         if (error.error.member_has_already_participated) {
          this.translate.get('SURVEYS_ALREADY_PARTICIPATED').subscribe(trans => {
            this.toast.success(trans);
          });
        }
 
        
        } else {
          this.errorService.manageError(error);
        }
      });
    }

}
