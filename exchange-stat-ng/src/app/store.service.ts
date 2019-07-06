import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  chains: Subject<any[]>;
  // url = `http://localhost:9000/best-change?minBalance=0&minProfit=-1&showExmo=false&ltThreeLinks=false`;
  url = 'assets/rates_1.json';
  constructor(private http: HttpClient) {
    this.chains = new Subject();
  }

  getChains() {

    return this.http.get(this.url).toPromise().then((res: any[]) => {
      console.log(res);
      setTimeout(() => {
        this.chains.next(res);
      }, 1000);
      
      setTimeout(() => {
        this.getChains();
      }, 1000000);
    }, err => {
      console.log(err);
      this.getChains();
    }).catch(reason => {
      console.log(reason);
    }).finally(() => {
      console.log('fina;');
    });

  }

}
