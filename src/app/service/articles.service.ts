import { Subject, Observable } from 'rxjs';
import { ErrorService } from './error.service';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  defaultLang: string;
  subject = new Subject<any>();

  constructor(
    private api: ApiService,
    private error: ErrorService
  ) {
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
  }
  
  // update list message 
  sendUpdateMessage(mes: string) {
    this.subject.next({ message: mes });
  }

  getUpdateMessage(): Observable<any>  {
    return this.subject.asObservable();
  }

  // Send and get article category
  sendArticleCategory(index: number) {
    this.subject.next({articleCategory : index});
  }

  getArticleCategory() {
    return this.subject.asObservable();
  }

  sendArticleCategoryUpdate(index: number) {
    this.subject.next({category : index});
  }

  getArticleCategoryUpdate() {
    return this.subject.asObservable();
  }

  // Set the articles positios
  setArticlesPositions(positions: any) {
    localStorage.setItem('articles-positions', JSON.stringify(positions));
  }

  // Get the articles positions
  getArticlesPositions() {
    const position =  localStorage.getItem('articles-positions');
    return position ? JSON.parse(position) : [];
  }

   // Remove the articles positions
  removeArticlesPositions() {
    localStorage.removeItem('articles-positions');
  }

  // Set the articles categories
  setArticlesCategories(positions: any) {
    localStorage.setItem('articles-categories', JSON.stringify(positions));
  }

  // Get the articles categories
  getArticlesCategories() {
    const categories =  localStorage.getItem('articles-categories');
    return categories ? JSON.parse(categories) : [];
  }

  // remove the articles categories
  removeArticlesCategories() {
    localStorage.removeItem('articles-categories');
  }

  // Set the articles list
  setArticlesList(articles: any) {
    localStorage.setItem('articles-list', JSON.stringify(articles));
  }

  // Get the articles list
  getArticlesList() {
    const articles =  localStorage.getItem('articles-list');
    return articles ? JSON.parse(articles) : [];
  }

   // remove the articles list
   removeArticlesList() {
    localStorage.removeItem('articles-list');
  }

  // Set the articles sideBar
  setSideBarArticlesList(sideArticles: any) {
    localStorage.setItem('articles-sideBar', JSON.stringify(sideArticles));
  }

  // Get the articles sideBar
  getSideBarArticlesList() {
    const sideArticles =  localStorage.getItem('articles-sideBar');
    return sideArticles ? JSON.parse(sideArticles) : [];
  }

  // Remove the articles sideBar
  removeSideBarArticlesList() {
    localStorage.removeItem('articles-sideBar');
  }

    // Set the current articles
    setCurrentArticle(article: any) {
      localStorage.setItem('current-articles', JSON.stringify(article));
    }

    // Get the current articles
    getCurrentArticle() {
      const articles =  localStorage.getItem('current-articles');
      return articles ? JSON.parse(articles) : null;
    }

    // Remove the current articles
    removeCurrentArticle() {
      localStorage.removeItem('current-articles');
    }


  // Get the article position
  getArticlePosition(refresher: boolean) {
    return new Promise((resolve) => {
      const positions = this.getArticlesPositions();
      if (refresher || positions.length === 0) {
          this.api.get('article/get/position').subscribe(reponse => {
          if (reponse && reponse.positions && reponse.positions.length > 0) {
            resolve(reponse.positions);
            this.setArticlesPositions(reponse.positions);
          }
      }, error => {
          resolve(this.getArticlesPositions());
      });
      } else {
          resolve(this.getArticlesPositions());
      }
    });
  }

  // Get article categorie
  getCategories(refresher: boolean) {
    return new Promise((resolve) => {
      const categories = this.getArticlesCategories();
      if (refresher || categories.length === 0) {
        this.api.get(`article/get/categorie/${this.defaultLang}`).subscribe(reponse => {
          if (reponse && reponse.categories && reponse.categories.length > 0) {
            resolve(reponse.categories);
            this.setArticlesCategories(reponse.categories);
          }
      }, error => {
          resolve(this.getArticlesCategories());
      });
      } else {
          resolve(this.getArticlesCategories());
      }
    });
  }

  // Get the liste of articles
  getArticles(refresher: boolean) {
    return new Promise((resolve) => {
      const articles = this.getArticlesList();
      if (refresher || articles.length === 0) {
        this.api.get(`article/get/all/${this.defaultLang}`).subscribe(reponse => {
          if (reponse && reponse.articles && reponse.articles.length > 0) {
            resolve(reponse.articles);
            this.setArticlesList(reponse.articles);
          }
      }, error => {
          resolve(this.getArticlesList());
      });
      } else {
          resolve(this.getArticlesList());
      }
    });
  }

  // Get sideBar articles
  getSidebarArticles(refresher: boolean) {
      return new Promise((resolve) => {
        const ads = this.getSideBarArticlesList();
        if (refresher || ads.length === 0) {
          this.api.get(`article/get/article/categorie/0/${this.defaultLang}`).subscribe(reponse => {
            if (reponse && reponse.articles && reponse.articles.length > 0) {
              resolve(reponse.articles);
              this.setSideBarArticlesList(reponse.articles);
            }
        }, error => {
            resolve(this.getSideBarArticlesList());
        });
        } else {
            resolve(this.getSideBarArticlesList());
        }
      });
  }

  // Get a category articles
  getCategoriesArticle(categoryId: number) {
    return this.api.get(`article/get/article/categorie/${categoryId}/${this.defaultLang}`);
  }


  // Get a position articles
  getListArticlesOfAposition(position: number) {
    return this.api.get(`article/get/article/position/${position}/${this.defaultLang}`);
  }


  // Create article
  createArticle(token: string, data: any) {
    return this.api.post(`article/save/${token}`, data);
  }


  // Update article
  updateArticle(token: string, data: any) {
    return this.api.post(`article/update/${token}`, data);
  }

  // Delete article
  deleteArticle(token: string, data: any) {
    return this.api.post(`article/delete/${token}`, data);
  }

}
