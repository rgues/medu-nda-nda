import { Component, OnInit } from '@angular/core';
import { SurveyService } from 'src/app/service/survey.service';
import { ApiService } from 'src/app/service/api.service';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';

@Component({
  selector: 'app-survey-member-list',
  templateUrl: './survey-member-list.component.html',
  styleUrls: ['./survey-member-list.component.scss']
})
export class SurveyMemberListComponent implements OnInit {

  listSurveys: any;
  defaultListSurveys: any;
  loadingShow: boolean;
  user: any;
  searchTerm: string;
  activeList: any;

  // Pagination data
  answersData: any;
  surveyData: any;
  defaultLang: string;
  surveyId: any;
  listMembers: any;

  constructor(
    private survey: SurveyService,
    private api: ApiService,
    private activeRoute: ActivatedRoute, 
    private error: ErrorService,
    private member: MembreService,
    private errorService: ErrorService,
  ) {
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
    this.answersData = null;
    this.activeList = [];
    this.loadingShow = false;
    this.surveyId = this.activeRoute.snapshot.params.surveyId;
    this.user = this.member.getUserSession();
    this.listMembers = [];

    // Listen to message and update the list
    this.survey.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getMmebersAnswers();
      }
    });
  }


  ngOnInit() {
    this.getMmebersAnswers();
  }

    // Get la liste des membres
    getMembers() {
      this.member.getListOfMembers().subscribe(members => {
        const memberList = [];
        members.membres.forEach(member => {
          if (member.Status_Id === 2) {
            memberList.push(member);
          }
        });
        this.listMembers = this.api.oderByFirstname(memberList);
      }, error => {
        this.error.manageError(error);
      });
    }

  // Get members answers
  getMmebersAnswers() {
    const data = {
      survey_id: this.surveyId,
      language_code:  this.defaultLang
    }
    this.loadingShow = true;
    this.survey.getMembersSurveys(this.user.remenber_token, data)
    .subscribe((surveys: any) => {
      this.loadingShow = false;
      this.surveyData = surveys.info_survey;
      this.answersData = surveys.answers;
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }
}
