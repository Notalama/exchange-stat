import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription, from } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '../store.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-chain-settings',
  templateUrl: './chain-settings.component.html',
  styleUrls: ['./chain-settings.component.sass']
})
export class ChainSettingsComponent implements OnInit, OnDestroy {
  form: FormGroup;
  msgs = [];
  chainSubsctiption: Subscription;
  private chain: any;
  constructor(private _store: StoreService, private formBuilder: FormBuilder, private http: HttpClient, private _location: Location) { }

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
      ratesIn: this.formBuilder.array([this.formBuilder.control(false),this.formBuilder.control(false),this.formBuilder.control(false),this.formBuilder.control(false)]),
      ratesOut:this.formBuilder.array([this.formBuilder.control(false),this.formBuilder.control(false),this.formBuilder.control(false),this.formBuilder.control(false)]),
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
    if (!this.chain) this._location.back();
  }

  submit() {
    const { value } = this.form;
    const chain = this.chain.chain.chainData;
    if (value.allExchangers) this.hideAllExchangers();
    if (value.allCurrencies) this.hideAllCurrencies();
    if (value.firstCurrencyIn) this.hideSingleItem('inCurrencyId', chain[0].from);
    if (value.firstCurrencyOut) this.hideSingleItem('outCurrencyId', chain[0].to);
    if (value.secondCurrencyIn) this.hideSingleItem('inCurrencyId', chain[1].from);
    if (value.secondCurrencyOut) this.hideSingleItem('outCurrencyId', chain[1].to);
    if (value.thirdCurrencyIn) this.hideSingleItem('inCurrencyId', chain[2].from);
    if (value.thirdCurrencyOut) this.hideSingleItem('outCurrencyId', chain[2].to);
    if (value.firstExchanger) this.hideSingleItem('changerId', chain[0].changer);
    if (value.secondExchanger) this.hideSingleItem('changerId', chain[1].changer);
    if (value.thirdExchanger) this.hideSingleItem('changerId', chain[2].changer);
    if (value.firstPair) this.hideRate({ inCurrencyId: chain[0].from, outCurrencyId: chain[0].to });
    if (value.secondPair) this.hideRate({ inCurrencyId: chain[1].from, outCurrencyId: chain[1].to });
    if (value.thirdPair) this.hideRate({ inCurrencyId: chain[2].from, outCurrencyId: chain[2].to });
    value.ratesIn.forEach((el, i) => {
      if (el) this.hideRate({ inCurrencyId: chain[i].from, changerId: chain[i].changer });
    });
    value.ratesOut.forEach((el, i) => {
      if (el) this.hideRate({ outCurrencyId: chain[i].from, changerId: chain[i].changer });
    });
    this.form.reset();
  }

  private hideAllExchangers() {
    const { chainData } = this.chain.chain;
    chainData.forEach(rate => {
      const params = {
        changerId: rate.changer,
        hidePeriod: (this.form.value.days || 0) * 86400000 + (this.form.value.hours || 0) * 3600000 + (this.form.value.mins || 0) * 60000
      };
      this.http.post('http://localhost:9000/temp-hide', params).toPromise().then((res: any) => {
        if (res.message === 'success') {
          this.show({severity: 'success', summary: 'Success message', detail: 'Налаштування збережені'});
        } else {
          this.show({severity: 'error', summary: 'Warning message', detail: `Відбулась помилка. ${res.message}`});
        }
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
      this.http.post('http://localhost:9000/temp-hide', params).toPromise().then((res: any) => {
        if (res.message === 'success') {
          this.show({severity: 'success', summary: 'Success message', detail: 'Налаштування збережені'});
        } else {
          this.show({severity: 'error', summary: 'Warning message', detail: `Відбулась помилка. ${res.message}`});
        }
        console.log(res);
      }, err => console.log(err));
    });
  }

  private hideSingleItem(prop: string, value: string) {
    if (!prop || !value) return;
    const params = { hidePeriod: (this.form.value.days || 0) * 86400000 + (this.form.value.hours || 0) * 3600000 + (this.form.value.mins || 0) * 60000 }
    params[prop] = value;
    this.http.post('http://localhost:9000/temp-hide', params).toPromise().then((res: any) => {
      if (res.message === 'success') {
        this.show({severity: 'success', summary: 'Success message', detail: 'Налаштування збережені'});
      } else {
        this.show({severity: 'error', summary: 'Warning message', detail: `Відбулась помилка. ${res.message}`});
      }
      console.log(res);
    }, err => console.log(err));
  }

  private hideRate(param) {
    if (!param) return;
    this.http.post('http://localhost:9000/temp-hide', param).toPromise().then((res: any) => {
      if (res.message === 'success') {
        this.show({severity: 'success', summary: 'Успіх', detail: 'Налаштування збережені'});
      } else {
        this.show({severity: 'error', summary: 'Warning message', detail: `Відбулась помилка. ${res.message}`});
      }
      console.log(res);
    }, err => console.log(err));
  }

  show({severity, summary, detail}) {
    this.msgs.push({ severity, summary, detail });
    setTimeout(() => {
      this.hide();
    }, 3000);
  }
  
  hide() {
    this.msgs = [];
  }

  ngOnDestroy(): void {
    this.chainSubsctiption.unsubscribe();
  }
}
