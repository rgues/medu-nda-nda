import { ApiService } from 'src/app/service/api.service';
import { Subject } from 'rxjs';
import { ArticlesService } from 'src/app/service/articles.service';
import { MembreService } from 'src/app/service/membre.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../login/login.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

interface CurrentLanguage {
  lang: string;
  name: string;
  active: boolean;
  index: number;
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'bs-navbar',
  templateUrl: './bs-navbar.component.html',
  styleUrls: ['./bs-navbar.component.scss']
})
export class BsNavbarComponent implements OnInit {
  public isCollapsed = true;
  currentLang: CurrentLanguage[];
  defaultIndex: number;
  authMenu: boolean;
  categoriesList: any;
  subject = new Subject<any>();


  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private router: Router,
    private api: ApiService,
    private member: MembreService,
    private article: ArticlesService
  ) {
    this.member.getUserSession() ? this.authMenu = true : this.authMenu = false;
    this.currentLang = [];
    this.defaultIndex = 0;
    const currentLang = 'fr' // localStorage.getItem('langue');
    const hascurrentLangue = currentLang && currentLang.match('en|fr') ? true : false;
    this.translate.get(['BS_NAVBAR_LANG_FR', 'BS_NAVBAR_LANG_EN']).subscribe(trans => {
      this.currentLang.push({
        lang: 'fr', name: trans.BS_NAVBAR_LANG_FR, active: hascurrentLangue && currentLang === 'fr'
          ? true : !hascurrentLangue ? true : false, index: 0
      });
/*       this.currentLang.push({
        lang: 'en', name: trans.BS_NAVBAR_LANG_EN, active: hascurrentLangue && currentLang === 'en'
          ? true : false, index: 1
      }); */

      this.currentLang.forEach(data => {
        if (data && data.active) {
          this.defaultIndex = this.currentLang.indexOf(data);
          localStorage.setItem('langue', data.lang);
          this.translate.use(data.lang);
        }
      });
    });

         // Listen to message and update the list
         this.article.getUpdateMessage().subscribe(data => {
          if (data && data.message === 'update') {
            this.getArticlesCategories();
          }
        });
  }

  open() {
      this.modalService.open(LoginComponent, { centered: true });
  }


  ngOnInit() {
    this.getArticlesCategories();
  }

  goToDashboard() {
    const user = this.member.getUserSession();
    this.router.navigate(['/admin/profile', user.member_id]);
  }


  updateLanguage(index: number) {
    this.defaultIndex = index;
    this.currentLang.forEach(lang => {
      if (lang.index === index) {
        this.currentLang[index].active = true;
        localStorage.setItem('langue', lang.lang);
        this.translate.use(lang.lang);
        this.api.sendMessageContainer(true);
        this.getArticlesCategories();
      } else {
        this.currentLang[this.currentLang.indexOf(lang)].active = false;
      }
    });
  }

  // Get the categories articles (represent the Menu)
  getArticlesCategories() {
    this.article.getCategories(false).then(categories => {
      this.categoriesList = categories;
    });
  }

  // get the active  categories
  getActiveCategory(index: number) {
    this.article.sendArticleCategory(index);
  }

}
