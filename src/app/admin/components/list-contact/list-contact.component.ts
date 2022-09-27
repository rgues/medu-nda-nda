import { FeedbackService } from './../../../service/feedback.service';
import { ErrorService } from 'src/app/service/error.service';
import { ApiService } from './../../../service/api.service';
import { Component, OnInit } from '@angular/core';
import { MembreService } from 'src/app/service/membre.service';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnswerFeedbackComponent } from '../answer-feedback/answer-feedback.component';

@Component({
  selector: 'app-list-contact',
  templateUrl: './list-contact.component.html',
  styleUrls: ['./list-contact.component.scss']
})
export class ListContactComponent implements OnInit {

  listContacts: any;
  defaultListContacts: any;
  activelistContacts: any;
  loadingShow: boolean;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private api: ApiService,
    private member: MembreService,
    private modalService: NgbModal,
    private errorService: ErrorService,
    private feedback: FeedbackService
  ) {
    this.listContacts = [];
    this.defaultListContacts = [];
    this.activelistContacts = [];
    this.loadingShow = false;

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    // Listen to message and update the list
    this.feedback.getUpdateMessage().subscribe(data => {
        if (data && data.message === 'update') {
          this.getContacts();
        }
    });
  }

  ngOnInit() {
    this.getContacts();
  }

  // Get la liste des membres
  getContacts() {
    this.loadingShow = true;
    const token = this.member.getUserSession();
    this.feedback.getContacts(token.remenber_token).subscribe(members => {
      this.loadingShow = false;
      this.defaultListContacts = this.api.oderByContactDate(members.data);
      this.listContacts = this.api.formatArrayToMatrix(this.defaultListContacts, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages = this.listContacts.length;
      this.nbItems = this.defaultListContacts.length;
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }


  // ANSWER FEEDBACK
  answerFeeback(feedback: any) {
   this.member.setMemberSession(feedback);
   this.modalService.open(AnswerFeedbackComponent, { centered: true, size:'lg' });
  }



  // Pagination function

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
    this.listContacts = this.api.formatArrayToMatrix(this.defaultListContacts, this.nbItemsByPage);
    this.totalPages = this.listContacts.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listContacts[id - 1] && this.listContacts[id - 1].length > 0) ?
      this.activelistContacts = this.listContacts[id - 1] : this.activelistContacts = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listContacts[this.numero - 1] && this.listContacts[this.numero - 1].length > 0) ?
        this.activelistContacts = this.listContacts[this.numero - 1] : this.activelistContacts = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listContacts.length ? this.numero = position : this.numero = currentId;
      (this.listContacts[this.numero - 1] && this.listContacts[this.numero - 1].length > 0) ?
        this.activelistContacts = this.listContacts[this.numero - 1] : this.activelistContacts = [];
      this.currentPage = this.numero;
    }
  }

}
