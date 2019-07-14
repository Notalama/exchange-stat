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
  constructor(private _store: StoreService, private formBuilder: FormBuilder, private _SettingsService: SettingsService) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      blockValue: [null, Validators.required],
      days: [0, Validators.required],
      hours: [0, Validators.required],
      mins: [0, Validators.required]
    });
    this._store._chainSettingsSubject.subscribe((chain: Rate[]) => {
      console.log(chain);
    });
  }

  submit() {
    console.log(this.form.value);
    this._SettingsService.subminSettings(this.form.value).toPromise().then(response => {
      // eslint-disable-next-line
      console.log(response)
      // if (response.status === 200) {
      //   this.resetForm()
      //   // this.$emit('hideform', false)
      // }
    });
  }
}
