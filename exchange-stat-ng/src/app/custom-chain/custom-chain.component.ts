import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreService } from '../store.service';
import { ChainService } from '../main/chain.service';

@Component({
  selector: 'app-custom-chain',
  templateUrl: './custom-chain.component.html',
  styleUrls: ['./custom-chain.component.sass']
})
export class CustomChainComponent implements OnInit {
  cols: any[];
  form: FormGroup;
  currencies = [];

  // tslint:disable-next-line:variable-name
  constructor(private _chainService: ChainService, private formBuilder: FormBuilder, private _store: StoreService) {
    this.form = this.formBuilder.group({
      firstStep: ['', Validators.required],
      secondStep: ['', Validators.required],
      thirdStep: ['', Validators.required],
      minBalance: ['', Validators.required]
    });

  }

  ngOnInit() {
    this._store.getCurrencies();
    this._store.currencies.subscribe(res => {
      console.log(res);
      this.currencies = res;
    }, err => {
      console.log(err);
    });
    this.cols = [
      { field: 'gain', header: 'Max Profit' },
      { field: 'chain', header: 'Ланцюжки' },
      { field: 'score', header: '%' },
      { field: 'age', header: 'Час с' },
      { field: 'links', header: '=>' }
    ];
  }

  submit() {
    console.log('its working');
  }
}

