import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  defaultLang: string;
  subject = new Subject<any>();

  constructor(
    private api: ApiService
  ) {
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
  }

  // update list message 
  sendUpdateMessage(mes: string) {
    this.subject.next({ message: mes });
  }

  getUpdateMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  // Set the current survey
  setCurrentSurvey(job: any) {
    localStorage.setItem('current-survey', JSON.stringify(job));
  }

  // Get the current survey
  getCurrentSurvey() {
    const emploi = localStorage.getItem('current-survey');
    return emploi ? JSON.parse(emploi) : null;
  }

  // Remove the current survey
  removeCurrentJob() {
    localStorage.removeItem('current-survey');
  }

  // Create a survey
  createSurvey(token: string, data: any) {
    return this.api.post(`survey/create/${token}`, data);
  }

  // Get all surveys
  getAllSurveys(token: string) {
    return this.api.get(`survey/get/all/${token}`);
  }

  // Get a survey
  getASurvey(token: string, surveyId: number) {
    return this.api.get(`survey/get/a/survey/${surveyId}/${token}`);
  }

  // update a survey
  updateSurvey(token: string, data: any) {
    return this.api.post(`survey/update/${token}`, data);
  }

  // Enable or disable a survey
  enableOrDisableSurvey(token: string, data: any) {
    return this.api.post(`survey/active/or/desactive/${token}`, data);
  }

  // Delete a survey
  deleteSurvey(token: string, data: any) {
    return this.api.post(`survey/delete/${token}`, data);
  }

  // Add survey answers
  addSurveyAnswer(token: string, data: any) {
    return this.api.post(`survey/add/question/to/survey/${token}`, data);
  }

  // Get all survey answers
  getAllSurveysAnswers(token: string, data: any) {
    return this.api.post(`survey/get/all/question/to/survey/${token}`, data);
  }

  // update survey answers
  updateSurveyAnswer(token: string, data: any) {
    return this.api.post(`survey/update/question/to/a/survey/${token}`, data);
  }

  // Delete possible answer of a survey
  deleteSurveyAnswer(token: string, data: any) {
    return this.api.post(`survey/delete/question/to/a/survey/${token}`, data);
  }

  // Answer a survey
  answerSurvey(token: string, data: any) {
    return this.api.post(`survey/answer/member/to/a/survey/${token}`, data);
  }

  // get answers member's survey 
  getAnswersMembers(token: string, data: any) {
    return this.api.post(`survey/get/all/answer/member/to/a/survey/${token}`, data);
  }

  // get  member's survey 
  getMembersSurveys(token: string, data: any) {
    return this.api.post(`survey/get/liste/to/answer/survey/${token}`, data);
  }

  // Get survey stats
  getSurveyStats(token: string, data: any) {
    return this.api.post(`survey/get/statisque/to/a/survey/${token}`, data);
  }

  // Publish survey result
  publishSurveysResults(token: string, data: any) {
    return this.api.post(`survey/publish/result/survey/${token}`, data);
  }

}
