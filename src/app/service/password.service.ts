import { ApiService } from 'src/app/service/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  constructor(
    private api: ApiService
  ) { }

  // Get the code to reset password
  getCode(data: any) {
    return this.api.post(`member/send/code/toChangePassword`, data);
  }

  // Confirm the code send by the user
  confirmCode(data: any) {
    return this.api.post(`member/confirm/code`, data);
  }

  // Change the user password
  changePassword(data: any) {
    return this.api.post(`member/change/password/new`, data);
  }

  // Change the forgot passwor
  changeForgotPassword(data: any) {
    return this.api.post(`member/forgot/password/new`, data);
  }


}
