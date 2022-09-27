import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  defaultLang: string;
  formatDate: Date;
  constructor(
    private translate: TranslateService,
  ) {
    this.formatDate = new Date();
    translate.setDefaultLang('fr');
    translate.use('fr');
    localStorage.setItem('langue','fr');
   /*  const currentLang =  localStorage.getItem('langue');
    let browserLang = this.translate.getBrowserLang();
    browserLang = browserLang.toLocaleLowerCase();
    this.defaultLang = currentLang ? currentLang : browserLang;
    translate.use(this.defaultLang && this.defaultLang.match('en|fr') ? this.defaultLang : 'fr'); */
  }

}
