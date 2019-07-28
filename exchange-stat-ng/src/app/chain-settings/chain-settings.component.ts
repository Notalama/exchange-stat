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
  chain: any;
  constructor(private _store: StoreService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      allExchangers: [false],
      allCurrencies: [false],
      firstCurrency: [false],
      secondCurrency: [false],
      thirdCurrency: [false],
      firstExchanger: [false],
      secondExchanger: [false],
      thirdExchanger: [false],
      firstPair: [false],
      secondPair: [false],
      thirdPair: [false],
      days: [''],
      hours: [''],
      mins: ['']
    });
    this.chainSubsctiption = this._store.chainForSettings.subscribe(chain => {
      console.log(chain);
    }, err => {
      console.log(err);
    });
    this.chain = this._store.chainFS;
    console.log(this.chain)
  }
  
  submit() {
    console.log(this.form.value);
  }

  ngOnDestroy(): void {
    this.chainSubsctiption.unsubscribe();
  }
}
