import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { StoreService } from '../store.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.sass']
})
export class SettingsFormComponent implements OnInit {
  form: FormGroup;
  currencies = [];
  exchangers = [];

  ngOnInit(): void {
    this._store.getCurrencies();
    this._store.currencies.subscribe(res => {
      this.currencies = [{changerTitle: '', changerId: null}, ...res];
    }, err => {
      console.log(err);
    });
    this._store.getExchangers();
    this._store.exchangers.subscribe(res => {
      this.exchangers = [{currencyTitle: '', currencyId: null}, ...res];
    }, err => {
      console.log(err);
    });
  }

  // tslint:disable-next-line:variable-name
  constructor(private formBuilder: FormBuilder, private _store: StoreService, private http: HttpClient) {
    this.form = this.formBuilder.group({
      inCurr: [''],
      outCurr: [''],
      exchanger: [''],
      days: [''],
      hours: [''],
      mins: ['']
    });

  }

  submit() {
    const { value } = this.form;
    if (!value.exchanger && !value.inCurr && !value.outCurr) {
      this._store.showNotification.next({severity: 'error', summary: 'Warning message', detail: `Відбулась помилка.`});
    } else {
      const params = {
        inCurrencyId: value.inCurr || null,
        outCurrencyId: value.outCurr || null,
        changerId: value.exchanger || null,
        hidePeriod: (value.days || 0) * 86400000 + (value.hours || 0) * 3600000 + (value.mins || 0) * 60000
      }
      this.http.post('http://localhost:9000/temp-hide', params).toPromise().then((response: any) => {
        if (response.message === 'success') {
          this._store.showNotification.next({severity: 'success', summary: 'Success', detail: 'Налаштування збережені'});
          this.form.reset();
        } else {
          this._store.showNotification.next({severity: 'error', summary: 'Warning message', detail: `Відбулась помилка. ${response.message}`});
        }
      });
    }
  }
}
