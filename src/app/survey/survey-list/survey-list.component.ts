import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { SurveyService } from 'src/app/service/survey.service';
import { Router } from '@angular/router';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
  listSurveys: any;
  defaultListSurveys: any;
  loadingShow: boolean;
  user: any;
  searchTerm: string;
  activeList: any;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  isActive: number;
  allSurveys: any;
  defaultLang: string;

  constructor(
    private api: ApiService,
    private survey: SurveyService,
    private modalService: NgbModal,
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
    this.searchTerm = '';
    this.isActive = -1;

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
        this.getSurveys();
      }
    });
  }


  ngOnInit() {
    this.getSurveys();
  }

  // get a limit size of articles content
  limitSize(content: string) {
    return content && content.length < 150 ? content : content.substring(0, 150) + '...';
  }

  // Filter by name
  filterByKeyword(keyword: string) {
    const resultFilter = [];
    let words = '';
    let key = '';
    this.defaultListSurveys.forEach(survey => {
      if (survey) {
        words = survey.survey_title;
        words = words.toLowerCase();
        key = keyword.trim().toLowerCase();
        if (words.match(key)) {
          resultFilter.push(survey);
        }
      }
    });
    this.listSurveys = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.listSurveys.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }


  // Get all active article
  filterActive(isActive) {
    const resultFilter = [];
    if (isActive === 1) {
      this.defaultListSurveys.forEach(survey => {
        if (survey.published === 0) {
          resultFilter.push(survey);
        }
      });
      this.listSurveys = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    } else {
      this.defaultListSurveys.forEach(survey => {
        if (survey.published !== 0) {
          resultFilter.push(survey);
        }
      });
      this.listSurveys = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    }
    this.updateActiveList(1);
    this.totalPages = this.listSurveys.length;
    this.nbItems = resultFilter.length;
  }


  // Get survey list
  getSurveys() {
    this.loadingShow = true;
    this.survey.getAllSurveys(this.user.remenber_token).subscribe((surveys: any) => {
      this.loadingShow = false;
      this.defaultListSurveys = [];
      surveys.surveys.forEach(element => {
        if (element.language_code === this.defaultLang) {
          this.defaultListSurveys.push(element);
        }
      });

      this.allSurveys = surveys.surveys;
      this.defaultListSurveys = this.api.oderByDateCreated(this.defaultListSurveys);
      this.listSurveys = this.api.formatArrayToMatrix(this.defaultListSurveys, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages = this.listSurveys.length;
      this.nbItems = this.defaultListSurveys.length;
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }


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
    this.listSurveys = this.api.formatArrayToMatrix(this.defaultListSurveys, this.nbItemsByPage);
    this.totalPages = this.listSurveys.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listSurveys[id - 1] && this.listSurveys[id - 1].length > 0) ?
      this.activeList = this.listSurveys[id - 1] : this.activeList = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listSurveys[this.numero - 1] && this.listSurveys[this.numero - 1].length > 0) ?
        this.activeList = this.listSurveys[this.numero - 1] : this.activeList = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listSurveys.length ? this.numero = position : this.numero = currentId;
      (this.listSurveys[this.numero - 1] && this.listSurveys[this.numero - 1].length > 0) ?
        this.activeList = this.listSurveys[this.numero - 1] : this.activeList = [];
      this.currentPage = this.numero;
    }
  }

  // Add the survey answers
  addAnswerSurvey(survey: any) {
    this.router.navigate(['/survey/add-answer-survey', survey.survey_id]);
  }

  // Show the survey statistics
  statSurvey(survey: any) {
    this.router.navigate(['/survey/survey-stats', survey.survey_id]);
  }

    // show survey answers
    answerSurvey(survey: any) {
      this.router.navigate(['/survey/survey-answer', survey.survey_id]);
    }

  // show the survey member answers
  memberAnsSurvey(survey: any) {
    this.router.navigate(['/survey/survey-members', survey.survey_id]);
  }

  // Update a survey
  updateSurvey(survey: any) {
    const surveys = [];
    this.allSurveys.forEach(data => {
      if (data && data.survey_id === survey.survey_id) {
        surveys.push(data);
      }
    });
    this.survey.setCurrentSurvey(surveys);
    this.router.navigate(['/survey/update-survey']);
  }

  // Delete a survey
  deleteSurvey(survey: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {

      if (ans === 'confirm') {

        this.loadingShow = true;
        this.spinner.show('delete-survey');
        const member = this.member.getUserSession();

        const param = {
          survey_id: survey.survey_id
        };

        this.survey.deleteSurvey(member.remenber_token, param).subscribe(reponse => {

          if (reponse && reponse.message === 'success') {
            this.loadingShow = false;
            this.translate.get('SURVEY_DELETE_SUCCESS_MSG').subscribe(trans => {
              this.toast.success(trans);
            });
            this.activeList.splice(index, 1);
            this.getSurveys();
          }
          this.spinner.hide('delete-survey');

        }, error => {
          this.loadingShow = false;
          this.spinner.hide('delete-survey');
          if (error && error.error && error.error.message === 'error') {

            if (error.error.survey_id_not_exist) {
              this.translate.get('SURVEYS_NOT_EXIST').subscribe(trans => {
                this.toast.success(trans);
              });
            }

            if (error.error.invalid_token) {
              this.member.logoutMember();
            }

          } else {
            this.errorService.manageError(error);
          }
        });
      }
    });
  }


  // Enable a survey
  enableSurvey(survey: any) {

    this.loadingShow = true;
    this.spinner.show('enable-survey');
    const member = this.member.getUserSession();

    const param = {
      survey_id: survey.survey_id,
      expired: survey.expired === 1 ? 0 : 1
    };

    this.survey.enableOrDisableSurvey(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('SURVEY_STATUT_SUCCESS_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.getSurveys();
      }
      this.spinner.hide('enable-survey');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('enable-survey');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.survey_id_not_exist) {
          this.translate.get('SURVEYS_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

      } else {
        this.errorService.manageError(error);
      }
    });

  }


  
  // Publish survey Resultat
  publishSurvey(survey: any) {

    this.loadingShow = true;
    this.spinner.show('publish-survey');
    const member = this.member.getUserSession();

    const param = {
      survey_id: survey.survey_id
    };

    this.survey.publishSurveysResults(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('SURVEY_PUBLISH_SUCCESS_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.getSurveys();
      }
      this.spinner.hide('publish-survey');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('publish-survey');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.survey_id_not_exist) {
          this.translate.get('SURVEYS_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

      } else {
        this.errorService.manageError(error);
      }
    });

  }



}
