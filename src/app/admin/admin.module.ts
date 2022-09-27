import { AddExecutiveMemberComponent } from "./components/add-executive-member/add-executive-member.component";
import { MembersArticlesComponent } from "./components/members-articles/members-articles.component";
import { NgModule } from "@angular/core";
import { MatNativeDateModule } from "@angular/material/core";
import { NgxUsefulSwiperModule } from "ngx-useful-swiper";
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";

import { SharedModule } from "./../shared/shared.module";

import { ProfileMemberComponent } from "./components/profile-member/profile-member.component";
import { UpdateMemberComponent } from "./components/update-member/update-member.component";
import { CreateMemberComponent } from "./components/create-member/create-member.component";
import { ExecutiveMemberComponent } from "./components/executive-member/executive-member.component";
import { ListMemberComponent } from "./components/list-member/list-member.component";
import { MemberTransactionComponent } from "./components/member-transaction/member-transaction.component";
import { ModalAdminComponent } from "./components/modal-admin/modal-admin.component";
import { ListContactComponent } from "./components/list-contact/list-contact.component";
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';


import { ApiService } from "../service/api.service";
import { MembreService } from "../service/membre.service";
import { WalletService } from "./../service/wallet.service";
import { ProfileComponent } from "./components/profile/profile.component";
import { UpdatePasswordComponent } from "./components/update-password/update-password.component";
import { ResearchMemberComponent } from "./components/research-member/research-member.component";
import { AnswerFeedbackComponent } from "./components/answer-feedback/answer-feedback.component";
import { FeedbackService } from "../service/feedback.service";
import {
  MatSidenavModule,
  MatDividerModule,
  MatCardModule,
  MatPaginatorModule,
  MatTableModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
} from "@angular/material";




@NgModule({
  declarations: [
    ProfileMemberComponent,
    ListMemberComponent,
    ExecutiveMemberComponent,
    CreateMemberComponent,
    UpdateMemberComponent,
    AdminNavbarComponent,
    ProfileMemberComponent,
    ModalAdminComponent,
    MemberTransactionComponent,
    ListContactComponent,
    ProfileComponent,
    MembersArticlesComponent,
    UpdatePasswordComponent,
    ResearchMemberComponent,
    AddExecutiveMemberComponent,
    AnswerFeedbackComponent,
    ProfileComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    HttpClientModule,
    NgxUsefulSwiperModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatDividerModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    RouterModule.forChild([
      { path: "", redirectTo: "list-member", pathMatch: "full" },
      { path: "list-member", component: ListMemberComponent },
      { path: "executive-member", component: ExecutiveMemberComponent },
      { path: "create-member", component: CreateMemberComponent },
      {
        path: "transaction-member/:memberId",
        component: MemberTransactionComponent,
      },
      { path: "update-member/:memberId", component: UpdateMemberComponent },
      { path: "profile-member/:memberId", component: ProfileMemberComponent },
      { path: "profile/:memberId", component: ProfileComponent },
      { path: "articles", component: MembersArticlesComponent },
      { path: "list-contact", component: ListContactComponent },
      { path: "research-member", component: ResearchMemberComponent },
    ]),
  ],
  exports: [],
  entryComponents: [
    ModalAdminComponent,
    UpdatePasswordComponent,
    AddExecutiveMemberComponent,
    AnswerFeedbackComponent,
  ],
  providers: [ApiService, MembreService, WalletService, FeedbackService],
})
export class AdminModule {}
