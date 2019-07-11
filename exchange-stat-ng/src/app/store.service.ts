import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { UrlParams } from './main/models/url-params';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private _urlParams = {
    minBalance: 0,
    minProfit: -1,
    showExmo: false,
    ltThreeLinks: false,
    chainSubscriptions: '',
    exmoOrdersCount: 0
  };
  chains: Subject<any[]>;
  exchangers: Subject<any[]>;
  currencies: Subject<any[]>;
  urlParamsSubject: Subject<any>;
  // url = `http://localhost:9000/best-change?minBalance=0&minProfit=-1&showExmo=false&ltThreeLinks=false&chainSubscriptions=${this._urlParams.chainSubscriptions}`;
  url = 'assets/rates_1.json';
  currURL = 'http://localhost:9000/currencies';
  exchURL = 'http://localhost:9000/exchangers';
  constructor(private http: HttpClient) {
    this.chains = new Subject();
    this.currencies = new Subject();
    this.exchangers = new Subject();
    this.urlParamsSubject = new Subject();
    this.urlParamsSubject.subscribe(({ key, value }) => {
      if (!key) return;
      this._urlParams[key] = value;
    });
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

  getCurrencies() {

    return this.http.get(this.currURL).toPromise().then((res: any[]) => {
      console.log(res);
      setTimeout(() => {
        this.currencies.next(res);
      }, 1000);
      setTimeout(() => {
        this.getCurrencies();
      }, 1000000);
    }, err => {
      console.log(err);
      this.getCurrencies();
    }).catch(reason => {
      console.log(reason);
    }).finally(() => {
      console.log('final');
    });
  }

  getExchangers() {

    return this.http.get(this.exchURL).toPromise().then((res: any[]) => {
      console.log(res);
      setTimeout(() => {
        this.exchangers.next(res);
      }, 1000);
      setTimeout(() => {
        this.getExchangers();
      }, 1000000);
    }, err => {
      console.log(err);
      this.getExchangers();
    }).catch(reason => {
      console.log(reason);
    }).finally(() => {
      console.log('final');
    });
  }
}
