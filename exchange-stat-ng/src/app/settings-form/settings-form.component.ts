import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { StoreService } from '../store.service';

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.sass']
})
export class SettingsFormComponent implements OnInit {
  form: FormGroup;
  currencies = [];
  currTitles = [];
  exchIds = [];
  exchTitles = [];
  currIds = [];
  exchangers = [];


  ngOnInit(): void {
    this._store.getCurrencies();
    this._store.currencies.subscribe(res => {
      console.log(res);
      this.currencies = res;
      console.log(this.currencies);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.currencies.length; i++) {
        this.currTitles.push(this.currencies[i].currencyTitle);
        this.currIds.push(this.currencies[i].currencyId);
      }
      console.log(this.currTitles);
    }, err => {
      console.log(err);
    });
    this._store.getExchangers();
    this._store.exchangers.subscribe(res => {
      console.log(res);
      this.exchangers = res;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.exchangers.length; i++) {
        this.exchTitles.push(this.exchangers[i].exchangerTitle);
        this.exchIds.push(this.exchangers[i].exchangerId);
      }
      console.log(this.currTitles);
    }, err => {
      console.log(err);
    });
  }




  // tslint:disable-next-line:variable-name
  constructor(private formBuilder: FormBuilder, private _store: StoreService) {
    this.form = this.formBuilder.group({
      inCurr: ['', Validators.required],
      outCurr: ['', Validators.required],
      exchanger: ['', Validators.required],
      days: [''],
      hours: [''],
      mins: ['']
    });

  }

  submit() {
    console.log('its working');
  }
}
