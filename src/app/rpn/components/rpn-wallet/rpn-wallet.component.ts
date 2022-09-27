import { Component, OnInit } from '@angular/core';
import { slidePage, slideBlock } from '../../../animations';

@Component({
  selector: 'app-rpn-wallet',
  templateUrl: './rpn-wallet.component.html',
  styleUrls: ['./rpn-wallet.component.scss'],
  animations: [
    slidePage,
    slideBlock
  ]
})
export class RpnWalletComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
