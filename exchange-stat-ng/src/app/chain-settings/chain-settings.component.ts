import { HttpClient } from '@angular/common/http';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { StoreService } from './../store.service';
import { Component, OnInit } from '@angular/core';
import { Rate } from '../main/models/rate';
import { SettingsService } from '../helpers/settings.service';

@Component({
  selector: 'app-chain-settings',
  templateUrl: './chain-settings.component.html',
  styleUrls: ['./chain-settings.component.sass']
})
export class ChainSettingsComponent implements OnInit {

  blockValue: string;
  form: FormGroup;
  chain: Rate[];
  constructor(private _store: StoreService, private formBuilder: FormBuilder, private _SettingsService: SettingsService) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      hideCurr: [''],
      hideChanger: [''],
      hideAllCurrFrom: [''],
      hideAllCurrTo: [''],
      hideAllChangers: [''],
      hideRate: [null],
      hideAllRates: [null],
      days: [0],
      hours: [0],
      mins: [0]
    });
    this._store._chainSettingsSubject.subscribe((chain: Rate[]) => {
      this.chain = chain;
      console.log(chain);
    });
  }

  submit() {
    this._SettingsService.submitSettings(this.form.value).toPromise().then(response => {
      // eslint-disable-next-line
      console.log(response)
    }, err => {
      // eslint-disable-next-line
      console.log(err);
    })
  }
}
