import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url: string;
  subject = new Subject<any>();

  constructor(
    private http: HttpClient
  ) {
    this.url = 'https://medu-ndanda.org/amac';
  }

   // Send and get article category
   sendMessageContainer(data: boolean) {
    this.subject.next({canUpdate : data});
  }

  getMessageContainer() {
    return this.subject.asObservable();
  }

  // HTTP Ends points
  get(endpoint: string): Observable<any> {
    return this.http.get(this.url + '/' + endpoint);
  }

  post(endpoint: string, body: any): Observable<any> {
    return this.http.post(this.url + '/' + endpoint, JSON.stringify(body));
  }

  put(endpoint: string, body: any): Observable<any> {
    return this.http.put(this.url + '/' + endpoint, JSON.stringify(body));
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(this.url + '/' + endpoint);
  }

  patch(endpoint: string, body?: any): Observable<any> {
    return this.http.patch(this.url + '/' + endpoint, JSON.stringify(body));
  }

  // Pdf reader
  imageReader(event: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      if (event.target.files && event.target.files.length > 0) {

        const file = event.target.files[0];
        reader.readAsDataURL(file);

        reader.onload = () => {

          const imageData: any = reader.result;
          const filenameParam = file.name;
          const filemimeParam = file.type;
          const dataParam = imageData.split(',')[1];

          const imageFormat = {
            filename: filenameParam,
            filemime: filemimeParam,
            data: dataParam
          };

          resolve(imageFormat);

        };
      } else {
        reject(null);
      }
    });
  }

  // Format an array to matrix and can be used for pagination
  formatArrayToMatrix(arraydata: any[], nbElements: number) {
    const nbres = arraydata.length;
    const nbIter = Math.ceil(nbres / nbElements);
    const matrix = [];
    let subMatrix = [];
    let index = 0;
    let j = 0;

    while (index < nbIter) {

      subMatrix = [], j = 0;

      while (j < nbElements) {

        if (index * nbElements + j < nbres) {
          subMatrix.push(arraydata[index * nbElements + j]);
        }
        j++;
      }

      if (subMatrix.length > 0) {
        matrix.push(subMatrix);
      }

      index++;
    }
    return matrix;
  }

  formatDateSplash(date: any) {
    const dateFormat = new Date(date);
    const month = (dateFormat.getMonth() + 1 < 9) ? '0' + (dateFormat.getMonth() + 1) : (dateFormat.getMonth() + 1);
    const day = dateFormat.getDate() < 9 ? '0' + dateFormat.getDate() : dateFormat.getDate();
    const formatDate = day + '/' + month + '/' +  dateFormat.getFullYear();
    return formatDate;
  }

  formatDateTiret(date: any) {
    const dateFormat = new Date(date);
    const month = (dateFormat.getMonth() + 1 < 9) ? '0' + (dateFormat.getMonth() + 1) : (dateFormat.getMonth() + 1);
    const day = dateFormat.getDate() < 9 ? '0' + dateFormat.getDate() : dateFormat.getDate();
    const formatDate = dateFormat.getFullYear() + '-' + month + '-' + day;
    return formatDate;
  }

   // Order by size
   oderBySize(memberList: any[]) {
    if (memberList && memberList.length > 0) {
      let i = 0;
      let pivot = 0 ;
      let temp: any;
      while (i < memberList.length) {
          pivot = i;
          for (let j = i + 1; j < memberList.length; j++) {
                if (memberList[i] && memberList[i].membres.length < memberList[j].membres.length) {
                   pivot = j;
                   temp = memberList[pivot];
                   memberList[pivot] = memberList[i];
                   memberList[i] = temp;
                }
          }
          i++;
      }

    } else {
      return [];
    }
    return memberList;
}

oderByAlpha(memberList: any[]) {
  if (memberList && memberList.length > 0) {
    let i = 0;
    let temp: any;
    while (i < memberList.length) {
        for (let j = i + 1; j < memberList.length; j++) {
              if (memberList[i] && memberList[i].name >  memberList[j].name) {
                 temp = memberList[j];
                 memberList[j] = memberList[i];
                 memberList[i] = temp;
              }
        }
        i++;
    }

  } else {
    return [];
  }
  return memberList;
}

