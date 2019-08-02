import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-chain-settings',
  templateUrl: './chain-settings.component.html',
  styleUrls: ['./chain-settings.component.sass']
})
export class ChainSettingsComponent implements OnInit, OnDestroy {
  form: FormGroup;
  
  chainSubsctiption: Subscription;
  private chain: any;
  constructor(private _store: StoreService, private formBuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      allExchangers: [false],
      allCurrencies: [false],
      firstCurrencyIn: [false],
      firstCurrencyOut: [false],
      secondCurrencyIn: [false],
      secondCurrencyOut: [false],
      thirdCurrencyIn: [false],
      thirdCurrencyOut: [false],
      firstExchanger: [false],
      secondExchanger: [false],
      thirdExchanger: [false],
      firstPair: [false],
      secondPair: [false],
      thirdPair: [false],
      firstRate: [false],
      secondRate: [false],
      thirdRate: [false],
      days: [null],
      hours: [null],
      mins: [null]
    });
    this.chainSubsctiption = this._store.chainForSettings.subscribe(chain => {
      console.log(chain);
      if (chain) this.chain = chain;
    }, err => {
      console.log(err);
    });
    this.chain = this._store.chainFS;
    console.log(this.chain)
  }
  
  submit() {
    const { value } = this.form;

    if (value.allExchangers) this.hideAllExchangers();
    if (value.allCurrencies) this.hideAllCurrencies();
    if (value.firstCurrencyIn) this.hideSingleItem('inCurrencyId', this.chain[0].from);
    if (value.firstCurrencyOut) this.hideSingleItem('outCurrencyId', this.chain[0].to);
    if (value.secondCurrencyIn) this.hideSingleItem('inCurrencyId', this.chain[1].from);
    if (value.secondCurrencyOut) this.hideSingleItem('outCurrencyId', this.chain[1].to);
    if (value.thirdCurrencyIn) this.hideSingleItem('inCurrencyId', this.chain[2].from);
    if (value.thirdCurrencyOut) this.hideSingleItem('outCurrencyId', this.chain[2].to);
    if (value.firstExchanger) this.hideSingleItem('changerId', this.chain[0].changer);
    if (value.secondExchanger) this.hideSingleItem('changerId', this.chain[1].changer);
    if (value.thirdExchanger) this.hideSingleItem('changerId', this.chain[2].changer);
    if (value.firstPair) this.hideRate({inCurrencyId: this.chain[0].from, outCurrencyId: this.chain[0].to});
    if (value.secondPair) this.hideRate({inCurrencyId: this.chain[1].from, outCurrencyId: this.chain[1].to});
    if (value.thirdPair) this.hideRate({inCurrencyId: this.chain[2].from, outCurrencyId: this.chain[2].to});
    if (value.firstRate) this.hideRate({inCurrencyId: this.chain[0].from, outCurrencyId: this.chain[0].to, changerId: this.chain[0].changer});
    if (value.secondRate) this.hideRate({inCurrencyId: this.chain[1].from, outCurrencyId: this.chain[1].to, changerId: this.chain[1].changer});
    if (value.thirdRate) this.hideRate({inCurrencyId: this.chain[2].from, outCurrencyId: this.chain[2].to, changerId: this.chain[2].changer});
    this.form.reset();
  }

  private hideAllExchangers() {
    const { chainData } = this.chain.chain;
    chainData.forEach(rate => {
      const params = {
        changerId: rate.changer,
        hidePeriod: (this.form.value.days || 0) * 86400000 + (this.form.value.hours || 0) * 3600000 + (this.form.value.mins || 0) * 60000
      };
      this.http.post('http://localhost:9000/temp-hide', params).toPromise().then(res => {
        console.log(res);
      }, err => console.log(err));
    });
  }

  private hideAllCurrencies() {
    const { chainData } = this.chain.chain;
    chainData.forEach(rate => {
      const params = {
        inCurrencyId: rate.from,
        outCurrencyId: rate.from,
        hidePeriod: (this.form.value.days || 0) * 86400000 + (this.form.value.hours || 0) * 3600000 + (this.form.value.mins || 0) * 60000
      };
      this.http.post('http://localhost:9000/temp-hide', params).toPromise().then(res => {
        console.log(res);
      }, err => console.log(err));
    });
  }

  private hideSingleItem(prop: string,  value: string) {
    if (!prop || !value) return;
    const params = { hidePeriod: (this.form.value.days || 0) * 86400000 + (this.form.value.hours || 0) * 3600000 + (this.form.value.mins || 0) * 60000 }
    params[prop] = value;
    this.http.post('http://localhost:9000/temp-hide', params).toPromise().then(res => {
      console.log(res);
    }, err => console.log(err));
  }

  private hideRate(param) {
    if (!param) return;
    this.http.post('http://localhost:9000/temp-hide', param).toPromise().then(res => {
      console.log(res);
    }, err => console.log(err));
  }

  ngOnDestroy(): void {
    this.chainSubsctiption.unsubscribe();
  }
}
