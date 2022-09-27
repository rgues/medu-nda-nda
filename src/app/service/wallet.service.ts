import { ApiService } from 'src/app/service/api.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private subjet = new Subject<any>();

  constructor(
    private api: ApiService
  ) { }

  // update list message 
  sendUpdateMessage(mes: string) {
    this.subjet.next({ message: mes });
  }

  getUpdateMessage(): Observable<any> {
    return this.subjet.asObservable();
  }

  // send transaction data
  sendTransactionData(data: any) {
    this.subjet.next({ transaction: data });
  }

    // Set the member session
    setMemberData(data: any) {
      localStorage.setItem('memberRpn', JSON.stringify(data));
    }
  
    // Get the member session
    getMemberData() {
      return JSON.parse(localStorage.getItem('memberRpn'));
    }

  // Get transaction data
  getTransactionData() {
    return this.subjet.asObservable();
  }

  // Credit member wallet
  creditMember(token: string, member: any) {
    return this.api.post(`member/wallet/save/${token}`, member);
  }

  // Get all members wallet transaction
  getAllMembersWalletTransaction(token: string) {
    return this.api.get(`member/wallet/transactions/${token}`);
  }

  // Delete a member wallet transaction
  deleteMemberWalletTransaction(token: string, transaction: any) {
    return this.api.post(`member/delete/wallet/transactions/${token}`, transaction);
  }

  // Get a member wallet transaction
  getMemberWalletTransaction(token: string, memberId: number) {
    return this.api.get(`member/wallet/transactions/ofAMember/${memberId}/${token}`);
  }

  // Make payment for an event
  paidMembersEvent(token: string, member: any) {
    return this.api.post(`member/payment/event/${token}`, member);
  }

  // Get the member wallet transaction for an event
  memberWalletEventTransaction(token: string, eventId: number) {
    return this.api.get(`member/wallet/transactions/OfAnEvent/${eventId}/${token}`);
  }

  // Edit the payment amount
  editPaymentMemberEvent(token: string, transaction: any) {
    return this.api.post(`member/edit/payment/event/${token}`, transaction);
  }

  // Get member wallet solde
  getMemberWalletSolde(token: string) {
    return this.api.get(`member/get/statistique/wallet/${token}`);
  }

  // Debit member wallet
  debitMemberWallet(token: string, data: any) {
    return this.api.post(`member/wallet/debit/${token}`,data);
  }

}
