import { Component, OnInit } from '@angular/core';
import { slidePage, slideBlock } from '../../../animations';

@Component({
  selector: 'app-member-wallet',
  templateUrl: './member-wallet.component.html',
  styleUrls: ['./member-wallet.component.scss'],
  animations: [
    slidePage,
    slideBlock
  ]
})
export class MemberWalletComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
