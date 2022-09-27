import { MembreService } from "./../../../service/membre.service";
import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SendMessageComponent } from "../send-message/send-message.component";
import { Router } from "@angular/router";

interface CurrentLanguage {
  lang: string;
  name: string;
  active: boolean;
  index: number;
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: "admin-navbar",
  templateUrl: "./admin-navbar.component.html",
  styleUrls: ["./admin-navbar.component.scss"],
})
export class AdminNavbarComponent implements OnInit {
  public isCollapsed = true;
  user: any;
  currentLang: CurrentLanguage[];
  defaultIndex: number;

  constructor(
    private translate: TranslateService,
    private modalService: NgbModal,
    private router: Router,
    private membre: MembreService
  ) {
    this.user = this.membre.getUserSession();
    this.currentLang = [];
    this.defaultIndex = 0;
    const currentLang = localStorage.getItem("langue");
    const hascurrentLangue =
      currentLang && currentLang.match("en|fr") ? true : false;
    this.currentLang.push({
      lang: "fr",
      name: "Français",
      active:
        hascurrentLangue && currentLang === "fr"
          ? true
          : !hascurrentLangue
          ? true
          : false,
      index: 0,
    });
    this.currentLang.push({
      lang: "en",
      name: "English",
      active: hascurrentLangue && currentLang === "en" ? true : false,
      index: 1,
    });
    this.currentLang.forEach((data) => {
      if (data && data.active) {
        this.defaultIndex = this.currentLang.indexOf(data);
        localStorage.setItem("langue", data.lang);
        this.translate.use(data.lang);
      }
    });
  }

  ngOnInit() {}

  // Log out the systme
  logout() {
    this.membre.logoutMember();
  }

  updateLanguage(index: number) {
    this.defaultIndex = index;
    this.currentLang.forEach((lang) => {
      if (lang.index === index) {
        this.currentLang[index].active = true;
        localStorage.setItem("langue", lang.lang);
        this.translate.use(lang.lang);
        // window.location.reload();
      } else {
        this.currentLang[this.currentLang.indexOf(lang)].active = false;
      }
    });
  }

  // Send a message
  sendMessage() {
    this.modalService.open(SendMessageComponent, {
      centered: true,
      size: "lg",
    });
  }

  // go to document list
  documentList(index) {
    this.router.navigate(["/doc/list-docs", index]);
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }
}
