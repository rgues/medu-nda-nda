import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RpnService {
  subject = new Subject<any>();
  constructor(
    private api: ApiService
  ) { }

  // update list message 
  sendUpdateMessage(mes: string) {
    this.subject.next({ message: mes });
  }

  getUpdateMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  // Set the member session
  setMemberRpn(data: any) {
    localStorage.setItem('memberRpn', JSON.stringify(data));
  }

  // Get the member session
  getMemberRpn() {
    return JSON.parse(localStorage.getItem('memberRpn'));
  }

  // Remove the member session
  removeMemberRpn() {
    localStorage.removeItem('membermemberRpnSession');
  }

  // Get the familly list
  getRPNMembers(token: string) {
    return this.api.get(`rpn/get/all/members/${token}`);
  }

  // Save a familly
  addRPNMember(token: string, data: any) {
    return this.api.post(`rpn/save/${token}`, data);
  }

  // Update a familly
  updateRPNMember(token: string, data: any) {
    return this.api.post(`rpn/update/${token}`, data);
  }

  // get RPN familly members
  getRPNFamilyMembers(token: string, familyId: number) {
    return this.api.get(`rpn/get/all/members/ofAFamily/${familyId}/${token}`);
  }

  // delete a familly
  deleteRPNMember(token: string, data: any) {
    return this.api.post(`rpn/delete/${token}`, data);
  }

  // Credit the RPN family account
  creditRPNfamilyAccount(token: string, data: any) {
    return this.api.post(`rpn/wallet/save/${token}`, data);
  }

  // Get all RPN system Transaction
  getRPNtransactions(token: string) {
    return this.api.get(`rpn/wallet/transactions/${token}`);
  }

  // Get all RPN system Transaction for a family
  getRPNfamilyTransactions(token: string, familyId: number) {
    return this.api.get(`rpn/wallet/transactions/ofAFamily/${familyId}/${token}`);
  }

  // pay for RPN event
  payForRPNevent(token: string, data: any) {
    return this.api.post(`rpn/payment/event/${token}`, data);
  }

  // get Family wallet solde
  getFamilyWalletSolde(token: string) {
    return this.api.get(`rpn/get/statistique/famille/${token}`);
  }

  // delete transaction
  deleteTransaction(token: string, data: any) {
    return this.api.post(`rpn/delete/wallet/transactions/${token}`, data);
  }

  // Debit member wallet
  debitMemberWallet(token: string, data: any) {
    return this.api.post(`rpn/wallet/debit/${token}`, data);
  }

}
