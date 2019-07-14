import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreService } from '../store.service';
import { Subscription } from 'rxjs';
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
  currSubscription: Subscription;
  chainSubscription: Subscription;
  chains = [];
  // tslint:disable-next-line:variable-name
  constructor(private _chainService: ChainService, private formBuilder: FormBuilder, private _store: StoreService) {
    this.form = this.formBuilder.group({
      firstStep: ['', Validators.required],
      secondStep: [null],
      thirdStep: [''],
      minBalance: ['', Validators.required]
    });
  }

  ngOnInit() {
    this._store.getCurrencies();
    this.currSubscription = this._store.currencies.subscribe(res => {
      console.log(res);
      this.currencies = res;
    }, err => console.log(err));
    this.chainSubscription = this._store.customChain.subscribe(res => {
      const { chain, otherRates } = res;
      this.buildTable(chain, otherRates);
    });
    this.cols = [
      { field: 'gain', header: 'Max Profit' },
      { field: 'chain', header: 'Ланцюжки' },
      { field: 'score', header: '%' },
      { field: 'age', header: 'Час с' },
      { field: 'links', header: '=>' }
    ];
  }

  buildTable(data: any[], otherRates?: any[]) {

    this.chains = data.sort((a, b) => a.length - b.length).map((chainData, i) => {
      const [dollarRate, profit, isSubs] = chainData.splice(chainData.length - 3, 3);
      const generatedId = this._chainService.generateId(chainData);
      return {
        gain: this._chainService.calcChainProfit(chainData, profit),
        chain: {chainData, dollarRate, otherRates},
        score: `${profit.toFixed(2)} %`,
        age: this.chains.length ?
          this._chainService.getAgeOfChain(generatedId, this.chains) : 0,
        options: ' ',
        links: null,
        id: generatedId
      };
    });
  }

  submit() {
    const { firstStep, secondStep, thirdStep, minBalance } = this.form.value;
    const chain = [firstStep, secondStep, thirdStep];
    if (!chain[2]) chain.pop();
    const query = {
      chain: ["120", "121", "142"],
      amount: minBalance || '',
      isGoldMiddle: !secondStep
    };
    console.log(query);
    this._store.getCustomChain(query);
  }

  ngOnDestroy(): void {
    this.currSubscription.unsubscribe();
    this.chainSubscription.unsubscribe();
  }
}

