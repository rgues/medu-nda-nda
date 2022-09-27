import { Component } from '@angular/core';
import { FooterService } from 'src/app/service/footer.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/service/api.service';
import { ErrorService } from 'src/app/service/error.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'bs-navfooter',
    templateUrl: './bs-navfooter.component.html',
    styleUrls: ['./bs-navfooter.component.scss']
})
export class BsNavfooterComponent {
    footerLinkDefault: any;
    listLinks: any;
    nbItems: number;
    loading: boolean;

    constructor(
        private footer: FooterService,
        private translate: TranslateService,
        private api: ApiService,
        private errorService: ErrorService
    ) {
        this.footerLinkDefault = [];
        this.listLinks = [];
        this.nbItems = 6;
        this.loading =false;
        this.api.getMessageContainer().subscribe(data => {
            if (data && data.canUpdate) {
              this.getDefaultFooterLink();
              this.getFooterlinks();
            }
          });

          this.footer.getUpdateMessage().subscribe(data => {
            if (data && data.canUpdate) {
              this.getDefaultFooterLink();
              this.getFooterlinks();
            }
          });
     }

     ngOnInit() {
         this.getDefaultFooterLink();
         this.getFooterlinks();
     }

 // Get default footer link
  getDefaultFooterLink() {
    this.footerLinkDefault = [];
    this.translate.get(['BS_NAVBAR_ABOUT_US', 'BS_NAVBAR_ART_CULTURE', 'BS_NAVBAR_CONTACT_US']).subscribe(trans => {
      this.footerLinkDefault.push({name: trans.BS_NAVBAR_ABOUT_US, url: '#' });
      this.footerLinkDefault.push({name: trans.BS_NAVBAR_ART_CULTURE, url: '#' });
      this.footerLinkDefault.push({name: 'BINAM Ontario', url: '#' });
      this.footerLinkDefault.push({name: 'NDE Montreal', url: '#' });
      this.footerLinkDefault.push({name: 'GRAMEN', url: '#' });
      this.footerLinkDefault.push({name: 'NUFI Canada', url: '#' });
      this.footerLinkDefault.push({name: 'YEMBA Canada', url: '#' });
      this.footerLinkDefault.push({name: trans.BS_NAVBAR_CONTACT_US, url: '#' });
    });
  }

  // Get the footer link
  getFooterlinks() {
    this.loading = true;
    this.footer.getFooterLink().subscribe((links: any) => {
      this.loading = false;
      if (links && links.footer_link.length > 0) {
        const formatLinks = [];
        links.footer_link.forEach(link => {
            formatLinks.push({name: link.footer_link_name, url: link.footer_link_url });
        }); 
        this.listLinks = this.api.formatArrayToMatrix(formatLinks, this.nbItems);
      } else {
        this.listLinks = [this.footerLinkDefault];
      }
    }, error => {
      this.loading = false;
      this.listLinks = [this.footerLinkDefault];
      this.errorService.manageError(error);
    });
  }


}