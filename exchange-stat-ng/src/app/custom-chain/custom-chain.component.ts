import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreService } from '../store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-chain',
  templateUrl: './custom-chain.component.html',
  styleUrls: ['./custom-chain.component.sass']
})
export class CustomChainComponent implements OnInit {
  cols: any[];
  form: FormGroup;
  currencies = [];
  subscription: Subscription;
  // tslint:disable-next-line:variable-name
  constructor(private formBuilder: FormBuilder, private _store: StoreService) {
    this.form = this.formBuilder.group({
      firstStep: ['', Validators.required],
      secondStep: [''],
      thirdStep: [''],
      minBalance: ['', Validators.required]
    });
  }

  ngOnInit() {
    this._store.getCurrencies();
    this.subscription = this._store.currencies.subscribe(res => {
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
    const { firstStep, secondStep, thirdStep, minBalance } = this.form.value;
    const chain = [firstStep, secondStep, thirdStep];
    if (!chain[2]) chain.pop();
    const query = {
      chain,
      amount: minBalance,
      isGoldMiddle: !secondStep
    };
    console.log(query);
    this._store.getCustomChain(query);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

