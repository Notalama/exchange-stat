import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StoreService } from '../store.service';
import { UrlParams } from '../main/models/url-params';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  form: FormGroup;
  search: string;

  constructor(private formBuilder: FormBuilder, private _store: StoreService) {
    this.form = this.formBuilder.group({
      exmoOrdersCount: [3],
      minProfit: [0.4],
      minBalance: [10],
      showExmo: [false],
      ltThreeLinks: [false],
      showKuna: [false],
      chainSubscriptions: ['']
    });
   }

  ngOnInit() {
    this.form.valueChanges.subscribe((value: UrlParams) => {
      this._store._urlParams = value;
    }, err => {
      console.log(err);
    });
  }

}
