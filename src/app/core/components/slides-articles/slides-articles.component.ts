import { ArticlesService } from './../../../service/articles.service';
import { Component, OnInit, OnDestroy, Inject, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface RandomDisplay {
  index: number;
  nbShows: number;
}

@Component({
  selector: 'app-slides-articles',
  templateUrl: './slides-articles.component.html',
  styleUrls: ['./slides-articles.component.scss']
})
export class SlidesArticlesComponent implements OnInit, OnDestroy {
  loadingShow: boolean;
  listArticles: any;
  randomDisplay: RandomDisplay[];
  randomArticles: any;
  timer: any;
  displaysImages: any[];
  ramdonImages;
  imageBackground: string;
  @Output() articles = new EventEmitter();
  constructor(
    private article: ArticlesService,
    @Inject(DOCUMENT) document,
  ) {
    this.listArticles = [];
    this.randomDisplay = [];
    this.displaysImages = [];
    this.displaysImages.push('assets/images/slides/slide-01.jpeg');
    this.displaysImages.push('assets/images/slides/slide-02.jpeg');
    this.displaysImages.push('assets/images/slides/slide-03.jpeg');
    this.displaysImages.push('assets/images/slides/slide-04.jpeg');
    this.displaysImages.push('assets/images/slides/slide-05.jpeg');
    this.ramdonImages = this.displaysImages[0];
    this.imageBackground = '';
    // Listen to message and update the list
    this.article.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getSlidesArcticles(true);
      }
    });
  }

  ngOnInit() {
    this.getSlidesArcticles(true);
  }

  ngOnDestroy() {
    this.timer ? clearInterval(this.timer) : this.timer = null;
  }

  // get a limit size of articles content
  limitSize(content: string) {
    return content && content.length < 200 ? content : content.substring(0, 200) + '...';
  }

  getSlidesArcticles(refresher: boolean) {
    this.loadingShow = true;
    this.article.getArticles(refresher).then((articles: any) => {
      this.loadingShow = false;
      if (articles && articles.length > 0) {
        const catArticles = [];

        // get the articles categories
        let randomIndex = 0;
        articles.forEach(article => {
          if (article.position_id === 7) {
            catArticles.push(article);
            this.randomDisplay.push({ index: randomIndex, nbShows: 0 });
            randomIndex++;
          }
        });
        this.listArticles = catArticles;
        this.showCurrentArticle();

      }

    });
  }

  // show the current article
  showCurrentArticle() {
    if (this.listArticles && this.listArticles.length > 0) {

      this.randomArticles = this.getCurrentArticles(this.listArticles);
      const imageIdexFisrt = Math.floor(Math.random() * 5);
      this.imageBackground = this.randomArticles && this.randomArticles.picture ?
        this.randomArticles.picture : this.displaysImages[imageIdexFisrt];
      this.timer = setInterval(() => {
        this.randomArticles = this.getCurrentArticles(this.listArticles);
        const imageIdex = Math.floor(Math.random() * 5);
        this.imageBackground = this.randomArticles && this.randomArticles.picture ?
          this.randomArticles.picture : this.displaysImages[imageIdex];
      }, 30000);
    } else {
      this.randomArticles = null;
    }
    this.articles.emit(this.randomArticles);
  }

  // get the less show articles
  getLessShowArticle() {
    let lessShow = this.randomDisplay[0];
    this.randomDisplay.forEach(article => {
      if (article.nbShows < lessShow.nbShows) {
        lessShow = article;
      }
    });
    return lessShow;
  }

  // Get the current articles
  getCurrentArticles(articles: any) {
    const nbArticles = articles.length;
    const lessShow = this.getLessShowArticle();
    if (lessShow) {
      let randomIndex = Math.floor(Math.random() * nbArticles);
      while (articles[randomIndex].nbShows > lessShow.nbShows) {
        randomIndex = Math.floor(Math.random() * nbArticles);
      }
      this.randomDisplay[randomIndex].nbShows++;
      return articles[randomIndex];
    }
    return null;
  }


}
