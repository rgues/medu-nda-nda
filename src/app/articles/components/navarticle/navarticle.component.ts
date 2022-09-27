import { ArticlesService } from './../../../service/articles.service';
import { Component, OnInit } from '@angular/core';
import { ErrorService } from 'src/app/service/error.service';

@Component({
  selector: 'app-navarticle',
  templateUrl: './navarticle.component.html',
  styleUrls: ['./navarticle.component.scss']
})
export class NavarticleComponent implements OnInit {
  categoriesList: any;

  constructor(
    private article: ArticlesService,
    private errorService: ErrorService
  ) {
    this.categoriesList = [];
            // Listen to message and update the list
            this.article.getUpdateMessage().subscribe(data => {
              if (data && data.message === 'update') {
                this.getArcticlesCategories(true);
              }
          });
  }

  ngOnInit() {

    this.getArcticlesCategories(false);
  }

  // Get la liste des membres
  getArcticlesCategories(refresher: boolean) {
    this.article.getCategories(refresher).then(categories => {
      if (categories && categories) {
        this.categoriesList = categories;
      }
    });
  }

}
