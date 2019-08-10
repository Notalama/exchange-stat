import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { UrlParams } from './main/models/url-params';
import { CustomChainConfig } from './main/models/customChainConfig';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private urlParams: UrlParams = {
    minBalance: 0,
    minProfit: 1,
    showExmo: false,
    ltThreeLinks: false,
    chainSubscriptions: '',
    exmoOrdersCount: 0
  };

  chains: Subject<any[]>;
  exchangers: Subject<any[]>;
  currencies: Subject<any[]>;
  customChain: Subject<{ chain: any[], otherRates: any[] }>;
  chainForSettings: Subject<any>;
  chainFS: any;
  private chainsUrl = 'http://localhost:9000/best-change?minBalance=' +
    this.urlParams.minBalance + '&minProfit=' +
    this.urlParams.minProfit + '&showExmo=' +
    this.urlParams.minProfit + '&ltThreeLinks=' +
    this.urlParams.ltThreeLinks + '&exmoOrdersCount=' +
    this.urlParams.exmoOrdersCount + '&chainSubscriptions=' +
    this.urlParams.chainSubscriptions;
  // url = 'assets/rates_1.json';
  private currURL = 'http://localhost:9000/currencies';
  private exchURL = 'http://localhost:9000/exchangers';
  private customChainURL = 'http://localhost:9000/custom-chain';

  constructor(private http: HttpClient) {
    this.chainForSettings = new Subject();
    this.chains = new Subject();
    this.currencies = new Subject();
    this.exchangers = new Subject();
    this.customChain = new Subject();
    this.chainForSettings.subscribe(val => this.chainFS = val);
  }

  getChains() {
    return this.http.get(this.chainsUrl).toPromise().then((res: any[]) => {
      this.chains.next(res);
    }, err => {
      console.log(err);
    });
  }

  getCurrencies() {
    return this.http.get(this.currURL).toPromise().then((res: any[]) => {
      this.currencies.next(res);
      setTimeout(() => {
        this.getCurrencies();
      }, 1000000);
    }, err => {
      console.log(err);
    });
  }

  getExchangers() {
    return this.http.get(this.exchURL).toPromise().then((res: any[]) => {
      this.exchangers.next(res);
      setTimeout(() => {
        this.getExchangers();
      }, 1000000);
    }, err => {
      console.log(err);
    });
  }

  getCustomChain(config: CustomChainConfig) {
    return this.http.post(this.customChainURL, config).toPromise().then((res: { chain: any[], otherRates: any[] }) => {
      this.customChain.next(res);
    });
  }

  set _urlParams (value: UrlParams) {
    Object.keys(value).forEach(key => {
      this.urlParams[key] = value[key];
    });
    this.chainsUrl = 'http://localhost:9000/best-change?minBalance=' +
    this.urlParams.minBalance + '&minProfit=' +
    this.urlParams.minProfit + '&showExmo=' +
    this.urlParams.minProfit + '&ltThreeLinks=' +
    this.urlParams.ltThreeLinks + '&exmoOrdersCount=' +
    this.urlParams.exmoOrdersCount + '&chainSubscriptions=' +
    this.urlParams.chainSubscriptions;
  }
}