oderByFirstname(memberList: any[]) {
  if (memberList && memberList.length > 0) {
    let i = 0;
    let temp: any;
    while (i < memberList.length) {
        for (let j = i + 1; j < memberList.length; j++) {
              if (memberList[i] && memberList[i].Fname >  memberList[j].Fname) {
                 temp = memberList[j];
                 memberList[j] = memberList[i];
                 memberList[i] = temp;
              }
        }
        i++;
    }

  } else {
    return [];
  }
  return memberList;
}

oderByFamilyName(memberList: any[]) {
  if (memberList && memberList.length > 0) {
    let i = 0;
    let temp: any;
    while (i < memberList.length) {
        for (let j = i + 1; j < memberList.length; j++) {
              if (memberList[i] && memberList[i].family_name >  memberList[j].family_name) {
                 temp = memberList[j];
                 memberList[j] = memberList[i];
                 memberList[i] = temp;
              }
        }
        i++;
    }

  } else {
    return [];
  }
  return memberList;
}


oderByEventsDate(eventsList: any[]) {
  if (eventsList && eventsList.length > 0) {
    let i = 0;
    let temp: any;
    while (i < eventsList.length) {
        for (let j = i + 1; j < eventsList.length; j++) {
              if (eventsList[i].event_date < eventsList[j].event_date) {
                 temp = eventsList[j];
                 eventsList[j] = eventsList[i];
                 eventsList[i] = temp;
              }
        }
        i++;
    }

  } else {
    return [];
  }
  return eventsList;
}

oderByContactDate(data: any[]) {
  if (data && data.length > 0) {
    let i = 0;
    let temp: any;
    while (i < data.length) {
        for (let j = i + 1; j < data.length; j++) {
              if (data[i].contact_date < data[j].contact_date) {
                 temp = data[j];
                 data[j] = data[i];
                 data[i] = temp;
              }
        }
        i++;
    }

  } else {
    return [];
  }
  return data;
}

oderByTransactionDate(transactions: any[]) {
  if (transactions && transactions.length > 0) {
    let i = 0;
    let temp: any;
    while (i < transactions.length) {
        for (let j = i + 1; j < transactions.length; j++) {
              let fisrtDate = transactions[i] ?  new Date (transactions[i].transaction_date) : null;
              let secondDate = transactions[j] ?  new Date (transactions[j].transaction_date) : null;
              if (fisrtDate && secondDate && fisrtDate  < secondDate) {
                 temp = transactions[j];
                 transactions[j] = transactions[i];
                 transactions[i] = temp;
              }
        }
        i++;
    }

  } else {
    return [];
  }
  return transactions;
}

oderByDateCreated(data: any[]) {
  if (data && data.length > 0) {
    let i = 0;
    let temp: any;
    while (i < data.length) {
        for (let j = i + 1; j < data.length; j++) {
              let fisrtDate = data[i] ?  new Date (data[i].created_at) : null;
              let secondDate = data[j] ?  new Date (data[j].created_at) : null;
              if (fisrtDate && secondDate && fisrtDate  < secondDate) {
                 temp = data[j];
                 data[j] = data[i];
                 data[i] = temp;
              }
        }
        i++;
    }

  } else {
    return [];
  }
  return data;
}

  // Get time prefix
  getTimePrefix() {
    const dateFormat = new Date();
    const month = (dateFormat.getMonth() + 1) < 10 ? '0' + (dateFormat.getMonth() + 1) : (dateFormat.getMonth() + 1);
    const day = dateFormat.getDate() < 10 ? '0' + dateFormat.getDate() : dateFormat.getDate();
    const hour = dateFormat.getHours() < 10 ? '0' + dateFormat.getHours() : dateFormat.getHours();
    const minute = dateFormat.getMinutes() < 10 ? '0' + dateFormat.getMinutes() : dateFormat.getMinutes();
    const second = dateFormat.getSeconds() < 10 ? '0' + dateFormat.getSeconds() : dateFormat.getSeconds();
    return dateFormat.getFullYear() + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second;
  }


}
