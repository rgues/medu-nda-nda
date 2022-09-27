import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { MessageListComponent } from './components/message-list/message-list.component';
import { CreateMessageComponent } from './components/create-message/create-message.component';
import { UpdateMessageComponent } from './components/update-message/update-message.component';
import { SendMessageFamilyComponent } from './components/send-message-family/send-message-family.component';
import { SendMessageMemberComponent } from './components/send-message-member/send-message-member.component';



@NgModule({
  declarations: [
    MessageListComponent,
    CreateMessageComponent,
    UpdateMessageComponent,
    SendMessageMemberComponent,
    SendMessageFamilyComponent
],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list-message', pathMatch: 'full' },
      { path: 'list-message', component: MessageListComponent },
      { path: 'create-message', component: CreateMessageComponent },
      { path: 'update-message', component: UpdateMessageComponent },
      { path: 'send-message-member/:messageId', component: SendMessageMemberComponent },
      { path: 'send-message-family/:messageId', component: SendMessageFamilyComponent}
    ]),
    RouterModule,
  ]
})
export class MessageModule { }
