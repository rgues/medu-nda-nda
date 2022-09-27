import { MembreService } from 'src/app/service/membre.service';
import { ArticlesService } from 'src/app/service/articles.service';
import { RouterModule } from '@angular/router';
import { NavarticleComponent } from './components/navarticle/navarticle.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatComponentsModule } from '../mat-components.module';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from './../shared/shared.module';

import { AddArticlesComponent } from './components/add-articles/add-articles.component';
import { AddUpdateComponent } from './components/add-update/add-update.component';
import { ArticlesListComponent } from './components/articles-list/articles-list.component';


@NgModule({
  declarations: [
    NavarticleComponent,
    AddArticlesComponent,
    AddUpdateComponent,
    ArticlesListComponent
  ],
  imports: [
    CommonModule,
    MatComponentsModule,
    MatNativeDateModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'members-articles', pathMatch: 'full' },
      { path: 'articles-list', component: ArticlesListComponent },
      { path: 'add-article', component: AddArticlesComponent },
      { path: 'update-article', component: AddUpdateComponent},
    ])
  ], providers: [
    ArticlesService,
    MembreService
  ]
})
export class ArticlesModule { }
