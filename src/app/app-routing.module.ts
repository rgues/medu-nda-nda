import { AdminHomeComponent } from './admin/components/admin-home/admin-home.component';
import { DashboardComponent } from './core/components/dashboard/dashboard.component';
import { ContactComponent } from './core/components/contact/contact.component';
import { HistoryComponent } from './core/components/history/history.component';
import { HomeComponent } from './core/components/home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './core/components/forgot-password/forgot-password.component';

const routes: Routes = [
  { path: '', redirectTo: 'menu/1', pathMatch: 'full' },
  {
    path: '', component: DashboardComponent, children: [
      { path: 'menu/:categoryId', component: HomeComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'forgot-pass', component: ForgotPasswordComponent},
      { path: 'contact-us', component: ContactComponent }
    ]
  },
  {
    path: '', component: AdminHomeComponent, children: [
      { path: 'admin', loadChildren: './admin/admin.module#AdminModule' },
      { path: 'family', loadChildren: './family/family.module#FamilyModule' },
      { path: 'events', loadChildren: './events/events.module#EventsModule' },
      { path: 'reception', loadChildren: './member-reception/member-reception.module#MemberReceptionModule' },
      { path: 'rpn', loadChildren: './rpn/rpn.module#RpnModule' },
      { path: 'wallet', loadChildren: './wallet/wallet.module#WalletModule' },
      { path: 'article', loadChildren: './articles/articles.module#ArticlesModule' },
      { path: 'picture-event', loadChildren: './event-picture/event-picture.module#EventPictureModule' },
      { path: 'report', loadChildren: './report/report.module#ReportModule' },
      { path: 'report-type', loadChildren: './report-type/report-type.module#ReportTypeModule'},
      { path: 'member-doc', loadChildren: './member-doc/member-doc.module#MemberDocModule'},
      { path: 'doc', loadChildren: './report-doc/report-doc.module#ReportDocModule' },
      { path: 'visite', loadChildren: './visite/visite.module#VisiteModule' },
      { path: 'job', loadChildren: './job/job.module#JobModule' },
      { path: 'footer', loadChildren: './footer/footer.module#FooterModule' },
      { path: 'testimony', loadChildren: './testimony/testimony.module#TestimonyModule' },
      { path: 'survey', loadChildren: './survey/survey.module#SurveyModule' },
      { path: 'message', loadChildren: './message/message.module#MessageModule' },
      { path: 'videos', loadChildren: './videos/videos.module#VideosModule' }, 
      { path: 'depenses', loadChildren: './depenses/depenses.module#DepensesModule' }
    ]
  },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { enableTracing: false })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
