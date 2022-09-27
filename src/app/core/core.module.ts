import { PositionFilterPipe } from './pipes/positionFilter.pipe';
import { SlidesArticlesComponent } from './components/slides-articles/slides-articles.component';
import { SidebarArticlesComponent } from './components/sidebar-articles/sidebar-articles.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { ArticlesService } from './../service/articles.service';
import { FeedbackService } from './../service/feedback.service';

import { ApiService } from './../service/api.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from './../shared/shared.module';

import { BsNavbarComponent } from './components/bs-navbar/bs-navbar.component';

import { HomeComponent } from './components/home/home.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { HistoryComponent } from './components/history/history.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { MembreService } from '../service/membre.service';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { TestimonyService } from '../service/testimony.service';


@NgModule({
  declarations: [
    BsNavbarComponent,
    HomeComponent,
    CarouselComponent,
    HistoryComponent,
    ContactComponent,
    LoginComponent,
    ListArticlesComponent,
    SidebarArticlesComponent,
    SlidesArticlesComponent,
    PositionFilterPipe,
    ForgotPasswordComponent

  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    BrowserAnimationsModule,
    NgxUsefulSwiperModule,
    MatNativeDateModule,
    RouterModule
  ],
  exports: [
    BsNavbarComponent
  ],
  entryComponents: [
    LoginComponent
  ],
  providers: [
    ApiService,
    MembreService,
    FeedbackService,
    ArticlesService,
    TestimonyService
  ]
})
export class CoreModule { }
