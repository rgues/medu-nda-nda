import { MembreService } from './../../../service/membre.service';
import { Component, OnInit } from '@angular/core';
import { slidePage, slideBlock } from '../../../animations';

@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.scss'],
  animations: [
    slidePage,
    slideBlock
  ]
})
export class EventDashboardComponent implements OnInit {

  user: any;

  constructor(
    private member: MembreService
  ) {
      this.user = this.member.getUserSession();
  }

  ngOnInit() {
  }

}
