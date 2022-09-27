import { ApiService } from 'src/app/service/api.service';
import { Router } from '@angular/router';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from './../../../service/membre.service';
import { Component, OnInit } from '@angular/core';
import { slidePage, slideBlock } from 'src/app/animations';
import { MessagesService } from 'src/app/service/messages.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
  animations: [
    slidePage,
    slideBlock
  ]
})
export class MessageListComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  messages: any;
  activeMessage: any;
  defaultMessage: any;
  user: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  searchTerm: string;
  filterData: any[];

  constructor(
    private member: MembreService,
    private message: MessagesService,
    private error: ErrorService,
    private router: Router,
    private api: ApiService
  ) {
    this.loadingShow = false;
    this.messages = [];
    this.activeMessage = [];
    this.defaultMessage = [];

    this.filterData = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.searchTerm = '';

    this.message.getUpdateMessage().subscribe(data => {
        if (data && data.message === 'update') {
          this.getMessages();
        }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getMessages();
  }

  // get the message list
  getMessages() {
    this.loadingShow = true;
    this.message.getAllMessages(this.token).subscribe(data => {
      if (data && data.messages) {
        this.loadingShow = false;
        this.defaultMessage = this.api.oderByDateCreated(data.messages);
        this.messages = this.api.formatArrayToMatrix(this.defaultMessage, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.messages.length;
        this.nbItems = this.defaultMessage.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

    // Filter by name
    filterByKeyword(keyword: string) {
      const resultFilter = [];
      let words = '';
      let key = '';
      this.defaultMessage.forEach(msg => {
        if (msg) {
          words = msg.object;
          words = words.toLowerCase();
          key = keyword.trim().toLowerCase();
          if (words.match(key)) {
            resultFilter.push(msg);
          }
        }
      });
      this.messages = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages =  this.messages.length;
      this.nbItems = resultFilter.length;
    }


    // Update update Message
    updateMessage(message: any) {
      this.message.setMessageData(message);
      this.router.navigate(['/message/update-message']);
    }

    // send members Message
    membersMessage(message: any) {
      this.router.navigate(['/message/send-message-member',message.message_id]);
    }

    // send members Message
    familyMessage(message: any) {
      this.router.navigate(['/message/send-message-family',message.message_id]);
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
    this.messages = this.api.formatArrayToMatrix(this.defaultMessage, this.nbItemsByPage);
    this.totalPages = this.messages.length;
    this.updateActiveList(this.currentPage);
  }

  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.messages[id - 1] && this.messages[id - 1].length > 0) ?
      this.activeMessage = this.messages[id - 1] : this.activeMessage = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.messages[this.numero - 1] && this.messages[this.numero - 1].length > 0) ?
        this.activeMessage = this.messages[this.numero - 1] : this.activeMessage = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.messages.length ? this.numero = position : this.numero = currentId;
      (this.messages[this.numero - 1] && this.messages[this.numero - 1].length > 0) ?
        this.activeMessage = this.messages[this.numero - 1] : this.activeMessage = [];
      this.currentPage = this.numero;
    }
  }

}
